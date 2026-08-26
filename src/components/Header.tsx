import { Link, useLocation } from "react-router-dom";
import { useThemeContext } from "../context/ThemeContext";
import { MoonIcon, SunIcon, UserRoundIcon } from "lucide-react";
import { SearchBar } from "./SearchBar";
import { useRef, useState } from "react";
import { ProfileModal } from "./ProfileModal";
import { useOnClickOutside } from "../hooks/useOnClickOutside";

export function Header() {
  const { theme, toggleTheme } = useThemeContext();
  const location = useLocation();
  const isHome = location.pathname === "/";
  const showSearch = !isHome;
  const [showProfile, setShowProfile] = useState<boolean>(false);
  const profileContainerRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(profileContainerRef, () => { setShowProfile(false); });

  const iconBtnClass =
    "flex size-10 shrink-0 items-center justify-center rounded-full transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/8 active:scale-95";

  return (
    <header className="header-fade fixed inset-x-0 top-0 z-50 h-24 sm:h-28">
      <div className="mx-auto flex h-full w-full max-w-300 items-center justify-between px-4 sm:px-6">

        {/* Logo — only when not on home */}
        {!isHome && (
          <Link
            to="/"
            className="shrink-0 text-3xl font-semibold tracking-tight transition-opacity hover:opacity-70"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
          >
            okbo<span style={{ color: "var(--color-accent)" }}>.</span>
          </Link>
        )}

        {/* Search bar — compact, proportionally constrained so icons & fonts stay full size */}
        {showSearch && (
          <div className="mx-2 flex w-full max-w-56 xs:max-w-62 sm:max-w-88 md:max-w-135 flex-1 justify-center min-w-0">
            <SearchBar variant="compact" />
          </div>
        )}

        {/* Actions */}
        <div className="ml-auto flex items-center gap-1.5 shrink-0">
          <button
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className={iconBtnClass}
            style={{ color: "var(--color-ink-muted)" }}
          >
            {theme === "dark" ? (
              <SunIcon className="size-5" />
            ) : (
              <MoonIcon className="size-5" />
            )}
          </button>

          <div ref={profileContainerRef} className="relative flex items-center">
            <button
              onClick={() => setShowProfile(!showProfile)}
              aria-label="Profile"
              className={iconBtnClass}
              style={{ color: "var(--color-ink-muted)" }}
            >
              <UserRoundIcon className="size-5" />
            </button>
            {showProfile && <ProfileModal />}
          </div>
        </div>
      </div>
    </header>
  );
}
