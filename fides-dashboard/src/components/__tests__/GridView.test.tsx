import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GridView } from '../GridView'
import type { System } from '@/types'

// ---------------------------------------------------------------------------
// Framer Motion: skip animations in jsdom
// ---------------------------------------------------------------------------
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion')
  return {
    ...actual,
    motion: new Proxy(actual.motion, {
      get: (target, prop: string) =>
        // Return plain HTML element wrapper, forwarding all props
        function MotionStub({ children, ...props }: React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }) {
          const Tag = prop as keyof React.JSX.IntrinsicElements
          return <Tag {...(props as object)}>{children}</Tag>
        },
    }),
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useAnimation: () => ({ start: vi.fn(), stop: vi.fn() }),
  }
})

// ---------------------------------------------------------------------------
// ArrowOverlay: no-op in unit tests (getBoundingClientRect always returns 0)
// ---------------------------------------------------------------------------
vi.mock('../ArrowOverlay', () => ({
  ArrowOverlay: () => <div data-testid="arrow-overlay" />,
}))

// ---------------------------------------------------------------------------
// Fixture data
// ---------------------------------------------------------------------------
const makeSystem = (overrides: Partial<System> = {}): System => ({
  fidesKey: 'default_key',
  name: 'Default System',
  description: 'A default description',
  systemType: 'Application',
  dataUses: ['provide.system'],
  dataCategories: ['email'],
  dataCategoriesFull: ['user.provided.identifiable.contact.email'],
  dependencies: [],
  ...overrides,
})

const storefront = makeSystem({
  fidesKey: 'store_app',
  name: 'Storefront',
  systemType: 'Application',
  dataUses: ['advertising.third_party', 'improve.system'],
  dataCategories: ['cookie_id', 'location'],
  dataCategoriesFull: ['user.derived.identifiable.device.cookie_id', 'user.derived.identifiable.location'],
  dependencies: ['app_db'],
})

const appDb = makeSystem({
  fidesKey: 'app_db',
  name: 'App Database',
  systemType: 'Database',
  dataUses: ['provide.system'],
  dataCategories: ['email'],
  dataCategoriesFull: ['user.provided.identifiable.contact.email'],
  dependencies: [],
})

const stripe = makeSystem({
  fidesKey: 'payments',
  name: 'Stripe',
  systemType: 'Integration',
  dataUses: ['provide.system'],
  dataCategories: ['financial'],
  dataCategoriesFull: ['user.provided.identifiable.financial'],
  dependencies: [],
})

const orders = makeSystem({
  fidesKey: 'orders_svc',
  name: 'Orders Service',
  systemType: 'Service',
  dataUses: ['provide.system', 'improve.system'],
  dataCategories: ['cookie_id', 'email', 'financial'],
  dataCategoriesFull: [
    'user.derived.identifiable.device.cookie_id',
    'user.provided.identifiable.contact.email',
    'user.provided.identifiable.financial',
  ],
  description: '',
  dependencies: [],
})

const searchDb = makeSystem({
  fidesKey: 'search_db',
  name: 'Search Engine',
  systemType: 'Database',
  dataUses: [],
  dataCategories: [],
  dataCategoriesFull: [],
  description: '',
  dependencies: [],
})

const ALL_SYSTEMS = [storefront, appDb, stripe, orders, searchDb]

// ---------------------------------------------------------------------------
// Render helper
// ---------------------------------------------------------------------------
function renderGrid(
  systems: System[] = ALL_SYSTEMS,
  layoutMode: 'systemType' | 'dataUse' = 'systemType',
  showArrows = false
) {
  return render(
    <GridView systems={systems} layoutMode={layoutMode} showArrows={showArrows} />
  )
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('GridView — systemType layout', () => {
  it('renders a column header for each unique system type', () => {
    renderGrid()
    expect(screen.getByRole('heading', { name: 'Application' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Database' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Integration' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Service' })).toBeInTheDocument()
  })

  it('places each system under its correct column', () => {
    renderGrid()

    // Column structure: h2 → div.backdrop-blur-sm → div.sticky → column div.flex.flex-col.gap-3
    // Use closest('.flex') to reach the column container (first .flex ancestor of the heading).
    const appCol = screen.getByRole('heading', { name: 'Application' }).closest('.flex')!
    expect(within(appCol as HTMLElement).getByText('Storefront')).toBeInTheDocument()

    const dbCol = screen.getByRole('heading', { name: 'Database' }).closest('.flex')!
    expect(within(dbCol as HTMLElement).getByText('App Database')).toBeInTheDocument()
    expect(within(dbCol as HTMLElement).getByText('Search Engine')).toBeInTheDocument()

    const intCol = screen.getByRole('heading', { name: 'Integration' }).closest('.flex')!
    expect(within(intCol as HTMLElement).getByText('Stripe')).toBeInTheDocument()
  })

  it('shows correct system count label in each column header', () => {
    renderGrid()
    // Application: 1, Integration: 1, Service: 1 → three "1 system" labels
    expect(screen.getAllByText('1 system', { selector: 'p' })).toHaveLength(3)
    // Database: 2 → one "2 systems" label
    expect(screen.getByText('2 systems', { selector: 'p' })).toBeInTheDocument()
  })

  it('renders only columns for types present in the systems list', () => {
    renderGrid([storefront]) // only Application type
    expect(screen.getByRole('heading', { name: 'Application' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Database' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Integration' })).not.toBeInTheDocument()
  })

  it('renders nothing when passed an empty systems array', () => {
    renderGrid([])
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })
})

describe('GridView — dataUse layout', () => {
  it('renders a column for each unique data use', () => {
    renderGrid(ALL_SYSTEMS, 'dataUse')
    expect(screen.getByRole('heading', { name: 'advertising.third_party' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'improve.system' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'provide.system' })).toBeInTheDocument()
  })

  it('places a system in multiple columns when it has multiple data uses', () => {
    renderGrid([storefront], 'dataUse')
    // storefront has advertising.third_party and improve.system
    expect(screen.getByRole('heading', { name: 'advertising.third_party' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'improve.system' })).toBeInTheDocument()
    // The name appears twice (once per column)
    expect(screen.getAllByText('Storefront')).toHaveLength(2)
  })

  it('renders a "(none)" column for systems with no data uses', () => {
    renderGrid([searchDb], 'dataUse')
    expect(screen.getByRole('heading', { name: '(none)' })).toBeInTheDocument()
  })
})

describe('GridView — system card content', () => {
  it('renders the system name', () => {
    renderGrid([storefront])
    expect(screen.getByText('Storefront')).toBeInTheDocument()
  })

  it('renders data category leaf labels', () => {
    renderGrid([storefront])
    expect(screen.getByText('cookie_id')).toBeInTheDocument()
    expect(screen.getByText('location')).toBeInTheDocument()
  })

  it('renders data use labels', () => {
    renderGrid([storefront])
    expect(screen.getByText('advertising.third_party')).toBeInTheDocument()
    expect(screen.getByText('improve.system')).toBeInTheDocument()
  })

  it('renders "Show description" toggle when description is present', () => {
    renderGrid([storefront]) // storefront has a description
    expect(screen.getByRole('button', { name: /show description/i })).toBeInTheDocument()
  })

  it('does not render "Show description" toggle when description is empty', () => {
    renderGrid([orders]) // orders has description: ''
    expect(screen.queryByRole('button', { name: /show description/i })).not.toBeInTheDocument()
  })

  it('expands and collapses the description on click', async () => {
    const user = userEvent.setup()
    renderGrid([storefront])

    const toggle = screen.getByRole('button', { name: /show description/i })
    await user.click(toggle)

    expect(screen.getByText('A default description')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /hide description/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /hide description/i }))
    expect(screen.queryByText('A default description')).not.toBeInTheDocument()
  })

  it('each card expands/collapses independently', async () => {
    const user = userEvent.setup()
    // Two systems, both with descriptions, both in Application column
    const sys2 = makeSystem({ fidesKey: 'sys2', name: 'System Two', description: 'Second description' })
    renderGrid([storefront, sys2])

    const toggles = screen.getAllByRole('button', { name: /show description/i })
    expect(toggles).toHaveLength(2)

    // Expand only the first
    await user.click(toggles[0])
    expect(screen.getByText('A default description')).toBeInTheDocument()
    expect(screen.queryByText('Second description')).not.toBeInTheDocument()
  })

  it('renders nothing for categories/data-uses sections when arrays are empty', () => {
    renderGrid([searchDb])
    expect(screen.queryByText('Categories')).not.toBeInTheDocument()
    expect(screen.queryByText('Data uses')).not.toBeInTheDocument()
  })
})

describe('GridView — dependency arrows', () => {
  it('renders ArrowOverlay when showArrows is true', () => {
    renderGrid(ALL_SYSTEMS, 'systemType', true)
    expect(screen.getByTestId('arrow-overlay')).toBeInTheDocument()
  })

  it('does not render ArrowOverlay when showArrows is false', () => {
    renderGrid(ALL_SYSTEMS, 'systemType', false)
    expect(screen.queryByTestId('arrow-overlay')).not.toBeInTheDocument()
  })
})

describe('GridView — layout switch', () => {
  it('re-renders correct columns when layoutMode prop changes', () => {
    const { rerender } = renderGrid(ALL_SYSTEMS, 'systemType')
    expect(screen.getByRole('heading', { name: 'Application' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'provide.system' })).not.toBeInTheDocument()

    rerender(
      <GridView systems={ALL_SYSTEMS} layoutMode="dataUse" showArrows={false} />
    )
    expect(screen.queryByRole('heading', { name: 'Application' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'provide.system' })).toBeInTheDocument()
  })

  it('re-renders when systems prop changes', () => {
    const { rerender } = renderGrid([storefront])
    expect(screen.getByText('Storefront')).toBeInTheDocument()
    expect(screen.queryByText('Stripe')).not.toBeInTheDocument()

    rerender(<GridView systems={[storefront, stripe]} layoutMode="systemType" showArrows={false} />)
    expect(screen.getByText('Stripe')).toBeInTheDocument()
  })

  it('removes a column when all its systems are removed', () => {
    const { rerender } = renderGrid([storefront, appDb])
    expect(screen.getByRole('heading', { name: 'Database' })).toBeInTheDocument()

    rerender(<GridView systems={[storefront]} layoutMode="systemType" showArrows={false} />)
    expect(screen.queryByRole('heading', { name: 'Database' })).not.toBeInTheDocument()
  })

  it('schedules a forceUpdate timer on layoutMode change (timer fires without error)', () => {
    vi.useFakeTimers()
    const { rerender } = renderGrid(ALL_SYSTEMS, 'systemType')

    rerender(<GridView systems={ALL_SYSTEMS} layoutMode="dataUse" showArrows={false} />)

    act(() => { vi.runAllTimers() })

    // If no error was thrown and columns reflect the new mode, the update completed
    expect(screen.getByRole('heading', { name: 'provide.system' })).toBeInTheDocument()
    vi.useRealTimers()
  })
})

describe('GridView — grid CSS structure', () => {
  it('sets gridTemplateColumns to repeat(N, ...) matching column count', () => {
    const { container } = renderGrid(ALL_SYSTEMS, 'systemType')
    // 4 unique system types → repeat(4, ...)
    const grid = container.querySelector('[style*="grid-template-columns"]') as HTMLElement
    expect(grid).toBeInTheDocument()
    expect(grid.style.gridTemplateColumns).toMatch(/repeat\(4,/)
  })

  it('adjusts column count for dataUse layout', () => {
    // storefront + orders → 3 unique uses: advertising.third_party, improve.system, provide.system
    const { container } = renderGrid([storefront, orders], 'dataUse')
    const grid = container.querySelector('[style*="grid-template-columns"]') as HTMLElement
    expect(grid.style.gridTemplateColumns).toMatch(/repeat\(3,/)
  })

  it('uses repeat(1, ...) when only one group exists', () => {
    const { container } = renderGrid([appDb, searchDb], 'systemType')
    const grid = container.querySelector('[style*="grid-template-columns"]') as HTMLElement
    expect(grid.style.gridTemplateColumns).toMatch(/repeat\(1,/)
  })
})
