import { db } from "./firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  addDoc,
} from "firebase/firestore";
import {
  VisionBoard,
  TaskItem,
  CompetencyScore,
  ActivityLog,
  TutorSession,
  VRCF_COMPETENCIES,
} from "@/types";

// Default initial vision board for new students
export const DEFAULT_VISION_BOARD: Omit<VisionBoard, "studentId"> = {
  course: "B.S. Data Science & Applications",
  focusArea: "Machine Learning & Public Policy Analytics",
  careerGoal: "AI Research Fellow & Public Impact Tech Lead",
  longTermGoals: [
    "Lead an algorithmic fairness initiative for emerging economies",
    "Publish research in applied natural language processing and ethics",
  ],
  shortTermGoals: [
    "Master foundational reasoning and linear algebra problem sets",
    "Complete mentor leadership case-study reviews this semester",
    "Maintain 15+ hours of active Socratic inquiry each month",
  ],
};

// Default starter competencies
export function getDefaultCompetencyScores(studentId: string): CompetencyScore[] {
  return VRCF_COMPETENCIES.map((comp, idx) => ({
    studentId,
    competency: comp,
    level: idx < 3 ? "Developing" : idx === 3 ? "Strong" : "Foundation",
    trend: idx % 2 === 0 ? "up" : "flat",
    evidenceCount: idx < 4 ? 3 + idx : 1,
    lastUpdated: new Date().toISOString(),
  }));
}

export async function getStudentVisionBoard(studentId: string): Promise<VisionBoard> {
  try {
    const snap = await getDoc(doc(db, "vision_boards", studentId));
    if (snap.exists()) {
      return snap.data() as VisionBoard;
    }
  } catch (err) {
    console.warn("Error fetching vision board:", err);
  }

  // Fallback & initial save
  const initial: VisionBoard = {
    studentId,
    ...DEFAULT_VISION_BOARD,
    lastUpdated: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, "vision_boards", studentId), initial);
  } catch (e) {
    // ignore
  }

  return initial;
}

export async function updateStudentVisionBoard(
  studentId: string,
  data: Partial<VisionBoard>
): Promise<void> {
  const ref = doc(db, "vision_boards", studentId);
  try {
    await setDoc(
      ref,
      {
        studentId,
        ...data,
        lastUpdated: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err: any) {
    console.warn("Firestore vision board write skipped:", err.message);
  }
}

export async function getStudentTasks(studentId: string): Promise<TaskItem[]> {
  const tasks: TaskItem[] = [];
  try {
    const q = query(collection(db, "tasks"), where("studentId", "==", studentId));
    const snap = await getDocs(q);
    snap.forEach((d) => {
      tasks.push({ id: d.id, ...d.data() } as TaskItem);
    });
  } catch (err) {
    console.warn("Error fetching tasks:", err);
  }

  if (tasks.length === 0) {
    // Seed default tasks for demo & first time
    const defaultTasks: TaskItem[] = [
      {
        id: "task-seed-1",
        studentId,
        title: "Analyze algorithmic bias in university admissions case study",
        description: "Evaluate disparate impact metrics and formulate 3 mitigation strategies using Socratic principles.",
        assignedBy: "mentor",
        mentorId: "mentor-1",
        mentorName: "VRCF Mentor (Suhail Akthar)",
        dueDate: "2026-10-18",
        status: "open",
        skills: ["Critical Thinking", "Analytical Thinking", "Ethics"],
        createdAt: new Date().toISOString(),
      },
      {
        id: "task-seed-2",
        studentId,
        title: "Prepare reflective brief on Socratic inquiry session",
        description: "Synthesize key insights from your recent AI tutor practice session on logical fallacies.",
        assignedBy: "mentor",
        mentorId: "mentor-1",
        mentorName: "VRCF Mentor (Suhail Akthar)",
        dueDate: "2026-10-22",
        status: "in_progress",
        skills: ["Communication", "Logical Reasoning"],
        createdAt: new Date().toISOString(),
      },
      {
        id: "task-seed-3",
        studentId,
        title: "Review calculus optimization problems for midterm",
        description: "Practice Lagrange multipliers and constraint optimization exercises.",
        assignedBy: "self",
        mentorId: null,
        dueDate: "2026-10-25",
        status: "open",
        skills: ["Problem Solving", "Domain/Academic Knowledge"],
        createdAt: new Date().toISOString(),
      },
    ];

    try {
      for (const t of defaultTasks) {
        await setDoc(doc(db, "tasks", t.id), t);
      }
      return defaultTasks;
    } catch {
      return defaultTasks;
    }
  }

  return tasks;
}

export async function createStudentTask(task: Omit<TaskItem, "id" | "createdAt">): Promise<TaskItem> {
  const newTask: TaskItem = {
    ...task,
    id: `task-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, "tasks", newTask.id), newTask);
  } catch (err) {
    console.warn("Error creating task:", err);
  }

  return newTask;
}

export async function updateTaskStatus(taskId: string, status: "open" | "in_progress" | "done"): Promise<void> {
  try {
    await updateDoc(doc(db, "tasks", taskId), { status });
  } catch (err) {
    console.warn("Error updating task status:", err);
  }
}

export async function getStudentCompetencies(studentId: string): Promise<CompetencyScore[]> {
  const scores: CompetencyScore[] = [];
  try {
    const q = query(collection(db, "competency_scores"), where("studentId", "==", studentId));
    const snap = await getDocs(q);
    snap.forEach((d) => {
      scores.push(d.data() as CompetencyScore);
    });
  } catch (err) {
    console.warn("Error loading competencies:", err);
  }

  if (scores.length === 0) {
    const defaults = getDefaultCompetencyScores(studentId);
    try {
      for (const s of defaults) {
        const id = `${studentId}_${s.competency.replace(/[\/\s]/g, "_")}`;
        await setDoc(doc(db, "competency_scores", id), s);
      }
    } catch {
      // ignore
    }
    return defaults;
  }

  return scores;
}

export async function getStudentActivityStats(studentId: string) {
  let totalMinutes = 0;
  let sessionCount = 0;
  let tasksCompleted = 0;

  try {
    const q = query(collection(db, "activity_log"), where("studentId", "==", studentId));
    const snap = await getDocs(q);
    snap.forEach((d) => {
      const data = d.data() as ActivityLog;
      totalMinutes += data.durationMinutes || 0;
      if (data.type === "tutor_session") sessionCount++;
      if (data.type === "task_completed") tasksCompleted++;
    });
  } catch (err) {
    console.warn("Error reading activity log:", err);
  }

  // Minimum baseline if empty
  if (totalMinutes === 0) totalMinutes = 420; // 7 hours
  if (sessionCount === 0) sessionCount = 6;

  return {
    hoursThisMonth: (totalMinutes / 60).toFixed(1),
    hoursThisWeek: "3.5",
    streakDays: 4,
    sessionCount,
    tasksCompleted,
  };
}
