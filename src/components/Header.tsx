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
    "glass-pill flex size-10.5 shrink-0 items-center justify-center rounded-full transition-all duration-300 hover:scale-105 active:scale-95";

  return (
    <header className="header-fade fixed inset-x-0 top-0 z-50 h-32">
      <div className="mx-auto flex h-full w-full max-w-300 items-start justify-between px-6 py-6 sm:px-8">

        {/* Logo — only when not on home */}
        {!isHome && (
          <Link
            to="/"
            className="group mt-1 mr-auto shrink-0 text-3xl font-bold tracking-tight transition-transform duration-300 hover:scale-105 sm:text-4xl"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
          >
            okbo<span className="inline-block text-violet-500 drop-shadow-[0_2px_8px_rgba(124,58,237,0.4)] transition-transform duration-300 group-hover:scale-125">.</span>
          </Link>
        )}

        {/* Search bar — compact, centered */}
        {showSearch && (
          <div className="mx-auto flex max-w-135 flex-1 justify-center px-4">
            <SearchBar variant="compact" />
          </div>
        )}

        {/* Action Buttons */}
        <div className="ml-auto flex items-center gap-2.5">
          <button
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className={iconBtnClass}
            style={{ color: "var(--color-ink)" }}
          >
            {theme === "dark" ? (
              <SunIcon className="size-5 text-amber-400 transition-transform duration-300 hover:rotate-45" />
            ) : (
              <MoonIcon className="size-5 text-violet-600 transition-transform duration-300 hover:-rotate-12" />
            )}
          </button>

          <div ref={profileContainerRef} className="relative flex items-center">
            <button
              onClick={() => setShowProfile(!showProfile)}
              aria-label="Profile"
              className={iconBtnClass}
              style={{ color: "var(--color-ink)" }}
            >
              <UserRoundIcon className="size-5 text-violet-600 dark:text-violet-400" />
            </button>
            {showProfile && <ProfileModal />}
          </div>
        </div>
      </div>
    </header>
  );
}
