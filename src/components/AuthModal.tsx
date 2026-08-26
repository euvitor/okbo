import { useState, type Ref } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
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
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });
    if (error) setErrorMsg(error.message);
  };

  const inputClass =
    "w-full border-0 border-b py-3 text-base bg-transparent outline-none transition-colors placeholder:text-[var(--color-ink-faint)] focus:border-[var(--color-accent)]";
  const inputStyle = {
    borderColor: "var(--color-border-mid)",
    color: "var(--color-ink)",
    fontFamily: "var(--font-sans)",
  };

  return (
    <div
      ref={ref}
      className="glass-elevated flex w-full max-w-[calc(100vw-2rem)] sm:max-w-90 flex-col gap-5 sm:gap-6 rounded-3xl p-6 sm:p-8 shadow-2xl"
    >
      {/* Tabs */}
      <div
        className="flex gap-1 rounded-full p-1"
        style={{ background: "var(--color-paper-sunken)" }}
      >
        {(["login", "register1"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setView(tab)}
            className="flex-1 rounded-full py-2 text-base sm:text-sm font-medium transition-all duration-150"
            style={{
              background: view === tab || (tab === "register1" && view === "register2")
                ? "var(--color-paper-raised)"
                : "transparent",
              color: view === tab || (tab === "register1" && view === "register2")
                ? "var(--color-ink)"
                : "var(--color-ink-muted)",
              boxShadow: view === tab || (tab === "register1" && view === "register2")
                ? "var(--shadow-editorial)"
                : "none",
            }}
          >
            {tab === "login" ? "Login" : "Register"}
          </button>
        ))}
      </div>

      {/* Error */}
      {errorMsg && (
        <div className="rounded-xl px-4 py-2.5 text-center text-sm font-medium bg-red-500/15 border border-red-500/20 text-red-600 dark:text-red-400">
          {errorMsg}
        </div>
      )}

      {/* Forms */}
      <div>
        {view === "login" && (
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div>
              <label className="sr-only" htmlFor="login-email">Email</label>
              <input
                className={inputClass}
                style={inputStyle}
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
              />
            </div>
            <div>
              <label className="sr-only" htmlFor="login-password">Password</label>
              <input
                className={inputClass}
                style={inputStyle}
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
              />
            </div>
            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="submit"
                className="w-full rounded-full py-3 text-base font-medium text-white transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
                style={{ background: "var(--color-accent)" }}
              >
                Login
              </button>
              <button
                type="button"
                onClick={closeAuthModal}
                className="w-full rounded-full py-2.5 text-sm transition-all duration-150 hover:opacity-70"
                style={{ color: "var(--color-ink-faint)" }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {view === "register1" && (
          <form onSubmit={handleRegisterStep1} className="flex flex-col gap-5">
            <div>
              <label className="sr-only" htmlFor="register-email">Email</label>
              <input
                className={inputClass}
                style={inputStyle}
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
              />
            </div>
            <div>
              <label className="sr-only" htmlFor="register-password">Password</label>
              <input
                className={inputClass}
                style={inputStyle}
                id="register-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
              />
            </div>
            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="submit"
                className="w-full rounded-full py-3 text-base font-medium text-white transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
                style={{ background: "var(--color-accent)" }}
              >
                Next →
              </button>
              <button
                type="button"
                onClick={closeAuthModal}
                className="w-full rounded-full py-2.5 text-sm transition-all duration-150 hover:opacity-70"
                style={{ color: "var(--color-ink-faint)" }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {view === "register2" && (
          <form onSubmit={handleRegisterStep2} className="flex flex-col gap-5">
            <p className="text-sm" style={{ color: "var(--color-ink-muted)" }}>
              Choose a username to complete your account.
            </p>
            <div>
              <label className="sr-only" htmlFor="register-username">Username</label>
              <input
                className={inputClass}
                style={inputStyle}
                id="register-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
              />
            </div>
            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="submit"
                className="w-full rounded-full py-3 text-base font-medium text-white transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
                style={{ background: "var(--color-accent)" }}
              >
                Create account
              </button>
              <button
                type="button"
                onClick={closeAuthModal}
                className="w-full rounded-full py-2.5 text-sm transition-all duration-150 hover:opacity-70"
                style={{ color: "var(--color-ink-faint)" }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
