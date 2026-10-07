"use client";

import React from "react";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { ShieldAlert, ArrowLeft, Sun, Moon } from "lucide-react";
import Link from "next/link";

export default function AccessPendingPage() {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col justify-between bg-page selection:bg-teal-500/20">
      {/* Top Header */}
      <header className="w-full h-16 border-b border-theme px-6 md:px-12 flex items-center justify-between bg-surface/70 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Mentora Logo"
            width={36}
            height={36}
            className="rounded-lg object-contain"
          />
          <span className="font-bold text-lg tracking-tight text-primary-theme">
            Mentora
          </span>
        </div>

        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="w-10 h-10 rounded-full flex items-center justify-center border border-theme hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-primary-theme cursor-pointer"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </header>

      {/* Main Full-Screen Message */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg card-theme p-10 text-center relative overflow-hidden">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-primary-theme mb-3">
            Access Pending
          </h1>

          <p className="text-base text-muted-theme mb-8 leading-relaxed">
            Access pending — contact your VRCF coordinator to be added.
          </p>

          <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-theme mb-8 text-left text-xs text-muted-theme space-y-1">
            <p className="font-medium text-primary-theme">Why am I seeing this?</p>
            <p>
              Your Google account is not yet enrolled in the VRCF Foundation access directory. Once a trust coordinator grants your role (Student, Mentor, or Trustee), you will be able to log in immediately.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={logout}
              className="w-full sm:w-auto btn-primary px-8"
            >
              Sign Out &amp; Return Home
            </button>
            <Link
              href="/"
              className="w-full sm:w-auto btn-secondary px-6"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </main>

      <footer className="w-full py-6 text-center text-xs text-muted-theme border-t border-theme">
        <p>&copy; 2026 VRCF Foundation &middot; Financial-Aid &amp; Leadership Initiative</p>
      </footer>
    </div>
  );
}
