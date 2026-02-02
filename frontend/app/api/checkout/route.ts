import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await axios.post(
      'http://localhost:3001/payments/compliance/total',
      body
    );
    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to calculate compliance fees' },
      { status: 500 }
    );
  }
}
