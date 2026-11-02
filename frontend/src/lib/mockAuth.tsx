import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, setToken } from "./api";

declare global {
  interface Window {
    google?: any;
  }
}

// Real backend-backed auth (JWT session tokens + Google OAuth).

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
    if (!process.env.REACT_APP_BACKEND_URL) {
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
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error("Missing REACT_APP_GOOGLE_CLIENT_ID");
      return;
    }

    const loadGoogleScript = () => {
      if (window.google?.accounts?.id) {
        return true;
      }

      const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existing) {
        return false;
      }

      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
      return false;
    };

    if (!loadGoogleScript()) {
      const pollForGoogle = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(pollForGoogle);
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: async (response: { credential?: string }) => {
              if (!response?.credential) return;
              try {
                const res = await api.post("/auth/google", { credential: response.credential });
                setToken(res.data.token);
                setUser(res.data.user);
                window.location.href = "/scan";
              } catch (e) {
                console.error("Google sign-in failed", e);
              }
            },
          });
          window.google.accounts.id.prompt();
        }
      }, 150);
      return;
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response: { credential?: string }) => {
        if (!response?.credential) return;
        try {
          const res = await api.post("/auth/google", { credential: response.credential });
          setToken(res.data.token);
          setUser(res.data.user);
          window.location.href = "/scan";
        } catch (e) {
          console.error("Google sign-in failed", e);
        }
      },
    });
    window.google.accounts.id.prompt();
  }, []);

  const signOut = useCallback(async () => {
    try { await api.post("/auth/logout"); } catch { /* ignore */ }
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, signUp, signIn, signInWithGoogle, signOut, refreshUser: checkAuth }}>
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
