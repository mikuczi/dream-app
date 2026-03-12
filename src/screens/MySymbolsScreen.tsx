import './MySymbolsScreen.css'
import type { Dream } from '../types/dream'

interface MySymbolsScreenProps { dreams: Dream[] }

export function MySymbolsScreen({ dreams }: MySymbolsScreenProps) {
  const counts: Record<string, number> = {}
  dreams.forEach(d => d.tags.forEach(t => { counts[t] = (counts[t] ?? 0) + 1 }))
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])

  return (
    <div className="symbols-screen">
      <div className="symbols-topbar">
        <h1 className="symbols-title">My Symbols</h1>
        <p className="symbols-sub">{sorted.length} symbols across {dreams.length} dreams</p>
      </div>

      <div className="symbols-scroll">
        {sorted.length === 0 ? (
          <div className="symbols-empty">
            <p className="symbols-empty-text">No symbols yet. Tag your dreams to track recurring themes.</p>
          </div>
        ) : (
          sorted.map(([tag, count], i) => (
            <div key={tag} className="symbol-row">
              <span className="symbol-rank">{i + 1}</span>
              <div className="symbol-info">
                <span className="symbol-name">{tag}</span>
                <div className="symbol-bar-wrap">
                  <div
                    className="symbol-bar"
                    style={{ width: `${Math.min((count / sorted[0][1]) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <span className="symbol-count">{count}</span>
            </div>
          ))
        )}
        <div style={{ height: 80 }} />
      </div>
    </div>
  )
}
