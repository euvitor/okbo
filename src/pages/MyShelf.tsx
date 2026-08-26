import { useEffect, useState } from "react";
import { ProfilePic } from "../components/ProfilePic";
import { useProfile } from "../hooks/useProfile";
import { supabase } from "../lib/supabaseClient";
import { ShelfRow, type UserBookDetails } from "../components/ShelfRow";
import { Share2, Download, LogOut, Target } from "lucide-react";

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
      <div className="container mx-auto flex items-center justify-center pt-24">
        <div className="glass flex max-w-sm flex-col items-center gap-4 rounded-3xl p-10 text-center">
          <div className="size-10 rounded-full border-3 border-violet-500 border-t-transparent animate-spin" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            Carregando sua estante...
          </p>
        </div>
      </div>
    );
  }

  const readingList = userBooks.filter((b) => b.status === "reading");
  const wantToReadList = userBooks.filter((b) => b.status === "want_to_read");
  const readList = userBooks.filter((b) => b.status === "read");
  const droppedList = userBooks.filter((b) => b.status === "dropped");

  const totalBooks = userBooks.length;
  const readCount = readList.length;
  const goalTarget = 24; // Default goal
  const progressPercent = Math.min(Math.round((readCount / goalTarget) * 100), 100);

  return (
    <div className="container mx-auto grid grid-cols-1 gap-8 pb-20 pt-6 lg:grid-cols-12">

      {/* ── Profile Sidebar ── */}
      <aside className="mx-auto flex h-max w-full max-w-sm flex-col items-center gap-6 p-2 lg:col-span-4 lg:sticky lg:top-28">
        <div className="glass flex w-full flex-col items-center gap-6 rounded-[32px] p-7 sm:p-8 shadow-xl">
          {isLoading ? (
            <div className="size-36 animate-pulse rounded-full bg-slate-200 dark:bg-neutral-800" />
          ) : (
            <>
              <ProfilePic
                userId={userId}
                avatarUrl={profile.avatar_url}
                onUploadSuccess={(newUrl) => updateLocalProfile({ avatar_url: newUrl })}
              />

              <div className="flex flex-col items-center text-center">
                <h2
                  className="text-2xl font-bold"
                  style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
                >
                  {profile.username || "Leitor Okbo"}
                </h2>
                <p className="text-xs font-semibold text-violet-600 dark:text-violet-400">
                  {totalBooks} {totalBooks === 1 ? "livro salvo" : "livros salvos"}
                </p>
              </div>

              {/* Reading Goal Card with Gradient Progress Bar */}
              <div className="w-full rounded-2xl bg-white/70 p-4 border border-white/80 shadow-inner dark:bg-neutral-800/60 dark:border-white/5 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                    <Target className="size-4 text-violet-500" />
                    <span>Meta de Leitura 2026</span>
                  </div>
                  <span className="text-xs font-bold text-violet-600 dark:text-violet-400">
                    {readCount} de {goalTarget} livros ({progressPercent}%)
                  </span>
                </div>

                {/* Gradient Progress Bar */}
                <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-200/70 dark:bg-neutral-700/60">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out shadow-sm"
                    style={{
                      width: `${progressPercent}%`,
                      background: "linear-gradient(90deg, #7C3AED 0%, #EC4899 50%, #10B981 100%)",
                    }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex w-full flex-col gap-2.5 pt-1">
                <button className="glass-pill flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-slate-700 hover:text-violet-600 dark:text-slate-200 dark:hover:text-violet-400">
                  <Share2 className="size-4" />
                  <span>Compartilhar Perfil</span>
                </button>

                <button className="glass-pill flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-slate-700 hover:text-violet-600 dark:text-slate-200 dark:hover:text-violet-400">
                  <Download className="size-4" />
                  <span>Exportar Estantes</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-rose-600 transition-all hover:bg-rose-500/10 active:scale-95 dark:text-rose-400"
                >
                  <LogOut className="size-4" />
                  <span>Encerrar Sessão</span>
                </button>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* ── Main Shelves Section ── */}
      <main className="flex min-h-125 flex-col gap-10 p-2 lg:col-span-8">
        {isFetchingBooks ? (
          <div className="glass flex h-64 w-full flex-col items-center justify-center gap-3 rounded-3xl">
            <div className="size-8 rounded-full border-3 border-violet-500 border-t-transparent animate-spin" />
            <p className="text-sm font-semibold text-slate-500">Organizando suas leituras...</p>
          </div>
        ) : (
          <>
            <ShelfRow
              title="Lendo Agora"
              badgeColor="bg-violet-500/15 text-violet-700 border-violet-500/20"
              icon="📖"
              userBooks={readingList}
            />
            <ShelfRow
              title="Quero Ler"
              badgeColor="bg-amber-500/15 text-amber-700 border-amber-500/20"
              icon="✨"
              userBooks={wantToReadList}
            />
            <ShelfRow
              title="Lidos"
              badgeColor="bg-emerald-500/15 text-emerald-700 border-emerald-500/20"
              icon="🏆"
              userBooks={readList}
            />
            <ShelfRow
              title="Abandonados"
              badgeColor="bg-rose-500/15 text-rose-700 border-rose-500/20"
              icon="💤"
              userBooks={droppedList}
            />
          </>
        )}
      </main>
    </div>
  );
}