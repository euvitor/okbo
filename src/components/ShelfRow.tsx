import { BookCard } from "./BookCard";
import type { Book } from "../types/book";
import { BookPlus } from "lucide-react";
import { Link } from "react-router-dom";

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
  icon?: string;
  badgeColor?: string;
  userBooks: UserBookDetails[];
}

export function ShelfRow({ title, icon, badgeColor = "bg-violet-500/10 text-violet-600 border-violet-500/20", userBooks }: ShelfRowProps) {
  return (
    <section className="flex flex-col gap-4">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          {icon && <span className="text-xl">{icon}</span>}
          <h3
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
          >
            {title}
          </h3>
          <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${badgeColor}`}>
            {userBooks.length}
          </span>
        </div>
      </div>

      {userBooks.length === 0 ? (
        /* Empty State */
        <div className="glass flex flex-col items-center justify-center gap-2.5 rounded-3xl border-2 border-dashed border-slate-300/80 p-8 text-center dark:border-white/10">
          <BookPlus className="size-8 text-slate-400 dark:text-slate-500" />
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Nenhum livro nesta estante ainda.
          </p>
          <Link
            to="/"
            className="text-xs font-bold text-violet-600 hover:underline dark:text-violet-400"
          >
            Pesquisar e adicionar livros →
          </Link>
        </div>
      ) : (
        /* Horizontal Scroll Carousel */
        <div className="flex w-full snap-x snap-mandatory gap-5 overflow-x-auto pb-4 pt-1 px-1 scroll-smooth">
          {userBooks.map((item) => {
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
              <div key={item.id} className="min-w-44 max-w-48 snap-start shrink-0">
                <BookCard book={adaptedBook} viewMode="grid" />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}