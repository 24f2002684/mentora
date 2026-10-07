"use client";

import React, { useState, useEffect } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import { useAuth } from "@/lib/auth-context";
import { getTrusteeDashboardData, TrusteeProgramStats } from "@/lib/trustee-data";
import {
  Users,
  Activity,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  PieChart,
  FileText,
  Shield,
  Layers,
} from "lucide-react";
import Link from "next/link";

export default function TrusteeDashboardPage() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<TrusteeProgramStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const data = await getTrusteeDashboardData();
        setStats(data);
      } catch (e) {
        console.error("Trustee data loading error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  if (!stats) return null;

  return (
    <DashboardShell allowedRole="trustee">
      <div className="space-y-8">
        {/* Header */}
        <div className="pb-2 border-b border-theme flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Trustee Governance Dashboard
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary-theme">
              VRCF Program Impact &amp; Oversight
            </h1>
            <p className="text-sm text-muted-theme mt-1">
              High-level analytics tracking financial aid efficacy, leadership development, and competency gains.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/trustee/reports" className="btn-primary">
              <FileText className="w-4 h-4" />
              <span>Generate Summary Report</span>
            </Link>
          </div>
        </div>

        {/* Flagged Students Notice Banner */}
        {stats.flaggedNotice && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-xs md:text-sm text-amber-900 dark:text-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold">Trustee Advisory Notice: </span>
              <span>{stats.flaggedNotice.detail}</span>
            </div>
          </div>
        )}

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Total Students */}
          <div className="card-theme p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-muted-theme uppercase tracking-wider">
                Total Enrolled Scholars
              </span>
              <div className="w-8 h-8 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary-theme">
                {stats.totalStudents} Scholars Supported
              </div>
              <p className="text-xs text-muted-theme mt-1.5 flex items-center justify-between">
                <span>100% financial-aid recipients</span>
                <Link href="/trustee/students" className="text-teal-600 dark:text-teal-400 font-medium hover:underline">
                  View Roster &rarr;
                </Link>
              </p>
            </div>
          </div>

          {/* Active This Week */}
          <div className="card-theme p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-muted-theme uppercase tracking-wider">
                Weekly Active Participation
              </span>
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary-theme">
                {stats.activeThisWeek} of {stats.totalStudents} ({Math.round((stats.activeThisWeek / stats.totalStudents) * 100)}%)
              </div>
              <p className="text-xs text-muted-theme mt-1.5">
                Scholars logged in &amp; completing Socratic inquiries this week
              </p>
            </div>
          </div>

          {/* Overall Task Completion */}
          <div className="card-theme p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-muted-theme uppercase tracking-wider">
                Assignment Completion Rate
              </span>
              <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary-theme">
                {stats.overallTaskCompletionRate}% Completed
              </div>
              <p className="text-xs text-muted-theme mt-1.5">
                Across all mentor and self-directed inquiries
              </p>
            </div>
          </div>
        </div>

        {/* 2-Column: Program Mix & Aggregate Competency Trajectory */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Program Mix Card (5 Cols) */}
          <div className="lg:col-span-5 card-theme p-6 md:p-8 space-y-5">
            <div className="pb-3 border-b border-theme">
              <div className="flex items-center gap-2 mb-1">
                <PieChart className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                  Cohort Diversity
                </span>
              </div>
              <h2 className="text-lg font-bold text-primary-theme">Program Mix by Academic Field</h2>
            </div>

            <div className="space-y-4">
              {stats.programMix.map((item) => (
                <div key={item.course} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-primary-theme">{item.course}</span>
                    <span className="text-muted-theme font-semibold">
                      {item.count} scholars ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-border-subtle rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-teal-600 dark:bg-teal-400 h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-theme text-xs text-muted-theme">
              VRCF scholars are concentrated in STEM, data science, and analytical disciplines where critical thinking drives high public impact.
            </div>
          </div>

          {/* Aggregate Competency Development List (7 Cols) */}
          <div className="lg:col-span-7 card-theme p-6 md:p-8 space-y-5">
            <div className="pb-3 border-b border-theme flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                    Cohort Outcomes
                  </span>
                </div>
                <h2 className="text-lg font-bold text-primary-theme">
                  Competency Growth (All Scholars)
                </h2>
              </div>
            </div>

            <div className="space-y-3">
              {stats.aggregateCompetencies.slice(0, 6).map((comp) => (
                <div
                  key={comp.competency}
                  className="p-3.5 rounded-xl border border-theme bg-surface flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <span className="font-semibold text-xs md:text-sm text-primary-theme block">
                      {comp.competency}
                    </span>
                    <div className="flex items-center gap-3 text-[11px] text-muted-theme">
                      <span>Strong: {comp.levelDistribution.strong}</span>
                      <span>Developing: {comp.levelDistribution.developing}</span>
                      <span>Foundation: {comp.levelDistribution.foundation}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-700 dark:text-teal-300">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{comp.netTrend === "up" ? "+Positive Drift" : "Stable Baseline"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
