"use client";

import React, { useState, useEffect } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import { useAuth } from "@/lib/auth-context";
import { getMentorStudents, getMentorStats, StudentSummary } from "@/lib/mentor-data";
import {
  Users,
  FileCheck2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Clock,
  PlusCircle,
  Eye,
} from "lucide-react";
import Link from "next/link";

export default function MentorHomePage() {
  const { user, profile } = useAuth();
  const mentorEmail = user?.email || "suhailaktharsm25@gmail.com";

  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [stats, setStats] = useState({
    totalStudents: 1,
    pendingReviews: 2,
    attentionRequiredCount: 1,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const [stList, stStats] = await Promise.all([
          getMentorStudents(mentorEmail),
          getMentorStats(mentorEmail),
        ]);
        setStudents(stList);
        setStats(stStats);
      } catch (e) {
        console.error("Mentor home loading error:", e);
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
              <span className="text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Mentor Overview
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary-theme">
              Welcome, {profile?.name || "VRCF Mentor"}
            </h1>
            <p className="text-sm text-muted-theme mt-1">
              Monitor scholar trajectories, review submissions, and guide Socratic leadership inquiry.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/mentor/assign" className="btn-primary">
              <PlusCircle className="w-4 h-4" />
              <span>Assign New Task</span>
            </Link>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* My Students */}
          <div className="card-theme p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-muted-theme uppercase tracking-wider">
                Assigned Scholars
              </span>
              <div className="w-8 h-8 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary-theme">
                {stats.totalStudents} Active Scholars
              </div>
              <p className="text-xs text-muted-theme mt-1.5 flex items-center justify-between">
                <span>Direct mentorship caseload</span>
                <Link href="/mentor/students" className="text-teal-600 dark:text-teal-400 font-medium hover:underline">
                  Roster &rarr;
                </Link>
              </p>
            </div>
          </div>

          {/* Pending Reviews */}
          <div className="card-theme p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-muted-theme uppercase tracking-wider">
                Pending Reviews
              </span>
              <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <FileCheck2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary-theme">
                {stats.pendingReviews} Submissions
              </div>
              <p className="text-xs text-muted-theme mt-1.5 flex items-center justify-between">
                <span>Awaiting mentor feedback</span>
                <Link href="/mentor/reviews" className="text-teal-600 dark:text-teal-400 font-medium hover:underline">
                  Evaluate &rarr;
                </Link>
              </p>
            </div>
          </div>

          {/* Attention Required Count */}
          <div className="card-theme p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-muted-theme uppercase tracking-wider">
                Attention Required
              </span>
              <div className="w-8 h-8 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary-theme">
                {stats.attentionRequiredCount} Flagged Items
              </div>
              <p className="text-xs text-muted-theme mt-1.5">
                Computed from activity logs and task schedules
              </p>
            </div>
          </div>
        </div>

        {/* Attention Required Table */}
        <div className="card-theme overflow-hidden">
          <div className="p-6 border-b border-theme flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-primary-theme">Attention Required Signals</h2>
              <p className="text-xs text-muted-theme mt-0.5">
                Signals computed from student activity logs, task due dates, and Socratic engagement patterns
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-black/[0.02] dark:bg-white/[0.02] border-b border-theme text-xs text-muted-theme font-medium uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Scholar</th>
                  <th className="py-3.5 px-6">Course</th>
                  <th className="py-3.5 px-6">Signal Detected</th>
                  <th className="py-3.5 px-6">Open Tasks</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01]">
                    <td className="py-4 px-6 font-semibold">
                      <div className="text-primary-theme">{student.name}</div>
                      <div className="text-xs text-muted-theme font-mono">{student.email}</div>
                    </td>
                    <td className="py-4 px-6 text-xs text-muted-theme">{student.course}</td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>{student.signal.text}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs font-medium text-primary-theme">
                      {student.openTasksCount} active
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href="/mentor/reviews"
                        className="btn-secondary text-xs py-1.5 px-3.5 inline-flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
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
