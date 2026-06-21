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
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    if (!userId) return;

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

  // Fetches the data as soon as the user logs in
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Function to update local state when mutations occur (such as a photo upload)
  const updateLocalProfile = (fields: Partial<ProfileState>) => {
    setProfile((prev) => ({ ...prev, ...fields }));
  };

  return {
    userId,
    profile,
    isLoading,
    updateLocalProfile,
    refetchProfile: loadProfile, // If needed to force a database refresh
  };
}
