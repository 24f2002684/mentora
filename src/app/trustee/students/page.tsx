"use client";

import React, { useState, useEffect } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import { useAuth } from "@/lib/auth-context";
import { getTrusteeStudentRoster, TrusteeStudentView } from "@/lib/trustee-data";
import {
  Users,
  TrendingUp,
  Eye,
  Search,
  Mail,
  Phone,
  GraduationCap,
  Building,
  Target,
  CheckCircle2,
  Clock,
  Award,
  BookOpen,
  Calendar,
  MessageSquareQuote,
  X,
  ChevronRight,
} from "lucide-react";

export default function TrusteeStudentsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<TrusteeStudentView[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<TrusteeStudentView | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<"vision" | "competencies" | "tasks">("vision");

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

  const filteredStudents = students.filter((st) => {
    const q = searchTerm.toLowerCase();
    return (
      st.name.toLowerCase().includes(q) ||
      st.vrcfId.toLowerCase().includes(q) ||
      st.course.toLowerCase().includes(q) ||
      st.college.toLowerCase().includes(q) ||
      st.email.toLowerCase().includes(q)
    );
  });

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
              Scholar Roster ({students.length})
            </h1>
            <p className="text-sm text-muted-theme mt-1">
              Click on any scholar to inspect their complete profile, vision goals, task progress, and mentor evaluations.
            </p>
          </div>

          {/* Search bar */}
          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-muted-theme absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, ID, or college..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full input-theme pl-9 py-2 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Read-Only Table */}
        <div className="card-theme overflow-hidden">
          <div className="p-5 border-b border-theme flex items-center justify-between">
            <h2 className="font-bold text-base text-primary-theme">
              VRCF Foundation Scholars ({filteredStudents.length})
            </h2>
            <span className="text-xs text-muted-theme">
              Click any row for in-depth portfolio review
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-black/[0.02] dark:bg-white/[0.02] border-b border-theme text-xs text-muted-theme font-medium uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">VRCF ID</th>
                  <th className="py-3.5 px-6">Scholar Name</th>
                  <th className="py-3.5 px-6">Degree &amp; College</th>
                  <th className="py-3.5 px-6">Stated Career Goal</th>
                  <th className="py-3.5 px-6">Competency Signal</th>
                  <th className="py-3.5 px-6 text-right">Inquiry Hours</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme">
                {filteredStudents.map((st) => (
                  <tr
                    key={st.id}
                    onClick={() => {
                      setSelectedStudent(st);
                      setActiveModalTab("vision");
                    }}
                    className="hover:bg-teal-500/[0.03] dark:hover:bg-teal-500/[0.05] cursor-pointer transition-colors"
                  >
                    <td className="py-4 px-6 font-mono font-bold text-xs text-teal-700 dark:text-teal-300">
                      {st.vrcfId}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-primary-theme">{st.name}</div>
                      <div className="text-xs text-muted-theme font-mono">{st.email}</div>
                    </td>
                    {/* Fixed: Course at top, College name cleanly below without repetition */}
                    <td className="py-4 px-6 text-xs">
                      <div className="font-semibold text-primary-theme">{st.course}</div>
                      <div className="text-muted-theme mt-0.5">{st.college}</div>
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
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStudent(st);
                          setActiveModalTab("vision");
                        }}
                        className="btn-secondary text-[11px] py-1 px-3 inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* DETAILED STUDENT PROFILE MODAL FOR TRUSTEES */}
        {selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <div className="card-theme max-w-3xl w-full my-8 p-6 md:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              {/* Close Button */}
              <button
                onClick={() => setSelectedStudent(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full border border-theme flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-muted-theme cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Scholar Header Profile */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-theme">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-teal-600/10 text-teal-700 dark:text-teal-300 border border-teal-500/30 flex items-center justify-center font-bold text-2xl shrink-0">
                    {selectedStudent.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-500/10 text-teal-700 dark:text-teal-300">
                        VRCF ID: {selectedStudent.vrcfId}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold">
                        Financial Aid Active
                      </span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-primary-theme">
                      {selectedStudent.name}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-theme mt-1">
                      <span className="flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                        <strong>{selectedStudent.course}</strong>
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                        {selectedStudent.college}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-1 text-xs text-muted-theme border-t sm:border-t-0 pt-2 sm:pt-0">
                  <div className="flex items-center gap-1.5 font-mono">
                    <Mail className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>{selectedStudent.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono">
                    <Phone className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>{selectedStudent.phone}</span>
                  </div>
                </div>
              </div>

              {/* Modal Tabs */}
              <div className="flex items-center gap-2 border-b border-theme pb-2">
                <button
                  onClick={() => setActiveModalTab("vision")}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    activeModalTab === "vision"
                      ? "bg-teal-600 dark:bg-teal-400 text-white dark:text-[#0B1413] shadow-sm"
                      : "text-muted-theme hover:text-primary-theme hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  Vision, Aim &amp; Goals
                </button>
                <button
                  onClick={() => setActiveModalTab("competencies")}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    activeModalTab === "competencies"
                      ? "bg-teal-600 dark:bg-teal-400 text-white dark:text-[#0B1413] shadow-sm"
                      : "text-muted-theme hover:text-primary-theme hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  Competency Matrix ({selectedStudent.competencies.length})
                </button>
                <button
                  onClick={() => setActiveModalTab("tasks")}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    activeModalTab === "tasks"
                      ? "bg-teal-600 dark:bg-teal-400 text-white dark:text-[#0B1413] shadow-sm"
                      : "text-muted-theme hover:text-primary-theme hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  Tasks &amp; Mentor Feedback ({selectedStudent.tasks.length})
                </button>
              </div>

              {/* TAB 1: VISION, AIM & GOALS */}
              {activeModalTab === "vision" && (
                <div className="space-y-6">
                  {/* Focus Area & Career Aim */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-theme bg-black/[0.01] dark:bg-white/[0.01] space-y-1">
                      <span className="text-[11px] font-semibold text-muted-theme uppercase tracking-wider flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                        <span>Academic Focus Area</span>
                      </span>
                      <p className="text-sm font-semibold text-primary-theme">
                        {selectedStudent.focusArea}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border border-theme bg-black/[0.01] dark:bg-white/[0.01] space-y-1">
                      <span className="text-[11px] font-semibold text-muted-theme uppercase tracking-wider flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                        <span>Stated Career Aim / Vision</span>
                      </span>
                      <p className="text-sm font-semibold text-teal-800 dark:text-teal-200">
                        {selectedStudent.careerGoal}
                      </p>
                    </div>
                  </div>

                  {/* Short-Term Goals */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-muted-theme uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                      <span>Short-Term Milestones (This Year)</span>
                    </h4>
                    <div className="space-y-2">
                      {selectedStudent.shortTermGoals.map((goal, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl border border-theme bg-surface text-xs md:text-sm flex items-start gap-2.5"
                        >
                          <span className="w-5 h-5 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="text-primary-theme">{goal}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Long-Term Goals */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-muted-theme uppercase tracking-wider flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                      <span>Long-Term Aspirations (3-5 Years)</span>
                    </h4>
                    <div className="space-y-2">
                      {selectedStudent.longTermGoals.map((goal, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl border border-theme bg-surface text-xs md:text-sm flex items-start gap-2.5"
                        >
                          <Award className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                          <span className="text-primary-theme font-medium">{goal}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mentor General Observation */}
                  <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs text-teal-800 dark:text-teal-200 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <MessageSquareQuote className="w-4 h-4" />
                      <span>Mentor Advisory Note</span>
                    </div>
                    <p className="opacity-95 leading-relaxed pl-5">{selectedStudent.mentorNotes}</p>
                  </div>
                </div>
              )}

              {/* TAB 2: COMPETENCIES MATRIX */}
              {activeModalTab === "competencies" && (
                <div className="space-y-4">
                  <p className="text-xs text-muted-theme">
                    Measured against the VRCF 10-competency standard via Socratic AI tutor sessions and case reviews:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedStudent.competencies.map((comp) => (
                      <div
                        key={comp.name}
                        className="p-3.5 rounded-xl border border-theme bg-surface space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-semibold text-xs md:text-sm text-primary-theme">
                            {comp.name}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              comp.level === "Strong"
                                ? "bg-teal-500/10 text-teal-700 dark:text-teal-300"
                                : comp.level === "Developing"
                                ? "bg-blue-500/10 text-blue-700 dark:text-blue-300"
                                : "bg-black/5 dark:bg-white/5 text-muted-theme"
                            }`}
                          >
                            {comp.level}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-muted-theme">
                          <span>{comp.evidenceCount} verified evidence items</span>
                          <span className="text-teal-600 dark:text-teal-400 font-medium">
                            {comp.trend}
                          </span>
                        </div>

                        <div className="w-full bg-border-subtle rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-teal-600 dark:bg-teal-400 h-1.5 rounded-full"
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
              )}

              {/* TAB 3: TASKS & MENTOR FEEDBACK */}
              {activeModalTab === "tasks" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-muted-theme pb-2 border-b border-theme">
                    <span>Assignments &amp; Evaluative Feedback</span>
                    <span>
                      {selectedStudent.tasks.filter((t) => t.status === "done").length} of{" "}
                      {selectedStudent.tasks.length} Completed
                    </span>
                  </div>

                  <div className="space-y-3">
                    {selectedStudent.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-4 rounded-xl border border-theme bg-surface space-y-2"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h5 className="font-bold text-sm text-primary-theme">{task.title}</h5>
                            <span className="text-[11px] text-muted-theme flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3 h-3" />
                              <span>Due {task.dueDate}</span>
                            </span>
                          </div>

                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                              task.status === "done"
                                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                                : task.status === "in_progress"
                                ? "bg-blue-500/10 text-blue-700 dark:text-blue-300"
                                : "bg-black/5 dark:bg-white/5 text-muted-theme"
                            }`}
                          >
                            {task.status.replace("_", " ")}
                          </span>
                        </div>

                        {task.feedback && (
                          <div className="p-3 rounded-lg bg-black/[0.02] dark:bg-white/[0.02] border border-theme text-xs text-muted-theme mt-2">
                            <span className="font-semibold text-primary-theme block mb-0.5">
                              Mentor Feedback:
                            </span>
                            <p>{task.feedback}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="pt-4 border-t border-theme flex justify-end">
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="btn-primary text-xs py-2 px-6"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
