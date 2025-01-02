import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Class } from "@/types/class";
import { Check, Clock, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useState } from "react";
import ReactPlayer from "react-player";
import { Button } from "../ui/button";

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
  const [isHovering, setIsHovering] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const progressPercentage = lesson.duration
    ? (progress / lesson.duration) * 100
    : 0;

  return (
    <div className="space-y-6 px-4 max-w-[1200px] mx-auto">
      {/* Video Player Container */}
      <div
        className="relative rounded-xl overflow-hidden bg-black shadow-xl ring-1 ring-white/10"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="aspect-video relative group">
          <ReactPlayer
            url={lesson.videoUrl}
            width="100%"
            height="100%"
            playing={isPlaying}
            muted={isMuted}
            onPlay={onPlay}
            onPause={onPause}
            onProgress={onProgress}
            onEnded={onEnded}
            onBuffer={() => setIsBuffering(true)}
            onBufferEnd={() => setIsBuffering(false)}
            progressInterval={1000}
            config={{
              youtube: {
                playerVars: {
                  modestbranding: 1,
                  rel: 0,
                  start: Math.floor(progress),
                },
              },
            }}
          />

          {/* Loading Overlay */}
          {isBuffering && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          )}

          {/* Controls Overlay */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300",
              isHovering ? "opacity-100" : "opacity-0"
            )}
          >
            <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
              {/* Progress Bar */}
              <div className="relative group/progress">
                <Progress
                  value={progressPercentage}
                  className="h-1 cursor-pointer group-hover/progress:h-2 transition-all"
                />
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/90 px-2 py-1 rounded text-xs opacity-0 group-hover/progress:opacity-100 transition-opacity">
                  {formatTime(progress)}
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    className="text-background"
                    onClick={isPlaying ? onPause : onPlay}
                    size="icon"
                  >
                    {isPlaying ? (
                      <Pause className="h-6 w-6" />
                    ) : (
                      <Play className="h-6 w-6" />
                    )}
                  </Button>

                  <Button
                    className="text-background"
                    variant="ghost"
                    onClick={() => setIsMuted(!isMuted)}
                    size="icon"
                  >
                    {isMuted ? (
                      <VolumeX className="h-6 w-6" />
                    ) : (
                      <Volume2 className="h-6 w-6" />
                    )}
                  </Button>

                  <div className="flex items-center gap-2 text-white/90">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {formatTime(progress)} /{" "}
                      {formatTime(lesson.duration || 0)}
                    </span>
                  </div>
                </div>

                {isCompleted && (
                  <Badge
                    variant="secondary"
                    className="bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                  >
                    <Check className="h-3.5 w-3.5 mr-1" />
                    Completada
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Info */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{lesson.title}</h1>
        </div>
        {lesson.description && (
          <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">
            {lesson.description}
          </p>
        )}
      </div>
    </div>
  );
}
