import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { Book } from "../types/book";
import { searchBooks } from "../services/googleBooks";
import type { OrderBy, SearchField, SearchFilters } from "../types/search";
import { BookCard } from "../components/BookCard";
import { LayoutGridIcon, ListIcon, LoaderCircleIcon } from "lucide-react";

export function SearchResults() {
  const [params, _setParams] = useSearchParams();
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

  // Busca inicial — reseta tudo
  useEffect(() => {
    if (!query) {
      setBooks([]);
      setTotalItems(0);
      setStartIndex(0);
      return;
    }
    setLoading(true);
    setStartIndex(0);
    searchBooks(query, filters, orderBy, 0)
      .then(({ books, totalItems }) => {
        setBooks(books);
        setTotalItems(totalItems);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError("Erro ao buscar livros");
      })
      .finally(() => setLoading(false));
  }, [query, orderBy, field, lang]);

  const handleLoadMore = async () => {
    const nextIndex = startIndex + 20;
    setLoadingMore(true);
    try {
      const { books: newBooks } = await searchBooks(
        query,
        filters,
        orderBy,
        nextIndex,
      );
      setBooks((prev) => [...prev, ...newBooks]);
      setStartIndex(nextIndex);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading)
    return (
      <div className="mt-4 grid grid-cols-2 gap-4 px-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex animate-pulse flex-col gap-2">
            <div className="aspect-2/3 rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-3 w-3/4 rounded-full bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-3 w-1/2 rounded-full bg-neutral-200 dark:bg-neutral-800" />
          </div>
        ))}
      </div>
    );
  if (!query) return <div>Pesquisa vazia</div>;
  if (error) return <div>Erro: {error}</div>;
  if (books.length === 0) return <div>Nenhum livro encontrado</div>;

  return (
    <>
      <div className="mb-4 flex items-center justify-between px-6">
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {totalItems.toLocaleString()} resultado{totalItems !== 1 ? "s" : ""}{" "}
          para{" "}
          <span className="font-medium text-neutral-900 dark:text-neutral-100">
            "{query}"
          </span>
        </span>
        <div className="glass flex gap-2 rounded-full p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`rounded-full p-2 transition-all ${viewMode === "grid" ? "bg-violet-500 text-white" : "text-neutral-400 hover:bg-violet-500/10 hover:text-violet-500"}`}
          >
            <LayoutGridIcon className="size-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`rounded-full p-2 transition-all ${viewMode === "list" ? "bg-violet-500 text-white" : "text-neutral-400 hover:bg-violet-500/10 hover:text-violet-500"}`}
          >
            <ListIcon className="size-4" />
          </button>
        </div>
      </div>

      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-2 gap-4 px-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
            : "flex flex-col gap-3 px-6"
        }
      >
        {books.map((book) => (
          <BookCard key={book.id} book={book} viewMode={viewMode} />
        ))}
      </div>

      {books.length < totalItems && (
        <div className="mt-8 mb-4 flex justify-center">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="glass flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium text-slate-600 transition-all hover:text-violet-500 disabled:opacity-50 dark:text-slate-300"
          >
            {loadingMore ? (
              <>
                <LoaderCircleIcon className="size-4 animate-spin" />{" "}
                Carregando...
              </>
            ) : (
              "Carregar mais"
            )}
          </button>
        </div>
      )}
    </>
  );
}
