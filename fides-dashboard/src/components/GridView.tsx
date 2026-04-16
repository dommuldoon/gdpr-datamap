import { useRef, useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SystemCard } from "./SystemCard";
import { ArrowOverlay } from "./ArrowOverlay";
import type { System, LayoutMode } from "@/types";

interface GridViewProps {
  systems: System[];
  layoutMode: LayoutMode;
  showArrows: boolean;
}

function groupBy(systems: System[], mode: LayoutMode): Map<string, System[]> {
  const map = new Map<string, System[]>();

  if (mode === "systemType") {
    for (const s of systems) {
      const group = s.systemType;
      if (!map.has(group)) map.set(group, []);
      map.get(group)!.push(s);
    }
  } else {
    // dataUse — a system can appear in multiple groups
    for (const s of systems) {
      const uses = s.dataUses.length > 0 ? s.dataUses : ["(none)"];
      for (const use of uses) {
        if (!map.has(use)) map.set(use, []);
        map.get(use)!.push(s);
      }
    }
  }
  return map;
}

export function GridView({ systems, layoutMode, showArrows }: GridViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cardRefs, setCardRefs] = useState<Map<string, HTMLDivElement>>(
    new Map()
  );

  const setRef = useCallback(
    (key: string) => (el: HTMLDivElement | null) => {
      setCardRefs((prev) => {
        if (el) {
          const next = new Map(prev);
          next.set(key, el);
          return next;
        }
        const next = new Map(prev);
        next.delete(key);
        return next;
      });
    },
    []
  );

  const groups = groupBy(systems, layoutMode);

  // Force arrow recalculation when layout changes
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => forceUpdate((n) => n + 1), 150);

    return () => clearTimeout(t);
  }, [layoutMode, systems]);

  return (
    <div ref={containerRef} className="relative">
      {showArrows && (
        <ArrowOverlay
          systems={systems}
          cardRefs={cardRefs}
          containerRef={containerRef}
        />
      )}

      <motion.div
        layout
        className="grid gap-6"
        style={{
          gridTemplateColumns: `repeat(${groups.size}, minmax(220px, 1fr))`
        }}
      >
        <AnimatePresence mode="popLayout">
          {[...groups.entries()].map(([group, members]) => (
            <motion.div
              key={group}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-3"
            >
              {/* Column header */}
              <div className="sticky top-[105px] z-20">
                <div
                  className="backdrop-blur-sm rounded-lg px-3 py-2"
                  style={{
                    background: 'var(--col-header-bg)',
                    border: '1px solid var(--card-border)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  }}
                >
                  <h2 className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    {group}
                  </h2>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                    {members.length} system{members.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-3">
                <AnimatePresence mode="popLayout">
                  {members.map((system) => (
                    <SystemCard
                      key={`${group}-${system.fidesKey}`}
                      system={system}
                      innerRef={setRef(`${group}/${system.fidesKey}`)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
