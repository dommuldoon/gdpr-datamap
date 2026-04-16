import { LayoutGrid, Workflow, GitBranch, X, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFilters } from '@/store'
import { allDataUses, allDataCategories } from '@/data'

function leafSegment(cat: string) {
  return cat.split('.').pop() ?? cat
}

function SegmentedControl({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string; icon?: React.ReactNode }[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex items-center bg-slate-100 dark:bg-slate-800/60 rounded-lg p-0.5 gap-0.5">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150',
            value === opt.value
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.08)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.3)]'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          )}
        >
          {opt.icon}
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function FilterPill({
  label,
  active,
  onClick,
  color = 'indigo',
}: {
  label: string
  active: boolean
  onClick: () => void
  color?: 'indigo' | 'violet'
}) {
  const activeIndigo = 'bg-indigo-600 text-white border-indigo-600 shadow-[0_0_0_2px_rgba(99,102,241,0.2)]'
  const activeViolet = 'bg-violet-600 text-white border-violet-600 shadow-[0_0_0_2px_rgba(139,92,246,0.2)]'
  const inactive = 'bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-500 hover:text-slate-900 dark:hover:text-slate-200'

  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-full px-2.5 py-1 text-[11px] font-medium border transition-all duration-150',
        active ? (color === 'indigo' ? activeIndigo : activeViolet) : inactive
      )}
    >
      {label}
    </button>
  )
}

export function Toolbar() {
  const {
    selectedDataUses,
    selectedCategories,
    layoutMode,
    viewMode,
    showArrows,
    toggleDataUse,
    toggleCategory,
    setLayoutMode,
    setViewMode,
    toggleArrows,
    clearFilters,
  } = useFilters()

  const activeFilterCount = selectedDataUses.length + selectedCategories.length

  return (
    <div className="sticky top-0 z-30 border-b" style={{ background: 'var(--toolbar-bg)', borderColor: 'var(--card-border)', backdropFilter: 'blur(8px)' }}>
      <div className="mx-auto max-w-screen-2xl px-8 py-3 flex flex-col gap-3">

        {/* Row 1: controls */}
        <div className="flex items-center gap-4 flex-wrap">
          <SegmentedControl
            value={viewMode}
            onChange={v => setViewMode(v as 'grid' | 'graph')}
            options={[
              { value: 'grid', label: 'Grid', icon: <LayoutGrid size={12} /> },
              { value: 'graph', label: 'Graph', icon: <Workflow size={12} /> },
            ]}
          />

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Group by
            </span>
            <SegmentedControl
              value={layoutMode}
              onChange={v => setLayoutMode(v as 'systemType' | 'dataUse')}
              options={[
                { value: 'systemType', label: 'System type' },
                { value: 'dataUse', label: 'Data use' },
              ]}
            />
          </div>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />

          <button
            onClick={toggleArrows}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150',
              showArrows
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100'
                : 'bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            )}
          >
            <GitBranch size={12} />
            Dependencies
          </button>

          {activeFilterCount > 0 && (
            <>
              <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                <X size={12} />
                Clear {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''}
              </button>
            </>
          )}
        </div>

        {/* Filter rows */}
        <div className="flex flex-col gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 dark:text-slate-500 w-20 shrink-0">
              <SlidersHorizontal size={11} />
              Data use
            </div>
            {allDataUses.map(use => (
              <FilterPill
                key={use}
                label={use}
                active={selectedDataUses.includes(use)}
                onClick={() => toggleDataUse(use)}
                color="indigo"
              />
            ))}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 dark:text-slate-500 w-20 shrink-0">
              <SlidersHorizontal size={11} />
              Category
            </div>
            {allDataCategories.map(cat => (
              <FilterPill
                key={cat}
                label={leafSegment(cat)}
                active={selectedCategories.includes(cat)}
                onClick={() => toggleCategory(cat)}
                color="violet"
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
