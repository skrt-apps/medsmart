import { NextRequest, NextResponse } from 'next/server';
import { handleRouteError, requireAuth } from '@/lib/api-helpers';
import { deleteReminder, toggleReminder } from '@/lib/db';

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    requireAuth(req);
    const { id } = await context.params;
    const reminderId = Number(id);
    if (!Number.isInteger(reminderId) || reminderId <= 0) {
      return NextResponse.json({ detail: 'Invalid reminder ID' }, { status: 400 });
    }
    const body = await req.json();
    const enabled = Boolean(body?.enabled);
    const updated = await toggleReminder(reminderId, enabled);
    if (!updated) {
      return NextResponse.json({ detail: 'Reminder not found' }, { status: 404 });
    }
    return NextResponse.json(updated);
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
    const reminderId = Number(id);
    if (!Number.isInteger(reminderId) || reminderId <= 0) {
      return NextResponse.json({ detail: 'Invalid reminder ID' }, { status: 400 });
    }
    const removed = await deleteReminder(reminderId);
    if (!removed) {
      return NextResponse.json({ detail: 'Reminder not found' }, { status: 404 });
    }
    return NextResponse.json({ deleted: true, id: reminderId });
  } catch (error) {
    return handleRouteError(error);
  }
}
