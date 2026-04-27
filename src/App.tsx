// src/App.tsx
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { Home } from './pages/Home'
import { BookDetails } from './pages/BookDetails'

function App() {
  return (
    <BrowserRouter>
      {/* Container principal empurra o rodapé para baixo quando o conteúdo for menor que a tela */}
      <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col">

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