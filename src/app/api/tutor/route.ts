import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, addDoc, collection, updateDoc } from "firebase/firestore";
import { CompetencyScore, TutorMode } from "@/types";

export const maxDuration = 60;

function getStudentSession(req: NextRequest) {
  const sessionCookie = req.cookies.get("mentora_session");
  if (!sessionCookie || !sessionCookie.value) return null;
  try {
    const session = JSON.parse(sessionCookie.value);
    if (session.role === "student") {
      return session;
    }
  } catch (e) {
    return null;
  }
  return null;
}

const SYSTEM_PROMPT_BASE = `You are the VRCF Tutor, a Socratic mentor for a college student supported by the VRCF Foundation. Your job is NOT to give direct answers. Follow this loop: Diagnose → Question → Attempt → Probe → Hint → Re-attempt → Apply → Reflect. Always start by asking the student what they already think or know, even if they say they don't know — push them to give their best guess first. When they answer, probe their reasoning with a follow-up question before confirming or correcting. Only give a hint (never the full answer) if they are stuck after a genuine attempt. Once a concept is grasped, ask them to apply it to a new situation or to their own career goal (draw on their stated course, focus area, and career goal from their profile). End sessions by asking them to reflect on what they learned in their own words. Keep tone warm, encouraging, and conversational — never robotic or bored. Never lecture in long paragraphs; keep each message short and end with a question or a concrete next step. Adapt your questions to the current mode: Learn = build understanding from scratch; Practice = give exercises; Challenge Me = harder, open-ended problems; Explain Back = have the student teach the concept back to you and probe gaps; Career Connect = connect the current topic explicitly to their stated career goal.`;

async function callGemini(apiKey: string, systemPrompt: string, messages: any[]): Promise<string> {
  const models = ["gemini-flash-latest", "gemini-flash-lite-latest"];

  const contents = messages.map((m: any) => ({
    role: m.role === "tutor" ? "model" : "user",
    parts: [{ text: String(m.text || m.content || "") }],
  }));

  let lastError: Error | null = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Gemini ${model} failed (${res.status}): ${errText}`);
      }

      const data = await res.json();
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`Gemini model ${model} attempt failed, trying next fallback:`, err.message);
    }
  }

  throw lastError || new Error("All Gemini models failed");
}

async function callClaude(apiKey: string, systemPrompt: string, messages: any[]): Promise<string> {
  const anthropic = new Anthropic({ apiKey });
  const formattedMessages: Array<{ role: "user" | "assistant"; content: string }> = messages.map((m: any) => ({
    role: (m.role === "tutor" ? "assistant" : "user") as "user" | "assistant",
    content: String(m.text || m.content || ""),
  }));

  const aiResponse = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    system: systemPrompt,
    messages: formattedMessages,
  });

  return aiResponse.content
    .filter((block) => block.type === "text")
    .map((block: any) => block.text)
    .join("\n\n");
}

export async function POST(req: NextRequest) {
  try {
    const session = getStudentSession(req);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. AI Tutor is accessible only to students." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      messages,
      mode = "Learn",
      course = "B.S. Data Science & Applications",
      focusArea = "Machine Learning & Public Policy Analytics",
      careerGoal = "AI Research Fellow & Public Impact Tech Lead",
      sessionId,
      isEnding = false,
      topic = "General Socratic Inquiry",
    } = body;

    // Handle session conclusion & logging to Firestore
    if (isEnding && sessionId) {
      const competenciesTouched = determineCompetencies(mode, topic);

      try {
        await setDoc(
          doc(db, "tutor_sessions", sessionId),
          {
            studentId: session.uid,
            mode,
            competenciesTouched,
            endedAt: new Date().toISOString(),
          },
          { merge: true }
        );

        await addDoc(collection(db, "activity_log"), {
          studentId: session.uid,
          type: "tutor_session",
          durationMinutes: 15,
          timestamp: new Date().toISOString(),
          details: `Completed ${mode} session on ${topic}`,
        });

        for (const comp of competenciesTouched) {
          const compId = `${session.uid}_${comp.replace(/[\/\s]/g, "_")}`;
          const compRef = doc(db, "competency_scores", compId);
          const compSnap = await getDoc(compRef);

          if (compSnap.exists()) {
            const data = compSnap.data() as CompetencyScore;
            const newCount = (data.evidenceCount || 1) + 1;
            const newLevel = newCount >= 6 ? "Strong" : newCount >= 3 ? "Developing" : "Foundation";
            await updateDoc(compRef, {
              evidenceCount: newCount,
              level: newLevel,
              trend: "up",
              lastUpdated: new Date().toISOString(),
            });
          } else {
            await setDoc(compRef, {
              studentId: session.uid,
              competency: comp,
              level: "Developing",
              trend: "up",
              evidenceCount: 2,
              lastUpdated: new Date().toISOString(),
            });
          }
        }
      } catch (err: any) {
        console.warn("Session logging to Firestore skipped (permissions or network):", err.message);
      }

      return NextResponse.json({
        success: true,
        loggedCompetencies: competenciesTouched,
      });
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages array required" }, { status: 400 });
    }

    // Construct enriched system prompt with student context and mode
    const systemPrompt = `${SYSTEM_PROMPT_BASE}

[STUDENT PROFILE CONTEXT]
- Name: ${session.name}
- Academic Degree / Course: ${course}
- Focus Area: ${focusArea}
- Stated Career Goal: ${careerGoal}

[CURRENT TUTOR MODE]
Mode: "${mode}"
Remember: Keep messages short, engaging, and Socratic. Do NOT give direct answers. Push the student to formulate hypotheses and test their reasoning.

[CRITICAL THINKING EVALUATION]
Evaluate how the student thinks critically in this turn (challenging assumptions, logical consistency, analytical depth).
At the very end of your response, append an evaluation comment on a new line:
<!-- EVAL: {"score": 88, "level": "Strong", "critique": "Solid inquiry with well-formulated counter-hypothesis."} -->`;

    let replyContent: string | null = null;
    let providerUsed: "gemini" | "claude" = "gemini";

    // 1. PRIMARY: Google Gemini API (Free tier model)
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      try {
        replyContent = await callGemini(geminiKey, systemPrompt, messages);
        providerUsed = "gemini";
      } catch (geminiError: any) {
        console.warn("Primary Gemini provider failed, attempting Claude fallback:", geminiError.message);
      }
    }

    // 2. SECONDARY: Anthropic Claude API fallback
    if (!replyContent) {
      const claudeKey = process.env.ANTHROPIC_API_KEY;
      if (claudeKey) {
        try {
          replyContent = await callClaude(claudeKey, systemPrompt, messages);
          providerUsed = "claude";
        } catch (claudeError: any) {
          console.error("Secondary Claude provider failed as well:", claudeError.message);
        }
      }
    }

    if (!replyContent) {
      throw new Error(
        "Tutor service temporarily unavailable. Both Gemini and Claude APIs failed or are unconfigured."
      );
    }

    let criticalThinkingScore = 85;
    let criticalThinkingLevel = "Developing";
    let criticalThinkingCritique = "Demonstrated active Socratic engagement and reflective inquiry.";

    const evalMatch = replyContent.match(/<!--\s*EVAL:\s*(\{.*?\})\s*-->/);
    if (evalMatch) {
      try {
        const parsed = JSON.parse(evalMatch[1]);
        if (parsed.score) criticalThinkingScore = Math.min(100, Math.max(50, Number(parsed.score)));
        if (parsed.level) criticalThinkingLevel = parsed.level;
        if (parsed.critique) criticalThinkingCritique = parsed.critique;
        replyContent = replyContent.replace(evalMatch[0], "").trim();
      } catch (e) {
        // ignore JSON parse error
      }
    }

    // Update student's critical thinking competency score in Firestore
    if (session?.uid) {
      try {
        const compId = `${session.uid}_Critical_Thinking`;
        const compRef = doc(db, "competency_scores", compId);
        const compSnap = await getDoc(compRef);
        if (compSnap.exists()) {
          const cData = compSnap.data() as CompetencyScore;
          await updateDoc(compRef, {
            evidenceCount: (cData.evidenceCount || 1) + 1,
            level: criticalThinkingLevel as any,
            trend: "up",
            lastUpdated: new Date().toISOString(),
          });
        }
      } catch (err: any) {
        console.warn("Competency update bypassed:", err.message);
      }
    }

    return NextResponse.json({
      role: "tutor",
      text: replyContent,
      mode,
      provider: providerUsed,
      evaluation: {
        score: criticalThinkingScore,
        level: criticalThinkingLevel,
        critique: criticalThinkingCritique,
      },
    });
  } catch (error: any) {
    console.error("AI Tutor endpoint error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate tutor response" },
      { status: 500 }
    );
  }
}

function determineCompetencies(mode: TutorMode, topic: string): string[] {
  const comps = new Set<string>(["Critical Thinking"]);

  if (mode === "Learn") {
    comps.add("Domain/Academic Knowledge");
  } else if (mode === "Practice") {
    comps.add("Problem Solving");
    comps.add("Analytical Thinking");
  } else if (mode === "Challenge Me") {
    comps.add("Logical Reasoning");
    comps.add("Innovative Thinking");
  } else if (mode === "Explain Back") {
    comps.add("Communication");
    comps.add("Logical Reasoning");
  } else if (mode === "Career Connect") {
    comps.add("Career Readiness");
    comps.add("Leadership");
  }

  return Array.from(comps);
}
