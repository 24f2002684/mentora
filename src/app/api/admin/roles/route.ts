import { NextRequest, NextResponse } from "next/server";
import {
  isUserAdmin,
  getAllAccessRoles,
  saveAccessRole,
  removeAccessRole,
  getVRCFStudents,
  assignStudentEmail,
} from "@/lib/server-roles";
import { Role } from "@/types";

function getAdminSession(req: NextRequest) {
  const sessionCookie = req.cookies.get("mentora_session");
  if (!sessionCookie || !sessionCookie.value) return null;
  try {
    const session = JSON.parse(sessionCookie.value);
    if (session.email && isUserAdmin(session.email)) {
      return session;
    }
  } catch (e) {
    return null;
  }
  return null;
}

export async function GET(req: NextRequest) {
  const admin = getAdminSession(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
  }

  try {
    const roles = await getAllAccessRoles();
    const students = getVRCFStudents();
    return NextResponse.json({ roles, students });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const admin = getAdminSession(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
  }

  try {
    const body = await req.json();

    // Action 1: Assign Google Email to a student from VRCF Excel roster
    if (body.action === "assign_student") {
      const { vrcfId, email } = body;
      if (!vrcfId || !email) {
        return NextResponse.json({ error: "Missing vrcfId or email" }, { status: 400 });
      }

      const updatedStudent = await assignStudentEmail(vrcfId, email);
      if (!updatedStudent) {
        return NextResponse.json({ error: "Student not found in VRCF roster" }, { status: 404 });
      }

      return NextResponse.json({ success: true, student: updatedStudent });
    }

    // Action 2: Add or Edit generic role in access_roles
    const { email, role, name } = body;

    if (!email || !role || !["student", "mentor", "trustee"].includes(role)) {
      return NextResponse.json({ error: "Invalid email or role" }, { status: 400 });
    }

    await saveAccessRole({
      email: email.trim().toLowerCase(),
      role: role as Role,
      name: name?.trim() || email.split("@")[0],
      addedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Admin POST error:", error);
    return NextResponse.json({ error: error.message || "Failed to save role" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const admin = getAdminSession(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Missing email parameter" }, { status: 400 });
    }

    await removeAccessRole(email);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
