import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingDisplayProps {
  rating: number;
  maxRating?: number;
  showNumber?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function RatingDisplay({
  rating,
  maxRating = 5,
  showNumber = true,
  size = "md",
  className = "",
}: RatingDisplayProps) {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex">
        {Array.from({ length: maxRating }).map((_, index) => (
          <Star
            key={index}
            className={cn(
              sizeClasses[size],
              index < Math.floor(rating)
                ? "fill-yellow-400 text-yellow-400"
                : index < rating
                ? "fill-yellow-400/50 text-yellow-400"
                : "text-gray-300 dark:text-gray-600"
            )}
          />
        ))}
      </div>
      {showNumber && (
        <span className={cn("text-muted-foreground", textSizeClasses[size])}>
          ({rating.toFixed(1)})
        </span>
      )}
    </div>
  );
}
