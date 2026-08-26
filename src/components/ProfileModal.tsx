// --- IMPORTS ---
import { LogOutIcon, UserRoundIcon, LibraryIcon } from "lucide-react";
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
    "flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-[15px] sm:text-base font-medium transition-all duration-150 hover:bg-black/5 dark:hover:bg-white/6 active:scale-[0.98]";

  return (
    <div className="flex w-[calc(100vw-2.5rem)] max-w-64 sm:w-64 flex-col gap-3.5 p-2.5">
      {/* User info */}
      <div
        className="flex flex-row items-center gap-3.5 border-b pb-3.5"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div
          className="flex h-13 w-13 shrink-0 overflow-hidden items-center justify-center rounded-full shadow-sm"
          style={{
            background: "var(--color-paper-sunken)",
            border: "1.5px solid var(--color-border-mid)",
            color: "var(--color-ink-faint)",
          }}
        >
          {profilePic ? (
            <img
              src={profilePic}
              alt="User Avatar"
              className="h-full w-full object-cover"
            />
          ) : (
            <UserRoundIcon size={24} strokeWidth={1.5} />
          )}
        </div>

        <div className="flex min-w-0 flex-col">
          <h3
            className="truncate text-base sm:text-lg font-semibold"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
          >
            {username || "User"}
          </h3>
          <p className="truncate text-xs sm:text-sm" style={{ color: "var(--color-ink-muted)" }}>
            {email}
          </p>
        </div>
      </div>

      {/* Menu items */}
      <div className="flex flex-col gap-1">
        <Link
          to="/myshelf"
          className={menuItemBase}
          style={{ color: "var(--color-ink-muted)" }}
        >
          <LibraryIcon size={18} strokeWidth={1.75} />
          My Shelf
        </Link>

        <button
          onClick={handleLogout}
          className={`${menuItemBase} text-red-600 dark:text-red-400 hover:bg-red-500/10`}
        >
          <LogOutIcon size={18} strokeWidth={1.75} />
          Logout
        </button>
      </div>
    </div>
  );
}

function GuestMenu() {
  const { openAuthModal } = useAuth();

  return (
    <div className="flex w-[calc(100vw-2.5rem)] max-w-60 sm:w-60 flex-col items-center gap-4 p-4 text-center">
      <div className="flex flex-col items-center gap-2.5">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-full shadow-sm"
          style={{
            background: "var(--color-paper-sunken)",
            border: "1.5px solid var(--color-border)",
            color: "var(--color-ink-faint)",
          }}
        >
          <UserRoundIcon size={24} strokeWidth={1.5} />
        </div>
        <div>
          <h3
            className="text-lg font-semibold"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
          >
            Not logged in
          </h3>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-ink-muted)" }}>
            Sign in to save your books.
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col gap-2.5">
        <button
          onClick={openAuthModal}
          className="w-full rounded-full py-2.5 sm:py-3 text-base font-medium text-white transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
          style={{ background: "var(--color-accent)" }}
        >
          Login
        </button>
        <button
          onClick={openAuthModal}
          className="w-full rounded-full py-2.5 sm:py-3 text-base font-medium transition-all duration-150 hover:bg-black/5 dark:hover:bg-white/6"
          style={{ color: "var(--color-ink-muted)" }}
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
    <div
      className="glass-elevated absolute top-10 sm:top-12 right-0 z-40 mt-1 flex flex-col items-center rounded-2xl shadow-2xl max-w-[calc(100vw-1.5rem)]"
      style={{ minWidth: "fit-content" }}
    >
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
