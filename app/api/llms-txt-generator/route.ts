import { NextResponse } from 'next/server';

// Live Render Backend API Base URL
const BACKEND_URL = process.env.BACKEND_URL || 'https://urltrim-shared-backend.onrender.com/api/v1';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const response = await fetch(`${BACKEND_URL}/llms-txt/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('API Proxy Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PROXY_ERROR',
          message: 'Could not connect to live backend server on Render.',
        },
      },
      { status: 500 }
    );
  }
}
