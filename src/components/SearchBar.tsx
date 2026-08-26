// --- IMPORTS ---
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Select from "@radix-ui/react-select";
import {
  ChevronDownIcon,
  SearchIcon,
  SlidersHorizontalIcon,
  CheckIcon,
  SparklesIcon,
} from "lucide-react";

import { useOnClickOutside } from "../hooks/useOnClickOutside";
import type { SearchFilters } from "../types/search";

// --- INTERFACES ---
interface SearchBarProps {
  variant?: "hero" | "compact";
}

interface FilterSelectProps {
  value: string;
  onValueChange: (val: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
  onOpenChange?: (open: boolean) => void;
}

// --- CONSTANTS ---
const FIELD_OPTIONS = [
  { value: "all", label: "Todos os campos" },
  { value: "title", label: "Título" },
  { value: "author", label: "Autor" },
  { value: "isbn", label: "ISBN" },
] as const;

const GENRE_OPTIONS = [
  { value: "fiction", label: "Ficção" },
  { value: "non-fiction", label: "Não-Ficção" },
  { value: "mystery", label: "Mistério & Suspense" },
  { value: "romance", label: "Romance" },
  { value: "science-fiction", label: "Ficção Científica" },
  { value: "fantasy", label: "Fantasia" },
  { value: "biography", label: "Biografia" },
  { value: "history", label: "História" },
  { value: "philosophy", label: "Filosofia" },
] as const;

const LANGUAGE_OPTIONS = [
  { value: "pt", label: "Português" },
  { value: "en", label: "English" },
] as const;

// --- SUBCOMPONENTS ---
function FilterSelect({
  value,
  onValueChange,
  placeholder,
  options,
  onOpenChange,
}: FilterSelectProps) {
  return (
    <Select.Root
      value={value}
      onValueChange={onValueChange}
      onOpenChange={onOpenChange}
    >
      <Select.Trigger
        className="glass flex w-full cursor-pointer flex-row items-center justify-between gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium outline-none transition-all duration-200 hover:scale-[1.01] hover:bg-white/90 dark:hover:bg-neutral-800/90"
        style={{ color: "var(--color-ink)" }}
      >
        <Select.Value placeholder={placeholder} />
        <Select.Icon className="shrink-0">
          <ChevronDownIcon className="size-4 text-slate-400 dark:text-slate-500" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          className="glass-elevated z-50 min-w-48 overflow-hidden rounded-2xl shadow-xl"
          position="popper"
          sideOffset={6}
        >
          <Select.Viewport className="p-1.5">
            <Select.Item
              value="none"
              className="flex cursor-pointer items-center justify-between rounded-xl px-3.5 py-2 text-sm font-medium outline-none transition-colors hover:bg-violet-500/10 hover:text-violet-600 dark:hover:bg-violet-500/20 data-[state=checked]:text-violet-600 dark:data-[state=checked]:text-violet-400"
              style={{ color: "var(--color-ink-muted)" }}
            >
              <Select.ItemText>{placeholder}</Select.ItemText>
              <Select.ItemIndicator>
                <CheckIcon className="size-4 text-violet-600 dark:text-violet-400" />
              </Select.ItemIndicator>
            </Select.Item>

            {options.map((opt) => (
              <Select.Item
                key={opt.value}
                value={opt.value}
                className="flex cursor-pointer items-center justify-between rounded-xl px-3.5 py-2 text-sm font-medium outline-none transition-colors hover:bg-violet-500/10 hover:text-violet-600 dark:hover:bg-violet-500/20 data-[state=checked]:text-violet-600 dark:data-[state=checked]:text-violet-400"
                style={{ color: "var(--color-ink)" }}
              >
                <Select.ItemText>{opt.label}</Select.ItemText>
                <Select.ItemIndicator>
                  <CheckIcon className="size-4 text-violet-600 dark:text-violet-400" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

// --- MAIN COMPONENT ---
export function SearchBar({ variant }: SearchBarProps) {
  const navigate = useNavigate();
  const searchContainerRef = useRef<HTMLFormElement>(null);

  const [query, setQuery] = useState<string>("");
  const [filters, setFilters] = useState<SearchFilters>({ field: "all" });
  const [isFiltersOpen, setIsFiltersOpen] = useState<boolean>(false);
  const [isSelectOpen, setIsSelectOpen] = useState<boolean>(false);

  useOnClickOutside(
    searchContainerRef,
    () => setIsFiltersOpen(false),
    !isSelectOpen,
  );

  const isHero = variant === "hero";

  const submitHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query.trim()) return;
    const params = new URLSearchParams();
    params.set("query", query);
    params.set("field", filters.field);
    if (filters.lang) params.set("lang", filters.lang);
    if (filters.genre) params.set("genre", filters.genre);
    navigate(`/search?${params.toString()}`);
  };

  const hasActiveFilters = filters.field !== "all" || Boolean(filters.lang) || Boolean(filters.genre);

  return (
    <form
      onSubmit={submitHandler}
      ref={searchContainerRef}
      className="relative w-full"
    >
      {/* Main Glass Pill Input */}
      <div
        className={`glass flex w-full flex-row items-center gap-2 rounded-full transition-all duration-300 ${
          isHero
            ? "p-2 sm:p-2.5 shadow-[0_12px_36px_rgba(124,58,237,0.12)] hover:shadow-[0_16px_44px_rgba(124,58,237,0.18)]"
            : "p-1.5 shadow-sm"
        }`}
      >
        {/* Filter Toggle Button */}
        <button
          type="button"
          aria-label="Toggle filters"
          onClick={() => setIsFiltersOpen((prev) => !prev)}
          className={`relative flex shrink-0 items-center justify-center rounded-full transition-all duration-300 hover:scale-105 active:scale-95 ${
            isHero ? "size-11" : "size-9"
          } ${
            isFiltersOpen || hasActiveFilters
              ? "bg-violet-600 text-white shadow-md shadow-violet-500/30"
              : "hover:bg-violet-500/10 hover:text-violet-600 dark:hover:bg-violet-500/20"
          }`}
          style={{
            color: isFiltersOpen || hasActiveFilters ? "white" : "var(--color-ink-muted)",
          }}
        >
          <SlidersHorizontalIcon className={isHero ? "size-5" : "size-4.5"} />
          {hasActiveFilters && !isFiltersOpen && (
            <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-neutral-900" />
          )}
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            isHero
              ? "Buscar por título, autor, gênero ou ISBN..."
              : "Buscar livros..."
          }
          className={`flex-1 border-none bg-transparent outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 ${
            isHero ? "text-base sm:text-lg font-medium px-2" : "text-sm font-normal px-1"
          }`}
          style={{
            color: "var(--color-ink)",
            fontFamily: "var(--font-sans)",
          }}
        />

        {/* Submit Search Button */}
        <button
          type="submit"
          aria-label="Search"
          className={`flex shrink-0 items-center justify-center rounded-full transition-all duration-300 hover:scale-105 active:scale-95 ${
            isHero
              ? "size-11 bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
              : "size-9 hover:bg-violet-500/10 hover:text-violet-600 dark:hover:bg-violet-500/20 text-slate-500"
          }`}
        >
          <SearchIcon className={isHero ? "size-5" : "size-4.5"} />
        </button>
      </div>

      {/* Elevated Filter Panel */}
      {isFiltersOpen && (
        <div className="glass-elevated absolute left-0 top-[calc(100%+10px)] z-30 flex w-full flex-col gap-3.5 rounded-3xl p-4 sm:p-5 shadow-2xl transition-all animate-in fade-in slide-in-from-top-2 duration-200">
          
          <div className="flex items-center justify-between px-1">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
              <SparklesIcon className="size-3.5" />
              Filtros de Pesquisa
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => setFilters({ field: "all" })}
                className="text-xs font-semibold text-slate-400 hover:text-rose-500 transition-colors"
              >
                Limpar filtros
              </button>
            )}
          </div>

          {/* Field Selection Chips */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {FIELD_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFilters({ ...filters, field: option.value })}
                className={`rounded-2xl py-2 px-3 text-xs font-semibold transition-all duration-200 active:scale-95 ${
                  filters.field === option.value
                    ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20"
                    : "glass hover:bg-white/80 dark:hover:bg-neutral-800/80 text-slate-700 dark:text-slate-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Dropdown Filters */}
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <FilterSelect
              value={filters.lang ?? ""}
              onValueChange={(val) =>
                setFilters({
                  ...filters,
                  lang: val === "none" ? undefined : (val as "pt" | "en"),
                })
              }
              placeholder="Todos os Idiomas"
              options={[...LANGUAGE_OPTIONS]}
              onOpenChange={setIsSelectOpen}
            />
            <FilterSelect
              value={filters.genre ?? ""}
              onValueChange={(val) =>
                setFilters({
                  ...filters,
                  genre: val === "none" ? undefined : val,
                })
              }
              placeholder="Todos os Gêneros"
              options={[...GENRE_OPTIONS]}
              onOpenChange={setIsSelectOpen}
            />
          </div>
        </div>
      )}
    </form>
  );
}
