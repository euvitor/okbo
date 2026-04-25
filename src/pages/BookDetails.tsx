import { Link, useParams } from "react-router-dom";

export function BookDetails() {
    const { id } = useParams()


return (
    <div className="max-w-3xl mx-auto p-4">
        <Link to="/" className="text-blue-600 hover:underline mb-4 inline-block">
            &larr; Voltar para busca
        </Link>
        <h1 className="text-2xl font-bold">Detalhes do Livro: {id}</h1>
        <p className="text-neutral-600">Aqui vão entrar a capa, sinopse e o botão da Amazon.</p>
    </div>
)
}