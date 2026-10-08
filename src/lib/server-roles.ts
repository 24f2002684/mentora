import fs from "fs";
import path from "path";
import { db } from "./firebase";
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs } from "firebase/firestore";
import { AccessRole, Role } from "@/types";

export interface VRCFStudent {
  sno: number;
  vrcfId: string;
  name: string;
  course: string;
  college: string;
  email: string;
}

const ROLES_FILE_PATH = path.join(process.cwd(), "src", "data", "roles_data.json");
const STUDENTS_FILE_PATH = path.join(process.cwd(), "src", "data", "vrcf_students.json");

export const DEFAULT_INITIAL_ROLES: Record<string, { role: Role; name: string }> = {
  "suhailmobina95@gmail.com": { role: "trustee", name: "VRCF Trustee (Suhail Mobina)" },
  "suhailaktharsm25@gmail.com": { role: "mentor", name: "VRCF Mentor (Suhail Akthar)" },
  "24f2002684@ds.study.iitm.ac.in": { role: "student", name: "SUHAIL AKTHAR S SM" },
};

// In-memory cache for ultra-fast and resilient lookups
let inMemoryRoles: AccessRole[] | null = null;
let inMemoryStudents: VRCFStudent[] | null = null;

function loadRolesFromFile(): AccessRole[] {
  if (inMemoryRoles && inMemoryRoles.length > 0) return inMemoryRoles;

  try {
    if (fs.existsSync(ROLES_FILE_PATH)) {
      const data = fs.readFileSync(ROLES_FILE_PATH, "utf-8");
      inMemoryRoles = JSON.parse(data);
      return inMemoryRoles || [];
    }
  } catch (err) {
    console.warn("Could not read roles_data.json:", err);
  }

  // Fallback defaults
  const defaults: AccessRole[] = [
    {
      email: "suhailmobina95@gmail.com",
      role: "trustee",
      name: "VRCF Trustee (Suhail Mobina)",
      addedAt: new Date().toISOString(),
    },
    {
      email: "suhailaktharsm25@gmail.com",
      role: "mentor",
      name: "VRCF Mentor (Suhail Akthar)",
      addedAt: new Date().toISOString(),
    },
    {
      email: "24f2002684@ds.study.iitm.ac.in",
      role: "student",
      name: "SUHAIL AKTHAR S SM",
      addedAt: new Date().toISOString(),
    },
  ];
  inMemoryRoles = defaults;
  return defaults;
}

function persistRolesToFile(roles: AccessRole[]) {
  inMemoryRoles = roles;
  try {
    const dir = path.dirname(ROLES_FILE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(ROLES_FILE_PATH, JSON.stringify(roles, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not write roles_data.json:", err);
  }
}

export function getVRCFStudents(): VRCFStudent[] {
  if (inMemoryStudents && inMemoryStudents.length > 0) return inMemoryStudents;

  try {
    if (fs.existsSync(STUDENTS_FILE_PATH)) {
      const data = fs.readFileSync(STUDENTS_FILE_PATH, "utf-8");
      inMemoryStudents = JSON.parse(data);
      return inMemoryStudents || [];
    }
  } catch (err) {
    console.warn("Could not read vrcf_students.json:", err);
  }

  return [];
}

export function persistVRCFStudents(students: VRCFStudent[]) {
  inMemoryStudents = students;
  try {
    const dir = path.dirname(STUDENTS_FILE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(STUDENTS_FILE_PATH, JSON.stringify(students, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not write vrcf_students.json:", err);
  }
}

export function getAdminEmails(): string[] {
  const envAdmins = process.env.ADMIN_EMAILS || "suhailmobina95@gmail.com";
  return envAdmins
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isUserAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase());
}

export async function resolveUserAccessRole(email: string): Promise<AccessRole | null> {
  const cleanEmail = email.trim().toLowerCase();

  // 1. Check local persistent store
  const roles = loadRolesFromFile();
  const match = roles.find((r) => r.email.toLowerCase() === cleanEmail);
  if (match) return match;

  // 2. Check if email matches any VRCF student from Excel roster
  const students = getVRCFStudents();
  const studentMatch = students.find((s) => s.email && s.email.toLowerCase() === cleanEmail);
  if (studentMatch) {
    const newStudentRole: AccessRole = {
      email: cleanEmail,
      role: "student",
      name: studentMatch.name,
      addedAt: new Date().toISOString(),
    };
    await saveAccessRole(newStudentRole);
    return newStudentRole;
  }

  // 3. Check initial defaults
  if (DEFAULT_INITIAL_ROLES[cleanEmail]) {
    const def = DEFAULT_INITIAL_ROLES[cleanEmail];
    const newEntry: AccessRole = {
      email: cleanEmail,
      role: def.role,
      name: def.name,
      addedAt: new Date().toISOString(),
    };
    await saveAccessRole(newEntry);
    return newEntry;
  }

  // 4. Fallback check from Firestore with try/catch to avoid PERMISSION_DENIED crash
  try {
    const roleDocRef = doc(db, "access_roles", cleanEmail);
    const snap = await getDoc(roleDocRef);
    if (snap.exists()) {
      const data = snap.data();
      const loaded: AccessRole = {
        email: cleanEmail,
        role: data.role as Role,
        name: data.name || cleanEmail.split("@")[0],
        addedAt: data.addedAt || new Date().toISOString(),
      };
      // Cache locally
      await saveAccessRole(loaded);
      return loaded;
    }
  } catch (err: any) {
    // Firestore rules might block unauthenticated read
    console.warn("Firestore lookup bypassed:", err.message);
  }

  return null;
}

export async function getAllAccessRoles(): Promise<AccessRole[]> {
  const roles = loadRolesFromFile();

  // Ensure default roles exist in list
  for (const [defEmail, defData] of Object.entries(DEFAULT_INITIAL_ROLES)) {
    if (!roles.some((r) => r.email.toLowerCase() === defEmail.toLowerCase())) {
      roles.push({
        email: defEmail,
        role: defData.role,
        name: defData.name,
        addedAt: new Date().toISOString(),
      });
    }
  }

  // Try fetching additional roles from Firestore without failing
  try {
    const snap = await getDocs(collection(db, "access_roles"));
    snap.forEach((d) => {
      const data = d.data();
      const existing = roles.find((r) => r.email.toLowerCase() === d.id.toLowerCase());
      if (!existing) {
        roles.push({
          email: d.id,
          role: data.role,
          name: data.name || d.id.split("@")[0],
          addedAt: data.addedAt,
        });
      }
    });
  } catch (err: any) {
    // Graceful fallback to persistent roles
    console.warn("Firestore collection read bypassed:", err.message);
  }

  return roles;
}

export async function saveAccessRole(roleData: AccessRole): Promise<void> {
  const cleanEmail = roleData.email.trim().toLowerCase();

  // 1. Save to persistent file/memory store (guaranteed to succeed without Firestore permissions)
  const roles = loadRolesFromFile();
  const existingIdx = roles.findIndex((r) => r.email.toLowerCase() === cleanEmail);

  const updatedEntry: AccessRole = {
    ...roleData,
    email: cleanEmail,
    name: roleData.name?.trim() || cleanEmail.split("@")[0],
    role: roleData.role,
    addedAt: roleData.addedAt || new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    roles[existingIdx] = updatedEntry;
  } else {
    roles.push(updatedEntry);
  }

  persistRolesToFile(roles);

  // 2. If student email, also link in vrcf_students if applicable
  if (roleData.role === "student") {
    const students = getVRCFStudents();
    const stIdx = students.findIndex(
      (s) =>
        (s.email && s.email.toLowerCase() === cleanEmail) ||
        s.name.toLowerCase() === roleData.name.toLowerCase()
    );
    if (stIdx >= 0) {
      students[stIdx].email = cleanEmail;
      persistVRCFStudents(students);
    }
  }

  // 3. Gracefully attempt to sync to Firestore, but NEVER throw if rules reject
  try {
    await setDoc(doc(db, "access_roles", cleanEmail), {
      email: cleanEmail,
      role: updatedEntry.role,
      name: updatedEntry.name,
      addedAt: updatedEntry.addedAt,
    });
  } catch (err: any) {
    console.warn("Firestore sync skipped (permission/network):", err.message);
  }
}

export async function removeAccessRole(email: string): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();

  // 1. Remove from local persistent store
  const roles = loadRolesFromFile().filter((r) => r.email.toLowerCase() !== cleanEmail);
  persistRolesToFile(roles);

  // 2. Unlink from VRCF student if present
  const students = getVRCFStudents();
  let studentUpdated = false;
  students.forEach((s) => {
    if (s.email && s.email.toLowerCase() === cleanEmail) {
      s.email = "";
      studentUpdated = true;
    }
  });
  if (studentUpdated) {
    persistVRCFStudents(students);
  }

  // 3. Gracefully attempt delete in Firestore
  try {
    await deleteDoc(doc(db, "access_roles", cleanEmail));
  } catch (err: any) {
    console.warn("Firestore deletion skipped:", err.message);
  }
}

export async function assignStudentEmail(vrcfId: string, email: string): Promise<VRCFStudent | null> {
  const cleanEmail = email.trim().toLowerCase();
  const students = getVRCFStudents();
  const target = students.find((s) => s.vrcfId === vrcfId);

  if (!target) return null;

  target.email = cleanEmail;
  persistVRCFStudents(students);

  // Automatically grant student role
  await saveAccessRole({
    email: cleanEmail,
    role: "student",
    name: target.name,
    addedAt: new Date().toISOString(),
  });

  return target;
}
