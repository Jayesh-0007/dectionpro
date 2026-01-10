import { motion } from 'framer-motion';
import { Cpu, Eye, BarChart3, FileCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnalysisProgressProps {
  progress: number;
  currentStep: string;
}

const steps = [
  { id: 'extracting', label: 'Extracting Frames', icon: Eye },
  { id: 'analyzing', label: 'AI Analysis', icon: Cpu },
  { id: 'computing', label: 'Computing Score', icon: BarChart3 },
  { id: 'generating', label: 'Generating Report', icon: FileCheck },
];

export const AnalysisProgress = ({ progress, currentStep }: AnalysisProgressProps) => {
  const currentIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto glass rounded-2xl p-8"
    >
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Analyzing Your Video
        </h3>
        <p className="text-sm text-muted-foreground">
          Our AI is examining each frame for deepfake indicators
        </p>
      </div>

      {/* Progress bar */}
      <div className="relative h-3 bg-muted rounded-full overflow-hidden mb-8">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-accent rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
      </div>

      {/* Percentage */}
      <div className="text-center mb-8">
        <span className="text-4xl font-bold font-mono text-gradient">{Math.round(progress)}%</span>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {steps.map((step, index) => {
          const isActive = index === currentIndex;
          const isComplete = index < currentIndex;
          const Icon = step.icon;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300",
                isActive && "bg-primary/10 glow-primary",
                isComplete && "bg-success/10",
                !isActive && !isComplete && "bg-muted/50"
              )}
            >
              <div className={cn(
                "p-3 rounded-xl transition-colors duration-300",
                isActive && "bg-primary/20 text-primary",
                isComplete && "bg-success/20 text-success",
                !isActive && !isComplete && "bg-muted text-muted-foreground"
              )}>
                {isActive ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <span className={cn(
                "text-xs font-medium text-center",
                isActive && "text-primary",
                isComplete && "text-success",
                !isActive && !isComplete && "text-muted-foreground"
              )}>
                {step.label}
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
