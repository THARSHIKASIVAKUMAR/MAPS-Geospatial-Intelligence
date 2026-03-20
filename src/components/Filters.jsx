export default function Filters({ filters, onChange }) {
  const regions = ['all', 'North Chennai', 'South Chennai', 'Central', 'East Chennai', 'West Chennai']
  const statuses = ['all', 'active', 'inactive', 'pending']

  const update = (key, value) => onChange({ ...filters, [key]: value })

  return (
    <div className="space-y-6">
      {/* Region Section */}
      <div>
        <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-3 font-bold">
          Market Region
        </label>
        <div className="grid grid-cols-2 gap-2">
          {regions.map(r => (
            <button
              key={r}
              onClick={() => update('region', r)}
              className={`px-3 py-2 rounded-lg text-[11px] font-medium transition-all border ${
                filters.region === r
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/20'
                  : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800 hover:border-slate-600'
              }`}
            >
              {r === 'all' ? 'Universal' : r.replace(' Chennai', '')}
            </button>
          ))}
        </div>
      </div>

      {/* Status Section */}
      <div>
        <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-3 font-bold">
          Operational Status
        </label>
        <div className="flex flex-wrap gap-2">
          {statuses.map(s => {
            const isActive = filters.status === s
            return (
              <button
                key={s}
                onClick={() => update('status', s)}
                className={`flex-1 py-2 rounded-lg text-[11px] font-medium transition-all capitalize border ${
                  isActive
                    ? 'bg-slate-100 border-white text-slate-900 font-bold'
                    : 'bg-slate-800/50 border-slate-700/50 text-slate-500 hover:text-slate-300'
                }`}
              >
                {s}
              </button>
            )
          })}
        </div>
      </div>

      {/* Performance Score */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">
            Performance Threshold
          </label>
          <span className="text-xs font-mono text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded">{filters.minScore}%</span>
        </div>
        <div className="relative group">
          <input
            type="range"
            min="0"
            max="90"
            value={filters.minScore}
            onChange={e => update('minScore', Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-slate-800 accent-blue-500"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${filters.minScore}%, #1e293b ${filters.minScore}%, #1e293b 100%)`
            }}
          />
        </div>
        <div className="flex justify-between text-[9px] font-mono text-slate-600 mt-2 font-bold uppercase tracking-tighter">
          <span>Min Alpha</span><span>Mid Grade</span><span>Target Max</span>
        </div>
      </div>

      {/* Reset Logic */}
      {(filters.region !== 'all' || filters.status !== 'all' || filters.minScore > 0 || filters.search) && (
        <button
          onClick={() => onChange({ search: '', region: 'all', minScore: 0, status: 'all' })}
          className="w-full py-2.5 text-[10px] font-mono font-bold text-red-400/70 hover:text-red-400 hover:bg-red-400/5 transition-all border border-red-400/20 hover:border-red-400/40 rounded-lg uppercase tracking-widest"
        >
          ✕ Clear Parameters
        </button>
      )}
    </div>
  )
}
