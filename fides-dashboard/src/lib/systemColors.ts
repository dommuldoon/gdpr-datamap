// Assigns a stable color to each system by its position in the list.
// Both views import this so arrows always use the same color per system.

const PALETTE = [
  '#6366f1', // indigo
  '#f59e0b', // amber
  '#10b981', // emerald
  '#ef4444', // red
  '#3b82f6', // blue
  '#ec4899', // pink
  '#8b5cf6', // violet
  '#14b8a6', // teal
  '#f97316', // orange
  '#84cc16', // lime
]

const cache = new Map<string, string>()

export function colorForSystem(fidesKey: string, allKeys: string[]): string {
  if (cache.has(fidesKey)) return cache.get(fidesKey)!
  const idx = allKeys.indexOf(fidesKey)
  const color = PALETTE[idx % PALETTE.length]
  cache.set(fidesKey, color)
  return color
}

export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
