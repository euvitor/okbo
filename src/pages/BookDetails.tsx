import { Link, useLocation, useParams } from "react-router-dom";
import type { Book } from "../types/book";
import { useEffect, useState } from "react";
import { getBookById } from "../services/googleBooks";

export function BookDetails() {
    const { id } = useParams()
    const { state } = useLocation()
    const [book, setBook] = useState<Book | null>(state?.book as Book | null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)


    const fetchBook = async () => {
        setLoading(true)
        try {
            setBook(await getBookById(id ?? ''))
            setError(null)
        } catch (error) {
            console.error(error)
            setError("Erro ao buscar livro")
        } finally {
            setLoading(false)
        }
    }


    useEffect(() => {
        if (book) return
        fetchBook()
    }, [id])

    if (loading) return <div>Carregando...</div>
    if (error) return <div>Erro: {error}</div>
    if (!book) return <div>Livro não encontrado</div>

    return (
        <div className="max-w-3xl mx-auto p-4">
            <Link to="/search" className="text-blue-600 hover:underline mb-4 inline-block">
                &larr; Voltar para busca
            </Link>
            <div className="flex flex-col gap-2">
                <img src={book.coverUrl} alt={book.title} className="w-24 h-24 object-cover" />
                <h1 className="text-2xl font-bold">{book.title}</h1>
                <h3 className="text-lg font-bold">{book.subtitle || ''}</h3>
                <p className="text-sm text-neutral-500">{book.authors.join(', ')}</p>
                <p className="text-sm text-neutral-400">{book.categories.join(', ') || ''}</p>
                <p className="text-sm text-neutral-400">{book.description || ''}</p>
            </div>
        </div>
    )
}