import { useNavigate } from "react-router-dom"
import type { Book } from "../types/book"

interface BookProps {
    book: Book
    viewMode: 'list' | 'grid'
}

export function BookCard({ book, viewMode }: BookProps) {
    const navigate = useNavigate()
    const handleClick = () => {
        navigate(`/book/${book.id}`, { state: { book } })
    }
    return (
        <div onClick={handleClick}
            className={`cursor-pointer ${viewMode === 'grid' ? 'flex flex-col gap-2' : 'flex flex-row gap-2'}`}>
            {book.coverUrl
                ? <img src={book.coverUrl} alt={book.title} className="w-24 h-24 object-cover rounded-md" />
                : <div className="w-24 h-24 bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center rounded-md">
                    <span className="text-neutral-400 dark:text-neutral-500 text-xs">No cover</span>
                </div>
            }
            <div className="flex flex-col gap-1">
                <h3 className="text-base font-bold">{book.title}</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{book.authors.join(', ')}</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{book.averageRating ? `${book.averageRating} ⭐` : '--'}</p>
                <p className="text-xs text-neutral-400 dark:text-neutral-500">{book.categories.join(', ') || '--'}</p>
            </div>
        </div>
    )
}