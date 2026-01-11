import { useState, useCallback } from 'react';
import { extractFramesFromVideo, getRecommendedFrameCount } from '@/utils/frameExtractor';
import { toast } from 'sonner';

interface AnalysisResult {
  confidence: number;
  verdict: 'real' | 'ai-generated';
  details: {
    faceConsistency: number;
    temporalCoherence: number;
    artifactScore: number;
    compressionAnalysis: number;
  };
  framesAnalyzed: number;
  processingTime: number;
}

type AnalysisStep = 'extracting' | 'analyzing' | 'computing' | 'generating';

interface UseVideoAnalysisReturn {
  isProcessing: boolean;
  progress: number;
  currentStep: AnalysisStep;
  result: AnalysisResult | null;
  analyzeVideo: (file: File) => Promise<void>;
  reset: () => void;
}

export const useVideoAnalysis = (): UseVideoAnalysisReturn => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<AnalysisStep>('extracting');
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const analyzeVideo = useCallback(async (file: File) => {
    setIsProcessing(true);
    setProgress(0);
    setResult(null);

    try {
      // Step 1: Extract frames from video
      setCurrentStep('extracting');
      
      // Create a temporary video element to get duration
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      const duration = await new Promise<number>((resolve) => {
        video.onloadedmetadata = () => resolve(video.duration);
        video.src = URL.createObjectURL(file);
      });
      
      const frameCount = getRecommendedFrameCount(duration);
      
      const frames = await extractFramesFromVideo(file, {
        maxFrames: frameCount,
        quality: 0.8,
        onProgress: (p) => setProgress(p * 0.25), // 0-25% for extraction
      });

      if (frames.length === 0) {
        throw new Error('Failed to extract frames from video');
      }

      // Step 2: Send frames for AI analysis
      setCurrentStep('analyzing');
      setProgress(30);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-video`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ frames }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment and try again.');
        }
        if (response.status === 402) {
          throw new Error('AI credits exhausted. Please add credits to continue.');
        }
        
        throw new Error(errorData.error || 'Analysis failed');
      }

      // Step 3: Process results
      setCurrentStep('computing');
      setProgress(85);

      const analysisResult = await response.json();

      // Step 4: Generate final report
      setCurrentStep('generating');
      setProgress(95);

      // Small delay for UX
      await new Promise((resolve) => setTimeout(resolve, 500));

      setProgress(100);
      setResult({
        confidence: analysisResult.confidence,
        verdict: analysisResult.verdict,
        details: analysisResult.details,
        framesAnalyzed: analysisResult.framesAnalyzed,
        processingTime: analysisResult.processingTime,
      });
    } catch (error) {
      console.error('Video analysis error:', error);
      toast.error(error instanceof Error ? error.message : 'Analysis failed. Please try again.');
      setResult(null);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsProcessing(false);
    setProgress(0);
    setCurrentStep('extracting');
    setResult(null);
  }, []);

  return {
    isProcessing,
    progress,
    currentStep,
    result,
    analyzeVideo,
    reset,
  };
};
