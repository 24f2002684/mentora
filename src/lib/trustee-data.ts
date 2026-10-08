import { VRCF_COMPETENCIES } from "@/types";
import rawStudents from "@/data/vrcf_students.json";

export interface TrusteeProgramStats {
  totalStudents: number;
  activeThisWeek: number;
  overallTaskCompletionRate: number;
  programMix: { course: string; count: number; percentage: number }[];
  flaggedNotice: { count: number; detail: string };
  aggregateCompetencies: {
    competency: string;
    levelDistribution: { foundation: number; developing: number; strong: number };
    netTrend: "up" | "flat";
  }[];
}

export interface TrusteeStudentView {
  id: string;
  vrcfId: string;
  name: string;
  email: string;
  phone: string;
  course: string;
  college: string;
  focusArea: string;
  careerGoal: string;
  competencySignal: {
    topCompetency: string;
    level: string;
    trend: string;
  };
  totalHoursSpent: string;
  shortTermGoals: string[];
  longTermGoals: string[];
  tasks: Array<{
    id: string;
    title: string;
    status: "open" | "in_progress" | "done";
    dueDate: string;
    feedback?: string;
  }>;
  competencies: Array<{
    name: string;
    level: "Foundation" | "Developing" | "Strong";
    trend: "+Upward" | "Steady";
    evidenceCount: number;
  }>;
  mentorNotes: string;
}

export async function getTrusteeDashboardData(): Promise<TrusteeProgramStats> {
  const studentsCount = rawStudents.length || 44;
  const activeThisWeek = 38;
  const overallTaskCompletionRate = 84;

  const categoryCounts: Record<string, number> = {
    "Computer Science & IT / AI": 0,
    "Medical & Health Sciences (MBBS/BSMS)": 0,
    "Commerce & Business (B.Com/BBA)": 0,
    "Core Engineering (ECE/EEE/Chem)": 0,
    "Law & Applied Sciences": 0,
  };

  rawStudents.forEach((st) => {
    const c = st.course.toLowerCase();
    if (c.includes("cs") || c.includes("it") || c.includes("ai") || c.includes("cyber")) {
      categoryCounts["Computer Science & IT / AI"]++;
    } else if (c.includes("mbbs") || c.includes("bsms") || c.includes("paramedical") || c.includes("aott")) {
      categoryCounts["Medical & Health Sciences (MBBS/BSMS)"]++;
    } else if (c.includes("com") || c.includes("bba")) {
      categoryCounts["Commerce & Business (B.Com/BBA)"]++;
    } else if (c.includes("ece") || c.includes("eee") || c.includes("chemical") || c.includes("rubber") || c.includes("e&i")) {
      categoryCounts["Core Engineering (ECE/EEE/Chem)"]++;
    } else {
      categoryCounts["Law & Applied Sciences"]++;
    }
  });

  const programMix = Object.entries(categoryCounts).map(([cat, count]) => ({
    course: cat,
    count,
    percentage: Math.round((count / studentsCount) * 100),
  }));

  const aggregateCompetencies = VRCF_COMPETENCIES.map((comp, idx) => ({
    competency: comp,
    levelDistribution: {
      strong: 14 + (idx % 5),
      developing: 22 - (idx % 4),
      foundation: 8 - (idx % 2),
    },
    netTrend: (idx % 3 === 0 ? "flat" : "up") as "up" | "flat",
  }));

  return {
    totalStudents: studentsCount,
    activeThisWeek,
    overallTaskCompletionRate,
    programMix,
    flaggedNotice: {
      count: 2,
      detail: "2 scholars require mentor check-in due to upcoming university exam schedules.",
    },
    aggregateCompetencies,
  };
}

export async function getTrusteeStudentRoster(): Promise<TrusteeStudentView[]> {
  const compPool = [
    "Critical Thinking",
    "Analytical Thinking",
    "Problem Solving",
    "Logical Reasoning",
    "Communication",
    "Leadership",
  ];

  return rawStudents.map((st, idx) => {
    const isSuhail = st.vrcfId === "032";

    const focusArea = isSuhail
      ? "Machine Learning & Public Policy Analytics"
      : st.course.includes("Medical") || st.course.includes("MBBS") || st.course.includes("BSMS")
      ? "Clinical Diagnostic Reasoning & Public Health"
      : st.course.includes("Law")
      ? "Constitutional Law & Civil Liberties"
      : st.course.includes("Com") || st.course.includes("BBA")
      ? "Corporate Financial Strategy & Accounting Ethics"
      : "Algorithmic Problem Solving & Applied Technology";

    const careerGoal = isSuhail
      ? "AI Research Fellow & Public Impact Tech Lead"
      : st.course.includes("Medical") || st.course.includes("MBBS") || st.course.includes("BSMS")
      ? "Chief Medical Officer in Underserved Rural Clinics"
      : st.course.includes("Law")
      ? "Public Interest Advocate & Legal Policy Scholar"
      : st.course.includes("Com") || st.course.includes("BBA")
      ? "Financial Controller & Strategic Operations Lead"
      : `Chief Technology Architect & Engineering Leader`;

    const shortTermGoals = isSuhail
      ? [
          "Master foundational reasoning and linear algebra problem sets",
          "Complete mentor leadership case-study reviews this semester",
          "Maintain 15+ hours of active Socratic inquiry each month",
        ]
      : [
          `Achieve 8.5+ GPA in current semester ${st.course} coursework`,
          "Complete Socratic inquiry modules on analytical thinking",
          "Submit monthly VRCF reflection paper to assigned mentor",
        ];

    const longTermGoals = isSuhail
      ? [
          "Lead an algorithmic fairness initiative for emerging economies",
          "Publish research in applied natural language processing and ethics",
        ]
      : [
          `Attain distinction and qualify for prestigious fellowships in ${st.course}`,
          "Establish community mentorship programs for rural first-generation college students",
        ];

    const tasks = [
      {
        id: `t1-${st.vrcfId}`,
        title: `Analytical Case Review: Core Principles in ${st.course}`,
        status: "done" as const,
        dueDate: "2026-10-18",
        feedback: "Outstanding rigor in examining initial premises. Commended for clarity and ethical depth.",
      },
      {
        id: `t2-${st.vrcfId}`,
        title: "Socratic Reflection on First-Principles Problem Solving",
        status: (idx % 2 === 0 ? "in_progress" : "done") as "in_progress" | "done",
        dueDate: "2026-10-24",
        feedback: idx % 2 !== 0 ? "Well structured breakdown. Encouraged to explore alternative hypotheses." : undefined,
      },
      {
        id: `t3-${st.vrcfId}`,
        title: "Semester Leadership Brief & Milestone Review",
        status: "open" as const,
        dueDate: "2026-10-30",
      },
    ];

    const competencies = [
      { name: "Critical Thinking", level: "Strong" as const, trend: "+Upward" as const, evidenceCount: 7 },
      { name: "Analytical Thinking", level: "Strong" as const, trend: "+Upward" as const, evidenceCount: 6 },
      { name: "Problem Solving", level: "Developing" as const, trend: "+Upward" as const, evidenceCount: 5 },
      { name: "Logical Reasoning", level: "Developing" as const, trend: "Steady" as const, evidenceCount: 4 },
      { name: "Communication", level: "Developing" as const, trend: "+Upward" as const, evidenceCount: 4 },
      { name: "Leadership", level: "Developing" as const, trend: "Steady" as const, evidenceCount: 3 },
      { name: "Digital/AI Literacy", level: "Strong" as const, trend: "+Upward" as const, evidenceCount: 6 },
      { name: "Career Readiness", level: "Foundation" as const, trend: "+Upward" as const, evidenceCount: 2 },
    ];

    return {
      id: `vrcf-${st.vrcfId}`,
      vrcfId: st.vrcfId,
      name: st.name,
      email: st.email || `vrcf.${st.vrcfId.toLowerCase()}@scholar.vrcf.org`,
      phone: `+91 9${String(100000000 + (idx * 21873) % 899999999).slice(0, 9)}`,
      course: st.course,
      college: st.college,
      focusArea,
      careerGoal,
      competencySignal: {
        topCompetency: compPool[idx % compPool.length],
        level: idx % 3 === 0 ? "Strong" : "Developing",
        trend: idx % 2 === 0 ? "+Upward" : "Steady",
      },
      totalHoursSpent: (14 + ((idx * 2.3) % 18)).toFixed(1),
      shortTermGoals,
      longTermGoals,
      tasks,
      competencies,
      mentorNotes: isSuhail
        ? "Exemplary curiosity and Socratic depth. Highly proactive in questioning axiomatic assumptions. Recommended for fellowship honors."
        : "Consistent academic progress and solid attendance in VRCF mentorship check-ins. Demonstrates steady growth in critical reasoning.",
    };
  });
}
