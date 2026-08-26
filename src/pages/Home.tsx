import { SearchBar } from "../components/SearchBar";

export function Home() {
  return (
    <div className="flex h-full flex-1 flex-col items-center justify-center gap-6 -mt-14">

      {/* Logo headline */}
      <div className="flex flex-col items-center gap-2">
        <h1
          className="text-7xl font-semibold tracking-tight sm:text-8xl"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
        >
          okbo<span style={{ color: "var(--color-accent)" }}>.</span>
        </h1>

        <p
          className="text-base font-normal tracking-widest uppercase"
          style={{ color: "var(--color-ink-faint)", letterSpacing: "0.25em" }}
        >
          find&ensp;·&ensp;read&ensp;·&ensp;shelf
        </p>
      </div>

      {/* Search */}
      <div className="w-full max-w-135 mt-2">
        <SearchBar variant="hero" />
      </div>
    </div>
  );
}
