import { ProfilePic } from "../components/ProfilePic";
import { useProfile } from "../hooks/useProfile";
import { supabase } from "../lib/supabaseClient";

async function handleLogout() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Error logging out:", error.message);
    return;
  }
}

export function MyShelf() {
    const { userId, profile, isLoading, updateLocalProfile } = useProfile();

    if (!userId) {
        return (
            <div className="container flex items-center justify-center pt-20 text-slate-400 dark:text-slate-500">
                Loading session...
            </div>
        );
    }

    return (
        <div className="container grid grid-cols-1 lg:grid-cols-3 gap-10 pt-10 pb-20">

            <aside className="lg:col-span-1 flex flex-col gap-10 items-center p-4 lg:sticky lg:top-24 h-max w-full max-w-xs mx-auto">
                {isLoading ? (
                    <div className="w-48 h-48 rounded-full glass animate-pulse flex items-center justify-center text-xs text-slate-400 dark:text-slate-500">
                        Loading...
                    </div>
                ) : (
                    <>
                        <ProfilePic
                            userId={userId}
                            avatarUrl={profile.avatar_url}
                            onUploadSuccess={(newUrl) => updateLocalProfile({ avatar_url: newUrl })}
                        />

                        <div className="w-full flex flex-col items-center gap-3">
                            <h3 className="font-display text-xl font-bold text-slate-800 dark:text-slate-100">
                                2026 Reading Goal
                            </h3>
                            
                            <div className="w-full h-10 glass rounded-full overflow-hidden p-1 shadow-inner relative flex items-center justify-center">
                                <div className="absolute left-1 top-1 bottom-1 w-[65%] bg-violet-500/20 dark:bg-violet-500/30 rounded-full transition-all duration-1000 ease-out z-0"></div>
                                
                                <span className="relative z-10 text-sm font-semibold text-violet-700 dark:text-violet-300">
                                    65%
                                </span>
                            </div>
                        </div>

                        <div className="w-full flex flex-col gap-3">
                            <button className="w-full px-4 py-3 rounded-2xl bg-violet-500/15 hover:bg-violet-500/20 text-violet-700 dark:text-violet-300 font-semibold transition-all shadow-sm">
                                Share my bio
                            </button>
                            
                            <button className="w-full px-4 py-3 rounded-2xl bg-violet-500/15 hover:bg-violet-500/20 text-violet-700 dark:text-violet-300 font-semibold transition-all shadow-sm">
                                Export my lists
                            </button>
                            
                            <button 
                                onClick={handleLogout}
                                className="w-full px-4 py-3 rounded-2xl bg-red-500/15 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-semibold transition-all shadow-sm"
                            >
                                Logout
                            </button>
                        </div>
                    </>
                )}
            </aside>

            <main className="lg:col-span-2 border border-green-500 p-4 min-h-125">
                <p className="text-slate-500 dark:text-slate-400">As estantes vão entrar aqui.</p>
            </main>
        </div>
    );
}