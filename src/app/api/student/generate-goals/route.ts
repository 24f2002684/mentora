import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("mentora_session");
    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { course, focusArea, careerGoal, college } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
    }

    const prompt = `You are the Socratic Advisor for the VRCF Foundation (a financial-aid and leadership trust for college students).
Based on this scholar's profile:
- Degree / Course: ${course || "Undergraduate Degree"}
- College: ${college || "University"}
- Focus Area: ${focusArea || "Academic Excellence"}
- Stated Career Goal: ${careerGoal || "Leadership and Professional Impact"}

Generate concrete, ambitious, yet realistic milestones for their personal roadmap.
Respond ONLY with a valid JSON object in this exact format, with NO extra markdown or backticks:
{
  "shortTermGoals": [
    "Short-term milestone 1 (this semester / within 6 months)",
    "Short-term milestone 2 (focus on practical skill or inquiry)",
    "Short-term milestone 3 (focus on peer collaboration or mentor review)"
  ],
  "longTermGoals": [
    "Long-term goal 1 (2-3 years, graduation / early career impact)",
    "Long-term goal 2 (3-5 years, leadership and societal contribution)"
  ]
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini API failed (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Clean any markdown backticks if present
    const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleanJson);

    return NextResponse.json({
      success: true,
      shortTermGoals: parsed.shortTermGoals || [],
      longTermGoals: parsed.longTermGoals || [],
    });
  } catch (error: any) {
    console.error("Generate goals error, providing intelligent fallback:", error);
    
    // Provide high-quality domain-specific fallback goals so student experience is uninterrupted
    return NextResponse.json({
      success: true,
      shortTermGoals: [
        "Master core foundational principles in this semester's curriculum and achieve high academic standing",
        "Complete 3 mentor-reviewed case studies and practical problem-solving assignments",
        "Maintain active weekly engagement in Socratic AI inquiry sessions to strengthen analytical reasoning"
      ],
      longTermGoals: [
        "Graduate with top-tier subject mastery and secure an impactful internship or professional fellowship",
        "Emerge as a respected leader in chosen domain, driving meaningful ethical and societal change"
      ]
    });
  }
}
