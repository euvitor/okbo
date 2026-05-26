import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Select from "@radix-ui/react-select";
import { ChevronDownIcon, SearchIcon, SlidersHorizontalIcon } from "lucide-react";

import type { SearchFilters } from "../types/search";

interface SearchBarProps {
    variant?: 'hero' | 'compact';
}
interface FilterSelectProps {
    value: string;
    onValueChange: (val: string) => void;
    placeholder: string;
    options: { value: string; label: string }[];
}


const FIELD_OPTIONS = [
    { value: 'all', label: 'All' },
    { value: 'title', label: 'Title' },
    { value: 'author', label: 'Author' },
    { value: 'isbn', label: 'ISBN' },
] as const;
const GENRE_OPTIONS = [
    { value: 'fiction', label: 'Fiction' },
    { value: 'non-fiction', label: 'Non-fiction' },
    { value: 'mystery', label: 'Mystery' },
    { value: 'romance', label: 'Romance' },
    { value: 'science-fiction', label: 'Science Fiction' },
    { value: 'fantasy', label: 'Fantasy' },
] as const;
const LANGUAGE_OPTIONS = [
    { value: 'pt', label: 'Português' },
    { value: 'en', label: 'English' }
] as const;


function FilterSelect({ value, onValueChange, placeholder, options }: FilterSelectProps) {
    return (
        <Select.Root value={value} onValueChange={onValueChange}>
            <Select.Trigger className="glass flex flex-row items-center w-full justify-between px-3 py-2 rounded-xl text-sm text-slate-600 dark:text-slate-400 outline-none cursor-pointer">
                <Select.Value placeholder={placeholder} />
                <Select.Icon>
                    <ChevronDownIcon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                </Select.Icon>
            </Select.Trigger>

            <Select.Portal>
                <Select.Content className="glass rounded-xl overflow-hidden z-50">
                    <Select.Viewport className="p-1">
                        <Select.Item
                            key="placeholder"
                            value="none"
                            className="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 rounded-lg cursor-pointer outline-none hover:bg-violet-500/10 data-[state=checked]:text-violet-500"
                        >
                            <Select.ItemText>{placeholder}</Select.ItemText>
                        </Select.Item>

                        {options.map(opt => (
                            <Select.Item
                                key={opt.value}
                                value={opt.value}
                                className="px-3 py-1.5 text-sm text-slate-600 rounded-lg cursor-pointer outline-none hover:bg-violet-500/10 data-[state=checked]:text-violet-500"
                            >
                                <Select.ItemText>{opt.label}</Select.ItemText>
                            </Select.Item>
                        ))}
                    </Select.Viewport>
                </Select.Content>
            </Select.Portal>
        </Select.Root>
    );
}

/**
 * SearchBar - Componente principal de busca
 */
export function SearchBar({ variant }: SearchBarProps) {
    // --- Hooks & State ---
    const navigate = useNavigate();
    const [query, setQuery] = useState<string>('');
    const [filters, setFilters] = useState<SearchFilters>({ field: 'all' });
    const [isFiltersOpen, setIsFiltersOpen] = useState<boolean>(false);

    // --- Derived Values ---
    const isHero = variant === 'hero';

    // --- Handlers ---
    const submitHandler = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const params = new URLSearchParams();

        params.set('query', query);
        params.set('field', filters.field);

        if (filters.lang) params.set('lang', filters.lang);
        if (filters.genre) params.set('genre', filters.genre);

        navigate(`/search?${params.toString()}`);
    };

    return (
        <form
            onSubmit={submitHandler}
            className={`relative gap-1 ${isHero ? 'w-2/5' : 'w-full'}`}
        >
            <div className="glass flex flex-row w-full gap-2 px-1 py-1 rounded-xl">
                <button type="button">
                    <SlidersHorizontalIcon
                        onClick={() => setIsFiltersOpen(prev => !prev)}
                        className={`size-8 p-2 text-slate-500 dark:text-slate-400 rounded-lg transition-all
                            hover:bg-violet-500/10 hover:text-violet-500
                            ${isFiltersOpen ? 'bg-violet-500/10 text-violet-500' : ''}`}
                    />
                </button>

                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for a book"
                    className="w-full bg-transparent border-none outline-none text-neutral-900 dark:text-neutral-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />

                <button type="submit">
                    <SearchIcon className="size-8 p-2 text-slate-500 dark:text-slate-400 rounded-lg transition-all hover:bg-violet-500/10 hover:text-violet-500" />
                </button>
            </div>

            {isFiltersOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white/95 dark:bg-neutral-900/95 border border-white/40 dark:border-white/10 shadow-lg shadow-violet-500/10 flex flex-col w-full gap-2 p-1 rounded-xl z-10">

                    <div className="flex flex-row gap-2">
                        {FIELD_OPTIONS.map(option => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => setFilters({ ...filters, field: option.value })}
                                className={
                                    filters.field === option.value
                                        ? 'w-full px-3 py-1 text-sm text-white bg-violet-500 rounded-lg shadow-md'
                                        : 'w-full px-3 py-1 text-sm text-slate-500 dark:text-slate-400 rounded-lg hover:bg-violet-500/10'
                                }
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-row gap-1">
                        <FilterSelect
                            value={filters.lang ?? ''}
                            onValueChange={(val) => setFilters({
                                ...filters,
                                lang: (val === '' || val === 'none') ? undefined : val as 'pt' | 'en'
                            })}
                            placeholder="All Languages"
                            options={[...LANGUAGE_OPTIONS]}
                        />
                        <FilterSelect
                            value={filters.genre ?? ''}
                            onValueChange={(val) => setFilters({
                                ...filters,
                                genre: (val === '' || val === 'none') ? undefined : val
                            })}
                            placeholder="All Genres"
                            options={[...GENRE_OPTIONS]}
                        />
                    </div>
                </div>
            )}
        </form>
    );
}