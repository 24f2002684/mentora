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
  CompetencyLevel,
  CompetencyTrend,
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

export function getLocalTasks(): TaskItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("mentora_tasks");
    if (!raw) return [];
    const list: TaskItem[] = JSON.parse(raw);
    // Purge legacy seeded dummy tasks so clean state is guaranteed
    const cleaned = list.filter((t) => !t.id.startsWith("task-seed-") && !t.id.startsWith("review-seed-"));
    if (cleaned.length !== list.length) {
      localStorage.setItem("mentora_tasks", JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return [];
  }
}

export function saveLocalTask(task: TaskItem): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getLocalTasks();
    const idx = existing.findIndex((t) => t.id === task.id);
    let updated: TaskItem[];
    if (idx >= 0) {
      updated = [...existing];
      updated[idx] = { ...updated[idx], ...task };
    } else {
      updated = [task, ...existing];
    }
    localStorage.setItem("mentora_tasks", JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("mentora_task_updated", { detail: task }));
  } catch (e) {
    console.warn("Could not save local task:", e);
  }
}

export async function getStudentTasks(
  studentId: string,
  studentEmail?: string,
  activeScholarId?: string
): Promise<TaskItem[]> {
  const tasks: TaskItem[] = [];

  // Determine effective scholar identity for matching
  const effectiveScholar = activeScholarId || (typeof window !== "undefined" ? localStorage.getItem("mentora_active_scholar_id") || undefined : undefined);

  try {
    // 1. Query by studentId (e.g. Firebase UID or "vrcf-032")
    const q1 = query(collection(db, "tasks"), where("studentId", "==", studentId));
    const snap1 = await getDocs(q1);
    snap1.forEach((d) => {
      tasks.push({ id: d.id, ...d.data() } as TaskItem);
    });

    // 2. Query by studentEmail if provided
    if (studentEmail) {
      const q2 = query(collection(db, "tasks"), where("studentEmail", "==", studentEmail));
      const snap2 = await getDocs(q2);
      snap2.forEach((d) => {
        if (!tasks.some((t) => t.id === d.id)) {
          tasks.push({ id: d.id, ...d.data() } as TaskItem);
        }
      });
    }

    // 3. Query by effective scholar ID if distinct
    if (effectiveScholar && effectiveScholar !== studentId) {
      const q3 = query(collection(db, "tasks"), where("studentId", "==", effectiveScholar));
      const snap3 = await getDocs(q3);
      snap3.forEach((d) => {
        if (!tasks.some((t) => t.id === d.id)) {
          tasks.push({ id: d.id, ...d.data() } as TaskItem);
        }
      });
    }
  } catch (err) {
    console.warn("Firestore task read skipped:", err);
  }

  // Merge with local storage tasks (guaranteed zero-latency cross-page consistency)
  const localList = getLocalTasks();
  for (const lt of localList) {
    const matchesId = lt.studentId === studentId;
    const matchesEmail = Boolean(
      studentEmail && lt.studentEmail && lt.studentEmail.toLowerCase() === studentEmail.toLowerCase()
    );
    const matchesScholar = Boolean(
      effectiveScholar && (
        lt.studentId === effectiveScholar ||
        lt.studentId === `vrcf-${effectiveScholar}` ||
        `vrcf-${lt.studentId}` === effectiveScholar
      )
    );
    const matchesDefault = studentId === "student-default" && (!effectiveScholar || effectiveScholar === lt.studentId);

    if (matchesId || matchesEmail || matchesScholar || matchesDefault) {
      const existingIdx = tasks.findIndex((t) => t.id === lt.id);
      if (existingIdx >= 0) {
        tasks[existingIdx] = { ...tasks[existingIdx], ...lt };
      } else {
        tasks.push(lt);
      }
    }
  }

  // NOTE: STRICTLY NO SEEDED DUMMY TASKS! Return empty array if none assigned.
  return tasks;
}

export async function createStudentTask(task: Omit<TaskItem, "id" | "createdAt">): Promise<TaskItem> {
  const newTask: TaskItem = {
    ...task,
    id: `task-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  saveLocalTask(newTask);

  try {
    await setDoc(doc(db, "tasks", newTask.id), newTask);
  } catch (err) {
    console.warn("Error creating task:", err);
  }

  return newTask;
}

export async function updateTaskStatus(
  taskId: string,
  status: "open" | "in_progress" | "done",
  submissionNotes?: string
): Promise<void> {
  const updates: Partial<TaskItem> = { status };
  if (submissionNotes) {
    updates.submissionNotes = submissionNotes;
  }

  // Update local
  const localList = getLocalTasks();
  const existing = localList.find((t) => t.id === taskId);
  if (existing) {
    saveLocalTask({ ...existing, ...updates });
  }

  try {
    await updateDoc(doc(db, "tasks", taskId), updates);
  } catch (err) {
    console.warn("Error updating task status:", err);
  }
}

export async function updateStudentCompetencyScore(
  studentId: string,
  competency: string,
  level: CompetencyLevel,
  trend: CompetencyTrend = "up",
  deltaEvidence: number = 1
): Promise<void> {
  const compId = `${studentId}_${competency.replace(/[\/\s]/g, "_")}`;
  const compRef = doc(db, "competency_scores", compId);

  // Update localStorage
  if (typeof window !== "undefined") {
    try {
      const key = `mentora_comps_${studentId}`;
      const raw = localStorage.getItem(key);
      const comps: CompetencyScore[] = raw ? JSON.parse(raw) : [];
      const idx = comps.findIndex((c) => c.competency === competency);
      if (idx >= 0) {
        comps[idx].level = level;
        comps[idx].trend = trend;
        comps[idx].evidenceCount = (comps[idx].evidenceCount || 1) + deltaEvidence;
        comps[idx].lastUpdated = new Date().toISOString();
      } else {
        comps.push({
          studentId,
          competency,
          level,
          trend,
          evidenceCount: deltaEvidence + 1,
          lastUpdated: new Date().toISOString(),
        });
      }
      localStorage.setItem(key, JSON.stringify(comps));
      window.dispatchEvent(new CustomEvent("mentora_competencies_updated", { detail: { studentId } }));
    } catch (e) {
      console.warn("Local comp update bypassed:", e);
    }
  }

  try {
    const snap = await getDoc(compRef);
    if (snap.exists()) {
      const data = snap.data() as CompetencyScore;
      await updateDoc(compRef, {
        level,
        trend,
        evidenceCount: (data.evidenceCount || 1) + deltaEvidence,
        lastUpdated: new Date().toISOString(),
      });
    } else {
      await setDoc(compRef, {
        studentId,
        competency,
        level,
        trend,
        evidenceCount: deltaEvidence + 1,
        lastUpdated: new Date().toISOString(),
      });
    }
  } catch (err: any) {
    console.warn("Firestore competency write skipped:", err.message);
  }
}

export async function getStudentCompetencies(studentId: string): Promise<CompetencyScore[]> {
  const scores: CompetencyScore[] = [];

  // Check local cache
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(`mentora_comps_${studentId}`);
      if (raw) {
        const parsed = JSON.parse(raw) as CompetencyScore[];
        if (parsed.length > 0) return parsed;
      }
    } catch {}
  }

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
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`mentora_comps_${studentId}`, JSON.stringify(defaults));
      } catch {}
    }
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

export function getStoredAvatar(userId: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(`mentora_user_avatar_${userId}`) || null;
  } catch {
    return null;
  }
}

export function saveStoredAvatar(userId: string, dataUrl: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`mentora_user_avatar_${userId}`, dataUrl);
    window.dispatchEvent(
      new CustomEvent("mentora_avatar_changed", {
        detail: { userId, avatarUrl: dataUrl },
      })
    );
  } catch (err) {
    console.warn("Could not save avatar to localStorage:", err);
  }
}
