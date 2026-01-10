import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { VideoUploader } from '@/components/VideoUploader';
import { AnalysisProgress } from '@/components/AnalysisProgress';
import { ResultCard } from '@/components/ResultCard';
import { useVideoAnalysis } from '@/hooks/useVideoAnalysis';
import { generateReport } from '@/utils/generateReport';

const Index = () => {
  const [fileName, setFileName] = useState<string>('');
  const { isProcessing, progress, currentStep, result, analyzeVideo, reset } = useVideoAnalysis();

  const handleVideoSelect = (file: File) => {
    setFileName(file.name);
    analyzeVideo(file);
  };

  const handleReset = () => {
    reset();
    setFileName('');
  };

  const handleDownloadReport = () => {
    if (result) {
      generateReport(result, fileName);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
                              linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 pb-16">
        <Header />

        <main className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {!isProcessing && !result && (
              <motion.div
                key="uploader"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <VideoUploader
                  onVideoSelect={handleVideoSelect}
                  isProcessing={isProcessing}
                />
              </motion.div>
            )}

            {isProcessing && (
              <motion.div
                key="progress"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <AnalysisProgress progress={progress} currentStep={currentStep} />
              </motion.div>
            )}

            {result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <ResultCard
                  result={result}
                  onReset={handleReset}
                  onDownloadReport={handleDownloadReport}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* How it works section */}
          {!isProcessing && !result && (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-16"
            >
              <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    step: '01',
                    title: 'Upload Video',
                    description: 'Drag and drop your video file or click to browse. Supports MP4, MOV, AVI up to 50MB.'
                  },
                  {
                    step: '02',
                    title: 'AI Analysis',
                    description: 'Our neural network extracts and analyzes frames, detecting deepfake indicators and artifacts.'
                  },
                  {
                    step: '03',
                    title: 'Get Results',
                    description: 'Receive a detailed confidence score with breakdown of authenticity factors.'
                  }
                ].map((item, index) => (
                  <motion.div
                    key={item.step}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 + index * 0.1 }}
                    className="glass rounded-2xl p-6 hover:glow-primary transition-all duration-300"
                  >
                    <span className="text-4xl font-bold text-gradient font-mono">{item.step}</span>
                    <h3 className="text-lg font-semibold mt-4 mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 py-6 text-center text-xs text-muted-foreground">
        <p>AI Video Detector • Powered by Advanced Neural Networks</p>
      </footer>
    </div>
  );
};

export default Index;
