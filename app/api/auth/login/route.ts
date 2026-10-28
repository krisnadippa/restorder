import { NextResponse } from 'next/server';
import { encrypt } from '../../../../lib/auth';

export async function POST(req: Request) {
  try {
    const { password } = await req.json();
    const envPassword = process.env.ADMIN_PASSWORD;

    // Supports configured password, default 'admin123', and 'glorious-admin'
    const isValid = password === (envPassword || 'admin123') || password === 'admin123' || password === 'glorious-admin';

    if (isValid) {
      // Create session token
      const session = await encrypt({ role: 'admin', time: Date.now() });

      // Create response and set HttpOnly cookie
      const res = NextResponse.json({ success: true }, { status: 200 });
      res.cookies.set('admin_session', session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 1 day in seconds
        path: '/',
      });

      return res;
    }

    return NextResponse.json({ error: 'Password salah' }, { status: 401 });
  } catch (error) {
    console.error("Login route error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
