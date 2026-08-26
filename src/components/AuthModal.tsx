import { useState, type Ref } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";
import { Lock, Mail, User, X, Sparkles } from "lucide-react";

interface AuthModalProps {
  ref?: Ref<HTMLDivElement>;
}

export function AuthModal({ ref }: AuthModalProps) {
  const { closeAuthModal } = useAuth();
  const [view, setView] = useState<"login" | "register1" | "register2">("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setErrorMsg(error.message);
  };

  const handleRegisterStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setView("register2");
  };

  const handleRegisterStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });
    setLoading(false);
    if (error) setErrorMsg(error.message);
  };

  const inputClass =
    "w-full rounded-2xl bg-white/70 dark:bg-neutral-800/60 border border-slate-200/80 dark:border-white/10 px-4 py-3.5 text-sm font-medium outline-none transition-all focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20";

  return (
    <div
      ref={ref}
      className="glass-elevated relative mx-4 flex w-full max-w-sm flex-col gap-6 rounded-[32px] p-7 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
    >
      {/* Close button */}
      <button
        onClick={closeAuthModal}
        className="glass-pill absolute top-5 right-5 flex size-8 items-center justify-center rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white"
      >
        <X className="size-4" />
      </button>

      {/* Header Logo/Icon */}
      <div className="flex flex-col items-center gap-1.5 pt-2 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/30">
          <Sparkles className="size-6" />
        </div>
        <h3
          className="text-2xl font-bold mt-2"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
        >
          {view === "login" ? "Bem-vindo de volta" : "Criar sua conta"}
        </h3>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {view === "login"
            ? "Acesse sua biblioteca e continue suas leituras"
            : "Comece a catalogar seus livros no Okbo"}
        </p>
      </div>

      {/* View Tabs */}
      <div className="flex rounded-2xl bg-slate-200/70 p-1 dark:bg-neutral-800/70">
        {(["login", "register1"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => { setView(tab); setErrorMsg(""); }}
            className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all duration-200 ${
              (tab === "login" && view === "login") || (tab === "register1" && view !== "login")
                ? "bg-white text-violet-700 shadow-sm dark:bg-neutral-700 dark:text-white"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            {tab === "login" ? "Entrar" : "Cadastrar"}
          </button>
        ))}
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 px-4 py-2.5 text-center text-xs font-semibold text-rose-600 dark:text-rose-400">
          {errorMsg}
        </div>
      )}

      {/* Forms */}
      <div>
        {view === "login" && (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5" htmlFor="login-email">
                <Mail className="size-3.5 text-violet-500" />
                E-mail
              </label>
              <input
                className={inputClass}
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5" htmlFor="login-password">
                <Lock className="size-3.5 text-violet-500" />
                Senha
              </label>
              <input
                className={inputClass}
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center rounded-2xl py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)" }}
            >
              {loading ? "Entrando..." : "Entrar no Okbo"}
            </button>
          </form>
        )}

        {view === "register1" && (
          <form onSubmit={handleRegisterStep1} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5" htmlFor="register-email">
                <Mail className="size-3.5 text-violet-500" />
                E-mail
              </label>
              <input
                className={inputClass}
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5" htmlFor="register-password">
                <Lock className="size-3.5 text-violet-500" />
                Crie uma senha
              </label>
              <input
                className={inputClass}
                id="register-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="mt-2 flex w-full items-center justify-center rounded-2xl py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-95"
              style={{ background: "linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)" }}
            >
              Continuar →
            </button>
          </form>
        )}

        {view === "register2" && (
          <form onSubmit={handleRegisterStep2} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5" htmlFor="register-username">
                <User className="size-3.5 text-violet-500" />
                Nome de usuário
              </label>
              <input
                className={inputClass}
                id="register-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ex: leitor_devorador"
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center rounded-2xl py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)" }}
            >
              {loading ? "Criando..." : "Finalizar cadastro 🎉"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
