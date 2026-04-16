import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, act } from '@testing-library/react'
import { useRef } from 'react'
import { ArrowOverlay } from '../ArrowOverlay'
import { colorForSystem } from '@/lib/systemColors'
import type { System } from '@/types'

// ---------------------------------------------------------------------------
// Mock systemColors — prevents the module-level color cache from polluting
// test results and makes color assertions deterministic.
// ---------------------------------------------------------------------------
vi.mock('@/lib/systemColors', () => ({
  colorForSystem: vi.fn(() => '#ff0000'),
  // Return a simple string so we can assert on exact values without
  // worrying about rgba conversion maths.
  hexToRgba: (hex: string, alpha: number) => `${hex}@${alpha}`,
}))

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
const makeSystem = (overrides: Partial<System> = {}): System => ({
  fidesKey: 'default',
  name: 'Default',
  description: '',
  systemType: 'Application',
  dataUses: [],
  dataCategories: [],
  dataCategoriesFull: [],
  dependencies: [],
  ...overrides,
})

const sysA = makeSystem({ fidesKey: 'sys_a', dependencies: ['sys_b'] })
const sysB = makeSystem({ fidesKey: 'sys_b' })
const sysC = makeSystem({ fidesKey: 'sys_c' })

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const makeEl = () => document.createElement('div') as HTMLDivElement

/**
 * Wrapper that provides a real containerRef pointing at a mounted DOM node.
 * This is the normal rendering path.
 */
function Wrapper({
  systems,
  cardRefs,
}: {
  systems: System[]
  cardRefs: Map<string, HTMLDivElement>
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  return (
    <div ref={containerRef} data-testid="container">
      <ArrowOverlay systems={systems} cardRefs={cardRefs} containerRef={containerRef} />
    </div>
  )
}

/**
 * Wrapper where containerRef is never attached to a DOM node (current stays null).
 */
function NullContainerWrapper({
  systems,
  cardRefs,
}: {
  systems: System[]
  cardRefs: Map<string, HTMLDivElement>
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  // No ref={containerRef} → current remains null
  return <ArrowOverlay systems={systems} cardRefs={cardRefs} containerRef={containerRef} />
}

function renderArrows(
  systems: System[],
  cardRefs: Map<string, HTMLDivElement> = new Map(),
) {
  return render(<Wrapper systems={systems} cardRefs={cardRefs} />)
}

/** Advance past the 100ms recalculate debounce timer. */
function flushTimers() {
  act(() => { vi.advanceTimersByTime(150) })
}

// ---------------------------------------------------------------------------
// Global setup
// ---------------------------------------------------------------------------
beforeEach(() => {
  vi.useFakeTimers()
  vi.mocked(colorForSystem).mockReturnValue('#ff0000')
})

afterEach(() => {
  vi.useRealTimers()
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ArrowOverlay — renders nothing', () => {
  it('returns null when containerRef.current is null', () => {
    const cardRefs = new Map([
      [sysA.fidesKey, makeEl()],
      [sysB.fidesKey, makeEl()],
    ])
    const { container } = render(
      <NullContainerWrapper systems={[sysA, sysB]} cardRefs={cardRefs} />
    )
    flushTimers()
    expect(container.querySelector('svg')).not.toBeInTheDocument()
  })

  it('returns null when no system has dependencies', () => {
    const { container } = renderArrows([sysB, sysC])
    flushTimers()
    expect(container.querySelector('svg')).not.toBeInTheDocument()
  })

  it('returns null when the source system has no card ref', () => {
    // sysA depends on sysB; sysA itself is missing from cardRefs
    const cardRefs = new Map([[sysB.fidesKey, makeEl()]])
    const { container } = renderArrows([sysA, sysB], cardRefs)
    flushTimers()
    expect(container.querySelector('svg')).not.toBeInTheDocument()
  })

  it('returns null when the dependency card ref is missing', () => {
    // sysA depends on sysB; sysB is missing from cardRefs
    const cardRefs = new Map([[sysA.fidesKey, makeEl()]])
    const { container } = renderArrows([sysA, sysB], cardRefs)
    flushTimers()
    expect(container.querySelector('svg')).not.toBeInTheDocument()
  })

  it('returns null before the 100ms recalculate timer fires', () => {
    const cardRefs = new Map([
      [sysA.fidesKey, makeEl()],
      [sysB.fidesKey, makeEl()],
    ])
    const { container } = renderArrows([sysA, sysB], cardRefs)
    // deliberately do NOT advance timers
    expect(container.querySelector('svg')).not.toBeInTheDocument()
  })
})

describe('ArrowOverlay — SVG structure', () => {
  it('renders an SVG after the timer when both source and dep have card refs', () => {
    const cardRefs = new Map([
      [sysA.fidesKey, makeEl()],
      [sysB.fidesKey, makeEl()],
    ])
    const { container } = renderArrows([sysA, sysB], cardRefs)
    flushTimers()
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('SVG has correct positioning classes', () => {
    const cardRefs = new Map([
      [sysA.fidesKey, makeEl()],
      [sysB.fidesKey, makeEl()],
    ])
    const { container } = renderArrows([sysA, sysB], cardRefs)
    flushTimers()
    const svg = container.querySelector('svg')!
    expect(svg).toHaveClass('pointer-events-none')
    expect(svg).toHaveClass('absolute')
    expect(svg).toHaveClass('inset-0')
    expect(svg).toHaveClass('z-10')
  })

  it('SVG has overflow:visible so arrows can extend outside bounds', () => {
    const cardRefs = new Map([
      [sysA.fidesKey, makeEl()],
      [sysB.fidesKey, makeEl()],
    ])
    const { container } = renderArrows([sysA, sysB], cardRefs)
    flushTimers()
    const svg = container.querySelector('svg') as SVGSVGElement
    expect(svg.style.overflow).toBe('visible')
  })

  it('SVG dimensions reflect container scrollWidth × scrollHeight', () => {
    const cardRefs = new Map([
      [sysA.fidesKey, makeEl()],
      [sysB.fidesKey, makeEl()],
    ])
    const { container } = renderArrows([sysA, sysB], cardRefs)

    const containerEl = container.querySelector('[data-testid="container"]') as HTMLDivElement
    Object.defineProperty(containerEl, 'scrollWidth', { get: () => 800, configurable: true })
    Object.defineProperty(containerEl, 'scrollHeight', { get: () => 600, configurable: true })

    flushTimers()

    const svg = container.querySelector('svg')!
    expect(svg).toHaveAttribute('width', '800')
    expect(svg).toHaveAttribute('height', '600')
  })
})

describe('ArrowOverlay — line elements', () => {
  it('renders one <line> per dependency pair', () => {
    const cardRefs = new Map([
      [sysA.fidesKey, makeEl()],
      [sysB.fidesKey, makeEl()],
    ])
    const { container } = renderArrows([sysA, sysB], cardRefs)
    flushTimers()
    expect(container.querySelectorAll('line')).toHaveLength(1)
  })

  it('renders one line per dep when a system has multiple dependencies', () => {
    const sysD = makeSystem({ fidesKey: 'sys_d', dependencies: ['sys_b', 'sys_c'] })
    const cardRefs = new Map([
      [sysD.fidesKey, makeEl()],
      [sysB.fidesKey, makeEl()],
      [sysC.fidesKey, makeEl()],
    ])
    const { container } = renderArrows([sysD, sysB, sysC], cardRefs)
    flushTimers()
    expect(container.querySelectorAll('line')).toHaveLength(2)
  })

  it('aggregates lines across multiple source systems', () => {
    // sysA→sysB and sysC→sysB = 2 lines
    const sysC2 = makeSystem({ fidesKey: 'sys_c', dependencies: ['sys_b'] })
    const cardRefs = new Map([
      [sysA.fidesKey, makeEl()],
      [sysC2.fidesKey, makeEl()],
      [sysB.fidesKey, makeEl()],
    ])
    const { container } = renderArrows([sysA, sysC2, sysB], cardRefs)
    flushTimers()
    expect(container.querySelectorAll('line')).toHaveLength(2)
  })

  it('line has strokeDasharray="4 3"', () => {
    const cardRefs = new Map([
      [sysA.fidesKey, makeEl()],
      [sysB.fidesKey, makeEl()],
    ])
    const { container } = renderArrows([sysA, sysB], cardRefs)
    flushTimers()
    expect(container.querySelector('line')).toHaveAttribute('stroke-dasharray', '4 3')
  })

  it('line has strokeWidth="1.5"', () => {
    const cardRefs = new Map([
      [sysA.fidesKey, makeEl()],
      [sysB.fidesKey, makeEl()],
    ])
    const { container } = renderArrows([sysA, sysB], cardRefs)
    flushTimers()
    expect(container.querySelector('line')).toHaveAttribute('stroke-width', '1.5')
  })

  it('line markerEnd references the arrowhead marker for its color', () => {
    // colorForSystem returns '#ff0000' → marker id = 'arrowhead-ff0000'
    const cardRefs = new Map([
      [sysA.fidesKey, makeEl()],
      [sysB.fidesKey, makeEl()],
    ])
    const { container } = renderArrows([sysA, sysB], cardRefs)
    flushTimers()
    expect(container.querySelector('line')).toHaveAttribute(
      'marker-end',
      'url(#arrowhead-ff0000)',
    )
  })

  it('line coordinates come from getBoundingClientRect of source and dep elements', () => {
    const fromEl = makeEl()
    const toEl = makeEl()
    vi.spyOn(fromEl, 'getBoundingClientRect').mockReturnValue({
      left: 100, top: 50, width: 200, height: 80,
      right: 300, bottom: 130, x: 100, y: 50, toJSON: () => ({}),
    } as DOMRect)
    vi.spyOn(toEl, 'getBoundingClientRect').mockReturnValue({
      left: 500, top: 200, width: 200, height: 80,
      right: 700, bottom: 280, x: 500, y: 200, toJSON: () => ({}),
    } as DOMRect)

    const cardRefs = new Map([
      [sysA.fidesKey, fromEl],
      [sysB.fidesKey, toEl],
    ])
    const { container } = renderArrows([sysA, sysB], cardRefs)
    flushTimers()

    // center x = left - containerLeft(0) + scrollLeft(0) + width/2
    // center y = top  - containerTop(0)  + scrollTop(0)  + height/2
    const line = container.querySelector('line')!
    expect(line).toHaveAttribute('x1', '200')  // 100 + 200/2
    expect(line).toHaveAttribute('y1', '90')   //  50 +  80/2
    expect(line).toHaveAttribute('x2', '600')  // 500 + 200/2
    expect(line).toHaveAttribute('y2', '240')  // 200 +  80/2
  })
})

describe('ArrowOverlay — markers', () => {
  it('renders one marker per unique arrow color', () => {
    // Both arrows from sysD share the same color (mock always returns '#ff0000')
    const sysD = makeSystem({ fidesKey: 'sys_d', dependencies: ['sys_b', 'sys_c'] })
    const cardRefs = new Map([
      [sysD.fidesKey, makeEl()],
      [sysB.fidesKey, makeEl()],
      [sysC.fidesKey, makeEl()],
    ])
    const { container } = renderArrows([sysD, sysB, sysC], cardRefs)
    flushTimers()
    expect(container.querySelectorAll('marker')).toHaveLength(1)
  })

  it('renders separate markers when two source systems have different colors', () => {
    vi.mocked(colorForSystem).mockImplementation((key: string) =>
      key === 'sys_a' ? '#ff0000' : '#0000ff',
    )
    const sysC2 = makeSystem({ fidesKey: 'sys_c', dependencies: ['sys_b'] })
    const cardRefs = new Map([
      [sysA.fidesKey, makeEl()],
      [sysC2.fidesKey, makeEl()],
      [sysB.fidesKey, makeEl()],
    ])
    const { container } = renderArrows([sysA, sysC2, sysB], cardRefs)
    flushTimers()
    expect(container.querySelectorAll('marker')).toHaveLength(2)
  })

  it('marker id uses the hex color with the leading # stripped', () => {
    const cardRefs = new Map([
      [sysA.fidesKey, makeEl()],
      [sysB.fidesKey, makeEl()],
    ])
    const { container } = renderArrows([sysA, sysB], cardRefs)
    flushTimers()
    expect(container.querySelector('marker')).toHaveAttribute('id', 'arrowhead-ff0000')
  })

  it('marker polygon fill uses hexToRgba at 0.8 opacity', () => {
    const cardRefs = new Map([
      [sysA.fidesKey, makeEl()],
      [sysB.fidesKey, makeEl()],
    ])
    const { container } = renderArrows([sysA, sysB], cardRefs)
    flushTimers()
    // hexToRgba mock: `${hex}@${alpha}` → '#ff0000@0.8'
    expect(container.querySelector('marker polygon')).toHaveAttribute('fill', '#ff0000@0.8')
  })
})

describe('ArrowOverlay — compound key lookup (findEl)', () => {
  it('resolves a "group/fidesKey" dep ref to match a plain fidesKey dependency', () => {
    // dep card is stored under compound key "Application/sys_b"
    const cardRefs = new Map<string, HTMLDivElement>([
      [sysA.fidesKey, makeEl()],
      [`Application/${sysB.fidesKey}`, makeEl()],
    ])
    const { container } = renderArrows([sysA, sysB], cardRefs)
    flushTimers()
    expect(container.querySelectorAll('line')).toHaveLength(1)
  })

  it('resolves a compound key on the source system as well', () => {
    // source card is stored under compound key "Application/sys_a"
    const cardRefs = new Map<string, HTMLDivElement>([
      [`Application/${sysA.fidesKey}`, makeEl()],
      [sysB.fidesKey, makeEl()],
    ])
    const { container } = renderArrows([sysA, sysB], cardRefs)
    flushTimers()
    expect(container.querySelectorAll('line')).toHaveLength(1)
  })

  it('resolves both source and dep compound keys', () => {
    const cardRefs = new Map<string, HTMLDivElement>([
      [`col1/${sysA.fidesKey}`, makeEl()],
      [`col2/${sysB.fidesKey}`, makeEl()],
    ])
    const { container } = renderArrows([sysA, sysB], cardRefs)
    flushTimers()
    expect(container.querySelectorAll('line')).toHaveLength(1)
  })

  it('does not match a key that only partially ends with the fidesKey', () => {
    // "other_sys_b" ends with "sys_b" as a substring but not after a "/"
    const cardRefs = new Map<string, HTMLDivElement>([
      [sysA.fidesKey, makeEl()],
      ['other_sys_b', makeEl()], // should NOT match dep 'sys_b'
    ])
    const { container } = renderArrows([sysA, sysB], cardRefs)
    flushTimers()
    expect(container.querySelector('svg')).not.toBeInTheDocument()
  })
})

describe('ArrowOverlay — window resize', () => {
  it('recalculates arrows when a resize event fires', () => {
    const cardRefs = new Map([
      [sysA.fidesKey, makeEl()],
      [sysB.fidesKey, makeEl()],
    ])
    const { container } = renderArrows([sysA, sysB], cardRefs)
    flushTimers()
    expect(container.querySelectorAll('line')).toHaveLength(1)

    // Fire resize — recalculate is called directly (no extra timer)
    act(() => { window.dispatchEvent(new Event('resize')) })

    // Arrows should still be present after recalculation
    expect(container.querySelectorAll('line')).toHaveLength(1)
  })

  it('removes the resize listener when the component unmounts', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener')
    const cardRefs = new Map([
      [sysA.fidesKey, makeEl()],
      [sysB.fidesKey, makeEl()],
    ])
    const { unmount } = renderArrows([sysA, sysB], cardRefs)

    unmount()

    expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    removeSpy.mockRestore()
  })
})
