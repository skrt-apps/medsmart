import { NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@/lib/db';
import { checkR2Health, isR2Configured } from '@/lib/r2';

export async function GET() {
  try {
    const db = await checkDatabaseHealth();
    const storage = isR2Configured()
      ? await checkR2Health()
      : { ok: false, bucket: 'not-configured' };

    return NextResponse.json({
      ok: db.ok && storage.ok,
      database: db,
      storage,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Health check failed';
    return NextResponse.json({ ok: false, detail: message }, { status: 503 });
  }
}
