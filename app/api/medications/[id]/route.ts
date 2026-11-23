import { NextRequest, NextResponse } from 'next/server';
import { handleRouteError, requireAuth } from '@/lib/api-helpers';
import { deleteMedication, getMedication } from '@/lib/db';

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
    return NextResponse.json({ medication });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(
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
    const removed = await deleteMedication(medicationId);
    if (!removed) {
      return NextResponse.json({ detail: 'Medication not found' }, { status: 404 });
    }
    return NextResponse.json({ deleted: true, id: medicationId });
  } catch (error) {
    return handleRouteError(error);
  }
}
