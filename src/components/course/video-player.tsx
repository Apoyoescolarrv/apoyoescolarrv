import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Class } from "@/types/class";
import {
  Check,
  FastForward,
  Loader2,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  Rewind,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";

interface VideoPlayerProps {
  lesson: Class;
  isCompleted: boolean;
  progress: number;
  isPlaying: boolean;
  onProgress: (state: { playedSeconds: number }) => void;
  onPlay: () => void;
  onPause: () => void;
  onEnded: () => void;
}

export function VideoPlayer({
  lesson,
  isCompleted,
  progress,
  isPlaying,
  onProgress,
  onPlay,
  onPause,
  onEnded,
}: VideoPlayerProps) {
  const [volume, setVolume] = useState(1);
  const [previousVolume, setPreviousVolume] = useState(1);
  const [seeking, setSeeking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(progress);
  const [hovering, setHovering] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const playerRef = useRef<ReactPlayer>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const progressPercentage = lesson.duration
    ? (currentTime / lesson.duration) * 100
    : 0;

  const handleVolumeChange = useCallback((value: number[]) => {
    setVolume(value[0]);
    if (value[0] > 0) {
      setPreviousVolume(value[0]);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (volume > 0) {
      setPreviousVolume(volume);
      setVolume(0);
    } else {
      setVolume(previousVolume);
    }
  }, [volume, previousVolume]);

  const handleSeek = useCallback(
    (value: number[]) => {
      if (playerRef.current) {
        const time = (value[0] / 100) * (lesson.duration || 0);
        setCurrentTime(time);
        playerRef.current.seekTo(time);
      }
    },
    [lesson.duration]
  );

  const handleRewind = useCallback(() => {
    if (playerRef.current) {
      const newTime = Math.max(currentTime - 10, 0);
      setCurrentTime(newTime);
      playerRef.current.seekTo(newTime);
    }
  }, [currentTime]);

  const handleFastForward = useCallback(() => {
    if (playerRef.current && lesson.duration) {
      const newTime = Math.min(currentTime + 10, lesson.duration);
      setCurrentTime(newTime);
      playerRef.current.seekTo(newTime);
    }
  }, [currentTime, lesson.duration]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const hideControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    if (!hovering && isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2000);
    }
  }, [hovering, isPlaying]);

  useEffect(() => {
    if (hovering || !isPlaying) {
      setShowControls(true);
    } else {
      hideControlsTimeout();
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [hovering, isPlaying, hideControlsTimeout]);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
  }, []);

  useEffect(() => {
    setCurrentTime(progress);
  }, [progress]);

  const handleProgress = useCallback(
    ({ playedSeconds }: { playedSeconds: number }) => {
      if (!seeking) {
        setCurrentTime(playedSeconds);
        onProgress({ playedSeconds });
      }
    },
    [seeking, onProgress]
  );

  return (
    <div className="space-y-6 px-4 max-w-[1200px] mx-auto">
      {/* Video Player */}
      <div
        ref={containerRef}
        className={cn(
          "relative rounded-xl overflow-hidden bg-black/95 border shadow-sm group",
          isFullscreen && "fixed inset-0 z-50 rounded-none border-none"
        )}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        <div className="aspect-video relative">
          <ReactPlayer
            ref={playerRef}
            url={lesson.videoUrl}
            width="100%"
            height="100%"
            playing={isPlaying}
            volume={volume}
            onPlay={onPlay}
            onPause={onPause}
            onProgress={handleProgress}
            onEnded={onEnded}
            onBuffer={() => setLoading(true)}
            onBufferEnd={() => setLoading(false)}
            onReady={() => setLoading(false)}
            progressInterval={1000}
            config={{
              youtube: {
                playerVars: {
                  modestbranding: 1,
                  rel: 0,
                  controls: 0,
                  start: Math.floor(progress),
                },
              },
            }}
          />

          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          )}

          {/* Play/Pause Overlay */}
          <button
            onClick={() => (isPlaying ? onPause() : onPlay())}
            className={cn(
              "absolute inset-0 flex items-center justify-center transition-opacity",
              showControls ? "opacity-100" : "opacity-0",
              "hover:bg-black/10"
            )}
          >
            <div className="rounded-full bg-black/50 p-4 backdrop-blur-sm transition-transform hover:scale-110">
              {isPlaying ? (
                <Pause className="h-8 w-8 text-white" />
              ) : (
                <Play className="h-8 w-8 text-white translate-x-0.5" />
              )}
            </div>
          </button>

          {/* Controls */}
          <div
            className={cn(
              "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity",
              showControls ? "opacity-100" : "opacity-0"
            )}
          >
            {/* Progress Bar */}
            <div className="mb-4">
              <Slider
                value={[progressPercentage]}
                max={100}
                step={0.1}
                onValueChange={handleSeek}
                onValueCommit={() => setSeeking(false)}
                className="cursor-pointer"
                onMouseDown={() => setSeeking(true)}
                onMouseUp={() => setSeeking(false)}
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {/* Play/Pause */}
                <button
                  onClick={() => (isPlaying ? onPause() : onPlay())}
                  className="rounded-lg p-1.5 text-white hover:bg-white/10"
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5 translate-x-0.5" />
                  )}
                </button>

                {/* Rewind */}
                <button
                  onClick={handleRewind}
                  className="rounded-lg p-1.5 text-white hover:bg-white/10"
                >
                  <Rewind className="h-5 w-5" />
                </button>

                {/* Fast Forward */}
                <button
                  onClick={handleFastForward}
                  className="rounded-lg p-1.5 text-white hover:bg-white/10"
                >
                  <FastForward className="h-5 w-5" />
                </button>

                {/* Time */}
                <div className="text-sm text-white">
                  <span>{formatTime(currentTime)}</span>
                  <span className="mx-1">/</span>
                  <span>{formatTime(lesson.duration || 0)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Volume */}
                <div className="flex items-center gap-2 group/volume">
                  <button
                    onClick={toggleMute}
                    className="rounded-lg p-1.5 text-white hover:bg-white/10"
                  >
                    {volume === 0 ? (
                      <VolumeX className="h-5 w-5" />
                    ) : (
                      <Volume2 className="h-5 w-5" />
                    )}
                  </button>
                  <div className="w-0 overflow-hidden transition-all group-hover/volume:w-24">
                    <Slider
                      value={[volume]}
                      max={1}
                      step={0.01}
                      onValueChange={handleVolumeChange}
                      className="cursor-pointer"
                    />
                  </div>
                </div>

                {/* Fullscreen */}
                <button
                  onClick={toggleFullscreen}
                  className="rounded-lg p-1.5 text-white hover:bg-white/10"
                >
                  {isFullscreen ? (
                    <Minimize2 className="h-5 w-5" />
                  ) : (
                    <Maximize2 className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {lesson.title}
            </h1>
            {isCompleted && (
              <Badge
                variant="secondary"
                className="bg-green-500/10 text-green-500 hover:bg-green-500/20"
              >
                <Check className="h-3.5 w-3.5 mr-1" />
                Completada
              </Badge>
            )}
          </div>
          {lesson.description && (
            <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">
              {lesson.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
