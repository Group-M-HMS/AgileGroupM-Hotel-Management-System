"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import { fetchProfile, logoutBackend } from "./apiClient";

export type AuthUser = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUser(null);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(false);
        return;
      }

      try {
        const profile = await fetchProfile();
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUser(profile);
      } catch {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUser(null);
      } finally {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  async function logout() {
    try {
      await logoutBackend();
    } catch {
      // Backend revoke failing shouldn't block client-side sign-out.
    }
    await signOut(auth);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
