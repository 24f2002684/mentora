"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { Role } from "@/types";
import { RefreshCw, AlertTriangle } from "lucide-react";

interface DashboardShellProps {
  children: React.ReactNode;
  allowedRole?: Role;
}

export default function DashboardShell({ children, allowedRole }: DashboardShellProps) {
  const { user, role, loading, refreshSession } = useAuth();
  const router = useRouter();
  const [verifying, setVerifying] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    async function checkServerSession() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.push("/");
          return;
        }
        const data = await res.json();
        if (!data.authenticated) {
          router.push("/");
          return;
        }

        if (allowedRole && data.role !== allowedRole) {
          // Cross-role redirect to correct destination
          if (data.role === "student") router.push("/student");
          else if (data.role === "mentor") router.push("/mentor");
          else if (data.role === "trustee") router.push("/trustee");
          else setUnauthorized(true);
          return;
        }

        setVerifying(false);
      } catch (err) {
        console.error("Session re-verification failed:", err);
        router.push("/");
      }
    }

    if (!loading) {
      checkServerSession();
    }
  }, [loading, allowedRole, router]);

  if (loading || verifying) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-page text-muted-theme gap-3">
        <RefreshCw className="w-6 h-6 animate-spin text-teal-600 dark:text-teal-400" />
        <span className="text-xs font-medium">Verifying VRCF session...</span>
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-page p-6 text-center">
        <div className="card-theme p-8 max-w-md">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Unauthorized Area</h2>
          <p className="text-sm text-muted-theme mb-6">
            Your assigned role does not permit access to this section.
          </p>
          <button onClick={() => router.push("/")} className="btn-primary">
            Return to Authorized Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page flex flex-col">
      <Navbar />
      <div className="flex-1 flex w-full">
        <Sidebar />
        <main className="flex-1 max-w-[1200px] mx-auto w-full p-4 sm:p-6 lg:p-8 pb-24 min-[781px]:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}
