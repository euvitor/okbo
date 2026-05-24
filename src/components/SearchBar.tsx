import { useState } from "react"
import type { SearchFilters } from "../types/search"
import { useNavigate } from "react-router-dom"
import { ChevronDownIcon, SearchIcon, SlidersHorizontalIcon } from "lucide-react"
import * as Select from '@radix-ui/react-select'

interface SearchBarProps {
    variant?: 'hero' | 'compact'
}

function FilterSelect({ value, onValueChange, placeholder, options }: {
    value: string
    onValueChange: (val: string) => void
    placeholder: string
    options: { value: string, label: string }[]
}) {
    return (
        <Select.Root value={value} onValueChange={onValueChange}>
            <Select.Trigger className="glass flex flex-row items-center w-full gap-1 px-3 py-2 rounded-xl text-sm text-slate-600 outline-none cursor-pointer">
                <Select.Value placeholder={placeholder} />
                <Select.Icon>
                    <ChevronDownIcon className="w-4 h-4 text-slate-400" />
                </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
                <Select.Content className="glass rounded-xl overflow-hidden z-50">
                    <Select.Viewport className="p-1">
                        {options.map(opt => (
                            <Select.Item
                                key={opt.value}
                                value={opt.value}
                                className="px-3 py-1.5 text-sm text-slate-600 rounded-lg cursor-pointer outline-none hover:bg-violet-500/10 data-[state=checked]:text-violet-500"
                            >
                                <Select.ItemText>{opt.label}</Select.ItemText>
                            </Select.Item>
                        ))}
                    </Select.Viewport>
                </Select.Content>
            </Select.Portal>
        </Select.Root>
    )
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
                        <FilterSelect
                            value={filters.lang ?? ''}
                            onValueChange={(val) => setFilters({ ...filters, lang: val === '' ? undefined : val as 'pt' | 'en' })}
                            placeholder="Languages"
                            options={[{ value: 'pt', label: 'Português' }, { value: 'en', label: 'English' }]}
                        />
                        <FilterSelect
                            value={filters.genre ?? ''}
                            onValueChange={(val) => setFilters({ ...filters, genre: val === '' ? undefined : val })}
                            placeholder="Genres"
                            options={[...GENRE_OPTIONS]}
                        />
                    </div>
                </div>
            )}
        </form>
    )
}