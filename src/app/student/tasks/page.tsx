"use client";

import React, { useState, useEffect } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import { useAuth } from "@/lib/auth-context";
import {
  getStudentTasks,
  createStudentTask,
  updateTaskStatus,
} from "@/lib/student-data";
import { TaskItem, VRCF_COMPETENCIES } from "@/types";
import rawStudents from "@/data/vrcf_students.json";
import {
  CheckSquare,
  Plus,
  Bot,
  Calendar,
  User,
  Clock,
  Filter,
  CheckCircle2,
  AlertCircle,
  Tag,
  Star,
  GraduationCap,
  Award,
  MessageSquare,
  Send,
  UserCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function StudentTasksPage() {
  const { user, profile } = useAuth();
  const studentId = user?.uid || "student-default";
  const studentEmail = user?.email || undefined;
  const router = useRouter();

  // Active scholar identity resolution
  const defaultScholarId = () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("mentora_active_scholar_id");
      if (stored) return stored.replace("vrcf-", "");
    }
    // Check if email matches a VRCF student
    if (studentEmail) {
      const match = rawStudents.find(
        (s) => s.email && s.email.toLowerCase() === studentEmail.toLowerCase()
      );
      if (match) return match.vrcfId;
    }
    return "032"; // Default VRCF scholar
  };

  const [activeScholarId, setActiveScholarId] = useState<string>("032");
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "open" | "mentor" | "done">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submittingTaskModal, setSubmittingTaskModal] = useState<TaskItem | null>(null);
  const [submissionNotes, setSubmissionNotes] = useState("");

  // New task form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("2026-10-30");
  const [selectedSkills, setSelectedSkills] = useState<string[]>(["Critical Thinking"]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setActiveScholarId(defaultScholarId());
  }, [studentEmail]);

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const data = await getStudentTasks(studentId, studentEmail, `vrcf-${activeScholarId}`);
        setTasks(data);
      } catch (e) {
        console.error("Error loading tasks:", e);
      } finally {
        setLoading(false);
      }
    }
    load();

    const handleTaskUpdated = () => {
      load();
    };
    window.addEventListener("mentora_task_updated", handleTaskUpdated);
    return () => {
      window.removeEventListener("mentora_task_updated", handleTaskUpdated);
    };
  }, [user, studentId, studentEmail, activeScholarId]);

  const handleScholarSwitch = (newVrcfId: string) => {
    setActiveScholarId(newVrcfId);
    if (typeof window !== "undefined") {
      localStorage.setItem("mentora_active_scholar_id", `vrcf-${newVrcfId}`);
      window.dispatchEvent(new CustomEvent("mentora_task_updated"));
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: "open" | "in_progress" | "done") => {
    if (newStatus === "done") {
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        setSubmittingTaskModal(task);
        return;
      }
    }

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    await updateTaskStatus(taskId, newStatus);
  };

  const handleConfirmSubmitWork = async () => {
    if (!submittingTaskModal) return;
    const taskId = submittingTaskModal.id;
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: "done", submissionNotes } : t))
    );
    await updateTaskStatus(taskId, "done", submissionNotes);
    setSubmittingTaskModal(null);
    setSubmissionNotes("");
  };

  const handleCreateSelfTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      const created = await createStudentTask({
        studentId,
        title: title.trim(),
        description: description.trim(),
        assignedBy: "self",
        mentorId: null,
        dueDate,
        status: "open",
        skills: selectedSkills,
      });

      setTasks([created, ...tasks]);
      setIsModalOpen(false);
      setTitle("");
      setDescription("");
      setSelectedSkills(["Critical Thinking"]);
    } catch (e) {
      console.error("Error creating task:", e);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === "open") return t.status !== "done";
    if (filter === "mentor") return t.assignedBy === "mentor";
    if (filter === "done") return t.status === "done";
    return true;
  });

  return (
    <DashboardShell allowedRole="student">
      <div className="space-y-8">
        {/* Header */}
        <div className="pb-2 border-b border-theme flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CheckSquare className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Action Items &amp; Case Studies
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary-theme">
              Tasks &amp; Assignments
            </h1>
            <p className="text-sm text-muted-theme mt-1">
              Complete mentor-assigned projects and self-directed inquiries to build your portfolio.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Self Task</span>
          </button>
        </div>

        {/* Scholar Account Switcher Banner */}
        <div className="card-theme p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-teal-500/[0.04] border border-teal-500/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                  Active Scholar Portfolio
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 font-mono">
                  VRCF-{activeScholarId}
                </span>
              </div>
              <p className="text-xs text-muted-theme">
                Tasks assigned by mentors to this scholar will reflect immediately below.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-muted-theme shrink-0">
              Scholar Profile:
            </label>
            <select
              value={activeScholarId}
              onChange={(e) => handleScholarSwitch(e.target.value)}
              className="input-theme text-xs py-1.5 px-3 max-w-xs"
            >
              {rawStudents.map((st) => (
                <option key={st.vrcfId} value={st.vrcfId}>
                  [{st.vrcfId}] {st.name} &mdash; {st.course}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted-theme mr-1">Filter:</span>
          {(
            [
              { id: "all", label: "All Tasks" },
              { id: "open", label: "Active" },
              { id: "mentor", label: "Mentor Assigned" },
              { id: "done", label: "Completed" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                filter === item.id
                  ? "bg-teal-600 dark:bg-teal-400 text-white dark:text-[#0B1413] shadow-sm font-semibold"
                  : "bg-surface border border-theme text-muted-theme hover:text-primary-theme"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <div className="card-theme p-12 text-center text-muted-theme space-y-3">
              <CheckCircle2 className="w-12 h-12 mx-auto text-teal-600/40" />
              <div>
                <p className="text-base font-bold text-primary-theme">No tasks have been assigned yet</p>
                <p className="text-xs text-muted-theme mt-1 max-w-md mx-auto">
                  Your mentor has not assigned any tasks to this scholar profile yet. Tasks assigned in the mentor dashboard will reflect here in real-time.
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="btn-secondary text-xs py-2 px-4 inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Self-Directed Task</span>
                </button>
              </div>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className="card-theme p-6 transition-all hover:border-teal-500/40 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                          task.assignedBy === "mentor"
                            ? "bg-teal-500/10 text-teal-700 dark:text-teal-300"
                            : "bg-black/5 dark:bg-white/5 text-muted-theme"
                        }`}
                      >
                        {task.assignedBy === "mentor" ? "Mentor Assigned" : "Self Added"}
                      </span>

                      {task.mentorName && (
                        <span className="text-xs text-muted-theme flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{task.mentorName}</span>
                        </span>
                      )}

                      <span className="text-xs text-muted-theme flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Due {task.dueDate}</span>
                      </span>
                    </div>

                    <h3 className="text-base md:text-lg font-bold text-primary-theme">
                      {task.title}
                    </h3>

                    {task.description && (
                      <p className="text-sm text-muted-theme leading-relaxed">
                        {task.description}
                      </p>
                    )}
                  </div>

                  {/* Status Dropdown */}
                  <div className="shrink-0 flex items-center gap-3">
                    <select
                      value={task.status}
                      onChange={(e) =>
                        handleStatusChange(task.id, e.target.value as "open" | "in_progress" | "done")
                      }
                      className="input-theme text-xs py-1.5 px-3"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Completed</option>
                    </select>
                  </div>
                </div>

                {/* Mentor Review & Grading Evaluation Block */}
                {(task.grade || task.remarks || task.feedback) && (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs md:text-sm text-emerald-900 dark:text-emerald-100 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 font-bold">
                        <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Mentor Evaluation Recorded</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {task.grade && (
                          <span className="px-2.5 py-0.5 rounded-full font-bold text-xs bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 flex items-center gap-1">
                            <GraduationCap className="w-3.5 h-3.5" />
                            <span>Grade: {task.grade} {task.score ? `(${task.score}/100)` : ""}</span>
                          </span>
                        )}
                        {task.rating && (
                          <div className="flex items-center gap-0.5 text-amber-500">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3.5 h-3.5 ${
                                  star <= (task.rating || 5)
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-muted-theme/30"
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    {(task.remarks || task.feedback) && (
                      <p className="text-muted-theme pl-6">
                        <strong className="text-primary-theme">Mentor Remarks:</strong> &ldquo;{task.remarks || task.feedback}&rdquo;
                      </p>
                    )}
                  </div>
                )}

                {/* Scholar Submission Notes if present */}
                {task.submissionNotes && (
                  <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/15 text-xs text-muted-theme space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold text-blue-700 dark:text-blue-300">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Your Submission Notes:</span>
                    </div>
                    <p className="italic pl-5">&ldquo;{task.submissionNotes}&rdquo;</p>
                  </div>
                )}

                {/* Footer of Task card: skills pills & "Start with AI Tutor" */}
                <div className="pt-3 border-t border-theme flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-muted-theme mr-1" />
                    {task.skills?.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-black/5 dark:bg-white/5 border border-theme text-muted-theme"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {task.status !== "done" && (
                      <button
                        onClick={() => {
                          setSubmittingTaskModal(task);
                          setSubmissionNotes("");
                        }}
                        className="btn-tertiary text-xs py-2 px-3 flex items-center gap-1 text-teal-600 dark:text-teal-400 font-semibold"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Submit Work</span>
                      </button>
                    )}

                    {/* AI Tutor Pre-load Button for Mentor Tasks */}
                    {task.assignedBy === "mentor" && (
                      <Link
                        href={`/student/tutor?taskId=${encodeURIComponent(task.id)}&topic=${encodeURIComponent(task.title)}`}
                        className="btn-secondary text-xs py-2 px-4 flex items-center gap-2"
                      >
                        <Bot className="w-3.5 h-3.5" />
                        <span>Start with AI Tutor</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal: Submit Task Work */}
        {submittingTaskModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="card-theme max-w-lg w-full p-6 md:p-8 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-theme">
                <div>
                  <h3 className="text-lg font-bold text-primary-theme">Complete Task</h3>
                  <p className="text-xs text-muted-theme">{submittingTaskModal.title}</p>
                </div>
                <button
                  onClick={() => setSubmittingTaskModal(null)}
                  className="btn-tertiary text-xs p-1"
                >
                  &times;
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-theme uppercase tracking-wider mb-1.5">
                    Submission Notes &amp; Key Findings
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Summarize your findings, key arguments, or what you concluded from this exercise for your mentor..."
                    value={submissionNotes}
                    onChange={(e) => setSubmissionNotes(e.target.value)}
                    className="w-full input-theme text-sm leading-relaxed"
                  />
                  <p className="text-[11px] text-muted-theme mt-1">
                    Your mentor will review this submission, assign your grade and marks, and evaluate your targeted competencies.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-theme">
                  <button
                    onClick={() => setSubmittingTaskModal(null)}
                    className="btn-tertiary text-xs px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmSubmitWork}
                    className="btn-primary text-xs px-5 py-2 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit for Mentor Review</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Add Self Task */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="card-theme max-w-lg w-full p-6 md:p-8 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-theme">
                <h3 className="text-lg font-bold text-primary-theme">Add Self-Directed Task</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="btn-tertiary text-xs p-1"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleCreateSelfTask} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-theme uppercase tracking-wider mb-1">
                    Task Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Conduct comparative inquiry on Bayes theorem"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full input-theme text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-theme uppercase tracking-wider mb-1">
                    Description / Scope
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide details on what you will investigate..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full input-theme text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-theme uppercase tracking-wider mb-1">
                    Target Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full input-theme text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-theme uppercase tracking-wider mb-1.5">
                    Tag Competencies
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 border border-theme rounded-xl">
                    {VRCF_COMPETENCIES.map((comp) => {
                      const selected = selectedSkills.includes(comp);
                      return (
                        <button
                          type="button"
                          key={comp}
                          onClick={() => toggleSkill(comp)}
                          className={`px-2.5 py-1 rounded-full text-xs transition-colors ${
                            selected
                              ? "bg-teal-600 dark:bg-teal-400 text-white dark:text-[#0B1413] font-semibold"
                              : "bg-surface border border-theme text-muted-theme hover:text-primary-theme"
                          }`}
                        >
                          {comp}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-3 border-t border-theme flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="btn-tertiary text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary text-xs py-2.5 px-5"
                  >
                    {submitting ? "Saving..." : "Create Task"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
