import { useState } from 'react'
import Filters from './Filters'

const LEGEND = [
  { color: '#00ff9d', label: 'High (70–100)' },
  { color: '#ffb800', label: 'Medium (40–69)' },
  { color: '#ff4d4d', label: 'Low (0–39)' },
]

const TERRITORIES = [
  { name: 'North', color: '#00e5ff' },
  { name: 'Central', color: '#00ff9d' },
  { name: 'South', color: '#ffb800' },
  { name: 'East', color: '#ff4d4d' },
  { name: 'West', color: '#bf7aff' },
]

function StatCard({ label, value, sub, accent }) {
  return (
    <div className="surface-card rounded-lg p-3.5 border border-white/5 shadow-sm">
      <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1.5 font-medium">{label}</div>
      <div className="text-2xl font-display font-bold text-slate-100" style={{ color: accent || '#fff' }}>
        {value}
      </div>
      {sub && <div className="text-[10px] font-mono text-slate-500 mt-1">{sub}</div>}
    </div>
  )
}

export default function Sidebar({ collapsed, setCollapsed, filters, onFilterChange, stats, totalFiltered, totalCount, onExport }) {

  const activeRate = stats.total > 0
    ? Math.round((stats.active / stats.total) * 100)
    : 0

  return (
    <div
      className={`relative flex flex-col h-full border-r border-slate-800 bg-slate-900 shadow-xl transition-all duration-300 ease-in-out ${collapsed ? 'w-16' : 'w-72'}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/[0.06]">
        {!collapsed && (
          <div>
            <div className="font-display text-base font-bold text-white tracking-tight uppercase">MAPS</div>
            <div className="text-[10px] font-mono text-slate-500 mt-0.5 tracking-wider font-semibold">TERRITORY INTEL</div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/80 transition-all duration-300 active:scale-90 ml-auto"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            {collapsed
              ? <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              : <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            }
          </svg>
        </button>
      </div>

      {!collapsed && (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">

          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search by name..."
              value={filters.search}
              onChange={e => onFilterChange({ ...filters, search: e.target.value })}
              className="w-full bg-ink-700 border border-white/[0.08] rounded-lg pl-9 pr-3 py-2.5 text-sm text-white/80 placeholder-white/25 focus:outline-none focus:border-accent/50 transition-colors"
            />
          </div>

          {/* Stats */}
          <div>
            <div className="text-[10px] font-mono text-white/35 uppercase tracking-widest mb-2">Overview</div>
            <div className="grid grid-cols-2 gap-2">
               <StatCard label="Matched" value={totalFiltered.toLocaleString()} sub={`of ${totalCount.toLocaleString()} total`} />
              <StatCard label="Active" value={stats.active.toLocaleString()} accent="#00ff9d" sub={`${activeRate}% rate`} />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/[0.06]" />

          {/* Filters */}
          <div>
            <div className="text-[10px] font-mono text-white/35 uppercase tracking-widest mb-3">Filters</div>
            <Filters filters={filters} onChange={onFilterChange} />
          </div>

          {/* Divider */}
          <div className="border-t border-white/[0.06]" />

          {/* Legend */}
          <div>
            <div className="text-[10px] font-mono text-white/35 uppercase tracking-widest mb-3">Performance Score</div>
            <div className="space-y-2">
              {LEGEND.map(({ color, label }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}50` }} />
                  <span className="text-xs text-white/50">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/[0.06]" />

          {/* Territories */}
          <div>
            <div className="text-[10px] font-mono text-white/35 uppercase tracking-widest mb-3">Territories</div>
            <div className="space-y-1.5">
              {TERRITORIES.map(({ name, color }) => (
                <div key={name} className="flex items-center gap-2.5 py-1">
                  <div className="w-3 h-px flex-shrink-0 opacity-80" style={{ borderTop: `2px dashed ${color}` }} />
                  <span className="text-xs" style={{ color }}>{name} Chennai</span>
                </div>
              ))}
            </div>
          </div>

          {/* Export */}
          <div className="border-t border-white/[0.06]" />
          <div>
            <button
              onClick={onExport}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-mono font-bold text-slate-300 hover:text-white border border-slate-700 hover:border-blue-500 hover:bg-blue-500/10 transition-all duration-150 active:scale-[0.98]"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              EXPORT REPORT
            </button>
          </div>

          {/* Footer */}
          <div className="pt-2 pb-1">
            <div className="text-[10px] font-mono text-white/20 text-center">
              {totalCount.toLocaleString()} data points · Chennai Metro
            </div>
          </div>
        </div>
      )}

      {/* Collapsed icons */}
      {collapsed && (
        <div className="flex-1 flex flex-col items-center gap-4 pt-4">
          {['🔍', '⚡', '🗺️', '📊'].map((icon, i) => (
            <div key={i} className="text-base opacity-30" title="">{icon}</div>
          ))}
        </div>
      )}
    </div>
  )
}
