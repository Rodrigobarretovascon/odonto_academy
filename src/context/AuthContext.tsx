import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api, type User } from "../lib/api";

interface Subscription {
  expires_at: string;
  product_name: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  hasAccess: boolean;
  subscription: Subscription | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);
const TOKEN_KEY = "gbd_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [hasAccess, setHasAccess] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!token) {
      setUser(null);
      setHasAccess(false);
      setSubscription(null);
      setLoading(false);
      return;
    }
    try {
      const data = await api<{ user: User; hasAccess: boolean; subscription: Subscription | null }>(
        "/auth/me",
        {},
        token,
      );
      setUser(data.user);
      setHasAccess(data.hasAccess);
      setSubscription(data.subscription);
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = async (email: string, password: string) => {
    const data = await api<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    const me = await api<{ user: User; hasAccess: boolean; subscription: Subscription | null }>(
      "/auth/me",
      {},
      data.token,
    );
    setUser(me.user);
    setHasAccess(me.hasAccess);
    setSubscription(me.subscription);
    setLoading(false);
  };

  const register = async (name: string, email: string, password: string) => {
    const data = await api<{ token: string; user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
    setHasAccess(false);
    setSubscription(null);
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setHasAccess(false);
    setSubscription(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, hasAccess, subscription, loading, login, register, logout, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth fora do AuthProvider");
  return ctx;
}
