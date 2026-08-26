// --- IMPORTS ---
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Select from "@radix-ui/react-select";
import {
  ChevronDownIcon,
  SearchIcon,
  SlidersHorizontalIcon,
  CheckIcon,
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
        className="glass flex w-full cursor-pointer flex-row items-center justify-between gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium outline-none transition-all hover:brightness-[0.97] dark:hover:brightness-110"
        style={{ color: "var(--color-ink-muted)" }}
      >
        <Select.Value placeholder={placeholder} />
        <Select.Icon className="shrink-0">
          <ChevronDownIcon className="size-4" style={{ color: "var(--color-ink-faint)" }} />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          className="glass-elevated z-50 overflow-hidden rounded-2xl"
          position="popper"
          sideOffset={6}
        >
          <Select.Viewport className="p-1.5">
            <Select.Item
              value="none"
              className="flex cursor-pointer items-center justify-between rounded-lg px-3.5 py-2.5 text-sm outline-none transition-colors hover:bg-black/5 dark:hover:bg-white/6 data-[state=checked]:font-medium"
              style={{ color: "var(--color-ink-muted)" }}
            >
              <Select.ItemText>{placeholder}</Select.ItemText>
              <Select.ItemIndicator>
                <CheckIcon className="size-4" style={{ color: "var(--color-accent)" }} />
              </Select.ItemIndicator>
            </Select.Item>

            {options.map((opt) => (
              <Select.Item
                key={opt.value}
                value={opt.value}
                className="flex cursor-pointer items-center justify-between rounded-lg px-3.5 py-2.5 text-sm outline-none transition-colors hover:bg-black/5 dark:hover:bg-white/6 data-[state=checked]:font-medium"
                style={{ color: "var(--color-ink)" }}
              >
                <Select.ItemText>{opt.label}</Select.ItemText>
                <Select.ItemIndicator>
                  <CheckIcon className="size-4" style={{ color: "var(--color-accent)" }} />
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
    const params = new URLSearchParams();
    params.set("query", query);
    params.set("field", filters.field);
    if (filters.lang) params.set("lang", filters.lang);
    if (filters.genre) params.set("genre", filters.genre);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <form
      onSubmit={submitHandler}
      ref={searchContainerRef}
      className={`relative ${isHero ? "w-full" : "w-full"}`}
    >
      {/* Main pill */}
      <div
        className={`glass flex w-full flex-row items-center gap-1.5 rounded-full transition-all duration-200 ${isHero ? "px-3.5 py-2.5 sm:py-3" : "px-2 py-1.5"
          }`}
      >
        {/* Filter toggle */}
        <button
          type="button"
          aria-label="Toggle filters"
          onClick={() => setIsFiltersOpen((prev) => !prev)}
          className={`flex ${isHero ? "size-9 sm:size-10" : "size-8 sm:size-9"
            } shrink-0 items-center justify-center rounded-full transition-all duration-200 active:scale-95 ${isFiltersOpen
              ? "bg-violet-100 dark:bg-violet-900/40"
              : "hover:bg-black/5 dark:hover:bg-white/8"
            }`}
          style={{
            color: isFiltersOpen
              ? "var(--color-accent)"
              : "var(--color-ink-muted)",
          }}
        >
          <SlidersHorizontalIcon className="size-4" />
        </button>

        {/* Input */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            isHero ? "Search for a book, author or ISBN…" : "Search books…"
          }
          className={`flex-1 border-none bg-transparent outline-none min-w-0 px-1 ${isHero ? "text-base sm:text-lg" : "text-sm"
            }`}
          style={{
            color: "var(--color-ink)",
            fontFamily: "var(--font-sans)",
          }}
        />

        {/* Submit */}
        <button
          type="submit"
          aria-label="Search"
          className={`flex ${isHero ? "size-9 sm:size-10" : "size-8 sm:size-9"
            } shrink-0 items-center justify-center rounded-full transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/8 active:scale-95`}
          style={{ color: "var(--color-ink-muted)" }}
        >
          <SearchIcon className="size-4" />
        </button>
      </div>

      {/* Filters panel */}
      {isFiltersOpen && (
        <div className="glass-elevated absolute left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 top-[calc(100%+8px)] z-20 flex w-[calc(100vw-2rem)] max-w-sm sm:w-96 flex-col gap-2.5 rounded-2xl p-3.5 shadow-2xl">
          {/* Field chips */}
          <div className="grid grid-cols-4 gap-1.5">
            {FIELD_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFilters({ ...filters, field: option.value })}
                className={`rounded-full px-2 py-1.5 sm:px-3 text-xs sm:text-sm font-medium text-center truncate transition-all duration-150 ${filters.field === option.value
                  ? "bg-violet-600 text-white shadow-sm"
                  : "hover:bg-black/5 dark:hover:bg-white/8"
                  }`}
                style={{
                  color:
                    filters.field === option.value
                      ? "white"
                      : "var(--color-ink-muted)",
                }}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Select dropdowns */}
          <div className="grid grid-cols-2 gap-2">
            <FilterSelect
              value={filters.lang ?? ""}
              onValueChange={(val) =>
                setFilters({
                  ...filters,
                  lang: val === "none" ? undefined : (val as "pt" | "en"),
                })
              }
              placeholder="Language"
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
              placeholder="Genre"
              options={[...GENRE_OPTIONS]}
              onOpenChange={setIsSelectOpen}
            />
          </div>
        </div>
      )}
    </form>
  );
}
