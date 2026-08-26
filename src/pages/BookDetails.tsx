import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ShareIcon, ShoppingCartIcon, BookOpenIcon, CalendarIcon } from "lucide-react";
import type { Book } from "../types/book";
import { getBookById } from "../services/googleBooks";
import { StarRating } from "../components/StarRating";
import { ShelfManager } from "../components/ShelfManager";
import { useAuth } from "../context/AuthContext";
import { ReadingSessionTimeline } from "../components/ReadingSessionsTimeline";

export function BookDetails() {
  const { session } = useAuth();
  const { id } = useParams();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const AMAZON_AFFILIATE_TAG = "vitordev01-20";

  useEffect(() => {
    async function fetchBook() {
      if (!id) return;
      setLoading(true);
      try {
        setBook(await getBookById(id));
        setError(null);
      } catch (error) {
        console.error(error);
        setError("Erro ao carregar detalhes do livro");
      } finally {
        setLoading(false);
      }
    }
    fetchBook();
  }, [id]);

  const amazonUrl = book
    ? `https://www.amazon.com.br/s?k=${encodeURIComponent(book.title)}&tag=${AMAZON_AFFILIATE_TAG}`
    : "";

  const year = book ? book.publishedDate?.slice(0, 4) : null;

  const description = book
    ? book.description?.replace(/<[^>]*>/g, "").trim()
    : null;

  /* ── States ── */
  if (loading) {
    return (
      <div className="mx-auto max-w-300 px-4 py-16 text-center">
        <div className="glass mx-auto flex max-w-md flex-col items-center gap-4 rounded-3xl p-12">
          <div className="size-10 rounded-full border-3 border-violet-500 border-t-transparent animate-spin" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            Abrindo as páginas do livro...
          </p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="mx-auto max-w-300 px-4 py-16 text-center">
        <div className="glass mx-auto flex max-w-md flex-col items-center gap-4 rounded-3xl p-10">
          <span className="text-4xl text-rose-500">⚠️</span>
          <p className="text-base font-semibold text-rose-600 dark:text-rose-400">{error}</p>
        </div>
      </div>
    );
  }
  if (!book) {
    return (
      <div className="mx-auto max-w-300 px-4 py-16 text-center">
        <div className="glass mx-auto flex max-w-md flex-col items-center gap-4 rounded-3xl p-10">
          <span className="text-4xl">📖</span>
          <p className="text-base font-semibold" style={{ color: "var(--color-ink-muted)" }}>
            Livro não encontrado.
          </p>
        </div>
      </div>
    );
  }

  const iconBtnClass =
    "glass-pill flex size-11 items-center justify-center rounded-full transition-all duration-300 hover:scale-110 active:scale-95 text-slate-700 dark:text-slate-200";

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
      alert("Link copiado para a área de transferência!");
    }
  };

  return (
    <div className="mx-auto max-w-300 px-4 py-8 sm:px-6">
      <div className="flex flex-col items-center gap-10 md:flex-row md:items-start">

        {/* ── Book Cover with Floating Aura ── */}
        <div className="relative w-full max-w-65 shrink-0 sm:max-w-72">
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-violet-600/30 via-rose-500/20 to-amber-400/20 blur-xl opacity-70 -z-10" />
          {book.coverUrl ? (
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-full rounded-3xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10"
            />
          ) : (
            <div
              className="flex aspect-[2/3] w-full items-center justify-center rounded-3xl shadow-2xl"
              style={{
                background: "linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)",
              }}
            >
              <span
                className="text-6xl text-white font-bold drop-shadow-lg"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {book.title[0]?.toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* ── Book Details Glass Card ── */}
        <div className="glass flex min-w-0 flex-1 flex-col gap-6 rounded-[32px] p-6 sm:p-8 md:p-10 shadow-xl">

          {/* Header Row: Title & Quick Actions */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col gap-2">
              <h1
                className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--color-ink)",
                }}
              >
                {book.title}
              </h1>

              {book.subtitle && (
                <p
                  className="text-lg italic leading-snug font-medium text-slate-500 dark:text-slate-400"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {book.subtitle}
                </p>
              )}

              <p className="text-base font-semibold text-violet-700 dark:text-violet-300">
                {book.authors.length > 0 ? book.authors.join(", ") : "Autor desconhecido"}
              </p>
            </div>

            {/* Action Bar */}
            <div className="flex shrink-0 items-center gap-2 pt-1">
              <ShelfManager
                bookId={book.id}
                bookTitle={book.title}
                bookCoverUrl={book.coverUrl}
                userId={session?.user?.id}
                onUpdate={() => setRefreshTrigger((prev) => prev + 1)}
              />
              <button
                onClick={handleShare}
                className={iconBtnClass}
                title="Compartilhar livro"
              >
                <ShareIcon className="size-5 text-sky-500" />
              </button>
              <a
                href={amazonUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={iconBtnClass}
                title="Comprar na Amazon"
              >
                <ShoppingCartIcon className="size-5 text-amber-500" />
              </a>
            </div>
          </div>

          {/* Rating & Metadata Badges */}
          <div className="flex flex-wrap items-center gap-4 py-1 border-y border-slate-200/60 dark:border-white/10">
            <StarRating rating={book.averageRating} count={book.ratingsCount} />

            <div className="flex flex-wrap gap-2">
              {book.categories[0] && (
                <span className="rounded-full bg-violet-500/15 border border-violet-500/20 px-3.5 py-1 text-xs font-bold text-violet-700 dark:text-violet-300">
                  {book.categories[0]}
                </span>
              )}

              {book.pageCount && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-500/10 border border-slate-500/15 px-3.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <BookOpenIcon className="size-3.5" />
                  {book.pageCount} páginas
                </span>
              )}

              {year && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-500/10 border border-slate-500/15 px-3.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <CalendarIcon className="size-3.5" />
                  {year}
                </span>
              )}
            </div>
          </div>

          {/* Sinopse / Description */}
          {description && (
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Sinopse
              </h3>
              <p
                className="text-base leading-relaxed font-normal text-slate-700 dark:text-slate-200"
              >
                {description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Reading Sessions Timeline */}
      <div className="mt-8">
        <ReadingSessionTimeline
          bookId={book.id}
          userId={session?.user?.id}
          refreshTrigger={refreshTrigger}
        />
      </div>
    </div>
  );
}