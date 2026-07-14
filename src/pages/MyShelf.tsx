import { useEffect, useState } from "react";
import { ProfilePic } from "../components/ProfilePic";
import { useProfile } from "../hooks/useProfile";
import { supabase } from "../lib/supabaseClient";
import { ShelfRow, type UserBookDetails } from "../components/ShelfRow";

async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error("Error logging out:", error.message);
    }
}

export function MyShelf() {
    const { userId, profile, isLoading, updateLocalProfile } = useProfile();

    const [userBooks, setUserBooks] = useState<UserBookDetails[]>([]);
    const [isFetchingBooks, setIsFetchingBooks] = useState(false);

    useEffect(() => {
        async function fetchUserBooks() {
            if (!userId) return;

            setIsFetchingBooks(true);
            try {
                // Fetch user's library, joining user_books with book details
                const { data, error } = await supabase
                    .from("user_books")
                    .select(`id, status, added_at, books ( id, title, cover_url, google_api_id ) `)
                    .eq("user_id", userId)
                    .order("added_at", { ascending: false });

                if (error) throw error;

                // Double type assertion: overrides Supabase's generic join type to match our specific UI interface
                setUserBooks((data as unknown) as UserBookDetails[]);
            } catch (error) {
                console.error("Can't fetch user books", error);
            } finally {
                setIsFetchingBooks(false);
            }
        }

        fetchUserBooks();
    }, [userId]);

    // This early return MUST stay below the hooks to avoid violating React's Rules of Hooks
    if (!userId) {
        return (
            <div className="container flex items-center justify-center pt-20 text-slate-400 dark:text-slate-500">
                Loading session...
            </div>
        );
    }

    // Group books by their current reading status
    const readingList = userBooks.filter((b) => b.status === "reading");
    const wantToReadList = userBooks.filter((b) => b.status === "want_to_read");
    const readList = userBooks.filter((b) => b.status === "read");
    const droppedList = userBooks.filter((b) => b.status === "dropped");

    return (
        <div className="container grid grid-cols-1 gap-10 pb-20 pt-10 lg:grid-cols-3">
            <aside className="mx-auto flex h-max w-full max-w-xs flex-col items-center gap-10 p-4 lg:col-span-1 lg:sticky lg:top-24">
                {isLoading ? (
                    <div className="glass flex h-48 w-48 animate-pulse items-center justify-center rounded-full text-xs text-slate-400 dark:text-slate-500">
                        Loading...
                    </div>
                ) : (
                    <>
                        <ProfilePic
                            userId={userId}
                            avatarUrl={profile.avatar_url}
                            onUploadSuccess={(newUrl) =>
                                updateLocalProfile({ avatar_url: newUrl })
                            }
                        />

                        <div className="flex w-full flex-col items-center gap-3">
                            <h3 className="font-display text-xl font-bold text-slate-800 dark:text-slate-100">
                                2026 Reading Goal
                            </h3>

                            <div className="glass relative flex h-10 w-full items-center justify-center overflow-hidden rounded-full p-1 shadow-inner">
                                <div className="absolute bottom-1 left-1 top-1 z-0 w-[65%] rounded-full bg-violet-500/20 transition-all duration-1000 ease-out dark:bg-violet-500/30"></div>

                                <span className="relative z-10 text-sm font-semibold text-violet-700 dark:text-violet-300">
                                    65%
                                </span>
                            </div>
                        </div>

                        <div className="flex w-full flex-col gap-3">
                            <button className="rounded-2xl bg-violet-500/15 px-4 py-3 font-semibold text-violet-700 shadow-sm transition-all hover:bg-violet-500/20 dark:text-violet-300">
                                Share my bio
                            </button>

                            <button className="rounded-2xl bg-violet-500/15 px-4 py-3 font-semibold text-violet-700 shadow-sm transition-all hover:bg-violet-500/20 dark:text-violet-300">
                                Export my lists
                            </button>

                            <button
                                onClick={handleLogout}
                                className="rounded-2xl bg-red-500/15 px-4 py-3 font-semibold text-red-600 shadow-sm transition-all hover:bg-red-500/20 dark:text-red-400"
                            >
                                Logout
                            </button>
                        </div>
                    </>
                )}
            </aside>

            <main className="flex min-h-125 flex-col gap-10 p-4 lg:col-span-2">
                {isFetchingBooks ? (
                    <div className="flex h-full w-full items-center justify-center text-slate-500">
                        Loading your shelves...
                    </div>
                ) : (
                    <>
                        <ShelfRow title="Currently Reading" userBooks={readingList} />
                        <ShelfRow title="Want to Read" userBooks={wantToReadList} />
                        <ShelfRow title="Read" userBooks={readList} />
                        <ShelfRow title="Did Not Finish" userBooks={droppedList} />
                    </>
                )}
            </main>
        </div>
    );
}