"use client";

import React, { useState } from "react";
import {
  X,
  Mail,
  Phone,
  GraduationCap,
  Building,
  MapPin,
  Home,
  Calendar,
  Clock,
  Target,
  Award,
  CheckCircle2,
  BookOpen,
  MessageSquareQuote,
  TrendingUp,
  CreditCard,
  UserCheck,
  Send,
} from "lucide-react";
import Link from "next/link";

export interface UnifiedScholarProfile {
  id: string;
  vrcfId: string;
  name: string;
  email: string;
  phone: string;
  parentPhone: string;
  cohort: string;
  homeAddress: string;
  district: string;
  course: string;
  college: string;
  collegeLocation: string;
  yearOfStudy: string;
  totalYears: string;
  hostelOrDayScholar: string;
  tuitionFeeTerm?: string;
  tuitionFeeAmount?: string;
  hostelFee?: string;
  focusArea: string;
  careerGoal: string;
  totalHoursSpent: string;
  competencySignal: {
    topCompetency: string;
    level: string;
    trend: string;
  };
  shortTermGoals: string[];
  longTermGoals: string[];
  tasks: Array<{
    id: string;
    title: string;
    status: "open" | "in_progress" | "done";
    dueDate: string;
    feedback?: string;
    grade?: string;
    score?: number;
  }>;
  competencies: Array<{
    name: string;
    level: "Foundation" | "Developing" | "Strong";
    trend: "+Upward" | "Steady";
    evidenceCount: number;
  }>;
  mentorNotes: string;
}

interface ScholarProfileModalProps {
  scholar: UnifiedScholarProfile | null;
  onClose: () => void;
  canAssignTask?: boolean;
}

export default function ScholarProfileModal({
  scholar,
  onClose,
  canAssignTask = false,
}: ScholarProfileModalProps) {
  const [activeTab, setActiveTab] = useState<"details" | "vision" | "competencies" | "tasks">("details");

  if (!scholar) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="card-theme max-w-4xl w-full my-6 p-6 md:p-8 space-y-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full border border-theme flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-muted-theme cursor-pointer"
          title="Close Profile"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Scholar Header Profile */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-theme">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-teal-600/10 text-teal-700 dark:text-teal-300 border border-teal-500/30 flex items-center justify-center font-bold text-2xl md:text-3xl shrink-0 shadow-sm">
              {scholar.name.charAt(0)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-500/10 text-teal-700 dark:text-teal-300 font-mono">
                  VRCF ID: {scholar.vrcfId}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                  {scholar.cohort || "Cohort 1"}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-300">
                  {scholar.hostelOrDayScholar || "Dayscholar"}
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-primary-theme">
                {scholar.name}
              </h2>
              <div className="flex flex-wrap items-center gap-2.5 text-xs text-muted-theme mt-1">
                <span className="flex items-center gap-1 font-medium text-primary-theme">
                  <GraduationCap className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>{scholar.course}</span>
                </span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>{scholar.college}</span>
                </span>
              </div>
            </div>
          </div>

          {canAssignTask && (
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={`/mentor/assign?studentId=${encodeURIComponent(scholar.id)}`}
                className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>+ Assign Task</span>
              </Link>
            </div>
          )}
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-theme pb-2">
          <button
            onClick={() => setActiveTab("details")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "details"
                ? "bg-teal-600 dark:bg-teal-400 text-white dark:text-[#0B1413] shadow-sm"
                : "text-muted-theme hover:text-primary-theme hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            Personal &amp; College Info
          </button>
          <button
            onClick={() => setActiveTab("vision")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "vision"
                ? "bg-teal-600 dark:bg-teal-400 text-white dark:text-[#0B1413] shadow-sm"
                : "text-muted-theme hover:text-primary-theme hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            Vision, Aim &amp; Goals
          </button>
          <button
            onClick={() => setActiveTab("competencies")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "competencies"
                ? "bg-teal-600 dark:bg-teal-400 text-white dark:text-[#0B1413] shadow-sm"
                : "text-muted-theme hover:text-primary-theme hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            Competency Matrix ({scholar.competencies.length})
          </button>
          <button
            onClick={() => setActiveTab("tasks")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "tasks"
                ? "bg-teal-600 dark:bg-teal-400 text-white dark:text-[#0B1413] shadow-sm"
                : "text-muted-theme hover:text-primary-theme hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            Tasks &amp; Feedback ({scholar.tasks.length})
          </button>
        </div>

        {/* TAB 1: COMPLETE PERSONAL & COLLEGE DETAILS */}
        {activeTab === "details" && (
          <div className="space-y-6">
            {/* Contact & Residential Information */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-theme flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Scholar Contact &amp; Residential Details</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Email */}
                <div className="p-3.5 rounded-xl border border-theme bg-surface space-y-1">
                  <span className="text-[11px] font-semibold text-muted-theme flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>Email (Self Gmail)</span>
                  </span>
                  <p className="text-xs font-medium text-primary-theme break-all font-mono">
                    {scholar.email || "Not specified"}
                  </p>
                </div>

                {/* Scholar Phone */}
                <div className="p-3.5 rounded-xl border border-theme bg-surface space-y-1">
                  <span className="text-[11px] font-semibold text-muted-theme flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>Scholar Phone Number</span>
                  </span>
                  <p className="text-xs font-semibold text-primary-theme font-mono">
                    {scholar.phone || "Not specified"}
                  </p>
                </div>

                {/* Parents Phone */}
                <div className="p-3.5 rounded-xl border border-theme bg-surface space-y-1">
                  <span className="text-[11px] font-semibold text-muted-theme flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Parent&apos;s Phone Number</span>
                  </span>
                  <p className="text-xs font-semibold text-primary-theme font-mono">
                    {scholar.parentPhone || "Not specified"}
                  </p>
                </div>

                {/* District */}
                <div className="p-3.5 rounded-xl border border-theme bg-surface space-y-1">
                  <span className="text-[11px] font-semibold text-muted-theme flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>District Belonged To</span>
                  </span>
                  <p className="text-xs font-semibold text-primary-theme">
                    {scholar.district || "Tamil Nadu"}
                  </p>
                </div>

                {/* Home Address (Span 2) */}
                <div className="p-3.5 rounded-xl border border-theme bg-surface space-y-1 sm:col-span-2">
                  <span className="text-[11px] font-semibold text-muted-theme flex items-center gap-1.5">
                    <Home className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>Home Address</span>
                  </span>
                  <p className="text-xs font-medium text-primary-theme">
                    {scholar.homeAddress || "Tamil Nadu, India"}
                  </p>
                </div>
              </div>
            </div>

            {/* Academic & College Information */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-theme flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Academic &amp; Institutional Profile</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* College Name (Span 2) */}
                <div className="p-3.5 rounded-xl border border-theme bg-surface space-y-1 sm:col-span-2">
                  <span className="text-[11px] font-semibold text-muted-theme flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>College Name</span>
                  </span>
                  <p className="text-xs font-bold text-primary-theme">
                    {scholar.college}
                  </p>
                </div>

                {/* College Location */}
                <div className="p-3.5 rounded-xl border border-theme bg-surface space-y-1">
                  <span className="text-[11px] font-semibold text-muted-theme flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>College Location</span>
                  </span>
                  <p className="text-xs font-semibold text-primary-theme">
                    {scholar.collegeLocation || "Tamil Nadu"}
                  </p>
                </div>

                {/* Course Name */}
                <div className="p-3.5 rounded-xl border border-theme bg-surface space-y-1">
                  <span className="text-[11px] font-semibold text-muted-theme flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>Course Name</span>
                  </span>
                  <p className="text-xs font-bold text-teal-800 dark:text-teal-200">
                    {scholar.course}
                  </p>
                </div>

                {/* Year of Study */}
                <div className="p-3.5 rounded-xl border border-theme bg-surface space-y-1">
                  <span className="text-[11px] font-semibold text-muted-theme flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>Current Year of Study</span>
                  </span>
                  <p className="text-xs font-bold text-primary-theme">
                    {scholar.yearOfStudy || "3rd Year"}
                  </p>
                </div>

                {/* Total Year of Study */}
                <div className="p-3.5 rounded-xl border border-theme bg-surface space-y-1">
                  <span className="text-[11px] font-semibold text-muted-theme flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>Total Program Duration</span>
                  </span>
                  <p className="text-xs font-bold text-primary-theme">
                    {scholar.totalYears || "3 Years"}
                  </p>
                </div>
              </div>
            </div>

            {/* Residence & Financial Aid Particulars */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-theme flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Accommodation &amp; Financial Aid Particulars</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Hosteller or Dayscholar */}
                <div className="p-3.5 rounded-xl border border-theme bg-surface space-y-1">
                  <span className="text-[11px] font-semibold text-muted-theme">
                    Living Accommodation
                  </span>
                  <p className="text-xs font-bold text-teal-800 dark:text-teal-200">
                    {scholar.hostelOrDayScholar || "Dayscholar"}
                  </p>
                </div>

                {/* Tuition Fee */}
                <div className="p-3.5 rounded-xl border border-theme bg-surface space-y-1">
                  <span className="text-[11px] font-semibold text-muted-theme">
                    Tuition Fee Support
                  </span>
                  <p className="text-xs font-semibold text-primary-theme">
                    {scholar.tuitionFeeAmount && scholar.tuitionFeeAmount !== "-"
                      ? `${scholar.tuitionFeeAmount} (${scholar.tuitionFeeTerm || "Per Year"})`
                      : "Covered by VRCF Aid"}
                  </p>
                </div>

                {/* Hostel Fee */}
                <div className="p-3.5 rounded-xl border border-theme bg-surface space-y-1">
                  <span className="text-[11px] font-semibold text-muted-theme">
                    Hostel / Living Fee
                  </span>
                  <p className="text-xs font-semibold text-primary-theme">
                    {scholar.hostelFee && scholar.hostelFee !== "-"
                      ? scholar.hostelFee
                      : "N/A (Dayscholar)"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: VISION, AIM & GOALS */}
        {activeTab === "vision" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-theme bg-black/[0.01] dark:bg-white/[0.01] space-y-1">
                <span className="text-[11px] font-semibold text-muted-theme uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>Academic Focus Area</span>
                </span>
                <p className="text-sm font-semibold text-primary-theme">
                  {scholar.focusArea}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-theme bg-black/[0.01] dark:bg-white/[0.01] space-y-1">
                <span className="text-[11px] font-semibold text-muted-theme uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>Stated Career Aim / Vision</span>
                </span>
                <p className="text-sm font-semibold text-teal-800 dark:text-teal-200">
                  {scholar.careerGoal}
                </p>
              </div>
            </div>

            {/* Short-Term Goals */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-muted-theme uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Short-Term Milestones (This Academic Year)</span>
              </h4>
              <div className="space-y-2">
                {scholar.shortTermGoals && scholar.shortTermGoals.length > 0 ? (
                  scholar.shortTermGoals.map((goal, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-theme bg-surface text-xs md:text-sm flex items-start gap-2.5"
                    >
                      <span className="w-5 h-5 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="text-primary-theme">{goal}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-theme italic p-3">No short term milestones recorded yet.</p>
                )}
              </div>
            </div>

            {/* Long-Term Goals */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-muted-theme uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Long-Term Aspirations (3-5 Years)</span>
              </h4>
              <div className="space-y-2">
                {scholar.longTermGoals && scholar.longTermGoals.length > 0 ? (
                  scholar.longTermGoals.map((goal, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-theme bg-surface text-xs md:text-sm flex items-start gap-2.5"
                    >
                      <Award className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                      <span className="text-primary-theme font-medium">{goal}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-theme italic p-3">No long term aspirations recorded yet.</p>
                )}
              </div>
            </div>

            {/* Mentor Advisory Note */}
            <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs text-teal-800 dark:text-teal-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <MessageSquareQuote className="w-4 h-4" />
                <span>Mentor Advisory Note</span>
              </div>
              <p className="opacity-95 leading-relaxed pl-5">{scholar.mentorNotes}</p>
            </div>
          </div>
        )}

        {/* TAB 3: COMPETENCIES MATRIX */}
        {activeTab === "competencies" && (
          <div className="space-y-4">
            <p className="text-xs text-muted-theme">
              Evaluated against the VRCF 10-competency standard via Socratic AI tutor interactions, submissions, and case discussions:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {scholar.competencies.map((comp) => (
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

        {/* TAB 4: TASKS & MENTOR FEEDBACK */}
        {activeTab === "tasks" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-muted-theme pb-2 border-b border-theme">
              <span>Task Assignments &amp; Evaluation Feedback</span>
              <span>
                {scholar.tasks.filter((t) => t.status === "done").length} of {scholar.tasks.length} Completed
              </span>
            </div>

            {scholar.tasks.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-theme rounded-xl text-xs text-muted-theme space-y-2">
                <p>No tasks assigned to this scholar yet.</p>
                {canAssignTask && (
                  <Link
                    href={`/mentor/assign?studentId=${encodeURIComponent(scholar.id)}`}
                    className="btn-primary text-xs py-1.5 px-4 inline-flex items-center gap-1 mt-2"
                  >
                    <span>+ Assign First Task</span>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {scholar.tasks.map((task) => (
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

                      <div className="flex items-center gap-2">
                        {task.grade && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-700 dark:text-teal-300">
                            Grade: {task.grade}
                          </span>
                        )}
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
            )}
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-theme flex items-center justify-between">
          <span className="text-[11px] text-muted-theme font-mono">
            VRCF Mentora &bull; Verified Scholar Profile
          </span>
          <div className="flex items-center gap-3">
            {canAssignTask && (
              <Link
                href={`/mentor/assign?studentId=${encodeURIComponent(scholar.id)}`}
                className="btn-secondary text-xs py-2 px-4"
              >
                Assign Task
              </Link>
            )}
            <button
              onClick={onClose}
              className="btn-primary text-xs py-2 px-6"
            >
              Close Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
