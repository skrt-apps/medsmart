import { NextRequest, NextResponse } from 'next/server';
import { handleRouteError, requireAuth } from '@/lib/api-helpers';
import { calculateRefillSchedule, getMedication, todayIsoDate } from '@/lib/db';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    requireAuth(req);
    const { id } = await context.params;
    const medicationId = Number(id);
    if (!Number.isInteger(medicationId) || medicationId <= 0) {
      return NextResponse.json({ detail: 'Invalid medication ID' }, { status: 400 });
    }

    const medication = await getMedication(medicationId);
    if (!medication) {
      return NextResponse.json({ detail: 'Medication not found' }, { status: 404 });
    }

    const quantity = Number.parseInt(String(medication.quantity || '0'), 10);
    const dosesPerDay = Number(medication.doses_per_day || 1);
    if (!Number.isFinite(quantity) || !Number.isFinite(dosesPerDay)) {
      return NextResponse.json(
        { detail: 'Medication refill information is incomplete' },
        { status: 400 }
      );
    }
    if (quantity <= 0) {
      return NextResponse.json(
        { detail: 'Medication quantity is required' },
        { status: 400 }
      );
    }

    const schedule = calculateRefillSchedule(
      medication.start_date || todayIsoDate(),
      quantity,
      dosesPerDay,
      medication.refills || 0
    );
    return NextResponse.json(schedule);
  } catch (error) {
    return handleRouteError(error);
  }
}
