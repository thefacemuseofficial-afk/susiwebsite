import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

// ---------------------------------------------------------------------------
// Mock auth — replaces Supabase/Lovable auth with localStorage-based sessions.
// NOTE: This is a front-end-only MOCK for the clone. No real backend.
// ---------------------------------------------------------------------------

export interface MockUser {
  id: string;
  email: string;
  name?: string;
}

const SESSION_KEY = "tbm_mock_session";
const USERS_KEY = "tbm_mock_users";

function readUsers(): Record<string, { password: string; user: MockUser }> {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
  } catch {
    return {};
  }
}
function writeUsers(u: Record<string, { password: string; user: MockUser }>) {
  localStorage.setItem(USERS_KEY, JSON.stringify(u));
}
function readSession(): MockUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as MockUser) : null;
  } catch {
    return null;
  }
}

interface AuthContextValue {
  user: MockUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signUp: (email: string, password: string, name?: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setUser(readSession());
    setIsLoading(false);
    const onStorage = () => setUser(readSession());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const persist = (u: MockUser | null) => {
    if (u) localStorage.setItem(SESSION_KEY, JSON.stringify(u));
    else localStorage.removeItem(SESSION_KEY);
    setUser(u);
  };

  const signUp = useCallback(async (email: string, password: string, name?: string) => {
    const users = readUsers();
    const key = email.toLowerCase();
    if (users[key]) return { error: "An account with this email already exists." };
    const newUser: MockUser = { id: `u_${Date.now()}`, email, name };
    users[key] = { password, user: newUser };
    writeUsers(users);
    persist(newUser);
    return {};
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const users = readUsers();
    const rec = users[email.toLowerCase()];
    if (!rec || rec.password !== password) return { error: "Invalid email or password." };
    persist(rec.user);
    return {};
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const gUser: MockUser = { id: "u_google_demo", email: "you@gmail.com", name: "Google User" };
    persist(gUser);
    return {};
  }, []);

  const signOut = useCallback(() => persist(null), []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, signUp, signIn, signInWithGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

// ---- Subscription (mock) --------------------------------------------------
export function useSubscription(userId?: string) {
  const key = `tbm_mock_sub_${userId ?? "anon"}`;
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsSubscribed(localStorage.getItem(key) === "1");
    setIsLoading(false);
  }, [key]);

  const subscribe = useCallback(() => {
    localStorage.setItem(key, "1");
    setIsSubscribed(true);
  }, [key]);

  const unsubscribe = useCallback(() => {
    localStorage.removeItem(key);
    setIsSubscribed(false);
  }, [key]);

  return { isSubscribed, isLoading, subscribe, unsubscribe };
}

// ---- Favourites (mock) ----------------------------------------------------
export interface FavouriteItem {
  brand: string;
  product: string;
  shade: string;
  hex: string;
  priceUSD: number;
  brandUrl: string;
  category: string;
}

export function useFavourites(userId?: string) {
  const key = `tbm_mock_favs_${userId ?? "anon"}`;
  const [favourites, setFavourites] = useState<FavouriteItem[]>([]);

  useEffect(() => {
    try {
      setFavourites(JSON.parse(localStorage.getItem(key) || "[]"));
    } catch {
      setFavourites([]);
    }
  }, [key]);

  const save = (items: FavouriteItem[]) => {
    localStorage.setItem(key, JSON.stringify(items));
    setFavourites(items);
  };

  const matchKey = (f: FavouriteItem, brand: string, product: string, shade: string, category: string) =>
    f.brand === brand && f.product === product && f.shade === shade && f.category === category;

  const isFavourite = useCallback(
    (brand: string, product: string, shade: string, category: string) =>
      favourites.some((f) => matchKey(f, brand, product, shade, category)),
    [favourites]
  );

  const toggleFavourite = useCallback(
    (item: FavouriteItem) => {
      const exists = favourites.some((f) => matchKey(f, item.brand, item.product, item.shade, item.category));
      if (exists) {
        save(favourites.filter((f) => !matchKey(f, item.brand, item.product, item.shade, item.category)));
      } else {
        save([item, ...favourites]);
      }
    },
    [favourites]
  );

  const removeFavourite = useCallback(
    (item: FavouriteItem) => save(favourites.filter((f) => !matchKey(f, item.brand, item.product, item.shade, item.category))),
    [favourites]
  );

  return { favourites, isFavourite, toggleFavourite, removeFavourite };
}
