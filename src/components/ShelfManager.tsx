import { useEffect, useState } from "react";
import { Plus, Check, Trash2, Loader2, X, BookmarkCheck } from "lucide-react";
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

    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        async function checkShelfStatus() {
            if (!userId || !bookId) return;
            try {
                setIsLoading(true);
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

                const { data: userBookData, error: userBookError } = await supabase
                    .from("user_books")
                    .select("id, status")
                    .eq("book_id", bookData.id)
                    .eq("user_id", userId)
                    .maybeSingle();

                if (userBookError) throw userBookError;

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

    const handleSelectStatus = async (newStatus: string) => {
        if (!userId) return;

        try {
            setIsLoading(true);
            let internalBookId = null;
            const { data: existingBook, error: checkError } = await supabase
                .from('books')
                .select('id')
                .eq('google_api_id', bookId)
                .maybeSingle();

            if (checkError) throw checkError;

            if (existingBook) {
                internalBookId = existingBook.id;
            } else {
                const { data: newBook, error: insertError } = await supabase
                    .from('books')
                    .insert({
                        google_api_id: bookId,
                        title: bookTitle,
                        cover_url: bookCoverUrl
                    })
                    .select('id')
                    .single();

                if (insertError) throw insertError;
                internalBookId = newBook.id;
            }

            let currentUserBookId = userBookId;

            if (!currentUserBookId) {
                const { data: existingUserBook } = await supabase
                    .from('user_books')
                    .select('id')
                    .eq('user_id', userId)
                    .eq('book_id', internalBookId)
                    .maybeSingle();

                if (existingUserBook) {
                    currentUserBookId = existingUserBook.id;
                    const { error: updateError } = await supabase
                        .from('user_books')
                        .update({ status: newStatus })
                        .eq('id', currentUserBookId);

                    if (updateError) throw updateError;
                } else {
                    const { data: newUserBook, error: insertUserBookError } = await supabase
                        .from('user_books')
                        .insert({
                            user_id: userId,
                            book_id: internalBookId,
                            status: newStatus
                        })
                        .select('id')
                        .single();

                    if (insertUserBookError) throw insertUserBookError;
                    currentUserBookId = newUserBook.id;
                }
            } else {
                const { error: updateError } = await supabase
                    .from('user_books')
                    .update({ status: newStatus })
                    .eq('id', currentUserBookId);

                if (updateError) throw updateError;
            }

            const { data: openSession } = await supabase
                .from('reading_sessions')
                .select('id')
                .eq('user_book_id', currentUserBookId)
                .is('end_date', null)
                .maybeSingle();

            if (newStatus === 'want_to_read' || newStatus === 'dropped') {
                if (openSession) {
                    await supabase.from('reading_sessions').delete().eq('id', openSession.id);
                }
            } else if (newStatus === 'reading') {
                if (!openSession) {
                    await supabase.from('reading_sessions').insert({
                        user_book_id: currentUserBookId,
                        start_date: today
                    });
                }
            }

            setUserBookId(currentUserBookId);
            setCurrentStatus(newStatus);
            setIsMenuOpen(false);

            if (newStatus === 'read') {
                setIsReviewModalOpen(true);
            } else {
                onUpdate?.();
            }

        } catch (error) {
            console.error('Error saving book: ', error);
            alert('Não foi possível salvar o livro. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveReview = async (isSave: boolean) => {
        if (!userBookId) return;

        setIsLoading(true);

        try {
            const { data: openSession } = await supabase
                .from('reading_sessions')
                .select('id')
                .eq('user_book_id', userBookId)
                .is('end_date', null)
                .maybeSingle();

            if (openSession) {
                const { error: updateError } = await supabase
                    .from('reading_sessions')
                    .update({
                        end_date: today,
                        review: isSave ? (reviewText || null) : null
                    })
                    .eq('id', openSession.id);

                if (updateError) throw updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('reading_sessions')
                    .insert({
                        user_book_id: userBookId,
                        start_date: today,
                        end_date: today,
                        review: isSave ? (reviewText || null) : null
                    });

                if (insertError) throw insertError;
            }

            setReviewText('');
            onUpdate?.();
        } catch (error) {
            console.error('Error saving review: ', error);
            alert('Não foi possível salvar a avaliação.');
        } finally {
            setIsLoading(false);
            setIsReviewModalOpen(false);
        }
    };

    const handleRemoveFromShelf = async () => {
        if (!userBookId) return;

        setIsLoading(true);

        try {
            const { error: removeError } = await supabase
                .from('user_books')
                .delete()
                .eq('id', userBookId);

            if (removeError) throw removeError;

            setCurrentStatus(null);
            setUserBookId(null);
            setIsMenuOpen(false);
            onUpdate?.();
        } catch (error) {
            console.log('Error removing from shelf: ', error);
            alert('Não foi possível remover da estante.');
        } finally {
            setIsLoading(false);
        }
    };

    const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
        want_to_read: { label: "Quero Ler", color: "text-amber-600 bg-amber-500/10" },
        reading: { label: "Lendo Agora", color: "text-violet-600 bg-violet-500/10" },
        read: { label: "Lido", color: "text-emerald-600 bg-emerald-500/10" },
        dropped: { label: "Abandonado", color: "text-rose-600 bg-rose-500/10" },
    };

    return (
        <div className="relative">
            {/* --- 1. MAIN TRIGGER BUTTON --- */}
            <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                disabled={isLoading}
                title={currentStatus ? `Estante: ${STATUS_CONFIG[currentStatus]?.label || currentStatus}` : "Adicionar à estante"}
                className={`glass-pill flex size-11 items-center justify-center rounded-full transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-50 ${
                    currentStatus ? "bg-violet-600/10 border-violet-500/30" : ""
                }`}
            >
                {isLoading ? (
                    <Loader2 className="size-5 animate-spin text-violet-600" />
                ) : currentStatus ? (
                    <BookmarkCheck className="size-5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                    <Plus className="size-5 text-violet-600 dark:text-violet-400" />
                )}
            </button>

            {/* --- 2. DROPDOWN MENU --- */}
            {isMenuOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsMenuOpen(false)}
                    />

                    <div className="glass-elevated absolute right-0 top-13 z-50 flex w-60 flex-col overflow-hidden rounded-3xl p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            Status de Leitura
                        </div>

                        {[
                            { id: "want_to_read", label: "Quero Ler", iconColor: "text-amber-500" },
                            { id: "reading", label: "Lendo Agora", iconColor: "text-violet-500" },
                            { id: "read", label: "Lido", iconColor: "text-emerald-500" },
                            { id: "dropped", label: "Abandonado", iconColor: "text-rose-500" },
                        ].map((option) => (
                            <button
                                key={option.id}
                                onClick={() => handleSelectStatus(option.id)}
                                className={`flex items-center justify-between rounded-2xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200 hover:scale-[1.02] ${
                                    currentStatus === option.id
                                        ? "bg-violet-600 text-white shadow-md shadow-violet-500/20"
                                        : "hover:bg-black/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200"
                                }`}
                            >
                                <span>{option.label}</span>
                                {currentStatus === option.id ? (
                                    <Check className="size-4.5 text-white" />
                                ) : (
                                    <span className={`size-2 rounded-full ${option.iconColor} bg-current opacity-60`} />
                                )}
                            </button>
                        ))}

                        {currentStatus && (
                            <>
                                <div className="my-1.5 h-px bg-slate-200/80 dark:bg-white/10" />
                                <button
                                    onClick={handleRemoveFromShelf}
                                    className="flex w-full items-center gap-2 rounded-2xl px-3.5 py-2.5 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-500/10 dark:text-rose-400"
                                >
                                    <Trash2 className="size-4" />
                                    <span>Remover da estante</span>
                                </button>
                            </>
                        )}
                    </div>
                </>
            )}

            {/* --- 3. REVIEW MODAL --- */}
            {isReviewModalOpen && (
                <div
                    className="fixed inset-0 z-60 flex items-center justify-center p-4 backdrop-blur-md"
                    style={{ background: "rgba(28, 25, 23, 0.45)" }}
                >
                    <div className="glass-elevated flex w-full max-w-md flex-col gap-6 rounded-[32px] p-7 sm:p-8 shadow-2xl">
                        <div className="flex items-start justify-between">
                            <div className="flex flex-col gap-1">
                                <span className="text-3xl">🎉</span>
                                <h3
                                    className="text-2xl font-bold"
                                    style={{
                                        fontFamily: "var(--font-display)",
                                        color: "var(--color-ink)",
                                    }}
                                >
                                    Parabéns pela leitura!
                                </h3>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                    Deseja registrar suas impressões ou nota sobre este livro?
                                </p>
                            </div>
                            <button
                                onClick={() => handleSaveReview(false)}
                                className="glass-pill flex size-8 items-center justify-center rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white"
                            >
                                <X className="size-4" />
                            </button>
                        </div>

                        <textarea
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            className="h-36 w-full resize-none rounded-2xl border-0 p-4 text-sm font-medium leading-relaxed outline-none transition-shadow focus:ring-2 focus:ring-violet-500/40"
                            style={{
                                background: "var(--color-paper-sunken)",
                                color: "var(--color-ink)",
                                fontFamily: "var(--font-sans)",
                            }}
                            placeholder="O que você achou desta história? Pontos marcantes, reflexões..."
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={() => handleSaveReview(false)}
                                className="glass-pill flex-1 rounded-full py-3 text-sm font-semibold text-slate-600 transition-transform hover:scale-105 active:scale-95 dark:text-slate-300"
                            >
                                Pular por enquanto
                            </button>
                            <button
                                onClick={() => handleSaveReview(true)}
                                disabled={isLoading}
                                className="flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
                                style={{ background: "linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)" }}
                            >
                                {isLoading ? <Loader2 className="size-4 animate-spin" /> : "Salvar avaliação"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}