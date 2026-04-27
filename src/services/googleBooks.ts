import type { Book } from "../types/book";
import type { GoogleBooksResponse, GoogleBooksVolume } from "../types/googleBooks";
import type { OrderBy, SearchFilters } from "../types/search";

export function adaptGoogleBook(item: GoogleBooksVolume): Book {
    const volumeInfo = item.volumeInfo;

    const isbn = volumeInfo?.industryIdentifiers?.find(
        (identifier) => identifier.type === "ISBN_13" || identifier.type === "ISBN_10"
    )?.identifier ?? null;

    return {
        id: item.id,
        title: volumeInfo?.title ?? 'Título desconhecido',
        authors: volumeInfo?.authors ?? [],
        description: volumeInfo?.description ?? null,
        coverUrl: volumeInfo?.imageLinks?.thumbnail ?? null,
        pageCount: volumeInfo?.pageCount ?? null,
        publishedDate: volumeInfo?.publishedDate ?? null,
        isbn,
        categories: volumeInfo?.categories ?? [],
        averageRating: volumeInfo?.averageRating ?? null
    }
}

function buildQuery(query: string, field: SearchFilters["field"]): string {
    if (field === "title") return `intitle:${query}`
    if (field === "author") return `inauthor:${query}`
    if (field === "isbn") return `isbn:${query}`
    if (field === "subject") return `subject:${query}`
    return query // field === "all"
}

export async function searchBooks(query: string, filters: SearchFilters, orderBy?: OrderBy): Promise<Book[]> {
    const apiKey = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY

    if (!apiKey || typeof apiKey !== 'string') {
        throw new Error('Defina VITE_GOOGLE_BOOKS_API_KEY no .env')
    }

    const params = new URLSearchParams({
        q: buildQuery(query, filters.field),
        key: apiKey,
        printType: filters.printType ?? 'books',
        orderBy: orderBy ?? 'relevance',
        ...(filters.lang ? { lang: filters.lang } : {}),
    })

    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?${params.toString()}`)

    if (!response.ok) throw new Error("Erro ao buscar livros")

    const data: GoogleBooksResponse = await response.json()

    return (data.items ?? []).map(adaptGoogleBook)
}