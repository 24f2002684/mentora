"use client";

import React, { useState, useEffect, Suspense } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import { useAuth } from "@/lib/auth-context";
import { getMentorStudents, assignMentorTask, StudentSummary } from "@/lib/mentor-data";
import { VRCF_COMPETENCIES } from "@/types";
import { useSearchParams, useRouter } from "next/navigation";
import { PlusCircle, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

function AssignTaskForm() {
  const { user, profile } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const mentorEmail = user?.email || "suhailaktharsm25@gmail.com";

  const preselectedStudentId = searchParams.get("studentId") || "";

  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState(preselectedStudentId);
  const [studentSearch, setStudentSearch] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("2026-10-25");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    "Critical Thinking",
    "Analytical Thinking",
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!user) return;
      const list = await getMentorStudents(mentorEmail);
      setStudents(list);
      if (!selectedStudentId && list.length > 0) {
        setSelectedStudentId(list[0].id);
      }
    }
    load();
  }, [user, mentorEmail, selectedStudentId]);

  const filteredStudents = students.filter((s) => {
    if (!studentSearch.trim()) return true;
    const q = studentSearch.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.vrcfId.toLowerCase().includes(q) ||
      s.course.toLowerCase().includes(q) ||
      s.college.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q)
    );
  });

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      if (selectedSkills.length > 1) {
        setSelectedSkills(selectedSkills.filter((s) => s !== skill));
      }
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !selectedStudentId) return;

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    const chosenStudent = students.find((s) => s.id === selectedStudentId);

    try {
      await assignMentorTask({
        studentId: selectedStudentId,
        studentName: chosenStudent?.name || "VRCF Scholar",
        studentEmail: chosenStudent?.email,
        mentorId: user?.uid || "mentor-default",
        mentorName: profile?.name || "VRCF Mentor",
        title: title.trim(),
        description: description.trim(),
        dueDate,
        skills: selectedSkills,
      });

      setSuccess(true);
      setTitle("");
      setDescription("");
      setTimeout(() => {
        router.push("/mentor");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to assign task");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="pb-2 border-b border-theme">
        <div className="flex items-center gap-2 mb-1">
          <PlusCircle className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
            Task Assignment
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary-theme">
          Assign Mentor Task
        </h1>
        <p className="text-sm text-muted-theme mt-1">
          Select any scholar from the VRCF Foundation roster ({students.length} scholars available) and assign targeted inquiry prompts.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-emerald-800 dark:text-emerald-200 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Task successfully assigned! Redirecting to mentor dashboard...</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Card */}
      <div className="card-theme p-6 md:p-8">
        <form onSubmit={handleAssign} className="space-y-6">
          {/* Select Scholar / Filter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-muted-theme uppercase tracking-wider">
                Select Scholar ({students.length} Total Scholars)
              </label>
              <span className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">
                {filteredStudents.length} matching search
              </span>
            </div>

            <input
              type="text"
              placeholder="Search scholar by Name, VRCF ID, Degree, or College..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              className="w-full input-theme text-xs py-2 mb-2"
            />

            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full input-theme text-sm"
              required
            >
              {filteredStudents.map((st) => (
                <option key={st.id} value={st.id}>
                  [{st.vrcfId}] {st.name} &mdash; {st.course} ({st.college})
                </option>
              ))}
            </select>
          </div>

          {/* Task Title */}
          <div>
            <label className="block text-xs font-semibold text-muted-theme uppercase tracking-wider mb-2">
              Task Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Socratic Case-Study on Fairness in Lending Algorithms"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full input-theme text-sm"
            />
          </div>

          {/* Task Description */}
          <div>
            <label className="block text-xs font-semibold text-muted-theme uppercase tracking-wider mb-2">
              Detailed Prompt &amp; Deliverables
            </label>
            <textarea
              required
              rows={4}
              placeholder="Describe the problem formulation, questions the student must test, and criteria for reflection..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full input-theme text-sm leading-relaxed"
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-xs font-semibold text-muted-theme uppercase tracking-wider mb-2">
              Due Date
            </label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full input-theme text-sm"
            />
          </div>

          {/* Tagged Competencies */}
          <div>
            <label className="block text-xs font-semibold text-muted-theme uppercase tracking-wider mb-2">
              Targeted Competencies (Multi-Select)
            </label>
            <div className="flex flex-wrap gap-2 p-3 border border-theme rounded-xl bg-black/[0.01] dark:bg-white/[0.01]">
              {VRCF_COMPETENCIES.map((comp) => {
                const selected = selectedSkills.includes(comp);
                return (
                  <button
                    type="button"
                    key={comp}
                    onClick={() => toggleSkill(comp)}
                    className={`px-3 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
                      selected
                        ? "bg-teal-600 dark:bg-teal-400 text-white dark:text-[#0B1413] font-semibold shadow-sm"
                        : "bg-surface border border-theme text-muted-theme hover:text-primary-theme"
                    }`}
                  >
                    {comp}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="pt-4 border-t border-theme flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary py-3 px-8 text-sm"
            >
              {submitting ? "Assigning Task..." : "Assign Task to Scholar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MentorAssignPage() {
  return (
    <DashboardShell allowedRole="mentor">
      <Suspense
        fallback={
          <div className="p-12 text-center text-muted-theme">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-teal-600" />
          </div>
        }
      >
        <AssignTaskForm />
      </Suspense>
    </DashboardShell>
  );
}
