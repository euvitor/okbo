// src/App.tsx
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { Home } from './pages/Home'
import { BookDetails } from './pages/BookDetails'

function App() {
  return (
    <BrowserRouter>
      {/* Container principal empurra o rodapé para baixo quando o conteúdo for menor que a tela */}
      <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col">

        {/* Header Global */}
        <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
          <div className="max-w-5xl mx-auto p-4 flex items-center justify-between">
            <Link to="/" className="text-xl font-bold tracking-tight text-blue-600">
              okbo.
            </Link>

            {/* Espaço reservado para a Fase 2 (Login/Estante) */}
            <div className="text-sm font-medium text-neutral-500">
              Fase 1
            </div>
          </div>
        </header>

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/book/:id" element={<BookDetails />} />
            {/* Rota de fallback para 404 */}
            <Route path="*" element={
              <div className="p-8 text-center">
                <h2 className="text-2xl font-bold">Página não encontrada</h2>
                <Link to="/" className="text-blue-600 hover:underline mt-4 inline-block">Voltar ao início</Link>
              </div>
            } />
          </Routes>
        </main>

      </div>
    </BrowserRouter>
  )
}

export default App