import { NextRequest, NextResponse } from 'next/server';
import { handleRouteError, requireAuth } from '@/lib/api-helpers';
import { getPrescriptionUpload } from '@/lib/db';
import { getPrescriptionPresignedUrl, isR2Configured } from '@/lib/r2';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    requireAuth(req);
    const { id } = await context.params;
    const uploadId = Number(id);
    if (!Number.isInteger(uploadId) || uploadId <= 0) {
      return NextResponse.json({ detail: 'Invalid upload ID' }, { status: 400 });
    }

    const upload = await getPrescriptionUpload(uploadId);
    if (!upload) {
      return NextResponse.json({ detail: 'Upload not found' }, { status: 404 });
    }

    const downloadUrl = isR2Configured()
      ? await getPrescriptionPresignedUrl(upload.r2_key)
      : null;

    return NextResponse.json({ upload, download_url: downloadUrl });
  } catch (error) {
    return handleRouteError(error);
  }
}
