import './DreamerDigestScreen.css'
import type { Dream } from '../types/dream'

interface Props { dreams: Dream[] }

const TIPS = [
  'Keep a glass of water by your bed — hydration helps dream recall.',
  'Set an intention before sleep: "I will remember my dreams."',
  'Stay still when you wake. Movement erases dream memories.',
  'Dreams are most vivid in the last 90 minutes of sleep.',
]

export function DreamerDigestScreen({ dreams }: Props) {
  const week = dreams.filter(d => {
    const t = new Date(d.createdAt).getTime()
    return t > Date.now() - 7 * 86400000
  })

  const tagCounts: Record<string, number> = {}
  week.forEach(d => d.tags.forEach(t => { tagCounts[t] = (tagCounts[t] ?? 0) + 1 }))
  const topTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)

  const moodCounts: Record<string, number> = {}
  week.forEach(d => { moodCounts[d.mood] = (moodCounts[d.mood] ?? 0) + 1 })
  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]

  const tip = TIPS[new Date().getDay() % TIPS.length]

  return (
    <div className="digest-screen">
      <div className="digest-topbar">
        <h1 className="digest-title">Dreamer's Digest</h1>
        <p className="digest-sub">Your weekly dream summary</p>
      </div>

      <div className="digest-scroll">
        <div className="digest-week-card">
          <p className="digest-card-label">THIS WEEK</p>
          <div className="digest-week-stats">
            <div className="digest-stat">
              <span className="digest-stat-val">{week.length}</span>
              <span className="digest-stat-label">Dreams</span>
            </div>
            {topMood && (
              <div className="digest-stat">
                <span className="digest-stat-val">{topMood[0]}</span>
                <span className="digest-stat-label">Top Mood</span>
              </div>
            )}
            <div className="digest-stat">
              <span className="digest-stat-val">{week.filter(d => d.lucid).length}</span>
              <span className="digest-stat-label">Lucid</span>
            </div>
          </div>
        </div>

        {topTags.length > 0 && (
          <div className="digest-section">
            <p className="digest-section-label">TRENDING SYMBOLS</p>
            <div className="digest-tag-chips">
              {topTags.map(([tag, count]) => (
                <span key={tag} className="digest-tag-chip">
                  {tag} <span className="digest-tag-count">×{count}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {week.length > 0 && (
          <div className="digest-section">
            <p className="digest-section-label">RECENT DREAMS</p>
            {week.slice(0, 3).map(d => (
              <div key={d.id} className="digest-dream-row">
                <span className="digest-dream-title">{d.title}</span>
                <span className="digest-dream-date">
                  {new Date(d.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="digest-tip-card">
          <p className="digest-tip-label">DREAM TIP</p>
          <p className="digest-tip-text">{tip}</p>
        </div>

        {dreams.length === 0 && (
          <div className="digest-empty">
            <p className="digest-empty-text">Record your first dream to see your weekly digest.</p>
          </div>
        )}

        <div style={{ height: 80 }} />
      </div>
    </div>
  )
}
