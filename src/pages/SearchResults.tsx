import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import type { Book } from "../types/book"
import { searchBooks } from "../services/googleBooks"
import type { OrderBy, SearchField, SearchFilters } from "../types/search"
import { BookCard } from "../components/BookCard"
import { LayoutGridIcon, ListIcon } from "lucide-react"


export function SearchResults() {
    const [params, _setParams] = useSearchParams()
    const query = params.get('query') ?? ''
    const orderBy = params.get('orderBy') as OrderBy ?? 'relevance'
    const field = params.get('field') as SearchField ?? 'all'
    const lang = params.get('lang') as SearchFilters["lang"] ?? undefined
    const filters: SearchFilters = { field, lang }
    const [books, setBooks] = useState<Book[]>([])
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)


    const fetchBooks = async () => {
        setLoading(true)
        if (!query) {
            setBooks([])
            setLoading(false)
            return
        }
        try {
            const books = await searchBooks(query, filters, orderBy)
            setError(null)
            setBooks(books)
        } catch (error) {
            console.error(error)
            setError("Erro ao buscar livros")
        } finally {
            setLoading(false)
        }
    }
    useEffect(() => {
        fetchBooks()
    }, [query, orderBy, field, lang])

    if (loading) return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 px-6 mt-4">
            {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2 animate-pulse">
                    <div className="aspect-[2/3] rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
                    <div className="h-3 rounded-full bg-neutral-200 dark:bg-neutral-800 w-3/4" />
                    <div className="h-3 rounded-full bg-neutral-200 dark:bg-neutral-800 w-1/2" />
                </div>
            ))}
        </div>
    )
    if (!query) return <div>Pesquisa vazia</div>
    if (error) return <div>Erro: {error}</div>
    if (books.length === 0) return <div>Nenhum livro encontrado</div>
    return (
        <>
            <div className="glass flex gap-2 p-1 mb-4 rounded-full w-fit ml-auto mr-6">
                <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-full transition-all ${viewMode === 'grid' ? 'bg-violet-500 text-white' : 'text-neutral-400 hover:bg-violet-500/10 hover:text-violet-500'}`}
                >
                    <LayoutGridIcon className="size-4" />
                </button>
                <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-full transition-all ${viewMode === 'list' ? 'bg-violet-500 text-white' : 'text-neutral-400 hover:bg-violet-500/10 hover:text-violet-500'}`}
                >
                    <ListIcon className="size-4" />
                </button>
            </div>

            <div className={viewMode === 'grid'
                ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 px-6'
                : 'flex flex-col gap-3 px-6'}>
                {books.map(book => <BookCard key={book.id} book={book} viewMode={viewMode} />)}
            </div>
        </>
    )
}