import { SearchBar } from "../components/SearchBar";

export function Home() {

    return (
        <div className="mt-[-100px] flex flex-col items-center justify-center h-full flex-1">
            <h1 className="font-display text-6xl font-bold">okbo<span className="text-violet-500">.</span></h1>
            <p className="font-display text-xl text-slate-500 mb-4">find • <span className="text-violet-500 italic">read</span> • shelf</p>
            <SearchBar variant="hero"/>
        </div>
    )
}