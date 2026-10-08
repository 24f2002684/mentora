"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { Moon, Sun, LogOut, Shield, ChevronDown, UserCheck } from "lucide-react";

export default function Navbar() {
  const { user, profile, role, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setAvatarUrl(null);
      return;
    }

    const checkAvatar = () => {
      try {
        const stored = localStorage.getItem(`mentora_user_avatar_${user.uid}`);
        setAvatarUrl(stored || user.photoURL || null);
      } catch {
        setAvatarUrl(user.photoURL || null);
      }
    };

    checkAvatar();

    const handleAvatarChange = (e: any) => {
      if (e.detail?.userId === user.uid) {
        setAvatarUrl(e.detail.avatarUrl);
      }
    };

    window.addEventListener("mentora_avatar_changed", handleAvatarChange);
    return () => {
      window.removeEventListener("mentora_avatar_changed", handleAvatarChange);
    };
  }, [user]);

  const roleLabel = role === "student" ? "Scholar" : role === "mentor" ? "Mentor" : role === "trustee" ? "Trustee" : "User";

  return (
    <header className="sticky top-0 z-40 w-full h-16 border-b border-theme bg-surface/90 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <Image
          src="/logo.png"
          alt="Mentora Logo"
          width={36}
          height={36}
          className="rounded-lg object-contain shrink-0"
        />
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg tracking-tight leading-tight text-primary-theme">
              Mentora
            </span>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-500/10 text-teal-700 dark:text-teal-300">
              {roleLabel}
            </span>
          </div>
          <span className="text-[10px] uppercase tracking-wider text-muted-theme font-medium hidden sm:block">
            VRCF Foundation
          </span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Admin Link if authorized */}
        {isAdmin && (
          <Link
            href="/admin"
            className="btn-tertiary text-xs px-3 py-1.5 flex items-center gap-1.5"
            title="Access Roles Admin"
          >
            <Shield className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span className="hidden md:inline">Admin</span>
          </Link>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="w-9 h-9 rounded-full flex items-center justify-center border border-theme hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-primary-theme cursor-pointer"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full border border-theme hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-teal-600/10 text-teal-700 dark:text-teal-300 flex items-center justify-center text-xs font-bold overflow-hidden border border-teal-500/20 shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>
                  {user?.displayName ? user.displayName.charAt(0).toUpperCase() : user?.email ? user.email.charAt(0).toUpperCase() : "U"}
                </span>
              )}
            </div>
            <span className="text-xs font-medium text-primary-theme max-w-[100px] truncate hidden sm:inline">
              {profile?.name || user?.displayName || user?.email?.split("@")[0] || "Account"}
            </span>
            <ChevronDown className="w-3 h-3 text-muted-theme" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 card-theme py-2 z-50 shadow-lg text-sm">
                <div className="px-4 py-2 border-b border-theme">
                  <p className="font-semibold text-xs text-primary-theme truncate">
                    {profile?.name || user?.displayName || "Signed In"}
                  </p>
                  <p className="text-[11px] text-muted-theme truncate font-mono">
                    {user?.email}
                  </p>
                  <div className="mt-1 flex items-center gap-1 text-[11px] text-teal-600 dark:text-teal-400 font-medium">
                    <UserCheck className="w-3 h-3" />
                    <span className="capitalize">{role || "Pending"} Role</span>
                  </div>
                </div>

                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-primary-theme hover:bg-teal-500/10 transition-colors"
                  >
                    <Shield className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>Role Directory Admin</span>
                  </Link>
                )}

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
