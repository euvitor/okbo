import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import type { ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";

// Definindo os tipos que o contexto vai exportar
interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean; // Fundamental para não piscar a tela de login antes de verificar o cache
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

// Criando o contexto com valores padrão vazios
const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  isAuthModalOpen: true,
  openAuthModal: () => {},
  closeAuthModal: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const openAuthModal = () => setIsAuthModalOpen(true)
  const closeAuthModal = () => setIsAuthModalOpen(false)

  useEffect(() => {
    // 1. Busca a sessão ativa assim que o app carrega (caso o usuário já tenha logado antes)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 2. Cria um "ouvinte" para mudanças. Se logar, deslogar ou token atualizar, ele atualiza o estado
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if(session?.user){
        closeAuthModal()
      }
    });

    // Limpa o ouvinte quando o componente for desmontado
    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, loading, isAuthModalOpen, openAuthModal, closeAuthModal }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook customizado super prático para usar nos outros componentes
export const useAuth = () => {
  return useContext(AuthContext);
};
