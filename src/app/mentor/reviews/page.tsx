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
  Star,
  Award,
  GraduationCap,
  Sparkles,
  TrendingUp,
} from "lucide-react";

export default function MentorReviewsPage() {
  const { user, profile } = useAuth();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form input states per taskId
  const [feedbackInputs, setFeedbackInputs] = useState<Record<string, string>>({});
  const [gradeInputs, setGradeInputs] = useState<Record<string, string>>({});
  const [scoreInputs, setScoreInputs] = useState<Record<string, number>>({});
  const [ratingInputs, setRatingInputs] = useState<Record<string, number>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [successNotices, setSuccessNotices] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const list = await getTasksAwaitingReview();
        setTasks(list);

        // Prepopulate defaults
        const fMap: Record<string, string> = {};
        const gMap: Record<string, string> = {};
        const sMap: Record<string, number> = {};
        const rMap: Record<string, number> = {};
        list.forEach((t) => {
          if (t.feedback || t.remarks) fMap[t.id] = t.remarks || t.feedback || "";
          if (t.grade) gMap[t.id] = t.grade;
          if (t.score) sMap[t.id] = t.score;
          if (t.rating) rMap[t.id] = t.rating;
          else rMap[t.id] = 5;
        });
        setFeedbackInputs(fMap);
        setGradeInputs(gMap);
        setScoreInputs(sMap);
        setRatingInputs(rMap);
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

  const handleScoreChange = (taskId: string, score: number) => {
    const clamped = Math.max(0, Math.min(100, score));
    setScoreInputs((prev) => ({ ...prev, [taskId]: clamped }));
    // Auto-compute grade letter
    const letter = clamped >= 90 ? "A+" : clamped >= 80 ? "A" : clamped >= 70 ? "B+" : "B";
    setGradeInputs((prev) => ({ ...prev, [taskId]: letter }));
  };

  const handleRatingChange = (taskId: string, stars: number) => {
    setRatingInputs((prev) => ({ ...prev, [taskId]: stars }));
  };

  const handleSubmitFeedback = async (taskId: string) => {
    const feedbackText = feedbackInputs[taskId] || "Demonstrated sound inquiry and diligent preparation.";
    const task = tasks.find((t) => t.id === taskId);
    const score = scoreInputs[taskId] || 90;
    const grade = gradeInputs[taskId] || (score >= 90 ? "A+" : score >= 80 ? "A" : "B+");
    const rating = ratingInputs[taskId] || 5;

    setSubmittingId(taskId);
    try {
      await submitMentorFeedback(taskId, {
        feedback: feedbackText.trim(),
        grade,
        score,
        rating,
        studentId: task?.studentId,
        skills: task?.skills,
        mentorName: profile?.name || user?.displayName || "VRCF Mentor",
      });

      setSuccessNotices((prev) => ({ ...prev, [taskId]: true }));
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                feedback: feedbackText.trim(),
                remarks: feedbackText.trim(),
                grade,
                score,
                rating,
                status: "done",
                reviewedAt: new Date().toISOString(),
              }
            : t
        )
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
              Scholar Evaluation &amp; Grading
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary-theme">
            Activity Completion Reviews &amp; Grading
          </h1>
          <p className="text-sm text-muted-theme mt-1">
            Evaluate completed scholar exercises, award marks &amp; ratings, and provide qualitative remarks. Your marks automatically update their competency performance matrix.
          </p>
        </div>

        {/* Task Reviews List */}
        <div className="space-y-6">
          {tasks.length === 0 ? (
            <div className="card-theme p-12 text-center text-muted-theme">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-3 opacity-40 text-teal-600" />
              <p className="text-base font-semibold text-primary-theme">No pending reviews</p>
              <p className="text-xs mt-1">All scholar tasks have been reviewed and evaluated.</p>
            </div>
          ) : (
            tasks.map((task) => {
              const isSubmitted = !!(task.grade || task.remarks || successNotices[task.id]);
              const currentScore = scoreInputs[task.id] ?? task.score ?? 90;
              const currentGrade = gradeInputs[task.id] ?? task.grade ?? "A";
              const currentRating = ratingInputs[task.id] ?? task.rating ?? 5;

              return (
                <div
                  key={task.id}
                  className="card-theme p-6 md:p-8 space-y-5 transition-all hover:border-teal-500/30"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-theme">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-500/10 text-teal-700 dark:text-teal-300">
                          {task.assignedBy === "mentor" ? "Mentor-Assigned" : "Self-Directed"}
                        </span>
                        {task.studentName && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-black/5 dark:bg-white/5 border border-theme text-primary-theme">
                            Scholar: {task.studentName} ({task.studentId})
                          </span>
                        )}
                        <span className="text-xs text-muted-theme flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Due {task.dueDate}</span>
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-primary-theme pt-1">{task.title}</h3>
                      {task.description && (
                        <p className="text-sm text-muted-theme leading-relaxed">
                          {task.description}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        isSubmitted ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-blue-500/10 text-blue-700 dark:text-blue-300"
                      }`}>
                        {isSubmitted ? "Evaluated & Graded" : "Awaiting Evaluation"}
                      </span>
                    </div>
                  </div>

                  {/* Student Submission Notes if present */}
                  {task.submissionNotes && (
                    <div className="p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/20 text-xs md:text-sm text-primary-theme space-y-1">
                      <div className="flex items-center gap-1.5 font-semibold text-blue-700 dark:text-blue-300">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Scholar&apos;s Submission Notes:</span>
                      </div>
                      <p className="text-muted-theme italic pl-5">&ldquo;{task.submissionNotes}&rdquo;</p>
                    </div>
                  )}

                  {/* Tagged Competencies */}
                  <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-muted-theme" />
                      <span className="text-xs text-muted-theme font-medium">Competencies evaluated:</span>
                      {task.skills?.map((skill) => (
                        <span
                          key={skill}
                          className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-500/10 text-teal-800 dark:text-teal-200"
                        >
                          +{skill}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-teal-600 dark:text-teal-400 font-medium">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>Grades directly calibrate scholar competency levels</span>
                    </div>
                  </div>

                  {/* Feedback and Grading Area */}
                  {isSubmitted ? (
                    <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs md:text-sm text-emerald-800 dark:text-emerald-200 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2 font-bold text-sm text-emerald-900 dark:text-emerald-100">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          <span>Evaluation Recorded by Mentor</span>
                        </div>

                        {/* Marks & Grade Badges */}
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-900 dark:text-emerald-100 flex items-center gap-1.5">
                            <GraduationCap className="w-3.5 h-3.5" />
                            <span>Grade: {task.grade || currentGrade} ({task.score || currentScore}/100)</span>
                          </span>

                          <div className="flex items-center gap-1 text-amber-500">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3.5 h-3.5 ${
                                  star <= (task.rating || currentRating)
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-muted-theme/30"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="pl-7 space-y-1">
                        <p className="font-semibold text-xs text-muted-theme uppercase tracking-wider">
                          Mentor Remarks:
                        </p>
                        <p className="opacity-95 text-primary-theme whitespace-pre-wrap">
                          {task.remarks || task.feedback || feedbackInputs[task.id]}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 pt-2 border-t border-theme">
                      {/* Grading Controls Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-theme">
                        {/* Marks / Score */}
                        <div>
                          <label className="block text-xs font-semibold text-muted-theme uppercase tracking-wider mb-1">
                            Marks / Score (0 &ndash; 100)
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={currentScore}
                              onChange={(e) => handleScoreChange(task.id, parseInt(e.target.value) || 0)}
                              className="input-theme text-sm w-28 font-bold"
                            />
                            <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 px-2.5 py-1 rounded-lg bg-teal-500/10">
                              Grade: {currentGrade}
                            </span>
                          </div>
                        </div>

                        {/* Star Rating */}
                        <div>
                          <label className="block text-xs font-semibold text-muted-theme uppercase tracking-wider mb-1">
                            Inquiry Rating (1 &ndash; 5 Stars)
                          </label>
                          <div className="flex items-center gap-1 pt-1.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                type="button"
                                key={star}
                                onClick={() => handleRatingChange(task.id, star)}
                                className="p-0.5 hover:scale-125 transition-transform cursor-pointer"
                              >
                                <Star
                                  className={`w-5 h-5 ${
                                    star <= currentRating
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-muted-theme/40"
                                  }`}
                                />
                              </button>
                            ))}
                            <span className="text-xs text-muted-theme ml-1 font-semibold">
                              {currentRating}/5 Stars
                            </span>
                          </div>
                        </div>

                        {/* Competency Impact */}
                        <div>
                          <label className="block text-xs font-semibold text-muted-theme uppercase tracking-wider mb-1">
                            Competency Caliber
                          </label>
                          <div className="pt-1">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                              currentScore >= 85 || currentRating >= 4
                                ? "bg-teal-500/10 text-teal-700 dark:text-teal-300"
                                : "bg-blue-500/10 text-blue-700 dark:text-blue-300"
                            }`}>
                              {currentScore >= 85 || currentRating >= 4 ? "Strong Caliber (+Evidence)" : "Developing Caliber"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Remarks Textarea */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-muted-theme uppercase tracking-wider">
                          Mentor Remarks &amp; Socratic Critique
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Provide constructive feedback, praise analytical depth, or point out unexamined premises..."
                          value={feedbackInputs[task.id] || ""}
                          onChange={(e) => handleFeedbackChange(task.id, e.target.value)}
                          className="w-full input-theme text-sm leading-relaxed"
                        />
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => handleSubmitFeedback(task.id)}
                          disabled={submittingId === task.id}
                          className="btn-primary text-xs py-2.5 px-6 flex items-center gap-2"
                        >
                          <Award className="w-4 h-4" />
                          <span>
                            {submittingId === task.id ? "Recording Grade & Remarks..." : "Submit Grade & Remarks"}
                          </span>
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

