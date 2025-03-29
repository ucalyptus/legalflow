import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const response = new NextResponse(JSON.stringify({ status: 'ok' }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Clear any Clerk-related cookies
  const cookieStore = cookies();
  const clerkCookies = [
    '__client',
    '__session',
    '__clerk_db_jwt',
    '__clerk_db_jwt_',
  ];

  clerkCookies.forEach(name => {
    response.cookies.delete(name);
  });

  return response;
}

export async function POST() {
  return GET();
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
} 