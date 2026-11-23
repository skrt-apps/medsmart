'use client';

import { useMemo, useState } from 'react';
import { AlertCircle, BellPlus, CalendarClock, Search, Trash2 } from 'lucide-react';
import {
  getCatalogSpecialityInfo,
  SPECIALITIES,
} from '@/lib/data/medication-catalog';
import { MedicationRecord, RefillSchedule } from '@/lib/types';

type GroupMode = 'table' | 'speciality' | 'category';

interface SavedMedicationsViewProps {
  medications: MedicationRecord[];
  isLoading: boolean;
  onRefresh: () => void;
  onGoToParser: () => void;
  onScheduleReminder: (medicationId: number) => void;
}

interface EnrichedMedication {
  med: MedicationRecord;
  speciality: string;
  therapeuticCategory: string;
}

export default function SavedMedicationsView({
  medications,
  isLoading,
  onRefresh,
  onGoToParser,
  onScheduleReminder,
}: SavedMedicationsViewProps) {
  const [query, setQuery] = useState('');
  const [groupMode, setGroupMode] = useState<GroupMode>('table');
  const [specialityFilter, setSpecialityFilter] = useState<string>('All');
  const [selectedMed, setSelectedMed] = useState<MedicationRecord | null>(null);
  const [refillResult, setRefillResult] = useState<RefillSchedule | null>(null);
  const [refillError, setRefillError] = useState('');
  const [calculatingId, setCalculatingId] = useState<number | null>(null);

  const enriched: EnrichedMedication[] = useMemo(() => {
    return medications.map((med) => {
      if (med.speciality && med.therapeutic_category) {
        return {
          med,
          speciality: med.speciality,
          therapeuticCategory: med.therapeutic_category,
        };
      }
      const fallback = getCatalogSpecialityInfo(med.generic_name || med.name);
      return {
        med,
        speciality: med.speciality || fallback.speciality,
        therapeuticCategory: med.therapeutic_category || fallback.therapeutic_category,
      };
    });
  }, [medications]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return enriched.filter(({ med, speciality, therapeuticCategory }) => {
      if (specialityFilter !== 'All' && speciality !== specialityFilter) {
        return false;
      }
      if (!q) return true;
      return [
        med.name,
        med.generic_name,
        med.dosage,
        med.frequency,
        med.route,
        med.start_date,
        speciality,
        therapeuticCategory,
        med.formulation_label,
      ].some((field) => (field || '').toLowerCase().includes(q));
    });
  }, [enriched, query, specialityFilter]);

  const groupedSections = useMemo(() => {
    if (groupMode === 'table') {
      return [{ label: 'All Saved Medications', items: filtered }];
    }
    const groups = new Map<string, EnrichedMedication[]>();
    for (const entry of filtered) {
      const key =
        groupMode === 'speciality' ? entry.speciality : entry.therapeuticCategory;
      const list = groups.get(key) ?? [];
      list.push(entry);
      groups.set(key, list);
    }
    return Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([label, items]) => ({ label, items }));
  }, [filtered, groupMode]);

  async function handleInspectRefill(med: MedicationRecord) {
    setSelectedMed(med);
    setRefillResult(null);
    setRefillError('');
    setCalculatingId(med.id);

    try {
      const res = await fetch(`/api/medications/${med.id}/refills`);
      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload.detail || 'Could not compute refill schedule');
      }
      setRefillResult(payload as RefillSchedule);
    } catch (err) {
      setRefillError(
        err instanceof Error ? err.message : 'Could not compute refill schedule'
      );
    } finally {
      setCalculatingId(null);
    }
  }

  async function handleDelete(id: number) {
    const res = await fetch(`/api/medications/${id}`, { method: 'DELETE' });
    if (res.ok) {
      if (selectedMed?.id === id) {
        setSelectedMed(null);
        setRefillResult(null);
        setRefillError('');
      }
      onRefresh();
    }
  }

  function renderMedicationTable(entries: EnrichedMedication[]) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-[#49454E] text-[#CAC4D0]">
              <th className="py-2.5 pr-3 font-semibold">ID</th>
              <th className="px-3 py-2.5 font-semibold">Medication &amp; Classification</th>
              <th className="px-3 py-2.5 font-semibold">Dosage</th>
              <th className="px-3 py-2.5 font-semibold">Frequency</th>
              <th className="px-3 py-2.5 font-semibold">Route</th>
              <th className="px-3 py-2.5 text-right font-semibold">Qty</th>
              <th className="px-3 py-2.5 text-right font-semibold">Doses/Day</th>
              <th className="px-3 py-2.5 text-right font-semibold">Refills</th>
              <th className="px-3 py-2.5 font-semibold">Start Date</th>
              <th className="py-2.5 pl-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(({ med, speciality, therapeuticCategory }) => (
              <tr
                key={med.id}
                className="border-b border-[#49454E]/60 hover:bg-[#49454E]/25"
              >
                <td className="py-2.5 pr-3 font-mono tabular-nums text-[#CAC4D0]">
                  #{med.id}
                </td>
                <td className="px-3 py-2.5">
                  <div className="font-semibold text-[#E6E1E5]">
                    {med.name}
                  </div>
                  <div className="mt-0.5 text-[11px] text-[#CAC4D0]">
                    {speciality} · {therapeuticCategory}
                  </div>
                  {med.generic_name &&
                  med.generic_name.toLowerCase() !== med.name.toLowerCase() ? (
                    <div className="mt-0.5 text-[11px] text-[#CAC4D0]">
                      Generic: {med.generic_name}
                      {med.catalog_region ? ` · ${med.catalog_region}` : ''}
                    </div>
                  ) : med.catalog_region ? (
                    <div className="mt-0.5 text-[11px] text-[#CAC4D0]">
                      {med.catalog_region}
                    </div>
                  ) : null}
                  {med.formulation_label ? (
                    <div className="mt-0.5 font-mono text-[11px] text-[#D0BCFF]">
                      {med.formulation_label}
                    </div>
                  ) : null}
                </td>
                <td className="px-3 py-2.5 font-mono text-[#E6E1E5]">
                  {med.dosage || '—'}
                </td>
                <td className="px-3 py-2.5 text-[#E6E1E5]">
                  {med.frequency || '—'}
                </td>
                <td className="px-3 py-2.5 text-[#CAC4D0]">
                  {med.route || '—'}
                </td>
                <td className="px-3 py-2.5 text-right font-mono tabular-nums text-[#E6E1E5]">
                  {med.quantity || '—'}
                </td>
                <td className="px-3 py-2.5 text-right font-mono tabular-nums text-[#E6E1E5]">
                  {med.doses_per_day}
                </td>
                <td className="px-3 py-2.5 text-right font-mono tabular-nums text-[#E6E1E5]">
                  {med.refills}
                </td>
                <td className="px-3 py-2.5 font-mono tabular-nums text-[#E6E1E5]">
                  {med.start_date}
                </td>
                <td className="py-2.5 pl-3 text-right">
                  <div className="inline-flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleInspectRefill(med)}
                      className="inline-flex items-center gap-1 rounded border border-[#938F99]/60 px-2.5 py-1 text-xs font-medium text-[#E6E1E5] hover:border-[#D0BCFF] hover:text-[#D0BCFF] whitespace-nowrap"
                    >
                      <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
                      {calculatingId === med.id ? 'Checking...' : 'Refill'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onScheduleReminder(med.id)}
                      className="inline-flex items-center gap-1 rounded border border-[#938F99]/60 px-2.5 py-1 text-xs font-medium text-[#E6E1E5] hover:border-[#D0BCFF] hover:text-[#D0BCFF] whitespace-nowrap"
                    >
                      <BellPlus className="h-3.5 w-3.5" aria-hidden="true" />
                      Remind
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${med.name}`}
                      onClick={() => handleDelete(med.id)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded border border-[#938F99]/60 text-[#CAC4D0] hover:border-red-400/50 hover:bg-red-950/40 hover:text-red-300"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[#49454E] bg-[#2B2930] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#49454E] pb-4">
          <div>
            <h2 className="text-base font-bold tracking-[-0.02em] text-[#E6E1E5]">
              Saved medications
            </h2>
            <p className="mt-0.5 text-xs text-[#CAC4D0]">
              Confirmed prescriptions grouped by Medical Speciality or Therapeutic Category
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1 rounded-lg bg-[#1C1B1F] p-1">
              {(
                [
                  { id: 'table', label: 'Table' },
                  { id: 'speciality', label: 'By Speciality' },
                  { id: 'category', label: 'By Category' },
                ] as const
              ).map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setGroupMode(mode.id)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    groupMode === mode.id
                      ? 'bg-[#D0BCFF] text-[#381E72]'
                      : 'text-[#CAC4D0] hover:text-[#E6E1E5]'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            <select
              aria-label="Filter saved medications by speciality"
              value={specialityFilter}
              onChange={(e) => setSpecialityFilter(e.target.value)}
              className="rounded border border-[#938F99] bg-[#1C1B1F] px-3 py-2 text-xs text-[#E6E1E5] focus:border-[#D0BCFF] focus:outline-none"
            >
              <option value="All">All Specialities</option>
              {SPECIALITIES.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>

            <div className="relative w-full sm:w-64">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[#938F99]"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter saved medications..."
                className="w-full rounded border border-[#938F99] bg-[#1C1B1F] py-2 pr-3 pl-9 text-xs text-[#E6E1E5] placeholder:text-[#938F99] focus:border-[#D0BCFF] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="mt-4 space-y-2">
            <div className="h-10 animate-pulse rounded bg-[#49454E]" />
            <div className="h-10 animate-pulse rounded bg-[#49454E]" />
          </div>
        ) : medications.length === 0 ? (
          <div className="mt-6 flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-[#49454E] bg-[#1C1B1F]/40 px-6 text-center">
            <p className="text-sm font-medium text-[#E6E1E5]">
              No saved medications yet
            </p>
            <p className="mt-1 max-w-md text-xs text-[#CAC4D0]">
              Upload a prescription PDF or image and click Confirm medications to store entries with today&apos;s start date.
            </p>
            <button
              type="button"
              onClick={onGoToParser}
              className="mt-4 rounded-lg bg-[#D0BCFF] px-5 py-2.5 text-xs font-semibold text-[#381E72] transition-colors hover:bg-[#E0D2FF]"
            >
              Open Prescription Parser
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-6 flex min-h-[160px] flex-col items-center justify-center rounded-xl border border-[#49454E] bg-[#1C1B1F]/40 px-6 text-center">
            <p className="text-xs text-[#CAC4D0]">
              No saved medications match the active search or speciality filter.
            </p>
          </div>
        ) : groupMode === 'table' ? (
          <div className="mt-4">{renderMedicationTable(filtered)}</div>
        ) : (
          <div className="mt-4 space-y-5">
            {groupedSections.map((group) => (
              <div
                key={group.label}
                className="overflow-hidden rounded-xl border border-[#49454E]"
              >
                <div className="flex items-center justify-between border-b border-[#49454E] bg-[#49454E]/50 px-4 py-2.5">
                  <span className="text-xs font-semibold text-[#E6E1E5]">
                    {group.label}
                  </span>
                  <span className="font-mono text-[11px] tabular-nums text-[#CAC4D0]">
                    {group.items.length} medication(s)
                  </span>
                </div>
                <div className="px-3">{renderMedicationTable(group.items)}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {selectedMed ? (
        <section className="rounded-2xl border border-[#49454E] bg-[#2B2930] p-6">
          <div className="flex items-center justify-between border-b border-[#49454E] pb-3">
            <h3 className="text-sm font-bold text-[#E6E1E5]">
              Refill Schedule · {selectedMed.name}
            </h3>
            <span className="font-mono text-xs tabular-nums text-[#CAC4D0]">
              Start {selectedMed.start_date}
            </span>
          </div>

          {refillError ? (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-amber-400/40 bg-amber-950/40 px-3 py-2.5 text-xs text-amber-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-300" aria-hidden="true" />
              <span>
                {refillError}. Use the Refills tab to calculate with custom quantity and doses per day.
              </span>
            </div>
          ) : null}

          {refillResult ? (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-[#49454E] p-4">
                <p className="font-mono text-[11px] uppercase tracking-wider text-[#CAC4D0]">
                  Days Supply
                </p>
                <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-[#E6E1E5]">
                  {refillResult.days_supply}d
                </p>
              </div>
              <div className="rounded-xl bg-[#49454E] p-4">
                <p className="font-mono text-[11px] uppercase tracking-wider text-[#CAC4D0]">
                  Next Refill Date
                </p>
                <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-[#E6E1E5]">
                  {refillResult.next_refill_date}
                </p>
              </div>
              <div className="rounded-xl bg-[#49454E] p-4">
                <p className="font-mono text-[11px] uppercase tracking-wider text-[#CAC4D0]">
                  Remaining Refills
                </p>
                <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-[#E6E1E5]">
                  {refillResult.remaining_refills}
                </p>
              </div>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
