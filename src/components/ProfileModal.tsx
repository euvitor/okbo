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
    "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 hover:bg-black/5 dark:hover:bg-white/6 active:scale-[0.98]";

  return (
    <div className="flex w-60 flex-col gap-3 p-2">
      {/* User info */}
      <div
        className="flex flex-row items-center gap-3 border-b pb-3"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div
          className="flex h-12 w-12 shrink-0 overflow-hidden items-center justify-center rounded-full"
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
            <UserRoundIcon size={20} strokeWidth={1.5} />
          )}
        </div>

        <div className="flex min-w-0 flex-col">
          <h3
            className="truncate text-base font-semibold"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
          >
            {username || "User"}
          </h3>
          <p className="truncate text-xs" style={{ color: "var(--color-ink-muted)" }}>
            {email}
          </p>
        </div>
      </div>

      {/* Menu items */}
      <div className="flex flex-col gap-0.5">
        <Link
          to="/myshelf"
          className={menuItemBase}
          style={{ color: "var(--color-ink-muted)" }}
        >
          <LibraryIcon size={16} strokeWidth={1.5} />
          My Shelf
        </Link>

        <button
          onClick={handleLogout}
          className={menuItemBase}
          style={{ color: "#DC2626" }}
        >
          <LogOutIcon size={16} strokeWidth={1.5} />
          Logout
        </button>
      </div>
    </div>
  );
}

function GuestMenu() {
  const { openAuthModal } = useAuth();

  return (
    <div className="flex w-52 flex-col items-center gap-4 p-4 text-center">
      <div className="flex flex-col items-center gap-2">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-full"
          style={{
            background: "var(--color-paper-sunken)",
            border: "1.5px solid var(--color-border)",
            color: "var(--color-ink-faint)",
          }}
        >
          <UserRoundIcon size={20} strokeWidth={1.5} />
        </div>
        <div>
          <h3
            className="text-base font-semibold"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
          >
            Not logged in
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-ink-muted)" }}>
            Sign in to save your books.
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col gap-2">
        <button
          onClick={openAuthModal}
          className="w-full rounded-full py-2.5 text-sm font-medium text-white transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
          style={{ background: "var(--color-accent)" }}
        >
          Login
        </button>
        <button
          onClick={openAuthModal}
          className="w-full rounded-full py-2.5 text-sm font-medium transition-all duration-150 hover:bg-black/5 dark:hover:bg-white/6"
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
      className="glass-elevated absolute top-10 right-0 z-40 mt-2 flex flex-col items-center rounded-2xl"
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
