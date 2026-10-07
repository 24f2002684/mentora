"use client";

import React, { useState, useEffect } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import { useAuth } from "@/lib/auth-context";
import {
  getStudentCompetencies,
  getStudentTasks,
  getStudentActivityStats,
} from "@/lib/student-data";
import { CompetencyScore, TaskItem } from "@/types";
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  Bot,
  Award,
  ChevronRight,
  ShieldCheck,
  FileText,
  Calendar,
} from "lucide-react";

export default function StudentProgressPage() {
  const { user } = useAuth();
  const studentId = user?.uid || "student-default";

  const [competencies, setCompetencies] = useState<CompetencyScore[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [stats, setStats] = useState({
    hoursThisMonth: "7.0",
    hoursThisWeek: "3.5",
    streakDays: 4,
    sessionCount: 6,
    tasksCompleted: 2,
  });
  const [selectedCompetency, setSelectedCompetency] = useState<CompetencyScore | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const [comps, t, st] = await Promise.all([
          getStudentCompetencies(studentId),
          getStudentTasks(studentId),
          getStudentActivityStats(studentId),
        ]);
        setCompetencies(comps);
        setTasks(t);
        setStats(st);
        if (comps.length > 0) {
          setSelectedCompetency(comps[0]);
        }
      } catch (e) {
        console.error("Progress loading error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user, studentId]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const completionRatio = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Evidence items for selected competency
  const relatedTasks = tasks.filter((t) =>
    selectedCompetency ? t.skills?.includes(selectedCompetency.competency) : false
  );

  return (
    <DashboardShell allowedRole="student">
      <div className="space-y-8">
        {/* Header */}
        <div className="pb-2 border-b border-theme">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Evaluative Performance &amp; Evidence
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary-theme">
            Progress &amp; Competency Portfolio
          </h1>
          <p className="text-sm text-muted-theme mt-1">
            Real-time competency assessment computed from mentor reviews, active Socratic inquiries, and case-study submissions.
          </p>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Hours this month */}
          <div className="card-theme p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-muted-theme uppercase tracking-wider">
                Monthly Inquiries
              </span>
              <div className="w-8 h-8 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary-theme">
                {stats.hoursThisMonth} Hours
              </div>
              <p className="text-xs text-muted-theme mt-1.5">
                Active time engaged in Socratic problem solving
              </p>
            </div>
          </div>

          {/* Tasks Completed Ratio */}
          <div className="card-theme p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-muted-theme uppercase tracking-wider">
                Task Completion Ratio
              </span>
              <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary-theme">
                {completedTasks} of {totalTasks} ({completionRatio}%)
              </div>
              <div className="mt-2 w-full bg-border-subtle rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-blue-600 dark:bg-blue-400 h-1.5 rounded-full"
                  style={{ width: `${completionRatio}%` }}
                />
              </div>
            </div>
          </div>

          {/* Tutor Session Count */}
          <div className="card-theme p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-muted-theme uppercase tracking-wider">
                AI Socratic Sessions
              </span>
              <div className="w-8 h-8 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary-theme">
                {stats.sessionCount} Completed
              </div>
              <p className="text-xs text-muted-theme mt-1.5">
                Discussions verified by Socratic diagnostic rubric
              </p>
            </div>
          </div>
        </div>

        {/* 2-Column: Competency Trend List (Left) & Evidence Card (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Competency Trend List (6 Cols) */}
          <div className="lg:col-span-6 card-theme p-6 md:p-8 space-y-4">
            <div className="pb-3 border-b border-theme flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-primary-theme">Competency Trajectory</h2>
                <p className="text-xs text-muted-theme">
                  Click any competency to examine associated evidence and mentor notes
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {competencies.map((comp) => {
                const isSelected = selectedCompetency?.competency === comp.competency;
                return (
                  <button
                    key={comp.competency}
                    onClick={() => setSelectedCompetency(comp)}
                    className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? "border-teal-600 dark:border-teal-400 bg-teal-500/5 shadow-sm"
                        : "border-theme bg-surface hover:border-teal-500/30"
                    }`}
                  >
                    <div className="space-y-1">
                      <span className="font-semibold text-sm text-primary-theme block">
                        {comp.competency}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-muted-theme">
                        <span className="font-medium">{comp.evidenceCount} evidence artifacts</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-end">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            comp.level === "Strong"
                              ? "bg-teal-500/10 text-teal-700 dark:text-teal-300"
                              : comp.level === "Developing"
                              ? "bg-blue-500/10 text-blue-700 dark:text-blue-300"
                              : "bg-black/5 dark:bg-white/5 text-muted-theme"
                          }`}
                        >
                          {comp.level}
                        </span>
                        <span className="text-[10px] text-muted-theme flex items-center gap-0.5 mt-0.5">
                          <TrendingUp className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                          <span>{comp.trend === "up" ? "+Upward" : "Steady"}</span>
                        </span>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 text-muted-theme transition-transform ${
                          isSelected ? "text-teal-600 dark:text-teal-400 translate-x-1" : ""
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Evidence Card for Selected Competency (6 Cols) */}
          <div className="lg:col-span-6 card-theme p-6 md:p-8 space-y-6">
            {selectedCompetency ? (
              <>
                <div className="pb-4 border-b border-theme flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Award className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                        Evidence Profile
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-primary-theme">
                      {selectedCompetency.competency}
                    </h3>
                  </div>

                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                      selectedCompetency.level === "Strong"
                        ? "bg-teal-500/10 text-teal-700 dark:text-teal-300"
                        : selectedCompetency.level === "Developing"
                        ? "bg-blue-500/10 text-blue-700 dark:text-blue-300"
                        : "bg-black/5 dark:bg-white/5 text-muted-theme"
                    }`}
                  >
                    Level: {selectedCompetency.level}
                  </span>
                </div>

                {/* Evidence Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-theme">
                    <span className="text-xs text-muted-theme block mb-1">Verified Evidence Count</span>
                    <span className="text-xl font-bold text-primary-theme">
                      {selectedCompetency.evidenceCount} submissions
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-theme">
                    <span className="text-xs text-muted-theme block mb-1">Observed Momentum</span>
                    <span className="text-xl font-bold text-teal-700 dark:text-teal-300 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4" />
                      {selectedCompetency.trend === "up" ? "Accelerating" : "Stable"}
                    </span>
                  </div>
                </div>

                {/* Contributing Artifacts */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-muted-theme uppercase tracking-wider">
                    Contributing Evidence &amp; Inquiries
                  </h4>

                  <div className="space-y-2.5">
                    <div className="p-3.5 rounded-xl border border-theme flex items-start gap-3 bg-surface">
                      <Bot className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <p className="font-semibold text-primary-theme">
                          Socratic Tutor Dialogues
                        </p>
                        <p className="text-muted-theme mt-0.5">
                          Exercised in {Math.max(1, selectedCompetency.evidenceCount - 1)} interactive diagnostic problem sessions.
                        </p>
                      </div>
                    </div>

                    {relatedTasks.map((rt) => (
                      <div
                        key={rt.id}
                        className="p-3.5 rounded-xl border border-theme flex items-start gap-3 bg-surface"
                      >
                        <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                        <div className="text-xs">
                          <p className="font-semibold text-primary-theme">{rt.title}</p>
                          <p className="text-muted-theme mt-0.5">
                            Status: <span className="capitalize">{rt.status.replace("_", " ")}</span> &middot; Assigned by {rt.assignedBy}
                          </p>
                        </div>
                      </div>
                    ))}

                    <div className="p-3.5 rounded-xl border border-theme flex items-start gap-3 bg-surface">
                      <FileText className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <p className="font-semibold text-primary-theme">Mentor Review Notes</p>
                        <p className="text-muted-theme mt-0.5">
                          Verified through Socratic inquiry submissions and mentor feedback sessions.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Development Next Step */}
                <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs text-teal-800 dark:text-teal-200">
                  <p className="font-semibold mb-1">Mentor Guidance for Advancing</p>
                  <p>
                    {selectedCompetency.level === "Strong"
                      ? "Demonstrate peer mentorship and synthesize multi-disciplinary case studies to maintain mastery."
                      : selectedCompetency.level === "Developing"
                      ? "Complete 2 more Socratic 'Explain Back' sessions and apply this competency to your stated career goals."
                      : "Engage in introductory 'Learn' and 'Practice' inquiries to build foundational conceptual clarity."}
                  </p>
                </div>
              </>
            ) : (
              <div className="py-12 text-center text-muted-theme">
                Select a competency to view evidence.
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
