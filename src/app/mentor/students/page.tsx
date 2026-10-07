"use client";

import React, { useState, useEffect } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import { useAuth } from "@/lib/auth-context";
import { getMentorStudents, StudentSummary } from "@/lib/mentor-data";
import { Users, TrendingUp, Compass, Award, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function MentorStudentsPage() {
  const { user } = useAuth();
  const mentorEmail = user?.email || "suhailaktharsm25@gmail.com";

  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const list = await getMentorStudents(mentorEmail);
        setStudents(list);
      } catch (e) {
        console.error("Students list loading error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user, mentorEmail]);

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
              My Assigned Scholars
            </h1>
            <p className="text-sm text-muted-theme mt-1">
              Active scholars linked to your portfolio via VRCF mentorship assignments.
            </p>
          </div>

          <Link href="/mentor/assign" className="btn-primary">
            <span>+ Assign Task</span>
          </Link>
        </div>

        {/* Students Table */}
        <div className="card-theme overflow-hidden">
          <div className="p-5 border-b border-theme flex items-center justify-between">
            <h2 className="font-bold text-base text-primary-theme">
              Enrolled Scholars ({students.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-black/[0.02] dark:bg-white/[0.02] border-b border-theme text-xs text-muted-theme font-medium uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Scholar Name</th>
                  <th className="py-3.5 px-6">Course &amp; Academic Focus</th>
                  <th className="py-3.5 px-6">Stated Career Goal</th>
                  <th className="py-3.5 px-6">Notable Competency Trend</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01]">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-primary-theme">{student.name}</div>
                      <div className="text-xs text-muted-theme font-mono">{student.email}</div>
                    </td>
                    <td className="py-4 px-6 text-xs">
                      <div className="font-medium text-primary-theme">{student.course}</div>
                      <div className="text-muted-theme mt-0.5">{student.focusArea}</div>
                    </td>
                    <td className="py-4 px-6 text-xs text-teal-800 dark:text-teal-200 font-medium max-w-xs">
                      {student.careerGoal}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-700 dark:text-teal-300">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>{student.topTrend}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <Link
                        href={`/mentor/assign?studentId=${encodeURIComponent(student.id)}`}
                        className="btn-secondary text-xs py-1.5 px-3"
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
      </div>
    </DashboardShell>
  );
}
