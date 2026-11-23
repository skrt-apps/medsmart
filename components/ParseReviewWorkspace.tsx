'use client';

import { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Plus,
  ShieldCheck,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  lookupMedications,
  matchMedicationName,
  MedicationMatch,
  PdfFormulation,
} from '@/lib/data/medication-catalog';
import { MedicationInput, MedicationRecord } from '@/lib/types';

export interface StagedCatalogItem {
  nonce: number;
  item: MedicationInput;
}

interface ParseReviewWorkspaceProps {
  uploadTriggerNonce: number;
  stagedItemQueue: StagedCatalogItem | null;
  onConfirmed: (saved: MedicationRecord[]) => void;
  onGoToMedications: () => void;
}

function findMatchingPdfFormulation(
  formulations: PdfFormulation[],
  dosage?: string
): PdfFormulation | undefined {
  if (!dosage || formulations.length === 0) return undefined;
  const norm = dosage.toLowerCase().replace(/\s+/g, '');
  return formulations.find((f) => {
    const fNorm = f.strength.toLowerCase().replace(/\s+/g, '');
    return fNorm && (norm.includes(fNorm) || fNorm.includes(norm));
  });
}

function enrichExtractedMedications(items: MedicationInput[]): MedicationInput[] {
  return items.map((item) => {
    const { best } = matchMedicationName(item.name || '');
    if (!best || best.score < 0.78) {
      return {
        ...item,
        generic_name: '',
        matched_brand: '',
        catalog_region: '',
        therapeutic_category: '',
        speciality: '',
        formulation_label: '',
        verified: false,
      };
    }

    const matchedForm = findMatchingPdfFormulation(best.pdf_formulations, item.dosage);

    if (best.match_kind === 'exact_generic' || best.match_kind === 'formulation') {
      return {
        ...item,
        generic_name: best.generic_name,
        matched_brand: '',
        catalog_region: best.registries.join(' / '),
        therapeutic_category: best.therapeutic_category,
        speciality: best.speciality,
        formulation_label:
          matchedForm?.label ||
          (best.match_kind === 'formulation' ? best.matched_label : ''),
        route: item.route || matchedForm?.route || best.default_route,
        verified: true,
      };
    }

    if (best.match_kind === 'brand_in' || best.match_kind === 'brand_us') {
      return {
        ...item,
        generic_name: best.generic_name,
        matched_brand: best.matched_label,
        catalog_region: best.registries.join(' / '),
        therapeutic_category: best.therapeutic_category,
        speciality: best.speciality,
        formulation_label: matchedForm?.label || '',
        route: item.route || matchedForm?.route || best.default_route,
        verified: false,
      };
    }

    return {
      ...item,
      generic_name: '',
      matched_brand: '',
      catalog_region: '',
      therapeutic_category: best.therapeutic_category,
      speciality: best.speciality,
      formulation_label: '',
      verified: false,
    };
  });
}

export default function ParseReviewWorkspace({
  uploadTriggerNonce,
  stagedItemQueue,
  onConfirmed,
  onGoToMedications,
}: ParseReviewWorkspaceProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [sourcePreview, setSourcePreview] = useState('No prescription file selected.');
  const [medications, setMedications] = useState<MedicationInput[]>([]);
  const [focusedRowIndex, setFocusedRowIndex] = useState<number | null>(null);
  const [userConfirmedCheckbox, setUserConfirmedCheckbox] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmedCount, setConfirmedCount] = useState<number | null>(null);
  const [lastStagedNonce, setLastStagedNonce] = useState(0);

  useEffect(() => {
    if (uploadTriggerNonce > 0) {
      fileInputRef.current?.click();
    }
  }, [uploadTriggerNonce]);

  if (stagedItemQueue && stagedItemQueue.nonce !== lastStagedNonce) {
    setLastStagedNonce(stagedItemQueue.nonce);
    setMedications((prev) => [...prev, stagedItemQueue.item]);
    setConfirmedCount(null);
    setUserConfirmedCheckbox(false);
    setErrorMessage('');
    setStatusMessage(`Staged ${stagedItemQueue.item.name} from catalog for review.`);
  }

  const verifiedCount = medications.filter((m) => Boolean(m.verified)).length;
  const allRowsVerified =
    medications.length > 0 && medications.every((m) => Boolean(m.verified) && m.name.trim());
  const canConfirm = allRowsVerified && userConfirmedCheckbox && !isConfirming;

  async function handleFileSelect(file: File | undefined) {
    if (!file) return;
    setSelectedFileName(file.name);
    setErrorMessage('');
    setConfirmedCount(null);
    setUserConfirmedCheckbox(false);
    setIsAnalyzing(true);
    setStatusMessage(`Analyzing ${file.name} via Gemini 3.5 Flash Lite...`);

    const lower = file.name.toLowerCase();
    const isPdf = file.type === 'application/pdf' || lower.endsWith('.pdf');
    const endpoint = isPdf ? '/api/upload-pdf' : '/api/upload-image';

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(endpoint, { method: 'POST', body: formData });
      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload.detail || 'Analysis failed');
      }

      const uploadId =
        payload?.upload && Number.isInteger(Number(payload.upload.id))
          ? Number(payload.upload.id)
          : null;
      const extracted: MedicationInput[] = Array.isArray(payload.medications)
        ? enrichExtractedMedications(payload.medications).map((m) => ({
            ...m,
            upload_id: uploadId,
          }))
        : [];
      setMedications(extracted);
      setSourcePreview(
        payload.extracted_text
          ? `${payload.extracted_text}\n\n---\n${JSON.stringify(extracted, null, 2)}`
          : extracted.length > 0
            ? JSON.stringify(extracted, null, 2)
            : 'No medications extracted.'
      );
      setStatusMessage(
        `${extracted.length} medication(s) extracted via ${payload.parser || 'gemini-3.5-flash-lite'}${
          payload.upload?.r2_key ? ' · stored in R2' : ''
        }`
      );
    } catch (err) {
      setMedications([]);
      setErrorMessage(err instanceof Error ? err.message : 'Analysis failed');
      setStatusMessage('');
    } finally {
      setIsAnalyzing(false);
    }
  }

  function updateMedicationField(
    index: number,
    field: keyof MedicationInput,
    value: string | number | boolean
  ) {
    setUserConfirmedCheckbox(false);
    setMedications((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        if (field === 'name') {
          return {
            ...item,
            name: String(value),
            formulation_label: '',
            verified: false,
          };
        }
        return { ...item, [field]: value };
      })
    );
  }

  function applyCatalogMatch(
    index: number,
    match: MedicationMatch,
    useGenericAsName: boolean
  ) {
    setUserConfirmedCheckbox(false);
    setFocusedRowIndex(null);
    setMedications((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        const chosenName = useGenericAsName
          ? match.generic_name
          : match.matched_label || item.name;
        const matchedForm = findMatchingPdfFormulation(
          match.pdf_formulations,
          item.dosage || match.common_dosages[0]
        );
        return {
          ...item,
          name: chosenName,
          generic_name: match.generic_name,
          matched_brand: useGenericAsName
            ? item.matched_brand ||
              (match.match_kind === 'brand_in' || match.match_kind === 'brand_us'
                ? match.matched_label
                : '')
            : match.matched_label,
          catalog_region: match.registries.join(' / '),
          therapeutic_category: match.therapeutic_category,
          speciality: match.speciality,
          formulation_label: matchedForm?.label || item.formulation_label || '',
          route: item.route || matchedForm?.route || match.default_route,
          dosage: item.dosage || matchedForm?.strength || match.common_dosages[0] || '',
          verified: true,
        };
      })
    );
  }

  function applyPdfFormulation(
    index: number,
    match: MedicationMatch,
    form: PdfFormulation
  ) {
    setUserConfirmedCheckbox(false);
    setMedications((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        return {
          ...item,
          name: item.name.trim() || match.generic_name,
          generic_name: match.generic_name,
          catalog_region: match.registries.join(' / '),
          therapeutic_category: match.therapeutic_category,
          speciality: match.speciality,
          formulation_label: form.label,
          dosage: form.strength || item.dosage,
          route: form.route || item.route,
          verified: true,
        };
      })
    );
  }

  function addEmptyRow() {
    const today = new Date().toISOString().slice(0, 10);
    setUserConfirmedCheckbox(false);
    setMedications((prev) => [
      ...prev,
      {
        name: '',
        dosage: '',
        frequency: '',
        route: 'oral',
        quantity: '30',
        doses_per_day: 1,
        refills: 0,
        start_date: today,
        verified: false,
      },
    ]);
  }

  function removeRow(index: number) {
    setUserConfirmedCheckbox(false);
    setMedications((prev) => prev.filter((_, idx) => idx !== index));
  }

  async function handleConfirm() {
    if (!canConfirm) return;
    setErrorMessage('');
    setIsConfirming(true);
    setStatusMessage('Saving medications...');

    try {
      const res = await fetch('/api/medications/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medications,
          confirmed_by_user: userConfirmedCheckbox,
        }),
      });
      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload.detail || 'Confirmation failed');
      }
      const saved: MedicationRecord[] = Array.isArray(payload.medications)
        ? payload.medications
        : [];
      setConfirmedCount(saved.length);
      setUserConfirmedCheckbox(false);
      setStatusMessage(
        `${saved.length} medication(s) confirmed with start date ${saved[0]?.start_date || 'today'}`
      );
      onConfirmed(saved);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Confirmation failed');
      setStatusMessage('');
    } finally {
      setIsConfirming(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[350px_1fr] lg:items-stretch">
      <section className="flex flex-col rounded-2xl border border-[#49454E] bg-[#2B2930] p-6">
        <div className="border-b border-[#49454E] pb-4">
          <h2 className="text-base font-bold tracking-[-0.02em] text-[#E6E1E5]">
            1. Upload
          </h2>
          <p className="mt-0.5 text-xs text-[#CAC4D0]">
            PDF &amp; image OCR via Gemini 3.5 Flash Lite (Gemini 4 Hydrogen fallback)
          </p>
        </div>

        <div className="mt-4">
          <label
            htmlFor="prescription-file"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              handleFileSelect(file);
            }}
            className="flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#938F99] bg-[#1C1B1F]/60 px-4 py-6 text-center transition-colors hover:border-[#D0BCFF] hover:bg-[#49454E]/30"
          >
            <Upload className="h-6 w-6 text-[#D0BCFF]" aria-hidden="true" />
            <span className="mt-2.5 text-sm font-semibold text-[#E6E1E5]">
              Choose PDF or prescription image
            </span>
            <span className="mt-1 text-xs text-[#CAC4D0]">
              Supports .pdf, .png, .jpg, .webp, .tif, and .bmp
            </span>
            {selectedFileName ? (
              <span className="mt-2 font-mono text-xs text-[#D0BCFF]">
                Selected: {selectedFileName}
              </span>
            ) : null}
          </label>
          <input
            ref={fileInputRef}
            id="prescription-file"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.bmp,.tif,.tiff,.webp"
            className="hidden"
            onChange={(e) => {
              handleFileSelect(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
        </div>

        <div className="mt-5 flex flex-1 flex-col">
          <h3 className="font-mono text-[11px] font-medium uppercase tracking-wider text-[#CAC4D0]">
            Extracted source
          </h3>
          {isAnalyzing ? (
            <div className="mt-2 space-y-2 rounded-lg border border-[#49454E] bg-[#1C1B1F] p-4">
              <div className="h-3.5 w-3/4 animate-pulse rounded bg-[#49454E]" />
              <div className="h-3.5 w-1/2 animate-pulse rounded bg-[#49454E]" />
              <div className="h-3.5 w-5/6 animate-pulse rounded bg-[#49454E]" />
            </div>
          ) : (
            <pre className="mt-2 max-h-[280px] flex-1 overflow-auto rounded-lg border border-[#49454E] bg-[#1C1B1F] p-3 font-mono text-xs leading-relaxed text-[#CAC4D0] whitespace-pre-wrap">
              {sourcePreview}
            </pre>
          )}
        </div>
      </section>

      <section className="flex flex-col rounded-2xl border border-[#49454E] bg-[#2B2930] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#49454E] pb-4">
          <div>
            <h2 className="text-base font-bold tracking-[-0.02em] text-[#E6E1E5]">
              2. Review &amp; validate
            </h2>
            <p className="mt-0.5 text-xs text-[#CAC4D0]">
              Matched locally against the 500-drug PDF + US (RxNorm) &amp; India (NLEM) catalog · Zero lookup tokens
            </p>
          </div>
          <button
            type="button"
            onClick={addEmptyRow}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#D0BCFF] bg-transparent px-4 py-2 text-xs font-semibold text-[#D0BCFF] transition-colors hover:bg-[#D0BCFF]/10 whitespace-nowrap shrink-0"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            Add Row
          </button>
        </div>

        {errorMessage ? (
          <div
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-lg border border-red-400/40 bg-red-950/50 px-3 py-2.5 text-xs text-red-200"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-300" aria-hidden="true" />
            <span>{errorMessage}</span>
          </div>
        ) : null}

        {statusMessage && !errorMessage ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#49454E] bg-[#1C1B1F] px-3 py-2.5 text-xs text-[#E6E1E5]">
            <span className="inline-flex items-center gap-1.5">
              {confirmedCount !== null ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-300" aria-hidden="true" />
              ) : null}
              <span>{statusMessage}</span>
            </span>
            {confirmedCount !== null ? (
              <button
                type="button"
                onClick={onGoToMedications}
                className="font-semibold text-[#D0BCFF] hover:underline"
              >
                View Saved Meds
              </button>
            ) : null}
          </div>
        ) : null}

        <div className="mt-4 flex-1 overflow-x-auto">
          {medications.length === 0 ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center rounded-xl border border-[#49454E] bg-[#1C1B1F]/40 p-8 text-center">
              <p className="text-sm font-medium text-[#E6E1E5]">
                No medications staged for review
              </p>
              <p className="mt-1.5 max-w-md text-xs text-[#CAC4D0]">
                Upload a prescription PDF or image on the left, stage a formulation from Catalog, or add a row manually to match generic equivalents.
              </p>
              <button
                type="button"
                onClick={addEmptyRow}
                className="mt-4 rounded-lg border border-[#D0BCFF] bg-transparent px-4 py-2 text-xs font-semibold text-[#D0BCFF] transition-colors hover:bg-[#D0BCFF]/10"
              >
                Add Row
              </button>
            </div>
          ) : (
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-[#49454E] text-[#CAC4D0]">
                  <th className="py-2 pr-2 font-semibold">Verified</th>
                  <th className="px-2 py-2 font-semibold">Medication &amp; Formulary Match</th>
                  <th className="px-2 py-2 font-semibold">Dosage</th>
                  <th className="px-2 py-2 font-semibold">Frequency</th>
                  <th className="px-2 py-2 font-semibold">Route</th>
                  <th className="px-2 py-2 text-right font-semibold">Qty</th>
                  <th className="px-2 py-2 text-right font-semibold">Doses/Day</th>
                  <th className="px-2 py-2 font-semibold">Start date</th>
                  <th className="py-2 pl-2 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {medications.map((med, index) => {
                  const { best, suggestions } = matchMedicationName(med.name || '');
                  const activeMatch =
                    best && best.score >= 0.78 ? best : null;
                  const typeAhead =
                    focusedRowIndex === index ? lookupMedications(med.name || '', 5) : [];

                  return (
                    <tr
                      key={index}
                      className="border-b border-[#49454E]/60 align-top hover:bg-[#49454E]/25"
                    >
                      <td className="py-2.5 pr-2">
                        <input
                          type="checkbox"
                          aria-label={`Verify medication ${index + 1}`}
                          checked={Boolean(med.verified)}
                          onChange={(e) =>
                            updateMedicationField(index, 'verified', e.target.checked)
                          }
                          className="mt-1.5 h-4 w-4 rounded border-[#938F99] bg-[#1C1B1F] accent-[#D0BCFF]"
                        />
                      </td>
                      <td className="relative px-2 py-2">
                        <input
                          type="text"
                          aria-label={`Medication ${index + 1} name`}
                          value={med.name}
                          onFocus={() => setFocusedRowIndex(index)}
                          onBlur={() => {
                            setTimeout(() => {
                              setFocusedRowIndex((cur) => (cur === index ? null : cur));
                            }, 160);
                          }}
                          onChange={(e) => updateMedicationField(index, 'name', e.target.value)}
                          className="w-full min-w-[180px] rounded border border-[#938F99] bg-[#1C1B1F] px-2 py-1 text-xs font-medium text-[#E6E1E5] focus:border-[#D0BCFF] focus:outline-none"
                        />

                        {typeAhead.length > 0 && focusedRowIndex === index ? (
                          <div className="absolute z-20 mt-1 w-80 rounded-lg border border-[#938F99] bg-[#2B2930] p-1 shadow-xl">
                            {typeAhead.map((option) => (
                              <button
                                key={`${option.generic_name}-${option.matched_label}`}
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  applyCatalogMatch(index, option, true);
                                }}
                                className="flex w-full flex-col rounded px-2.5 py-1.5 text-left hover:bg-[#49454E]"
                              >
                                <span className="text-xs font-semibold text-[#E6E1E5]">
                                  {option.generic_name}
                                </span>
                                <span className="text-[11px] text-[#CAC4D0]">
                                  {option.speciality} · {option.therapeutic_category}
                                </span>
                                <span className="text-[11px] text-[#CAC4D0]">
                                  US: {option.brands_us.slice(0, 2).join(', ') || '—'} · IN:{' '}
                                  {option.brands_in.slice(0, 2).join(', ') || '—'}
                                </span>
                              </button>
                            ))}
                          </div>
                        ) : null}

                        <div className="mt-1 space-y-1">
                          {activeMatch ? (
                            <p className="text-[11px] text-[#CAC4D0]">
                              {activeMatch.therapeutic_category} · {activeMatch.speciality}
                            </p>
                          ) : null}

                          {activeMatch &&
                          (activeMatch.match_kind === 'exact_generic' ||
                            activeMatch.match_kind === 'formulation') ? (
                            <p className="text-[11px] text-emerald-300">
                              Generic verified · {activeMatch.registries.join(' / ')}
                            </p>
                          ) : null}

                          {activeMatch &&
                          (activeMatch.match_kind === 'brand_in' ||
                            activeMatch.match_kind === 'brand_us') ? (
                            <div className="space-y-1">
                              <p className="text-[11px] text-amber-300">
                                {activeMatch.match_kind === 'brand_in'
                                  ? 'India Brand'
                                  : 'US Brand'}{' '}
                                → <span className="font-semibold">{activeMatch.generic_name}</span>
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => applyCatalogMatch(index, activeMatch, true)}
                                  className="rounded border border-[#D0BCFF]/50 bg-[#D0BCFF]/15 px-2 py-0.5 text-[11px] font-medium text-[#D0BCFF] hover:bg-[#D0BCFF]/25"
                                >
                                  Use {activeMatch.generic_name}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => applyCatalogMatch(index, activeMatch, false)}
                                  className="rounded border border-[#938F99]/60 bg-[#49454E] px-2 py-0.5 text-[11px] font-medium text-[#E6E1E5] hover:bg-[#49454E]/80"
                                >
                                  Keep {activeMatch.matched_label}
                                </button>
                              </div>
                            </div>
                          ) : null}

                          {activeMatch && activeMatch.pdf_formulations.length > 0 ? (
                            <select
                              aria-label={`Select PDF formulation for row ${index + 1}`}
                              value={med.formulation_label || ''}
                              onChange={(e) => {
                                const chosen = activeMatch.pdf_formulations.find(
                                  (f) => f.label === e.target.value
                                );
                                if (chosen) {
                                  applyPdfFormulation(index, activeMatch, chosen);
                                }
                              }}
                              className="w-full max-w-[230px] rounded border border-[#938F99] bg-[#1C1B1F] px-2 py-1 text-[11px] text-[#E6E1E5] focus:border-[#D0BCFF] focus:outline-none"
                            >
                              <option value="">
                                Select PDF strength ({activeMatch.pdf_formulations.length})...
                              </option>
                              {activeMatch.pdf_formulations.map((form) => (
                                <option key={form.sl_no} value={form.label}>
                                  #{form.sl_no} · {form.label}
                                </option>
                              ))}
                            </select>
                          ) : null}

                          {(!activeMatch || activeMatch.match_kind === 'fuzzy') &&
                          suggestions.length > 0 ? (
                            <div className="space-y-1">
                              <p className="text-[11px] text-amber-300">
                                Closest catalog matches:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {suggestions.slice(0, 3).map((sug) => (
                                  <button
                                    key={sug.generic_name}
                                    type="button"
                                    onClick={() => applyCatalogMatch(index, sug, true)}
                                    className="rounded border border-[#938F99]/60 bg-[#49454E] px-2 py-0.5 text-[11px] font-medium text-[#E6E1E5] hover:border-[#D0BCFF] hover:text-[#D0BCFF]"
                                  >
                                    {sug.generic_name}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ) : null}

                          {suggestions.length === 0 && med.name.trim().length > 0 ? (
                            <p className="text-[11px] text-[#CAC4D0]">
                              Unlisted in catalog — check box if name is correct
                            </p>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="text"
                          aria-label={`Medication ${index + 1} dosage`}
                          value={med.dosage || ''}
                          onChange={(e) => updateMedicationField(index, 'dosage', e.target.value)}
                          className="w-full min-w-[70px] rounded border border-[#938F99] bg-[#1C1B1F] px-2 py-1 font-mono text-xs text-[#E6E1E5] focus:border-[#D0BCFF] focus:outline-none"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="text"
                          aria-label={`Medication ${index + 1} frequency`}
                          value={med.frequency || ''}
                          onChange={(e) =>
                            updateMedicationField(index, 'frequency', e.target.value)
                          }
                          className="w-full min-w-[82px] rounded border border-[#938F99] bg-[#1C1B1F] px-2 py-1 text-xs text-[#E6E1E5] focus:border-[#D0BCFF] focus:outline-none"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="text"
                          aria-label={`Medication ${index + 1} route`}
                          value={med.route || ''}
                          onChange={(e) => updateMedicationField(index, 'route', e.target.value)}
                          className="w-full min-w-[60px] rounded border border-[#938F99] bg-[#1C1B1F] px-2 py-1 text-xs text-[#E6E1E5] focus:border-[#D0BCFF] focus:outline-none"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="text"
                          aria-label={`Medication ${index + 1} quantity`}
                          value={med.quantity ?? ''}
                          onChange={(e) => updateMedicationField(index, 'quantity', e.target.value)}
                          className="w-14 rounded border border-[#938F99] bg-[#1C1B1F] px-2 py-1 text-right font-mono text-xs tabular-nums text-[#E6E1E5] focus:border-[#D0BCFF] focus:outline-none"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          min={1}
                          aria-label={`Medication ${index + 1} doses per day`}
                          value={med.doses_per_day ?? 1}
                          onChange={(e) =>
                            updateMedicationField(
                              index,
                              'doses_per_day',
                              Math.max(1, Number(e.target.value) || 1)
                            )
                          }
                          className="w-14 rounded border border-[#938F99] bg-[#1C1B1F] px-2 py-1 text-right font-mono text-xs tabular-nums text-[#E6E1E5] focus:border-[#D0BCFF] focus:outline-none"
                        />
                      </td>
                      <td className="px-2 py-2 font-mono text-xs tabular-nums text-[#CAC4D0] whitespace-nowrap">
                        {med.start_date || 'Today'}
                      </td>
                      <td className="py-2 pl-2 text-right">
                        <button
                          type="button"
                          aria-label={`Remove ${med.name || 'medication row'}`}
                          onClick={() => removeRow(index)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded border border-[#49454E] text-[#CAC4D0] transition-colors hover:border-red-400/50 hover:bg-red-950/40 hover:text-red-300"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-6 space-y-3 border-t border-[#49454E] pt-4">
          {medications.length > 0 ? (
            <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-[#49454E] bg-[#1C1B1F] p-3 text-xs text-[#CAC4D0]">
              <input
                type="checkbox"
                checked={userConfirmedCheckbox}
                onChange={(e) => setUserConfirmedCheckbox(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#938F99] bg-[#1C1B1F] accent-[#D0BCFF]"
              />
              <span>
                <span className="font-semibold text-[#E6E1E5]">
                  Confirm accuracy before saving:
                </span>{' '}
                I have reviewed each medication name, generic/brand match, dosage, and start date above.
              </span>
            </label>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="inline-flex items-center gap-1.5 font-mono text-xs tabular-nums text-[#CAC4D0]">
              <ShieldCheck className="h-3.5 w-3.5 text-[#D0BCFF]" aria-hidden="true" />
              {verifiedCount}/{medications.length} rows verified
            </span>
            <button
              type="button"
              disabled={!canConfirm}
              onClick={handleConfirm}
              className="rounded-lg bg-[#D0BCFF] px-6 py-2.5 text-xs font-semibold text-[#381E72] transition-colors hover:bg-[#E0D2FF] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {isConfirming ? 'Saving...' : 'Confirm medications'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
