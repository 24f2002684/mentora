"use client";

import React, { useEffect, useState } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import { useAuth } from "@/lib/auth-context";
import {
  getStudentTasks,
  getStudentCompetencies,
  getStudentActivityStats,
} from "@/lib/student-data";
import { TaskItem, CompetencyScore } from "@/types";
import Link from "next/link";
import {
  Flame,
  Clock,
  CheckCircle2,
  Bot,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Compass,
  BookOpen,
} from "lucide-react";

export default function StudentHomePage() {
  const { user, profile } = useAuth();
  const studentId = user?.uid || "student-default";

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [competencies, setCompetencies] = useState<CompetencyScore[]>([]);
  const [stats, setStats] = useState({
    hoursThisMonth: "7.0",
    hoursThisWeek: "3.5",
    streakDays: 4,
    sessionCount: 6,
    tasksCompleted: 2,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [loadedTasks, loadedComps, loadedStats] = await Promise.all([
          getStudentTasks(studentId),
          getStudentCompetencies(studentId),
          getStudentActivityStats(studentId),
        ]);
        setTasks(loadedTasks);
        setCompetencies(loadedComps);
        setStats(loadedStats);
      } catch (e) {
        console.error("Error loading student home data:", e);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadData();
    }
  }, [user, studentId]);

  const openTasks = tasks.filter((t) => t.status !== "done");
  const topCompetencies = competencies.slice(0, 3);

  return (
    <DashboardShell allowedRole="student">
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-theme">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                VRCF Scholar Development
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary-theme">
              Welcome back, {profile?.name || user?.displayName || "Scholar"}
            </h1>
            <p className="text-sm text-muted-theme mt-1">
              Your growth journey in critical thinking, leadership, and analytical rigor.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/student/tutor" className="btn-primary">
              <Bot className="w-4 h-4" />
              <span>Launch AI Tutor</span>
            </Link>
          </div>
        </div>

        {/* 3-Card Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Streak & Time */}
          <div className="card-theme p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-muted-theme uppercase tracking-wider">
                Weekly Engagement
              </span>
              <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary-theme flex items-baseline gap-2">
                <span>{stats.streakDays} Day Streak</span>
              </div>
              <p className="text-xs text-muted-theme mt-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span><strong>{stats.hoursThisWeek} hrs</strong> active learning this week</span>
              </p>
            </div>
          </div>

          {/* Tasks Open */}
          <div className="card-theme p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-muted-theme uppercase tracking-wider">
                Action Items
              </span>
              <div className="w-8 h-8 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary-theme">
                {openTasks.length} Tasks Open
              </div>
              <p className="text-xs text-muted-theme mt-1.5 flex items-center justify-between">
                <span>{tasks.filter((t) => t.assignedBy === "mentor" && t.status !== "done").length} Mentor-assigned</span>
                <Link href="/student/tasks" className="text-teal-600 dark:text-teal-400 font-medium hover:underline">
                  View Tasks &rarr;
                </Link>
              </p>
            </div>
          </div>

          {/* Tutor Sessions */}
          <div className="card-theme p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-muted-theme uppercase tracking-wider">
                Socratic Inquiries
              </span>
              <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary-theme">
                {stats.sessionCount} Sessions
              </div>
              <p className="text-xs text-muted-theme mt-1.5">
                Active Socratic discussions logged this semester
              </p>
            </div>
          </div>
        </div>

        {/* Development Snapshot Card */}
        <div className="card-theme p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-primary-theme">
                Development Snapshot
              </h2>
              <p className="text-xs text-muted-theme mt-0.5">
                Key leadership &amp; cognitive competencies tracked by VRCF mentors
              </p>
            </div>
            <Link
              href="/student/progress"
              className="btn-tertiary text-xs flex items-center gap-1 text-teal-600 dark:text-teal-400"
            >
              <span>Full Assessment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topCompetencies.map((comp) => (
              <div
                key={comp.competency}
                className="p-4 rounded-xl border border-theme bg-black/[0.01] dark:bg-white/[0.01] flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="font-semibold text-sm text-primary-theme">
                    {comp.competency}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      comp.trend === "up"
                        ? "bg-teal-500/10 text-teal-700 dark:text-teal-300"
                        : "bg-black/5 dark:bg-white/5 text-muted-theme"
                    }`}
                  >
                    <TrendingUp className="w-3 h-3" />
                    <span>{comp.trend === "up" ? "+Upward" : "Steady"}</span>
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-theme">Current Level:</span>
                  <span className="font-semibold text-teal-700 dark:text-teal-300">
                    {comp.level}
                  </span>
                </div>

                <div className="mt-3 w-full bg-border-subtle rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-teal-600 dark:bg-teal-400 h-1.5 rounded-full transition-all"
                    style={{
                      width:
                        comp.level === "Strong"
                          ? "90%"
                          : comp.level === "Developing"
                          ? "60%"
                          : "30%",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Continue Learning Full-Width Card */}
        <div className="card-theme p-6 md:p-8 border-l-4 border-l-teal-600 dark:border-l-teal-400">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-500/10 text-teal-700 dark:text-teal-300">
                  Recent Module &middot; Socratic Challenge
                </span>
                <span className="text-xs text-muted-theme">Session 4 of 6</span>
              </div>
              <h3 className="text-xl font-bold text-primary-theme">
                Evaluating Ethical Frameworks in Public Impact AI
              </h3>
              <p className="text-sm text-muted-theme leading-relaxed">
                Probe your assumptions about fairness metrics and societal trade-offs. The tutor is waiting with probing follow-ups on your last reflection.
              </p>

              <div className="pt-2">
                <div className="flex items-center justify-between text-xs text-muted-theme mb-1.5">
                  <span>Progress on current topic</span>
                  <span className="font-semibold text-primary-theme">65% Completed</span>
                </div>
                <div className="w-full bg-border-subtle rounded-full h-2 overflow-hidden">
                  <div className="bg-teal-600 dark:bg-teal-400 h-2 rounded-full w-[65%]" />
                </div>
              </div>
            </div>

            <div className="flex shrink-0">
              <Link
                href="/student/tutor"
                className="btn-primary py-3 px-6 text-sm flex items-center gap-2 shadow-sm hover:shadow"
              >
                <Bot className="w-4 h-4" />
                <span>Continue with AI Tutor</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/student/journey"
            className="card-theme p-5 hover:border-teal-500/50 transition-all flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-primary-theme">My Journey</h4>
              <p className="text-xs text-muted-theme">Vision board &amp; goals</p>
            </div>
          </Link>

          <Link
            href="/student/tasks"
            className="card-theme p-5 hover:border-teal-500/50 transition-all flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-primary-theme">Mentor Tasks</h4>
              <p className="text-xs text-muted-theme">Tasks &amp; AI tutor hooks</p>
            </div>
          </Link>

          <Link
            href="/student/resources"
            className="card-theme p-5 hover:border-teal-500/50 transition-all flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-primary-theme">Curated Resources</h4>
              <p className="text-xs text-muted-theme">VRCF reading &amp; frameworks</p>
            </div>
          </Link>
        </div>
      </div>
    </DashboardShell>
  );
}
