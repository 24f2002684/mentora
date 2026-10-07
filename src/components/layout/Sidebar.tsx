"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  Home,
  Compass,
  CheckSquare,
  Bot,
  TrendingUp,
  BookOpen,
  Users,
  PlusCircle,
  FileCheck2,
  LayoutDashboard,
  FileText,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const { role } = useAuth();

  const studentLinks = [
    { label: "Home", href: "/student", icon: Home },
    { label: "My Journey", href: "/student/journey", icon: Compass },
    { label: "Tasks", href: "/student/tasks", icon: CheckSquare },
    { label: "AI Tutor", href: "/student/tutor", icon: Bot },
    { label: "Progress", href: "/student/progress", icon: TrendingUp },
    { label: "Resources", href: "/student/resources", icon: BookOpen },
  ];

  const mentorLinks = [
    { label: "Home", href: "/mentor", icon: Home },
    { label: "My Students", href: "/mentor/students", icon: Users },
    { label: "Assign Task", href: "/mentor/assign", icon: PlusCircle },
    { label: "Reviews", href: "/mentor/reviews", icon: FileCheck2 },
  ];

  const trusteeLinks = [
    { label: "Dashboard", href: "/trustee", icon: LayoutDashboard },
    { label: "Students", href: "/trustee/students", icon: Users },
    { label: "Reports", href: "/trustee/reports", icon: FileText },
  ];

  const links =
    role === "student"
      ? studentLinks
      : role === "mentor"
      ? mentorLinks
      : role === "trustee"
      ? trusteeLinks
      : [];

  return (
    <>
      {/* Desktop Sidebar: Visible >= 780px */}
      <aside className="hidden min-[781px]:flex flex-col w-56 shrink-0 border-r border-theme bg-surface/50 min-h-[calc(100vh-4rem)] p-4 space-y-1">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-theme px-3 py-2">
          Navigation
        </div>
        {links.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-full text-sm font-medium transition-all ${
                isActive
                  ? "bg-teal-600 dark:bg-teal-400 text-white dark:text-[#0B1413] shadow-sm font-semibold"
                  : "text-muted-theme hover:text-primary-theme hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </aside>

      {/* Mobile Bottom Tab Bar: Collapses under 780px */}
      <nav className="min-[781px]:hidden fixed bottom-0 left-0 right-0 z-50 h-16 border-t border-theme bg-surface/95 backdrop-blur-md px-2 flex items-center justify-around shadow-lg">
        {links.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors ${
                isActive
                  ? "text-teal-600 dark:text-teal-400 font-semibold"
                  : "text-muted-theme hover:text-primary-theme"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[64px]">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
