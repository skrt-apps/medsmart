import { neon, NeonQueryFunction } from '@neondatabase/serverless';
import { getCatalogSpecialityInfo } from './data/medication-catalog';
import {
  MedicationInput,
  MedicationRecord,
  PrescriptionUploadInput,
  PrescriptionUploadRecord,
  RefillSchedule,
  ReminderRecord,
  ReminderWithMedication,
  UserRecord,
} from './types';

declare global {
  var __personalIntelSql: NeonQueryFunction<false, false> | undefined;
  var __personalIntelSchemaPromise: Promise<void> | undefined;
}

function getSql(): NeonQueryFunction<false, false> {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL is not configured. Add your Neon PostgreSQL connection string to .env.local.'
    );
  }
  if (!globalThis.__personalIntelSql) {
    globalThis.__personalIntelSql = neon(databaseUrl);
  }
  return globalThis.__personalIntelSql;
}

export async function ensureSchema(): Promise<void> {
  if (!globalThis.__personalIntelSchemaPromise) {
    const sql = getSql();
    globalThis.__personalIntelSchemaPromise = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS prescription_uploads (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          filename TEXT NOT NULL,
          mime_type TEXT NOT NULL,
          size_bytes INTEGER NOT NULL,
          r2_bucket TEXT NOT NULL,
          r2_key TEXT NOT NULL UNIQUE,
          parser_model TEXT NOT NULL DEFAULT '',
          extracted_text TEXT NOT NULL DEFAULT '',
          medication_count INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS medications (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          dosage TEXT NOT NULL DEFAULT '',
          frequency TEXT NOT NULL DEFAULT '',
          route TEXT NOT NULL DEFAULT '',
          duration TEXT NOT NULL DEFAULT '',
          instructions TEXT NOT NULL DEFAULT '',
          quantity TEXT NOT NULL DEFAULT '',
          refills INTEGER NOT NULL DEFAULT 0,
          doses_per_day INTEGER NOT NULL DEFAULT 1,
          start_date TEXT NOT NULL,
          user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          upload_id INTEGER REFERENCES prescription_uploads(id) ON DELETE SET NULL,
          generic_name TEXT NOT NULL DEFAULT '',
          matched_brand TEXT NOT NULL DEFAULT '',
          catalog_region TEXT NOT NULL DEFAULT '',
          therapeutic_category TEXT NOT NULL DEFAULT '',
          speciality TEXT NOT NULL DEFAULT '',
          formulation_label TEXT NOT NULL DEFAULT '',
          verified BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS reminders (
          id SERIAL PRIMARY KEY,
          medication_id INTEGER NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
          remind_at TEXT NOT NULL,
          enabled BOOLEAN NOT NULL DEFAULT TRUE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
      await sql`
        CREATE INDEX IF NOT EXISTS idx_medications_user_id ON medications(user_id)
      `;
      await sql`
        CREATE INDEX IF NOT EXISTS idx_reminders_medication_id ON reminders(medication_id)
      `;
      await sql`
        CREATE INDEX IF NOT EXISTS idx_reminders_remind_at ON reminders(remind_at)
      `;
    })().catch((err) => {
      globalThis.__personalIntelSchemaPromise = undefined;
      throw err;
    });
  }
  await globalThis.__personalIntelSchemaPromise;
}

export function todayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function mapMedicationRow(row: Record<string, unknown>): MedicationRecord {
  return {
    id: Number(row.id),
    name: String(row.name ?? ''),
    dosage: String(row.dosage ?? ''),
    frequency: String(row.frequency ?? ''),
    route: String(row.route ?? ''),
    duration: String(row.duration ?? ''),
    instructions: String(row.instructions ?? ''),
    quantity: String(row.quantity ?? ''),
    refills: Number(row.refills ?? 0),
    doses_per_day: Number(row.doses_per_day ?? 1),
    start_date: String(row.start_date ?? ''),
    user_id: row.user_id !== null && row.user_id !== undefined ? Number(row.user_id) : null,
    upload_id:
      row.upload_id !== null && row.upload_id !== undefined ? Number(row.upload_id) : null,
    generic_name: String(row.generic_name ?? ''),
    matched_brand: String(row.matched_brand ?? ''),
    catalog_region: String(row.catalog_region ?? ''),
    therapeutic_category: String(row.therapeutic_category ?? ''),
    speciality: String(row.speciality ?? ''),
    formulation_label: String(row.formulation_label ?? ''),
    verified: Boolean(row.verified),
  };
}

export async function checkDatabaseHealth(): Promise<{ ok: boolean; database: string }> {
  await ensureSchema();
  const sql = getSql();
  const rows = await sql`SELECT current_database() AS database`;
  return {
    ok: rows.length > 0,
    database: String(rows[0]?.database ?? 'neondb'),
  };
}

export async function listMedications(): Promise<MedicationRecord[]> {
  await ensureSchema();
  const sql = getSql();
  const rows = await sql`
    SELECT
      id, name, dosage, frequency, route, duration, instructions,
      quantity, refills, doses_per_day, start_date, user_id, upload_id,
      generic_name, matched_brand, catalog_region, therapeutic_category,
      speciality, formulation_label, verified
    FROM medications
    ORDER BY id DESC
  `;
  return rows.map(mapMedicationRow);
}

export async function saveMedications(
  medications: MedicationInput[]
): Promise<MedicationRecord[]> {
  await ensureSchema();
  const sql = getSql();
  const defaultDate = todayIsoDate();

  const prepared = medications
    .map((med) => {
      const cleanName = String(med.name ?? '').trim();
      if (!cleanName) return null;

      const lookupTarget = String(med.generic_name || cleanName).trim();
      const fallbackMeta = getCatalogSpecialityInfo(lookupTarget);

      return {
        name: cleanName,
        dosage: String(med.dosage ?? '').trim(),
        frequency: String(med.frequency ?? '').trim(),
        route: String(med.route ?? '').trim(),
        duration: String(med.duration ?? '').trim(),
        instructions: String(med.instructions ?? '').trim(),
        quantity:
          med.quantity !== undefined && med.quantity !== null
            ? String(med.quantity).trim()
            : '',
        refills: Number.isFinite(Number(med.refills))
          ? Math.max(0, Math.trunc(Number(med.refills)))
          : 0,
        doses_per_day:
          Number.isFinite(Number(med.doses_per_day)) && Number(med.doses_per_day) >= 1
            ? Math.trunc(Number(med.doses_per_day))
            : 1,
        start_date: String(med.start_date ?? defaultDate).trim() || defaultDate,
        user_id: med.user_id ?? null,
        upload_id: med.upload_id ?? null,
        generic_name: String(med.generic_name ?? fallbackMeta.generic_name).trim(),
        matched_brand: String(med.matched_brand ?? '').trim(),
        catalog_region: String(med.catalog_region ?? fallbackMeta.catalog_region).trim(),
        therapeutic_category: String(
          med.therapeutic_category || fallbackMeta.therapeutic_category
        ).trim(),
        speciality: String(med.speciality || fallbackMeta.speciality).trim(),
        formulation_label: String(med.formulation_label ?? '').trim(),
        verified: Boolean(med.verified),
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  if (prepared.length === 0) {
    return [];
  }

  const results = await sql.transaction(
    prepared.map((item) => sql`
      INSERT INTO medications (
        name, dosage, frequency, route, duration, instructions,
        quantity, refills, doses_per_day, start_date, user_id, upload_id,
        generic_name, matched_brand, catalog_region, therapeutic_category,
        speciality, formulation_label, verified
      ) VALUES (
        ${item.name}, ${item.dosage}, ${item.frequency}, ${item.route}, ${item.duration}, ${item.instructions},
        ${item.quantity}, ${item.refills}, ${item.doses_per_day}, ${item.start_date}, ${item.user_id}, ${item.upload_id},
        ${item.generic_name}, ${item.matched_brand}, ${item.catalog_region}, ${item.therapeutic_category},
        ${item.speciality}, ${item.formulation_label}, ${item.verified}
      )
      RETURNING
        id, name, dosage, frequency, route, duration, instructions,
        quantity, refills, doses_per_day, start_date, user_id, upload_id,
        generic_name, matched_brand, catalog_region, therapeutic_category,
        speciality, formulation_label, verified
    `)
  );

  return results
    .flatMap((rows) => rows)
    .map((row) => mapMedicationRow(row as Record<string, unknown>));
}

export async function getMedication(medicationId: number): Promise<MedicationRecord | null> {
  await ensureSchema();
  const sql = getSql();
  const rows = await sql`
    SELECT
      id, name, dosage, frequency, route, duration, instructions,
      quantity, refills, doses_per_day, start_date, user_id, upload_id,
      generic_name, matched_brand, catalog_region, therapeutic_category,
      speciality, formulation_label, verified
    FROM medications
    WHERE id = ${medicationId}
    LIMIT 1
  `;
  return rows[0] ? mapMedicationRow(rows[0] as Record<string, unknown>) : null;
}

export async function deleteMedication(medicationId: number): Promise<boolean> {
  await ensureSchema();
  const sql = getSql();
  const rows = await sql`
    DELETE FROM medications
    WHERE id = ${medicationId}
    RETURNING id
  `;
  return rows.length > 0;
}

export function calculateRefillSchedule(
  startDate: string,
  quantity: number | string,
  dosesPerDay: number | string = 1,
  refills = 0
): RefillSchedule {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(startDate).trim())) {
    throw new Error('Start date must be in YYYY-MM-DD format');
  }
  const [year, month, day] = startDate.trim().split('-').map(Number);
  const start = new Date(Date.UTC(year, month - 1, day));
  if (
    Number.isNaN(start.getTime()) ||
    start.getUTCFullYear() !== year ||
    start.getUTCMonth() !== month - 1 ||
    start.getUTCDate() !== day
  ) {
    throw new Error('Invalid start date');
  }

  const supplied = Number(quantity);
  const daily = Number(dosesPerDay);
  if (!Number.isFinite(supplied) || !Number.isFinite(daily) || supplied < 0 || daily < 1) {
    throw new Error('Quantity and doses per day must be positive');
  }

  const daysSupply = Math.max(1, Math.ceil(supplied / Math.trunc(daily)));
  const nextDate = new Date(start.getTime());
  nextDate.setUTCDate(nextDate.getUTCDate() + daysSupply);

  return {
    days_supply: daysSupply,
    next_refill_date: nextDate.toISOString().slice(0, 10),
    remaining_refills: Math.max(0, Math.trunc(Number(refills) || 0)),
  };
}

export async function createReminder(
  medicationId: number,
  remindAt: string,
  enabled = true
): Promise<ReminderRecord> {
  await ensureSchema();
  const sql = getSql();
  const rows = await sql`
    INSERT INTO reminders (medication_id, remind_at, enabled)
    VALUES (${medicationId}, ${remindAt}, ${Boolean(enabled)})
    RETURNING id, medication_id, remind_at, enabled
  `;
  const row = rows[0] as Record<string, unknown>;
  return {
    id: Number(row.id),
    medication_id: Number(row.medication_id),
    remind_at: String(row.remind_at),
    enabled: Boolean(row.enabled),
  };
}

export async function listRemindersWithMedications(): Promise<ReminderWithMedication[]> {
  await ensureSchema();
  const sql = getSql();
  const rows = await sql`
    SELECT
      r.id,
      r.medication_id,
      r.remind_at,
      r.enabled,
      m.name,
      m.start_date
    FROM reminders r
    INNER JOIN medications m ON m.id = r.medication_id
    ORDER BY r.remind_at ASC, r.id ASC
  `;
  return rows.map((row) => ({
    id: Number(row.id),
    medication_id: Number(row.medication_id),
    remind_at: String(row.remind_at),
    enabled: Boolean(row.enabled),
    name: String(row.name),
    start_date: String(row.start_date),
  }));
}

export async function checkDueReminders(): Promise<{
  due: ReminderWithMedication[];
  reminders: ReminderWithMedication[];
}> {
  const all = await listRemindersWithMedications();
  const enabledReminders = all.filter((r) => r.enabled);
  const today = todayIsoDate();
  const due = enabledReminders.filter((r) => r.remind_at <= today);
  return { due, reminders: enabledReminders };
}

export async function toggleReminder(
  reminderId: number,
  enabled: boolean
): Promise<ReminderRecord | null> {
  await ensureSchema();
  const sql = getSql();
  const rows = await sql`
    UPDATE reminders
    SET enabled = ${Boolean(enabled)}
    WHERE id = ${reminderId}
    RETURNING id, medication_id, remind_at, enabled
  `;
  if (!rows[0]) return null;
  const row = rows[0] as Record<string, unknown>;
  return {
    id: Number(row.id),
    medication_id: Number(row.medication_id),
    remind_at: String(row.remind_at),
    enabled: Boolean(row.enabled),
  };
}

export async function deleteReminder(reminderId: number): Promise<boolean> {
  await ensureSchema();
  const sql = getSql();
  const rows = await sql`
    DELETE FROM reminders
    WHERE id = ${reminderId}
    RETURNING id
  `;
  return rows.length > 0;
}

export async function findUserByUsername(username: string): Promise<UserRecord | null> {
  await ensureSchema();
  const sql = getSql();
  const rows = await sql`
    SELECT id, username, password_hash
    FROM users
    WHERE username = ${username}
    LIMIT 1
  `;
  if (!rows[0]) return null;
  const row = rows[0] as Record<string, unknown>;
  return {
    id: Number(row.id),
    username: String(row.username),
    password_hash: String(row.password_hash),
  };
}

export async function createUser(username: string, passwordHash: string): Promise<UserRecord> {
  await ensureSchema();
  const sql = getSql();
  const existing = await findUserByUsername(username);
  if (existing) {
    throw new Error('Username already exists');
  }
  const rows = await sql`
    INSERT INTO users (username, password_hash)
    VALUES (${username}, ${passwordHash})
    RETURNING id, username, password_hash
  `;
  const row = rows[0] as Record<string, unknown>;
  return {
    id: Number(row.id),
    username: String(row.username),
    password_hash: String(row.password_hash),
  };
}

function mapUploadRow(row: Record<string, unknown>): PrescriptionUploadRecord {
  return {
    id: Number(row.id),
    user_id: row.user_id !== null && row.user_id !== undefined ? Number(row.user_id) : null,
    filename: String(row.filename ?? ''),
    mime_type: String(row.mime_type ?? ''),
    size_bytes: Number(row.size_bytes ?? 0),
    r2_bucket: String(row.r2_bucket ?? ''),
    r2_key: String(row.r2_key ?? ''),
    parser_model: String(row.parser_model ?? ''),
    extracted_text: String(row.extracted_text ?? ''),
    medication_count: Number(row.medication_count ?? 0),
    created_at:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at ?? ''),
  };
}

export async function savePrescriptionUpload(
  input: PrescriptionUploadInput
): Promise<PrescriptionUploadRecord> {
  await ensureSchema();
  const sql = getSql();
  const rows = await sql`
    INSERT INTO prescription_uploads (
      user_id, filename, mime_type, size_bytes, r2_bucket, r2_key,
      parser_model, extracted_text, medication_count
    ) VALUES (
      ${input.user_id ?? null},
      ${input.filename},
      ${input.mime_type},
      ${input.size_bytes},
      ${input.r2_bucket},
      ${input.r2_key},
      ${input.parser_model ?? ''},
      ${input.extracted_text ?? ''},
      ${input.medication_count ?? 0}
    )
    RETURNING
      id, user_id, filename, mime_type, size_bytes, r2_bucket, r2_key,
      parser_model, extracted_text, medication_count, created_at
  `;
  return mapUploadRow(rows[0] as Record<string, unknown>);
}

export async function getPrescriptionUpload(
  uploadId: number
): Promise<PrescriptionUploadRecord | null> {
  await ensureSchema();
  const sql = getSql();
  const rows = await sql`
    SELECT
      id, user_id, filename, mime_type, size_bytes, r2_bucket, r2_key,
      parser_model, extracted_text, medication_count, created_at
    FROM prescription_uploads
    WHERE id = ${uploadId}
    LIMIT 1
  `;
  return rows[0] ? mapUploadRow(rows[0] as Record<string, unknown>) : null;
}

export async function listPrescriptionUploads(
  limit = 50
): Promise<PrescriptionUploadRecord[]> {
  await ensureSchema();
  const sql = getSql();
  const safeLimit = Math.min(Math.max(1, Math.trunc(limit)), 100);
  const rows = await sql`
    SELECT
      id, user_id, filename, mime_type, size_bytes, r2_bucket, r2_key,
      parser_model, extracted_text, medication_count, created_at
    FROM prescription_uploads
    ORDER BY id DESC
    LIMIT ${safeLimit}
  `;
  return rows.map((row) => mapUploadRow(row as Record<string, unknown>));
}
