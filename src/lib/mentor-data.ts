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
import { TaskItem, VRCF_COMPETENCIES } from "@/types";

export interface StudentSummary {
  id: string;
  name: string;
  email: string;
  course: string;
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
  const students: StudentSummary[] = [];

  try {
    // Look up students in users collection
    const q = query(collection(db, "users"), where("role", "==", "student"));
    const snap = await getDocs(q);

    snap.forEach((d) => {
      const data = d.data();
      students.push({
        id: d.id,
        name: data.name || "VRCF Scholar",
        email: data.email || "",
        course: data.course || "B.S. Data Science & Applications",
        careerGoal: data.careerGoal || "AI Research Fellow & Public Impact Tech Lead",
        focusArea: data.focusArea || "Machine Learning & Public Policy Analytics",
        topTrend: "Critical Thinking (+Upward)",
        signal: {
          type: "attention",
          text: "Task overdue: Algorithmic bias analysis",
        },
        openTasksCount: 2,
      });
    });
  } catch (e) {
    console.warn("Error fetching mentor students:", e);
  }

  // Ensure default scholar 24f2002684@ds.study.iitm.ac.in exists if collection was empty
  if (students.length === 0) {
    students.push({
      id: "student-iitm-demo",
      name: "VRCF Scholar (IITM)",
      email: "24f2002684@ds.study.iitm.ac.in",
      course: "B.S. Data Science & Applications",
      careerGoal: "AI Research Fellow & Public Impact Tech Lead",
      focusArea: "Machine Learning & Public Policy Analytics",
      topTrend: "Critical Thinking (+Upward)",
      signal: {
        type: "attention",
        text: "Task review pending: Ethical frameworks brief",
      },
      openTasksCount: 2,
    });
  }

  return students;
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
  mentorId: string;
  mentorName: string;
  title: string;
  description: string;
  dueDate: string;
  skills: string[];
}): Promise<void> {
  const taskId = `task-${Date.now()}`;
  await setDoc(doc(db, "tasks", taskId), {
    id: taskId,
    studentId: params.studentId,
    title: params.title,
    description: params.description,
    assignedBy: "mentor",
    mentorId: params.mentorId,
    mentorName: params.mentorName,
    dueDate: params.dueDate,
    status: "open",
    skills: params.skills,
    createdAt: new Date().toISOString(),
  });
}

export async function getTasksAwaitingReview(): Promise<TaskItem[]> {
  const tasks: TaskItem[] = [];
  try {
    const snap = await getDocs(collection(db, "tasks"));
    snap.forEach((d) => {
      const data = d.data() as TaskItem;
      // Tasks completed or in progress without mentor feedback
      if (!data.feedback && (data.status === "done" || data.status === "in_progress")) {
        tasks.push(data);
      }
    });
  } catch (e) {
    console.warn("Error reading tasks for review:", e);
  }

  if (tasks.length === 0) {
    return [
      {
        id: "review-seed-1",
        studentId: "student-iitm-demo",
        title: "Analyze algorithmic bias in university admissions case study",
        description: "Evaluated disparate impact metrics and formulated 3 mitigation strategies using Socratic principles.",
        assignedBy: "mentor",
        dueDate: "2026-10-18",
        status: "done",
        skills: ["Critical Thinking", "Analytical Thinking"],
        createdAt: new Date().toISOString(),
      },
      {
        id: "review-seed-2",
        studentId: "student-iitm-demo",
        title: "Reflective brief on Socratic inquiry session",
        description: "Synthesized core arguments on algorithmic governance.",
        assignedBy: "mentor",
        dueDate: "2026-10-22",
        status: "in_progress",
        skills: ["Communication", "Logical Reasoning"],
        createdAt: new Date().toISOString(),
      },
    ];
  }

  return tasks;
}

export async function submitMentorFeedback(taskId: string, feedback: string): Promise<void> {
  await updateDoc(doc(db, "tasks", taskId), {
    feedback,
    status: "done",
    reviewedAt: new Date().toISOString(),
  });
}
