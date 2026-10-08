"use client";

import React, { useState, useEffect, useRef } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import { useAuth } from "@/lib/auth-context";
import {
  getStudentVisionBoard,
  updateStudentVisionBoard,
  getStudentCompetencies,
  getStoredAvatar,
  saveStoredAvatar,
} from "@/lib/student-data";
import { VisionBoard, CompetencyScore } from "@/types";
import {
  Compass,
  Edit3,
  Save,
  CheckCircle2,
  TrendingUp,
  Award,
  Sparkles,
  Plus,
  Trash2,
  Camera,
  Upload,
  Loader2,
  User,
} from "lucide-react";

export default function StudentJourneyPage() {
  const { user, profile } = useAuth();
  const studentId = user?.uid || "student-default";

  const [visionBoard, setVisionBoard] = useState<VisionBoard | null>(null);
  const [competencies, setCompetencies] = useState<CompetencyScore[]>([]);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [generatingGoals, setGeneratingGoals] = useState(false);
  const [aiNotice, setAiNotice] = useState<string | null>(null);

  // Avatar state
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [course, setCourse] = useState("");
  const [focusArea, setFocusArea] = useState("");
  const [careerGoal, setCareerGoal] = useState("");
  const [newShortGoal, setNewShortGoal] = useState("");
  const [shortGoals, setShortGoals] = useState<string[]>([]);
  const [newLongGoal, setNewLongGoal] = useState("");
  const [longGoals, setLongGoals] = useState<string[]>([]);

  useEffect(() => {
    // Load cached avatar
    const cached = getStoredAvatar(studentId) || user?.photoURL || null;
    if (cached) setAvatarUrl(cached);

    async function load() {
      if (!user) return;
      const [board, comps] = await Promise.all([
        getStudentVisionBoard(studentId),
        getStudentCompetencies(studentId),
      ]);
      setVisionBoard(board);
      setCourse(board.course);
      setFocusArea(board.focusArea);
      setCareerGoal(board.careerGoal);
      setShortGoals(board.shortTermGoals || []);
      setLongGoals(board.longTermGoals || []);
      if (board.avatarUrl) {
        setAvatarUrl(board.avatarUrl);
        saveStoredAvatar(studentId, board.avatarUrl);
      }
      setCompetencies(comps);
    }
    load();
  }, [user, studentId]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Please choose an image under 2MB.");
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
          course: course || "Undergraduate Degree",
          focusArea: focusArea || "Academic Excellence",
          careerGoal: careerGoal || "Leadership & Impact",
        }),
      });
      const data = await res.json();
      if (data.shortTermGoals && data.shortTermGoals.length > 0) {
        setShortGoals(data.shortTermGoals);
      }
      if (data.longTermGoals && data.longTermGoals.length > 0) {
        setLongGoals(data.longTermGoals);
      }
      setEditing(true);
      setAiNotice("Socratic AI drafted tailored milestones! You can edit them below, then click 'Save Changes'.");
      setTimeout(() => setAiNotice(null), 7000);
    } catch (err) {
      console.error("AI goal generation error:", err);
    } finally {
      setGeneratingGoals(false);
    }
  };

  const handleSaveVision = async () => {
    setSaving(true);
    try {
      await updateStudentVisionBoard(studentId, {
        course,
        focusArea,
        careerGoal,
        shortTermGoals: shortGoals,
        longTermGoals: longGoals,
        avatarUrl: avatarUrl || undefined,
      });
      setVisionBoard((prev) => (prev ? {
        ...prev,
        course,
        focusArea,
        careerGoal,
        shortTermGoals: shortGoals,
        longTermGoals: longGoals,
        avatarUrl: avatarUrl || undefined,
      } : null));
      setEditing(false);
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3000);
    } catch (e) {
      console.error("Save failed:", e);
    } finally {
      setSaving(false);
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

  return (
    <DashboardShell allowedRole="student">
      <div className="space-y-8">
        {/* Header */}
        <div className="pb-2 border-b border-theme flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Compass className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Personal Roadmap &amp; Competencies
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary-theme">
              My Journey
            </h1>
            <p className="text-sm text-muted-theme mt-1">
              Define your academic vision, customize your milestones manually or with AI, and view your VRCF competencies.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {savedNotice && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-medium animate-fadeIn">
                <CheckCircle2 className="w-4 h-4" />
                <span>Roadmap saved successfully</span>
              </div>
            )}
            {aiNotice && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 text-xs font-medium animate-fadeIn">
                <Sparkles className="w-4 h-4" />
                <span>{aiNotice}</span>
              </div>
            )}
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Card: Student Vision Board (7 Cols) */}
          <div className="lg:col-span-7 card-theme p-6 md:p-8 space-y-6">
            {/* Student Profile Picture Upload Section */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-theme">
              <div className="relative group shrink-0">
                <div className="w-20 h-20 rounded-2xl border-2 border-teal-500/30 overflow-hidden bg-teal-50 dark:bg-teal-950 flex items-center justify-center shadow-sm">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={profile?.name || user?.displayName || "Profile"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-teal-700 dark:text-teal-300">
                      {profile?.name ? profile.name.charAt(0).toUpperCase() : user?.displayName ? user.displayName.charAt(0).toUpperCase() : "S"}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center shadow transition-transform hover:scale-110 cursor-pointer"
                  title="Upload profile picture"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>

              <div className="flex-1 text-center sm:text-left space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-base text-primary-theme">
                      {profile?.name || user?.displayName || "VRCF Scholar"}
                    </h3>
                    <p className="text-xs text-muted-theme font-mono">{user?.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-tertiary text-xs px-3 py-1.5 self-center sm:self-auto flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>{avatarUrl ? "Change Photo" : "Upload Photo"}</span>
                  </button>
                </div>
                <p className="text-xs text-muted-theme pt-1">
                  Upload your photo to personalize your profile for mentors and trustees.
                </p>
              </div>
            </div>

            {/* AI Goal Generator Banner */}
            <div className="p-4 rounded-xl bg-teal-500/5 border border-teal-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-primary-theme">
                    AI Goal Drafting Assistant
                  </h4>
                  <p className="text-[11px] text-muted-theme">
                    Have Socratic AI formulate custom short &amp; long term goals based on your focus area.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerateAiGoals}
                disabled={generatingGoals}
                className="btn-secondary text-xs py-2 px-3.5 shrink-0 flex items-center gap-1.5 hover:border-teal-500/50"
              >
                {generatingGoals ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600 dark:text-teal-400" />
                    <span>Formulating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>Draft with AI</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between pb-4 border-b border-theme">
              <div>
                <h2 className="text-lg font-bold text-primary-theme">Vision Board</h2>
                <p className="text-xs text-muted-theme">
                  Your stated course, focus area, and career direction
                </p>
              </div>

              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="btn-secondary text-xs py-2 px-4 flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Vision</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveVision}
                    disabled={saving}
                    className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{saving ? "Saving..." : "Save Changes"}</span>
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="btn-tertiary text-xs py-2 px-3"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Course & Focus & Career Goal Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-theme uppercase tracking-wider mb-1.5">
                  Degree / Academic Course
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full input-theme text-sm"
                    placeholder="e.g. B.S. Data Science & Applications"
                  />
                ) : (
                  <div className="p-3.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-theme text-sm font-medium text-primary-theme">
                    {course || "No degree specified"}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-theme uppercase tracking-wider mb-1.5">
                  Academic Focus Area
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={focusArea}
                    onChange={(e) => setFocusArea(e.target.value)}
                    className="w-full input-theme text-sm"
                    placeholder="e.g. Machine Learning & Public Policy Analytics"
                  />
                ) : (
                  <div className="p-3.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-theme text-sm font-medium text-primary-theme">
                    {focusArea || "No focus area specified"}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-theme uppercase tracking-wider mb-1.5">
                  Stated Career Goal
                </label>
                {editing ? (
                  <textarea
                    rows={2}
                    value={careerGoal}
                    onChange={(e) => setCareerGoal(e.target.value)}
                    className="w-full input-theme text-sm"
                    placeholder="e.g. AI Research Fellow & Public Impact Tech Lead"
                  />
                ) : (
                  <div className="p-3.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-theme text-sm font-medium text-teal-800 dark:text-teal-200">
                    {careerGoal || "No career goal set"}
                  </div>
                )}
              </div>
            </div>

            {/* Goals Lists */}
            <div className="space-y-4 pt-4 border-t border-theme">
              {/* Short Term Goals */}
              <div>
                <h3 className="text-xs font-semibold text-muted-theme uppercase tracking-wider mb-2">
                  Short-Term Milestones (This Year)
                </h3>
                <ul className="space-y-2">
                  {shortGoals.map((g, i) => (
                    <li
                      key={i}
                      className="p-3 rounded-xl border border-theme flex items-start justify-between gap-3 text-xs md:text-sm bg-black/[0.01] dark:bg-white/[0.01]"
                    >
                      <div className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                        <span>{g}</span>
                      </div>
                      {editing && (
                        <button
                          onClick={() => removeShortGoal(i)}
                          className="text-red-500 hover:text-red-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>

                {editing && (
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      placeholder="Add milestone..."
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

              {/* Long Term Goals */}
              <div className="pt-2">
                <h3 className="text-xs font-semibold text-muted-theme uppercase tracking-wider mb-2">
                  Long-Term Aspirations (3-5 Years)
                </h3>
                <ul className="space-y-2">
                  {longGoals.map((g, i) => (
                    <li
                      key={i}
                      className="p-3 rounded-xl border border-theme flex items-start justify-between gap-3 text-xs md:text-sm bg-black/[0.01] dark:bg-white/[0.01]"
                    >
                      <div className="flex items-start gap-2.5">
                        <Award className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                        <span>{g}</span>
                      </div>
                      {editing && (
                        <button
                          onClick={() => removeLongGoal(i)}
                          className="text-red-500 hover:text-red-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>

                {editing && (
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      placeholder="Add aspiration..."
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

          {/* Right Card: VRCF Competency Matrix (5 Cols) */}
          <div className="lg:col-span-5 card-theme p-6 md:p-8 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-primary-theme">Competency Matrix</h2>
              <p className="text-xs text-muted-theme">
                10 foundational competencies cultivated through mentor guidance &amp; Socratic dialogue
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {competencies.map((comp) => (
                <div
                  key={comp.competency}
                  className="p-3.5 rounded-xl border border-theme bg-surface flex items-center justify-between hover:border-teal-500/30 transition-all"
                >
                  <div className="space-y-1">
                    <span className="font-semibold text-xs md:text-sm text-primary-theme block">
                      {comp.competency}
                    </span>
                    <div className="flex items-center gap-2 text-[11px] text-muted-theme">
                      <span>{comp.evidenceCount} evidence logged</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
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
                    <span className="text-[10px] text-muted-theme flex items-center gap-0.5">
                      <TrendingUp className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                      <span>{comp.trend === "up" ? "Upward" : "Steady"}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
