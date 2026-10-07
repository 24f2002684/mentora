import { NextRequest, NextResponse } from "next/server";
import { resolveUserAccessRole, isUserAdmin } from "@/lib/server-roles";

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("mentora_session");
    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    if (!session.email) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Re-verify role dynamically against access_roles
    const accessRole = await resolveUserAccessRole(session.email);
    if (!accessRole) {
      // Role was revoked or removed
      const res = NextResponse.json({ authenticated: false, reason: "revoked" }, { status: 403 });
      res.cookies.delete("mentora_session");
      return res;
    }

    const updatedSession = {
      ...session,
      role: accessRole.role,
      name: accessRole.name,
      isAdmin: isUserAdmin(session.email),
    };

    const res = NextResponse.json({
      authenticated: true,
      user: updatedSession,
      role: accessRole.role,
    });

    // Refresh cookie
    res.cookies.set("mentora_session", JSON.stringify(updatedSession), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (err) {
    console.error("Session verification error:", err);
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
