import { NextRequest, NextResponse } from 'next/server';
import { handleRouteError, requireAuth } from '@/lib/api-helpers';
import { calculateRefillSchedule, todayIsoDate } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    requireAuth(req);
    const body = await req.json();
    const quantity = Number(body?.quantity);
    const dosesPerDay = body?.doses_per_day !== undefined ? Number(body.doses_per_day) : 1;
    const refills = body?.refills !== undefined ? Number(body.refills) : 0;
    const startDate =
      typeof body?.start_date === 'string' && body.start_date.trim()
        ? body.start_date.trim()
        : todayIsoDate();

    const schedule = calculateRefillSchedule(startDate, quantity, dosesPerDay, refills);
    return NextResponse.json(schedule);
  } catch (error) {
    return handleRouteError(error);
  }
}
