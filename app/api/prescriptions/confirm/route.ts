import { NextRequest } from 'next/server';
import { POST as confirmPost } from '@/app/api/medications/confirm/route';

export async function POST(req: NextRequest) {
  return confirmPost(req);
}
