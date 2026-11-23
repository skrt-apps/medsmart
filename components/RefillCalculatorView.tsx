'use client';

import { useState } from 'react';
import { AlertCircle, Calculator } from 'lucide-react';
import { MedicationRecord, RefillSchedule } from '@/lib/types';

interface RefillCalculatorViewProps {
  medications: MedicationRecord[];
}

export default function RefillCalculatorView({
  medications,
}: RefillCalculatorViewProps) {
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [quantity, setQuantity] = useState('30');
  const [dosesPerDay, setDosesPerDay] = useState('1');
  const [refills, setRefills] = useState('2');
  const [schedule, setSchedule] = useState<RefillSchedule | null>(null);
  const [error, setError] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);

  function loadFromMedication(idStr: string) {
    const id = Number(idStr);
    const med = medications.find((m) => m.id === id);
    if (!med) return;
    setStartDate(med.start_date || new Date().toISOString().slice(0, 10));
    setQuantity(med.quantity || '30');
    setDosesPerDay(String(med.doses_per_day || 1));
    setRefills(String(med.refills ?? 0));
    setError('');
  }

  async function handleCalculate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsCalculating(true);
    try {
      const res = await fetch('/api/medications/refills/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_date: startDate,
          quantity: Number(quantity),
          doses_per_day: Number(dosesPerDay),
          refills: Number(refills),
        }),
      });
      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload.detail || 'Refill calculation failed');
      }
      setSchedule(payload as RefillSchedule);
    } catch (err) {
      setSchedule(null);
      setError(err instanceof Error ? err.message : 'Refill calculation failed');
    } finally {
      setIsCalculating(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <section className="rounded-2xl border border-[#49454E] bg-[#2B2930] p-6 lg:col-span-6">
        <div className="border-b border-[#49454E] pb-4">
          <h2 className="text-base font-bold tracking-[-0.02em] text-[#E6E1E5]">
            Refill schedule calculator
          </h2>
          <p className="mt-0.5 text-xs text-[#CAC4D0]">
            Computes supply days and next refill date from confirmation start date
          </p>
        </div>

        {medications.length > 0 ? (
          <div className="mt-4">
            <label
              htmlFor="preset-med"
              className="block text-xs font-medium text-[#CAC4D0]"
            >
              Pre-fill from saved medication
            </label>
            <select
              id="preset-med"
              defaultValue=""
              onChange={(e) => loadFromMedication(e.target.value)}
              className="mt-1.5 w-full rounded border border-[#938F99] bg-[#1C1B1F] px-3 py-2 text-xs text-[#E6E1E5] focus:border-[#D0BCFF] focus:outline-none"
            >
              <option value="" disabled>
                Select a saved medication...
              </option>
              {medications.map((med) => (
                <option key={med.id} value={med.id}>
                  #{med.id} · {med.name} ({med.dosage || 'standard'})
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <form onSubmit={handleCalculate} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="refill-start-date"
                className="block text-xs font-medium text-[#CAC4D0]"
              >
                Start Date
              </label>
              <input
                id="refill-start-date"
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1.5 w-full rounded border border-[#938F99] bg-[#1C1B1F] px-3 py-2 font-mono text-xs tabular-nums text-[#E6E1E5] focus:border-[#D0BCFF] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="refill-quantity"
                className="block text-xs font-medium text-[#CAC4D0]"
              >
                Quantity Dispensed
              </label>
              <input
                id="refill-quantity"
                type="number"
                min={0}
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="mt-1.5 w-full rounded border border-[#938F99] bg-[#1C1B1F] px-3 py-2 font-mono text-xs tabular-nums text-[#E6E1E5] focus:border-[#D0BCFF] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="refill-doses"
                className="block text-xs font-medium text-[#CAC4D0]"
              >
                Doses Per Day
              </label>
              <input
                id="refill-doses"
                type="number"
                min={1}
                required
                value={dosesPerDay}
                onChange={(e) => setDosesPerDay(e.target.value)}
                className="mt-1.5 w-full rounded border border-[#938F99] bg-[#1C1B1F] px-3 py-2 font-mono text-xs tabular-nums text-[#E6E1E5] focus:border-[#D0BCFF] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="refill-count"
                className="block text-xs font-medium text-[#CAC4D0]"
              >
                Authorized Refills
              </label>
              <input
                id="refill-count"
                type="number"
                min={0}
                required
                value={refills}
                onChange={(e) => setRefills(e.target.value)}
                className="mt-1.5 w-full rounded border border-[#938F99] bg-[#1C1B1F] px-3 py-2 font-mono text-xs tabular-nums text-[#E6E1E5] focus:border-[#D0BCFF] focus:outline-none"
              />
            </div>
          </div>

          {error ? (
            <div className="flex items-center gap-2 rounded-lg border border-red-400/40 bg-red-950/40 px-3 py-2 text-xs text-red-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-300" aria-hidden="true" />
              <span>{error}</span>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isCalculating}
            className="inline-flex items-center gap-2 rounded-lg bg-[#D0BCFF] px-5 py-2.5 text-xs font-semibold text-[#381E72] transition-colors hover:bg-[#E0D2FF] disabled:opacity-50"
          >
            <Calculator className="h-3.5 w-3.5" aria-hidden="true" />
            {isCalculating ? 'Calculating...' : 'Calculate Schedule'}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-[#49454E] bg-[#2B2930] p-6 lg:col-span-6">
        <div className="border-b border-[#49454E] pb-4">
          <h2 className="text-base font-bold tracking-[-0.02em] text-[#E6E1E5]">
            Schedule projection
          </h2>
          <p className="mt-0.5 text-xs text-[#CAC4D0]">
            Output from /api/medications/refills/calculate
          </p>
        </div>

        {!schedule ? (
          <div className="mt-6 flex min-h-[200px] items-center justify-center rounded-xl border border-[#49454E] bg-[#1C1B1F]/40 px-6 text-center text-xs text-[#CAC4D0]">
            Enter medication supply details and click Calculate Schedule to preview refill timing.
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-[#49454E] p-4">
              <p className="font-mono text-[11px] uppercase tracking-wider text-[#CAC4D0]">
                Days Supply
              </p>
              <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-[#E6E1E5]">
                {schedule.days_supply}
              </p>
            </div>
            <div className="rounded-xl bg-[#49454E] p-4">
              <p className="font-mono text-[11px] uppercase tracking-wider text-[#CAC4D0]">
                Next Refill
              </p>
              <p className="mt-1 font-mono text-xl font-bold tabular-nums text-[#E6E1E5]">
                {schedule.next_refill_date}
              </p>
            </div>
            <div className="rounded-xl bg-[#49454E] p-4">
              <p className="font-mono text-[11px] uppercase tracking-wider text-[#CAC4D0]">
                Remaining Refills
              </p>
              <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-[#E6E1E5]">
                {schedule.remaining_refills}
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
