import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { System } from '@/types'

const TYPE_CONFIG: Record<string, { accent: string; labelLight: string; labelDark: string; dot: string }> = {
  Application: { accent: '#7c3aed', labelLight: 'text-violet-700 bg-violet-50',   labelDark: 'text-violet-400 bg-violet-500/10', dot: 'bg-violet-500' },
  Service:     { accent: '#2563eb', labelLight: 'text-blue-700 bg-blue-50',       labelDark: 'text-blue-400 bg-blue-500/10',     dot: 'bg-blue-500' },
  Database:    { accent: '#059669', labelLight: 'text-emerald-700 bg-emerald-50', labelDark: 'text-emerald-400 bg-emerald-500/10', dot: 'bg-emerald-500' },
  Integration: { accent: '#d97706', labelLight: 'text-amber-700 bg-amber-50',     labelDark: 'text-amber-400 bg-amber-500/10',   dot: 'bg-amber-500' },
}

const DEFAULT_CONFIG = {
  accent: '#64748b',
  labelLight: 'text-slate-700 bg-slate-100',
  labelDark: 'text-slate-400 bg-slate-500/10',
  dot: 'bg-slate-400',
}

interface Props {
  system: System
  innerRef?: React.Ref<HTMLDivElement>
}

export function SystemCard({ system, innerRef }: Props) {
  const [expanded, setExpanded] = useState(false)
  const config = TYPE_CONFIG[system.systemType] ?? DEFAULT_CONFIG

  return (
    <motion.div
      ref={innerRef}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="group relative rounded-xl overflow-hidden"
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
      }}
    >
      {/* Left accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: config.accent }} />

      <div className="pl-4 pr-4 pt-3.5 pb-3 flex flex-col gap-2.5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <span className="font-semibold text-[13px] text-slate-900 dark:text-slate-100 leading-snug tracking-tight">
            {system.name}
          </span>
          <span
            className={cn(
              'shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
              config.labelLight,
              'dark:' + config.labelDark.replace(/ /g, ' dark:')
            )}
          >
            <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
            {system.systemType}
          </span>
        </div>

        {/* Data categories */}
        {system.dataCategories.length > 0 && (
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Categories
            </span>
            <div className="flex flex-wrap gap-1">
              {system.dataCategories.map(cat => (
                <span
                  key={cat}
                  className="inline-block rounded-md bg-slate-100 dark:bg-slate-700/50 px-1.5 py-0.5 text-[11px] text-slate-600 dark:text-slate-300 font-medium"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Data uses */}
        {system.dataUses.length > 0 && (
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Data uses
            </span>
            <div className="flex flex-wrap gap-1">
              {system.dataUses.map(use => (
                <span
                  key={use}
                  className="inline-block rounded-md bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.5 text-[11px] text-indigo-700 dark:text-indigo-400 font-medium"
                >
                  {use}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Expandable description */}
        {system.description && (
          <div className="border-t border-slate-100 dark:border-slate-700/60 pt-2 -mx-4 px-4">
            <button
              onClick={() => setExpanded(e => !e)}
              className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors w-full"
            >
              <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.18 }}>
                <ChevronDown size={12} />
              </motion.span>
              {expanded ? 'Hide description' : 'Show description'}
            </button>
            <AnimatePresence initial={false}>
              {expanded && (
                <motion.p
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="overflow-hidden text-[12px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed"
                >
                  {system.description}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  )
}
