"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import { fetchProfile, logoutBackend, syncProfile } from "./apiClient";

export type AuthUser = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
};

type ProfileUpdate = {
  firstName: string;
  lastName: string;
  phone: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  /** True when the signed-in Firebase account carries the "admin" custom claim. */
  isAdmin: boolean;
  loading: boolean;
  logout: () => Promise<void>;
  /** Persist profile changes via the user-service and update the context. */
  updateProfile: (data: ProfileUpdate) => Promise<AuthUser>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUser(null);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsAdmin(false);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(false);
        return;
      }

      try {
        const [profile, tokenResult] = await Promise.all([fetchProfile(), firebaseUser.getIdTokenResult()]);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUser(profile);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsAdmin(tokenResult.claims.admin === true);
      } catch {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUser(null);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsAdmin(false);
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
    setIsAdmin(false);
  }

  async function updateProfile(data: ProfileUpdate): Promise<AuthUser> {
    const updated = await syncProfile(data);
    setUser(updated);
    return updated;
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
