'use client';

import { useMemo, useState } from 'react';
import { ArrowRight, Plus, RotateCcw, Search } from 'lucide-react';
import {
  CATALOG_STATS,
  CatalogMedication,
  MEDICATION_CATALOG,
  MedicalSpeciality,
  PdfFormulation,
  SPECIALITIES,
  THERAPEUTIC_CATEGORIES,
} from '@/lib/data/medication-catalog';
import { MedicationInput } from '@/lib/types';

interface CatalogExplorerViewProps {
  onStageMedication: (item: MedicationInput) => void;
}

export default function CatalogExplorerView({
  onStageMedication,
}: CatalogExplorerViewProps) {
  const [query, setQuery] = useState('');
  const [selectedSpeciality, setSelectedSpeciality] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedId, setSelectedId] = useState<string>(MEDICATION_CATALOG[0]?.id ?? '');

  const specialityCounts = useMemo(() => {
    const counts = new Map<MedicalSpeciality, number>();
    for (const item of MEDICATION_CATALOG) {
      counts.set(item.speciality, (counts.get(item.speciality) ?? 0) + 1);
    }
    return counts;
  }, []);

  const availableCategories = useMemo(() => {
    if (selectedSpeciality === 'All') {
      return THERAPEUTIC_CATEGORIES;
    }
    return Array.from(
      new Set(
        MEDICATION_CATALOG.filter((m) => m.speciality === selectedSpeciality).map(
          (m) => m.therapeutic_category
        )
      )
    ).sort();
  }, [selectedSpeciality]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MEDICATION_CATALOG.filter((item) => {
      if (selectedSpeciality !== 'All' && item.speciality !== selectedSpeciality) {
        return false;
      }
      if (selectedCategory !== 'All' && item.therapeutic_category !== selectedCategory) {
        return false;
      }
      if (!q) return true;

      const slMatch = item.pdf_formulations.some(
        (f) => String(f.sl_no) === q || `#${f.sl_no}` === q || f.label.toLowerCase().includes(q)
      );
      if (slMatch) return true;

      return (
        item.generic_name.toLowerCase().includes(q) ||
        item.therapeutic_category.toLowerCase().includes(q) ||
        item.speciality.toLowerCase().includes(q) ||
        item.aliases.some((a) => a.toLowerCase().includes(q)) ||
        item.brands_in.some((b) => b.toLowerCase().includes(q)) ||
        item.brands_us.some((b) => b.toLowerCase().includes(q))
      );
    });
  }, [query, selectedSpeciality, selectedCategory]);

  const activeItem: CatalogMedication | null = useMemo(() => {
    return (
      filtered.find((item) => item.id === selectedId) ?? filtered[0] ?? null
    );
  }, [filtered, selectedId]);

  function handleResetFilters() {
    setQuery('');
    setSelectedSpeciality('All');
    setSelectedCategory('All');
  }

  function stageFormulation(item: CatalogMedication, form?: PdfFormulation) {
    const today = new Date().toISOString().slice(0, 10);
    onStageMedication({
      name: item.generic_name,
      dosage: form?.strength || item.common_dosages[0] || '',
      frequency: 'Once daily',
      route: form?.route || item.default_route || 'oral',
      quantity: '30',
      doses_per_day: 1,
      refills: 0,
      start_date: today,
      generic_name: item.generic_name,
      matched_brand: '',
      catalog_region: item.registries.join(' / '),
      therapeutic_category: item.therapeutic_category,
      speciality: item.speciality,
      formulation_label: form?.label || '',
      verified: true,
    });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[#49454E] bg-[#2B2930] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#49454E] pb-4">
          <div>
            <h2 className="text-base font-bold tracking-[-0.02em] text-[#E6E1E5]">
              Generic Drug Formulary &amp; Brand Catalog
            </h2>
            <p className="mt-0.5 text-xs text-[#CAC4D0]">
              {CATALOG_STATS.genericCount} base generics · {CATALOG_STATS.pdfFormulationCount} PDF formulations merged with US (RxNorm) &amp; India (NLEM / CDSCO) brands
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-72">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[#938F99]"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search generic, brand, strength, or #Sl No..."
                className="w-full rounded border border-[#938F99] bg-[#1C1B1F] py-2 pr-3 pl-9 text-xs text-[#E6E1E5] placeholder:text-[#938F99] focus:border-[#D0BCFF] focus:outline-none"
              />
            </div>

            <select
              aria-label="Filter by therapeutic category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded border border-[#938F99] bg-[#1C1B1F] px-3 py-2 text-xs text-[#E6E1E5] focus:border-[#D0BCFF] focus:outline-none"
            >
              <option value="All">All Therapeutic Categories</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setSelectedSpeciality('All');
              setSelectedCategory('All');
            }}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              selectedSpeciality === 'All'
                ? 'bg-[#D0BCFF] text-[#381E72]'
                : 'bg-[#49454E] text-[#E6E1E5] hover:bg-[#49454E]/80'
            }`}
          >
            All Specialities ({MEDICATION_CATALOG.length})
          </button>
          {SPECIALITIES.map((spec) => (
            <button
              key={spec}
              type="button"
              onClick={() => {
                setSelectedSpeciality(spec);
                setSelectedCategory('All');
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                selectedSpeciality === spec
                  ? 'bg-[#D0BCFF] text-[#381E72]'
                  : 'bg-[#49454E] text-[#E6E1E5] hover:bg-[#49454E]/80'
              }`}
            >
              {spec} ({specialityCounts.get(spec) ?? 0})
            </button>
          ))}
        </div>
      </section>

      {filtered.length === 0 ? (
        <section className="flex min-h-[240px] flex-col items-center justify-center rounded-2xl border border-[#49454E] bg-[#2B2930] p-8 text-center">
          <p className="text-sm font-semibold text-[#E6E1E5]">
            No catalog medications match the current filters
          </p>
          <p className="mt-1 text-xs text-[#CAC4D0]">
            Try clearing the speciality or category filter, or search by another brand or generic name.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-[#D0BCFF] bg-transparent px-4 py-2 text-xs font-semibold text-[#D0BCFF] hover:bg-[#D0BCFF]/10"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Reset Filters
          </button>
        </section>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
          <section className="overflow-hidden rounded-2xl border border-[#49454E] bg-[#2B2930] lg:col-span-5">
            <div className="flex items-center justify-between border-b border-[#49454E] px-5 py-3.5">
              <span className="text-xs font-semibold text-[#E6E1E5]">
                Base Generic Directory
              </span>
              <span className="font-mono text-xs tabular-nums text-[#CAC4D0]">
                {filtered.length} shown
              </span>
            </div>

            <div className="max-h-[600px] divide-y divide-[#49454E]/60 overflow-y-auto">
              {filtered.map((item) => {
                const isSelected = activeItem?.id === item.id;
                const brandCount = item.brands_in.length + item.brands_us.length;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={`flex w-full items-center justify-between gap-3 px-5 py-3 text-left transition-colors ${
                      isSelected
                        ? 'bg-[#49454E]'
                        : 'hover:bg-[#49454E]/40'
                    }`}
                  >
                    <div className="min-w-0">
                      <p
                        className={`truncate text-xs font-semibold ${
                          isSelected ? 'text-[#D0BCFF]' : 'text-[#E6E1E5]'
                        }`}
                      >
                        {item.generic_name}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-[#CAC4D0]">
                        {item.therapeutic_category} · {item.speciality}
                      </p>
                    </div>
                    <span className="shrink-0 font-mono text-[11px] tabular-nums text-[#CAC4D0]">
                      {item.pdf_formulations.length}f · {brandCount}b
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {activeItem ? (
            <section className="rounded-2xl border border-[#49454E] bg-[#2B2930] p-6 lg:col-span-7">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#49454E] pb-4">
                <div>
                  <h3 className="text-lg font-bold tracking-[-0.02em] text-[#E6E1E5]">
                    {activeItem.generic_name}
                  </h3>
                  <p className="mt-1 text-xs text-[#CAC4D0]">
                    {activeItem.registries.join(' · ')}
                    {activeItem.aliases.length > 0
                      ? ` · Aliases: ${activeItem.aliases.slice(0, 3).join(', ')}`
                      : ''}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => stageFormulation(activeItem)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#D0BCFF] px-4 py-2 text-xs font-semibold text-[#381E72] transition-colors hover:bg-[#E0D2FF] whitespace-nowrap shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  Stage Generic in Parser
                </button>
              </div>

              {/* 2-column Key-Value Hairline Metadata Grid */}
              <div className="mt-5 grid grid-cols-1 overflow-hidden rounded-lg border border-[#49454E] bg-[#1C1B1F]/50 sm:grid-cols-2">
                <div className="border-b border-[#49454E] p-3.5 sm:border-r">
                  <p className="font-mono text-[10px] font-medium uppercase tracking-wider text-[#CAC4D0]">
                    Medical Speciality
                  </p>
                  <p className="mt-1 text-xs font-semibold text-[#E6E1E5]">
                    {activeItem.speciality}
                  </p>
                </div>
                <div className="border-b border-[#49454E] p-3.5">
                  <p className="font-mono text-[10px] font-medium uppercase tracking-wider text-[#CAC4D0]">
                    Therapeutic Category
                  </p>
                  <p className="mt-1 text-xs font-semibold text-[#E6E1E5]">
                    {activeItem.therapeutic_category}
                  </p>
                </div>
                <div className="border-b border-[#49454E] p-3.5 sm:border-r">
                  <p className="font-mono text-[10px] font-medium uppercase tracking-wider text-[#CAC4D0]">
                    India Brands
                  </p>
                  <p className="mt-1 text-xs text-[#E6E1E5]">
                    {activeItem.brands_in.length > 0
                      ? activeItem.brands_in.join(' · ')
                      : 'No commercial brand overlay bundled'}
                  </p>
                </div>
                <div className="border-b border-[#49454E] p-3.5">
                  <p className="font-mono text-[10px] font-medium uppercase tracking-wider text-[#CAC4D0]">
                    US Brands
                  </p>
                  <p className="mt-1 text-xs text-[#E6E1E5]">
                    {activeItem.brands_us.length > 0
                      ? activeItem.brands_us.join(' · ')
                      : 'No US brand overlay bundled'}
                  </p>
                </div>
                <div className="border-b border-[#49454E] p-3.5 sm:border-r sm:border-b-0">
                  <p className="font-mono text-[10px] font-medium uppercase tracking-wider text-[#CAC4D0]">
                    Default Route
                  </p>
                  <p className="mt-1 text-xs text-[#E6E1E5]">
                    {activeItem.default_route}
                  </p>
                </div>
                <div className="p-3.5">
                  <p className="font-mono text-[10px] font-medium uppercase tracking-wider text-[#CAC4D0]">
                    Common Strengths
                  </p>
                  <p className="mt-1 font-mono text-xs text-[#E6E1E5]">
                    {activeItem.common_dosages.length > 0
                      ? activeItem.common_dosages.join(' · ')
                      : 'As prescribed'}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-[#E6E1E5]">
                    PDF Formulations &amp; Strengths
                  </h4>
                  <span className="font-mono text-xs tabular-nums text-[#CAC4D0]">
                    {activeItem.pdf_formulations.length} entry(s)
                  </span>
                </div>

                {activeItem.pdf_formulations.length === 0 ? (
                  <p className="mt-3 rounded-lg border border-dashed border-[#938F99]/60 bg-[#1C1B1F]/50 p-4 text-xs text-[#CAC4D0]">
                    Bundled from US/India brand registry (no separate row in the 500-drug PDF). Use Stage Generic in Parser above to add it directly.
                  </p>
                ) : (
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {activeItem.pdf_formulations.map((form) => (
                      <div
                        key={form.sl_no}
                        className="flex flex-col justify-between rounded-lg border border-[#49454E] bg-[#1C1B1F]/60 p-3.5"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 font-mono text-[11px] tabular-nums text-[#CAC4D0]">
                            <span>#{form.sl_no}</span>
                            <span>{form.form}</span>
                          </div>
                          <p className="mt-1 text-xs font-semibold text-[#E6E1E5]">
                            {form.label}
                          </p>
                          <p className="mt-0.5 text-[11px] text-[#CAC4D0]">
                            {form.strength || 'Standard strength'} · {form.route}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => stageFormulation(activeItem, form)}
                          className="mt-3 inline-flex items-center justify-between rounded-lg border border-[#D0BCFF]/50 bg-transparent px-3 py-1.5 text-[11px] font-semibold text-[#D0BCFF] transition-colors hover:bg-[#D0BCFF]/10"
                        >
                          <span>Stage in Parser</span>
                          <ArrowRight className="h-3 w-3" aria-hidden="true" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}
