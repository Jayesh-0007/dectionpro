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

export const generateReport = (result: AnalysisResult, fileName: string) => {
  const date = new Date().toLocaleString();
  const confidencePercent = Math.round(result.confidence * 100);

  const reportContent = `
════════════════════════════════════════════════════════════════
                    AI VIDEO DETECTOR - ANALYSIS REPORT
════════════════════════════════════════════════════════════════

Report Generated: ${date}
File Analyzed: ${fileName}

────────────────────────────────────────────────────────────────
                           VERDICT
────────────────────────────────────────────────────────────────

Result: ${result.verdict === 'real' ? '✓ LIKELY AUTHENTIC' : '⚠ LIKELY AI-GENERATED'}
Confidence Score: ${confidencePercent}%

${result.verdict === 'real' 
  ? 'No significant manipulation indicators were detected in this video.'
  : 'Deepfake indicators were detected in this video. Exercise caution.'}

────────────────────────────────────────────────────────────────
                      DETAILED ANALYSIS
────────────────────────────────────────────────────────────────

Face Consistency:      ${Math.round(result.details.faceConsistency * 100)}%
  Measures consistency of facial features across frames

Temporal Coherence:    ${Math.round(result.details.temporalCoherence * 100)}%
  Analyzes natural motion and transitions between frames

Artifact Detection:    ${Math.round(result.details.artifactScore * 100)}%
  Scans for digital artifacts common in AI-generated content

Compression Analysis:  ${Math.round(result.details.compressionAnalysis * 100)}%
  Examines compression patterns for signs of manipulation

────────────────────────────────────────────────────────────────
                      PROCESSING STATS
────────────────────────────────────────────────────────────────

Frames Analyzed: ${result.framesAnalyzed}
Processing Time: ${result.processingTime.toFixed(2)} seconds

────────────────────────────────────────────────────────────────
                         DISCLAIMER
────────────────────────────────────────────────────────────────

This analysis is provided for informational purposes only. While our
AI models are highly accurate, no detection system is 100% reliable.
Results should be considered as one factor in a comprehensive
authenticity assessment.

For critical decisions, we recommend combining this analysis with
other verification methods and expert consultation.

════════════════════════════════════════════════════════════════
                    Powered by AI Video Detector
════════════════════════════════════════════════════════════════
  `.trim();

  // Create and download the file
  const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `analysis-report-${Date.now()}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
