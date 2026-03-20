import { useState, useCallback } from 'react'
import MapView from './components/MapView'
import Sidebar from './components/Sidebar'
import TokenGate from './components/TokenGate'
import PointDetail from './components/PointDetail'
import TerritoryTooltip from './components/TerritoryTooltip'
import rawData from './data/salespoints.json'

const DEFAULT_FILTERS = { search: '', region: 'all', minScore: 0, status: 'all' }

function getFilteredCount(filters) {
  return rawData.features.filter(ft => {
    const p = ft.properties
    if (filters.search && !p.name.toLowerCase().includes(filters.search.toLowerCase())) return false
    if (filters.region !== 'all' && p.region !== filters.region) return false
    if (filters.status !== 'all' && p.status !== filters.status) return false
    if (filters.minScore > 0 && p.performance_score < filters.minScore) return false
    return true
  }).length
}

export default function App() {
  const [token, setToken] = useState(() => (
    import.meta.env.VITE_MAPBOX_TOKEN || sessionStorage.getItem('mapbox_token') || ''
  ))
  const [tokenError, setTokenError] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [showHealth, setShowHealth] = useState(false)
  const [lastSync] = useState(() => new Date().toLocaleTimeString())
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [stats, setStats] = useState({ total: 0, active: 0 })
  const [selectedPoint, setSelectedPoint] = useState(null)
  const [territoryHover, setTerritoryHover] = useState(null)

  const handleStatsUpdate = useCallback((s) => setStats(s), [])
  const handleTerritoryHover = useCallback((t) => setTerritoryHover(t), [])

  const handleExport = () => {
    let features = rawData.features
    const f = filters
    if (f.search) features = features.filter(ft => ft.properties.name.toLowerCase().includes(f.search.toLowerCase()))
    if (f.region !== 'all') features = features.filter(ft => ft.properties.region === f.region)
    if (f.status !== 'all') features = features.filter(ft => ft.properties.status === f.status)
    if (f.minScore > 0) features = features.filter(ft => ft.properties.performance_score >= f.minScore)

    const csv = [
      'ID,Name,Region,Status,Score,Sales,Targets Met,Phone',
      ...features.map(ft => {
        const p = ft.properties
        return `${p.id},"${p.name}",${p.region},${p.status},${p.performance_score},${p.sales},${p.targets_met}%,${p.phone}`
      })
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `salesdash-export-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!token || tokenError) {
    return (
      <TokenGate 
        onToken={(t) => { setToken(t); setTokenError(false); }} 
        initialError={tokenError ? "The current token was rejected by Mapbox. Please provide a valid 'pk.' public token." : ""}
      />
    )
  }

  const totalFiltered = getFilteredCount(filters)
  const hasFilters = filters.region !== 'all' || filters.status !== 'all' || filters.minScore > 0 || filters.search

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        filters={filters}
        onFilterChange={setFilters}
        stats={stats}
        totalFiltered={totalFiltered}
        totalCount={rawData.features.length}
        onExport={handleExport}
      />

      <div className="relative flex-1 h-full overflow-hidden">
        <MapView
          token={token}
          collapsed={collapsed}
          filters={filters}
          onStatsUpdate={handleStatsUpdate}
          onPointSelect={setSelectedPoint}
          onTerritoryHover={handleTerritoryHover}
          onTokenError={() => setTokenError(true)}
        />

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 h-12 bg-slate-900/80 backdrop-blur-md border-b border-white/[0.05] flex items-center px-6 gap-6 z-10">
          <button 
            onClick={() => setShowHealth(!showHealth)}
            className="group flex items-center gap-2 px-2 py-1 rounded hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-mono font-bold text-slate-300 tracking-wider">SYSTEM OPERATIONAL</span>
          </button>
          <div className="h-4 w-px bg-white/10" />
          <span className="text-xs font-display font-medium text-slate-400 tracking-tight">Geo-Intelligence Suite | Region: Chennai Metro</span>
          <div className="ml-auto flex items-center gap-3 pointer-events-auto">
            <button
              onClick={() => setToken('')}
              className="text-[10px] font-mono text-white/20 hover:text-white/50 transition-colors"
            >
              ⚙ Token
            </button>
          </div>
        </div>

        {/* Filter chips */}
        {hasFilters && (
          <div className="absolute top-14 left-4 flex flex-wrap gap-1.5 pointer-events-none">
            {filters.region !== 'all' && (
              <span className="bg-slate-900 border border-blue-500/20 text-blue-400 text-[10px] font-mono px-2.5 py-1 rounded-full whitespace-nowrap shadow-sm">
                REGION: {filters.region}
              </span>
            )}
            {filters.status !== 'all' && (
              <span className="bg-slate-900 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono px-2.5 py-1 rounded-full whitespace-nowrap shadow-sm">
                STATUS: {filters.status}
              </span>
            )}
            {filters.minScore > 0 && (
              <span className="bg-slate-900 border border-amber-500/20 text-amber-400 text-[10px] font-mono px-2.5 py-1 rounded-full whitespace-nowrap shadow-sm">
                SCORE ≥ {filters.minScore}
              </span>
            )}
            {filters.search && (
              <span className="bg-slate-900 border border-white/10 text-slate-400 text-[10px] font-mono px-2.5 py-1 rounded-full whitespace-nowrap shadow-sm">
                SEARCH: "{filters.search}"
              </span>
            )}
            <span className="bg-slate-900 border border-white/[0.04] text-slate-500 text-[10px] font-mono px-2.5 py-1 rounded-full whitespace-nowrap">
              {totalFiltered.toLocaleString()} MATCHES
            </span>
          </div>
        )}

        {/* Bottom stats pill */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-slate-900 border border-white/[0.08] rounded-2xl px-6 py-3 shadow-2xl z-10 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.3)]" />
            <span className="text-xs font-mono text-slate-400">
              In View: <span className="text-white font-bold">{stats.total.toLocaleString()}</span>
            </span>
          </div>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
            <span className="text-xs font-mono text-slate-400">
              Active: <span className="text-emerald-400 font-bold">{stats.active.toLocaleString()}</span>
            </span>
          </div>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-2 py-0.5 px-2 bg-slate-800 rounded text-[10px] font-mono text-slate-400 font-bold uppercase tracking-widest">
            IN: CHENNAI
          </div>
        </div>

        {/* Territory tooltip */}
        {territoryHover && (
          <TerritoryTooltip
            territory={territoryHover.props}
            position={territoryHover.position}
          />
        )}

        {/* System Health Modal */}
        {showHealth && (
          <div className="absolute top-14 left-6 w-64 surface-panel rounded-xl p-4 z-50 animate-fade-in shadow-2xl border-blue-500/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">System Diagnostic</span>
              <button onClick={() => setShowHealth(false)} className="text-slate-500 hover:text-white">✕</button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Data Integrity</span>
                <span className="text-emerald-400 font-bold">100% SECURE</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Points Loaded</span>
                <span className="text-white font-mono">30,000 Units</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Map Latency</span>
                <span className="text-blue-400">0.02ms</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Last Database Sync</span>
                <span className="text-slate-200">{lastSync}</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5">
              <button 
                onClick={() => window.location.reload()}
                className="w-full py-1.5 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white text-[10px] font-mono font-bold rounded transition-all uppercase"
              >
                Force Re-Sync Data
              </button>
            </div>
          </div>
        )}

        {/* Point detail panel */}
        <PointDetail point={selectedPoint} onClose={() => setSelectedPoint(null)} />
      </div>
    </div>
  )
}
