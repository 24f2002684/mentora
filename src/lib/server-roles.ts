import { db } from "./firebase";
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs } from "firebase/firestore";
import { AccessRole, Role } from "@/types";

export const DEFAULT_INITIAL_ROLES: Record<string, { role: Role; name: string }> = {
  "suhailmobina95@gmail.com": { role: "trustee", name: "VRCF Trustee" },
  "suhailaktharsm25@gmail.com": { role: "mentor", name: "VRCF Mentor" },
  "24f2002684@ds.study.iitm.ac.in": { role: "student", name: "VRCF Student Scholar" },
};

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
  
  try {
    const roleDocRef = doc(db, "access_roles", cleanEmail);
    const snap = await getDoc(roleDocRef);
    
    if (snap.exists()) {
      const data = snap.data();
      return {
        email: cleanEmail,
        role: data.role as Role,
        name: data.name || cleanEmail.split("@")[0],
        addedAt: data.addedAt || new Date().toISOString(),
      };
    }
  } catch (error) {
    console.warn("Firestore lookup failed, checking fallback:", error);
  }

  // Check initial default roles
  if (DEFAULT_INITIAL_ROLES[cleanEmail]) {
    const defaultData = DEFAULT_INITIAL_ROLES[cleanEmail];
    const newEntry: AccessRole = {
      email: cleanEmail,
      role: defaultData.role,
      name: defaultData.name,
      addedAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, "access_roles", cleanEmail), newEntry);
    } catch (e) {
      console.warn("Could not auto-persist default role to Firestore:", e);
    }
    return newEntry;
  }

  return null;
}

export async function getAllAccessRoles(): Promise<AccessRole[]> {
  const roles: AccessRole[] = [];
  try {
    const snap = await getDocs(collection(db, "access_roles"));
    snap.forEach((d) => {
      const data = d.data();
      roles.push({
        email: d.id,
        role: data.role,
        name: data.name || d.id.split("@")[0],
        addedAt: data.addedAt,
      });
    });
  } catch (error) {
    console.error("Error fetching access roles:", error);
  }

  // Ensure default roles are represented if collection was empty
  for (const [email, def] of Object.entries(DEFAULT_INITIAL_ROLES)) {
    if (!roles.some((r) => r.email.toLowerCase() === email.toLowerCase())) {
      roles.push({
        email,
        role: def.role,
        name: def.name,
        addedAt: new Date().toISOString(),
      });
    }
  }

  return roles;
}

export async function saveAccessRole(roleData: AccessRole): Promise<void> {
  const cleanEmail = roleData.email.trim().toLowerCase();
  await setDoc(doc(db, "access_roles", cleanEmail), {
    email: cleanEmail,
    role: roleData.role,
    name: roleData.name,
    addedAt: roleData.addedAt || new Date().toISOString(),
  });
}

export async function removeAccessRole(email: string): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();
  await deleteDoc(doc(db, "access_roles", cleanEmail));
}
