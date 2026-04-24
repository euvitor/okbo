export interface Book {
    id: string;
    title: string;
    authors: string[];
    description: string | null;
    converUrl: string | null;
    pageCount: number | null;
    publishedDate: string | null;
    isbn: string | null;
    averageRating: number | null;
}