import { useState } from "react"
import type { SearchFilters } from "../types/search"
import { useNavigate } from "react-router-dom"
import { ChevronDownIcon, SearchIcon, SlidersHorizontalIcon } from "lucide-react"

interface SearchBarProps {
    variant?: 'hero' | 'compact'
}

export function SearchBar({ variant }: SearchBarProps) {
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

    const isHero = variant === 'hero'

    const [query, setQuery] = useState<string>('')
    const [filters, setFilters] = useState<SearchFilters>({ field: 'all' })
    const [isFiltersOpen, setIsFiltersOpen] = useState<boolean>(false)

    const navigate = useNavigate()

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
            className={`w-2/5 ${isHero ? 'relative' : ''} gap-1`}
        >
            <div className="glass flex flex-row w-full gap-2 px-1 py-1 rounded-xl">
                <button type="button">
                    <SlidersHorizontalIcon
                        onClick={() => setIsFiltersOpen(prev => !prev)}
                        className={`size-8 p-2 text-slate-500 rounded-lg transition-all hover:bg-violet-500/10 hover:text-violet-500 ${isFiltersOpen ? 'bg-violet-500/10 text-violet-500' : ''}`}
                    />
                </button>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for a book"
                    className="w-full border-none outline-none"
                />
                <button type="submit">
                    <SearchIcon className="size-8 p-2 text-slate-500 rounded-lg transition-all hover:bg-violet-500/10 hover:text-violet-500" />
                </button>
            </div>

            {isFiltersOpen && (
                <div className="glass absolute top-full left-0 mt-1 flex flex-col w-full gap-2 px-1 py-1 rounded-xl z-10">
                    <div className="flex flex-row gap-2">
                        {FIELD_OPTIONS.map(option => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => setFilters({ ...filters, field: option.value })}
                                className={filters.field === option.value
                                    ? 'w-full px-3 py-1 text-sm text-white bg-violet-500 rounded-lg shadow-md'
                                    : 'w-full px-3 py-1 text-sm text-slate-500 rounded-lg hover:bg-violet-500/10'
                                }
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex flex-row gap-2">
                        <div className="glass flex flex-row items-center w-full gap-1 px-3 py-2 rounded-xl">
                            <select
                                value={filters.lang ?? ''}
                                onChange={(e) => setFilters({ ...filters, lang: e.target.value === '' ? undefined : e.target.value as 'pt' | 'en' })}
                                className="w-full appearance-none text-sm text-slate-600 bg-transparent outline-none cursor-pointer">
                                <option value="">Languages</option>
                                <option value="pt">Português</option>
                                <option value="en">English</option>
                            </select>
                            <ChevronDownIcon className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="glass flex flex-row items-center w-full gap-1 px-3 py-2 rounded-xl">
                            <select
                                value={filters.genre ?? ''}
                                onChange={(e) => setFilters({ ...filters, genre: e.target.value === '' ? undefined : e.target.value })}
                                className="w-full appearance-none text-sm text-slate-600 bg-transparent outline-none cursor-pointer">
                                <option value="">Genres</option>
                                {GENRE_OPTIONS.map(option => (
                                    <option value={option.value}>{option.label}</option>
                                ))}
                            </select>
                            <ChevronDownIcon className="w-4 h-4 text-slate-400" />
                        </div>
                    </div>
                </div>
            )}
        </form>
    )
}