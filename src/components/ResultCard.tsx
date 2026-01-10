import { motion } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, Download, RotateCcw, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

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

interface ResultCardProps {
  result: AnalysisResult;
  onReset: () => void;
  onDownloadReport: () => void;
}

export const ResultCard = ({ result, onReset, onDownloadReport }: ResultCardProps) => {
  const isReal = result.verdict === 'real';
  const confidencePercent = Math.round(result.confidence * 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: "spring" }}
      className="w-full max-w-2xl mx-auto"
    >
      {/* Main result card */}
      <div className={cn(
        "glass rounded-2xl overflow-hidden",
        isReal ? "glow-success" : "glow-danger"
      )}>
        {/* Header with verdict */}
        <div className={cn(
          "p-8 text-center",
          isReal 
            ? "bg-gradient-to-br from-success/20 via-success/10 to-transparent" 
            : "bg-gradient-to-br from-destructive/20 via-destructive/10 to-transparent"
        )}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className={cn(
              "inline-flex p-5 rounded-full mb-4",
              isReal ? "bg-success/20" : "bg-destructive/20"
            )}
          >
            {isReal ? (
              <CheckCircle className="w-12 h-12 text-success" />
            ) : (
              <AlertTriangle className="w-12 h-12 text-destructive" />
            )}
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl md:text-3xl font-bold mb-2"
          >
            {isReal ? "Likely Authentic" : "Likely AI-Generated"}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-muted-foreground"
          >
            {isReal 
              ? "No significant manipulation indicators detected" 
              : "Deepfake indicators were detected in this video"
            }
          </motion.p>
        </div>

        {/* Confidence gauge */}
        <div className="p-6 border-t border-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Confidence Score</span>
            <span className={cn(
              "text-2xl font-bold font-mono",
              isReal ? "text-success" : "text-destructive"
            )}>
              {confidencePercent}%
            </span>
          </div>

          {/* Gauge bar */}
          <div className="relative h-4 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${confidencePercent}%` }}
              transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
              className={cn(
                "absolute inset-y-0 left-0 rounded-full",
                isReal 
                  ? "bg-gradient-to-r from-success to-primary" 
                  : "bg-gradient-to-r from-destructive to-warning"
              )}
            />
          </div>

          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Analysis details */}
        <div className="p-6 border-t border-border">
          <h3 className="flex items-center gap-2 text-sm font-semibold mb-4 text-muted-foreground">
            <Info className="w-4 h-4" />
            Analysis Breakdown
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Face Consistency', value: result.details.faceConsistency },
              { label: 'Temporal Coherence', value: result.details.temporalCoherence },
              { label: 'Artifact Detection', value: result.details.artifactScore },
              { label: 'Compression Analysis', value: result.details.compressionAnalysis },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="bg-muted/50 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                  <span className="text-sm font-mono font-medium">{Math.round(item.value * 100)}%</span>
                </div>
                <div className="h-1.5 bg-background rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value * 100}%` }}
                    transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                    className={cn(
                      "h-full rounded-full",
                      item.value > 0.7 ? "bg-success" : item.value > 0.4 ? "bg-warning" : "bg-destructive"
                    )}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats footer */}
        <div className="p-6 border-t border-border bg-muted/30">
          <div className="flex justify-center gap-8 text-center">
            <div>
              <p className="text-xl font-bold font-mono text-foreground">
                {result.framesAnalyzed}
              </p>
              <p className="text-xs text-muted-foreground">Frames Analyzed</p>
            </div>
            <div className="w-px bg-border" />
            <div>
              <p className="text-xl font-bold font-mono text-foreground">
                {result.processingTime.toFixed(1)}s
              </p>
              <p className="text-xs text-muted-foreground">Processing Time</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="flex flex-col sm:flex-row gap-4 mt-6"
      >
        <button
          onClick={onDownloadReport}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300",
            "bg-primary text-primary-foreground hover:glow-primary hover:scale-[1.02]"
          )}
        >
          <Download className="w-4 h-4" />
          Download Report
        </button>
        <button
          onClick={onReset}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300",
            "bg-muted text-foreground hover:bg-muted/80"
          )}
        >
          <RotateCcw className="w-4 h-4" />
          Analyze Another
        </button>
      </motion.div>
    </motion.div>
  );
};
