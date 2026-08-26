interface StarRatingProps {
  rating: number | null;
  count?: number;
}

export function StarRating({ rating, count }: StarRatingProps) {
  if (!rating) return null;
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={`text-sm sm:text-base leading-none ${
              i <= Math.round(rating)
                ? "text-amber-600 dark:text-amber-400"
                : "text-[var(--color-ink-faint)]"
            }`}
          >
            ★
          </span>
        ))}
      </div>
      {count && (
        <span className="text-xs sm:text-sm font-medium ml-0.5" style={{ color: "var(--color-ink-faint)" }}>
          ({count.toLocaleString()})
        </span>
      )}
    </div>
  );
}
