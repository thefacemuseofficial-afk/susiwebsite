import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, setToken } from "./api";

// Real backend-backed auth (JWT session tokens + Emergent Google OAuth).

export interface AppUser {
  user_id: string;
  email: string;
  name?: string;
  picture?: string;
  is_subscribed: boolean;
  on_trial?: boolean;
  trial_days_left?: number;
  auth_provider?: string;
}

interface AuthContextValue {
  user: AppUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signUp: (email: string, password: string, name?: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signInWithGoogle: () => void;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUserFromCallback: (u: AppUser, token: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // If returning from Google OAuth, let the callback handler establish the session first.
    if (window.location.hash?.includes("session_id=")) {
      setIsLoading(false);
      return;
    }
    checkAuth();
  }, [checkAuth]);

  const signUp = useCallback(async (email: string, password: string, name?: string) => {
    try {
      const res = await api.post("/auth/signup", { email, password, name });
      setToken(res.data.token);
      setUser(res.data.user);
      return {};
    } catch (e: any) {
      return { error: e?.response?.data?.detail || "Could not create account." };
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      setToken(res.data.token);
      setUser(res.data.user);
      return {};
    } catch (e: any) {
      return { error: e?.response?.data?.detail || "Invalid email or password." };
    }
  }, []);

  const signInWithGoogle = useCallback(() => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/scan";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  }, []);

  const signOut = useCallback(async () => {
    try { await api.post("/auth/logout"); } catch { /* ignore */ }
    setToken(null);
    setUser(null);
  }, []);

  const setUserFromCallback = useCallback((u: AppUser, token: string) => {
    setToken(token);
    setUser(u);
    setIsLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, signUp, signIn, signInWithGoogle, signOut, refreshUser: checkAuth, setUserFromCallback }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

// ---- Subscription (with 14-day free trial) --------------------------------
export function useSubscription(userId?: string) {
  const { refreshUser } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [onTrial, setOnTrial] = useState(false);
  const [trialDaysLeft, setTrialDaysLeft] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) { setIsSubscribed(false); setIsLoading(false); return; }
    try {
      const res = await api.get("/subscription");
      setIsSubscribed(!!res.data.is_subscribed);
      setOnTrial(!!res.data.on_trial);
      setTrialDaysLeft(res.data.trial_days_left || 0);
    } catch {
      setIsSubscribed(false);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const startTrial = useCallback(async () => {
    const res = await api.post("/start-trial");
    setIsSubscribed(!!res.data.is_subscribed);
    setOnTrial(!!res.data.on_trial);
    setTrialDaysLeft(res.data.trial_days_left || 0);
    refreshUser();
  }, [refreshUser]);

  const subscribe = useCallback(async () => {
    const res = await api.post("/subscribe");
    setIsSubscribed(!!res.data.is_subscribed);
    setOnTrial(false);
    refreshUser();
  }, [refreshUser]);

  return { isSubscribed, onTrial, trialDaysLeft, isLoading, startTrial, subscribe, reload: load };
}

// ---- Favourites -----------------------------------------------------------
export interface FavouriteItem {
  brand: string;
  product: string;
  shade: string;
  hex?: string;
  priceUSD?: number;
  brandUrl?: string;
  category: string;
}

export function useFavourites(userId?: string) {
  const [favourites, setFavourites] = useState<FavouriteItem[]>([]);

  const load = useCallback(async () => {
    if (!userId) { setFavourites([]); return; }
    try {
      const res = await api.get("/favourites");
      setFavourites(res.data || []);
    } catch {
      setFavourites([]);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const isFavourite = useCallback(
    (brand: string, product: string, shade: string, category: string) =>
      favourites.some((f) => f.brand === brand && f.product === product && f.shade === shade && f.category === category),
    [favourites]
  );

  const toggleFavourite = useCallback(async (item: FavouriteItem) => {
    // optimistic
    setFavourites((prev) => {
      const exists = prev.some((f) => f.brand === item.brand && f.product === item.product && f.shade === item.shade && f.category === item.category);
      return exists
        ? prev.filter((f) => !(f.brand === item.brand && f.product === item.product && f.shade === item.shade && f.category === item.category))
        : [item, ...prev];
    });
    try { await api.post("/favourites/toggle", item); } catch { load(); }
  }, [load]);

  return { favourites, isFavourite, toggleFavourite, reload: load };
}
