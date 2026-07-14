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

    return (
        <div className="relative">
            {/* --- 1. MAIN TRIGGER BUTTON --- */}
            <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                disabled={isLoading}
                className="rounded-full p-2.5 text-slate-500 transition-colors hover:text-green-500 dark:text-slate-400 dark:hover:text-green-400"
            >
                {isLoading ? (
                    <Loader2 size={20} className="animate-spin" />
                ) : currentStatus ? (
                    <Pencil size={20} />
                ) : (
                    <Plus size={24} />
                )}
            </button>

            {/* --- 2. DROPDOWN MENU --- */}
            {isMenuOpen && (
                <>
                    {/* Invisible backdrop to catch outside clicks and close the menu */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsMenuOpen(false)}
                    ></div>

                    <div className="absolute right-0 top-14 z-50 flex w-56 flex-col overflow-hidden rounded-2xl glass border border-white/20 bg-white/90 p-1 shadow-xl dark:border-white/10 dark:bg-neutral-900/90">
                        {/* Reading Status Options */}
                        {[
                            { id: "want_to_read", label: "Want to Read" },
                            { id: "reading", label: "Reading" },
                            { id: "read", label: "Read" },
                            { id: "dropped", label: "Did Not Finish" },
                        ].map((option) => (
                            <button
                                key={option.id}
                                onClick={() => handleSelectStatus(option.id)}
                                className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-violet-500/10 hover:text-violet-700 dark:text-slate-300 dark:hover:text-violet-400"
                            >
                                {option.label}
                                {currentStatus === option.id && <Check size={16} />}
                            </button>
                        ))}

                        {/* Destructive Action (Only visible if the book is saved) */}
                        {currentStatus && (
                            <>
                                <div className="my-1 h-px bg-slate-200 dark:bg-white/10"></div>
                                <button
                                    onClick={handleRemoveFromShelf}
                                    className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10 dark:text-red-400"
                                >
                                    <Trash2 size={16} />
                                    Remove from Shelf
                                </button>
                            </>
                        )}
                    </div>
                </>
            )}

            {/* --- 3. REVIEW MODAL (Triggers when status becomes "Read") --- */}
            {isReviewModalOpen && (
                <div className="fixed inset-0 z-60 flex items-center justify-center bg-white/20 backdrop-blur-sm dark:bg-black/40">
                    <div className="w-full max-w-md rounded-3xl glass bg-white/95 p-6 shadow-2xl dark:bg-neutral-900/95 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-display text-xl font-bold text-slate-800 dark:text-slate-100">
                                You finished it! 🎉
                            </h3>
                            <button
                                onClick={() => handleSaveReview(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Would you like to write a quick review? (Optional)
                        </p>

                        <textarea
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            className="h-32 w-full resize-none rounded-2xl border-none bg-slate-100 p-4 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-violet-500 dark:bg-slate-800 dark:text-slate-200"
                            placeholder="What did you think of this book?"
                        ></textarea>

                        <div className="flex gap-2 mt-2">
                            <button
                                onClick={() => handleSaveReview(false)}
                                className="flex-1 rounded-full px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                            >
                                Skip
                            </button>
                            <button
                                onClick={() => handleSaveReview(true)}
                                disabled={isLoading}
                                className="flex-1 rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 transition-colors flex items-center justify-center"
                            >
                                {isLoading ? <Loader2 size={16} className="animate-spin" /> : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}