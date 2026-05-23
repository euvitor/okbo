import { useState } from "react"
import type { SearchFilters } from "../types/search"
import { useNavigate } from "react-router-dom"
import { ChevronDownIcon, SearchIcon, SlidersHorizontalIcon } from "lucide-react"

interface SearchBarProps {
    variant?: 'hero' | 'compact'
}

export function SearchBar({ variant }: SearchBarProps) {
    const isHero = variant === 'hero'
    const [query, setQuery] = useState<string>('')
    const [filters, setFilters] = useState<SearchFilters>({ field: 'all' })
    const navigate = useNavigate()
    const FIELD_OPTIONS = [
        { value: 'all', label: 'All' },
        { value: 'title', label: 'Title' },
        { value: 'author', label: 'Author' },
        { value: 'isbn', label: 'ISBN' },
    ] as const
    const GENRE_OPTIONS = [
        { value: 'fiction', label: 'Fiction' },
        { value: 'non-fiction', label: 'Non-fiction' },
        { value: 'mystery', label: 'Mystery' },
        { value: 'romance', label: 'Romance' },
        { value: 'science-fiction', label: 'Science Fiction' },
        { value: 'fantasy', label: 'Fantasy' },
    ] as const
    const submitHandler = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const params = new URLSearchParams()
        params.set('query', query)
        params.set('field', filters.field)
        if (filters.lang) params.set('lang', filters.lang)
        if (filters.genre) params.set('genre', filters.genre)
        navigate(`/search?${params.toString()}`)
    }

    return (
        <form onSubmit={submitHandler}
            className={`${isHero ? 'flex flex-col items-center justify-center' : 'flex flex-row items-center justify-center'} w-2/5 gap-1`}
        >
            <div className="glass flex flex-row gap-2 py-1 px-1 rounded-xl w-full">
                <button type="button"><SlidersHorizontalIcon className="size-8 hover:bg-violet-500/10 text-slate-500 hover:text-violet-500 p-2 rounded-lg transition-all" /></button>
                <input
                    type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search for a book"
                    className="border-none outline-none w-full" />
                <button type="submit"><SearchIcon className="size-8 hover:bg-violet-500/10 text-slate-500 hover:text-violet-500 p-2 rounded-lg transition-all" /></button>
            </div>
            <div className="glass flex flex-col gap-2 py-1 px-1 rounded-xl w-full">
                <div className="flex flex-row gap-2">
                    {FIELD_OPTIONS.map(option => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => setFilters({ ...filters, field: option.value })}
                            className={filters.field === option.value
                                ? 'bg-violet-500 text-white rounded-lg px-3 py-1 text-sm w-full shadow-md'
                                : 'text-slate-500 rounded-lg px-3 py-1 text-sm hover:bg-violet-500/10 w-full'
                            }
                        >{option.label}</button>
                    ))}
                </div>
                <div className="flex flex-row gap-2">
                    <div className="glass flex flex-row items-center gap-1 rounded-xl px-3 py-2 w-full">
                        <select
                            value={filters.lang ?? ''}
                            onChange={(e) => setFilters({ ...filters, lang: e.target.value === '' ? undefined : e.target.value as 'pt' | 'en' })}
                            className="bg-transparent text-sm text-slate-600 outline-none cursor-pointer appearance-none w-full">
                            <option value="">Languages</option>
                            <option value="pt">Português</option>
                            <option value="en">English</option>
                        </select>
                        <ChevronDownIcon className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="glass flex flex-row items-center gap-1 rounded-xl px-3 py-2 w-full">
                        <select
                            value={filters.genre ?? ''}
                            onChange={(e) => setFilters({ ...filters, genre: e.target.value === '' ? undefined : e.target.value })}
                            className="bg-transparent text-sm text-slate-600 outline-none cursor-pointer appearance-none w-full">
                            <option value="">Genres</option>
                            {GENRE_OPTIONS.map(option => (
                                <option value={option.value}>{option.label}</option>
                            ))}
                        </select>
                        <ChevronDownIcon className="w-4 h-4 text-slate-400" />
                    </div>
                </div>
            </div>
        </form>
    )
}