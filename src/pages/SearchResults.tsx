import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { Book } from "../types/book";
import { searchBooks } from "../services/googleBooks";
import type { OrderBy, SearchField, SearchFilters } from "../types/search";
import { BookCard } from "../components/BookCard";
import { LayoutGridIcon, ListIcon, LoaderCircleIcon, SearchXIcon } from "lucide-react";

/* Skeleton for a single book card in grid mode */
function BookSkeleton() {
  return (
    <div className="glass flex flex-col gap-3 rounded-3xl p-3 animate-pulse">
      <div
        className="aspect-[2/3] rounded-2xl"
        style={{ background: "var(--color-paper-sunken)" }}
      />
      <div className="flex flex-col gap-2 px-1">
        <div className="h-4 w-4/5 rounded-full" style={{ background: "var(--color-paper-sunken)" }} />
        <div className="h-3 w-1/2 rounded-full" style={{ background: "var(--color-paper-sunken)" }} />
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
      <div className="mt-6 grid grid-cols-2 gap-5 px-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => <BookSkeleton key={i} />)}
      </div>
    );
  }

  if (!query) {
    return (
      <div className="glass mx-auto my-12 flex max-w-md flex-col items-center gap-4 rounded-3xl p-10 text-center">
        <span className="text-5xl">📚</span>
        <h3 className="text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
          Pesquisa literária
        </h3>
        <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
          Digite um termo na barra de busca para encontrar livros, autores ou assuntos.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass mx-auto my-12 flex max-w-md flex-col items-center gap-4 rounded-3xl p-10 text-center">
        <span className="text-5xl text-rose-500">⚠️</span>
        <p className="text-sm font-medium text-rose-600 dark:text-rose-400">{error}</p>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="glass mx-auto my-12 flex max-w-md flex-col items-center gap-4 rounded-3xl p-10 text-center">
        <SearchXIcon className="size-12 text-violet-400" />
        <h3 className="text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
          Nenhum resultado encontrado
        </h3>
        <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
          Não encontramos livros para <span className="font-semibold text-violet-600 dark:text-violet-400">"{query}"</span>. Tente outras palavras-chave ou ajuste os filtros.
        </p>
      </div>
    );
  }

  /* ── Results ── */
  return (
    <>
      {/* Header bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 px-2">
        <div className="flex items-center gap-2">
          <span className="text-base font-medium" style={{ color: "var(--color-ink-muted)" }}>
            <span className="font-bold text-violet-600 dark:text-violet-400">{totalItems.toLocaleString()}</span> resultados para{" "}
            <span className="font-bold" style={{ color: "var(--color-ink)" }}>
              "{query}"
            </span>
          </span>
        </div>

        {/* View toggle */}
        <div className="glass-pill flex gap-1 rounded-full p-1 shadow-sm">
          <button
            onClick={() => setViewMode("grid")}
            aria-label="Visualização em Grade"
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
              viewMode === "grid"
                ? "bg-violet-600 text-white shadow-md shadow-violet-500/25"
                : "text-slate-600 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-300"
            }`}
          >
            <LayoutGridIcon className="size-4" />
            <span className="hidden sm:inline">Grade</span>
          </button>

          <button
            onClick={() => setViewMode("list")}
            aria-label="Visualização em Lista"
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
              viewMode === "list"
                ? "bg-violet-600 text-white shadow-md shadow-violet-500/25"
                : "text-slate-600 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-300"
            }`}
          >
            <ListIcon className="size-4" />
            <span className="hidden sm:inline">Lista</span>
          </button>
        </div>
      </div>

      {/* Book Grid / List */}
      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:gap-6"
            : "flex flex-col gap-4"
        }
      >
        {books.map((book) => (
          <BookCard key={book.id} book={book} viewMode={viewMode} />
        ))}
      </div>

      {/* Load More Button */}
      {books.length < totalItems && (
        <div className="mt-12 mb-8 flex justify-center">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="glass-pill flex items-center gap-2.5 rounded-full px-8 py-3 text-sm font-bold text-violet-700 shadow-md transition-all duration-300 hover:scale-105 hover:bg-violet-600 hover:text-white dark:text-violet-300 dark:hover:bg-violet-600 dark:hover:text-white disabled:opacity-50"
          >
            {loadingMore ? (
              <>
                <LoaderCircleIcon className="size-4.5 animate-spin" />
                <span>Carregando livros...</span>
              </>
            ) : (
              <span>Carregar mais livros</span>
            )}
          </button>
        </div>
      )}
    </>
  );
}
