import { useEffect, useState } from "react";
import { CalendarIcon, CheckCircle2Icon, MessageSquareIcon } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

interface Session {
    id: string;
    start_date: string;
    end_date: string | null; 
    review: string | null;
}

interface TimelineProps {
    bookId: string; // google_api_id
    userId: string | undefined;
    refreshTrigger: number;
}

export function ReadingSessionTimeline({ bookId, userId, refreshTrigger }: TimelineProps) {
    const [sessions, setSessions] = useState<Session[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchSessions() {
            if (!userId || !bookId) {
                setIsLoading(false)
                return
            }

            setIsLoading(true)
            try {
                // Deep Join with '!inner': This forces an inner join on the books table.
                // It ensures we ONLY get the user_book record if the associated book matches our google_api_id,
                // making the query highly efficient.
                const { data, error } = await supabase
                    .from('user_books')
                    .select(`
                        id,
                        books!inner( google_api_id ),
                        reading_sessions( id, start_date, end_date, review )
                    `)
                    .eq('user_id', userId)
                    .eq('books.google_api_id', bookId)
                    .maybeSingle()

                if (error) throw error

                if (data && data.reading_sessions) {
                    // Sort sessions chronologically (most recent first) so the timeline flows downwards correctly
                    const sortedSessions = (data.reading_sessions as Session[]).sort((a, b) => {
                        return new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
                    })
                    setSessions(sortedSessions)
                } else {
                    setSessions([])
                }
            } catch (error) {
                console.error('Error fetching sessions: ', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchSessions()
    }, [bookId, userId, refreshTrigger])

    if (isLoading) {
        return (
            <div className="mt-12 flex justify-center">
                <span className="text-sm text-slate-400 animate-pulse">Loading journey...</span>
            </div>
        )
    }

    // If there's no reading history, we return null to keep the UI clean (no empty timeline section)
    if (sessions.length === 0) return null

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="mt-12 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="font-display text-xl font-bold text-slate-800 dark:text-slate-100">
                Reading Journey
            </h3>

            {/* Timeline vertical line */}
            <div className="relative flex flex-col gap-8 border-l-2 border-violet-500/20 pl-6 dark:border-violet-500/30 ml-2">
                {sessions.map((session) => (
                    <div key={session.id} className="relative">

                        {/* Timeline dot */}
                        <div className="absolute -left-7.75 top-1.5 h-3.5 w-3.5 rounded-full bg-violet-500 ring-4 ring-slate-50 dark:ring-neutral-900" />

                        {/* Liquid Glass Card */}
                        <div className="glass flex flex-col gap-3 rounded-3xl p-5 shadow-sm">
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                                <div className="flex items-center gap-2">
                                    <CalendarIcon size={16} className="text-violet-500" />
                                    <span>Started: {formatDate(session.start_date)}</span>
                                </div>
                                {session.end_date && (
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2Icon size={16} className="text-green-500" />
                                        <span>Finished: {formatDate(session.end_date)}</span>
                                    </div>
                                )}
                            </div>

                            {/* User review */}
                            {session.review && (
                                <div className="relative mt-2 rounded-2xl border border-white/20 bg-white/40 p-4 text-sm text-slate-700 dark:border-white/5 dark:bg-black/20 dark:text-slate-300">
                                    <MessageSquareIcon size={16} className="absolute right-4 top-4 text-slate-300 dark:text-slate-600" />
                                    <p className="pr-6 italic leading-relaxed">"{session.review}"</p>
                                </div>
                            )}

                            {/* Open session badge */}
                            {!session.end_date && (
                                <div className="mt-1">
                                    <span className="inline-flex items-center rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                                        Currently Reading
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}