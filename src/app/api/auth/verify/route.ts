import { NextRequest, NextResponse } from "next/server";
import { resolveUserAccessRole, isUserAdmin, getVRCFStudents } from "@/lib/server-roles";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json({ error: "No token provided" }, { status: 400 });
    }

    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    // Verify ID Token with Google Identity Toolkit REST endpoint
    const verifyRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      }
    );

    if (!verifyRes.ok) {
      const errData = await verifyRes.text();
      console.error("Token verification failed with Google API:", errData);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const verifyData = await verifyRes.json();
    const googleUser = verifyData.users?.[0];

    if (!googleUser || !googleUser.email) {
      return NextResponse.json({ error: "No user found in token" }, { status: 401 });
    }

    const email = googleUser.email.toLowerCase();
    const uid = googleUser.localId;
    const displayName = googleUser.displayName || email.split("@")[0];

    // Look up role in access_roles
    const accessRole = await resolveUserAccessRole(email);

    if (!accessRole) {
      // User is authenticated by Google, but not in access_roles
      return NextResponse.json(
        {
          allowed: false,
          reason: "pending_access",
          message: "Access pending — contact your VRCF coordinator to be added.",
          email,
        },
        { status: 403 }
      );
    }

    // Role found! Check if matching a VRCF student
    const vrcfStudent = getVRCFStudents().find((s) => s.email && s.email.toLowerCase() === email);

    // Ensure users collection has record (with try-catch to prevent permission block)
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid,
          email,
          name: accessRole.name || displayName,
          role: accessRole.role,
          course: vrcfStudent?.course || (accessRole.role === "student" ? "B.Tech. IT" : undefined),
          college: vrcfStudent?.college || (accessRole.role === "student" ? "Chennai Institute of Technology" : undefined),
          vrcfId: vrcfStudent?.vrcfId || undefined,
          createdAt: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.warn("Could not write to users doc (permissions or network):", e);
    }

    const sessionPayload = {
      uid,
      email,
      name: accessRole.name || displayName,
      role: accessRole.role,
      isAdmin: isUserAdmin(email),
      timestamp: Date.now(),
    };

    const response = NextResponse.json({
      allowed: true,
      role: accessRole.role,
      user: sessionPayload,
    });

    // Set secure HTTP-only cookie
    response.cookies.set("mentora_session", JSON.stringify(sessionPayload), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error("Auth verification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
