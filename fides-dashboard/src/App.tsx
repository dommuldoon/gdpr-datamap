import { useMemo } from 'react'
import { Sun, Moon } from 'lucide-react'
import { FilterProvider, useFilters } from './store'
import { systems } from './data'
import { Toolbar } from './components/Toolbar'
import { GridView } from './components/GridView'
import { GraphView } from './components/GraphView'

function DataMap() {
  const { selectedDataUses, selectedCategories, layoutMode, viewMode, showArrows, darkMode, toggleDarkMode } = useFilters()

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

  const isFiltered = filteredSystems.length !== systems.length

  return (
    <div
      className={darkMode ? 'dark' : ''}
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--page-bg)' }}
    >
      {/* Header */}
      <header
        className="border-b px-8 h-14 flex items-center gap-6 shrink-0"
        style={{ background: 'var(--header-bg)', borderColor: darkMode ? '#1e2030' : 'rgba(203,213,225,0.8)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 3h10M2 7h7M2 11h4" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-sm font-semibold tracking-tight ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
              Fides
            </span>
            <span className={`text-sm font-medium ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              Data Map
            </span>
          </div>
        </div>

        <div className={`h-4 w-px mx-1 ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />
        <span className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>GDPR System Visualizer</span>

        <div className="ml-auto flex items-center gap-3">
          {isFiltered ? (
            <span className={`text-xs font-medium rounded-full px-2.5 py-1 ${
              darkMode
                ? 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20'
                : 'text-indigo-600 bg-indigo-50 border border-indigo-100'
            }`}>
              {filteredSystems.length} of {systems.length} systems
            </span>
          ) : (
            <span className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              {systems.length} systems
            </span>
          )}

          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              darkMode
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </header>

      <Toolbar />

      <main className="flex-1 mx-auto max-w-screen-2xl w-full px-8 py-6">
        {viewMode === 'grid' ? (
          <GridView systems={filteredSystems} layoutMode={layoutMode} showArrows={showArrows} />
        ) : (
          <GraphView systems={filteredSystems} layoutMode={layoutMode} showArrows={showArrows} />
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
