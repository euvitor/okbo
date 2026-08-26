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

  const description = book
    ? book.description?.replace(/<[^>]*>/g, "").trim()
    : null;

  /* ── States ── */
  if (loading) {
    return (
      <div
        className="p-8 text-center text-sm animate-pulse"
        style={{ color: "var(--color-ink-muted)" }}
      >
        Loading…
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-8 text-center text-sm" style={{ color: "var(--color-ink-muted)" }}>
        {error}
      </div>
    );
  }
  if (!book) {
    return (
      <div className="p-8 text-center text-sm" style={{ color: "var(--color-ink-muted)" }}>
        Book not found.
      </div>
    );
  }

  /* Shared icon button style */
  const iconBtnClass =
    "flex size-9 items-center justify-center rounded-full transition-all duration-200 hover:bg-black/6 dark:hover:bg-white/8 active:scale-95";

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

        {/* ── Cover ── */}
        <div className="w-full shrink-0 md:w-56">
          {book.coverUrl ? (
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-full rounded-2xl shadow-md"
              style={{ boxShadow: "var(--shadow-editorial-md)" }}
            />
          ) : (
            <div
              className="flex aspect-[2/3] items-center justify-center rounded-2xl"
              style={{
                background: "linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)",
                boxShadow: "var(--shadow-editorial-md)",
              }}
            >
              <span
                className="text-5xl text-white/90"
                style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
              >
                {book.title[0]?.toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* ── Book details panel ── */}
        <div className="glass flex min-w-0 flex-1 flex-col gap-5 rounded-3xl p-7">

          {/* Title + Actions */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col gap-1">
              <h1
                className="text-3xl leading-tight"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                  color: "var(--color-ink)",
                }}
              >
                {book.title}
              </h1>
              {book.subtitle && (
                <p
                  className="text-base italic leading-snug"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "var(--color-ink-muted)",
                  }}
                >
                  {book.subtitle}
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex shrink-0 items-center gap-1">
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
                title="Share"
                style={{ color: "var(--color-ink-muted)" }}
              >
                <ShareIcon className="size-4" />
              </button>
              <a
                href={amazonUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={iconBtnClass}
                title="Buy on Amazon"
                style={{ color: "var(--color-ink-muted)" }}
              >
                <ShoppingCartIcon className="size-4" />
              </a>
            </div>
          </div>

          {/* Author & year */}
          <p className="text-sm font-medium" style={{ color: "var(--color-ink-muted)" }}>
            {book.authors.join(", ")}
            {year && <span> · {year}</span>}
          </p>

          {/* Rating */}
          <StarRating rating={book.averageRating} count={book.ratingsCount} />

          {/* Metadata pills */}
          <div className="flex flex-wrap gap-2">
            {book.categories[0] && (
              <span
                className="rounded-full px-3 py-1 text-xs font-medium"
                style={{
                  background: "var(--color-accent-soft)",
                  color: "var(--color-accent-light)",
                }}
              >
                {book.categories[0]}
              </span>
            )}
            {book.pageCount && (
              <span
                className="rounded-full px-3 py-1 text-xs font-medium"
                style={{
                  background: "var(--color-paper-sunken)",
                  color: "var(--color-ink-muted)",
                }}
              >
                {book.pageCount} pages
              </span>
            )}
          </div>

          {/* Description */}
          {description && (
            <p
              className="mt-1 text-sm leading-relaxed"
              style={{ color: "var(--color-ink-muted)" }}
            >
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Reading sessions timeline */}
      <ReadingSessionTimeline
        bookId={book.id}
        userId={session?.user?.id}
        refreshTrigger={refreshTrigger}
      />
    </div>
  );
}