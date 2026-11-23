import { NextRequest, NextResponse } from 'next/server';
import { handleRouteError, requireAuth } from '@/lib/api-helpers';
import { saveMedications, todayIsoDate } from '@/lib/db';
import { MedicationInput } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    requireAuth(req);
    const body = await req.json();

    if (body?.confirmed_by_user !== true) {
      return NextResponse.json(
        {
          detail:
            'Please check the confirmation box to verify the medication details before saving.',
        },
        { status: 400 }
      );
    }

    const medications: unknown = body?.medications;
    if (!Array.isArray(medications) || medications.length === 0) {
      return NextResponse.json(
        { detail: 'At least one medication is required for confirmation' },
        { status: 400 }
      );
    }

    const today = todayIsoDate();
    const confirmed: MedicationInput[] = [];

    for (const item of medications) {
      const med = (typeof item === 'object' && item !== null ? item : {}) as MedicationInput;
      if (med.verified === false) {
        return NextResponse.json(
          {
            detail: `Medication "${med.name || 'Unnamed'}" must be verified before saving.`,
          },
          { status: 400 }
        );
      }
      confirmed.push({
        ...med,
        verified: true,
        start_date: today,
      });
    }

    const saved = await saveMedications(confirmed);
    if (saved.length === 0) {
      return NextResponse.json(
        { detail: 'Each medication requires a valid name' },
        { status: 400 }
      );
    }

    return NextResponse.json({ medications: saved });
  } catch (error) {
    return handleRouteError(error);
  }
}
