'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import CatalogExplorerView from '@/components/CatalogExplorerView';
import ParseReviewWorkspace, {
  StagedCatalogItem,
} from '@/components/ParseReviewWorkspace';
import RefillCalculatorView from '@/components/RefillCalculatorView';
import RemindersView from '@/components/RemindersView';
import SavedMedicationsView from '@/components/SavedMedicationsView';
import TopBar, { WorkspaceTab } from '@/components/TopBar';
import { CATALOG_STATS, getCatalogSpecialityInfo } from '@/lib/data/medication-catalog';
import {
  MedicationInput,
  MedicationRecord,
  ReminderWithMedication,
} from '@/lib/types';

function computeNextRefillIso(med: MedicationRecord): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(med.start_date)) return null;
  const qty = Number(med.quantity);
  const daily = Number(med.doses_per_day);
  if (!Number.isFinite(qty) || qty <= 0 || !Number.isFinite(daily) || daily < 1) {
    return null;
  }
  const [y, m, d] = med.start_date.split('-').map(Number);
  const start = new Date(Date.UTC(y, m - 1, d));
  if (Number.isNaN(start.getTime())) return null;
  const daysSupply = Math.max(1, Math.ceil(qty / Math.trunc(daily)));
  start.setUTCDate(start.getUTCDate() + daysSupply);
  return start.toISOString().slice(0, 10);
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('parser');
  const [medications, setMedications] = useState<MedicationRecord[]>([]);
  const [reminders, setReminders] = useState<ReminderWithMedication[]>([]);
  const [dueIds, setDueIds] = useState<number[]>([]);
  const [isLoadingMeds, setIsLoadingMeds] = useState(true);
  const [uploadTriggerNonce, setUploadTriggerNonce] = useState(0);
  const [stagedItemQueue, setStagedItemQueue] = useState<StagedCatalogItem | null>(
    null
  );
  const [preselectedReminderMedId, setPreselectedReminderMedId] = useState<number | null>(
    null
  );

  const loadMedications = useCallback(async () => {
    try {
      const res = await fetch('/api/medications');
      if (res.ok) {
        const data = await res.json();
        setMedications(Array.isArray(data.medications) ? data.medications : []);
      }
    } finally {
      setIsLoadingMeds(false);
    }
  }, []);

  const loadReminders = useCallback(async () => {
    const res = await fetch('/api/reminders');
    if (res.ok) {
      const data = await res.json();
      setReminders(Array.isArray(data.reminders) ? data.reminders : []);
    }
  }, []);

  const checkDueReminders = useCallback(async () => {
    const res = await fetch('/api/reminders/check', { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      const dueList = Array.isArray(data.due) ? data.due : [];
      setDueIds(dueList.map((d: ReminderWithMedication) => d.id));
    }
  }, []);

  useEffect(() => {
    let active = true;
    async function init() {
      try {
        const [medsRes, remRes, dueRes] = await Promise.all([
          fetch('/api/medications'),
          fetch('/api/reminders'),
          fetch('/api/reminders/check', { method: 'POST' }),
        ]);
        if (!active) return;
        if (medsRes.ok) {
          const data = await medsRes.json();
          setMedications(Array.isArray(data.medications) ? data.medications : []);
        }
        if (remRes.ok) {
          const data = await remRes.json();
          setReminders(Array.isArray(data.reminders) ? data.reminders : []);
        }
        if (dueRes.ok) {
          const data = await dueRes.json();
          const dueList = Array.isArray(data.due) ? data.due : [];
          setDueIds(dueList.map((d: ReminderWithMedication) => d.id));
        }
      } finally {
        if (active) setIsLoadingMeds(false);
      }
    }
    void init();
    return () => {
      active = false;
    };
  }, []);

  function handleUploadAction() {
    setActiveTab('parser');
    setUploadTriggerNonce((n) => n + 1);
  }

  function handleStageFromCatalog(item: MedicationInput) {
    setStagedItemQueue((prev) => ({
      nonce: (prev?.nonce ?? 0) + 1,
      item,
    }));
    setActiveTab('parser');
  }

  const summary = useMemo(() => {
    const specialitySet = new Set<string>();
    const refillDates: string[] = [];

    for (const med of medications) {
      const spec =
        med.speciality ||
        getCatalogSpecialityInfo(med.generic_name || med.name).speciality;
      if (spec) specialitySet.add(spec);

      const nextDate = computeNextRefillIso(med);
      if (nextDate) refillDates.push(nextDate);
    }

    refillDates.sort();
    return {
      uniqueSpecialities: specialitySet.size,
      nearestRefill: refillDates[0] ?? '—',
    };
  }, [medications]);

  return (
    <div className="min-h-screen bg-[#1C1B1F] text-[#E6E1E5]">
      <TopBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onPrimaryAction={handleUploadAction}
        medicationCount={medications.length}
      />

      <main className="mx-auto max-w-[1200px] px-6 py-8 sm:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-[-0.02em] text-[#E6E1E5] text-balance sm:text-3xl">
            Prescription Parser &amp; Formulary
          </h1>
          <p className="mt-1.5 text-sm text-[#CAC4D0]">
            Gemini multimodal Rx extraction matched against {CATALOG_STATS.genericCount} generics &amp; {CATALOG_STATS.pdfFormulationCount} PDF formulations
          </p>
        </div>

        {/* Variation 4 4-Card Stat Grid */}
        <section
          aria-label="Clinical summary"
          className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4"
        >
          <div className="rounded-xl bg-[#49454E] p-4">
            <p className="font-mono text-[11px] font-medium uppercase tracking-wider text-[#CAC4D0]">
              Bundled Formulary
            </p>
            <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-[#E6E1E5]">
              {CATALOG_STATS.genericCount}
            </p>
            <p className="mt-0.5 font-mono text-[11px] tabular-nums text-[#CAC4D0]">
              {CATALOG_STATS.pdfFormulationCount} PDF formulations
            </p>
          </div>

          <div className="rounded-xl bg-[#49454E] p-4">
            <p className="font-mono text-[11px] font-medium uppercase tracking-wider text-[#CAC4D0]">
              Saved Meds
            </p>
            <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-[#E6E1E5]">
              {medications.length}
            </p>
            <p className="mt-0.5 text-[11px] text-[#CAC4D0]">
              {summary.uniqueSpecialities > 0
                ? `${summary.uniqueSpecialities} specialities`
                : 'Awaiting confirmation'}
            </p>
          </div>

          <div className="rounded-xl bg-[#49454E] p-4">
            <p className="font-mono text-[11px] font-medium uppercase tracking-wider text-[#CAC4D0]">
              Nearest Refill
            </p>
            <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-[#E6E1E5]">
              {summary.nearestRefill}
            </p>
            <p className="mt-0.5 text-[11px] text-[#CAC4D0]">
              Earliest projected date
            </p>
          </div>

          <div className="rounded-xl bg-[#49454E] p-4">
            <p className="font-mono text-[11px] font-medium uppercase tracking-wider text-[#CAC4D0]">
              Due Reminders
            </p>
            <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-[#E6E1E5]">
              {dueIds.length}
            </p>
            <p className="mt-0.5 font-mono text-[11px] tabular-nums text-[#CAC4D0]">
              {reminders.length} total scheduled
            </p>
          </div>
        </section>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
        >
          {activeTab === 'parser' ? (
            <ParseReviewWorkspace
              uploadTriggerNonce={uploadTriggerNonce}
              stagedItemQueue={stagedItemQueue}
              onConfirmed={() => {
                loadMedications();
              }}
              onGoToMedications={() => setActiveTab('medications')}
            />
          ) : null}

          {activeTab === 'catalog' ? (
            <CatalogExplorerView onStageMedication={handleStageFromCatalog} />
          ) : null}

          {activeTab === 'medications' ? (
            <SavedMedicationsView
              medications={medications}
              isLoading={isLoadingMeds}
              onRefresh={() => {
                loadMedications();
                loadReminders();
                checkDueReminders();
              }}
              onGoToParser={() => setActiveTab('parser')}
              onScheduleReminder={(medId) => {
                setPreselectedReminderMedId(medId);
                setActiveTab('reminders');
              }}
            />
          ) : null}

          {activeTab === 'refills' ? (
            <RefillCalculatorView medications={medications} />
          ) : null}

          {activeTab === 'reminders' ? (
            <RemindersView
              medications={medications}
              reminders={reminders}
              dueIds={dueIds}
              preselectedMedicationId={preselectedReminderMedId}
              onRefresh={() => {
                loadReminders();
                checkDueReminders();
              }}
              onCheckDue={checkDueReminders}
              onGoToParser={() => setActiveTab('parser')}
            />
          ) : null}
        </motion.div>
      </main>
    </div>
  );
}
