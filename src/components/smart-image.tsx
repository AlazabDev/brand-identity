import { useState } from "react";
import { cn } from "@/lib/utils";
import { ImageOff } from "lucide-react";

interface SmartImageProps {
  src: string;
  alt: string;
  className?: string;
  /** Marks the image as the LCP candidate: eager load with high priority. */
  priority?: boolean;
  sizes?: string;
}

/**
 * Image with a skeleton placeholder, fade-in on load and a graceful
 * fallback when the source fails to load.
 */
export const SmartImage = ({ src, alt, className, priority = false, sizes }: SmartImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className="flex h-full w-full flex-col items-center justify-center gap-2 bg-muted text-muted-foreground"
        role="img"
        aria-label={alt}
      >
        <ImageOff className="h-6 w-6" aria-hidden="true" />
        <span className="px-3 text-center font-body text-xs">تعذر تحميل الصورة</span>
      </div>
    );
  }

  return (
    <>
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-muted" aria-hidden="true" />
      )}
      <img
        src={src}
        alt={alt}
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding={priority ? "sync" : "async"}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={cn(
          "transition-opacity duration-500",
          loaded ? "opacity-100" : "opacity-0",
          className,
        )}
      />
    </>
  );
};
