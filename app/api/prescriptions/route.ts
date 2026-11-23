import { NextRequest } from 'next/server';
import { GET as medicationsGet } from '@/app/api/medications/route';

export async function GET(req: NextRequest) {
  return medicationsGet(req);
}
