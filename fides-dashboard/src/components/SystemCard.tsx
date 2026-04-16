import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { System } from '@/types'

const TYPE_COLORS: Record<string, string> = {
  Application: 'bg-violet-500/10 text-violet-700 border-violet-300',
  Service: 'bg-blue-500/10 text-blue-700 border-blue-300',
  Database: 'bg-emerald-500/10 text-emerald-700 border-emerald-300',
  Integration: 'bg-amber-500/10 text-amber-700 border-amber-300',
}

interface Props {
  system: System
  /** Forwarded ref so the arrow layer can measure card positions */
  innerRef?: React.Ref<HTMLDivElement>
}

export function SystemCard({ system, innerRef }: Props) {
  const [expanded, setExpanded] = useState(false)
  const colorClass = TYPE_COLORS[system.systemType] ?? 'bg-slate-100 text-slate-700 border-slate-300'

  return (
    <motion.div
      ref={innerRef}
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="rounded-xl border bg-white shadow-sm flex flex-col gap-2 p-4 transition-shadow hover:shadow-md"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <span className="font-semibold text-sm text-slate-800 leading-snug">{system.name}</span>
        <Badge variant="outline" className={cn('shrink-0 text-[10px] px-1.5 py-0.5 leading-none', colorClass)}>
          {system.systemType}
        </Badge>
      </div>

      {/* Data categories */}
      {system.dataCategories.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {system.dataCategories.map(cat => (
            <span
              key={cat}
              className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600"
            >
              {cat}
            </span>
          ))}
        </div>
      )}

      {/* Data uses */}
      {system.dataUses.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {system.dataUses.map(use => (
            <span
              key={use}
              className="inline-block rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] text-indigo-600"
            >
              {use}
            </span>
          ))}
        </div>
      )}

      {/* Expandable description */}
      {system.description && (
        <div>
          <button
            onClick={() => setExpanded(e => !e)}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
          >
            <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={12} />
            </motion.span>
            {expanded ? 'Hide' : 'Details'}
          </button>
          <AnimatePresence initial={false}>
            {expanded && (
              <motion.p
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden text-[12px] text-slate-500 mt-1 leading-relaxed"
              >
                {system.description}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  )
}
