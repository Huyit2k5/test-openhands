import { NextResponse } from "next/server";

/**
 * Mock attendance API endpoint — `POST /api/attendance`.
 *
 * The requirement asks the toggle to "call a *simulated* API endpoint", so
 * this route handler stands in for a real backend: it validates the payload,
 * simulates a little network/processing latency, and returns a realistic
 * success/failure response. Swapping in a real integration later is a one-line
 * change (replace the simulated body with a `fetch` to your backend).
 */
export const dynamic = "force-dynamic";

type AttendanceRequest = {
  enrollmentId: string;
  sessionId: string;
  present: boolean;
  note?: string;
};

const simulateLatency = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST(request: Request) {
  let body: AttendanceRequest;
  try {
    body = (await request.json()) as AttendanceRequest;
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON body" }, { status: 400 });
  }

  const { enrollmentId, sessionId, present } = body;
  if (!enrollmentId || !sessionId || typeof present !== "boolean") {
    return NextResponse.json(
      { success: false, message: "enrollmentId, sessionId and present are required" },
      { status: 400 },
    );
  }

  // --- Simulated work (replace with a real backend call in production) ---
  await simulateLatency(450);

  return NextResponse.json({
    success: true,
    enrollmentId,
    sessionId,
    status: present ? "PRESENT" : "ABSENT",
    updatedAt: new Date().toISOString(),
  });
}