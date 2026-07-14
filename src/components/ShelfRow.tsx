import { BookCard } from "./BookCard";
import type { Book } from "../types/book";

// Represents the joined data structure returned by Supabase (user_books + books).
// Note: In the future, if this interface is shared across multiple files, 
// we should move it to our types/database.type.ts file.
export interface UserBookDetails {
    id: string;
    status: string;
    added_at: string;
    books: {
        id: string;
        title: string;
        cover_url: string | null;
        google_api_id: string;
    };
}

interface ShelfRowProps {
    title: string;
    userBooks: UserBookDetails[];
}

export function ShelfRow({ title, userBooks }: ShelfRowProps) {
    return (
        <section className="flex flex-col gap-3">
            <h4 className="font-display text-lg font-bold text-slate-800 dark:text-slate-100">
                {title} <span className="text-sm font-normal text-slate-400">({userBooks.length})</span>
            </h4>

            {userBooks.length === 0 ? (
                <div className="glass flex h-40 w-full items-center justify-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        No books in this shelf yet.
                    </p>
                </div>
            ) : (
                // CSS Scroll Snap is used here to create a native, mobile-friendly horizontal carousel (Netflix style)
                <div className="flex w-full snap-x snap-mandatory gap-4 overflow-x-auto pb-4 pt-2">
                    {userBooks.map((item) => {
                        // The BookCard component expects a full 'Book' object (from the Google API).
                        // Since our Supabase DB only stores essential fields to optimize storage, 
                        // we hydrate the missing properties with null/empty values to satisfy TypeScript.
                        const adaptedBook: Book = {
                            id: item.books.google_api_id, // Map Google's ID to maintain routing compatibility if the card is clicked
                            title: item.books.title,
                            coverUrl: item.books.cover_url,
                            authors: [],
                            subtitle: null,
                            description: null,
                            pageCount: null,
                            publishedDate: null,
                            isbn: null,
                            categories: [],
                            averageRating: null,
                            ratingsCount: undefined,
                        };

                        return (
                            <div key={item.id} className="min-w-35 max-w-40 snap-start">
                                <BookCard book={adaptedBook} viewMode="grid" />
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}