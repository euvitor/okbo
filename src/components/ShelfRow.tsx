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
    <section className="flex flex-col gap-3.5">
      {/* Section header */}
      <div className="flex items-baseline gap-2.5">
        <h4
          className="text-xl font-bold"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
        >
          {title}
        </h4>
        <span className="text-base font-medium" style={{ color: "var(--color-ink-faint)" }}>
          {userBooks.length}
        </span>
      </div>

      {userBooks.length === 0 ? (
        /* Empty state */
        <div
          className="flex h-36 w-full items-center justify-center rounded-2xl border border-dashed"
          style={{ borderColor: "var(--color-border-mid)" }}
        >
          <p className="text-base" style={{ color: "var(--color-ink-faint)" }}>
            No books here yet.
          </p>
        </div>
      ) : (
        /* CSS Scroll Snap horizontal carousel */
        <div className="flex w-full snap-x snap-mandatory gap-5 overflow-x-auto pb-4 pt-1">
          {userBooks.map((item) => {
            // Hydrate minimal Supabase data into the full Book interface
            const adaptedBook: Book = {
              id: item.books.google_api_id,
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
              <div key={item.id} className="min-w-40 max-w-48 snap-start">
                <BookCard book={adaptedBook} viewMode="grid" />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}