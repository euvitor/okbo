import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

interface ProfileState {
  username: string | null;
  avatar_url: string | null;
}

export function useProfile() {
  const { session } = useAuth();
  const userId = session?.user?.id;

  const [profile, setProfile] = useState<ProfileState>({
    username: null,
    avatar_url: null,
  });
  // Default to true so we don't flash empty states before the initial fetch completes
  const [isLoading, setIsLoading] = useState(true);

  // useCallback memoizes this function so its memory reference doesn't change on every render.
  // This is required because we include it in the useEffect dependency array below.
  const loadProfile = useCallback(async () => {
    // Clean up local state if the user logs out (userId becomes undefined)
    if (!userId) {
      setProfile({ username: null, avatar_url: null });
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", userId)
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          username: data.username,
          avatar_url: data.avatar_url,
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Fetches the data as soon as the user logs in, or cleans it up if they log out
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Optimistic UI update: Allows components (like ProfilePic) to immediately update 
  // the local state after a successful mutation, skipping an unnecessary database refetch.
  const updateLocalProfile = (fields: Partial<ProfileState>) => {
    setProfile((prev) => ({ ...prev, ...fields }));
  };

  return {
    userId,
    profile,
    isLoading,
    updateLocalProfile,
    refetchProfile: loadProfile, // Exposed in case a hard refresh from the DB is ever needed
  };
}