import { SearchBar } from "../components/SearchBar";
import { Sparkles, BookOpen, Compass, BookmarkCheck } from "lucide-react";

export function Home() {
  return (
    <div className="flex h-full flex-1 flex-col items-center justify-center gap-8 -mt-10 py-10">

      {/* Pill Badge */}
      <div className="glass-pill inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold text-violet-700 shadow-sm dark:text-violet-300">
        <Sparkles className="size-3.5 text-amber-500 animate-pulse" />
        <span>Sua biblioteca pessoal & buscador literário</span>
      </div>

      {/* Logo headline */}
      <div className="flex flex-col items-center gap-3 text-center">
        <h1
          className="text-8xl font-bold tracking-tight sm:text-9xl select-none"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
        >
          okbo
          <span className="inline-block text-violet-500 drop-shadow-[0_4px_16px_rgba(124,58,237,0.45)] transition-transform duration-300 hover:scale-125">
            .
          </span>
        </h1>

        <p
          className="text-lg font-medium tracking-wide sm:text-xl"
          style={{ color: "var(--color-ink-muted)" }}
        >
          Descubra <span className="font-semibold text-violet-600 dark:text-violet-400">novas histórias</span>, organize suas estantes e leia sem pressa.
        </p>
      </div>

      {/* Search Bar with luminous aura */}
      <div className="relative w-full max-w-150 mt-2">
        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-violet-500/20 via-rose-500/20 to-sky-500/20 blur-md transition-opacity duration-300 group-hover:opacity-100" />
        <SearchBar variant="hero" />
      </div>

      {/* Quick Discovery Micro-Badges */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-sm">
        <div className="glass flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-slate-700 transition-all hover:scale-105 hover:bg-white/80 dark:text-slate-200 dark:hover:bg-neutral-800/80">
          <BookOpen className="size-3.5 text-violet-500" />
          <span>Milhões de Livros</span>
        </div>
        <div className="glass flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-slate-700 transition-all hover:scale-105 hover:bg-white/80 dark:text-slate-200 dark:hover:bg-neutral-800/80">
          <Compass className="size-3.5 text-rose-500" />
          <span>Filtros Avançados</span>
        </div>
        <div className="glass flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-slate-700 transition-all hover:scale-105 hover:bg-white/80 dark:text-slate-200 dark:hover:bg-neutral-800/80">
          <BookmarkCheck className="size-3.5 text-emerald-500" />
          <span>Estantes & Metas</span>
        </div>
      </div>
    </div>
  );
}
