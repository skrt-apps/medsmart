import { GoogleGenAI, Type } from '@google/genai';
import { todayIsoDate } from '../db';
import { MedicationInput } from '../types';

const PRIMARY_EXTRACTION_MODEL = 'gemini-3.5-flash-lite';
const BACKUP_EXTRACTION_MODEL = 'gemini-4-hydrogen';
const EXTRACTION_MODELS = [PRIMARY_EXTRACTION_MODEL, BACKUP_EXTRACTION_MODEL] as const;

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not configured. Add it in Settings > Secrets to extract PDF and image prescriptions.'
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function isModelUnavailableError(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  const status =
    typeof error === 'object' && error !== null && 'status' in error
      ? Number((error as { status?: unknown }).status)
      : undefined;

  if (status === 404 || status === 503) {
    return true;
  }

  return (
    message.includes('unavailable') ||
    message.includes('not_found') ||
    message.includes('not found') ||
    message.includes('overloaded') ||
    message.includes('503') ||
    message.includes('404')
  );
}

export async function extractPrescriptionWithGemini(
  buffer: Buffer,
  mimeType: string,
  confirmationDate?: string
): Promise<{
  medications: MedicationInput[];
  extractedText: string;
  modelUsed: string;
}> {
  const startDate = confirmationDate || todayIsoDate();
  const ai = getGeminiClient();

  const prompt =
    'Read this prescription document or image carefully. ' +
    'First, transcribe the full visible prescription text into `extractedText`. ' +
    'Second, extract every medication into the `medications` array. ' +
    'For each medication, include name, dosage, frequency, route, duration, instructions, quantity (numeric string or empty), refills (integer, default 0), and doses_per_day (integer, default 1). ' +
    'Use empty strings or 0 when a field is not specified.';

  let response: Awaited<ReturnType<typeof ai.models.generateContent>> | null = null;
  let modelUsed: string = PRIMARY_EXTRACTION_MODEL;
  let lastError: unknown = null;

  for (const model of EXTRACTION_MODELS) {
    try {
      response = await ai.models.generateContent({
        model,
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: buffer.toString('base64'),
              },
            },
            { text: prompt },
          ],
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              extractedText: {
                type: Type.STRING,
                description: 'Verbatim transcription of visible prescription text.',
              },
              medications: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    dosage: { type: Type.STRING },
                    frequency: { type: Type.STRING },
                    route: { type: Type.STRING },
                    duration: { type: Type.STRING },
                    instructions: { type: Type.STRING },
                    quantity: { type: Type.STRING },
                    refills: { type: Type.INTEGER },
                    doses_per_day: { type: Type.INTEGER },
                  },
                  required: ['name'],
                },
              },
            },
            required: ['extractedText', 'medications'],
          },
        },
      });
      modelUsed = model;
      break;
    } catch (error) {
      lastError = error;
      if (!isModelUnavailableError(error)) {
        throw error;
      }
    }
  }

  if (!response) {
    throw lastError instanceof Error
      ? lastError
      : new Error('All Gemini extraction models are currently unavailable');
  }

  const rawText = (response.text ?? '').trim();
  if (!rawText) {
    throw new Error('Gemini returned an empty prescription response');
  }

  let parsed: { extractedText?: string; medications?: MedicationInput[] };
  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new Error('Gemini returned invalid medication JSON');
  }

  const extractedText = String(parsed.extractedText ?? '').trim();
  if (extractedText.length < 20 && (!parsed.medications || parsed.medications.length === 0)) {
    throw new Error('Prescription text contains fewer than 20 characters');
  }

  const medications: MedicationInput[] = Array.isArray(parsed.medications)
    ? parsed.medications
        .filter((item) => item && String(item.name ?? '').trim().length > 0)
        .map((item) => ({
          name: String(item.name ?? '').trim(),
          dosage: String(item.dosage ?? '').trim(),
          frequency: String(item.frequency ?? '').trim(),
          route: String(item.route ?? '').trim(),
          duration: String(item.duration ?? '').trim(),
          instructions: String(item.instructions ?? '').trim(),
          quantity:
            item.quantity !== undefined && item.quantity !== null
              ? String(item.quantity).trim()
              : '',
          refills: Number.isFinite(Number(item.refills))
            ? Math.max(0, Math.trunc(Number(item.refills)))
            : 0,
          doses_per_day:
            Number.isFinite(Number(item.doses_per_day)) && Number(item.doses_per_day) >= 1
              ? Math.trunc(Number(item.doses_per_day))
              : 1,
          start_date: startDate,
        }))
    : [];

  return { medications, extractedText, modelUsed };
}
