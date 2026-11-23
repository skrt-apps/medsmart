'use client';

export type WorkspaceTab = 'parser' | 'catalog' | 'medications' | 'refills' | 'reminders';

interface TopBarProps {
  activeTab: WorkspaceTab;
  onSelectTab: (tab: WorkspaceTab) => void;
  onPrimaryAction: () => void;
  medicationCount: number;
}

const NAV_ITEMS: { id: WorkspaceTab; label: string }[] = [
  { id: 'parser', label: 'Parser' },
  { id: 'catalog', label: 'Catalog' },
  { id: 'medications', label: 'Saved Meds' },
  { id: 'refills', label: 'Refills' },
  { id: 'reminders', label: 'Reminders' },
];

export default function TopBar({
  activeTab,
  onSelectTab,
  onPrimaryAction,
  medicationCount,
}: TopBarProps) {
  return (
    <header className="border-b border-[#49454E] bg-[#2B2930]">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-8 px-6 py-4 sm:px-8">
        <button
          type="button"
          onClick={() => onSelectTab('parser')}
          className="text-left text-xl font-bold tracking-tight text-[#E6E1E5] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D0BCFF]"
        >
          Personal Intel
        </button>

        <nav
          aria-label="Workspace navigation"
          className="flex items-center gap-6 overflow-x-auto"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            const suffix =
              item.id === 'medications' && medicationCount > 0
                ? ` (${medicationCount})`
                : '';
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`border-b-2 py-2 text-[13px] font-medium uppercase tracking-[0.05em] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D0BCFF] ${
                  isActive
                    ? 'border-[#D0BCFF] text-[#D0BCFF]'
                    : 'border-transparent text-[#CAC4D0] hover:border-[#938F99] hover:text-[#E6E1E5]'
                }`}
              >
                {item.label}
                {suffix ? (
                  <span className="ml-1 font-mono text-xs tabular-nums opacity-80">
                    {suffix}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        <div className="shrink-0">
          <button
            type="button"
            onClick={onPrimaryAction}
            className="rounded-lg bg-[#D0BCFF] px-5 py-2.5 text-xs font-semibold text-[#381E72] transition-colors hover:bg-[#E0D2FF] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D0BCFF]"
          >
            Upload Rx
          </button>
        </div>
      </div>
    </header>
  );
}
