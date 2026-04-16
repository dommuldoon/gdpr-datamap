import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React, { createRef } from 'react'
import { SystemCard } from '../SystemCard'
import type { System } from '@/types'

// ---------------------------------------------------------------------------
// Framer Motion: skip animations in jsdom
// ---------------------------------------------------------------------------
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion')
  return {
    ...actual,
    motion: new Proxy(actual.motion, {
      get: (_target, prop: string) =>
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
// Fixtures
// ---------------------------------------------------------------------------
const makeSystem = (overrides: Partial<System> = {}): System => ({
  fidesKey: 'test_sys',
  name: 'Test System',
  description: '',
  systemType: 'Application',
  dataUses: [],
  dataCategories: [],
  dataCategoriesFull: [],
  dependencies: [],
  ...overrides,
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('SystemCard — name and type badge', () => {
  it('renders the system name', () => {
    render(<SystemCard system={makeSystem({ name: 'Payments Service' })} />)
    expect(screen.getByText('Payments Service')).toBeInTheDocument()
  })

  it('renders the system type badge', () => {
    render(<SystemCard system={makeSystem({ systemType: 'Database' })} />)
    expect(screen.getByText('Database')).toBeInTheDocument()
  })

  it('renders Application type badge', () => {
    render(<SystemCard system={makeSystem({ systemType: 'Application' })} />)
    expect(screen.getByText('Application')).toBeInTheDocument()
  })

  it('renders Service type badge', () => {
    render(<SystemCard system={makeSystem({ systemType: 'Service' })} />)
    expect(screen.getByText('Service')).toBeInTheDocument()
  })

  it('renders Integration type badge', () => {
    render(<SystemCard system={makeSystem({ systemType: 'Integration' })} />)
    expect(screen.getByText('Integration')).toBeInTheDocument()
  })

  it('renders an unknown system type using DEFAULT_CONFIG without error', () => {
    render(<SystemCard system={makeSystem({ systemType: 'CustomType' })} />)
    expect(screen.getByText('CustomType')).toBeInTheDocument()
  })
})

// jsdom normalizes hex colors to rgb() when reading element.style properties
const hexToRgb = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgb(${r}, ${g}, ${b})`
}

describe('SystemCard — left accent bar', () => {
  it('renders the accent bar element', () => {
    const { container } = render(<SystemCard system={makeSystem()} />)
    const bar = container.querySelector('.absolute.left-0.top-0.bottom-0')
    expect(bar).toBeInTheDocument()
  })

  it('Application accent color is violet (#7c3aed)', () => {
    const { container } = render(<SystemCard system={makeSystem({ systemType: 'Application' })} />)
    const bar = container.querySelector('.absolute.left-0.top-0.bottom-0') as HTMLElement
    expect(bar.style.background).toBe(hexToRgb('#7c3aed'))
  })

  it('Service accent color is blue (#2563eb)', () => {
    const { container } = render(<SystemCard system={makeSystem({ systemType: 'Service' })} />)
    const bar = container.querySelector('.absolute.left-0.top-0.bottom-0') as HTMLElement
    expect(bar.style.background).toBe(hexToRgb('#2563eb'))
  })

  it('Database accent color is green (#059669)', () => {
    const { container } = render(<SystemCard system={makeSystem({ systemType: 'Database' })} />)
    const bar = container.querySelector('.absolute.left-0.top-0.bottom-0') as HTMLElement
    expect(bar.style.background).toBe(hexToRgb('#059669'))
  })

  it('Integration accent color is amber (#d97706)', () => {
    const { container } = render(<SystemCard system={makeSystem({ systemType: 'Integration' })} />)
    const bar = container.querySelector('.absolute.left-0.top-0.bottom-0') as HTMLElement
    expect(bar.style.background).toBe(hexToRgb('#d97706'))
  })

  it('unknown type falls back to DEFAULT_CONFIG accent (#64748b)', () => {
    const { container } = render(<SystemCard system={makeSystem({ systemType: 'Unknown' })} />)
    const bar = container.querySelector('.absolute.left-0.top-0.bottom-0') as HTMLElement
    expect(bar.style.background).toBe(hexToRgb('#64748b'))
  })
})

describe('SystemCard — data categories', () => {
  it('renders each data category pill', () => {
    render(<SystemCard system={makeSystem({ dataCategories: ['email', 'location'] })} />)
    expect(screen.getByText('email')).toBeInTheDocument()
    expect(screen.getByText('location')).toBeInTheDocument()
  })

  it('renders the "Categories" section label when categories are present', () => {
    render(<SystemCard system={makeSystem({ dataCategories: ['email'] })} />)
    expect(screen.getByText('Categories')).toBeInTheDocument()
  })

  it('does not render the "Categories" section when dataCategories is empty', () => {
    render(<SystemCard system={makeSystem({ dataCategories: [] })} />)
    expect(screen.queryByText('Categories')).not.toBeInTheDocument()
  })

  it('renders all category pills without duplicates', () => {
    render(<SystemCard system={makeSystem({ dataCategories: ['email', 'ip_address', 'phone'] })} />)
    expect(screen.getAllByText(/email|ip_address|phone/)).toHaveLength(3)
  })
})

describe('SystemCard — data uses', () => {
  it('renders each data use pill', () => {
    render(<SystemCard system={makeSystem({ dataUses: ['provide.system', 'improve.system'] })} />)
    expect(screen.getByText('provide.system')).toBeInTheDocument()
    expect(screen.getByText('improve.system')).toBeInTheDocument()
  })

  it('renders the "Data uses" section label when uses are present', () => {
    render(<SystemCard system={makeSystem({ dataUses: ['provide.system'] })} />)
    expect(screen.getByText('Data uses')).toBeInTheDocument()
  })

  it('does not render the "Data uses" section when dataUses is empty', () => {
    render(<SystemCard system={makeSystem({ dataUses: [] })} />)
    expect(screen.queryByText('Data uses')).not.toBeInTheDocument()
  })
})

describe('SystemCard — description toggle', () => {
  it('shows the "Show description" button when description is non-empty', () => {
    render(<SystemCard system={makeSystem({ description: 'Handles user auth.' })} />)
    expect(screen.getByRole('button', { name: /show description/i })).toBeInTheDocument()
  })

  it('does not render the toggle button when description is empty string', () => {
    render(<SystemCard system={makeSystem({ description: '' })} />)
    expect(screen.queryByRole('button', { name: /show description/i })).not.toBeInTheDocument()
  })

  it('does not render the description text before the toggle is clicked', () => {
    render(<SystemCard system={makeSystem({ description: 'Secret content' })} />)
    expect(screen.queryByText('Secret content')).not.toBeInTheDocument()
  })

  it('expands and shows the description text on click', async () => {
    const user = userEvent.setup()
    render(<SystemCard system={makeSystem({ description: 'Secret content' })} />)

    await user.click(screen.getByRole('button', { name: /show description/i }))

    expect(screen.getByText('Secret content')).toBeInTheDocument()
  })

  it('changes button label to "Hide description" when expanded', async () => {
    const user = userEvent.setup()
    render(<SystemCard system={makeSystem({ description: 'Any text' })} />)

    await user.click(screen.getByRole('button', { name: /show description/i }))

    expect(screen.getByRole('button', { name: /hide description/i })).toBeInTheDocument()
  })

  it('collapses the description on a second click', async () => {
    const user = userEvent.setup()
    render(<SystemCard system={makeSystem({ description: 'Secret content' })} />)

    await user.click(screen.getByRole('button', { name: /show description/i }))
    await user.click(screen.getByRole('button', { name: /hide description/i }))

    expect(screen.queryByText('Secret content')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /show description/i })).toBeInTheDocument()
  })

  it('two cards with descriptions expand independently', async () => {
    const user = userEvent.setup()
    const sys1 = makeSystem({ fidesKey: 'a', name: 'Alpha', description: 'Alpha desc' })
    const sys2 = makeSystem({ fidesKey: 'b', name: 'Beta', description: 'Beta desc' })
    render(
      <>
        <SystemCard system={sys1} />
        <SystemCard system={sys2} />
      </>
    )

    const [firstToggle] = screen.getAllByRole('button', { name: /show description/i })
    await user.click(firstToggle)

    expect(screen.getByText('Alpha desc')).toBeInTheDocument()
    expect(screen.queryByText('Beta desc')).not.toBeInTheDocument()
  })
})

describe('SystemCard — innerRef forwarding', () => {
  it('forwards innerRef to the root DOM element', () => {
    const ref = createRef<HTMLDivElement>()
    render(<SystemCard system={makeSystem()} innerRef={ref} />)
    expect(ref.current).not.toBeNull()
    expect(ref.current?.tagName).toBe('DIV')
  })
})
