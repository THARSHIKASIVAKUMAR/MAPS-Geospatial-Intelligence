import { useState } from 'react'

export default function TokenGate({ onToken, initialError = '' }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState(initialError)
  const [testing, setTesting] = useState(false)

  const handleSubmit = async () => {
    const token = value.trim()
    if (token.length < 8) {
      setError('Token seems too short — please provide a valid API key.')
      return
    }
    setTesting(true)
    setError('')
    try {
      // Validate token by hitting the Mapbox Styles API
      const res = await fetch(
        `https://api.mapbox.com/styles/v1/mapbox/dark-v11?access_token=${token}`
      )
      if (!res.ok) throw new Error('Invalid token')
      sessionStorage.setItem('mapbox_token', token)
      onToken(token)
    } catch {
      setError('Token rejected by Mapbox. Double-check it and try again.')
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="h-screen w-screen bg-ink-950 flex items-center justify-center p-6">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,229,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,1) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="mb-10 text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 mb-5 shadow-inner">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <h1 className="font-display text-3xl font-extrabold text-white tracking-tight uppercase">MAPS</h1>
          <p className="text-sm text-slate-500 mt-2 font-medium tracking-wide">Enterprise Territory Intelligence Suite</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl shadow-black/50 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="mb-6">
            <h2 className="font-display text-lg font-bold text-white mb-2">Authentication Required</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Please enter your Mapbox access token to initialize the geospatial intelligence dashboard.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-mono text-white/40 uppercase tracking-widest mb-2">
                Public Token (pk.*)
              </label>
              <input
                type="text"
                value={value}
                onChange={e => { setValue(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="pk.eyJ1Ijo..."
                className="w-full bg-ink-800 border border-white/[0.1] rounded-lg px-3 py-3 text-sm font-mono text-white/80 placeholder-white/20 focus:outline-none focus:border-accent/60 transition-colors"
                autoFocus
              />
            </div>

            {error && (
              <div className="text-xs text-coral bg-coral/10 border border-coral/20 rounded-lg px-3 py-2.5">
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={!value.trim() || testing}
              className="w-full py-3.5 rounded-xl font-display font-bold text-sm transition-all duration-200
                disabled:opacity-20 disabled:cursor-not-allowed
                bg-blue-600 text-white hover:bg-blue-500 active:scale-[0.98] shadow-lg shadow-blue-900/20"
            >
              {testing ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  INITIALIZING...
                </span>
              ) : 'INITIALIZE DASHBOARD'}
            </button>
          </div>

          <div className="mt-5 pt-5 border-t border-white/[0.06]">
            <p className="text-xs text-white/30 text-center">
              Don't have a token?{' '}
              <a
                href="https://account.mapbox.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:text-accent-dim underline underline-offset-2"
              >
                Get one free at mapbox.com
              </a>
            </p>
            <p className="text-[10px] text-white/20 text-center mt-2 font-mono">
              Token is stored in sessionStorage only — never sent anywhere
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
