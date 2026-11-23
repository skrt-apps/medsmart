export interface MedicationInput {
  name: string;
  dosage?: string;
  frequency?: string;
  route?: string;
  duration?: string;
  instructions?: string;
  quantity?: string | number;
  refills?: number;
  doses_per_day?: number;
  start_date?: string;
  user_id?: number | null;
  upload_id?: number | null;
  generic_name?: string;
  matched_brand?: string;
  catalog_region?: string;
  therapeutic_category?: string;
  speciality?: string;
  formulation_label?: string;
  verified?: boolean;
}

export interface MedicationRecord {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  duration: string;
  instructions: string;
  quantity: string;
  refills: number;
  doses_per_day: number;
  start_date: string;
  user_id: number | null;
  upload_id?: number | null;
  generic_name: string;
  matched_brand: string;
  catalog_region: string;
  therapeutic_category: string;
  speciality: string;
  formulation_label: string;
  verified: boolean;
}

export interface RefillSchedule {
  days_supply: number;
  next_refill_date: string;
  remaining_refills: number;
}

export interface ReminderRecord {
  id: number;
  medication_id: number;
  remind_at: string;
  enabled: boolean;
}

export interface ReminderWithMedication extends ReminderRecord {
  name: string;
  start_date: string;
}

export interface UserRecord {
  id: number;
  username: string;
  password_hash: string;
}

export interface PrescriptionUploadInput {
  user_id?: number | null;
  filename: string;
  mime_type: string;
  size_bytes: number;
  r2_bucket: string;
  r2_key: string;
  parser_model?: string;
  extracted_text?: string;
  medication_count?: number;
}

export interface PrescriptionUploadRecord {
  id: number;
  user_id: number | null;
  filename: string;
  mime_type: string;
  size_bytes: number;
  r2_bucket: string;
  r2_key: string;
  parser_model: string;
  extracted_text: string;
  medication_count: number;
  created_at: string;
}

export interface UploadedFileSummary {
  id: number;
  r2_key: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
}

export interface ParseResult {
  medications: MedicationInput[];
  extracted_text?: string;
  parser: string;
  upload?: UploadedFileSummary | null;
}
