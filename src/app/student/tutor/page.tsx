"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import { useAuth } from "@/lib/auth-context";
import { getStudentVisionBoard, updateStudentCompetencyScore } from "@/lib/student-data";
import { TutorMode, ChatMessage, VisionBoard, AIModelProvider } from "@/types";
import { useSearchParams } from "next/navigation";
import {
  Bot,
  Send,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  HelpCircle,
  Award,
  BookOpen,
  ArrowRight,
  Compass,
  History,
  Trash2,
  Plus,
  Brain,
  TrendingUp,
  X,
  ChevronRight,
  MessageSquare,
  Cpu,
} from "lucide-react";

const TUTOR_MODES: { mode: TutorMode; description: string }[] = [
  { mode: "Learn", description: "Build understanding from foundational principles" },
  { mode: "Practice", description: "Work through guided scenarios and exercises" },
  { mode: "Challenge Me", description: "Tackle harder, open-ended problem formulations" },
  { mode: "Explain Back", description: "Teach the concept to probe hidden assumptions" },
  { mode: "Career Connect", description: "Link ideas explicitly to your stated career goals" },
];

interface SavedSession {
  id: string;
  title: string;
  timestamp: number;
  mode: TutorMode;
  messages: ChatMessage[];
  criticalThinkingScore?: number;
  criticalThinkingLevel?: string;
  criticalThinkingCritique?: string;
}

function TutorChatContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const studentId = user?.uid || "student-default";

  const preloadedTopic = searchParams.get("topic") || "";
  const preloadedTaskId = searchParams.get("taskId") || "";

  // AI Model Engine State (Claude vs Gemini)
  const [selectedModel, setSelectedModel] = useState<AIModelProvider>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("mentora_preferred_model") as AIModelProvider;
      if (saved === "claude" || saved === "gemini") return saved;
    }
    return "claude"; // Default to Claude
  });

  const [visionBoard, setVisionBoard] = useState<VisionBoard | null>(null);
  const [currentMode, setCurrentMode] = useState<TutorMode>("Learn");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [loggedComps, setLoggedComps] = useState<string[]>([]);
  const [sessionId, setSessionId] = useState(`session-${Date.now()}`);

  const handleSelectModel = (model: AIModelProvider) => {
    setSelectedModel(model);
    if (typeof window !== "undefined") {
      localStorage.setItem("mentora_preferred_model", model);
    }
  };

  // Critical Thinking Evaluation State
  const [latestEvaluation, setLatestEvaluation] = useState<{
    score: number;
    level: string;
    critique: string;
  } | null>(null);

  // Chat History States
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(`mentora_tutor_history_${studentId}`);
      if (stored) {
        setSavedSessions(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Could not load chat history:", e);
    }
  }, [studentId]);

  useEffect(() => {
    async function loadBoard() {
      if (!user) return;
      const b = await getStudentVisionBoard(studentId);
      setVisionBoard(b);

      // Initial greeting from Socratic Tutor
      const initialGreeting = preloadedTopic
        ? `Welcome to our Socratic inquiry session! Your mentor highlighted the following task: "${preloadedTopic}". To begin, what is your initial intuition or best guess about how you would break down this challenge?`
        : `Greetings! I am the VRCF Tutor. I am here to help you examine ideas through Socratic questioning rather than handing over answers. What core concept or problem would you like to investigate today?`;

      setMessages([
        {
          role: "tutor",
          text: initialGreeting,
          timestamp: Date.now(),
        },
      ]);
    }
    loadBoard();
  }, [user, studentId, preloadedTopic]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Persist session to history helper
  const persistSession = (
    sid: string,
    mode: TutorMode,
    msgs: ChatMessage[],
    evalObj?: { score: number; level: string; critique: string } | null
  ) => {
    if (msgs.length <= 1) return;
    try {
      // Find first student query for title
      const firstStudentMsg = msgs.find((m) => m.role === "student");
      const title = firstStudentMsg
        ? firstStudentMsg.text.slice(0, 48) + (firstStudentMsg.text.length > 48 ? "..." : "")
        : preloadedTopic || `Inquiry on ${mode}`;

      const updatedSession: SavedSession = {
        id: sid,
        title,
        timestamp: Date.now(),
        mode,
        messages: msgs,
        criticalThinkingScore: evalObj?.score,
        criticalThinkingLevel: evalObj?.level,
        criticalThinkingCritique: evalObj?.critique,
      };

      setSavedSessions((prev) => {
        const filtered = prev.filter((s) => s.id !== sid);
        const nextList = [updatedSession, ...filtered].slice(0, 20); // Keep last 20 sessions
        localStorage.setItem(`mentora_tutor_history_${studentId}`, JSON.stringify(nextList));
        return nextList;
      });
    } catch (e) {
      console.warn("Error persisting session:", e);
    }
  };

  const handleStartNewInquiry = () => {
    const newSid = `session-${Date.now()}`;
    setSessionId(newSid);
    setSessionCompleted(false);
    setLatestEvaluation(null);
    setMessages([
      {
        role: "tutor",
        text: `Greetings! I am ready for a new Socratic investigation. What idea, dilemma, or concept would you like to explore?`,
        timestamp: Date.now(),
      },
    ]);
    setShowHistoryDrawer(false);
  };

  const handleResumeSession = (session: SavedSession) => {
    setSessionId(session.id);
    setCurrentMode(session.mode);
    setMessages(session.messages);
    setSessionCompleted(false);
    if (session.criticalThinkingScore && session.criticalThinkingLevel && session.criticalThinkingCritique) {
      setLatestEvaluation({
        score: session.criticalThinkingScore,
        level: session.criticalThinkingLevel,
        critique: session.criticalThinkingCritique,
      });
    } else {
      setLatestEvaluation(null);
    }
    setShowHistoryDrawer(false);
  };

  const handleDeleteSession = (idToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedSessions.filter((s) => s.id !== idToDelete);
    setSavedSessions(updated);
    try {
      localStorage.setItem(`mentora_tutor_history_${studentId}`, JSON.stringify(updated));
    } catch {}

    // If currently viewing deleted session, reset to fresh inquiry
    if (sessionId === idToDelete) {
      handleStartNewInquiry();
    }
  };

  const handleClearAllHistory = () => {
    if (confirm("Are you sure you want to clear all previous chat history? This will delete all past session logs and free up storage.")) {
      setSavedSessions([]);
      try {
        localStorage.removeItem(`mentora_tutor_history_${studentId}`);
      } catch {}
      handleStartNewInquiry();
    }
  };

  const handleModeChange = (mode: TutorMode) => {
    if (mode === currentMode) return;
    setCurrentMode(mode);

    // Provide a framing transition prompt
    const transitionNotice: ChatMessage = {
      role: "tutor",
      text: `[Switched mode to ${mode}] How would you approach this problem under our ${mode.toLowerCase()} lens? Give me your initial hypothesis.`,
      timestamp: Date.now(),
    };
    const updated = [...messages, transitionNotice];
    setMessages(updated);
    persistSession(sessionId, mode, updated, latestEvaluation);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      role: "student",
      text: input.trim(),
      timestamp: Date.now(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newHistory,
          mode: currentMode,
          modelProvider: selectedModel,
          course: visionBoard?.course,
          focusArea: visionBoard?.focusArea,
          careerGoal: visionBoard?.careerGoal,
          sessionId,
          topic: preloadedTopic || "Socratic Inquiry",
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Tutor could not respond");
      }

      const data = await res.json();
      const tutorReply: ChatMessage = {
        role: "tutor",
        text: data.text,
        provider: data.provider || selectedModel,
        timestamp: Date.now(),
      };

      const finalMessages = [...newHistory, tutorReply];
      setMessages(finalMessages);

      // Handle critical thinking evaluation returned by AI
      if (data.evaluation) {
        setLatestEvaluation(data.evaluation);
        await updateStudentCompetencyScore(
          studentId,
          "Critical Thinking",
          data.evaluation.level as any,
          "up",
          1
        );
      }

      // Save to chat history
      persistSession(sessionId, currentMode, finalMessages, data.evaluation || latestEvaluation);
    } catch (err: any) {
      console.error("Chat error:", err);
      const displayMsg =
        err?.message && !err.message.includes("could not respond")
          ? `[Tutor Notice] ${err.message}`
          : "I paused while evaluating your response. Please check your internet connection or try rephrasing your thought.";
      setMessages((prev) => [
        ...prev,
        {
          role: "tutor",
          text: displayMsg,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSession = async () => {
    if (messages.length < 2) return;
    setLoading(true);

    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isEnding: true,
          sessionId,
          mode: currentMode,
          topic: preloadedTopic || "Socratic Dialogue",
        }),
      });

      const data = await res.json();
      setSessionCompleted(true);
      const comps = data.loggedCompetencies || ["Critical Thinking", "Analytical Thinking"];
      setLoggedComps(comps);
      for (const c of comps) {
        await updateStudentCompetencyScore(studentId, c, "Strong", "up", 1);
      }
    } catch (e) {
      console.error("Failed to complete session:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-3 border-b border-theme flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bot className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Socratic Mentor
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary-theme">
            VRCF AI Tutor
          </h1>
          <p className="text-sm text-muted-theme mt-1">
            A guided inquiry partner following the Socratic method: Diagnose &rarr; Question &rarr; Probe &rarr; Hint &rarr; Apply &rarr; Reflect.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={() => setShowHistoryDrawer(true)}
            className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5"
            title="View or manage previous inquiry conversations"
          >
            <History className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Chat History ({savedSessions.length})</span>
          </button>

          <button
            onClick={handleStartNewInquiry}
            className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
            title="Start a fresh Socratic investigation"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Inquiry</span>
          </button>

          <button
            onClick={handleCompleteSession}
            disabled={messages.length < 2 || sessionCompleted}
            className="btn-primary text-xs py-2 px-4 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{sessionCompleted ? "Session Logged" : "Complete & Log Session"}</span>
          </button>
        </div>
      </div>

      {/* Critical Thinking Real-Time Evaluation Banner */}
      {latestEvaluation && (
        <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-teal-900 dark:text-teal-100 shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs">Critical Thinking Evaluated: </span>
              <span className="px-2.5 py-0.5 rounded-full font-bold text-[11px] bg-teal-500/25 text-teal-800 dark:text-teal-200 ml-1">
                Score: {latestEvaluation.score}/100 ({latestEvaluation.level})
              </span>
            </div>
          </div>
          <p className="text-muted-theme italic pl-9 sm:pl-0 text-[11px]">
            &ldquo;{latestEvaluation.critique}&rdquo;
          </p>
        </div>
      )}

      {/* Completion Notice Banner */}
      {sessionCompleted && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3 text-xs md:text-sm text-emerald-800 dark:text-emerald-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Socratic Session Successfully Logged!</p>
            <p>
              Your session duration and cognitive evidence were credited to your VRCF competency portfolio:
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {loggedComps.map((c) => (
                <span
                  key={c}
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-900 dark:text-emerald-100"
                >
                  +{c}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Model Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-surface border border-theme">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-theme uppercase tracking-wider mr-1">
            <Cpu className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>AI Model:</span>
          </div>
          <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 p-1 rounded-xl border border-theme">
            <button
              type="button"
              onClick={() => handleSelectModel("claude")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedModel === "claude"
                  ? "bg-amber-500 text-white shadow-sm font-semibold"
                  : "text-muted-theme hover:text-primary-theme"
              }`}
              title="Anthropic Claude 3.5 Sonnet — deep Socratic inquiry and analytical reasoning"
            >
              <Sparkles className="w-3 h-3" />
              <span>Claude 3.5 Sonnet</span>
            </button>
            <button
              type="button"
              onClick={() => handleSelectModel("gemini")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedModel === "gemini"
                  ? "bg-teal-600 dark:bg-teal-400 text-white dark:text-[#0B1413] shadow-sm font-semibold"
                  : "text-muted-theme hover:text-primary-theme"
              }`}
              title="Google Gemini Flash — fast responsive model"
            >
              <Bot className="w-3 h-3" />
              <span>Gemini Flash</span>
            </button>
          </div>
        </div>

        <div className="text-[11px] text-muted-theme">
          Active Engine: <strong className="text-primary-theme">{selectedModel === "claude" ? "Anthropic Claude" : "Google Gemini"}</strong>
        </div>
      </div>

      {/* Mode Selector Pill Buttons */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-theme uppercase tracking-wider">
            Inquiry Mode
          </span>
          <span className="text-[11px] text-muted-theme italic hidden sm:inline">
            {TUTOR_MODES.find((m) => m.mode === currentMode)?.description}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {TUTOR_MODES.map((item) => (
            <button
              key={item.mode}
              onClick={() => handleModeChange(item.mode)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all cursor-pointer ${
                currentMode === item.mode
                  ? "bg-teal-600 dark:bg-teal-400 text-white dark:text-[#0B1413] shadow-sm font-semibold"
                  : "bg-surface border border-theme text-muted-theme hover:text-primary-theme"
              }`}
            >
              {item.mode}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area Container */}
      <div className="card-theme flex flex-col h-[560px] overflow-hidden">
        {/* Chat Messages Log */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4">
          {messages.map((msg, index) => {
            const isUser = msg.role === "student";
            return (
              <div
                key={index}
                className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
              >
                <div className="flex items-center gap-2 mb-1 text-[11px] text-muted-theme font-medium px-1">
                  <span>{isUser ? "You" : "VRCF Tutor"}</span>
                  {!isUser && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold ${
                        (msg.provider || selectedModel) === "claude"
                          ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                          : "bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30"
                      }`}
                    >
                      {(msg.provider || selectedModel) === "claude" ? "Claude 3.5" : "Gemini"}
                    </span>
                  )}
                </div>

                <div
                  className={`max-w-[85%] sm:max-w-[75%] p-4 text-sm leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? "chat-bubble-user"
                      : "chat-bubble-ai"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2 mb-1 text-[11px] text-muted-theme font-medium px-1">
                <span>VRCF Tutor</span>
              </div>
              <div className="chat-bubble-ai p-4 flex items-center gap-2 text-xs text-muted-theme">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-600 dark:text-teal-400" />
                <span>Formulating Socratic question...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-theme bg-surface/50">
          <form onSubmit={handleSendMessage} className="flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="State your reasoning, hypothesis, or response..."
              disabled={loading}
              className="flex-1 input-theme text-sm py-3"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="btn-primary py-3 px-5 shrink-0 flex items-center gap-2 shadow-sm"
            >
              <span>Send</span>
              <Send className="w-4 h-4" />
            </button>
          </form>

          <p className="text-[11px] text-muted-theme text-center mt-2.5">
            The tutor will not provide answers directly. Share your best hypothesis or current thought to advance the dialogue.
          </p>
        </div>
      </div>

      {/* Slide-Over Drawer: Chat History */}
      {showHistoryDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-surface h-full border-l border-theme p-6 flex flex-col shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-theme">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <h3 className="font-bold text-base text-primary-theme">Inquiry History</h3>
                <span className="text-xs text-muted-theme font-medium">({savedSessions.length})</span>
              </div>
              <button
                onClick={() => setShowHistoryDrawer(false)}
                className="btn-tertiary p-1.5 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between gap-2">
              <button
                onClick={handleStartNewInquiry}
                className="btn-primary text-xs py-2 px-3 flex items-center gap-1.5 flex-1 justify-center"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Start New Inquiry</span>
              </button>
              {savedSessions.length > 0 && (
                <button
                  onClick={handleClearAllHistory}
                  className="btn-tertiary text-xs py-2 px-3 text-red-600 dark:text-red-400 flex items-center gap-1 hover:bg-red-500/10"
                  title="Clear all chat history to free storage"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All History</span>
                </button>
              )}
            </div>

            <p className="text-[11px] text-muted-theme">
              Previous inquiry dialogues stored locally. Delete individual sessions or clear all history to free device storage.
            </p>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {savedSessions.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-theme border border-dashed border-theme rounded-2xl">
                  <History className="w-8 h-8 mx-auto mb-2 opacity-30 text-teal-600" />
                  <p className="font-semibold text-primary-theme">No chat history</p>
                  <p className="mt-1">All past conversations cleared or none started yet.</p>
                </div>
              ) : (
                savedSessions.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => handleResumeSession(s)}
                    className={`p-3.5 rounded-2xl border border-theme transition-all cursor-pointer hover:border-teal-500/40 flex items-start justify-between gap-2.5 ${
                      s.id === sessionId
                        ? "bg-teal-500/10 border-teal-500/40 shadow-sm"
                        : "bg-black/[0.01] dark:bg-white/[0.01]"
                    }`}
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-500/15 text-teal-700 dark:text-teal-300">
                          {s.mode}
                        </span>
                        {s.criticalThinkingScore && (
                          <span className="text-[10px] font-bold text-teal-800 dark:text-teal-200 bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-full">
                            🧠 {s.criticalThinkingScore}/100
                          </span>
                        )}
                        <span className="text-[10px] text-muted-theme">
                          {new Date(s.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-primary-theme truncate">
                        {s.title}
                      </p>
                      <p className="text-[11px] text-muted-theme">
                        {s.messages.length} messages
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteSession(s.id, e)}
                      className="p-1.5 text-muted-theme hover:text-red-600 transition-colors cursor-pointer shrink-0"
                      title="Delete this inquiry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StudentTutorPage() {
  return (
    <DashboardShell allowedRole="student">
      <Suspense
        fallback={
          <div className="p-12 text-center text-muted-theme">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-teal-600" />
          </div>
        }
      >
        <TutorChatContent />
      </Suspense>
    </DashboardShell>
  );
}
