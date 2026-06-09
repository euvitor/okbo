import { Link, useLocation } from "react-router-dom";
import { useThemeContext } from "../context/ThemeContext";
import { MoonIcon, SunIcon, UserRoundIcon } from "lucide-react";
import { SearchBar } from "./SearchBar";
import { useState } from "react";
import { ProfileModal } from "./ProfileModal";

export function Header() {
  const { theme, toggleTheme } = useThemeContext();
  const location = useLocation();
  const isHome = location.pathname === "/";
  const showSearch = !isHome;
  const [showProfile, setShowProfile] = useState<boolean>(false);

  return (
    <header className="header-fade fixed inset-x-0 top-0 z-50 h-30">
      <div className="mx-auto flex h-full w-full max-w-300 items-start justify-between px-6 py-6">
        {!isHome && (
          <Link
            to="/"
            className="font-display mt-1.5 mr-auto shrink-0 text-3xl font-bold"
          >
            okbo<span className="text-violet-500">.</span>
          </Link>
        )}

        {showSearch && (
          <div className="mx-auto flex max-w-125 flex-1 justify-center">
            <SearchBar variant="compact" />
          </div>
        )}

        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="ml-auto size-8 shrink-0 rounded-full p-1.5 text-slate-500 transition-all hover:text-violet-500 dark:text-slate-400"
        >
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </button>
        <button
          onClick={() => setShowProfile(!showProfile)}
          aria-label="Profile"
          className="ml-1 size-8 shrink-0 rounded-full p-1.5 text-slate-500 transition-all hover:text-violet-500 dark:text-slate-400"
        >
          <UserRoundIcon />
        </button>
        {showProfile && <ProfileModal/>}
      </div>
    </header>
  );
}
