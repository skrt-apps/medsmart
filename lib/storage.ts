import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const R2_ENDPOINT = process.env.R2_ENDPOINT || 'https://0dab281a8d82f8f82f1bcc04e39f093d.r2.cloudflarestorage.com';
const R2_BUCKET = process.env.R2_BUCKET_NAME || 'sukrit';

export const s3 = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'placeholder',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'placeholder',
  },
});

export async function uploadToR2(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  const key = `uploads/${Date.now()}-${fileName}`;
  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
      })
    );
    return `${R2_ENDPOINT}/${R2_BUCKET}/${key}`;
  } catch (err) {
    console.error('R2 Upload error (falling back to local virtual URL):', err);
    return `/uploads/${key}`;
  }
}
