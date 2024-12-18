import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatDuration } from "@/lib/format";
import { CourseModule, ModuleClass } from "@/types/course";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, Clock, Lock, Play } from "lucide-react";
import { useState } from "react";

interface ModuleProps {
  module: CourseModule & { moduleClasses?: ModuleClass[] };
  index: number;
  onPreviewClick: (videoUrl: string, title: string) => void;
  isActive?: boolean;
}

export function Module({
  module,
  index,
  onPreviewClick,
  isActive,
}: ModuleProps) {
  const [isOpen, setIsOpen] = useState(isActive);
  const totalDuration =
    module.moduleClasses?.reduce(
      (acc, mc) => acc + (mc.class?.duration || 0),
      0
    ) ?? 0;

  const completedClasses =
    module.moduleClasses?.filter((mc) => mc.class?.isPreview).length ?? 0;
  const totalClasses = module.moduleClasses?.length || 0;
  const progress = (completedClasses / totalClasses) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border rounded-lg overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
              {index + 1}
            </span>
            <div className="text-left">
              <h3 className="font-medium">{module.title}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Play className="h-3 w-3" />
                  {module.moduleClasses?.length} clases
                </span>
                {totalDuration > 0 && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(totalDuration)}
                  </span>
                )}
              </div>
            </div>
          </div>
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </div>
        <div className="mt-2">
          <Progress value={progress} className="h-1" />
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="divide-y"
          >
            {module.moduleClasses?.map((moduleClass, classIndex) => (
              <motion.li
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                key={moduleClass.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 w-6 text-center">
                      {classIndex + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium">
                          {moduleClass.class?.title}
                        </h4>
                        {!moduleClass.class?.isPreview && (
                          <Lock className="h-3 w-3 text-gray-400" />
                        )}
                      </div>
                      {moduleClass.class?.duration && (
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          {formatDuration(moduleClass.class.duration)}
                        </p>
                      )}
                    </div>
                  </div>
                  {moduleClass.class?.isPreview &&
                    moduleClass.class?.videoUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:text-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPreviewClick(
                            moduleClass.class!.videoUrl,
                            moduleClass.class!.title
                          );
                        }}
                      >
                        <Play className="h-4 w-4" />
                        Vista previa
                      </Button>
                    )}
                </div>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
