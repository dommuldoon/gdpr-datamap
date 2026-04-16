import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FilterProvider } from '@/store'
import { Header } from '../Header'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function renderHeader(totalCount = 5, filteredCount = 5) {
  return render(
    <FilterProvider>
      <Header totalCount={totalCount} filteredCount={filteredCount} />
    </FilterProvider>
  )
}

// Dark mode is persisted to localStorage. Clear between tests so each one
// starts with the default (darkMode = true).
beforeEach(() => {
  localStorage.clear()
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Header — branding', () => {
  it('renders the Fides brand name', () => {
    renderHeader()
    expect(screen.getByText('Fides')).toBeInTheDocument()
  })

  it('renders the "Data Map" label', () => {
    renderHeader()
    expect(screen.getByText('Data Map')).toBeInTheDocument()
  })

  it('renders the GDPR System Visualizer subtitle', () => {
    renderHeader()
    expect(screen.getByText('GDPR System Visualizer')).toBeInTheDocument()
  })
})

describe('Header — system count badge', () => {
  it('shows "N systems" when not filtered', () => {
    renderHeader(12, 12)
    expect(screen.getByText('12 systems')).toBeInTheDocument()
  })

  it('shows "1 systems" (singular count still shows total)', () => {
    renderHeader(1, 1)
    expect(screen.getByText('1 systems')).toBeInTheDocument()
  })

  it('shows "X of N systems" badge when filteredCount < totalCount', () => {
    renderHeader(12, 4)
    expect(screen.getByText('4 of 12 systems')).toBeInTheDocument()
  })

  it('does not show the filter badge when counts match', () => {
    renderHeader(5, 5)
    expect(screen.queryByText(/of 5 systems/)).not.toBeInTheDocument()
  })

  it('does not show the plain count when filtered', () => {
    renderHeader(10, 3)
    // The plain "N systems" span should not appear; only "3 of 10 systems"
    expect(screen.queryByText('10 systems')).not.toBeInTheDocument()
    expect(screen.getByText('3 of 10 systems')).toBeInTheDocument()
  })
})

describe('Header — dark mode toggle', () => {
  it('renders the dark mode toggle button', () => {
    renderHeader()
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('shows the Sun icon in dark mode (default state)', () => {
    const { container } = renderHeader()
    expect(container.querySelector('.lucide-sun')).toBeInTheDocument()
    expect(container.querySelector('.lucide-moon')).not.toBeInTheDocument()
  })

  it('button title is "Switch to light mode" when in dark mode', () => {
    renderHeader()
    expect(screen.getByRole('button', { name: /switch to light mode/i })).toBeInTheDocument()
  })

  it('shows the Moon icon after switching to light mode', async () => {
    const user = userEvent.setup()
    const { container } = renderHeader()

    await user.click(screen.getByRole('button'))

    expect(container.querySelector('.lucide-moon')).toBeInTheDocument()
    expect(container.querySelector('.lucide-sun')).not.toBeInTheDocument()
  })

  it('button title changes to "Switch to dark mode" after switching', async () => {
    const user = userEvent.setup()
    renderHeader()

    await user.click(screen.getByRole('button'))

    expect(screen.getByRole('button', { name: /switch to dark mode/i })).toBeInTheDocument()
  })

  it('clicking the toggle twice returns to dark mode', async () => {
    const user = userEvent.setup()
    const { container } = renderHeader()

    await user.click(screen.getByRole('button'))
    await user.click(screen.getByRole('button'))

    expect(container.querySelector('.lucide-sun')).toBeInTheDocument()
  })

  it('persists the dark mode preference to localStorage', async () => {
    const user = userEvent.setup()
    renderHeader()

    await user.click(screen.getByRole('button'))

    expect(localStorage.getItem('fides-dark-mode')).toBe('false')
  })

  it('reads dark mode preference from localStorage on mount', () => {
    localStorage.setItem('fides-dark-mode', 'false')
    const { container } = renderHeader()
    // Should start in light mode because localStorage says false
    expect(container.querySelector('.lucide-moon')).toBeInTheDocument()
    expect(container.querySelector('.lucide-sun')).not.toBeInTheDocument()
  })
})
