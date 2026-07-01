import { useState, useEffect } from "react";
import { api } from "../utils/api";
import type { UserProfile } from "../types/user";

/**
 * Module-level cache so multiple components (Navbar, Dashboard, Cases)
 * that mount simultaneously share a single in-flight request and receive
 * the same resolved value without redundant API calls.
 */
let profileCache: UserProfile | null = null;
let profilePromise: Promise<UserProfile> | null = null;

function fetchProfileOnce(): Promise<UserProfile> {
  if (profileCache !== null) {
    return Promise.resolve(profileCache);
  }
  if (profilePromise !== null) {
    return profilePromise;
  }
  profilePromise = api.getUserProfile().then((profile) => {
    profileCache = profile;
    profilePromise = null;
    return profile;
  });
  return profilePromise;
}

/** Invalidates the cached profile, forcing the next consumer to re-fetch. */
export function invalidateProfileCache(): void {
  profileCache = null;
  profilePromise = null;
}

interface UseUserProfileResult {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  /** Call this to force a fresh fetch (e.g. after opening a case). */
  refetch: () => void;
}

/**
 * Shared hook for the current user's profile data.
 * Deduplicates concurrent calls and caches the result for the session.
 */
export function useUserProfile(): UseUserProfileResult {
  const token = localStorage.getItem("token");
  const [profile, setProfile] = useState<UserProfile | null>(profileCache);
  const [loading, setLoading] = useState<boolean>(
    profileCache === null && !!token,
  );
  const [error, setError] = useState<string | null>(null);
  const [refreshCounter, setRefreshCounter] = useState<number>(0);

  useEffect(() => {
    if (!token) {
      setProfile(null);
      setLoading(false);
      setError("No authentication token found.");
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchProfileOnce()
      .then((data) => {
        if (isMounted) {
          setProfile(data);
          setLoading(false);
        }
      })
      .catch((fetchError: unknown) => {
        if (isMounted) {
          const message =
            fetchError instanceof Error
              ? fetchError.message
              : "Failed to load profile";
          setError(message);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [refreshCounter, token]);

  const refetch = (): void => {
    invalidateProfileCache();
    setRefreshCounter((prev) => prev + 1);
  };

  return { profile, loading, error, refetch };
}
