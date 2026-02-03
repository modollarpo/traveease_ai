import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null as any);
  const message: string = body?.message ?? '';

  // In production, this should call the LangGraph concierge backend,
  // which in turn talks to Amadeus, Treepz, vendors, etc.
  // For now we return a simple, structured stub response.

    const AGENTIC_BACKEND_URL =
      process.env.AGENTIC_BACKEND_URL ?? "http://localhost:8000";

    if (!message.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const backendResponse = await fetch(
      `${AGENTIC_BACKEND_URL}/agentic/agentic-query`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: message }),
      }
    );

    if (!backendResponse.ok) {
      console.error(
        "Agentic backend error",
        backendResponse.status,
        await backendResponse.text()
      );
      return NextResponse.json(
        { error: "Concierge is temporarily unavailable" },
        { status: 502 }
      );
    }

    const data = await backendResponse.json();

    return NextResponse.json({ reply: data });
}
