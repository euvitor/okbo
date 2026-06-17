// --- IMPORTS ---
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Select from "@radix-ui/react-select";
import {
  ChevronDownIcon,
  SearchIcon,
  SlidersHorizontalIcon,
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
  { value: "all", label: "All" },
  { value: "title", label: "Title" },
  { value: "author", label: "Author" },
  { value: "isbn", label: "ISBN" },
] as const;

const GENRE_OPTIONS = [
  { value: "fiction", label: "Fiction" },
  { value: "non-fiction", label: "Non-fiction" },
  { value: "mystery", label: "Mystery" },
  { value: "romance", label: "Romance" },
  { value: "science-fiction", label: "Science Fiction" },
  { value: "fantasy", label: "Fantasy" },
] as const;

const LANGUAGE_OPTIONS = [
  { value: "pt", label: "Português" },
  { value: "en", label: "English" },
] as const;

// --- SUB-COMPONENTS ---
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
      <Select.Trigger className="glass flex w-full cursor-pointer flex-row items-center justify-between rounded-2xl px-3 py-2 text-sm text-slate-600 outline-none dark:text-slate-400">
        <Select.Value placeholder={placeholder} />
        <Select.Icon>
          <ChevronDownIcon className="h-4 w-4 text-slate-400 dark:text-slate-500" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Content className="glass z-50 overflow-hidden rounded-3xl">
        <Select.Viewport className="p-1">
          <Select.Item
            value="none"
            className="cursor-pointer rounded-3xl px-3 py-1.5 text-sm text-slate-600 outline-none hover:bg-violet-500/10 data-[state=checked]:text-violet-500 dark:text-slate-400"
          >
            <Select.ItemText>{placeholder}</Select.ItemText>
          </Select.Item>
          {options.map((opt) => (
            <Select.Item
              key={opt.value}
              value={opt.value}
              className="cursor-pointer rounded-3xl px-3 py-1.5 text-sm text-slate-600 outline-none hover:bg-violet-500/10 data-[state=checked]:text-violet-500 dark:text-slate-400"
            >
              <Select.ItemText>{opt.label}</Select.ItemText>
            </Select.Item>
          ))}
        </Select.Viewport>
      </Select.Content>
    </Select.Root>
  );
}

// --- MAIN COMPONENT ---
export function SearchBar({ variant }: SearchBarProps) {
  // State & Refs
  const navigate = useNavigate();
  const searchContainerRef = useRef<HTMLFormElement>(null);

  const [query, setQuery] = useState<string>("");
  const [filters, setFilters] = useState<SearchFilters>({ field: "all" });
  const [isFiltersOpen, setIsFiltersOpen] = useState<boolean>(false);
  const [isSelectOpen, setIsSelectOpen] = useState<boolean>(false);

  //  Custom Hooks
  useOnClickOutside(
    searchContainerRef,
    () => setIsFiltersOpen(false),
    !isSelectOpen,
  );

  // Derived Values
  const isHero = variant === "hero";

  // Handlers
  const submitHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams();

    params.set("query", query);
    params.set("field", filters.field);
    if (filters.lang) params.set("lang", filters.lang);
    if (filters.genre) params.set("genre", filters.genre);

    navigate(`/search?${params.toString()}`);
  };

  // Render
  return (
    <form
      onSubmit={submitHandler}
      ref={searchContainerRef}
      className={`relative gap-1 ${isHero ? "w-full max-w-135" : "w-full"}`}
    >
      <div className="glass flex w-full flex-row gap-2 rounded-full px-1 py-1">
        <button type="button">
          <SlidersHorizontalIcon
            onClick={() => setIsFiltersOpen((prev) => !prev)}
            className={`size-8 rounded-full p-2 text-slate-500 transition-all hover:bg-violet-500/10 hover:text-violet-500 dark:text-slate-400 ${isFiltersOpen ? "bg-violet-500/10 text-violet-500" : ""}`}
          />
        </button>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a book"
          className="w-full border-none bg-transparent text-neutral-900 outline-none placeholder:text-slate-400 dark:text-neutral-100 dark:placeholder:text-slate-500"
        />

        <button type="submit">
          <SearchIcon className="size-8 rounded-full p-2 text-slate-500 transition-all hover:bg-violet-500/10 hover:text-violet-500 dark:text-slate-400" />
        </button>
      </div>

      {isFiltersOpen && (
        <div className="absolute top-full left-0 z-10 mt-1 flex w-full flex-col gap-1 rounded-3xl border border-white/40 bg-white/95 p-1 shadow-lg shadow-violet-500/10 dark:border-white/10 dark:bg-neutral-900/95">
          <div className="flex flex-row gap-2">
            {FIELD_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFilters({ ...filters, field: option.value })}
                className={
                  filters.field === option.value
                    ? "w-full rounded-3xl bg-violet-500 px-3 py-1 text-sm text-white shadow-md"
                    : "w-full rounded-xl px-3 py-1 text-sm text-slate-500 hover:bg-violet-500/10 dark:text-slate-400"
                }
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="flex flex-row gap-1">
            <FilterSelect
              value={filters.lang ?? ""}
              onValueChange={(val) =>
                setFilters({
                  ...filters,
                  lang: val === "none" ? undefined : (val as "pt" | "en"),
                })
              }
              placeholder="All Languages"
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
              placeholder="All Genres"
              options={[...GENRE_OPTIONS]}
              onOpenChange={setIsSelectOpen}
            />
          </div>
        </div>
      )}
    </form>
  );
}
