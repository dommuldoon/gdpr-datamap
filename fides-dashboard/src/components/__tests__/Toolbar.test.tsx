import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FilterProvider } from '@/store'
import { Toolbar } from '../Toolbar'

// ---------------------------------------------------------------------------
// Mock @/data — controlled set so tests don't depend on sample_data.json
// ---------------------------------------------------------------------------
vi.mock('@/data', () => ({
  allDataUses: ['provide.system', 'advertising.third_party'],
  allDataCategories: ['user.contact.email', 'user.derived.location'],
  leafSegment: (cat: string) => cat.split('.').at(-1) ?? cat,
}))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function renderToolbar() {
  return render(
    <FilterProvider>
      <Toolbar />
    </FilterProvider>
  )
}

beforeEach(() => {
  localStorage.clear()
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Toolbar — view mode control', () => {
  it('renders the Grid and Graph buttons', () => {
    renderToolbar()
    expect(screen.getByRole('button', { name: 'Grid' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Graph' })).toBeInTheDocument()
  })

  it('Grid is active by default', () => {
    renderToolbar()
    expect(screen.getByRole('button', { name: 'Grid' })).toHaveClass('bg-white')
    expect(screen.getByRole('button', { name: 'Graph' })).not.toHaveClass('bg-white')
  })

  it('clicking Graph makes it the active view', async () => {
    const user = userEvent.setup()
    renderToolbar()

    await user.click(screen.getByRole('button', { name: 'Graph' }))

    expect(screen.getByRole('button', { name: 'Graph' })).toHaveClass('bg-white')
    expect(screen.getByRole('button', { name: 'Grid' })).not.toHaveClass('bg-white')
  })

  it('clicking Grid after Graph restores Grid as active', async () => {
    const user = userEvent.setup()
    renderToolbar()

    await user.click(screen.getByRole('button', { name: 'Graph' }))
    await user.click(screen.getByRole('button', { name: 'Grid' }))

    expect(screen.getByRole('button', { name: 'Grid' })).toHaveClass('bg-white')
    expect(screen.getByRole('button', { name: 'Graph' })).not.toHaveClass('bg-white')
  })
})

describe('Toolbar — layout mode control', () => {
  it('renders the System type and Data use buttons', () => {
    renderToolbar()
    expect(screen.getByRole('button', { name: 'System type' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Data use' })).toBeInTheDocument()
  })

  it('"System type" is active by default', () => {
    renderToolbar()
    expect(screen.getByRole('button', { name: 'System type' })).toHaveClass('bg-white')
    expect(screen.getByRole('button', { name: 'Data use' })).not.toHaveClass('bg-white')
  })

  it('clicking "Data use" makes it the active layout', async () => {
    const user = userEvent.setup()
    renderToolbar()

    await user.click(screen.getByRole('button', { name: 'Data use' }))

    expect(screen.getByRole('button', { name: 'Data use' })).toHaveClass('bg-white')
    expect(screen.getByRole('button', { name: 'System type' })).not.toHaveClass('bg-white')
  })

  it('renders the "Group by" label', () => {
    renderToolbar()
    expect(screen.getByText('Group by')).toBeInTheDocument()
  })
})

describe('Toolbar — dependencies toggle', () => {
  it('renders the Dependencies button', () => {
    renderToolbar()
    expect(screen.getByRole('button', { name: /dependencies/i })).toBeInTheDocument()
  })

  it('Dependencies button is inactive by default', () => {
    renderToolbar()
    expect(screen.getByRole('button', { name: /dependencies/i })).not.toHaveClass('bg-slate-900')
  })

  it('clicking Dependencies activates it', async () => {
    const user = userEvent.setup()
    renderToolbar()

    await user.click(screen.getByRole('button', { name: /dependencies/i }))

    expect(screen.getByRole('button', { name: /dependencies/i })).toHaveClass('bg-slate-900')
  })

  it('clicking Dependencies again deactivates it', async () => {
    const user = userEvent.setup()
    renderToolbar()

    await user.click(screen.getByRole('button', { name: /dependencies/i }))
    await user.click(screen.getByRole('button', { name: /dependencies/i }))

    expect(screen.getByRole('button', { name: /dependencies/i })).not.toHaveClass('bg-slate-900')
  })
})

describe('Toolbar — data use filter pills', () => {
  it('renders a pill for each data use', () => {
    renderToolbar()
    expect(screen.getByRole('button', { name: 'provide.system' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'advertising.third_party' })).toBeInTheDocument()
  })

  it('data use pills are inactive by default', () => {
    renderToolbar()
    expect(screen.getByRole('button', { name: 'provide.system' })).not.toHaveClass('bg-indigo-600')
  })

  it('clicking a data use pill activates it', async () => {
    const user = userEvent.setup()
    renderToolbar()

    await user.click(screen.getByRole('button', { name: 'provide.system' }))

    expect(screen.getByRole('button', { name: 'provide.system' })).toHaveClass('bg-indigo-600')
  })

  it('clicking an active data use pill deactivates it', async () => {
    const user = userEvent.setup()
    renderToolbar()

    await user.click(screen.getByRole('button', { name: 'provide.system' }))
    await user.click(screen.getByRole('button', { name: 'provide.system' }))

    expect(screen.getByRole('button', { name: 'provide.system' })).not.toHaveClass('bg-indigo-600')
  })

  it('multiple data use pills can be active simultaneously', async () => {
    const user = userEvent.setup()
    renderToolbar()

    await user.click(screen.getByRole('button', { name: 'provide.system' }))
    await user.click(screen.getByRole('button', { name: 'advertising.third_party' }))

    expect(screen.getByRole('button', { name: 'provide.system' })).toHaveClass('bg-indigo-600')
    expect(screen.getByRole('button', { name: 'advertising.third_party' })).toHaveClass('bg-indigo-600')
  })

  it('renders the "Data use" section label', () => {
    renderToolbar()
    // "Data use" appears as both a SegmentedControl button and a filter section label (div).
    // Target the div specifically to avoid an ambiguous match.
    expect(screen.getByText('Data use', { selector: 'div' })).toBeInTheDocument()
  })
})

describe('Toolbar — category filter pills', () => {
  it('renders a pill per category using the leaf segment as label', () => {
    renderToolbar()
    // allDataCategories = ['user.contact.email', 'user.derived.location']
    // leafSegment returns the last segment
    expect(screen.getByRole('button', { name: 'email' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'location' })).toBeInTheDocument()
  })

  it('category pills are inactive by default', () => {
    renderToolbar()
    expect(screen.getByRole('button', { name: 'email' })).not.toHaveClass('bg-violet-600')
  })

  it('clicking a category pill activates it', async () => {
    const user = userEvent.setup()
    renderToolbar()

    await user.click(screen.getByRole('button', { name: 'email' }))

    expect(screen.getByRole('button', { name: 'email' })).toHaveClass('bg-violet-600')
  })

  it('clicking an active category pill deactivates it', async () => {
    const user = userEvent.setup()
    renderToolbar()

    await user.click(screen.getByRole('button', { name: 'email' }))
    await user.click(screen.getByRole('button', { name: 'email' }))

    expect(screen.getByRole('button', { name: 'email' })).not.toHaveClass('bg-violet-600')
  })

  it('renders the "Category" section label', () => {
    renderToolbar()
    expect(screen.getByText('Category')).toBeInTheDocument()
  })
})

describe('Toolbar — clear filters', () => {
  it('does not show the Clear button when no filters are active', () => {
    renderToolbar()
    expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument()
  })

  it('shows "Clear 1 filter" (singular) when one filter is active', async () => {
    const user = userEvent.setup()
    renderToolbar()

    await user.click(screen.getByRole('button', { name: 'provide.system' }))

    expect(screen.getByRole('button', { name: /clear 1 filter$/i })).toBeInTheDocument()
  })

  it('shows "Clear 2 filters" (plural) when two filters are active', async () => {
    const user = userEvent.setup()
    renderToolbar()

    await user.click(screen.getByRole('button', { name: 'provide.system' }))
    await user.click(screen.getByRole('button', { name: 'email' }))

    expect(screen.getByRole('button', { name: /clear 2 filters/i })).toBeInTheDocument()
  })

  it('clicking Clear deactivates all filter pills', async () => {
    const user = userEvent.setup()
    renderToolbar()

    await user.click(screen.getByRole('button', { name: 'provide.system' }))
    await user.click(screen.getByRole('button', { name: 'email' }))
    await user.click(screen.getByRole('button', { name: /clear/i }))

    expect(screen.getByRole('button', { name: 'provide.system' })).not.toHaveClass('bg-indigo-600')
    expect(screen.getByRole('button', { name: 'email' })).not.toHaveClass('bg-violet-600')
  })

  it('Clear button disappears after clearing', async () => {
    const user = userEvent.setup()
    renderToolbar()

    await user.click(screen.getByRole('button', { name: 'provide.system' }))
    await user.click(screen.getByRole('button', { name: /clear/i }))

    expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument()
  })

  it('counts data use and category filters together in the badge', async () => {
    const user = userEvent.setup()
    renderToolbar()

    await user.click(screen.getByRole('button', { name: 'provide.system' }))
    await user.click(screen.getByRole('button', { name: 'advertising.third_party' }))
    await user.click(screen.getByRole('button', { name: 'email' }))

    // 2 data uses + 1 category = 3 total
    expect(screen.getByRole('button', { name: /clear 3 filters/i })).toBeInTheDocument()
  })
})
