"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { AccessRole, Role } from "@/types";
import { ShieldCheck, Plus, Trash2, Edit2, RefreshCw, Sun, Moon, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
  const { user, profile, isAdmin, loading: authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [roles, setRoles] = useState<AccessRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [emailInput, setEmailInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [roleInput, setRoleInput] = useState<Role>("student");
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/roles");
      if (!res.ok) {
        throw new Error("Failed to load access roles. Ensure you are signed in with an authorized admin email.");
      }
      const data = await res.json();
      setRoles(data.roles || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchRoles();
    }
  }, [authLoading]);

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/admin/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailInput.trim(),
          name: nameInput.trim() || emailInput.split("@")[0],
          role: roleInput,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save role");
      }

      setSuccess(`Role for ${emailInput} successfully saved as ${roleInput}.`);
      setEmailInput("");
      setNameInput("");
      setRoleInput("student");
      setIsEditing(false);
      await fetchRoles();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (item: AccessRole) => {
    setEmailInput(item.email);
    setNameInput(item.name);
    setRoleInput(item.role);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteRole = async (email: string) => {
    if (!confirm(`Are you sure you want to remove access for ${email}?`)) return;

    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/admin/roles?email=${encodeURIComponent(email)}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete role");
      }

      setSuccess(`Removed access for ${email}.`);
      await fetchRoles();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page text-muted-theme">
        <RefreshCw className="w-6 h-6 animate-spin text-teal-600 dark:text-teal-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page text-primary-theme flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-theme px-6 md:px-12 flex items-center justify-between bg-surface">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-theme hover:text-primary-theme transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Portal</span>
          </Link>
          <div className="h-4 w-px bg-border-subtle" />
          <div className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="Mentora Logo"
              width={28}
              height={28}
              className="rounded-md object-contain"
            />
            <h1 className="font-bold text-lg tracking-tight">Mentora Access Directory Admin</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-full flex items-center justify-center border border-theme hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-8 space-y-8">
        {/* Admin notice */}
        <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-xs md:text-sm text-teal-800 dark:text-teal-200 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 flex-shrink-0 text-teal-600 dark:text-teal-400 mt-0.5" />
          <div>
            <p className="font-semibold">Role Directory Management</p>
            <p className="opacity-90">
              Users who authenticate via Google must match an email in this directory to be granted entry. Users not listed here will see the "Access Pending" screen.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Add / Edit Form Card */}
        <div className="card-theme p-6 md:p-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>{isEditing ? "Edit Access Role" : "Add New User to Directory"}</span>
          </h2>

          <form onSubmit={handleSaveRole} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-1">
              <label className="block text-xs font-medium text-muted-theme mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. Suhail Akthar"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full input-theme text-sm"
              />
            </div>

            <div className="md:col-span-1">
              <label className="block text-xs font-medium text-muted-theme mb-1.5">
                Google Email
              </label>
              <input
                type="email"
                required
                placeholder="scholar@example.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full input-theme text-sm"
              />
            </div>

            <div className="md:col-span-1">
              <label className="block text-xs font-medium text-muted-theme mb-1.5">
                Designated Role
              </label>
              <select
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value as Role)}
                className="w-full input-theme text-sm"
              >
                <option value="student">Student</option>
                <option value="mentor">Mentor</option>
                <option value="trustee">Trustee</option>
              </select>
            </div>

            <div className="md:col-span-1 flex items-center gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 btn-primary py-2.5 text-sm"
              >
                {submitting ? "Saving..." : isEditing ? "Update Role" : "Grant Access"}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEmailInput("");
                    setNameInput("");
                  }}
                  className="btn-tertiary text-xs"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Access Directory Table */}
        <div className="card-theme overflow-hidden">
          <div className="p-5 border-b border-theme flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-base">Authorized Directory ({roles.length})</h3>
            </div>
            <button
              onClick={fetchRoles}
              disabled={loading}
              className="btn-tertiary text-xs flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-black/[0.02] dark:bg-white/[0.02] border-b border-theme text-xs text-muted-theme font-medium uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Name</th>
                  <th className="py-3.5 px-6">Email</th>
                  <th className="py-3.5 px-6">Role</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme">
                {roles.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-muted-theme">
                      No roles found in directory.
                    </td>
                  </tr>
                ) : (
                  roles.map((item) => (
                    <tr key={item.email} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01]">
                      <td className="py-4 px-6 font-medium">{item.name}</td>
                      <td className="py-4 px-6 text-muted-theme font-mono text-xs">{item.email}</td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide ${
                            item.role === "student"
                              ? "bg-teal-500/10 text-teal-700 dark:text-teal-300"
                              : item.role === "mentor"
                              ? "bg-blue-500/10 text-blue-700 dark:text-blue-300"
                              : "bg-purple-500/10 text-purple-700 dark:text-purple-300"
                          }`}
                        >
                          {item.role}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => handleEditClick(item)}
                          className="btn-tertiary p-2 text-xs"
                          title="Edit role"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRole(item.email)}
                          className="btn-tertiary p-2 text-xs hover:text-red-500"
                          title="Remove access"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
