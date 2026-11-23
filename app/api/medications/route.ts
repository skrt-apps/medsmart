import { NextRequest, NextResponse } from 'next/server';
import { handleRouteError, requireAuth } from '@/lib/api-helpers';
import { listMedications } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    requireAuth(req);
    const medications = await listMedications();
    return NextResponse.json({ medications });
  } catch (error) {
    return handleRouteError(error);
  }
}
