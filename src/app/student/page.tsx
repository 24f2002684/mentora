"use client";

import React, { useEffect, useState, useRef } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import { useAuth } from "@/lib/auth-context";
import {
  getStudentTasks,
  getStudentCompetencies,
  getStudentActivityStats,
  getStudentVisionBoard,
  updateStudentVisionBoard,
  getStoredAvatar,
  saveStoredAvatar,
} from "@/lib/student-data";
import { TaskItem, CompetencyScore, VisionBoard } from "@/types";
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
  Camera,
  Upload,
  Edit3,
  Save,
  Plus,
  Trash2,
  Loader2,
  Target,
  Award,
} from "lucide-react";

export default function StudentHomePage() {
  const { user, profile } = useAuth();
  const studentId = user?.uid || "student-default";

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [competencies, setCompetencies] = useState<CompetencyScore[]>([]);
  const [visionBoard, setVisionBoard] = useState<VisionBoard | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Roadmap & Goals editing states
  const [editingRoadmap, setEditingRoadmap] = useState(false);
  const [savingRoadmap, setSavingRoadmap] = useState(false);
  const [generatingGoals, setGeneratingGoals] = useState(false);
  const [careerGoal, setCareerGoal] = useState("");
  const [shortGoals, setShortGoals] = useState<string[]>([]);
  const [longGoals, setLongGoals] = useState<string[]>([]);
  const [newShortGoal, setNewShortGoal] = useState("");
  const [newLongGoal, setNewLongGoal] = useState("");
  const [savedNotice, setSavedNotice] = useState(false);
  const [aiNotice, setAiNotice] = useState<string | null>(null);

  const [stats, setStats] = useState({
    hoursThisMonth: "7.0",
    hoursThisWeek: "3.5",
    streakDays: 4,
    sessionCount: 6,
    tasksCompleted: 2,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load local avatar
    const cached = getStoredAvatar(studentId) || user?.photoURL || null;
    if (cached) setAvatarUrl(cached);

    async function loadData() {
      try {
        const [loadedTasks, loadedComps, loadedStats, loadedBoard] = await Promise.all([
          getStudentTasks(studentId),
          getStudentCompetencies(studentId),
          getStudentActivityStats(studentId),
          getStudentVisionBoard(studentId),
        ]);
        setTasks(loadedTasks);
        setCompetencies(loadedComps);
        setStats(loadedStats);
        setVisionBoard(loadedBoard);
        setCareerGoal(loadedBoard.careerGoal || "");
        setShortGoals(loadedBoard.shortTermGoals || []);
        setLongGoals(loadedBoard.longTermGoals || []);
        if (loadedBoard.avatarUrl) {
          setAvatarUrl(loadedBoard.avatarUrl);
          saveStoredAvatar(studentId, loadedBoard.avatarUrl);
        }
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

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Please select an image under 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setAvatarUrl(dataUrl);
        saveStoredAvatar(studentId, dataUrl);
        await updateStudentVisionBoard(studentId, { avatarUrl: dataUrl });
        setSavedNotice(true);
        setTimeout(() => setSavedNotice(false), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateAiGoals = async () => {
    setGeneratingGoals(true);
    setAiNotice(null);
    try {
      const res = await fetch("/api/student/generate-goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course: visionBoard?.course || profile?.course || "Undergraduate Degree",
          focusArea: visionBoard?.focusArea || profile?.focusArea || "Academic Excellence",
          careerGoal: careerGoal || visionBoard?.careerGoal || "Leadership and Innovation",
        }),
      });
      const data = await res.json();
      if (data.shortTermGoals && data.shortTermGoals.length > 0) {
        setShortGoals(data.shortTermGoals);
      }
      if (data.longTermGoals && data.longTermGoals.length > 0) {
        setLongGoals(data.longTermGoals);
      }
      setEditingRoadmap(true);
      setAiNotice("Socratic AI drafted goals! Review or adjust below, then click 'Save Roadmap'.");
      setTimeout(() => setAiNotice(null), 7000);
    } catch (err) {
      console.error("AI goal generation error:", err);
    } finally {
      setGeneratingGoals(false);
    }
  };

  const handleSaveRoadmap = async () => {
    setSavingRoadmap(true);
    try {
      await updateStudentVisionBoard(studentId, {
        careerGoal,
        shortTermGoals: shortGoals,
        longTermGoals: longGoals,
        avatarUrl: avatarUrl || undefined,
      });
      setVisionBoard((prev) => (prev ? {
        ...prev,
        careerGoal,
        shortTermGoals: shortGoals,
        longTermGoals: longGoals,
        avatarUrl: avatarUrl || undefined,
      } : null));
      setEditingRoadmap(false);
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3000);
    } catch (e) {
      console.error("Failed to save roadmap:", e);
    } finally {
      setSavingRoadmap(false);
    }
  };

  const addShortGoal = () => {
    if (!newShortGoal.trim()) return;
    setShortGoals([...shortGoals, newShortGoal.trim()]);
    setNewShortGoal("");
  };

  const removeShortGoal = (index: number) => {
    setShortGoals(shortGoals.filter((_, i) => i !== index));
  };

  const addLongGoal = () => {
    if (!newLongGoal.trim()) return;
    setLongGoals([...longGoals, newLongGoal.trim()]);
    setNewLongGoal("");
  };

  const removeLongGoal = (index: number) => {
    setLongGoals(longGoals.filter((_, i) => i !== index));
  };

  const openTasks = tasks.filter((t) => t.status !== "done");
  const topCompetencies = competencies.slice(0, 3);

  return (
    <DashboardShell allowedRole="student">
      <div className="space-y-8">
        {/* Welcome & Profile Header */}
        <div className="card-theme p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 border-b border-theme">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            {/* Avatar with click-to-upload */}
            <div className="relative group shrink-0">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl border-2 border-teal-500/30 overflow-hidden bg-teal-50 dark:bg-teal-950 flex items-center justify-center shadow-md">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={profile?.name || user?.displayName || "Profile"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-teal-700 dark:text-teal-300">
                    {profile?.name ? profile.name.charAt(0).toUpperCase() : user?.displayName ? user.displayName.charAt(0).toUpperCase() : "S"}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-full bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer"
                title="Change Profile Picture"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            {/* Profile Info */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                  VRCF Scholar
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-500/10 text-teal-700 dark:text-teal-300">
                  Active Mentorship
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary-theme">
                Welcome back, {profile?.name || user?.displayName || "Scholar"}
              </h1>
              <p className="text-xs md:text-sm text-muted-theme font-mono">
                {user?.email}
              </p>
              <p className="text-xs text-muted-theme pt-1">
                <strong>Course:</strong> {visionBoard?.course || "Undergraduate Degree"} &middot; <strong>Focus:</strong> {visionBoard?.focusArea || "Academic Excellence"}
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-tertiary text-xs px-3.5 py-2 flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>{avatarUrl ? "Change Photo" : "Upload Photo"}</span>
            </button>
            <Link href="/student/tutor" className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5">
              <Bot className="w-4 h-4" />
              <span>Launch AI Tutor</span>
            </Link>
          </div>
        </div>

        {/* Status Notices */}
        {(savedNotice || aiNotice) && (
          <div className="flex flex-wrap items-center gap-3">
            {savedNotice && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-medium animate-fadeIn">
                <CheckCircle2 className="w-4 h-4" />
                <span>Profile &amp; roadmap saved successfully</span>
              </div>
            )}
            {aiNotice && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 text-xs font-medium animate-fadeIn">
                <Sparkles className="w-4 h-4" />
                <span>{aiNotice}</span>
              </div>
            )}
          </div>
        )}

        {/* Scholar Goals & Academic Vision Card */}
        <div className="card-theme p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-theme">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                  Vision &amp; Milestones
                </span>
              </div>
              <h2 className="text-xl font-bold text-primary-theme">
                My Career Aim &amp; Milestones
              </h2>
              <p className="text-xs text-muted-theme mt-0.5">
                Set your short and long term goals manually or let Socratic AI write them for you.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleGenerateAiGoals}
                disabled={generatingGoals}
                className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 hover:border-teal-500/50"
                title="Use Gemini AI to formulate tailored milestones"
              >
                {generatingGoals ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600 dark:text-teal-400" />
                    <span>AI Writing Goals...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>AI Write Goals</span>
                  </>
                )}
              </button>

              {!editingRoadmap ? (
                <button
                  type="button"
                  onClick={() => setEditingRoadmap(true)}
                  className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Goals</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveRoadmap}
                    disabled={savingRoadmap}
                    className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{savingRoadmap ? "Saving..." : "Save Roadmap"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingRoadmap(false)}
                    className="btn-tertiary text-xs py-2 px-3"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Goals Content Area */}
          <div className="space-y-6">
            {/* Career Goal */}
            <div>
              <label className="block text-xs font-semibold text-muted-theme uppercase tracking-wider mb-1.5">
                Stated Career Direction
              </label>
              {editingRoadmap ? (
                <input
                  type="text"
                  value={careerGoal}
                  onChange={(e) => setCareerGoal(e.target.value)}
                  className="w-full input-theme text-sm"
                  placeholder="e.g. AI Research Fellow & Public Impact Tech Lead"
                />
              ) : (
                <div className="p-3.5 rounded-xl bg-teal-500/5 border border-teal-500/20 text-sm font-medium text-teal-900 dark:text-teal-100 flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span>{careerGoal || "No career direction stated yet. Click 'Edit Goals' or 'AI Write Goals' to set one."}</span>
                </div>
              )}
            </div>

            {/* 2-Column Goals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Short Term Goals */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-muted-theme uppercase tracking-wider">
                    Short-Term Milestones (This Year)
                  </h3>
                  <span className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">
                    {shortGoals.length} targets
                  </span>
                </div>

                <div className="space-y-2">
                  {shortGoals.length === 0 ? (
                    <div className="p-4 rounded-xl border border-dashed border-theme text-xs text-muted-theme text-center">
                      No short-term milestones yet. Click &quot;AI Write Goals&quot; to draft some!
                    </div>
                  ) : (
                    shortGoals.map((g, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl border border-theme bg-surface flex items-start justify-between gap-3 text-xs md:text-sm"
                      >
                        <div className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                          <span className="text-primary-theme">{g}</span>
                        </div>
                        {editingRoadmap && (
                          <button
                            type="button"
                            onClick={() => removeShortGoal(i)}
                            className="text-red-500 hover:text-red-600 p-1 shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))
                  )}

                  {editingRoadmap && (
                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Add short-term milestone..."
                        value={newShortGoal}
                        onChange={(e) => setNewShortGoal(e.target.value)}
                        className="flex-1 input-theme text-xs"
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addShortGoal())}
                      />
                      <button
                        type="button"
                        onClick={addShortGoal}
                        className="btn-secondary text-xs px-3"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Long Term Goals */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-muted-theme uppercase tracking-wider">
                    Long-Term Aspirations (3-5 Years)
                  </h3>
                  <span className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">
                    {longGoals.length} aspirations
                  </span>
                </div>

                <div className="space-y-2">
                  {longGoals.length === 0 ? (
                    <div className="p-4 rounded-xl border border-dashed border-theme text-xs text-muted-theme text-center">
                      No long-term aspirations yet. Click &quot;AI Write Goals&quot; to draft some!
                    </div>
                  ) : (
                    longGoals.map((g, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl border border-theme bg-surface flex items-start justify-between gap-3 text-xs md:text-sm"
                      >
                        <div className="flex items-start gap-2.5">
                          <Award className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                          <span className="text-primary-theme">{g}</span>
                        </div>
                        {editingRoadmap && (
                          <button
                            type="button"
                            onClick={() => removeLongGoal(i)}
                            className="text-red-500 hover:text-red-600 p-1 shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))
                  )}

                  {editingRoadmap && (
                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Add long-term aspiration..."
                        value={newLongGoal}
                        onChange={(e) => setNewLongGoal(e.target.value)}
                        className="flex-1 input-theme text-xs"
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLongGoal())}
                      />
                      <button
                        type="button"
                        onClick={addLongGoal}
                        className="btn-secondary text-xs px-3"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-theme">
              <Link
                href="/student/journey"
                className="text-xs text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 font-medium"
              >
                <span>View Full Roadmap &amp; VRCF Competency Matrix</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
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
