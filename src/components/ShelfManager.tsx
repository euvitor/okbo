import { useEffect, useState } from "react";
import { Plus, Pencil, Check, Trash2, Loader2, X } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

interface ShelfManagerProps {
    bookId: string; // google_api_id
    bookTitle: string;
    bookCoverUrl: string | null;
    userId: string | undefined;
    onUpdate?: () => void;
}

export function ShelfManager({ bookId, bookTitle, bookCoverUrl, userId, onUpdate }: ShelfManagerProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [currentStatus, setCurrentStatus] = useState<string | null>(null);
    const [userBookId, setUserBookId] = useState<string | null>(null);

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [reviewText, setReviewText] = useState("");

    // Standardized date format for database inserts
    const today = new Date().toISOString().split('T')[0]

    useEffect(() => {
        async function checkShelfStatus() {
            if (!userId || !bookId) return;
            try {
                setIsLoading(true);

                // 1. Verify if the book already exists in our internal database
                const { data: bookData, error: bookError } = await supabase
                    .from("books")
                    .select("id")
                    .eq("google_api_id", bookId)
                    .maybeSingle();

                if (bookError) throw bookError;

                if (!bookData) {
                    setCurrentStatus(null);
                    return;
                }

                // 2. Verify if the user has already added this book to their shelf
                const { data: userBookData, error: userBookError } = await supabase
                    .from("user_books")
                    .select("id, status")
                    .eq("book_id", bookData.id)
                    .eq("user_id", userId)
                    .maybeSingle();

                if (userBookError) throw userBookError;

                // 3. Hydrate local state if a relationship exists
                if (userBookData) {
                    setUserBookId(userBookData.id);
                    setCurrentStatus(userBookData.status);
                } else {
                    setCurrentStatus(null);
                }
            } catch (error) {
                console.error("Can't fetch shelf status:", error);
                setCurrentStatus(null);
            } finally {
                setIsLoading(false);
            }
        }

        checkShelfStatus();
    }, [bookId, userId]);

    // --- HANDLERS ---

    // Manages the complex relational insertion: Book -> User_Book -> Reading_Session
    const handleSelectStatus = async (newStatus: string) => {
        if (!userId) return

        try {
            setIsLoading(true)

            // Step 1: Ensure the book exists in our DB, otherwise create it
            let internalBookId = null
            const { data: existingBook, error: checkError } = await supabase
                .from('books')
                .select('id')
                .eq('google_api_id', bookId)
                .maybeSingle()

            if (checkError) throw checkError

            if (existingBook) {
                internalBookId = existingBook.id
            } else {
                const { data: newBook, error: insertError } = await supabase
                    .from('books')
                    .insert({
                        google_api_id: bookId,
                        title: bookTitle,
                        cover_url: bookCoverUrl
                    })
                    .select('id')
                    .single()

                if (insertError) throw insertError
                internalBookId = newBook.id
            }

            // Step 2: Upsert the user_books relationship
            let currentUserBookId = userBookId

            if (!currentUserBookId) {
                const { data: existingUserBook } = await supabase
                    .from('user_books')
                    .select('id')
                    .eq('user_id', userId)
                    .eq('book_id', internalBookId)
                    .maybeSingle()

                if (existingUserBook) {
                    currentUserBookId = existingUserBook.id
                    const { error: updateError } = await supabase
                        .from('user_books')
                        .update({ status: newStatus })
                        .eq('id', currentUserBookId)

                    if (updateError) throw updateError
                } else {
                    const { data: newUserBook, error: insertUserBookError } = await supabase
                        .from('user_books')
                        .insert({
                            user_id: userId,
                            book_id: internalBookId,
                            status: newStatus
                        })
                        .select('id')
                        .single()

                    if (insertUserBookError) throw insertUserBookError
                    currentUserBookId = newUserBook.id
                }
            } else {
                const { error: updateError } = await supabase
                    .from('user_books')
                    .update({ status: newStatus })
                    .eq('id', currentUserBookId)

                if (updateError) throw updateError
            }

            // Step 3: Manage Reading Sessions based on the target status
            const { data: openSession } = await supabase
                .from('reading_sessions')
                .select('id')
                .eq('user_book_id', currentUserBookId)
                .is('end_date', null)
                .maybeSingle()

            // If moving to "Want to Read" or "DNF", we abandon any incomplete active sessions
            if (newStatus === 'want_to_read' || newStatus === 'dropped') {
                if (openSession) {
                    await supabase.from('reading_sessions').delete().eq('id', openSession.id)
                }
            }
            // If moving to "Reading", we start a new session (if one isn't already open)
            else if (newStatus === 'reading') {
                if (!openSession) {
                    await supabase.from('reading_sessions').insert({
                        user_book_id: currentUserBookId,
                        start_date: today
                    })
                }
            }

            // Update UI state
            setUserBookId(currentUserBookId)
            setCurrentStatus(newStatus)
            setIsMenuOpen(false)

            // Step 4: If finished, prompt for a review before triggering the refresh
            if (newStatus === 'read') {
                setIsReviewModalOpen(true)
            } else {
                // If not reviewing, trigger the update to refresh the BookDetails timeline immediately
                onUpdate?.()
            }

        } catch (error) {
            console.error('Error saving book: ', error)
            alert('Could not save the book. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSaveReview = async (isSave: boolean) => {
        if (!userBookId) return

        setIsLoading(true)

        try {
            const { data: openSession } = await supabase
                .from('reading_sessions')
                .select('id')
                .eq('user_book_id', userBookId)
                .is('end_date', null)
                .maybeSingle()

            if (openSession) {
                const { error: updateError } = await supabase
                    .from('reading_sessions')
                    .update({
                        end_date: today,
                        review: isSave ? (reviewText || null) : null
                    })
                    .eq('id', openSession.id)

                if (updateError) throw updateError
            } else {
                // Edge case: User clicked "Read" directly without ever clicking "Reading" first
                const { error: insertError } = await supabase
                    .from('reading_sessions')
                    .insert({
                        user_book_id: userBookId,
                        start_date: today, // Fallback start_date to today
                        end_date: today,
                        review: isSave ? (reviewText || null) : null
                    })

                if (insertError) throw insertError
            }

            setReviewText('')
            onUpdate?.() // Refresh BookDetails timeline
        } catch (error) {
            console.error('Error saving review: ', error);
            alert('Could not save the book review.');
        } finally {
            setIsLoading(false);
            setIsReviewModalOpen(false);
        }
    };

    const handleRemoveFromShelf = async () => {
        if (!userBookId) return

        setIsLoading(true)

        try {
            // Due to ON DELETE CASCADE, removing the user_book will automatically 
            // wipe all associated reading_sessions from the database.
            const { error: removeError } = await supabase
                .from('user_books')
                .delete()
                .eq('id', userBookId)

            if (removeError) throw removeError

            setCurrentStatus(null)
            setUserBookId(null)
            setIsMenuOpen(false)

            onUpdate?.() // Refresh BookDetails timeline
        } catch (error) {
            console.log('Error removing from shelf:, ', error)
            alert('Could not remove from shelf.')
        } finally {
            setIsLoading(false)
        }
    };

    const menuItemBase =
        "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 hover:bg-black/5 dark:hover:bg-white/6 active:scale-[0.98]";

    return (
        <div className="relative">
            {/* --- 1. MAIN TRIGGER BUTTON --- */}
            <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                disabled={isLoading}
                className="flex size-9 items-center justify-center rounded-full transition-all duration-150 hover:bg-black/5 dark:hover:bg-white/8 active:scale-95 disabled:opacity-50"
                style={{ color: "var(--color-ink-muted)" }}
            >
                {isLoading ? (
                    <Loader2 size={17} className="animate-spin" />
                ) : currentStatus ? (
                    <Pencil size={17} />
                ) : (
                    <Plus size={20} />
                )}
            </button>

            {/* --- 2. DROPDOWN MENU --- */}
            {isMenuOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsMenuOpen(false)}
                    />

                    <div className="glass-elevated absolute right-0 top-11 z-50 flex w-52 flex-col overflow-hidden rounded-2xl p-1.5">
                        {[
                            { id: "want_to_read", label: "Want to Read" },
                            { id: "reading", label: "Reading" },
                            { id: "read", label: "Read" },
                            { id: "dropped", label: "Did Not Finish" },
                        ].map((option) => (
                            <button
                                key={option.id}
                                onClick={() => handleSelectStatus(option.id)}
                                className={menuItemBase}
                                style={{
                                    color: currentStatus === option.id
                                        ? "var(--color-accent)"
                                        : "var(--color-ink-muted)",
                                    fontWeight: currentStatus === option.id ? 600 : 500,
                                }}
                            >
                                {option.label}
                                {currentStatus === option.id && (
                                    <Check size={14} style={{ color: "var(--color-accent)" }} />
                                )}
                            </button>
                        ))}

                        {currentStatus && (
                            <>
                                <div
                                    className="my-1.5 h-px"
                                    style={{ background: "var(--color-border)" }}
                                />
                                <button
                                    onClick={handleRemoveFromShelf}
                                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 hover:bg-red-50 dark:hover:bg-red-950/30 active:scale-[0.98]"
                                    style={{ color: "#DC2626" }}
                                >
                                    <Trash2 size={14} />
                                    Remove from Shelf
                                </button>
                            </>
                        )}
                    </div>
                </>
            )}

            {/* --- 3. REVIEW MODAL --- */}
            {isReviewModalOpen && (
                <div
                    className="fixed inset-0 z-60 flex items-center justify-center backdrop-blur-sm"
                    style={{ background: "rgba(44, 40, 37, 0.25)" }}
                >
                    <div className="glass-elevated mx-4 flex w-full max-w-md flex-col gap-5 rounded-3xl p-7">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3
                                    className="text-xl font-semibold"
                                    style={{
                                        fontFamily: "var(--font-display)",
                                        color: "var(--color-ink)",
                                    }}
                                >
                                    You finished it! 🎉
                                </h3>
                                <p className="mt-1 text-sm" style={{ color: "var(--color-ink-muted)" }}>
                                    Add a quick review? (Optional)
                                </p>
                            </div>
                            <button
                                onClick={() => handleSaveReview(false)}
                                className="flex size-8 items-center justify-center rounded-full transition-all hover:bg-black/5 dark:hover:bg-white/8"
                                style={{ color: "var(--color-ink-faint)" }}
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <textarea
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            className="h-32 w-full resize-none rounded-2xl border-0 p-4 text-sm leading-relaxed outline-none transition-shadow focus:ring-2 focus:ring-[var(--color-accent)]/30"
                            style={{
                                background: "var(--color-paper-sunken)",
                                color: "var(--color-ink)",
                                fontFamily: "var(--font-sans)",
                            }}
                            placeholder="What did you think of this book?"
                        />

                        <div className="flex gap-2">
                            <button
                                onClick={() => handleSaveReview(false)}
                                className="flex-1 rounded-full py-2.5 text-sm font-medium transition-all duration-150 hover:bg-black/5 dark:hover:bg-white/8 active:scale-[0.98]"
                                style={{ color: "var(--color-ink-muted)" }}
                            >
                                Skip
                            </button>
                            <button
                                onClick={() => handleSaveReview(true)}
                                disabled={isLoading}
                                className="flex flex-1 items-center justify-center rounded-full py-2.5 text-sm font-medium text-white transition-all duration-150 hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                                style={{ background: "var(--color-accent)" }}
                            >
                                {isLoading ? <Loader2 size={16} className="animate-spin" /> : "Save review"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}