import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth';
import { createUser, findUserByUsername } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const username = typeof body?.username === 'string' ? body.username.trim() : '';
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!username || !password) {
      return NextResponse.json(
        { detail: 'Username and password are required' },
        { status: 400 }
      );
    }
    if (await findUserByUsername(username)) {
      return NextResponse.json({ detail: 'Username already exists' }, { status: 409 });
    }

    const user = await createUser(username, hashPassword(password));
    return NextResponse.json({ username: user.username });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Registration failed';
    const status = message.includes('already exists') ? 409 : 400;
    return NextResponse.json({ detail: message }, { status });
  }
}
