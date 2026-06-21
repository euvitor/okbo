// --- IMPORTS ---
import { LogOutIcon, UserRoundIcon, LibraryIcon } from "lucide-react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";
import { useProfile } from "../hooks/useProfile";

// --- HANDLERS ---
async function handleLogout() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Error logging out:", error.message);
    return;
  }
}

// --- SUBCOMPONENTS ---
function UserMenu({
  email,
  username,
  profilePic
}: {
  email: string | undefined;
  username: string | null | undefined; // Atualizado para aceitar null do banco
  profilePic: string | null | undefined; // Atualizado para aceitar null do banco
}) {
  return (
    <div className="flex w-64 flex-col gap-4 p-2">
      <div className="flex flex-row items-center gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div className="flex overflow-hidden h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
          {profilePic ? (
            <img
              src={profilePic}
              alt="User Avatar"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <UserRoundIcon size={24} />
          )}
        </div>

        <div className="flex min-w-0 flex-col">
          <h3 className="font-display truncate text-xl font-bold text-slate-800 dark:text-slate-100">
            {username || "User"}
          </h3>
          <p className="truncate text-sm text-slate-500 dark:text-slate-400">
            {email}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <Link
          to="/myshelf"
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-violet-500/10 hover:text-violet-600 dark:text-slate-300 dark:hover:text-violet-400"
        >
          <LibraryIcon size={18} />
          My Shelf
        </Link>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-500/10 dark:text-red-400"
        >
          <LogOutIcon size={18} />
          Logout
        </button>
      </div>
    </div>
  );
}

function GuestMenu() {
  const { openAuthModal } = useAuth();

  return (
    <div className="flex w-56 flex-col items-center gap-4 p-4 text-center">
      <div className="flex flex-col items-center gap-1">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
          <UserRoundIcon size={24} strokeWidth={1.5} />
        </div>
        <h3 className="font-display text-lg font-bold text-slate-800 dark:text-slate-100">
          Not logged in
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Sign in to save your books.
        </p>
      </div>

      <div className="flex w-full flex-col gap-2">
        <button
          onClick={openAuthModal}
          className="w-full rounded-full bg-violet-500 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-600"
        >
          Login
        </button>
        <button
          onClick={openAuthModal}
          className="w-full rounded-full px-6 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Sign Up
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
    <div className="glass absolute top-8 right-0 z-40 mt-2 flex flex-col items-center rounded-3xl border border-white/40 bg-white/95 p-1 shadow-xl shadow-violet-500/10 dark:border-white/10 dark:bg-neutral-900/95">
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
