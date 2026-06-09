import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";

export function AuthModal() {
  const { closeAuthModal } = useAuth();
  const [view, setView] = useState<"login" | "register1" | "register2">(
    "login",
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      setErrorMsg(error.message);
      return;
    }
  };

  const handleRegisterStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setView("register2");
  };
  const handleRegisterStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          username: username,
        },
      },
    });

    if (error) {
      setErrorMsg(error.message);
      return;
    }
  };

  // Classes extraídas para manter a consistência e evitar repetição visual
  const inputClassName =
    "w-full bg-transparent border-b-2 border-slate-400/50 text-slate-900 placeholder-slate-400 transition focus:border-violet-500 focus:outline-none dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-violet-400";
  const primaryButtonClassName =
    "mx-auto w-full mt-4 max-w-28 rounded-full bg-violet-500 px-6 py-2 text-sm text-white transition-colors hover:bg-violet-600 dark:bg-violet-600 dark:hover:bg-violet-500";
  const cancelButtonClassName =
    "mx-auto w-full max-w-28 px-1 py-1 text-xs text-slate-500 transition-colors hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400";

  return (
    <div className="glass flex w-full max-w-80 flex-col rounded-3xl p-6 dark:bg-slate-900/40">
      <div className="flex w-full flex-row justify-around gap-3">
        <button
          className={
            view === "login"
              ? "font-medium text-violet-600 dark:text-violet-400"
              : "text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          }
          onClick={() => setView("login")}
        >
          Login
        </button>
        <button
          className={
            view !== "login"
              ? "font-medium text-violet-600 dark:text-violet-400"
              : "text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          }
          onClick={() => setView("register1")}
        >
          Register
        </button>
      </div>

      <div className="mt-10 flex flex-col">
        {errorMsg && (
          <div className="mb-4 rounded bg-red-500/20 p-2 text-center text-xs text-red-500">
            {errorMsg}
          </div>
        )}
        {view === "login" && (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col">
              <label className="sr-only" htmlFor="login-email">
                Email
              </label>
              <input
                className={inputClassName}
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email"
                required
              />
            </div>
            <div className="flex flex-col">
              <label className="sr-only" htmlFor="login-password">
                Password
              </label>
              <input
                className={inputClassName}
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
                required
              />
            </div>
            <button type="submit" className={primaryButtonClassName}>
              Login
            </button>
            <button
              type="button"
              onClick={closeAuthModal}
              className={cancelButtonClassName}
            >
              Cancel
            </button>
          </form>
        )}
        {view === "register1" && (
          <form onSubmit={handleRegisterStep1} className="flex flex-col gap-4">
            <div className="flex flex-col">
              <label className="sr-only" htmlFor="register-email">
                Email
              </label>
              <input
                className={inputClassName}
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email"
                required
              />
            </div>
            <div className="flex flex-col">
              <label className="sr-only" htmlFor="register-password">
                Password
              </label>
              <input
                className={inputClassName}
                id="register-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
                required
              />
            </div>
            <button type="submit" className={primaryButtonClassName}>
              Next
            </button>
            <button
              type="button"
              onClick={closeAuthModal}
              className={cancelButtonClassName}
            >
              Cancel
            </button>
          </form>
        )}
        {view === "register2" && (
          <form onSubmit={handleRegisterStep2} className="flex flex-col gap-4">
            <div className="flex flex-col">
              <label className="sr-only" htmlFor="register-username">
                Username
              </label>
              <input
                className={inputClassName}
                id="register-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                required
              />
            </div>

            <button type="submit" className={primaryButtonClassName}>
              Register
            </button>
            <button
              type="button"
              onClick={closeAuthModal}
              className={cancelButtonClassName}
            >
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
