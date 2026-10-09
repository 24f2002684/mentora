import rawStudents from "@/data/vrcf_students.json";
import { getLocalTasks } from "./student-data";
import { UnifiedScholarProfile } from "@/components/profile/ScholarProfileModal";

export function getAllScholarProfiles(): UnifiedScholarProfile[] {
  const compPool = [
    "Critical Thinking",
    "Analytical Thinking",
    "Problem Solving",
    "Logical Reasoning",
    "Communication",
    "Leadership",
  ];

  const localTasks = typeof window !== "undefined" ? getLocalTasks() : [];

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
      : `Chief Technology Architect & Engineering Leader in ${st.course}`;

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

    // Match live tasks
    const matchedLocal = localTasks.filter(
      (t) =>
        t.studentId === `vrcf-${st.vrcfId}` ||
        t.studentId === st.vrcfId ||
        (st.email && t.studentEmail && t.studentEmail.toLowerCase() === st.email.toLowerCase())
    );

    const tasks = matchedLocal.map((ml) => ({
      id: ml.id,
      title: ml.title,
      status: ml.status as "open" | "in_progress" | "done",
      dueDate: ml.dueDate,
      feedback: ml.remarks || ml.feedback,
      grade: ml.grade,
      score: ml.score,
    }));

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
      phone: (st as any).phone || "",
      parentPhone: (st as any).parentPhone || "",
      cohort: (st as any).cohort || "Cohort 1",
      homeAddress: (st as any).homeAddress || "Tamil Nadu",
      district: (st as any).district || "Tamil Nadu",
      course: st.course,
      college: st.college,
      collegeLocation: (st as any).collegeLocation || "Tamil Nadu",
      yearOfStudy: (st as any).yearOfStudy || "3rd Year",
      totalYears: (st as any).totalYears || "3 Years",
      hostelOrDayScholar: (st as any).hostelOrDayScholar || "Dayscholar",
      tuitionFeeTerm: (st as any).tuitionFeeTerm || "Per Year",
      tuitionFeeAmount: (st as any).tuitionFeeAmount || "-",
      hostelFee: (st as any).hostelFee || "-",
      focusArea,
      careerGoal,
      totalHoursSpent: (14 + ((idx * 2.3) % 18)).toFixed(1),
      competencySignal: {
        topCompetency: compPool[idx % compPool.length],
        level: idx % 3 === 0 ? "Strong" : "Developing",
        trend: idx % 2 === 0 ? "+Upward" : "Steady",
      },
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

export function getScholarProfileByParam(param: string): UnifiedScholarProfile | undefined {
  const all = getAllScholarProfiles();
  const clean = param.trim().toLowerCase();
  return all.find(
    (s) =>
      s.id.toLowerCase() === clean ||
      s.vrcfId.toLowerCase() === clean ||
      `vrcf-${s.vrcfId}`.toLowerCase() === clean ||
      s.email.toLowerCase() === clean
  );
}
