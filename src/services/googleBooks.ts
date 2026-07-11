import type { Book } from "../types/book";
import type {
  GoogleBooksResponse,
  GoogleBooksVolume,
} from "../types/googleBooks";
import type { OrderBy, SearchFilters } from "../types/search";

function buildCoverUrl(
  imageLinks?: NonNullable<GoogleBooksVolume["volumeInfo"]>["imageLinks"],
): string | null {
  if (!imageLinks) return null;
  const raw =
    imageLinks.extraLarge ??
    imageLinks.large ??
    imageLinks.medium ??
    imageLinks.small ??
    imageLinks.thumbnail ??
    imageLinks.smallThumbnail ??
    null;
  if (!raw) return null;
  return raw.replace(/^http:\/\//, "https://");
}

export function adaptGoogleBook(item: GoogleBooksVolume): Book {
  const volumeInfo = item.volumeInfo;

  const isbn =
    volumeInfo?.industryIdentifiers?.find(
      (identifier) =>
        identifier.type === "ISBN_13" || identifier.type === "ISBN_10",
    )?.identifier ?? null;

  return {
    id: item.id,
    title: volumeInfo?.title ?? "Título desconhecido",
    subtitle: volumeInfo?.subtitle ?? null,
    authors: volumeInfo?.authors ?? [],
    description: volumeInfo?.description ?? null,
    coverUrl: buildCoverUrl(volumeInfo?.imageLinks),
    pageCount: volumeInfo?.pageCount ?? null,
    publishedDate: volumeInfo?.publishedDate ?? null,
    isbn,
    categories: volumeInfo?.categories ?? [],
    averageRating: volumeInfo?.averageRating ?? null,
    ratingsCount: volumeInfo?.ratingsCount ?? undefined,
  };
}

function buildQuery(
  query: string,
  field: SearchFilters["field"],
  genre?: string,
): string {
  let q = query;

  if (field === "title") return `intitle:${query}`;
  if (field === "author") return `inauthor:${query}`;
  if (field === "isbn") return `isbn:${query}`;

  if (genre) q += `+subject:${genre}`;
  return q; // field === "all"
}

export async function searchBooks(
  query: string,
  filters: SearchFilters,
  orderBy?: OrderBy,
  startIndex = 0,
  signal?: AbortSignal,
  maxResults = 20,
): Promise<{ books: Book[]; totalItems: number }> {
  const apiKey = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;

  if (!apiKey || typeof apiKey !== "string") {
    throw new Error("Defina VITE_GOOGLE_BOOKS_API_KEY no .env");
  }

  const params = new URLSearchParams({
    q: buildQuery(query, filters.field, filters.genre),
    key: apiKey,
    orderBy: orderBy ?? "relevance",
    startIndex: String(startIndex),
    maxResults: String(maxResults),
    ...(filters.lang ? { lang: filters.lang } : {}),
  });

  const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes?${params.toString()}`,{signal}
  );

  if (!response.ok) throw new Error("Erro ao buscar livros");

  const data: GoogleBooksResponse = await response.json();

  return {
    books: (data.items ?? []).map(adaptGoogleBook),
    totalItems: data.totalItems ?? 0,
  };
}

export async function getBookById(id: string): Promise<Book> {
  const apiKey = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;
  if (!apiKey || typeof apiKey !== "string") {
    throw new Error("Defina VITE_GOOGLE_BOOKS_API_KEY no .env");
  }

  const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes/${id}?key=${apiKey}`,
  );

  if (!response.ok) throw new Error("Erro ao buscar livro");

  const data: GoogleBooksVolume = await response.json();

  return adaptGoogleBook(data);
}
