import { useNavigate } from "react-router-dom"
import type { Book } from "../types/book"

interface BookProps {
    book: Book
    viewMode: 'list' | 'grid'
}

export function BookCard({ book, viewMode }: BookProps) {
    const navigate = useNavigate()
    const handleClick = () => {
        navigate(`/book/${book.id}`, {state: {book}})
    }
    return (
        <div onClick={handleClick} className={viewMode === 'grid' ? 'flex flex-col gap-2' : 'flex flex-row gap-2'}>
            {book.coverUrl ? <img src={book.coverUrl} alt={book.title} className="w-24 h-24 object-cover" />
                : <div className="w-24 h-24 bg-neutral-200 flex items-center justify-center rounded-md">
                    <span className="text-neutral-400">No cover</span>
                </div>
            }
            <div className="flex flex-col gap-2">
                <h3 className="text-lg font-bold">{book.title}</h3>
                <p className="text-sm text-neutral-500">{book.authors.join(', ')}</p>
                <p className="text-sm text-neutral-500">{book.averageRating ? `${book.averageRating} ⭐` : '--'}</p>
                <p className="text-sm text-neutral-400">{book.categories.join(', ') || '--'}</p>
            </div>
        </div>
    )
}