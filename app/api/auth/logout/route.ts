import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.json({ success: true }, { status: 200 });
  
  // Clear the cookie immediately
  res.cookies.set('admin_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(0), // expire in the past
    path: '/',
  });

  return res;
}
