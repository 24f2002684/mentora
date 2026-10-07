import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, addDoc, collection, updateDoc, increment } from "firebase/firestore";
import { CompetencyScore, TutorMode, VRCF_COMPETENCIES } from "@/types";

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
      
      // 1. Log or update tutor session
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

        // 2. Log activity
        await addDoc(collection(db, "activity_log"), {
          studentId: session.uid,
          type: "tutor_session",
          durationMinutes: 15,
          timestamp: new Date().toISOString(),
          details: `Completed ${mode} session on ${topic}`,
        });

        // 3. Update qualitative competency scores (Foundation / Developing / Strong)
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
      } catch (err) {
        console.warn("Error logging session completion:", err);
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
Remember: Keep messages short, engaging, and Socratic. Do NOT give direct answers. Push the student to formulate hypotheses and test their reasoning.`;

    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicKey) {
      return NextResponse.json({ error: "Missing ANTHROPIC_API_KEY on server" }, { status: 500 });
    }

    const anthropic = new Anthropic({
      apiKey: anthropicKey,
    });

    // Format messages for Anthropic Claude
    const formattedMessages: Array<{ role: "user" | "assistant"; content: string }> = messages.map((m: any) => ({
      role: (m.role === "tutor" ? "assistant" : "user") as "user" | "assistant",
      content: String(m.text || m.content || ""),
    }));

    // Choose Claude model (claude-3-5-sonnet or claude-3-haiku)
    const claudeModel = "claude-3-5-sonnet-20241022";

    const aiResponse = await anthropic.messages.create({
      model: claudeModel,
      max_tokens: 1024,
      system: systemPrompt,
      messages: formattedMessages,
    });

    const replyContent = aiResponse.content
      .filter((block) => block.type === "text")
      .map((block: any) => block.text)
      .join("\n\n");

    return NextResponse.json({
      role: "tutor",
      text: replyContent,
      mode,
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
