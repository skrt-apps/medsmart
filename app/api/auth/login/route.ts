import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword } from '@/lib/auth';
import { findUserByUsername } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const username = typeof body?.username === 'string' ? body.username.trim() : '';
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!username || !password) {
      return NextResponse.json(
        { detail: 'Invalid username or password' },
        { status: 401 }
      );
    }

    const user = await findUserByUsername(username);
    if (!user || !verifyPassword(password, user.password_hash)) {
      return NextResponse.json(
        { detail: 'Invalid username or password' },
        { status: 401 }
      );
    }

    return NextResponse.json({ authenticated: true, username: user.username });
  } catch {
    return NextResponse.json({ detail: 'Invalid request body' }, { status: 400 });
  }
}
