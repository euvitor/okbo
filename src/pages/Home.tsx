import { SearchBar } from "../components/SearchBar";

export function Home() {
  return (
    <div className="flex h-full flex-1 flex-col items-center justify-center">
      <h1 className="font-display text-6xl font-bold">
        okbo<span className="text-violet-500">.</span>
      </h1>
      <p className="font-display mb-4 text-xl text-slate-500">
        find • <span className="text-violet-500 italic">read</span> • shelf
      </p>
      <SearchBar variant="hero" />
    </div>
  );
}
