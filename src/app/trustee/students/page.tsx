"use client";

import React, { useState, useEffect } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import { useAuth } from "@/lib/auth-context";
import { getTrusteeStudentRoster, TrusteeStudentView } from "@/lib/trustee-data";
import { Users, TrendingUp, Eye, ShieldAlert, Award } from "lucide-react";

export default function TrusteeStudentsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<TrusteeStudentView[]>([]);
  const [loading, setLoading] = useState(true);

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
              Scholar Roster (Read-Only)
            </h1>
            <p className="text-sm text-muted-theme mt-1">
              Complete observation directory of all VRCF scholarship recipients, courses, stated career goals, and competency indicators.
            </p>
          </div>

          <div className="px-3.5 py-1.5 rounded-full border border-theme text-xs text-muted-theme flex items-center gap-2">
            <Eye className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Trustee Observer Mode</span>
          </div>
        </div>

        {/* Read-Only Table */}
        <div className="card-theme overflow-hidden">
          <div className="p-5 border-b border-theme flex items-center justify-between">
            <h2 className="font-bold text-base text-primary-theme">
              Active Scholars ({students.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-black/[0.02] dark:bg-white/[0.02] border-b border-theme text-xs text-muted-theme font-medium uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Scholar Details</th>
                  <th className="py-3.5 px-6">Degree &amp; Academic Focus</th>
                  <th className="py-3.5 px-6">Stated Career Goal</th>
                  <th className="py-3.5 px-6">Competency Signal</th>
                  <th className="py-3.5 px-6 text-right">Inquiry Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme">
                {students.map((st) => (
                  <tr key={st.id} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01]">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-primary-theme">{st.name}</div>
                      <div className="text-xs text-muted-theme font-mono">{st.email}</div>
                    </td>
                    <td className="py-4 px-6 text-xs">
                      <div className="font-medium text-primary-theme">{st.course}</div>
                      <div className="text-muted-theme mt-0.5">{st.focusArea}</div>
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
