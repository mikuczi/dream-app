import { useMemo } from 'react'
import './DashboardScreen.css'
import type { Dream } from '../types/dream'

interface DashboardScreenProps { dreams: Dream[] }

function calculateStreak(dreams: Dream[]) {
  if (!dreams.length) return 0
  const sorted = [...dreams].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  const today = new Date(); today.setHours(0, 0, 0, 0)
  let streak = 0
  for (let i = 0; i <= 365; i++) {
    const d = new Date(today); d.setDate(today.getDate() - i)
    const has = sorted.some(dr => {
      const t = new Date(dr.createdAt).getTime()
      return t >= d.getTime() && t < d.getTime() + 86400000
    })
    if (has) streak++; else break
  }
  return streak
}

export function DashboardScreen({ dreams }: DashboardScreenProps) {
  const streak = calculateStreak(dreams)
  const lucid  = dreams.filter(d => d.lucid).length

  const moodCounts = useMemo(() => {
    const c: Record<string, number> = {}
    dreams.forEach(d => { c[d.mood] = (c[d.mood] ?? 0) + 1 })
    return Object.entries(c).sort((a, b) => b[1] - a[1])
  }, [dreams])

  const tagCounts = useMemo(() => {
    const c: Record<string, number> = {}
    dreams.forEach(d => d.tags.forEach(t => { c[t] = (c[t] ?? 0) + 1 }))
    return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 8)
  }, [dreams])

  // Last 28 days grid
  const dayGrid = useMemo(() => {
    return Array.from({ length: 28 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (27 - i)); d.setHours(0,0,0,0)
      const count = dreams.filter(dr => {
        const t = new Date(dr.createdAt); t.setHours(0,0,0,0)
        return t.getTime() === d.getTime()
      }).length
      return { date: d, count }
    })
  }, [dreams])

  return (
    <div className="dash-screen">
      <div className="dash-topbar">
        <h1 className="dash-title">Dashboard</h1>
      </div>

      <div className="dash-scroll">
        {/* Key stats */}
        <div className="dash-stats-grid">
          {[
            { val: dreams.length, label: 'Total dreams'  },
            { val: streak,        label: 'Day streak'    },
            { val: lucid,         label: 'Lucid dreams'  },
            { val: tagCounts.length, label: 'Symbols'    },
          ].map(s => (
            <div key={s.label} className="dash-stat-card">
              <span className="dash-stat-val">{s.val}</span>
              <span className="dash-stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Activity grid */}
        <div className="dash-section">
          <p className="dash-section-label">LAST 28 DAYS</p>
          <div className="dash-activity-grid">
            {dayGrid.map((day, i) => (
              <div
                key={i}
                className="dash-day-cell"
                style={{ opacity: day.count > 0 ? Math.min(0.3 + day.count * 0.4, 1) : 0.08 }}
                title={day.date.toLocaleDateString()}
              />
            ))}
          </div>
        </div>

        {/* Moods */}
        {moodCounts.length > 0 && (
          <div className="dash-section">
            <p className="dash-section-label">MOODS</p>
            <div className="dash-mood-list">
              {moodCounts.map(([mood, count]) => (
                <div key={mood} className="dash-mood-row">
                  <span className="dash-mood-name">{mood}</span>
                  <div className="dash-mood-bar-wrap">
                    <div className="dash-mood-bar" style={{ width: `${(count / dreams.length) * 100}%` }} />
                  </div>
                  <span className="dash-mood-count">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top symbols */}
        {tagCounts.length > 0 && (
          <div className="dash-section">
            <p className="dash-section-label">TOP SYMBOLS</p>
            <div className="dash-tag-chips">
              {tagCounts.map(([tag, count]) => (
                <span key={tag} className="dash-tag-chip">
                  {tag} <span className="dash-tag-num">{count}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {dreams.length === 0 && (
          <div className="dash-empty">
            <p className="dash-empty-text">Start recording dreams to see your dashboard.</p>
          </div>
        )}

        <div style={{ height: 80 }} />
      </div>
    </div>
  )
}
