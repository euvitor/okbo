interface StarRatingProps {
    rating: number | null
    count?: number
}

export function StarRating({ rating, count }: StarRatingProps) {
    if (!rating) return null
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(i => (
                <span key={i} className={`text-xs ${i <= Math.round(rating) ? 'text-amber-400' : 'text-neutral-300 dark:text-neutral-600'}`}>★</span>
            ))}
            {count && <span className="text-xs text-neutral-400 dark:text-neutral-500">({count})</span>}
        </div>
    )
}