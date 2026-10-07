"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import DashboardShell from "@/components/layout/DashboardShell";
import { useAuth } from "@/lib/auth-context";
import { getStudentVisionBoard } from "@/lib/student-data";
import { TutorMode, ChatMessage, VisionBoard } from "@/types";
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
} from "lucide-react";

const TUTOR_MODES: { mode: TutorMode; description: string }[] = [
  { mode: "Learn", description: "Build understanding from foundational principles" },
  { mode: "Practice", description: "Work through guided scenarios and exercises" },
  { mode: "Challenge Me", description: "Tackle harder, open-ended problem formulations" },
  { mode: "Explain Back", description: "Teach the concept to probe hidden assumptions" },
  { mode: "Career Connect", description: "Link ideas explicitly to your stated career goals" },
];

function TutorChatContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const studentId = user?.uid || "student-default";

  const preloadedTopic = searchParams.get("topic") || "";
  const preloadedTaskId = searchParams.get("taskId") || "";

  const [visionBoard, setVisionBoard] = useState<VisionBoard | null>(null);
  const [currentMode, setCurrentMode] = useState<TutorMode>("Learn");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [loggedComps, setLoggedComps] = useState<string[]>([]);
  const [sessionId, setSessionId] = useState(`session-${Date.now()}`);

  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const handleModeChange = (mode: TutorMode) => {
    if (mode === currentMode) return;
    setCurrentMode(mode);

    // Provide a framing transition prompt
    const transitionNotice: ChatMessage = {
      role: "tutor",
      text: `[Switched mode to ${mode}] How would you approach this problem under our ${mode.toLowerCase()} lens? Give me your initial hypothesis.`,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, transitionNotice]);
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
          course: visionBoard?.course,
          focusArea: visionBoard?.focusArea,
          careerGoal: visionBoard?.careerGoal,
          sessionId,
          topic: preloadedTopic || "Socratic Inquiry",
        }),
      });

      if (!res.ok) {
        throw new Error("Tutor could not respond");
      }

      const data = await res.json();
      const tutorReply: ChatMessage = {
        role: "tutor",
        text: data.text,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, tutorReply]);
    } catch (err: any) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "tutor",
          text: "I paused while evaluating your response. Please check your internet connection or try rephrasing your thought.",
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
      setLoggedComps(data.loggedCompetencies || ["Critical Thinking", "Analytical Thinking"]);
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

        <div className="flex items-center gap-3">
          <button
            onClick={handleCompleteSession}
            disabled={messages.length < 2 || sessionCompleted}
            className="btn-secondary text-xs py-2 px-4 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>{sessionCompleted ? "Session Logged" : "Complete & Log Session"}</span>
          </button>
        </div>
      </div>

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
