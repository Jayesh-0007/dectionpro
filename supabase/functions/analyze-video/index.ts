import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FrameAnalysis {
  frameIndex: number;
  isArtificial: boolean;
  confidence: number;
  issues: string[];
}

interface AnalysisResult {
  confidence: number;
  verdict: "real" | "ai-generated";
  details: {
    faceConsistency: number;
    temporalCoherence: number;
    artifactScore: number;
    compressionAnalysis: number;
  };
  framesAnalyzed: number;
  processingTime: number;
  frameAnalyses: FrameAnalysis[];
}

const DEEPFAKE_DETECTION_PROMPT = `You are an expert AI forensics analyst specializing in detecting AI-generated and manipulated videos (deepfakes).

Analyze this video frame for signs of AI generation or manipulation. Look for:

1. **Face Artifacts**: Unnatural skin texture, blurring around face edges, asymmetric features, uncanny valley effects
2. **Lighting Inconsistencies**: Shadows that don't match light sources, uneven illumination across the face
3. **Temporal Artifacts**: Blending seams, warping around hair/ears/neck boundaries
4. **Detail Anomalies**: Missing or duplicated details, unnatural eye reflections, teeth irregularities
5. **Compression Artifacts**: Unusual patterns that suggest manipulation followed by re-encoding
6. **Background Coherence**: Mismatched backgrounds, floating elements, perspective errors

Respond with a JSON object (no markdown, just raw JSON):
{
  "isArtificial": boolean,
  "confidence": number (0-1, how confident you are in your assessment),
  "faceScore": number (0-1, face naturalness, 1 = natural),
  "lightingScore": number (0-1, lighting consistency, 1 = consistent),
  "artifactScore": number (0-1, absence of artifacts, 1 = no artifacts),
  "qualityScore": number (0-1, overall quality/naturalness, 1 = high quality real),
  "issues": string[] (list of specific issues found, empty if none)
}`;

async function analyzeFrame(
  frameBase64: string,
  frameIndex: number,
  apiKey: string
): Promise<FrameAnalysis & { faceScore: number; lightingScore: number; artifactScore: number; qualityScore: number }> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: DEEPFAKE_DETECTION_PROMPT },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze frame ${frameIndex + 1} for deepfake indicators:`,
            },
            {
              type: "image_url",
              image_url: {
                url: frameBase64,
              },
            },
          ],
        },
      ],
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`AI gateway error for frame ${frameIndex}:`, response.status, errorText);
    throw new Error(`AI gateway error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";
  
  // Parse the JSON response
  try {
    // Remove any markdown code blocks if present
    const jsonStr = content.replace(/```json\n?|\n?```/g, "").trim();
    const analysis = JSON.parse(jsonStr);
    
    return {
      frameIndex,
      isArtificial: analysis.isArtificial || false,
      confidence: analysis.confidence || 0.5,
      faceScore: analysis.faceScore || 0.5,
      lightingScore: analysis.lightingScore || 0.5,
      artifactScore: analysis.artifactScore || 0.5,
      qualityScore: analysis.qualityScore || 0.5,
      issues: analysis.issues || [],
    };
  } catch (parseError) {
    console.error("Failed to parse AI response:", content);
    // Return neutral scores if parsing fails
    return {
      frameIndex,
      isArtificial: false,
      confidence: 0.5,
      faceScore: 0.5,
      lightingScore: 0.5,
      artifactScore: 0.5,
      qualityScore: 0.5,
      issues: ["Unable to analyze frame"],
    };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const { frames } = await req.json();

    if (!frames || !Array.isArray(frames) || frames.length === 0) {
      return new Response(
        JSON.stringify({ error: "No frames provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Analyzing ${frames.length} frames...`);

    // Analyze frames in parallel (limit concurrency to avoid rate limits)
    const BATCH_SIZE = 3;
    const allAnalyses: (FrameAnalysis & { faceScore: number; lightingScore: number; artifactScore: number; qualityScore: number })[] = [];

    for (let i = 0; i < frames.length; i += BATCH_SIZE) {
      const batch = frames.slice(i, i + BATCH_SIZE);
      const batchPromises = batch.map((frame: string, idx: number) =>
        analyzeFrame(frame, i + idx, LOVABLE_API_KEY)
      );
      const batchResults = await Promise.all(batchPromises);
      allAnalyses.push(...batchResults);
    }

    // Aggregate results
    const artificialCount = allAnalyses.filter((a) => a.isArtificial).length;
    const avgConfidence = allAnalyses.reduce((sum, a) => sum + a.confidence, 0) / allAnalyses.length;
    const avgFaceScore = allAnalyses.reduce((sum, a) => sum + a.faceScore, 0) / allAnalyses.length;
    const avgLightingScore = allAnalyses.reduce((sum, a) => sum + a.lightingScore, 0) / allAnalyses.length;
    const avgArtifactScore = allAnalyses.reduce((sum, a) => sum + a.artifactScore, 0) / allAnalyses.length;
    const avgQualityScore = allAnalyses.reduce((sum, a) => sum + a.qualityScore, 0) / allAnalyses.length;

    // Determine verdict based on majority of frames
    const isAIGenerated = artificialCount > frames.length / 2;
    
    // Calculate overall confidence
    const overallConfidence = isAIGenerated
      ? (artificialCount / frames.length) * avgConfidence
      : ((frames.length - artificialCount) / frames.length) * avgConfidence;

    const processingTime = (Date.now() - startTime) / 1000;

    const result: AnalysisResult = {
      confidence: Math.min(0.99, Math.max(0.5, overallConfidence)),
      verdict: isAIGenerated ? "ai-generated" : "real",
      details: {
        faceConsistency: avgFaceScore,
        temporalCoherence: avgLightingScore,
        artifactScore: avgArtifactScore,
        compressionAnalysis: avgQualityScore,
      },
      framesAnalyzed: frames.length,
      processingTime,
      frameAnalyses: allAnalyses.map(({ frameIndex, isArtificial, confidence, issues }) => ({
        frameIndex,
        isArtificial,
        confidence,
        issues,
      })),
    };

    console.log(`Analysis complete: ${result.verdict} (${(result.confidence * 100).toFixed(1)}% confidence)`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("analyze-video error:", error);
    
    // Handle rate limits
    if (error instanceof Error && error.message.includes("429")) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (error instanceof Error && error.message.includes("402")) {
      return new Response(
        JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
