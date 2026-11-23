import { NextRequest, NextResponse } from 'next/server';
import { handleRouteError, requireAuth } from '@/lib/api-helpers';
import { checkDueReminders } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    requireAuth(req);
    const due = await checkDueReminders();
    return NextResponse.json(due);
  } catch (error) {
    return handleRouteError(error);
  }
}
