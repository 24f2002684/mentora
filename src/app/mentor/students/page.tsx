"use client";

import React, { useState, useEffect } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import { useAuth } from "@/lib/auth-context";
import { getAllScholarProfiles } from "@/lib/scholar-roster";
import ScholarProfileModal, { UnifiedScholarProfile } from "@/components/profile/ScholarProfileModal";
import { Users, TrendingUp, Eye, Search, Send, GraduationCap, MapPin } from "lucide-react";
import Link from "next/link";

export default function MentorStudentsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<UnifiedScholarProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<UnifiedScholarProfile | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const list = getAllScholarProfiles();
        setStudents(list);
      } catch (e) {
        console.error("Students list loading error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const filteredStudents = students.filter((s) => {
    const q = searchTerm.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.vrcfId.toLowerCase().includes(q) ||
      s.course.toLowerCase().includes(q) ||
      s.college.toLowerCase().includes(q) ||
      s.district.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q)
    );
  });

  return (
    <DashboardShell allowedRole="mentor">
      <div className="space-y-8">
        {/* Header */}
        <div className="pb-2 border-b border-theme flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Mentorship Roster
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary-theme">
              VRCF Assigned Scholars ({students.length})
            </h1>
            <p className="text-sm text-muted-theme mt-1">
              Click any scholar to inspect their verified profile, contact details, academic milestones, and competencies.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-muted-theme absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, ID, college..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full input-theme pl-9 py-2 text-xs"
              />
            </div>

            <Link href="/mentor/assign" className="btn-primary text-xs shrink-0 py-2 px-3.5 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5" />
              <span>+ Assign Task</span>
            </Link>
          </div>
        </div>

        {/* Students Table */}
        <div className="card-theme overflow-hidden">
          <div className="p-5 border-b border-theme flex items-center justify-between">
            <h2 className="font-bold text-base text-primary-theme">
              Enrolled Scholars ({filteredStudents.length})
            </h2>
            <span className="text-xs text-muted-theme">
              Click any row or &quot;View Profile&quot; to review full scholar dossier
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-black/[0.02] dark:bg-white/[0.02] border-b border-theme text-xs text-muted-theme font-medium uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">VRCF ID</th>
                  <th className="py-3.5 px-6">Scholar Name</th>
                  <th className="py-3.5 px-6">Degree &amp; College</th>
                  <th className="py-3.5 px-6">District</th>
                  <th className="py-3.5 px-6">Year / Residence</th>
                  <th className="py-3.5 px-6">Stated Career Goal</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme">
                {filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className="hover:bg-teal-500/[0.03] dark:hover:bg-teal-500/[0.05] cursor-pointer transition-colors"
                  >
                    <td className="py-4 px-6 font-mono font-bold text-xs text-teal-700 dark:text-teal-300">
                      {student.vrcfId}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-primary-theme">{student.name}</div>
                      <div className="text-xs text-muted-theme font-mono">{student.email || "No email on record"}</div>
                    </td>
                    <td className="py-4 px-6 text-xs">
                      <div className="font-semibold text-primary-theme">{student.course}</div>
                      <div className="text-muted-theme mt-0.5">{student.college}</div>
                    </td>
                    <td className="py-4 px-6 text-xs text-muted-theme">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                        <span>{student.district}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs">
                      <div className="font-semibold text-primary-theme">{student.yearOfStudy}</div>
                      <div className="text-muted-theme mt-0.5">{student.hostelOrDayScholar}</div>
                    </td>
                    <td className="py-4 px-6 text-xs text-teal-800 dark:text-teal-200 font-medium max-w-xs leading-relaxed">
                      {student.careerGoal}
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStudent(student);
                        }}
                        className="btn-secondary text-xs py-1.5 px-3 inline-flex items-center gap-1 hover:border-teal-500/50"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View Profile</span>
                      </button>
                      <Link
                        href={`/mentor/assign?studentId=${encodeURIComponent(student.id)}`}
                        onClick={(e) => e.stopPropagation()}
                        className="btn-tertiary text-xs py-1.5 px-3 inline-flex items-center gap-1 hover:text-teal-600"
                      >
                        Assign
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Scholar Profile Modal */}
        {selectedStudent && (
          <ScholarProfileModal
            scholar={selectedStudent}
            onClose={() => setSelectedStudent(null)}
            canAssignTask={true}
          />
        )}
      </div>
    </DashboardShell>
  );
}
