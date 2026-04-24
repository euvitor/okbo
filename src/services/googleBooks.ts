import type { Book } from "../types/book";
import type { GoogleBooksResponse, GoogleBooksVolume } from "../types/googleBooks";

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

export async function searchBooks(query: string): Promise<Book[]> {
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`)

    if (!response.ok) throw new Error("Erro ao buscar livros")

    const data: GoogleBooksResponse = await response.json()

    return (data.items ?? []).map(adaptGoogleBook)
}