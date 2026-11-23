import crypto from 'crypto';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

interface R2Config {
  endpoint: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
}

declare global {
  var __personalIntelR2Client: S3Client | undefined;
}

function getR2Config(): R2Config | null {
  const endpoint = (process.env.R2_ENDPOINT || process.env.AWS_ENDPOINT_URL_S3 || '').trim();
  const bucket = (process.env.R2_BUCKET_NAME || 'sukrit').trim();
  const accessKeyId = (process.env.R2_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || '').trim();
  const secretAccessKey = (
    process.env.R2_SECRET_ACCESS_KEY ||
    process.env.AWS_SECRET_ACCESS_KEY ||
    ''
  ).trim();

  if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) {
    return null;
  }

  return { endpoint, bucket, accessKeyId, secretAccessKey };
}

export function isR2Configured(): boolean {
  return getR2Config() !== null;
}

function getR2Client(): { client: S3Client; config: R2Config } {
  const config = getR2Config();
  if (!config) {
    throw new Error(
      'Cloudflare R2 is not configured. Set R2_ENDPOINT, R2_BUCKET_NAME, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY.'
    );
  }

  if (!globalThis.__personalIntelR2Client) {
    globalThis.__personalIntelR2Client = new S3Client({
      region: 'auto',
      endpoint: config.endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  return { client: globalThis.__personalIntelR2Client, config };
}

function sanitizeFilename(filename: string): string {
  const base = filename.split(/[/\\]/).pop() || 'prescription';
  const cleaned = base
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return cleaned || 'prescription';
}

export async function uploadPrescriptionToR2(params: {
  buffer: Buffer;
  filename: string;
  mimeType: string;
  keyPrefix?: string;
}): Promise<{ bucket: string; key: string; endpoint: string }> {
  const { client, config } = getR2Client();
  const datePrefix = new Date().toISOString().slice(0, 10);
  const safeName = sanitizeFilename(params.filename);
  const prefix = (params.keyPrefix || 'prescriptions').replace(/^\/+|\/+$/g, '');
  const key = `${prefix}/${datePrefix}/${crypto.randomUUID()}-${safeName}`;

  await client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: params.buffer,
      ContentType: params.mimeType,
      Metadata: {
        original_filename: safeName,
      },
    })
  );

  return {
    bucket: config.bucket,
    key,
    endpoint: config.endpoint,
  };
}

export async function getPrescriptionPresignedUrl(
  key: string,
  expiresInSeconds = 3600
): Promise<string> {
  const { client, config } = getR2Client();
  return getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: config.bucket,
      Key: key,
    }),
    { expiresIn: expiresInSeconds }
  );
}

export async function headPrescriptionInR2(key: string): Promise<{
  exists: boolean;
  contentLength: number;
  contentType: string;
}> {
  const { client, config } = getR2Client();
  const res = await client.send(
    new HeadObjectCommand({
      Bucket: config.bucket,
      Key: key,
    })
  );
  return {
    exists: true,
    contentLength: Number(res.ContentLength ?? 0),
    contentType: String(res.ContentType ?? ''),
  };
}

export async function deletePrescriptionFromR2(key: string): Promise<void> {
  const { client, config } = getR2Client();
  await client.send(
    new DeleteObjectCommand({
      Bucket: config.bucket,
      Key: key,
    })
  );
}

export async function checkR2Health(): Promise<{ ok: boolean; bucket: string }> {
  const { client, config } = getR2Client();
  await client.send(new HeadBucketCommand({ Bucket: config.bucket }));
  return { ok: true, bucket: config.bucket };
}
