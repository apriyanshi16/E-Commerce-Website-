import { Star, StarHalf } from "lucide-react";

interface StarRatingProps {
  rating: number;
  count?: number;
  size?: number;
}

export function StarRating({ rating, count, size = 16 }: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[...Array(fullStars)].map((_, i) => (
          <Star
            key={`full-${i}`}
            size={size}
            className="fill-yellow-400 text-yellow-400"
          />
        ))}
        {hasHalfStar && (
          <StarHalf size={size} className="fill-yellow-400 text-yellow-400" />
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star
            key={`empty-${i}`}
            size={size}
            className="text-gray-300"
          />
        ))}
      </div>
      {count !== undefined && (
        <span className="text-sm text-muted-foreground ml-1">({count})</span>
      )}
    </div>
  );
}
