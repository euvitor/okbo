import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import type { Book } from "../types/book"
import { searchBooks } from "../services/googleBooks"
import type { OrderBy, SearchField, SearchFilters } from "../types/search"
import { BookCard } from "../components/BookCard"

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

    if (loading) return <div>Carregando...</div>
    if (!query) return <div>Pesquisa vazia</div>
    if (error) return <div>Erro: {error}</div>
    if (books.length === 0) return <div>Nenhum livro encontrado</div>
    return (
        <>
            <div>
                <button onClick={() => setViewMode('grid')}>Grid</button>
                <button onClick={() => setViewMode('list')}>List</button>
            </div>

            <div className={viewMode === 'grid' ? 'grid grid-cols-3 gap-4' : 'flex flex-col gap-2'}>
                {books.map(book => <BookCard key={book.id} book={book} viewMode={viewMode} />)}
            </div>
        </>
    )
}