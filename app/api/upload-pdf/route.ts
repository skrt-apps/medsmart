import { NextRequest, NextResponse } from 'next/server';
import { handleRouteError, MAX_UPLOAD_BYTES, requireAuth } from '@/lib/api-helpers';
import { savePrescriptionUpload } from '@/lib/db';
import { extractPrescriptionWithGemini } from '@/lib/parsers/gemini-parser';
import { isR2Configured, uploadPrescriptionToR2 } from '@/lib/r2';

export async function POST(req: NextRequest) {
  try {
    requireAuth(req);
    const formData = await req.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ detail: 'No prescription PDF uploaded' }, { status: 400 });
    }

    const filename = file.name || 'prescription.pdf';
    if (!filename.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      return NextResponse.json(
        { detail: 'Only PDF prescription uploads are supported' },
        { status: 415 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json({ detail: 'Prescription PDF is empty' }, { status: 400 });
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { detail: 'Prescription PDF exceeds 10 MB limit' },
        { status: 413 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await extractPrescriptionWithGemini(buffer, 'application/pdf');

    let uploadSummary = null;
    if (isR2Configured()) {
      const r2Object = await uploadPrescriptionToR2({
        buffer,
        filename,
        mimeType: 'application/pdf',
      });
      const uploadRow = await savePrescriptionUpload({
        filename,
        mime_type: 'application/pdf',
        size_bytes: file.size,
        r2_bucket: r2Object.bucket,
        r2_key: r2Object.key,
        parser_model: result.modelUsed,
        extracted_text: result.extractedText,
        medication_count: result.medications.length,
      });
      uploadSummary = {
        id: uploadRow.id,
        r2_key: uploadRow.r2_key,
        filename: uploadRow.filename,
        mime_type: uploadRow.mime_type,
        size_bytes: uploadRow.size_bytes,
      };
    }

    return NextResponse.json({
      medications: result.medications,
      extracted_text: result.extractedText,
      parser: result.modelUsed,
      upload: uploadSummary,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
