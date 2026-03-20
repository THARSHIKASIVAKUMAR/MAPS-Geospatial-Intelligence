export default function TerritoryTooltip({ territory, position }) {
  if (!territory || !position) return null

  return (
    <div
      className="absolute pointer-events-none z-20 bg-ink-800/95 backdrop-blur-sm border border-white/[0.08] rounded-xl px-4 py-3 shadow-2xl"
      style={{
        left: position.x + 16,
        top: position.y - 20,
        transform: 'translateY(-100%)',
      }}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: territory.color }} />
        <span className="font-display font-bold text-sm text-white">{territory.name}</span>
      </div>
      <div className="text-xs text-white/45">Manager: <span className="text-white/70">{territory.manager}</span></div>
      <div className="text-xs text-white/45 mt-0.5">Target: <span className="text-white/70">₹{(territory.target / 100000).toFixed(0)}L</span></div>
    </div>
  )
}
