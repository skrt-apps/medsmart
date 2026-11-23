import { NextRequest, NextResponse } from 'next/server';
import { handleRouteError, requireAuth } from '@/lib/api-helpers';
import {
  createReminder,
  getMedication,
  listRemindersWithMedications,
} from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    requireAuth(req);
    const reminders = await listRemindersWithMedications();
    return NextResponse.json({ reminders });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    requireAuth(req);
    const body = await req.json();
    const medicationId = Number(body?.medication_id);
    const remindAt = typeof body?.remind_at === 'string' ? body.remind_at.trim() : '';
    const enabled = body?.enabled !== undefined ? Boolean(body.enabled) : true;

    if (!Number.isInteger(medicationId) || medicationId <= 0) {
      return NextResponse.json({ detail: 'Valid medication_id is required' }, { status: 400 });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(remindAt)) {
      return NextResponse.json(
        { detail: 'remind_at must be in YYYY-MM-DD format' },
        { status: 400 }
      );
    }
    if (!(await getMedication(medicationId))) {
      return NextResponse.json({ detail: 'Medication not found' }, { status: 404 });
    }

    const created = await createReminder(medicationId, remindAt, enabled);
    return NextResponse.json(created);
  } catch (error) {
    return handleRouteError(error);
  }
}
