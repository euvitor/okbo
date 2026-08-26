import { useEffect, useState } from "react";
import { ProfilePic } from "../components/ProfilePic";
import { useProfile } from "../hooks/useProfile";
import { supabase } from "../lib/supabaseClient";
import { ShelfRow, type UserBookDetails } from "../components/ShelfRow";

async function handleLogout() {
  const { error } = await supabase.auth.signOut();
  if (error) console.error("Error logging out:", error.message);
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
        const { data, error } = await supabase
          .from("user_books")
          .select(`id, status, added_at, books ( id, title, cover_url, google_api_id )`)
          .eq("user_id", userId)
          .order("added_at", { ascending: false });

        if (error) throw error;
        setUserBooks((data as unknown) as UserBookDetails[]);
      } catch (error) {
        console.error("Can't fetch user books", error);
      } finally {
        setIsFetchingBooks(false);
      }
    }

    fetchUserBooks();
  }, [userId]);

  if (!userId) {
    return (
      <div
        className="container flex items-center justify-center pt-20 text-sm animate-pulse"
        style={{ color: "var(--color-ink-muted)" }}
      >
        Loading session…
      </div>
    );
  }

  const readingList = userBooks.filter((b) => b.status === "reading");
  const wantToReadList = userBooks.filter((b) => b.status === "want_to_read");
  const readList = userBooks.filter((b) => b.status === "read");
  const droppedList = userBooks.filter((b) => b.status === "dropped");

  /* Shared action button style */
  const actionBtnClass =
    "w-full rounded-full py-2.5 text-sm font-medium transition-all duration-150 hover:opacity-80 active:scale-[0.98]";

  return (
    <div className="container grid grid-cols-1 gap-10 pb-20 pt-10 lg:grid-cols-3">

      {/* ── Sidebar ── */}
      <aside className="mx-auto flex h-max w-full max-w-xs flex-col items-center gap-8 p-4 lg:col-span-1 lg:sticky lg:top-24">
        {isLoading ? (
          <div
            className="h-36 w-36 animate-pulse rounded-full"
            style={{ background: "var(--color-paper-sunken)" }}
          />
        ) : (
          <>
            <ProfilePic
              userId={userId}
              avatarUrl={profile.avatar_url}
              onUploadSuccess={(newUrl) => updateLocalProfile({ avatar_url: newUrl })}
            />

            {/* Reading goal */}
            <div className="glass w-full rounded-2xl p-5 flex flex-col gap-3">
              <div className="flex items-baseline justify-between">
                <h3
                  className="text-sm font-semibold"
                  style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
                >
                  2026 Reading Goal
                </h3>
                <span className="text-xs font-medium" style={{ color: "var(--color-accent)" }}>
                  65%
                </span>
              </div>

              {/* Progress bar */}
              <div
                className="relative h-1.5 w-full overflow-hidden rounded-full"
                style={{ background: "var(--color-paper-sunken)" }}
              >
                <div
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: "65%", background: "var(--color-accent)" }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex w-full flex-col gap-2">
              <button
                className={actionBtnClass}
                style={{
                  background: "var(--color-paper-sunken)",
                  color: "var(--color-ink-muted)",
                }}
              >
                Share my bio
              </button>

              <button
                className={actionBtnClass}
                style={{
                  background: "var(--color-paper-sunken)",
                  color: "var(--color-ink-muted)",
                }}
              >
                Export my lists
              </button>

              <button
                onClick={handleLogout}
                className={actionBtnClass}
                style={{
                  background: "rgba(220, 38, 38, 0.07)",
                  color: "#DC2626",
                }}
              >
                Logout
              </button>
            </div>
          </>
        )}
      </aside>

      {/* ── Shelves ── */}
      <main className="flex min-h-125 flex-col gap-10 p-4 lg:col-span-2">
        {isFetchingBooks ? (
          <div
            className="flex h-full w-full items-center justify-center text-sm animate-pulse"
            style={{ color: "var(--color-ink-muted)" }}
          >
            Loading your shelves…
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