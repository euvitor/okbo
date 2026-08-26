// --- IMPORTS ---
import { LogOutIcon, UserRoundIcon, LibraryIcon, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";
import { useProfile } from "../hooks/useProfile";

// --- HANDLERS ---
async function handleLogout() {
  const { error } = await supabase.auth.signOut();
  if (error) console.error("Error logging out:", error.message);
}

// --- SUBCOMPONENTS ---
function UserMenu({
  email,
  username,
  profilePic,
}: {
  email: string | undefined;
  username: string | null | undefined;
  profilePic: string | null | undefined;
}) {
  const menuItemBase =
    "flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-95";

  return (
    <div className="flex w-64 flex-col gap-2 p-1.5">
      {/* User info */}
      <div className="flex flex-row items-center gap-3 rounded-2xl bg-white/60 p-3 border border-white/70 shadow-sm dark:bg-neutral-800/50 dark:border-white/5">
        <div className="flex size-12 shrink-0 overflow-hidden items-center justify-center rounded-full bg-gradient-to-tr from-violet-500 to-indigo-500 text-white shadow-md">
          {profilePic ? (
            <img
              src={profilePic}
              alt="User Avatar"
              className="h-full w-full object-cover"
            />
          ) : (
            <UserRoundIcon size={22} strokeWidth={2} />
          )}
        </div>

        <div className="flex min-w-0 flex-col">
          <h3
            className="truncate text-base font-bold text-slate-800 dark:text-slate-100"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {username || "Leitor"}
          </h3>
          <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">
            {email}
          </p>
        </div>
      </div>

      {/* Menu items */}
      <div className="flex flex-col gap-1 pt-1">
        <Link
          to="/myshelf"
          className={`${menuItemBase} text-slate-700 hover:bg-violet-500/10 hover:text-violet-700 dark:text-slate-200 dark:hover:bg-violet-500/20 dark:hover:text-violet-300`}
        >
          <LibraryIcon size={18} className="text-violet-600 dark:text-violet-400" />
          <span>Minha Estante</span>
        </Link>

        <button
          onClick={handleLogout}
          className={`${menuItemBase} text-rose-600 hover:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20`}
        >
          <LogOutIcon size={18} />
          <span>Sair da conta</span>
        </button>
      </div>
    </div>
  );
}

function GuestMenu() {
  const { openAuthModal } = useAuth();

  return (
    <div className="flex w-60 flex-col items-center gap-4 p-3 text-center">
      <div className="flex flex-col items-center gap-2 pt-2">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-md">
          <Sparkles size={22} />
        </div>
        <div>
          <h3
            className="text-base font-bold text-slate-800 dark:text-slate-100"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Sua conta Okbo
          </h3>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
            Faça login para salvar seus livros e acompanhar suas metas.
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col gap-2 pt-1">
        <button
          onClick={openAuthModal}
          className="w-full rounded-2xl py-2.5 text-sm font-bold text-white shadow-md shadow-violet-500/25 transition-transform hover:scale-105 active:scale-95"
          style={{ background: "linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)" }}
        >
          Entrar
        </button>
        <button
          onClick={openAuthModal}
          className="glass-pill w-full rounded-2xl py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200"
        >
          Criar conta
        </button>
      </div>
    </div>
  );
}

// --- MAIN COMPONENT ---
export function ProfileModal() {
  const { session } = useAuth();
  const { profile } = useProfile();

  return (
    <div className="glass-elevated absolute top-13 right-0 z-50 mt-1 flex flex-col items-center rounded-3xl p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
      {session ? (
        <UserMenu
          email={session.user?.email}
          username={profile.username || session.user?.user_metadata?.username}
          profilePic={profile.avatar_url}
        />
      ) : (
        <GuestMenu />
      )}
    </div>
  );
}
