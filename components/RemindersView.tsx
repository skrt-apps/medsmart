'use client';

import { useState } from 'react';
import { AlertCircle, BellRing, CheckCircle2, Clock, Trash2 } from 'lucide-react';
import { MedicationRecord, ReminderWithMedication } from '@/lib/types';

interface RemindersViewProps {
  medications: MedicationRecord[];
  reminders: ReminderWithMedication[];
  dueIds: number[];
  preselectedMedicationId: number | null;
  onRefresh: () => void;
  onCheckDue: () => Promise<void>;
  onGoToParser: () => void;
}

export default function RemindersView({
  medications,
  reminders,
  dueIds,
  preselectedMedicationId,
  onRefresh,
  onCheckDue,
  onGoToParser,
}: RemindersViewProps) {
  const [medicationId, setMedicationId] = useState<string>(
    preselectedMedicationId
      ? String(preselectedMedicationId)
      : medications[0]
        ? String(medications[0].id)
        : ''
  );
  const [remindAt, setRemindAt] = useState(new Date().toISOString().slice(0, 10));
  const [enabled, setEnabled] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const effectiveMedicationId =
    medicationId || (medications[0] ? String(medications[0].id) : '');

  async function handleCreateReminder(e: React.FormEvent) {
    e.preventDefault();
    if (!effectiveMedicationId) return;
    setError('');
    setStatus('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medication_id: Number(effectiveMedicationId),
          remind_at: remindAt,
          enabled,
        }),
      });
      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload.detail || 'Could not create reminder');
      }
      setStatus('Reminder created.');
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create reminder');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggle(reminder: ReminderWithMedication) {
    await fetch(`/api/reminders/${reminder.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: !reminder.enabled }),
    });
    onRefresh();
  }

  async function handleDelete(id: number) {
    await fetch(`/api/reminders/${id}`, { method: 'DELETE' });
    onRefresh();
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <section className="rounded-2xl border border-[#49454E] bg-[#2B2930] p-6 lg:col-span-5">
        <div className="border-b border-[#49454E] pb-4">
          <h2 className="text-base font-bold tracking-[-0.02em] text-[#E6E1E5]">
            Schedule reminder
          </h2>
          <p className="mt-0.5 text-xs text-[#CAC4D0]">
            Link a refill or dose check date to any confirmed medication
          </p>
        </div>

        {medications.length === 0 ? (
          <div className="mt-6 flex min-h-[180px] flex-col items-center justify-center rounded-xl border border-[#49454E] bg-[#1C1B1F]/40 px-4 text-center">
            <p className="text-xs text-[#CAC4D0]">
              Confirm at least one medication before creating reminders.
            </p>
            <button
              type="button"
              onClick={onGoToParser}
              className="mt-3 rounded-lg bg-[#D0BCFF] px-5 py-2.5 text-xs font-semibold text-[#381E72] hover:bg-[#E0D2FF]"
            >
              Open Prescription Parser
            </button>
          </div>
        ) : (
          <form onSubmit={handleCreateReminder} className="mt-4 space-y-4">
            <div>
              <label
                htmlFor="reminder-medication"
                className="block text-xs font-medium text-[#CAC4D0]"
              >
                Medication
              </label>
              <select
                id="reminder-medication"
                value={effectiveMedicationId}
                onChange={(e) => setMedicationId(e.target.value)}
                className="mt-1.5 w-full rounded border border-[#938F99] bg-[#1C1B1F] px-3 py-2 text-xs text-[#E6E1E5] focus:border-[#D0BCFF] focus:outline-none"
              >
                {medications.map((med) => (
                  <option key={med.id} value={med.id}>
                    #{med.id} · {med.name} ({med.dosage || 'standard'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="reminder-date"
                className="block text-xs font-medium text-[#CAC4D0]"
              >
                Remind At
              </label>
              <input
                id="reminder-date"
                type="date"
                required
                value={remindAt}
                onChange={(e) => setRemindAt(e.target.value)}
                className="mt-1.5 w-full rounded border border-[#938F99] bg-[#1C1B1F] px-3 py-2 font-mono text-xs tabular-nums text-[#E6E1E5] focus:border-[#D0BCFF] focus:outline-none"
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-[#E6E1E5]">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-[#938F99] bg-[#1C1B1F] accent-[#D0BCFF]"
              />
              Enable reminder notifications
            </label>

            {error ? (
              <div className="flex items-center gap-2 rounded-lg border border-red-400/40 bg-red-950/40 px-3 py-2 text-xs text-red-200">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-300" aria-hidden="true" />
                <span>{error}</span>
              </div>
            ) : null}

            {status ? (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-400/40 bg-emerald-950/40 px-3 py-2 text-xs text-emerald-200">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />
                <span>{status}</span>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-[#D0BCFF] px-5 py-2.5 text-xs font-semibold text-[#381E72] transition-colors hover:bg-[#E0D2FF] disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Reminder'}
            </button>
          </form>
        )}
      </section>

      <section className="rounded-2xl border border-[#49454E] bg-[#2B2930] p-6 lg:col-span-7">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#49454E] pb-4">
          <div>
            <h2 className="text-base font-bold tracking-[-0.02em] text-[#E6E1E5]">
              Active &amp; due reminders
            </h2>
            <p className="mt-0.5 text-xs text-[#CAC4D0]">
              Due reminders have remind_at on or before today
            </p>
          </div>
          <button
            type="button"
            onClick={onCheckDue}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#D0BCFF] bg-transparent px-3.5 py-2 text-xs font-semibold text-[#D0BCFF] transition-colors hover:bg-[#D0BCFF]/10 whitespace-nowrap shrink-0"
          >
            <BellRing className="h-3.5 w-3.5" aria-hidden="true" />
            Check Due Reminders
          </button>
        </div>

        {reminders.length === 0 ? (
          <div className="mt-6 flex min-h-[200px] items-center justify-center rounded-xl border border-[#49454E] bg-[#1C1B1F]/40 px-6 text-center text-xs text-[#CAC4D0]">
            No reminders scheduled yet.
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-[#49454E] text-[#CAC4D0]">
                  <th className="py-2.5 pr-3 font-semibold">Medication</th>
                  <th className="px-3 py-2.5 font-semibold">Remind At</th>
                  <th className="px-3 py-2.5 font-semibold">Status</th>
                  <th className="py-2.5 pl-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reminders.map((rem) => {
                  const isDue = rem.enabled && dueIds.includes(rem.id);
                  return (
                    <tr
                      key={rem.id}
                      className="border-b border-[#49454E]/60 hover:bg-[#49454E]/25"
                    >
                      <td className="py-2.5 pr-3 font-semibold text-[#E6E1E5]">
                        {rem.name}
                      </td>
                      <td className="px-3 py-2.5 font-mono tabular-nums text-[#E6E1E5]">
                        {rem.remind_at}
                      </td>
                      <td className="px-3 py-2.5">
                        {isDue ? (
                          <span className="inline-flex items-center gap-1 font-medium text-amber-300">
                            <BellRing className="h-3.5 w-3.5" aria-hidden="true" />
                            Due now
                          </span>
                        ) : rem.enabled ? (
                          <span className="inline-flex items-center gap-1 font-medium text-emerald-300">
                            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                            Scheduled
                          </span>
                        ) : (
                          <span className="text-[#CAC4D0]">Paused</span>
                        )}
                      </td>
                      <td className="py-2.5 pl-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggle(rem)}
                            className="rounded border border-[#938F99]/60 px-2.5 py-1 text-xs font-medium text-[#E6E1E5] hover:border-[#D0BCFF] hover:text-[#D0BCFF]"
                          >
                            {rem.enabled ? 'Pause' : 'Enable'}
                          </button>
                          <button
                            type="button"
                            aria-label={`Delete reminder for ${rem.name}`}
                            onClick={() => handleDelete(rem.id)}
                            className="inline-flex h-7 w-7 items-center justify-center rounded border border-[#938F99]/60 text-[#CAC4D0] hover:border-red-400/50 hover:bg-red-950/40 hover:text-red-300"
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
