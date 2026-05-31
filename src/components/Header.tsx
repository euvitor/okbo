import { Link, useLocation } from "react-router-dom";
import { useThemeContext } from "../context/ThemeContext";
import { MoonIcon, SunIcon } from "lucide-react";
import { SearchBar } from "./SearchBar";

export function Header() {
    const { theme, toggleTheme } = useThemeContext()
    const location = useLocation()
    const isHome = location.pathname === '/'
    const showSearch = !isHome

    return (
        <header className="fixed top-0 inset-x-0 z-50 h-30 header-fade">
            <div className="max-w-[1200px] mx-auto w-full h-full px-6 py-6 flex justify-between items-start">
                {!isHome && (
                    <Link to="/" className="mt-1.5 font-display text-3xl font-bold mr-auto shrink-0">
                        okbo<span className="text-violet-500">.</span>
                    </Link>
                )}

                {showSearch && (
                    <div className="max-w-[500px] mx-auto flex-1 flex justify-center">
                        <SearchBar variant="compact" />
                    </div>
                )}

                <button
                    onClick={toggleTheme}
                    aria-label="Toggle theme"
                    className="size-8 p-1.5 rounded-full text-slate-500 dark:text-slate-400 transition-all hover:text-violet-500 ml-auto shrink-0"
                >
                    {theme === "dark" ? <SunIcon /> : <MoonIcon />}
                </button>
            </div>
        </header>
    )
}