import { useMemo, useCallback, useEffect } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  MarkerType,
  Handle,
  useNodesState,
  type Node,
  type Edge,
  type NodeTypes,
  Position,
} from 'reactflow'
import 'reactflow/dist/style.css'
import type { System, LayoutMode } from '@/types'
import { SystemCard } from './SystemCard'
import { colorForSystem, hexToRgba } from '@/lib/systemColors'
import { useFilters } from '@/store'

// Custom node that wraps SystemCard
function SystemNode({ data }: { data: { system: System } }) {
  return (
    <div style={{ width: 220 }} className="relative">
      <Handle type="target" position={Position.Left} className="bg-indigo-400! border-indigo-300!" />
      <SystemCard system={data.system} />
      <Handle type="source" position={Position.Right} className="bg-indigo-400! border-indigo-300!" />
    </div>
  )
}

const nodeTypes: NodeTypes = { system: SystemNode }

const TYPE_COLORS: Record<string, string> = {
  Application: '#7c3aed',
  Service: '#2563eb',
  Database: '#059669',
  Integration: '#d97706',
}

interface Props {
  systems: System[]
  layoutMode: LayoutMode
  showArrows: boolean
}

const CARD_W = 240
const CARD_H = 180
const COL_GAP = 60
const ROW_GAP = 40
const HEADER_H = 50

function buildLayout(systems: System[], mode: LayoutMode): Node[] {
  const groups = new Map<string, System[]>()

  if (mode === 'systemType') {
    for (const s of systems) {
      if (!groups.has(s.systemType)) groups.set(s.systemType, [])
      groups.get(s.systemType)!.push(s)
    }
  } else {
    for (const s of systems) {
      const uses = s.dataUses.length > 0 ? s.dataUses : ['(none)']
      for (const use of uses) {
        if (!groups.has(use)) groups.set(use, [])
        groups.get(use)!.push(s)
      }
    }
  }

  const nodes: Node[] = []
  const seen = new Set<string>()
  let colX = 0

  for (const [, members] of groups.entries()) {
    members.forEach((system, rowIdx) => {
      if (seen.has(system.fidesKey)) return  // skip duplicates — React Flow requires unique IDs
      seen.add(system.fidesKey)
      nodes.push({
        id: system.fidesKey,
        type: 'system',
        position: { x: colX, y: HEADER_H + rowIdx * (CARD_H + ROW_GAP) },
        data: { system },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      })
    })
    colX += CARD_W + COL_GAP
  }

  return nodes
}

export function GraphView({ systems, layoutMode, showArrows }: Props) {
  const { darkMode } = useFilters()
  const initialNodes = useMemo(() => buildLayout(systems, layoutMode), [systems, layoutMode])

  // Edges are derived directly — no state needed since users can't drag them
  const edges = useMemo<Edge[]>(() => {
    if (!showArrows) return []
    const allKeys = systems.map(s => s.fidesKey)
    return systems.flatMap(s => {
      const color = colorForSystem(s.fidesKey, allKeys)
      const stroke = hexToRgba(color, 0.75)
      return s.dependencies
        .filter(dep => systems.some(x => x.fidesKey === dep))
        .map(dep => ({
          id: `${s.fidesKey}->${dep}`,
          source: s.fidesKey,
          target: dep,
          animated: true,
          style: { stroke, strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: stroke },
        }))
    })
  }, [systems, showArrows])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)

  useEffect(() => { setNodes(initialNodes) }, [initialNodes, setNodes])

  const getNodeColor = useCallback((node: Node) => {
    return TYPE_COLORS[node.data?.system?.systemType] ?? '#94a3b8'
  }, [])

  return (
    <div
      className="w-full h-[75vh] rounded-xl overflow-hidden"
      style={{ border: '1px solid var(--card-border)', background: 'var(--graph-bg)' }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.2}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background color={darkMode ? '#1e2030' : '#e2e8f0'} gap={20} />
        <Controls className="shadow-sm! border-slate-200!" />
        <MiniMap
          nodeColor={getNodeColor}
          maskColor={darkMode ? 'rgba(15,16,24,0.85)' : 'rgba(248,250,252,0.85)'}
          style={{ background: darkMode ? '#12131c' : '#f8fafc' }}
          className="rounded-lg!"
        />
      </ReactFlow>
    </div>
  )
}
