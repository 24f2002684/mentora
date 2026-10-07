"use client";

import React, { useState, useEffect } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import { useAuth } from "@/lib/auth-context";
import { getTasksAwaitingReview, submitMentorFeedback } from "@/lib/mentor-data";
import { TaskItem } from "@/types";
import {
  FileCheck2,
  CheckCircle2,
  MessageSquare,
  Calendar,
  Tag,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export default function MentorReviewsPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackInputs, setFeedbackInputs] = useState<Record<string, string>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [successNotices, setSuccessNotices] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const list = await getTasksAwaitingReview();
        setTasks(list);
      } catch (e) {
        console.error("Reviews load error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const handleFeedbackChange = (taskId: string, val: string) => {
    setFeedbackInputs((prev) => ({ ...prev, [taskId]: val }));
  };

  const handleSubmitFeedback = async (taskId: string) => {
    const feedbackText = feedbackInputs[taskId];
    if (!feedbackText?.trim()) return;

    setSubmittingId(taskId);
    try {
      await submitMentorFeedback(taskId, feedbackText.trim());
      setSuccessNotices((prev) => ({ ...prev, [taskId]: true }));
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, feedback: feedbackText.trim(), status: "done" } : t))
      );
    } catch (e) {
      console.error("Feedback submit error:", e);
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <DashboardShell allowedRole="mentor">
      <div className="space-y-8">
        {/* Header */}
        <div className="pb-2 border-b border-theme">
          <div className="flex items-center gap-2 mb-1">
            <FileCheck2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Scholar Evaluation
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary-theme">
            Pending Task Reviews
          </h1>
          <p className="text-sm text-muted-theme mt-1">
            Review completed scholar exercises and provide constructive qualitative feedback to reinforce their development.
          </p>
        </div>

        {/* Task Reviews List */}
        <div className="space-y-6">
          {tasks.length === 0 ? (
            <div className="card-theme p-12 text-center text-muted-theme">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-3 opacity-40 text-teal-600" />
              <p className="text-base font-semibold text-primary-theme">No pending reviews</p>
              <p className="text-xs mt-1">All scholar tasks have been reviewed.</p>
            </div>
          ) : (
            tasks.map((task) => {
              const isSubmitted = !!task.feedback || !!successNotices[task.id];
              return (
                <div
                  key={task.id}
                  className="card-theme p-6 md:p-8 space-y-5 transition-all hover:border-teal-500/30"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-theme">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-500/10 text-teal-700 dark:text-teal-300">
                          {task.assignedBy === "mentor" ? "Mentor Task" : "Self-Directed Task"}
                        </span>
                        <span className="text-xs text-muted-theme flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Due {task.dueDate}</span>
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-primary-theme">{task.title}</h3>
                      {task.description && (
                        <p className="text-sm text-muted-theme leading-relaxed">
                          {task.description}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-300">
                        Status: {task.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>

                  {/* Tagged Competencies */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-muted-theme" />
                    {task.skills?.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-black/5 dark:bg-white/5 border border-theme text-muted-theme"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Feedback Area */}
                  {isSubmitted ? (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs md:text-sm text-emerald-800 dark:text-emerald-200 space-y-1">
                      <div className="flex items-center gap-2 font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Mentor Feedback Recorded</span>
                      </div>
                      <p className="opacity-95 pl-6">{task.feedback || feedbackInputs[task.id]}</p>
                    </div>
                  ) : (
                    <div className="space-y-3 pt-2">
                      <label className="block text-xs font-semibold text-muted-theme uppercase tracking-wider">
                        Mentor Qualitative Feedback &amp; Next Inquiries
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Provide Socratic feedback, point out unexamined premises, or commend analytical depth..."
                        value={feedbackInputs[task.id] || ""}
                        onChange={(e) => handleFeedbackChange(task.id, e.target.value)}
                        className="w-full input-theme text-sm"
                      />
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleSubmitFeedback(task.id)}
                          disabled={submittingId === task.id || !feedbackInputs[task.id]?.trim()}
                          className="btn-primary text-xs py-2 px-5"
                        >
                          {submittingId === task.id ? "Submitting..." : "Submit Review"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
