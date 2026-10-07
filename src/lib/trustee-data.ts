import { db } from "./firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { VRCF_COMPETENCIES } from "@/types";

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
  name: string;
  email: string;
  course: string;
  focusArea: string;
  careerGoal: string;
  competencySignal: {
    topCompetency: string;
    level: string;
    trend: string;
  };
  totalHoursSpent: string;
}

export async function getTrusteeDashboardData(): Promise<TrusteeProgramStats> {
  const studentsCount = 18;
  const activeThisWeek = 15;
  const overallTaskCompletionRate = 82;

  const programMix = [
    { course: "B.S. Data Science & Applications", count: 8, percentage: 44 },
    { course: "B.Tech Computer Science & AI", count: 5, percentage: 28 },
    { course: "B.E. Electronics & Public Tech", count: 3, percentage: 17 },
    { course: "Economics & Computational Finance", count: 2, percentage: 11 },
  ];

  const aggregateCompetencies = VRCF_COMPETENCIES.map((comp, idx) => ({
    competency: comp,
    levelDistribution: {
      strong: 6 + (idx % 3),
      developing: 9 - (idx % 3),
      foundation: 3,
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
      detail: "2 scholars require mentor check-in due to overdue semester research briefs.",
    },
    aggregateCompetencies,
  };
}

export async function getTrusteeStudentRoster(): Promise<TrusteeStudentView[]> {
  const roster: TrusteeStudentView[] = [
    {
      id: "st-1",
      name: "VRCF Scholar (IITM)",
      email: "24f2002684@ds.study.iitm.ac.in",
      course: "B.S. Data Science & Applications",
      focusArea: "Machine Learning & Public Policy Analytics",
      careerGoal: "AI Research Fellow & Public Impact Tech Lead",
      competencySignal: {
        topCompetency: "Critical Thinking",
        level: "Developing",
        trend: "+Upward",
      },
      totalHoursSpent: "18.5",
    },
    {
      id: "st-2",
      name: "Aarav Sharma",
      email: "aarav.sharma@vrcf-scholar.org",
      course: "B.Tech Computer Science & AI",
      focusArea: "Distributed Systems & Security",
      careerGoal: "Infrastructure Engineer & Policy Fellow",
      competencySignal: {
        topCompetency: "Analytical Thinking",
        level: "Strong",
        trend: "+Upward",
      },
      totalHoursSpent: "24.0",
    },
    {
      id: "st-3",
      name: "Kavya Patel",
      email: "kavya.patel@vrcf-scholar.org",
      course: "Economics & Computational Finance",
      focusArea: "Econometrics & Algorithmic Governance",
      careerGoal: "Central Bank Quantitative Analyst",
      competencySignal: {
        topCompetency: "Problem Solving",
        level: "Developing",
        trend: "Steady",
      },
      totalHoursSpent: "14.2",
    },
    {
      id: "st-4",
      name: "Rohan Deshmukh",
      email: "rohan.deshmukh@vrcf-scholar.org",
      course: "B.S. Data Science & Applications",
      focusArea: "NLP & Digital Humanities",
      careerGoal: "Computational Linguistics Lead",
      competencySignal: {
        topCompetency: "Communication",
        level: "Strong",
        trend: "+Upward",
      },
      totalHoursSpent: "21.0",
    },
  ];

  return roster;
}
