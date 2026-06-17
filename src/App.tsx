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

function App() {
  const { isAuthModalOpen, closeAuthModal  } = useAuth();
  const modalRef = useRef <HTMLDivElement>(null)
  useOnClickOutside(modalRef, closeAuthModal)

  return (
    <BrowserRouter>
      <div className="app-bg flex min-h-screen flex-col text-neutral-900 dark:text-neutral-50">
        <div className="mx-auto flex w-full max-w-300 flex-1 flex-col px-3 pt-32">
          <Header />
          <main className="flex flex-1 flex-col">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/book/:id" element={<BookDetails />} />
              <Route path="/search" element={<SearchResults />} />
              {/* 404 Fallback Route  */}
              <Route
                path="*"
                element={
                  <div className="p-8 text-center">
                    <h2 className="text-2xl font-bold">
                      Página não encontrada
                    </h2>
                    <Link
                      to="/"
                      className="mt-4 inline-block text-violet-500 hover:underline"
                    >
                      Voltar ao início
                    </Link>
                  </div>
                }
              />
            </Routes>
          </main>
          <footer className="py-4 text-center text-xs text-slate-400">
            {"made with <📚💜/> by "}
            <a
              href="https://github.com/euvitor"
              className="transition-colors hover:text-violet-500"
            >
              euvitor
            </a>
          </footer>

          {isAuthModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 dark:bg-slate-950/70 backdrop-blur-sm">
              <AuthModal ref={modalRef}/>
            </div>
          )}
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
