import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ShareIcon, ShoppingCartIcon } from "lucide-react";
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

  // Trigger used to force the ReadingSessionTimeline to re-fetch data
  // when a mutation happens inside the ShelfManager (Lifting State Up pattern).
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
        setError("Error fetching book details");
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

  // Google Books API often returns descriptions with raw HTML tags.
  // This regex strips them out to ensure clean text rendering in our UI.
  const description = book
    ? book.description?.replace(/<[^>]*>/g, "").trim()
    : null;

  if (loading) return <div className="p-8 text-center text-slate-500">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!book) return <div className="p-8 text-center text-slate-500">Book not found</div>;

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
      alert("Link copied!");
    }
  };

  return (
    <div className="mx-auto max-w-300 px-6 py-8">
      <div className="flex flex-col items-start gap-8 md:flex-row">
        {/* Cover */}
        <div className="w-full shrink-0 md:w-64">
          {book.coverUrl ? (
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-full rounded-2xl object-cover shadow-xl"
            />
          ) : (
            <div className="flex aspect-2/3 items-center justify-center rounded-2xl bg-linear-to-br from-violet-500 to-indigo-600 shadow-xl">
              <span className="text-5xl font-bold text-white">
                {book.title[0]?.toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Book data */}
        <div className="glass flex min-w-0 flex-1 flex-col gap-4 rounded-3xl p-6 shadow-sm">
          <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-start">
            <div>
              <h1 className="font-display text-2xl font-bold leading-tight text-slate-900 dark:text-slate-100">{book.title}</h1>
              {book.subtitle && (
                <p className="mt-1 text-base italic text-slate-500 dark:text-slate-400">
                  {book.subtitle}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <ShelfManager
                bookId={book.id}
                bookTitle={book.title}
                bookCoverUrl={book.coverUrl}
                userId={session?.user?.id}
                onUpdate={() => setRefreshTrigger(prev => prev + 1)}
              />
              <button
                onClick={handleShare}
                className="rounded-full p-2.5 text-slate-500 transition-colors hover:bg-blue-500/10 hover:text-blue-500 dark:text-slate-400 dark:hover:bg-blue-400/10"
                title="Share"
              >
                <ShareIcon className="size-5" />
              </button>
              <a
                href={amazonUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full p-2.5 text-slate-500 transition-colors hover:bg-amber-500/10 hover:text-amber-500 dark:text-slate-400 dark:hover:bg-amber-400/10"
                title="Buy on Amazon"
              >
                <ShoppingCartIcon className="size-5" />
              </a>
            </div>
          </div>

          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {book.authors.join(", ")}
            {year && <span> · {year}</span>}
          </p>

          <StarRating rating={book.averageRating} count={book.ratingsCount} />

          <div className="flex flex-wrap gap-2">
            {book.categories[0] && (
              <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-600 dark:text-violet-400">
                {book.categories[0]}
              </span>
            )}
            {book.pageCount && (
              <span className="rounded-full bg-slate-500/10 px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-400">
                {book.pageCount} pages
              </span>
            )}
          </div>

          {description && (
            <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {description}
            </p>
          )}
        </div>
      </div>

      <ReadingSessionTimeline
        bookId={book.id}
        userId={session?.user?.id}
        refreshTrigger={refreshTrigger}
      />
    </div>
  );
}