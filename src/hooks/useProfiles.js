
import { useCallback, useEffect, useState } from "react";
import profileService from "../../lib/service/profileService";

// 🛡️ Anything that isn't a valid profile gets thrown away
const isValidProfile = (p) => p && (p._id || p.id);

export function useProfiles({ role, params = {}, autoFetch = true }) {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await profileService.list(role, params);

      // Handle every possible shape the backend might return.
      // profileService.list() already normalizes each item,
      // so `res.data` should be the flat array here.
      let raw = [];
      if (Array.isArray(res)) raw = res;
      else if (Array.isArray(res?.data)) raw = res.data;
      else if (Array.isArray(res?.users)) raw = res.users;
      else if (Array.isArray(res?.data?.users)) raw = res.data.users;
      else if (Array.isArray(res?.profiles)) raw = res.profiles;
      else if (Array.isArray(res?.data?.profiles)) raw = res.data.profiles;

      setProfiles(raw.filter(isValidProfile));
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load profiles");
      setProfiles([]);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, JSON.stringify(params)]);

  useEffect(() => {
    if (autoFetch) fetchProfiles();
  }, [fetchProfiles, autoFetch]);

  return { profiles, loading, error, refetch: fetchProfiles, setProfiles };
}