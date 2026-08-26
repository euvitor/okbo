import { useNavigate, useLocation } from "react-router-dom";
import type { Book } from "../types/book";
import { StarRating } from "./StarRating";
import { BookOpen } from "lucide-react";

interface BookProps {
  book: Book;
  viewMode: "list" | "grid";
}

function getCategoryColor(category?: string) {
  if (!category) return "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20";
  const cat = category.toLowerCase();
  if (cat.includes("fiction") || cat.includes("ficção") || cat.includes("romance") || cat.includes("poet")) {
    return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
  }
  if (cat.includes("sci") || cat.includes("tech") || cat.includes("comput") || cat.includes("fant")) {
    return "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20";
  }
  if (cat.includes("hist") || cat.includes("biog") || cat.includes("philos") || cat.includes("art")) {
    return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
  }
  if (cat.includes("business") || cat.includes("econ") || cat.includes("self") || cat.includes("health")) {
    return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
  }
  return "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20";
}

function CoverFallback({ title }: { title: string }) {
  return (
    <div
      className="relative flex h-full w-full items-center justify-center rounded-2xl overflow-hidden shadow-inner"
      style={{
        background: "linear-gradient(135deg, #8B5CF6 0%, #6366F1 50%, #4338CA 100%)",
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.3),transparent_70%)]" />
      <span
        className="text-4xl text-white font-bold drop-shadow-md"
        style={{ fontFamily: "var(--font-display)" }}
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
  const category = book.categories[0];
  const categoryStyle = getCategoryColor(category);

  /* ── GRID MODE ── */
  if (viewMode === "grid") {
    return (
      <div
        onClick={handleClick}
        className="group relative flex cursor-pointer flex-col gap-3 rounded-3xl p-2.5 transition-all duration-300 hover:-translate-y-2 hover:bg-white/40 dark:hover:bg-neutral-800/30"
      >
        {/* Book Cover with Ambient Shadow Reflection */}
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl shadow-md transition-all duration-300 group-hover:shadow-[0_20px_40px_-12px_rgba(124,58,237,0.3)] group-hover:ring-2 group-hover:ring-violet-500/30">
          {book.coverUrl ? (
            <img
              src={book.coverUrl}
              alt={book.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <CoverFallback title={book.title} />
          )}

          {/* Floating Category Badge in Grid */}
          {category && (
            <div className="absolute top-2.5 right-2.5 max-w-[85%] truncate rounded-full border px-2.5 py-0.5 text-[11px] font-bold backdrop-blur-md shadow-sm transition-transform duration-300 group-hover:scale-105"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.85)",
                color: "#4C1D95",
                borderColor: "rgba(124, 58, 237, 0.2)"
              }}
            >
              {category}
            </div>
          )}
        </div>

        {/* Book Meta */}
        <div className="flex flex-col gap-1 px-1">
          <h3
            className="line-clamp-2 text-base font-semibold leading-snug tracking-tight transition-colors duration-200 group-hover:text-violet-600 dark:group-hover:text-violet-400"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-ink)",
            }}
          >
            {book.title}
          </h3>

          <p
            className="truncate text-sm font-medium text-slate-500 dark:text-slate-400"
          >
            {book.authors.length > 0 ? book.authors.join(", ") : "Autor desconhecido"}
          </p>

          <div className="mt-1 flex items-center justify-between">
            <StarRating rating={book.averageRating} count={book.ratingsCount} />
            {year && (
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                {year}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ── LIST MODE ── */
  return (
    <div
      onClick={handleClick}
      className="glass group flex cursor-pointer flex-row gap-5 rounded-3xl p-4 sm:p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_-8px_rgba(124,58,237,0.18)] hover:border-violet-500/30"
    >
      {/* Cover */}
      <div className="relative h-36 w-24 shrink-0 overflow-hidden rounded-2xl shadow-md transition-transform duration-300 group-hover:scale-105">
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={book.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <CoverFallback title={book.title} />
        )}
      </div>

      {/* Info */}
      <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3
              className="line-clamp-2 text-lg font-semibold leading-snug transition-colors duration-200 group-hover:text-violet-600 dark:group-hover:text-violet-400"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-ink)",
              }}
            >
              {book.title}
            </h3>

            {category && (
              <span
                className={`rounded-full border px-3 py-0.5 text-xs font-bold ${categoryStyle}`}
              >
                {category}
              </span>
            )}
          </div>

          {book.subtitle && (
            <p
              className="line-clamp-1 text-sm italic font-medium"
              style={{ color: "var(--color-ink-muted)", fontFamily: "var(--font-display)" }}
            >
              {book.subtitle}
            </p>
          )}

          <p className="truncate text-sm font-medium text-slate-600 dark:text-slate-300">
            {book.authors.length > 0 ? book.authors.join(", ") : "Autor desconhecido"}
          </p>
        </div>

        {/* Footer Meta */}
        <div className="mt-3 flex flex-wrap items-center gap-4 pt-2 border-t border-slate-200/60 dark:border-white/5">
          <StarRating rating={book.averageRating} count={book.ratingsCount} />
          
          {book.pageCount && (
            <span className="flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <BookOpen className="size-3.5" />
              {book.pageCount} páginas
            </span>
          )}

          {year && (
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
              Publicado em {year}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
