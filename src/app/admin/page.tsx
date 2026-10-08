"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { AccessRole, Role } from "@/types";
import {
  ShieldCheck,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  Sun,
  Moon,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Users,
  Search,
  Mail,
  GraduationCap,
  Building,
  Check,
  Key,
} from "lucide-react";
import Link from "next/link";

interface VRCFStudentItem {
  sno: number;
  vrcfId: string;
  name: string;
  course: string;
  college: string;
  email: string;
}

export default function AdminPage() {
  const { user, profile, isAdmin, loading: authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<"roles" | "students">("roles");
  const [roles, setRoles] = useState<AccessRole[]>([]);
  const [students, setStudents] = useState<VRCFStudentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Search filter
  const [searchTerm, setSearchTerm] = useState("");

  // Role Form states
  const [emailInput, setEmailInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [roleInput, setRoleInput] = useState<Role>("student");
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Student Email Assign Modal
  const [assignModalStudent, setAssignModalStudent] = useState<VRCFStudentItem | null>(null);
  const [assignEmailInput, setAssignEmailInput] = useState("");
  const [assigning, setAssigning] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/roles");
      if (!res.ok) {
        throw new Error("Failed to load access roles. Ensure you are signed in with an authorized admin email.");
      }
      const data = await res.json();
      setRoles(data.roles || []);
      setStudents(data.students || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchData();
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
      await fetchData();
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
    setActiveTab("roles");
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
      await fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAssignStudentEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalStudent || !assignEmailInput.trim()) return;

    setAssigning(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/admin/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "assign_student",
          vrcfId: assignModalStudent.vrcfId,
          email: assignEmailInput.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to link student email");
      }

      setSuccess(`Linked ${assignEmailInput} to ${assignModalStudent.name} (VRCF ID: ${assignModalStudent.vrcfId}) with student access.`);
      setAssignModalStudent(null);
      setAssignEmailInput("");
      await fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAssigning(false);
    }
  };

  const filteredStudents = students.filter((s) => {
    const q = searchTerm.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.vrcfId.toLowerCase().includes(q) ||
      s.course.toLowerCase().includes(q) ||
      s.college.toLowerCase().includes(q) ||
      (s.email && s.email.toLowerCase().includes(q))
    );
  });

  const studentsWithEmailCount = students.filter((s) => s.email).length;

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
      <header className="h-16 border-b border-theme px-6 md:px-12 flex items-center justify-between bg-surface sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-theme hover:text-primary-theme transition-colors"
          >
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
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8 space-y-6">
        {/* Alerts & Feedback */}
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-3 border-b border-theme pb-1">
          <button
            onClick={() => setActiveTab("roles")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "roles"
                ? "bg-teal-600 dark:bg-teal-400 text-white dark:text-[#0B1413] shadow-sm"
                : "text-muted-theme hover:text-primary-theme hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Authorized Directory ({roles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("students")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "students"
                ? "bg-teal-600 dark:bg-teal-400 text-white dark:text-[#0B1413] shadow-sm"
                : "text-muted-theme hover:text-primary-theme hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>VRCF Student Scholars ({students.length})</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10 ml-1">
              {studentsWithEmailCount}/{students.length} Linked
            </span>
          </button>
        </div>

        {/* TAB 1: ROLES MANAGEMENT */}
        {activeTab === "roles" && (
          <div className="space-y-6">
            {/* Add / Edit Form Card */}
            <div className="card-theme p-6 md:p-8">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>{isEditing ? "Edit Access Role" : "Add New User to Directory"}</span>
              </h2>

              <form onSubmit={handleSaveRole} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-1">
                  <label className="block text-xs font-medium text-muted-theme mb-1.5">Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Suhail Akthar"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full input-theme text-sm"
                  />
                </div>

                <div className="md:col-span-1">
                  <label className="block text-xs font-medium text-muted-theme mb-1.5">Google Email</label>
                  <input
                    type="email"
                    required
                    placeholder="user@gmail.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full input-theme text-sm"
                  />
                </div>

                <div className="md:col-span-1">
                  <label className="block text-xs font-medium text-muted-theme mb-1.5">Designated Role</label>
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
                  <button type="submit" disabled={submitting} className="flex-1 btn-primary py-2.5 text-sm">
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
                <h3 className="font-semibold text-base">Authorized Directory ({roles.length})</h3>
                <button onClick={fetchData} disabled={loading} className="btn-tertiary text-xs flex items-center gap-1.5">
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
          </div>
        )}

        {/* TAB 2: VRCF STUDENT SCHOLARS (from VRCFStudentData.xlsx) */}
        {activeTab === "students" && (
          <div className="space-y-6">
            <div className="card-theme p-6 md:p-8 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-primary-theme flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                    <span>VRCF Foundation Scholar Roster (44 Scholars)</span>
                  </h2>
                  <p className="text-xs text-muted-theme mt-1">
                    Directly imported from <code>VRCFStudentData.xlsx</code>. Link each scholar's Google email to grant immediate Student Dashboard access.
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-muted-theme absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search scholar name, ID, or course..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full input-theme pl-9 py-2 text-xs"
                  />
                </div>
              </div>

              {/* Roster Table */}
              <div className="border border-theme rounded-xl overflow-hidden mt-4">
                <div className="overflow-x-auto max-h-[550px] overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-black/[0.02] dark:bg-white/[0.02] border-b border-theme font-semibold text-muted-theme uppercase sticky top-0 backdrop-blur-md">
                      <tr>
                        <th className="py-3 px-4">VRCF ID</th>
                        <th className="py-3 px-4">Scholar Name</th>
                        <th className="py-3 px-4">Course</th>
                        <th className="py-3 px-4">College</th>
                        <th className="py-3 px-4">Assigned Google Email</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-theme">
                      {filteredStudents.map((st) => {
                        const isLinked = !!st.email;
                        return (
                          <tr key={st.vrcfId} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01]">
                            <td className="py-3 px-4 font-mono font-bold text-teal-700 dark:text-teal-300">
                              {st.vrcfId}
                            </td>
                            <td className="py-3 px-4 font-semibold text-primary-theme">{st.name}</td>
                            <td className="py-3 px-4 text-muted-theme">{st.course}</td>
                            <td className="py-3 px-4 text-muted-theme max-w-xs truncate">{st.college}</td>
                            <td className="py-3 px-4 font-mono">
                              {isLinked ? (
                                <span className="inline-flex items-center gap-1.5 text-teal-700 dark:text-teal-300 font-medium">
                                  <Check className="w-3.5 h-3.5" />
                                  <span>{st.email}</span>
                                </span>
                              ) : (
                                <span className="text-amber-600 dark:text-amber-400 font-medium italic">
                                  Email Pending
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => {
                                  setAssignModalStudent(st);
                                  setAssignEmailInput(st.email || "");
                                }}
                                className={`text-xs py-1 px-3 rounded-full font-medium transition-all ${
                                  isLinked
                                    ? "btn-secondary text-[11px]"
                                    : "btn-primary text-[11px]"
                                }`}
                              >
                                {isLinked ? "Update Email" : "Link Email"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Assign Google Email to Student */}
        {assignModalStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="card-theme max-w-md w-full p-6 md:p-8 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-theme">
                <div>
                  <h3 className="font-bold text-base text-primary-theme">Link Google Account</h3>
                  <p className="text-xs text-muted-theme">
                    Assigning email for {assignModalStudent.name} (VRCF ID: {assignModalStudent.vrcfId})
                  </p>
                </div>
                <button onClick={() => setAssignModalStudent(null)} className="btn-tertiary text-xs p-1">
                  &times;
                </button>
              </div>

              <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-theme text-xs space-y-1">
                <p>
                  <strong>Course:</strong> {assignModalStudent.course}
                </p>
                <p>
                  <strong>College:</strong> {assignModalStudent.college}
                </p>
              </div>

              <form onSubmit={handleAssignStudentEmail} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-theme uppercase tracking-wider mb-1.5">
                    Scholar's Google Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="scholar@gmail.com"
                    value={assignEmailInput}
                    onChange={(e) => setAssignEmailInput(e.target.value)}
                    className="w-full input-theme text-sm"
                    autoFocus
                  />
                  <p className="text-[11px] text-muted-theme mt-1">
                    Once linked, this scholar can immediately sign in with Google to access their Student Dashboard.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-theme">
                  <button
                    type="button"
                    onClick={() => setAssignModalStudent(null)}
                    className="btn-tertiary text-xs"
                  >
                    Cancel
                  </button>
                  <button type="submit" disabled={assigning} className="btn-primary text-xs py-2 px-5">
                    {assigning ? "Linking..." : "Grant Student Access"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
