import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await axios.post(
      'http://localhost:8000/agentic/agentic-query',
      { query: body.query }
    );
    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process agentic query' },
      { status: 500 }
    );
  }
}
