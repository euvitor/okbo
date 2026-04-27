import { SearchBar } from "../components/SearchBar";

export function Home() {

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-6xl font-bold">okbo<span className="text-violet-500">.</span></h1>
            <p className="text-xl text-slate-500">find • read • shelf</p>
            <SearchBar variant="hero"/>
        </div>
    )
}