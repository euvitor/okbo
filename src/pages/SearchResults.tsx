import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import type { Book } from "../types/book"
import { searchBooks } from "../services/googleBooks"
import type { OrderBy, PrintType, SearchField, SearchFilters } from "../types/search"

export function SearchResults() {
    const [params, setParams] = useSearchParams()
    const query = params.get('query') ?? ''
    const orderBy = params.get('orderBy') as OrderBy ?? 'relevance'
    const field = params.get('field') as SearchField ?? 'all'
    const lang = params.get('lang') as SearchFilters["lang"] ?? undefined
    const printType = params.get('printType') as PrintType ?? undefined
    const filters: SearchFilters = { field, lang, printType }
    const [books, setBooks] = useState<Book[]>([])
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
    }, [query, orderBy, field, lang, printType])

    useEffect(() => {
        console.log(books)
    }, [books])

    if (loading) return <div>Carregando...</div>
    if (!query) return <div>Pesquisa vazia</div>
    if (error) return <div>Erro: {error}</div>
    if (books.length === 0) return <div>Nenhum livro encontrado</div>
    return (
        <>
        </>
    )
}