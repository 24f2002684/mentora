import { NextRequest, NextResponse } from "next/server";
import { isUserAdmin, getAllAccessRoles, saveAccessRole, removeAccessRole } from "@/lib/server-roles";
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
    return NextResponse.json({ roles });
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
    return NextResponse.json({ error: error.message }, { status: 500 });
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
