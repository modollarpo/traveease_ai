import { NextRequest, NextResponse } from "next/server";

const AGENTIC_BACKEND_URL =
  process.env.AGENTIC_BACKEND_URL ?? "http://localhost:8000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const path = body?.action === "apply" ? "/booking/visas/apply" : "/booking/visas/eligibility";

    const res = await fetch(`${AGENTIC_BACKEND_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body.payload ?? {}),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Visa service unavailable" },
        { status: res.status },
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to contact visa service" },
      { status: 500 },
    );
  }
}
