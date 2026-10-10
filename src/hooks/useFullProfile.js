import { useCallback, useEffect, useState } from "react";
import profileService from "../../lib/service/profileService";

export function useFullProfile(role, id, { enabled = true } = {}) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    if (!role || !id || !enabled) return;
    setLoading(true);
    setError(null);
    try {
      const data = await profileService.getFullProfile(role, id);
      setProfile(data);
    } catch (err) {
      console.error("Full profile fetch error:", err);
      setError(err?.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [role, id, enabled]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, error, refetch: fetchProfile };
}