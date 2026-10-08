import { db } from "./firebase";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  query,
  where,
  addDoc,
  updateDoc,
} from "firebase/firestore";
import { TaskItem, VRCF_COMPETENCIES, CompetencyLevel } from "@/types";
import rawStudents from "@/data/vrcf_students.json";
import {
  getLocalTasks,
  saveLocalTask,
  updateStudentCompetencyScore,
} from "./student-data";

export interface StudentSummary {
  id: string;
  vrcfId: string;
  name: string;
  email: string;
  course: string;
  college: string;
  careerGoal: string;
  focusArea: string;
  topTrend: string;
  signal: {
    type: "attention" | "warning" | "positive";
    text: string;
  };
  openTasksCount: number;
}

export async function getMentorStudents(mentorEmail: string): Promise<StudentSummary[]> {
  const compPool = [
    "Critical Thinking (+Upward)",
    "Analytical Thinking (+Upward)",
    "Problem Solving (+Upward)",
    "Logical Reasoning (Steady)",
    "Communication (+Upward)",
    "Leadership (Steady)",
  ];

  // Map from authentic VRCF students roster - ALL 44 students
  return rawStudents.map((st, idx) => ({
    id: `vrcf-${st.vrcfId}`,
    vrcfId: st.vrcfId,
    name: st.name,
    email: st.email || `vrcf.${st.vrcfId.toLowerCase()}@scholar.vrcf.org`,
    course: st.course,
    college: st.college,
    focusArea: `${st.course} & Socratic Practice`,
    careerGoal: st.vrcfId === "032"
      ? "AI Research Fellow & Public Impact Tech Lead"
      : `Excellence & Leadership in ${st.course}`,
    topTrend: compPool[idx % compPool.length],
    signal: {
      type: idx % 5 === 0 ? "attention" : idx % 2 === 0 ? "positive" : "positive",
      text: idx % 5 === 0
        ? "Midterm project inquiry check-in recommended"
        : idx % 2 === 0
        ? "Consistently high Socratic inquiry depth (+2 levels)"
        : "Steady engagement on weekly problem sets",
    },
    openTasksCount: (idx % 3) + 1,
  }));
}

export async function getMentorStats(mentorEmail: string) {
  const students = await getMentorStudents(mentorEmail);
  return {
    totalStudents: students.length,
    pendingReviews: 3,
    attentionRequiredCount: students.filter((s) => s.signal.type === "attention").length,
  };
}

export async function assignMentorTask(params: {
  studentId: string;
  studentName?: string;
  studentEmail?: string;
  mentorId: string;
  mentorName: string;
  title: string;
  description: string;
  dueDate: string;
  skills: string[];
}): Promise<TaskItem> {
  const taskId = `task-${Date.now()}`;
  const newTask: TaskItem = {
    id: taskId,
    studentId: params.studentId,
    studentName: params.studentName || "VRCF Scholar",
    studentEmail: params.studentEmail,
    title: params.title,
    description: params.description,
    assignedBy: "mentor",
    mentorId: params.mentorId,
    mentorName: params.mentorName,
    dueDate: params.dueDate,
    status: "open",
    skills: params.skills,
    createdAt: new Date().toISOString(),
  };

  // Save to unified local storage
  saveLocalTask(newTask);

  try {
    await setDoc(doc(db, "tasks", taskId), newTask);
  } catch (err: any) {
    console.warn("Firestore task write skipped (network/permissions):", err.message);
  }

  return newTask;
}

export async function getTasksAwaitingReview(): Promise<TaskItem[]> {
  const tasksMap = new Map<string, TaskItem>();

  // Load from local storage first
  const localList = getLocalTasks();
  for (const t of localList) {
    if (t.status === "done" || t.status === "in_progress" || (!t.feedback && !t.remarks)) {
      tasksMap.set(t.id, t);
    }
  }

  try {
    const snap = await getDocs(collection(db, "tasks"));
    snap.forEach((d) => {
      const data = d.data() as TaskItem;
      if (data.status === "done" || data.status === "in_progress" || (!data.feedback && !data.remarks)) {
        tasksMap.set(data.id, data);
      }
    });
  } catch (e: any) {
    console.warn("Firestore review read bypassed:", e.message);
  }

  if (tasksMap.size === 0) {
    const seeds: TaskItem[] = [
      {
        id: "review-seed-1",
        studentId: "vrcf-032",
        studentName: "Mohamed Rifai",
        studentEmail: "vrcf.032@scholar.vrcf.org",
        title: "Analyze algorithmic bias in university admissions case study",
        description: "Evaluated disparate impact metrics and formulated 3 mitigation strategies using Socratic principles.",
        submissionNotes: "Analyzed equalized odds vs demographic parity tradeoffs. Recommending calibrated thresholds.",
        assignedBy: "mentor",
        dueDate: "2026-10-18",
        status: "done",
        skills: ["Critical Thinking", "Analytical Thinking", "Innovative Thinking"],
        createdAt: new Date().toISOString(),
      },
      {
        id: "review-seed-2",
        studentId: "vrcf-029",
        studentName: "Pavithra M",
        studentEmail: "vrcf.029@scholar.vrcf.org",
        title: "Reflective brief on AI ethics & data governance",
        description: "Synthesized core arguments on data privacy tradeoffs in healthcare systems.",
        submissionNotes: "Drafted brief outlining differential privacy principles for hospital clinical data.",
        assignedBy: "mentor",
        dueDate: "2026-10-22",
        status: "in_progress",
        skills: ["Communication", "Logical Reasoning"],
        createdAt: new Date().toISOString(),
      },
      {
        id: "review-seed-3",
        studentId: "vrcf-005",
        studentName: "Sanjay Kumar S",
        studentEmail: "vrcf.005@scholar.vrcf.org",
        title: "Formal argument analysis on distributed consensus",
        description: "Deconstructed Paxos vs Raft failure modes using logical proof techniques.",
        submissionNotes: "Outlined state-machine replication invariants and network partition recovery.",
        assignedBy: "mentor",
        dueDate: "2026-10-25",
        status: "done",
        skills: ["Problem Solving", "Domain/Academic Knowledge", "Critical Thinking"],
        createdAt: new Date().toISOString(),
      },
    ];

    for (const s of seeds) {
      saveLocalTask(s);
      tasksMap.set(s.id, s);
    }
  }

  return Array.from(tasksMap.values());
}

export async function submitMentorFeedback(
  taskId: string,
  params: {
    feedback: string;
    grade?: string;
    score?: number;
    rating?: number;
    studentId?: string;
    skills?: string[];
    mentorName?: string;
  }
): Promise<void> {
  const updates: Partial<TaskItem> = {
    feedback: params.feedback,
    remarks: params.feedback,
    grade: params.grade || (params.score ? `${params.score}/100` : "A"),
    score: params.score || 88,
    rating: params.rating || 5,
    status: "done",
    reviewedAt: new Date().toISOString(),
    reviewedBy: params.mentorName || "VRCF Mentor",
  };

  // Update local storage task
  const localList = getLocalTasks();
  const existing = localList.find((t) => t.id === taskId);
  if (existing) {
    saveLocalTask({ ...existing, ...updates });
  }

  // Update student competencies based on grade & score
  const studentId = params.studentId || existing?.studentId;
  const skills = params.skills || existing?.skills || ["Critical Thinking", "Analytical Thinking"];

  if (studentId) {
    const level: CompetencyLevel = (params.score || 88) >= 85 || (params.rating || 5) >= 4 ? "Strong" : "Developing";
    for (const skill of skills) {
      await updateStudentCompetencyScore(studentId, skill, level, "up", 1);
    }
  }

  try {
    await updateDoc(doc(db, "tasks", taskId), updates);
  } catch (err: any) {
    console.warn("Firestore feedback write skipped:", err.message);
  }
}

