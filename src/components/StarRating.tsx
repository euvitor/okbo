interface StarRatingProps {
  rating: number | null;
  count?: number;
}

export function StarRating({ rating, count }: StarRatingProps) {
  if (!rating) return null;
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={`text-sm leading-none transition-transform ${
              i <= Math.round(rating)
                ? "text-amber-500 drop-shadow-[0_1px_4px_rgba(245,158,11,0.4)]"
                : "text-neutral-300 dark:text-neutral-700"
            }`}
          >
            ★
          </span>
        ))}
      </div>
      <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
        {rating.toFixed(1)}
      </span>
      {count !== undefined && count > 0 && (
        <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
          ({count.toLocaleString()})
        </span>
      )}
    </div>
  );
}
