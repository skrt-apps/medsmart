import { NextRequest } from 'next/server';
import { POST as uploadPdfPost } from '@/app/api/upload-pdf/route';

export async function POST(req: NextRequest) {
  return uploadPdfPost(req);
}
