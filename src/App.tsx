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
      <div className="app-bg flex min-h-screen flex-col" style={{ color: "var(--color-ink)" }}>
        {/* Noise texture sits behind everything via ::before on app-bg */}
        <div className="relative z-0 mx-auto flex w-full max-w-300 flex-1 flex-col px-3 pt-32">
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
                  <div className="p-8 text-center">
                    <h2
                      className="text-2xl font-bold"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      Página não encontrada
                    </h2>
                    <Link
                      to="/"
                      className="mt-4 inline-block transition-colors hover:text-violet-600"
                      style={{ color: "var(--color-accent)" }}
                    >
                      Voltar ao início
                    </Link>
                  </div>
                }
              />
            </Routes>
          </main>

          <footer
            className="py-6 text-center text-xs"
            style={{ color: "var(--color-ink-faint)" }}
          >
            {"made with "}
            <span style={{ color: "var(--color-accent)" }}>{"<📚/>"}</span>
            {" by "}
            <a
              href="https://github.com/euvitor"
              className="transition-colors hover:opacity-70"
              style={{ color: "var(--color-ink-muted)" }}
            >
              euvitor
            </a>
          </footer>
        </div>

        {isAuthModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
            style={{ background: "rgba(44, 40, 37, 0.25)" }}
          >
            <AuthModal ref={modalRef} />
          </div>
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;
