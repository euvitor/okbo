import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ShareIcon, ShoppingCartIcon } from "lucide-react";
import type { Book } from "../types/book";
import { getBookById } from "../services/googleBooks";
import { StarRating } from "../components/StarRating";

export function BookDetails() {
  const { id } = useParams();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const AMAZON_AFFILIATE_TAG = "euvitordev-20";

  const fetchBook = async () => {
    setLoading(true);
    try {
      setBook(await getBookById(id ?? ""));
      setError(null);
    } catch (error) {
      console.error(error);
      setError("Erro ao buscar livro");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (book) return;
    fetchBook();
  }, [id]);

  const amazonUrl = book
    ? `https://www.amazon.com.br/s?k=${encodeURIComponent(book.title)}&tag=${AMAZON_AFFILIATE_TAG}`
    : "";
  const year = book ? book.publishedDate?.slice(0, 4) : null;
  const description = book
    ? book.description?.replace(/<[^>]*>/g, "").trim()
    : null;

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;
  if (!book) return <div>Livro não encontrado</div>;

  const handleShare = async () => {
    const shareData = {
      title: book.title,
      text: `${book.title} — ${book.authors.join(", ")}`,
      url: window.location.href,
    };
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert("Link copiado!");
    }
  };

  return (
    <div className="mx-auto max-w-300 px-6 py-8">
      <div className="flex flex-col items-start gap-8 md:flex-row">
        {/* Capa */}
        <div className="w-full shrink-0 md:w-64">
          {book.coverUrl ? (
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-full rounded-2xl object-cover shadow-xl"
            />
          ) : (
            <div className="flex aspect-2/3 items-center justify-center rounded-2xl bg-linear-to-br from-violet-500 to-indigo-600">
              <span className="text-5xl font-bold text-white">
                {book.title[0]?.toUpperCase()}
              </span>
            </div>
          )}
        </div>
        {/* Dados — coluna direita com glass */}
        <div className="glass flex min-w-0 flex-1 flex-col gap-4 rounded-3xl p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl leading-tight font-bold">{book.title}</h1>
              {book.subtitle && (
                <p className="mt-1 text-base text-neutral-500 italic dark:text-neutral-400">
                  {book.subtitle}
                </p>
              )}
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                onClick={handleShare}
                className="rounded-full p-2.5 text-slate-500 transition-colors hover:text-violet-500 dark:text-slate-400 dark:hover:text-violet-400"
                title="Compartilhar"
              >
                <ShareIcon className="size-5" />
              </button>
              <a
                href={amazonUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full p-2.5 text-slate-500 transition-colors hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400"
                title="Comprar na Amazon"
              >
                <ShoppingCartIcon className="size-5" />
              </a>
            </div>
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {book.authors.join(", ")}
            {year && <span> · {year}</span>}
          </p>
          <StarRating rating={book.averageRating} count={book.ratingsCount} />
          <div className="flex flex-wrap gap-2">
            {book.categories[0] && (
              <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs text-violet-500">
                {book.categories[0]}
              </span>
            )}
            {book.pageCount && (
              <span className="rounded-full bg-neutral-500/10 px-3 py-1 text-xs text-neutral-500 dark:text-neutral-400">
                {book.pageCount} páginas
              </span>
            )}
          </div>
          {book.description && (
            <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
