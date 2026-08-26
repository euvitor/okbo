// src/App.tsx
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Header } from "./components/Header";
import { Home } from "./pages/Home";
import { BookDetails } from "./pages/BookDetails";
import { SearchResults } from "./pages/SearchResults";
import { useAuth } from "./context/AuthContext";
import { AuthModal } from "./components/AuthModal";
import { useRef } from "react";
import { useOnClickOutside } from "./hooks/useOnClickOutside";
import { MyShelf } from "./pages/MyShelf";

function App() {
  const { isAuthModalOpen, closeAuthModal } = useAuth();
  const modalRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(modalRef, closeAuthModal);

  return (
    <BrowserRouter>
      <div className="app-bg relative flex min-h-screen flex-col overflow-x-hidden" style={{ color: "var(--color-ink)" }}>
        
        {/* Ambient Glowing Background Orbs for Vivid Glassmorphic Depth & Color */}
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
          {/* Top-right violet/indigo aura */}
          <div className="ambient-blob-1 absolute -top-[12%] -right-[8%] h-[55vh] w-[55vh] rounded-full bg-gradient-to-br from-violet-400/25 via-purple-500/20 to-indigo-600/15 blur-[100px] dark:from-violet-600/20 dark:via-purple-700/15 dark:to-indigo-900/10" />
          
          {/* Left-middle warm coral/amber aura */}
          <div className="ambient-blob-2 absolute top-[30%] -left-[12%] h-[60vh] w-[60vh] rounded-full bg-gradient-to-tr from-amber-300/20 via-rose-400/20 to-violet-400/15 blur-[120px] dark:from-amber-600/15 dark:via-rose-700/12 dark:to-purple-900/10" />
          
          {/* Bottom-right sky/emerald aura */}
          <div className="ambient-blob-3 absolute -bottom-[10%] right-[15%] h-[50vh] w-[50vh] rounded-full bg-gradient-to-tl from-sky-400/20 via-teal-400/15 to-violet-500/15 blur-[110px] dark:from-sky-600/15 dark:via-teal-800/10 dark:to-violet-900/10" />
        </div>

        {/* Content container */}
        <div className="relative z-10 mx-auto flex w-full max-w-300 flex-1 flex-col px-4 pt-32 sm:px-6">
          <Header />
          <main className="flex flex-1 flex-col">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/book/:id" element={<BookDetails />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/myshelf" element={<MyShelf />} />
              {/* 404 Fallback */}
              <Route
                path="*"
                element={
                  <div className="glass mx-auto my-12 max-w-md rounded-3xl p-10 text-center">
                    <h2
                      className="text-3xl font-bold"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      Página não encontrada
                    </h2>
                    <p className="mt-2 text-sm" style={{ color: "var(--color-ink-muted)" }}>
                      O livro ou página que você procura não existe ou foi movido.
                    </p>
                    <Link
                      to="/"
                      className="glass-pill mt-6 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105"
                      style={{ background: "var(--color-accent)" }}
                    >
                      Voltar ao início
                    </Link>
                  </div>
                }
              />
            </Routes>
          </main>

          <footer
            className="py-8 text-center text-sm font-medium"
            style={{ color: "var(--color-ink-faint)" }}
          >
            {"made with "}
            <span className="inline-block transition-transform hover:scale-125" style={{ color: "var(--color-accent)" }}>{"<📚💜/>"}</span>
            {" by "}
            <a
              href="https://github.com/euvitor"
              className="transition-colors hover:text-violet-600 dark:hover:text-violet-400"
              style={{ color: "var(--color-ink-muted)" }}
            >
              euvitor
            </a>
          </footer>
        </div>

        {isAuthModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md"
            style={{ background: "rgba(28, 25, 23, 0.4)" }}
          >
            <AuthModal ref={modalRef} />
          </div>
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;
