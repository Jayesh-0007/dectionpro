import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Film, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoUploaderProps {
  onVideoSelect: (file: File) => void;
  isProcessing: boolean;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ACCEPTED_FORMATS = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];

export const VideoUploader = ({ onVideoSelect, isProcessing }: VideoUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_FORMATS.includes(file.type)) {
      return 'Invalid format. Please upload MP4, MOV, AVI, or WebM files.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File too large. Maximum size is 50MB.';
    }
    return null;
  };

  const handleFile = useCallback((file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
  };

  const handleAnalyze = () => {
    if (selectedFile) {
      onVideoSelect(selectedFile);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {!selectedFile ? (
          <motion.div
            key="uploader"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <label
              htmlFor="video-upload"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={cn(
                "relative flex flex-col items-center justify-center w-full h-72 rounded-2xl cursor-pointer transition-all duration-300",
                "glass border-2 border-dashed",
                isDragging 
                  ? "border-primary glow-primary bg-primary/5" 
                  : "border-border hover:border-primary/50 hover:bg-card/80",
                "group overflow-hidden"
              )}
            >
              {/* Background glow effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
              </div>

              {/* Scan line effect on drag */}
              {isDragging && (
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-scan" />
                </div>
              )}

              <div className="relative z-10 flex flex-col items-center gap-4 p-6">
                <motion.div
                  animate={{ 
                    scale: isDragging ? 1.1 : 1,
                    rotate: isDragging ? 5 : 0 
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className={cn(
                    "p-4 rounded-2xl transition-colors duration-300",
                    isDragging ? "bg-primary/20" : "bg-muted"
                  )}
                >
                  <Upload className={cn(
                    "w-10 h-10 transition-colors duration-300",
                    isDragging ? "text-primary" : "text-muted-foreground"
                  )} />
                </motion.div>

                <div className="text-center">
                  <p className="text-lg font-medium text-foreground">
                    {isDragging ? "Drop your video here" : "Drag & drop your video"}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    or click to browse
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Film className="w-4 h-4" />
                  <span>MP4, MOV, AVI, WebM • Max 50MB</span>
                </div>
              </div>

              <input
                id="video-upload"
                type="file"
                accept="video/mp4,video/quicktime,video/x-msvideo,video/webm"
                onChange={handleInputChange}
                className="hidden"
              />
            </label>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="glass rounded-2xl overflow-hidden"
          >
            {/* Video preview */}
            <div className="relative aspect-video bg-black/50">
              <video
                src={previewUrl!}
                className="w-full h-full object-contain"
                controls={!isProcessing}
              />
              
              {/* Processing overlay */}
              {isProcessing && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-4">
                      <div className="absolute inset-0 rounded-full border-2 border-primary/30" />
                      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
                    </div>
                    <p className="text-sm text-muted-foreground">Analyzing video...</p>
                  </div>
                </div>
              )}

              {/* Close button */}
              {!isProcessing && (
                <button
                  onClick={clearSelection}
                  className="absolute top-3 right-3 p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* File info and analyze button */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Film className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm truncate max-w-[200px]">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <button
                onClick={handleAnalyze}
                disabled={isProcessing}
                className={cn(
                  "px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-300",
                  "bg-primary text-primary-foreground",
                  "hover:glow-primary hover:scale-105",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                )}
              >
                {isProcessing ? "Analyzing..." : "Analyze Video"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
