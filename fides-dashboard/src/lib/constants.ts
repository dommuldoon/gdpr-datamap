export const TYPE_CONFIG: Record<
  string,
  { accent: string; labelLight: string; labelDark: string; dot: string }
> = {
  Application: {
    accent: "#7c3aed",
    labelLight: "text-violet-700 bg-violet-50",
    labelDark: "text-violet-400 bg-violet-500/10",
    dot: "bg-violet-500"
  },
  Service: {
    accent: "#2563eb",
    labelLight: "text-blue-700 bg-blue-50",
    labelDark: "text-blue-400 bg-blue-500/10",
    dot: "bg-blue-500"
  },
  Database: {
    accent: "#059669",
    labelLight: "text-emerald-700 bg-emerald-50",
    labelDark: "text-emerald-400 bg-emerald-500/10",
    dot: "bg-emerald-500"
  },
  Integration: {
    accent: "#d97706",
    labelLight: "text-amber-700 bg-amber-50",
    labelDark: "text-amber-400 bg-amber-500/10",
    dot: "bg-amber-500"
  }
};

export const DEFAULT_CONFIG = {
  accent: "#64748b",
  labelLight: "text-slate-700 bg-slate-100",
  labelDark: "text-slate-400 bg-slate-500/10",
  dot: "bg-slate-400"
};
