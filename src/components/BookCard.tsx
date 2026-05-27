import { useNavigate } from "react-router-dom"
import type { Book } from "../types/book"
interface BookProps {
    book: Book
    viewMode: 'list' | 'grid'
}
function StarRating({ rating, count }: { rating: number | null; count?: number }) {
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
function CoverFallback({ title }: { title: string }) {
    return (
        <div className="w-full h-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center rounded-2xl">
            <span className="text-white text-3xl font-bold">{title[0]?.toUpperCase()}</span>
        </div>
    )
}
export function BookCard({ book, viewMode }: BookProps) {
    const navigate = useNavigate()
    const handleClick = () => navigate(`/book/${book.id}`, { state: { book } })
    const year = book.publishedDate?.slice(0, 4)
    if (viewMode === 'grid') {
        return (
            <div onClick={handleClick} className="cursor-pointer group flex flex-col gap-2 transition-transform hover:scale-[1.02]">
                <div className="aspect-[2/3] rounded-2xl overflow-hidden shadow-md group-hover:shadow-xl transition-shadow">
                    {book.coverUrl
                        ? <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                        : <CoverFallback title={book.title} />
                    }
                </div>
                <div className="flex flex-col gap-0.5 px-0.5">
                    <h3 className="text-sm font-semibold leading-tight line-clamp-2">{book.title}</h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{book.authors.join(', ')}</p>
                    <StarRating rating={book.averageRating} count={book.ratingsCount} />
                </div>
            </div>
        )
    }
    return (
        <div onClick={handleClick} className="cursor-pointer glass rounded-2xl p-3 flex flex-row gap-3 hover:shadow-xl transition-shadow">
            <div className="w-20 h-28 rounded-xl overflow-hidden shrink-0">
                {book.coverUrl
                    ? <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                    : <CoverFallback title={book.title} />
                }
            </div>
            <div className="flex flex-col gap-1 min-w-0">
                <h3 className="text-base font-semibold leading-tight line-clamp-2">{book.title}</h3>
                {book.subtitle && <p className="text-sm italic text-neutral-500 dark:text-neutral-400 truncate">{book.subtitle}</p>}
                <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">{book.authors.join(', ')}</p>
                {book.categories[0] && (
                    <span className="self-start text-xs px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-500">{book.categories[0]}</span>
                )}
                <div className="flex items-center gap-3 mt-auto">
                    <StarRating rating={book.averageRating} count={book.ratingsCount} />
                    {book.pageCount && <span className="text-xs text-neutral-400">{book.pageCount} p.</span>}
                    {year && <span className="text-xs text-neutral-400">{year}</span>}
                </div>
            </div>
        </div>
    )
}