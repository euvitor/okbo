import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";

async function handleLogout() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Error logging out:", error.message);
    return;
  }

  // Optional: Redirect your user or update state here
  console.log("Successfully logged out");
}

// Passamos o email como prop para manter o componente puro e simples
function UserMenu({
  email,
  username,
}: {
  email: string | undefined;
  username: string | undefined;
}) {
  return (
    <div className="flex flex-col items-center gap-1 p-4">
      <h3 className="font-display text-2xl font-bold">Hello {username}!</h3>
      <p className="text-violet-500 opacity-60">{email}</p>
      <button
        onClick={handleLogout}
        className="mt-2 text-sm text-red-500 hover:underline"
      >
        Logout
      </button>
    </div>
  );
}

function GuestMenu() {
  // Chamamos o hook DENTRO do componente
  const { openAuthModal } = useAuth();

  return (
    <div className="flex flex-col items-center gap-2 p-4">
      <h3 className="font-display text-2xl font-bold">Not logged</h3>
      <button
        onClick={openAuthModal} // Conectamos a ação de abrir o modal aqui!
        className="rounded-full bg-violet-500 px-6 py-2 text-sm text-white transition-colors hover:bg-violet-600"
      >
        Login
      </button>
      <button
        onClick={openAuthModal} // Pode abrir o mesmo modal, já que tem abas
        className="text-sm opacity-70 transition-opacity hover:opacity-100"
      >
        Sign Up
      </button>
    </div>
  );
}

export function ProfileModal() {
  // Chamamos o hook DENTRO do componente principal
  const { session } = useAuth();

  return (
    <div className="glass absolute top-15 right-6 z-40 flex flex-col items-center gap-2 rounded-3xl p-2">
      {session ? (
        <UserMenu
          email={session.user?.email}
          username={session.user?.user_metadata.username}
        />
      ) : (
        <GuestMenu />
      )}
    </div>
  );
}
