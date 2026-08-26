import { useNavigate, useLocation } from "react-router-dom";
import type { Book } from "../types/book";
import { StarRating } from "./StarRating";

interface BookProps {
  book: Book;
  viewMode: "list" | "grid";
}

function CoverFallback({ title }: { title: string }) {
  return (
    <div
      className="flex h-full w-full items-center justify-center rounded-2xl"
      style={{
        background: "linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)",
      }}
    >
      <span
        className="text-3xl text-white/90"
        style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
      >
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

  /* ── GRID MODE ── */
  if (viewMode === "grid") {
    return (
      <div
        onClick={handleClick}
        className="group flex cursor-pointer flex-col gap-2.5 transition-transform duration-300 hover:-translate-y-1"
      >
        {/* Cover */}
        <div className="aspect-[2/3] overflow-hidden rounded-2xl shadow-sm transition-shadow duration-300 group-hover:shadow-md">
          {book.coverUrl ? (
            <img
              src={book.coverUrl}
              alt={book.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
          ) : (
            <CoverFallback title={book.title} />
          )}
        </div>

        {/* Meta */}
        <div className="flex flex-col gap-0.5 px-0.5">
          <h3
            className="line-clamp-2 text-sm leading-snug"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              color: "var(--color-ink)",
            }}
          >
            {book.title}
          </h3>
          <p
            className="truncate text-xs"
            style={{ color: "var(--color-ink-muted)" }}
          >
            {book.authors.join(", ")}
          </p>
          <StarRating rating={book.averageRating} count={book.ratingsCount} />
        </div>
      </div>
    );
  }

  /* ── LIST MODE ── */
  return (
    <div
      onClick={handleClick}
      className="glass group flex cursor-pointer flex-row gap-4 rounded-2xl p-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
    >
      {/* Cover */}
      <div className="h-28 w-[4.5rem] shrink-0 overflow-hidden rounded-xl shadow-sm">
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={book.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <CoverFallback title={book.title} />
        )}
      </div>

      {/* Info */}
      <div className="flex min-w-0 flex-col gap-1.5">
        <h3
          className="line-clamp-2 text-base leading-snug"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            color: "var(--color-ink)",
          }}
        >
          {book.title}
        </h3>

        {book.subtitle && (
          <p
            className="line-clamp-1 text-sm italic"
            style={{ color: "var(--color-ink-muted)", fontFamily: "var(--font-display)" }}
          >
            {book.subtitle}
          </p>
        )}

        <p className="truncate text-sm" style={{ color: "var(--color-ink-muted)" }}>
          {book.authors.join(", ")}
        </p>

        {book.categories[0] && (
          <span
            className="self-start rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={{
              background: "var(--color-accent-soft)",
              color: "var(--color-accent-light)",
            }}
          >
            {book.categories[0]}
          </span>
        )}

        <div className="mt-auto flex items-center gap-3">
          <StarRating rating={book.averageRating} count={book.ratingsCount} />
          {book.pageCount && (
            <span className="text-xs" style={{ color: "var(--color-ink-faint)" }}>
              {book.pageCount} p.
            </span>
          )}
          {year && (
            <span className="text-xs" style={{ color: "var(--color-ink-faint)" }}>
              {year}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
