"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { useRouter } from "next/navigation";
import { Moon, Sun, ArrowRight, ShieldCheck, Compass, Sparkles } from "lucide-react";

export default function LoginPage() {
  const { user, role, loading, error, signInWithGoogle } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (user && role) {
      if (role === "student") router.push("/student");
      else if (role === "mentor") router.push("/mentor");
      else if (role === "trustee") router.push("/trustee");
    }
  }, [user, role, router]);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-page selection:bg-teal-500/20">
      {/* Top Bar with brand and theme toggle */}
      <header className="w-full h-16 border-b border-theme px-6 md:px-12 flex items-center justify-between bg-surface/70 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Mentora Logo"
            width={36}
            height={36}
            className="rounded-lg object-contain"
          />
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight leading-tight text-primary-theme">
              Mentora
            </span>
            <span className="text-[11px] font-medium tracking-wide uppercase text-muted-theme">
              VRCF Foundation
            </span>
          </div>
        </div>

        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="w-10 h-10 rounded-full flex items-center justify-center border border-theme hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-primary-theme cursor-pointer"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md card-theme p-8 md:p-10 relative overflow-hidden">
          {/* Subtle top indicator bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-teal-600 dark:bg-teal-400" />

          <div className="text-center mb-8">
            <Image
              src="/logo.png"
              alt="Mentora Logo"
              width={54}
              height={54}
              className="mx-auto mb-3 rounded-xl object-contain shadow-sm"
            />
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium tracking-wide bg-teal-500/10 text-teal-700 dark:text-teal-300 mb-3">
              Scholarship & Mentorship Portal
            </span>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary-theme mb-2">
              Welcome to Mentora
            </h1>
            <p className="text-sm text-muted-theme leading-relaxed">
              Empowering VRCF scholars through Socratic inquiry, leadership coaching, and critical thinking.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl text-xs bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Single Google Sign-in Button */}
          <div className="space-y-4">
            <button
              onClick={signInWithGoogle}
              disabled={loading}
              className="w-full btn-primary py-3.5 text-base flex items-center justify-center gap-3 shadow-sm hover:shadow"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{loading ? "Authenticating..." : "Sign in with Google"}</span>
            </button>

            <div className="pt-4 border-t border-theme">
              <p className="text-[12px] text-center text-muted-theme leading-normal">
                Single sign-on for <strong>Students</strong>, <strong>Mentors</strong>, and <strong>Trustees</strong>. Your role is resolved automatically upon authentication.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-theme flex items-center justify-around text-xs text-muted-theme">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Verified Access</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Socratic Model</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 text-center text-xs text-muted-theme border-t border-theme">
        <p>&copy; 2026 VRCF Foundation &middot; Financial-Aid &amp; Leadership Initiative</p>
      </footer>
    </div>
  );
}
