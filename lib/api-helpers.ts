import { NextRequest, NextResponse } from 'next/server';
import { AuthError, getCurrentUser } from './auth';

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

export function handleRouteError(error: unknown): NextResponse {
  if (error instanceof AuthError) {
    return NextResponse.json({ detail: error.message }, { status: error.status });
  }
  const message = error instanceof Error ? error.message : 'Unexpected server error';
  const status = message.includes('GEMINI_API_KEY') ? 503 : 400;
  return NextResponse.json({ detail: message }, { status });
}

export function requireAuth(req: NextRequest): string | null {
  return getCurrentUser(req);
}

export function detectImageMimeType(filename: string, providedMime?: string): string | null {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.png') || providedMime === 'image/png') return 'image/png';
  if (
    lower.endsWith('.jpg') ||
    lower.endsWith('.jpeg') ||
    providedMime === 'image/jpeg'
  ) {
    return 'image/jpeg';
  }
  if (lower.endsWith('.webp') || providedMime === 'image/webp') return 'image/webp';
  if (lower.endsWith('.bmp') || providedMime === 'image/bmp') return 'image/bmp';
  if (
    lower.endsWith('.tif') ||
    lower.endsWith('.tiff') ||
    providedMime === 'image/tiff'
  ) {
    return 'image/tiff';
  }
  return null;
}
