import { NextRequest } from 'next/server';
import { GET as medicationRefillsGet } from '@/app/api/medications/[id]/refills/route';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return medicationRefillsGet(req, context);
}
