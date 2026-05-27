export interface Book {
    id: string;
    title: string;
    subtitle: string | null;
    authors: string[];
    description: string | null;
    coverUrl: string | null;
    pageCount: number | null;
    publishedDate: string | null;
    isbn: string | null;
    categories: string[];
    averageRating: number | null;
    ratingsCount?: number;
}