import { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize2, Activity, Film } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Exercise } from "@/data/exercises";
import { ExercisePoster } from "@/components/exercise/ExercisePoster";
import { BiomechanicalVisualizer } from "@/components/exercise/BiomechanicalVisualizer";

interface ExerciseVideoPlayerProps {
  exercise: Pick<Exercise, "name" | "muscleGroup" | "poster" | "video"> &
    Partial<Pick<Exercise, "equipment" | "difficulty" | "instructions" | "cues">>;
  className?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  modelGender?: "male" | "female";
  viewAngle?: "front" | "side";
}

export const ExerciseVideoPlayer = ({
  exercise,
  className,
  autoPlay = true,
  loop = true,
  muted = true,
  modelGender = "male",
  viewAngle = "front",
}: ExerciseVideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [showPoster, setShowPoster] = useState(true);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(muted);
  const [videoFailed, setVideoFailed] = useState(false);
  const [viewMode, setViewMode] = useState<"video" | "biomechanics">("video");

  // Reset poster and fallback state when exercise changes
  useEffect(() => {
    setShowPoster(true);
    setVideoFailed(false);
    setViewMode("video");
  }, [exercise.poster, exercise.video, exercise.name]);

  // Handle HTML5 video autoplay & mute
  useEffect(() => {
    const video = videoRef.current;
    if (video && autoPlay && viewMode === "video" && !videoFailed) {
      video.muted = isMuted;
      video.play().catch((err) => {
        // Autoplay policy prevented playback; will wait for user interaction
        console.warn("Autoplay notice:", err.message || err);
        setIsPlaying(false);
      });
    }

    return () => {
      if (video) {
        video.pause();
      }
    };
  }, [exercise.video, autoPlay, isMuted, viewMode, videoFailed]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => {
        setIsPlaying(true);
        setShowPoster(false);
      }).catch((err) => {
        console.warn("Play error:", err);
      });
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = !video.muted;
      setIsMuted(video.muted);
    } else {
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen?.().catch((err) => console.warn(err));
    } else {
      document.exitFullscreen?.().catch((err) => console.warn(err));
    }
  }, []);

  const handleVideoError = useCallback(() => {
    console.warn(`Video playback issue for ${exercise.name}, falling back to Biomechanical visualizer.`);
    setVideoFailed(true);
    setViewMode("biomechanics");
  }, [exercise.name]);

  // If user selected Biomechanics mode or if video media failed, render BiomechanicalVisualizer
  if (viewMode === "biomechanics" || videoFailed || !exercise.video) {
    return (
      <BiomechanicalVisualizer
        exercise={exercise}
        modelGender={modelGender}
        viewAngle={viewAngle}
        className={className}
        onSwitchToVideo={() => {
          setVideoFailed(false);
          setViewMode("video");
        }}
        hasVideo={Boolean(exercise.video && !videoFailed)}
      />
    );
  }

  const isYouTube = exercise.video.includes("youtube.com") || exercise.video.includes("youtu.be");

  const getYouTubeEmbedUrl = (url: string) => {
    let videoId = "";
    if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0];
    } else if (url.includes("youtube.com/watch")) {
      const urlParams = new URLSearchParams(url.split("?")[1]);
      videoId = urlParams.get("v") || "";
    } else if (url.includes("youtube.com/embed/")) {
      return url;
    }
    return videoId
      ? `https://www.youtube.com/embed/${videoId}?autoplay=${autoPlay ? 1 : 0}&mute=${isMuted ? 1 : 0}&playsinline=1`
      : url;
  };

  const isWebM = exercise.video.endsWith(".webm");

  return (
    <div
      ref={containerRef}
      className="group relative h-full w-full overflow-hidden bg-black select-none"
    >
      {/* Poster overlay before video starts */}
      {showPoster && (
        <div className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300">
          <ExercisePoster exercise={exercise} loading="eager" showPlayBadge={false} />
        </div>
      )}

      {/* Top Controls Overlay: Mode Switcher & Model/Angle Badges */}
      <div className="absolute top-3 inset-x-3 z-30 flex items-center justify-between opacity-90 transition-opacity duration-200 group-hover:opacity-100">
        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[11px] font-bold text-white shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            HD PREVIEW
          </span>
          <span className="hidden sm:inline-flex px-2 py-0.5 rounded bg-black/50 backdrop-blur-md border border-white/10 text-[10px] font-semibold text-slate-300">
            {modelGender.toUpperCase()} • {viewAngle.toUpperCase()}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setViewMode("biomechanics")}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs font-semibold shadow-md transition-all hover:scale-105"
        >
          <Activity className="w-3.5 h-3.5 text-primary animate-pulse" />
          <span>Biomechanics</span>
        </button>
      </div>

      {/* Primary Video Element */}
      {isYouTube ? (
        <iframe
          src={getYouTubeEmbedUrl(exercise.video)}
          title={exercise.name}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className={cn("absolute inset-0 w-full h-full border-0", className)}
          onLoad={() => setShowPoster(false)}
          onError={handleVideoError}
        />
      ) : (
        <video
          ref={videoRef}
          controls={false}
          autoPlay={autoPlay}
          loop={loop}
          muted={isMuted}
          playsInline
          preload="auto"
          className={cn("absolute inset-0 w-full h-full object-cover", className)}
          onPlay={() => {
            setShowPoster(false);
            setIsPlaying(true);
          }}
          onPlaying={() => setShowPoster(false)}
          onTimeUpdate={() => {
            if (showPoster) setShowPoster(false);
          }}
          onError={handleVideoError}
          onClick={togglePlay}
        >
          <source src={exercise.video} type={isWebM ? "video/webm" : "video/mp4"} />
          {/* Fallback secondary source if filename ends in webm or mp4 */}
          {isWebM && (
            <source src={exercise.video.replace(/\.webm$/, ".mp4")} type="video/mp4" />
          )}
          {!isWebM && (
            <source src={exercise.video.replace(/\.mp4$/, ".webm")} type="video/webm" />
          )}
        </video>
      )}

      {/* Floating Interactive Video Controls on Hover */}
      {!isYouTube && (
        <div className="absolute inset-x-0 bottom-0 z-30 flex items-center justify-between bg-gradient-to-t from-black/80 via-black/30 to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={togglePlay}
              className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-colors"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            </button>

            <button
              type="button"
              onClick={toggleMute}
              className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-colors"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <span className="text-[11px] font-medium text-white/80 uppercase tracking-wider pl-1">
              {exercise.muscleGroup} • {exercise.equipment}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-colors"
              title="Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
