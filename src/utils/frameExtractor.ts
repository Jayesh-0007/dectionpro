/**
 * Extracts frames from a video file using HTML5 Canvas API
 */

interface ExtractFramesOptions {
  maxFrames?: number;
  quality?: number;
  onProgress?: (progress: number) => void;
}

export async function extractFramesFromVideo(
  videoFile: File,
  options: ExtractFramesOptions = {}
): Promise<string[]> {
  const { maxFrames = 10, quality = 0.8, onProgress } = options;

  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Failed to get canvas context"));
      return;
    }

    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;

    const objectUrl = URL.createObjectURL(videoFile);
    video.src = objectUrl;

    video.onloadedmetadata = async () => {
      const duration = video.duration;
      
      // Calculate frame intervals (evenly distributed across the video)
      const frameInterval = duration / (maxFrames + 1);
      const timestamps: number[] = [];
      
      for (let i = 1; i <= maxFrames; i++) {
        timestamps.push(frameInterval * i);
      }

      // Set canvas dimensions to match video
      canvas.width = Math.min(video.videoWidth, 1280); // Cap at 1280px for efficiency
      canvas.height = Math.min(
        video.videoHeight,
        (canvas.width / video.videoWidth) * video.videoHeight
      );

      const frames: string[] = [];

      for (let i = 0; i < timestamps.length; i++) {
        try {
          const frame = await captureFrame(video, canvas, ctx, timestamps[i], quality);
          frames.push(frame);
          onProgress?.(((i + 1) / timestamps.length) * 100);
        } catch (error) {
          console.warn(`Failed to capture frame at ${timestamps[i]}s:`, error);
        }
      }

      URL.revokeObjectURL(objectUrl);
      video.remove();

      if (frames.length === 0) {
        reject(new Error("Failed to extract any frames from video"));
      } else {
        resolve(frames);
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      video.remove();
      reject(new Error("Failed to load video file"));
    };

    video.load();
  });
}

function captureFrame(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  timestamp: number,
  quality: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const seekHandler = () => {
      video.removeEventListener("seeked", seekHandler);
      video.removeEventListener("error", errorHandler);

      // Draw the current frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to base64 data URL
      const dataUrl = canvas.toDataURL("image/jpeg", quality);
      resolve(dataUrl);
    };

    const errorHandler = () => {
      video.removeEventListener("seeked", seekHandler);
      video.removeEventListener("error", errorHandler);
      reject(new Error(`Failed to seek to ${timestamp}s`));
    };

    video.addEventListener("seeked", seekHandler);
    video.addEventListener("error", errorHandler);

    // Seek to the timestamp
    video.currentTime = timestamp;
  });
}

/**
 * Estimates the number of frames to analyze based on video duration
 */
export function getRecommendedFrameCount(durationSeconds: number): number {
  if (durationSeconds <= 10) return 5;
  if (durationSeconds <= 30) return 8;
  if (durationSeconds <= 60) return 10;
  if (durationSeconds <= 180) return 12;
  return 15; // Max 15 frames for longer videos
}
