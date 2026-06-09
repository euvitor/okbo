import { useNavigate, useLocation } from "react-router-dom";
import type { Book } from "../types/book";
import { StarRating } from "./StarRating";
interface BookProps {
  book: Book;
  viewMode: "list" | "grid";
}

function CoverFallback({ title }: { title: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-2xl bg-linear-to-br from-violet-500 to-indigo-600">
      <span className="text-3xl font-bold text-white">
        {title[0]?.toUpperCase()}
      </span>
    </div>
  );
}
export function BookCard({ book, viewMode }: BookProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const handleClick = () =>
    navigate(`/book/${book.id}`, {
      state: { book, backUrl: location.pathname + location.search },
    });
  const year = book.publishedDate?.slice(0, 4);
  if (viewMode === "grid") {
    return (
      <div
        onClick={handleClick}
        className="group flex cursor-pointer flex-col gap-2 transition-transform hover:scale-[1.02]"
      >
        <div className="aspect-2/3 overflow-hidden rounded-2xl shadow-md transition-shadow group-hover:shadow-xl">
          {book.coverUrl ? (
            <img
              src={book.coverUrl}
              alt={book.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <CoverFallback title={book.title} />
          )}
        </div>
        <div className="flex flex-col gap-0.5 px-0.5">
          <h3 className="line-clamp-2 text-sm leading-tight font-semibold">
            {book.title}
          </h3>
          <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
            {book.authors.join(", ")}
          </p>
          <StarRating rating={book.averageRating} count={book.ratingsCount} />
        </div>
      </div>
    );
  }
  return (
    <div
      onClick={handleClick}
      className="glass flex cursor-pointer flex-row gap-3 rounded-2xl p-3 transition-shadow hover:shadow-xl"
    >
      <div className="h-28 w-20 shrink-0 overflow-hidden rounded-xl">
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={book.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <CoverFallback title={book.title} />
        )}
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        <h3 className="line-clamp-2 text-base leading-tight font-semibold">
          {book.title}
        </h3>
        {book.subtitle && (
          <p className="truncate text-sm text-neutral-500 italic dark:text-neutral-400">
            {book.subtitle}
          </p>
        )}
        <p className="truncate text-sm text-neutral-500 dark:text-neutral-400">
          {book.authors.join(", ")}
        </p>
        {book.categories[0] && (
          <span className="self-start rounded-full bg-violet-500/10 px-2 py-0.5 text-xs text-violet-500">
            {book.categories[0]}
          </span>
        )}
        <div className="mt-auto flex items-center gap-3">
          <StarRating rating={book.averageRating} count={book.ratingsCount} />
          {book.pageCount && (
            <span className="text-xs text-neutral-400">
              {book.pageCount} p.
            </span>
          )}
          {year && <span className="text-xs text-neutral-400">{year}</span>}
        </div>
      </div>
    </div>
  );
}
