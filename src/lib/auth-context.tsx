"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { auth, googleProvider } from "./firebase";
import { Role, UserProfile } from "@/types";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  role: Role | null;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  role: null,
  isAdmin: false,
  loading: true,
  error: null,
  signInWithGoogle: async () => {},
  logout: async () => {},
  refreshSession: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const pathname = usePathname();

  const verifyWithServer = useCallback(async (firebaseUser: User) => {
    try {
      const idToken = await firebaseUser.getIdToken(true);
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      const data = await res.json();

      if (!res.ok || !data.allowed) {
        // Pending access or not authorized
        await signOut(auth);
        setUser(null);
        setRole(null);
        setProfile(null);
        setIsAdmin(false);
        router.push("/access-pending");
        return;
      }

      setRole(data.role);
      setProfile(data.user);
      setIsAdmin(!!data.user.isAdmin);
      setError(null);

      // Route if currently at root login
      if (pathname === "/" || pathname === "/access-pending") {
        if (data.role === "student") router.push("/student");
        else if (data.role === "mentor") router.push("/mentor");
        else if (data.role === "trustee") router.push("/trustee");
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      setError(err.message || "Failed to verify access role");
    }
  }, [pathname, router]);

  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setRole(data.role);
          setProfile(data.user);
          setIsAdmin(!!data.user.isAdmin);
        }
      }
    } catch (e) {
      console.warn("Session check failed", e);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await verifyWithServer(currentUser);
      } else {
        setRole(null);
        setProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [verifyWithServer]);

  const signInWithGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        await verifyWithServer(result.user);
      }
    } catch (err: any) {
      console.error("Google sign in error:", err);
      setError(err.message || "Sign in failed");
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      await signOut(auth);
      setUser(null);
      setRole(null);
      setProfile(null);
      setIsAdmin(false);
      router.push("/");
    } catch (err: any) {
      console.error("Logout error:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        isAdmin,
        loading,
        error,
        signInWithGoogle,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
