import { useEffect, useState, useCallback } from 'react'
import type { System } from '@/types'
import { colorForSystem, hexToRgba } from '@/lib/systemColors'

interface Props {
  systems: System[]
  cardRefs: Map<string, HTMLDivElement>
  containerRef: React.RefObject<HTMLDivElement | null>
}

interface Arrow {
  id: string
  x1: number
  y1: number
  x2: number
  y2: number
  color: string
}

function getCenter(el: HTMLDivElement, container: HTMLDivElement) {
  const elRect = el.getBoundingClientRect()
  const cRect = container.getBoundingClientRect()
  return {
    x: elRect.left - cRect.left + container.scrollLeft + elRect.width / 2,
    y: elRect.top - cRect.top + container.scrollTop + elRect.height / 2,
  }
}

// cardRefs uses compound keys "group/fidesKey" so each column instance has its own slot.
// This helper finds the first live element for a given fidesKey.
function findEl(cardRefs: Map<string, HTMLDivElement>, fidesKey: string): HTMLDivElement | undefined {
  for (const [key, el] of cardRefs) {
    if (key === fidesKey || key.endsWith(`/${fidesKey}`)) return el
  }
}

export function ArrowOverlay({ systems, cardRefs, containerRef }: Props) {
  const [arrows, setArrows] = useState<Arrow[]>([])
  const [size, setSize] = useState({ w: 0, h: 0 })

  const allKeys = systems.map(s => s.fidesKey)

  const recalculate = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    setSize({ w: container.scrollWidth, h: container.scrollHeight })

    const next: Arrow[] = []
    for (const system of systems) {
      const fromEl = findEl(cardRefs, system.fidesKey)
      if (!fromEl) continue
      const color = colorForSystem(system.fidesKey, allKeys)
      for (const dep of system.dependencies) {
        const toEl = findEl(cardRefs, dep)
        if (!toEl) continue
        const from = getCenter(fromEl, container)
        const to = getCenter(toEl, container)
        next.push({ id: `${system.fidesKey}->${dep}`, x1: from.x, y1: from.y, x2: to.x, y2: to.y, color })
      }
    }
    setArrows(next)
  }, [systems, cardRefs, containerRef, allKeys])

  useEffect(() => {
    const t = setTimeout(recalculate, 100)
    return () => clearTimeout(t)
  }, [recalculate])

  useEffect(() => {
    window.addEventListener('resize', recalculate)
    return () => window.removeEventListener('resize', recalculate)
  }, [recalculate])

  if (arrows.length === 0) return null

  // One marker per unique color
  const uniqueColors = [...new Set(arrows.map(a => a.color))]

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-10"
      width={size.w}
      height={size.h}
      style={{ overflow: 'visible' }}
    >
      <defs>
        {uniqueColors.map(color => (
          <marker
            key={color}
            id={`arrowhead-${color.slice(1)}`}
            markerWidth="8"
            markerHeight="6"
            refX="8"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" fill={hexToRgba(color, 0.8)} />
          </marker>
        ))}
      </defs>
      {arrows.map(a => (
        <line
          key={a.id}
          x1={a.x1}
          y1={a.y1}
          x2={a.x2}
          y2={a.y2}
          stroke={hexToRgba(a.color, 0.55)}
          strokeWidth={1.5}
          strokeDasharray="4 3"
          markerEnd={`url(#arrowhead-${a.color.slice(1)})`}
        />
      ))}
    </svg>
  )
}
