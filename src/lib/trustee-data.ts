import { VRCF_COMPETENCIES } from "@/types";
import rawStudents from "@/data/vrcf_students.json";
import { getLocalTasks } from "./student-data";

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

import { getAllScholarProfiles } from "./scholar-roster";
import { UnifiedScholarProfile } from "@/components/profile/ScholarProfileModal";

export type TrusteeStudentView = UnifiedScholarProfile;

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
  return getAllScholarProfiles();
}
