"use client";

import React, { useState, useEffect } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import { useAuth } from "@/lib/auth-context";
import { getTrusteeStudentRoster, TrusteeStudentView } from "@/lib/trustee-data";
import ScholarProfileModal from "@/components/profile/ScholarProfileModal";
import {
  Users,
  TrendingUp,
  Eye,
  Search,
} from "lucide-react";

export default function TrusteeStudentsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<TrusteeStudentView[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<TrusteeStudentView | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<"vision" | "competencies" | "tasks">("vision");

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const data = await getTrusteeStudentRoster();
        setStudents(data);
      } catch (e) {
        console.error("Trustee students load error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const filteredStudents = students.filter((st) => {
    const q = searchTerm.toLowerCase();
    return (
      st.name.toLowerCase().includes(q) ||
      st.vrcfId.toLowerCase().includes(q) ||
      st.course.toLowerCase().includes(q) ||
      st.college.toLowerCase().includes(q) ||
      st.email.toLowerCase().includes(q)
    );
  });

  return (
    <DashboardShell allowedRole="trustee">
      <div className="space-y-8">
        {/* Header */}
        <div className="pb-2 border-b border-theme flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Governance Oversight
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary-theme">
              Scholar Roster ({students.length})
            </h1>
            <p className="text-sm text-muted-theme mt-1">
              Click on any scholar to inspect their complete profile, vision goals, task progress, and mentor evaluations.
            </p>
          </div>

          {/* Search bar */}
          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-muted-theme absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, ID, or college..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full input-theme pl-9 py-2 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Read-Only Table */}
        <div className="card-theme overflow-hidden">
          <div className="p-5 border-b border-theme flex items-center justify-between">
            <h2 className="font-bold text-base text-primary-theme">
              VRCF Foundation Scholars ({filteredStudents.length})
            </h2>
            <span className="text-xs text-muted-theme">
              Click any row for in-depth portfolio review
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-black/[0.02] dark:bg-white/[0.02] border-b border-theme text-xs text-muted-theme font-medium uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">VRCF ID</th>
                  <th className="py-3.5 px-6">Scholar Name</th>
                  <th className="py-3.5 px-6">Degree &amp; College</th>
                  <th className="py-3.5 px-6">Stated Career Goal</th>
                  <th className="py-3.5 px-6">Competency Signal</th>
                  <th className="py-3.5 px-6 text-right">Inquiry Hours</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme">
                {filteredStudents.map((st) => (
                  <tr
                    key={st.id}
                    onClick={() => {
                      setSelectedStudent(st);
                      setActiveModalTab("vision");
                    }}
                    className="hover:bg-teal-500/[0.03] dark:hover:bg-teal-500/[0.05] cursor-pointer transition-colors"
                  >
                    <td className="py-4 px-6 font-mono font-bold text-xs text-teal-700 dark:text-teal-300">
                      {st.vrcfId}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-primary-theme">{st.name}</div>
                      <div className="text-xs text-muted-theme font-mono">{st.email}</div>
                    </td>
                    {/* Fixed: Course at top, College name cleanly below without repetition */}
                    <td className="py-4 px-6 text-xs">
                      <div className="font-semibold text-primary-theme">{st.course}</div>
                      <div className="text-muted-theme mt-0.5">{st.college}</div>
                    </td>
                    <td className="py-4 px-6 text-xs text-teal-800 dark:text-teal-200 font-medium max-w-xs leading-relaxed">
                      {st.careerGoal}
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <span className="font-semibold text-xs text-primary-theme block">
                          {st.competencySignal.topCompetency}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 font-semibold">
                            {st.competencySignal.level}
                          </span>
                          <span className="text-[10px] text-muted-theme flex items-center gap-0.5">
                            <TrendingUp className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                            {st.competencySignal.trend}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right font-medium text-xs text-primary-theme">
                      {st.totalHoursSpent} hrs
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStudent(st);
                          setActiveModalTab("vision");
                        }}
                        className="btn-secondary text-[11px] py-1 px-3 inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* DETAILED STUDENT PROFILE MODAL FOR TRUSTEES */}
        {selectedStudent && (
          <ScholarProfileModal
            scholar={selectedStudent}
            onClose={() => setSelectedStudent(null)}
          />
        )}
      </div>
    </DashboardShell>
  );
}
