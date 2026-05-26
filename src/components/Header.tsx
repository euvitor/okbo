import { Link, useLocation } from "react-router-dom";
import { useThemeContext } from "../context/ThemeContext";
import { MoonIcon, SunIcon } from "lucide-react";
import { SearchBar } from "./SearchBar";

export function Header() {
    const { theme, toggleTheme } = useThemeContext()
    const location = useLocation()
    const isSearch = location.pathname === '/search'
    const isHome = location.pathname === '/'

    return (
        <header className="fixed top-0 inset-x-0 z-50 h-16 flex items-center gap-4 px-6
            bg-linear-to-b from-neutral-50/90 to-neutral-50/30
            dark:from-neutral-950/90 dark:to-neutral-950/30
            backdrop-blur-md border-b border-white/30 dark:border-white/5">

            {!isHome && (
                <Link to="/" className="font-display text-xl font-bold shrink-0">
                    okbo<span className="text-violet-500">.</span>
                </Link>
            )}

            {isSearch && (
                <div className="flex-1 flex justify-center">
                    <SearchBar variant="compact" />
                </div>
            )}

            <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="size-8 p-1.5 rounded-lg text-slate-500 dark:text-slate-400 transition-all hover:bg-violet-500/10 hover:text-violet-500 ml-auto shrink-0"
            >
                {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>
        </header>
    )
}