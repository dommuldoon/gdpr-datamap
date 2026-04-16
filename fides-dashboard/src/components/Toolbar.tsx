import { LayoutGrid, Workflow, GitBranch, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useFilters } from '@/store'
import { allDataUses, allDataCategories } from '@/data'

function leafSegment(cat: string) {
  return cat.split('.').pop() ?? cat
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
    <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="mx-auto max-w-screen-2xl px-6 py-3 flex flex-col gap-3">

        {/* Row 1: view / layout toggles + arrows */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">View</span>
          <div className="flex rounded-lg border border-slate-200 overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors',
                viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
              )}
            >
              <LayoutGrid size={13} /> Grid
            </button>
            <button
              onClick={() => setViewMode('graph')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors border-l border-slate-200',
                viewMode === 'graph' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
              )}
            >
              <Workflow size={13} /> Graph
            </button>
          </div>

          <Separator orientation="vertical" className="h-5" />

          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Group by</span>
          <div className="flex rounded-lg border border-slate-200 overflow-hidden">
            <button
              onClick={() => setLayoutMode('systemType')}
              className={cn(
                'px-3 py-1.5 text-xs font-medium transition-colors',
                layoutMode === 'systemType' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
              )}
            >
              System Type
            </button>
            <button
              onClick={() => setLayoutMode('dataUse')}
              className={cn(
                'px-3 py-1.5 text-xs font-medium transition-colors border-l border-slate-200',
                layoutMode === 'dataUse' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
              )}
            >
              Data Use
            </button>
          </div>

          <Separator orientation="vertical" className="h-5" />

          <button
            onClick={toggleArrows}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors',
              showArrows
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            )}
          >
            <GitBranch size={13} /> Dependencies
          </button>

          {activeFilterCount > 0 && (
            <>
              <Separator orientation="vertical" className="h-5" />
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs text-slate-500 h-7 px-2 gap-1"
              >
                <X size={12} /> Clear {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''}
              </Button>
            </>
          )}
        </div>

        {/* Row 2: data use filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-slate-400 shrink-0">Data use:</span>
          {allDataUses.map(use => (
            <button
              key={use}
              onClick={() => toggleDataUse(use)}
              className={cn(
                'rounded-full px-2.5 py-0.5 text-[11px] font-medium border transition-colors',
                selectedDataUses.includes(use)
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
              )}
            >
              {use}
            </button>
          ))}
        </div>

        {/* Row 3: category filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-slate-400 shrink-0">Category:</span>
          {allDataCategories.map(cat => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={cn(
                'rounded-full px-2.5 py-0.5 text-[11px] font-medium border transition-colors',
                selectedCategories.includes(cat)
                  ? 'bg-violet-600 text-white border-violet-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-violet-300 hover:text-violet-600'
              )}
            >
              {leafSegment(cat)}
            </button>
          ))}
        </div>

      </div>
    </div>
  )
}
