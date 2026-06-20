import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Extract user info from headers injected by middleware
  const userId = request.headers.get('x-user-id');
  const userRole = request.headers.get('x-user-role');

  return NextResponse.json({ 
    message: 'Success! You accessed an officer-only route.',
    user: { id: userId, role: userRole }
  });
}
