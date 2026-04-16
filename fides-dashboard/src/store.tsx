import { createContext, useContext, useState, type ReactNode } from 'react'
import type { LayoutMode, ViewMode } from './types'

interface FilterState {
  selectedDataUses: string[]
  selectedCategories: string[]
  layoutMode: LayoutMode
  viewMode: ViewMode
  showArrows: boolean
  toggleDataUse: (use: string) => void
  toggleCategory: (cat: string) => void
  setLayoutMode: (mode: LayoutMode) => void
  setViewMode: (mode: ViewMode) => void
  toggleArrows: () => void
  clearFilters: () => void
}

const FilterContext = createContext<FilterState | null>(null)

export function FilterProvider({ children }: { children: ReactNode }) {
  const [selectedDataUses, setSelectedDataUses] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('systemType')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [showArrows, setShowArrows] = useState(false)

  function toggleDataUse(use: string) {
    setSelectedDataUses(prev =>
      prev.includes(use) ? prev.filter(u => u !== use) : [...prev, use]
    )
  }

  function toggleCategory(cat: string) {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  function toggleArrows() {
    setShowArrows(prev => !prev)
  }

  function clearFilters() {
    setSelectedDataUses([])
    setSelectedCategories([])
  }

  return (
    <FilterContext.Provider
      value={{
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
      }}
    >
      {children}
    </FilterContext.Provider>
  )
}

export function useFilters() {
  const ctx = useContext(FilterContext)
  if (!ctx) throw new Error('useFilters must be used within FilterProvider')
  return ctx
}
