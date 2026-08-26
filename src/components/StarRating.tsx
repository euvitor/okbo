interface StarRatingProps {
  rating: number | null;
  count?: number;
}

export function StarRating({ rating, count }: StarRatingProps) {
  if (!rating) return null;
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className="text-xs leading-none"
          style={{
            color:
              i <= Math.round(rating)
                ? "#D97706" /* amber-600, readable on both bg */
                : "var(--color-ink-faint)",
          }}
        >
          ★
        </span>
      ))}
      {count && (
        <span className="text-xs" style={{ color: "var(--color-ink-faint)" }}>
          ({count.toLocaleString()})
        </span>
      )}
    </div>
  );
}
