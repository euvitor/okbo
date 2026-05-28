import { useParams } from "react-router-dom";
import type { Book } from "../types/book";
import { useEffect, useState } from "react";
import { getBookById } from "../services/googleBooks";
import { ShareIcon, ShoppingCartIcon } from "lucide-react"
import { StarRating } from "../components/StarRating"

export function BookDetails() {
    const { id } = useParams()
    const [book, setBook] = useState<Book | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const AMAZON_AFFILIATE_TAG = 'euvitordev-20'


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

    const amazonUrl = book ? `https://www.amazon.com.br/s?k=${encodeURIComponent(book.title)}&tag=${AMAZON_AFFILIATE_TAG}` : ''
    const year = book ? book.publishedDate?.slice(0, 4) : null
    const description = book ? book.description?.replace(/<[^>]*>/g, '').trim() : null



    if (loading) return <div>Carregando...</div>
    if (error) return <div>Erro: {error}</div>
    if (!book) return <div>Livro não encontrado</div>

    const handleShare = async () => {
        const shareData = {
            title: book.title,
            text: `${book.title} — ${book.authors.join(', ')}`,
            url: window.location.href,
        }
        if (navigator.share) {
            await navigator.share(shareData)
        } else {
            await navigator.clipboard.writeText(window.location.href)
            alert('Link copiado!')
        }
    }

    return (
        <div className="max-w-[1200px] mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Capa */}
                <div className="shrink-0 w-full md:w-64">
                    {book.coverUrl
                        ? <img src={book.coverUrl} alt={book.title} className="w-full rounded-2xl shadow-xl object-cover" />
                        : <div className="aspect-2/3 rounded-2xl bg-linear-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                            <span className="text-white text-5xl font-bold">{book.title[0]?.toUpperCase()}</span>
                        </div>
                    }
                </div>
                {/* Dados — coluna direita com glass */}
                <div className="glass rounded-3xl p-6 flex flex-col gap-4 min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold leading-tight">{book.title}</h1>
                            {book.subtitle && (
                                <p className="text-base text-neutral-500 dark:text-neutral-400 italic mt-1">
                                    {book.subtitle}
                                </p>
                            )}
                        </div>
                        <div className="flex gap-2 shrink-0">
                            <button
                                onClick={handleShare}
                                className=" p-2.5 rounded-full text-slate-500 dark:text-slate-400 hover:text-violet-500 dark:hover:text-violet-400 transition-colors"
                                title="Compartilhar"
                            >
                                <ShareIcon className="size-5" />
                            </button>
                            <a
                                href={amazonUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className=" p-2.5 rounded-full text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                                title="Comprar na Amazon"
                            >
                                <ShoppingCartIcon className="size-5" />
                            </a>
                        </div>
                    </div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {book.authors.join(', ')}
                        {year && <span> · {year}</span>}
                    </p>
                    <StarRating rating={book.averageRating} count={book.ratingsCount} />
                    <div className="flex flex-wrap gap-2">
                        {book.categories[0] && (
                            <span className="text-xs px-3 py-1 rounded-full bg-violet-500/10 text-violet-500">
                                {book.categories[0]}
                            </span>
                        )}
                        {book.pageCount && (
                            <span className="text-xs px-3 py-1 rounded-full bg-neutral-500/10 text-neutral-500 dark:text-neutral-400">
                                {book.pageCount} páginas
                            </span>
                        )}
                    </div>
                    {book.description && (
                        <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                            {description}
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}