import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { Book } from "../types/book";
import { searchBooks } from "../services/googleBooks";
import type { OrderBy, SearchField, SearchFilters } from "../types/search";
import { BookCard } from "../components/BookCard";
import { LayoutGridIcon, ListIcon, LoaderCircleIcon } from "lucide-react";

/* Skeleton for a single book card in grid mode */
function BookSkeleton() {
  return (
    <div className="flex flex-col gap-2.5 animate-pulse">
      <div
        className="aspect-[2/3] rounded-2xl"
        style={{ background: "var(--color-paper-sunken)" }}
      />
      <div className="flex flex-col gap-1.5 px-0.5">
        <div className="h-3 w-3/4 rounded-full" style={{ background: "var(--color-paper-sunken)" }} />
        <div className="h-2.5 w-1/2 rounded-full" style={{ background: "var(--color-paper-sunken)" }} />
      </div>
    </div>
  );
}

export function SearchResults() {
  const [params] = useSearchParams();
  const query = params.get("query") ?? "";
  const orderBy = (params.get("orderBy") as OrderBy) ?? "relevance";
  const field = (params.get("field") as SearchField) ?? "all";
  const lang = (params.get("lang") as SearchFilters["lang"]) ?? undefined;
  const filters: SearchFilters = { field, lang };

  const [books, setBooks] = useState<Book[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startIndex, setStartIndex] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    if (!query) {
      setBooks([]);
      setTotalItems(0);
      setStartIndex(0);
      return;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    setLoading(true);
    setStartIndex(0);

    searchBooks(query, filters, orderBy, 0, signal)
      .then(({ books, totalItems }) => {
        setBooks(books);
        setTotalItems(totalItems);
        setError(null);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        console.error(err);
        setError("Erro ao buscar livros");
      })
      .finally(() => {
        if (!signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [query, orderBy, field, lang]);

  const handleLoadMore = async () => {
    const nextIndex = startIndex + 20;
    setLoadingMore(true);
    try {
      const { books: newBooks } = await searchBooks(query, filters, orderBy, nextIndex);
      setBooks((prev) => [...prev, ...newBooks]);
      setStartIndex(nextIndex);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

  /* ── States ── */
  if (loading) {
    return (
      <div className="mt-6 grid grid-cols-2 gap-3.5 px-2 sm:gap-6 sm:px-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => <BookSkeleton key={i} />)}
      </div>
    );
  }

  if (!query) {
    return (
      <div className="flex flex-col items-center gap-3.5 py-24 px-4 text-center">
        <p className="text-5xl" role="img" aria-label="search">🔍</p>
        <p className="text-base" style={{ color: "var(--color-ink-muted)" }}>
          Type something to search for books.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3.5 py-24 px-4 text-center">
        <p className="text-base" style={{ color: "var(--color-ink-muted)" }}>{error}</p>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3.5 py-24 px-4 text-center">
        <p className="text-5xl" role="img" aria-label="empty">📭</p>
        <p className="text-base" style={{ color: "var(--color-ink-muted)" }}>
          No books found for <span className="font-medium" style={{ color: "var(--color-ink)" }}>"{query}"</span>.
        </p>
      </div>
    );
  }

  /* ── Results ── */
  return (
    <>
      {/* Header bar */}
      <div className="mb-5 sm:mb-6 flex items-center justify-between px-2 sm:px-6">
        <p className="text-sm sm:text-base truncate pr-2" style={{ color: "var(--color-ink-muted)" }}>
          {totalItems.toLocaleString()} result{totalItems !== 1 ? "s" : ""} for{" "}
          <span className="font-semibold" style={{ color: "var(--color-ink)" }}>
            "{query}"
          </span>
        </p>

        {/* View toggle */}
        <div className="glass flex gap-1 rounded-full p-1 shadow-sm shrink-0">
          <button
            onClick={() => setViewMode("grid")}
            aria-label="Grid view"
            className={`rounded-full p-2 sm:p-2.5 transition-all duration-150 ${viewMode === "grid" ? "text-white" : "hover:bg-black/5 dark:hover:bg-white/8"
              }`}
            style={{
              background: viewMode === "grid" ? "var(--color-accent)" : "transparent",
              color: viewMode === "grid" ? "white" : "var(--color-ink-muted)",
            }}
          >
            <LayoutGridIcon className="size-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            aria-label="List view"
            className={`rounded-full p-2 sm:p-2.5 transition-all duration-150`}
            style={{
              background: viewMode === "list" ? "var(--color-accent)" : "transparent",
              color: viewMode === "list" ? "white" : "var(--color-ink-muted)",
            }}
          >
            <ListIcon className="size-4" />
          </button>
        </div>
      </div>

      {/* Book grid / list */}
      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-2 gap-3.5 px-2 sm:gap-6 sm:px-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
            : "flex flex-col gap-3.5 px-2 sm:gap-4 sm:px-6"
        }
      >
        {books.map((book) => (
          <BookCard key={book.id} book={book} viewMode={viewMode} />
        ))}
      </div>

      {/* Load more */}
      {books.length < totalItems && (
        <div className="mt-12 mb-8 flex justify-center">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="glass flex items-center gap-2.5 rounded-full px-8 py-3 text-base sm:text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 active:translate-y-0"
            style={{ color: "var(--color-ink-muted)" }}
          >
            {loadingMore ? (
              <>
                <LoaderCircleIcon className="size-4.5 animate-spin" />
                Loading…
              </>
            ) : (
              "Load more"
            )}
          </button>
        </div>
      )}
    </>
  );
}
