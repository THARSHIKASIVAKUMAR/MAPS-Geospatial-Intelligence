import { useEffect, useRef } from 'react'

function ScoreBar({ value }) {
  const color = value >= 70 ? '#00ff9d' : value >= 40 ? '#ffb800' : '#ff4d4d'
  return (
    <div className="relative h-1.5 bg-white/10 rounded-full overflow-hidden">
      <div
        className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
        style={{ width: `${value}%`, backgroundColor: color, boxShadow: `0 0 8px ${color}60` }}
      />
    </div>
  )
}

function MetricRow({ label, value, accent }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/[0.05]">
      <span className="text-xs text-white/40">{label}</span>
      <span className="text-xs font-mono font-medium" style={{ color: accent || '#e2e8f0' }}>{value}</span>
    </div>
  )
}

export default function PointDetail({ point, onClose }) {
  const panelRef = useRef(null)

  useEffect(() => {
    if (!panelRef.current) return
    panelRef.current.style.transform = 'translateX(100%)'
    panelRef.current.style.opacity = '0'
    requestAnimationFrame(() => {
      panelRef.current.style.transition = 'transform 0.3s cubic-bezier(0.16,1,0.3,1), opacity 0.25s ease'
      panelRef.current.style.transform = 'translateX(0)'
      panelRef.current.style.opacity = '1'
    })
  }, [point?.id])

  if (!point) return null

  const scoreColor = point.performance_score >= 70 ? '#00ff9d'
    : point.performance_score >= 40 ? '#ffb800' : '#ff4d4d'
  const scoreLabel = point.performance_score >= 70 ? 'HIGH' : point.performance_score >= 40 ? 'MEDIUM' : 'LOW'

  const statusColors = { active: '#00ff9d', inactive: '#ff4d4d', pending: '#ffb800' }
  const statusColor = statusColors[point.status] || '#e2e8f0'

  return (
    <div
      ref={panelRef}
      className="absolute top-12 right-0 bottom-0 w-80 bg-slate-900 border-l border-slate-800 flex flex-col z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.3)]"
      style={{ transform: 'translateX(100%)', opacity: 0 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b border-white/[0.06]">
        <div>
          <div className="font-display font-bold text-white text-base tracking-tight">{point.name}</div>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold">{point.region}</div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M1 1l12 12M13 1L1 13"/>
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Score hero */}
        <div className="p-4 border-b border-white/[0.06]">
          <div className="flex items-end justify-between mb-2">
            <div>
              <div className="text-[10px] font-mono text-white/35 uppercase tracking-widest mb-1">Performance Score</div>
              <div className="text-5xl font-display font-black leading-none" style={{ color: scoreColor }}>
                {point.performance_score}
              </div>
            </div>
            <div
              className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full mb-1"
              style={{ color: scoreColor, backgroundColor: `${scoreColor}18`, border: `1px solid ${scoreColor}30` }}
            >
              {scoreLabel}
            </div>
          </div>
          <ScoreBar value={point.performance_score} />
        </div>

        {/* Status badge */}
        <div className="px-4 py-3 border-b border-white/[0.06]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-white/35 uppercase tracking-widest">Status</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusColor }} />
              <span className="text-xs font-mono uppercase font-semibold" style={{ color: statusColor }}>
                {point.status}
              </span>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="px-4 py-2">
          <MetricRow label="Sales Revenue" value={`₹${(point.sales / 100000).toFixed(2)}L`} accent="#e2e8f0" />
          <MetricRow label="Targets Met" value={`${point.targets_met}%`} accent={point.targets_met >= 70 ? '#10b981' : point.targets_met >= 50 ? '#f59e0b' : '#ef4444'} />
          <MetricRow label="Territory Manager" value={point.manager} />
          <MetricRow label="Last Activity" value={point.last_active} />
          <MetricRow label="Direct Phone" value={point.phone} />
          <MetricRow label="Location ID" value={`#${point.id}`} />
        </div>

        {/* Targets bar */}
        <div className="px-4 pb-4">
          <div className="text-[10px] font-mono text-white/35 uppercase tracking-widest mb-2">Targets Progress</div>
          <div className="relative h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
              style={{
                width: `${point.targets_met}%`,
                backgroundColor: point.targets_met >= 70 ? '#00ff9d' : point.targets_met >= 50 ? '#ffb800' : '#ff4d4d',
              }}
            />
          </div>
          <div className="flex justify-between text-[9px] font-mono text-white/25 mt-1">
            <span>0%</span><span>{point.targets_met}% complete</span><span>100%</span>
          </div>
        </div>

        {/* Sales visualization */}
        <div className="px-4 pb-4 border-t border-white/[0.06] pt-3">
          <div className="flex items-end gap-1 h-12 px-1">
            {Array.from({ length: 12 }, (_, i) => {
              const h = ((point.id * 17 + i * 31) % 80) + 20
              const isLast = i === 11
              return (
                <div key={i} className="flex-1 rounded-sm transition-all duration-300" style={{
                  height: `${h}%`,
                  backgroundColor: isLast ? scoreColor : 'rgba(255,255,255,0.05)',
                  opacity: isLast ? 1 : 0.5
                }} />
              )
            })}
          </div>
          <div className="flex justify-between text-[9px] font-mono text-white/20 mt-1">
            <span>Jan</span><span>Jun</span><span>Dec</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-3 border-t border-white/[0.06] flex gap-2">
        <button className="flex-1 py-2 text-xs font-mono rounded-lg bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20 transition-colors">
          Call
        </button>
        <button className="flex-1 py-2 text-xs font-mono rounded-lg bg-white/5 border border-white/[0.08] text-white/50 hover:text-white/80 hover:bg-white/8 transition-colors">
          Email
        </button>
      </div>
    </div>
  )
}
