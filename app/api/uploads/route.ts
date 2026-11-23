import { NextRequest, NextResponse } from 'next/server';
import { handleRouteError, requireAuth } from '@/lib/api-helpers';
import { listPrescriptionUploads } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    requireAuth(req);
    const uploads = await listPrescriptionUploads();
    return NextResponse.json({ uploads });
  } catch (error) {
    return handleRouteError(error);
  }
}
