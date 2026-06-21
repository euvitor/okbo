import { ProfilePic } from "../components/ProfilePic";
import { useProfile } from "../hooks/useProfile";

export function MyShelf() {
    const { userId, profile, isLoading, updateLocalProfile } = useProfile();

    if (!userId) {
        return (
            <div className="container flex items-center justify-center pt-20 text-gray-400">
                Loading session...
            </div>
        );
    }

    return (
        <div className="container grid grid-cols-1 lg:grid-cols-3 gap-10 pt-10">
            <aside className="lg:col-span-1 border border-pink-500 flex flex-col items-center p-4">
                {isLoading ? (
                    <div className="w-48 h-48 rounded-full glass animate-pulse flex items-center justify-center text-xs text-gray-400">
                        Loading...
                    </div>
                ) : (
                    <ProfilePic
                        userId={userId}
                        avatarUrl={profile.avatar_url}
                        onUploadSuccess={(newUrl) => updateLocalProfile({ avatar_url: newUrl })}
                    />
                )}
            </aside>

            <main className="lg:col-span-2 border border-green-500 p-4">
                {/* Shelfs */}
            </main>
        </div>
    );
}