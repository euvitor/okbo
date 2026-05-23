// src/App.tsx
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { Home } from './pages/Home'
import { BookDetails } from './pages/BookDetails'
import { SearchResults } from './pages/SearchResults'

function App() {
  return (
    <BrowserRouter>
      {/* Container principal empurra o rodapé para baixo quando o conteúdo for menor que a tela */}
      <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col">

        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/book/:id" element={<BookDetails />} />
            <Route path="/search" element={<SearchResults />} />
            {/* Rota de fallback para 404 */}
            <Route path="*" element={
              <div className="p-8 text-center">
                <h2 className="text-2xl font-bold">Página não encontrada</h2>
                <Link to="/" className="text-blue-600 hover:underline mt-4 inline-block">Voltar ao início</Link>
              </div>
            } />
          </Routes>
        </main>
        <footer className="py-4 text-center text-xs text-slate-400">
          {'made with <📚😊/> by '}
          <a href="https://github.com/euvitor" className="hover:text-violet-500 transition-colors">
            euvitor
          </a>
        </footer>
      </div>
    </BrowserRouter>
  )
}

export default App