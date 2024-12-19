import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatTime } from "@/lib/format";
import { Class } from "@/types/class";
import { Check, Clock } from "lucide-react";
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
  const progressPercentage = lesson.duration
    ? (progress / lesson.duration) * 100
    : 0;

  return (
    <div className="space-y-6 px-4 max-w-[1200px] mx-auto">
      {/* Video Player */}
      <div className="relative rounded-xl overflow-hidden bg-black/5 border shadow-sm">
        <div className="aspect-video">
          <ReactPlayer
            url={lesson.videoUrl}
            width="100%"
            height="100%"
            controls
            playing={isPlaying}
            onPlay={onPlay}
            onPause={onPause}
            onProgress={onProgress}
            onEnded={onEnded}
            progressInterval={2000}
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
        </div>

        {/* Progress Bar */}
        <div className="p-4 bg-background border-t">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {formatTime(progress)} / {formatTime(lesson.duration || 0)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={progressPercentage} className="w-[180px] h-2" />
              <span className="text-sm font-medium w-12 text-right">
                {Math.round(progressPercentage)}%
              </span>
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
