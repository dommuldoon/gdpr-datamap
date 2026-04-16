import { useMemo } from 'react'
import { FilterProvider, useFilters } from './store'
import { systems } from './data'
import { Toolbar } from './components/Toolbar'
import { GridView } from './components/GridView'
import { GraphView } from './components/GraphView'

function DataMap() {
  const { selectedDataUses, selectedCategories, layoutMode, viewMode, showArrows } = useFilters()

  const filteredSystems = useMemo(() => {
    if (selectedDataUses.length === 0 && selectedCategories.length === 0) return systems
    return systems.filter(s => {
      const matchesUse =
        selectedDataUses.length === 0 ||
        s.dataUses.some(u => selectedDataUses.includes(u))
      const matchesCategory =
        selectedCategories.length === 0 ||
        s.dataCategoriesFull.some(c => selectedCategories.includes(c))
      return matchesUse && matchesCategory
    })
  }, [selectedDataUses, selectedCategories])

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">F</span>
          </div>
          <div>
            <h1 className="text-sm font-semibold text-slate-800">Fides Data Map</h1>
            <p className="text-[11px] text-slate-400">GDPR System Visualizer</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2 text-[11px] text-slate-400">
          <span>{filteredSystems.length} of {systems.length} systems</span>
        </div>
      </header>

      <Toolbar />

      {/* Main content */}
      <main className="flex-1 mx-auto max-w-screen-2xl w-full px-6 py-6">
        {viewMode === 'grid' ? (
          <GridView
            systems={filteredSystems}
            layoutMode={layoutMode}
            showArrows={showArrows}
          />
        ) : (
          <GraphView
            systems={filteredSystems}
            layoutMode={layoutMode}
            showArrows={showArrows}
          />
        )}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <FilterProvider>
      <DataMap />
    </FilterProvider>
  )
}
