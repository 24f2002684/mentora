export type Role = "student" | "mentor" | "trustee";

export interface AccessRole {
  email: string;
  role: Role;
  name: string;
  addedAt?: any;
}

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: Role;
  course?: string;
  focusArea?: string;
  careerGoal?: string;
  avatarUrl?: string;
  createdAt?: any;
}

export interface VisionBoard {
  studentId: string;
  course: string;
  focusArea: string;
  careerGoal: string;
  longTermGoals: string[];
  shortTermGoals: string[];
  avatarUrl?: string;
  lastUpdated?: any;
}

export interface TaskItem {
  id: string;
  studentId: string;
  studentName?: string;
  studentEmail?: string;
  title: string;
  description?: string;
  assignedBy: "mentor" | "self";
  mentorId?: string | null;
  mentorName?: string;
  dueDate: string;
  status: "open" | "in_progress" | "done";
  skills: string[];
  feedback?: string;
  grade?: string;
  score?: number;
  rating?: number;
  remarks?: string;
  submissionNotes?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  createdAt?: any;
}

export type TutorMode = "Learn" | "Practice" | "Challenge Me" | "Explain Back" | "Career Connect";

export interface ChatMessage {
  role: "tutor" | "student";
  text: string;
  timestamp: string | number;
}

export interface TutorSession {
  id: string;
  studentId: string;
  title?: string;
  mode: TutorMode;
  messages: ChatMessage[];
  competenciesTouched: string[];
  criticalThinkingScore?: number;
  criticalThinkingLevel?: string;
  startedAt: any;
  endedAt?: any;
}

export type CompetencyLevel = "Foundation" | "Developing" | "Strong";
export type CompetencyTrend = "up" | "flat";

export interface CompetencyScore {
  studentId: string;
  competency: string;
  level: CompetencyLevel;
  trend: CompetencyTrend;
  evidenceCount: number;
  lastUpdated?: any;
}

export interface MentorAssignment {
  mentorId: string;
  studentId: string;
}

export interface ActivityLog {
  studentId: string;
  type: "tutor_session" | "task_completed" | "journal_entry";
  durationMinutes: number;
  timestamp: any;
  details?: string;
}

export const VRCF_COMPETENCIES = [
  "Critical Thinking",
  "Analytical Thinking",
  "Logical Reasoning",
  "Problem Solving",
  "Innovative Thinking",
  "Communication",
  "Leadership",
  "Digital/AI Literacy",
  "Career Readiness",
  "Domain/Academic Knowledge"
] as const;
