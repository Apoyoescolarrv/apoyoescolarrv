import { Button } from "@/components/ui/button";
import { Course } from "@/types/course";
import { Facebook, MessageCircle, Share2, Twitter } from "lucide-react";

interface ShareButtonsProps {
  course: Course;
}

export function ShareButtons({ course }: ShareButtonsProps) {
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = `¡Mira este curso: ${course.title}!`;

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      shareUrl
    )}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(
      shareUrl
    )}&text=${encodeURIComponent(shareText)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(
      `${shareText} ${shareUrl}`
    )}`,
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500 flex items-center gap-1">
        <Share2 className="h-4 w-4" />
      </span>
      <Button
        variant="ghost"
        size="sm"
        className="text-blue-600"
        onClick={() => window.open(shareLinks.facebook, "_blank")}
      >
        <Facebook className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="text-sky-500"
        onClick={() => window.open(shareLinks.twitter, "_blank")}
      >
        <Twitter className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="text-green-600"
        onClick={() => window.open(shareLinks.whatsapp, "_blank")}
      >
        <MessageCircle className="h-4 w-4" />
      </Button>
    </div>
  );
}
