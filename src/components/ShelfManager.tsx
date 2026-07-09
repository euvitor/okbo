import { useEffect, useState } from "react";
import { Plus, Pencil, Check, Trash2, Loader2, X } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

interface ShelfManagerProps {
    bookId: string; // google_api_id
    bookTitle: string;
    bookCoverUrl: string | null;
    userId: string | undefined;
}


export function ShelfManager({ bookId, bookTitle, bookCoverUrl, userId }: ShelfManagerProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [currentStatus, setCurrentStatus] = useState<string | null>(null);
    const [userBookId, setUserBookId] = useState<string | null>(null);

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [reviewText, setReviewText] = useState("");

    const today = new Date().toISOString().split('T')[0]

    useEffect(() => {

        async function checkShelfStatus() {
            if (!userId || !bookId) return;
            try {
                setIsLoading(true);

                // Check if the book is already in the user's shelf
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

                // Check if the book is already in the user's shelf
                const { data: userBookData, error: userBookError } = await supabase
                    .from("user_books")
                    .select("id, status")
                    .eq("book_id", bookData.id)
                    .eq("user_id", userId)
                    .maybeSingle();

                if (userBookError) throw userBookError;

                // If the book exists in user shelf, stores ID and status
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
    const handleSelectStatus = async (newStatus: string) => {
        if (!userId) return

        try {
            setIsLoading(true)

            // Check if book exists, if don't, creates and gets the new book id
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

            // Check it's stats on shelf (user_books)
            let currentUserBookId = userBookId // Gets from state if exists

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

            const { data: openSession } = await supabase
                .from('reading_sessions')
                .select('id')
                .eq('user_book_id', currentUserBookId)
                .is('end_date', null)
                .maybeSingle()

            // Want to Read and DNF(dropped) always deletes incomplete sessions
            if (newStatus === 'want_to_read' || newStatus === 'dropped') {
                if (openSession) {
                    await supabase.from('reading_sessions').delete().eq('id', openSession.id)
                }
            }
            else if (newStatus === 'reading') {
                if (!openSession) {
                    await supabase.from('reading_sessions').insert({
                        user_book_id: currentUserBookId,
                        start_date: today
                    })
                }
            }

            setUserBookId(currentUserBookId)
            setCurrentStatus(newStatus)
            setIsMenuOpen(false)

            if (newStatus === 'read') {
                setIsReviewModalOpen(true)
            }
        } catch (error) {
            console.error('Error saving book: ', error)
            alert('Could not save the book. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }


    const handleSaveReview = async () => {
        if (!userBookId) return

        setIsLoading(true)

        try{
            const {data: openSession} = await supabase
            .from('reading_sessions')
            .select('id')
            .eq('user_book_id', userBookId)
            .is('end_date', null)
            .maybeSingle()

            if(openSession){
                const{error: updateError} = await supabase
                .from('reading_sessions')
                .update({
                    end_date: today,
                    review: reviewText || null
                })
                .eq('user_book_id',openSession.id)

                if(updateError) throw updateError
            } else {
                const {error: insertError} = await supabase
                .from ('reading_sessions')
                .insert({
                    user_book_id: userBookId,
                    end_date: today,
                    review: reviewText || null
                })

                if(insertError) throw insertError
            }

            setReviewText('')
        } catch (error){
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
            const { error: removeError } = await supabase
                .from('user_books')
                .delete()
                .eq('id', userBookId)

            if (removeError) throw removeError

            setCurrentStatus(null)
            setUserBookId(null)
        } catch (error) {
            console.log('Error removing from shelf:, ', error)
            alert('Could not remove from shelf.')
        } finally {
            setIsLoading(false)
            setIsReviewModalOpen(false)
        }
    };


    return (
        <div className="relative">
            {/* --- 1. BOTÃO PRINCIPAL --- */}
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
                    {/* Overlay invisível para fechar o menu ao clicar fora */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsMenuOpen(false)}
                    ></div>

                    <div className="absolute right-0 top-14 z-50 flex w-56 flex-col overflow-hidden rounded-2xl glass border border-white/20 bg-white/90 p-1 shadow-xl dark:border-white/10 dark:bg-neutral-900/90">
                        {/* Opções de Leitura */}
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

                        {/* Botão de Remover (Apenas se já estiver na estante) */}
                        {currentStatus && (
                            <>
                                <div className="my-1 h-px bg-slate-200 dark:bg-white/10"></div>
                                <button
                                    onClick={handleRemoveFromShelf}
                                    className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
                                >
                                    <Trash2 size={16} />
                                    Remove from Shelf
                                </button>
                            </>
                        )}
                    </div>
                </>
            )}

            {/* --- 3. MODAL DE REVIEW (Abre ao escolher "Read") --- */}
            {isReviewModalOpen && (
                <div className="fixed inset-0 z-60 flex items-center justify-center bg-white/20 dark:bg-black/20 rounded-3xl">
                    <div className="w-full max-w-md rounded-3xl glass bg-white/95 p-6 shadow-2xl dark:bg-neutral-900/95 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-display text-xl font-bold text-slate-800 dark:text-slate-100">
                                You finished it! 🎉
                            </h3>
                            <button
                                onClick={() => setIsReviewModalOpen(false)}
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
                                onClick={() => setIsReviewModalOpen(false)}
                                className="flex-1 rounded-full px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                            >
                                Skip
                            </button>
                            <button
                                onClick={handleSaveReview}
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