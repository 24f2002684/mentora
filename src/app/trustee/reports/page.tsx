"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import DashboardShell from "@/components/layout/DashboardShell";
import { useAuth } from "@/lib/auth-context";
import { getTrusteeDashboardData, TrusteeProgramStats } from "@/lib/trustee-data";
import { Printer, FileText, ArrowLeft, Download, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function TrusteeReportsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<TrusteeProgramStats | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState("Fall Semester 2026");

  useEffect(() => {
    async function load() {
      const data = await getTrusteeDashboardData();
      setStats(data);
    }
    load();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <DashboardShell allowedRole="trustee">
      <div className="space-y-8">
        {/* Header Actions (hidden in print) */}
        <div className="print:hidden pb-2 border-b border-theme flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Official Trust Assessment
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary-theme">
              Executive Governance Report
            </h1>
            <p className="text-sm text-muted-theme mt-1">
              Exportable summary of scholar financial aid efficacy and Socratic competency development.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="input-theme text-xs py-2 px-3"
            >
              <option value="Fall Semester 2026">Fall Semester 2026</option>
              <option value="Academic Year 2025-2026">Academic Year 2025-2026</option>
              <option value="Past 90 Days">Past 90 Days</option>
            </select>

            <button
              onClick={handlePrint}
              className="btn-primary text-xs py-2.5 px-5 flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Export PDF</span>
            </button>
          </div>
        </div>

        {/* Printable Document Sheet */}
        <div className="card-theme p-8 md:p-12 space-y-8 print:p-0 print:border-none print:shadow-none bg-surface max-w-4xl mx-auto">
          {/* Header of Report */}
          <div className="flex items-start justify-between border-b border-theme pb-6">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Mentora Logo"
                width={48}
                height={48}
                className="rounded-xl object-contain shrink-0"
              />
              <div>
                <h2 className="text-2xl font-bold text-primary-theme tracking-tight">
                  VRCF Foundation
                </h2>
                <p className="text-xs text-muted-theme uppercase tracking-wider font-semibold">
                  Mentora Financial-Aid &amp; Leadership Oversight Committee
                </p>
              </div>
            </div>

            <div className="text-right text-xs text-muted-theme space-y-1">
              <p className="font-semibold text-primary-theme">Confidential Trustee Brief</p>
              <p>Period: {selectedPeriod}</p>
              <p>Generated: 2026-10-08</p>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-theme">
              1. Executive Performance Summary
            </h3>
            <p className="text-sm text-primary-theme leading-relaxed">
              During this evaluation cycle, 18 collegiate scholars supported under the VRCF Foundation financial-aid charter logged 140+ verified hours of Socratic inquiry, analytical problem formulation, and leadership case studies. The overall assignment completion rate reached 82%, reflecting consistent engagement across mentors and scholars.
            </p>

            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-theme bg-black/[0.01] dark:bg-white/[0.01]">
                <div className="text-xs text-muted-theme">Active Scholars</div>
                <div className="text-xl font-bold text-primary-theme mt-1">18 Scholars</div>
                <div className="text-[11px] text-teal-700 dark:text-teal-300 mt-0.5">100% Aid Utilization</div>
              </div>

              <div className="p-4 rounded-xl border border-theme bg-black/[0.01] dark:bg-white/[0.01]">
                <div className="text-xs text-muted-theme">Weekly Engagement</div>
                <div className="text-xl font-bold text-primary-theme mt-1">83.3%</div>
                <div className="text-[11px] text-teal-700 dark:text-teal-300 mt-0.5">15 Active this week</div>
              </div>

              <div className="p-4 rounded-xl border border-theme bg-black/[0.01] dark:bg-white/[0.01]">
                <div className="text-xs text-muted-theme">Assignment Success</div>
                <div className="text-xl font-bold text-primary-theme mt-1">82.0%</div>
                <div className="text-[11px] text-teal-700 dark:text-teal-300 mt-0.5">On-time submissions</div>
              </div>
            </div>
          </div>

          {/* Competency Development Table */}
          <div className="space-y-3 pt-4 border-t border-theme">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-theme">
              2. VRCF Competency Growth Matrix
            </h3>
            <div className="border border-theme rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-black/[0.02] dark:bg-white/[0.02] border-b border-theme font-semibold text-muted-theme uppercase">
                  <tr>
                    <th className="py-2.5 px-4">Competency Domain</th>
                    <th className="py-2.5 px-4">Strong</th>
                    <th className="py-2.5 px-4">Developing</th>
                    <th className="py-2.5 px-4">Foundation</th>
                    <th className="py-2.5 px-4 text-right">Aggregate Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme">
                  {stats?.aggregateCompetencies.map((comp) => (
                    <tr key={comp.competency}>
                      <td className="py-2.5 px-4 font-medium text-primary-theme">
                        {comp.competency}
                      </td>
                      <td className="py-2.5 px-4 text-teal-700 dark:text-teal-300 font-semibold">
                        {comp.levelDistribution.strong} scholars
                      </td>
                      <td className="py-2.5 px-4 text-blue-700 dark:text-blue-300">
                        {comp.levelDistribution.developing} scholars
                      </td>
                      <td className="py-2.5 px-4 text-muted-theme">
                        {comp.levelDistribution.foundation} scholars
                      </td>
                      <td className="py-2.5 px-4 text-right font-semibold text-teal-700 dark:text-teal-300">
                        {comp.netTrend === "up" ? "+Upward" : "Steady"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Academic Field Distribution */}
          <div className="space-y-3 pt-4 border-t border-theme">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-theme">
              3. Field of Study Distribution
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {stats?.programMix.map((m) => (
                <div key={m.course} className="p-3 rounded-xl border border-theme text-xs">
                  <span className="font-semibold text-primary-theme block truncate">{m.course}</span>
                  <span className="text-muted-theme mt-1 block">
                    {m.count} scholars ({m.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Trustee Sign-Off Block */}
          <div className="pt-8 border-t border-theme grid grid-cols-2 gap-8 text-xs text-muted-theme">
            <div>
              <p className="font-semibold text-primary-theme">Prepared for Board of Trustees</p>
              <p className="mt-1">VRCF Financial Aid &amp; Mentorship Trust</p>
              <div className="mt-6 border-b border-theme w-48" />
              <p className="mt-1 text-[11px]">Lead Trustee / Coordinator Signature</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-primary-theme">Platform Certification</p>
              <p className="mt-1">Mentora Socratic Platform v1.0</p>
              <div className="mt-6 border-b border-theme w-48 ml-auto" />
              <p className="mt-1 text-[11px]">Date Certified</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
