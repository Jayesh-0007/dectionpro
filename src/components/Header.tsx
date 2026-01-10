import { motion } from 'framer-motion';
import { Shield, Sparkles } from 'lucide-react';

export const Header = () => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center py-12 md:py-16"
    >
      {/* Logo */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="inline-flex items-center justify-center p-4 mb-6 rounded-2xl bg-primary/10 border border-primary/20 glow-primary"
      >
        <Shield className="w-10 h-10 text-primary" />
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
      >
        <span className="text-foreground">AI Video</span>{' '}
        <span className="text-gradient">Detector</span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6"
      >
        Detect deepfakes and AI-generated videos with advanced neural network analysis
      </motion.p>

      {/* Feature badges */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-wrap items-center justify-center gap-3"
      >
        {['Frame Analysis', 'Face Detection', 'Artifact Scanning', 'Instant Results'].map((feature, index) => (
          <motion.span
            key={feature}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 + index * 0.1 }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-muted text-muted-foreground border border-border"
          >
            <Sparkles className="w-3 h-3 text-primary" />
            {feature}
          </motion.span>
        ))}
      </motion.div>
    </motion.header>
  );
};
