import { useState } from "react"
import type { SearchFilters } from "../types/search"
import { useNavigate } from "react-router-dom"

interface SearchBarProps {
    variant?: 'hero' | 'compact'
}

export function SearchBar({ variant }: SearchBarProps) {
    const isHero = variant === 'hero'
    const [query, setQuery] = useState<string>('')
    const [filters, setFilters] = useState<SearchFilters>({ field: 'all' })
    const navigate = useNavigate()

    const submitHandler = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const params = new URLSearchParams()
        params.set('query', query)
        params.set('field', filters.field)
        if (filters.lang) params.set('lang', filters.lang)
        if (filters.printType) params.set('printType', filters.printType)

        navigate(`/search?${params.toString()}`)
    }

    return (
        <form onSubmit={submitHandler}
            className={`${isHero ? 'flex flex-col items-center justify-center' : 'flex flex-row items-center justify-center'}`}
        >
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search for a book" />
            <br />
            <select value={filters.field} onChange={(e) => setFilters({ ...filters, field: e.target.value as SearchFilters["field"] })}>
                <option value="all">All Fields</option>
                <option value="title">Title</option>
                <option value="author">Author</option>
                <option value="isbn">ISBN</option>
                <option value="subject">Subject</option>
            </select>
            <select value={filters.lang ?? ''} onChange={(e) => setFilters({ ...filters, lang: e.target.value === '' ? undefined : e.target.value as SearchFilters["lang"] })}>
                <option value="">All Languages</option>
                <option value="pt">Portuguese</option>
                <option value="en">English</option>
            </select>
            <select value={filters.printType ?? 'all'} onChange={(e) => setFilters({ ...filters, printType: e.target.value === 'all' ? undefined : e.target.value as SearchFilters["printType"] })}>
                <option value="all">All Print Types</option>
                <option value="books">Books</option>
                <option value="magazines">Magazines</option>
            </select>
            <br />
            <button type="submit">Search</button>
        </form>
    )
}