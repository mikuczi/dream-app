import './MyCharactersScreen.css'
import type { Dream } from '../types/dream'

interface Props { dreams: Dream[] }

// Broad list — anything that sounds like a living being
const BEING_KEYWORDS = [
  'mother', 'father', 'sister', 'brother', 'friend', 'stranger', 'man', 'woman',
  'child', 'baby', 'teacher', 'doctor', 'guide', 'family', 'people', 'person',
  'boy', 'girl', 'old', 'young', 'crowd', 'figure', 'shadow', 'voice',
  'dog', 'cat', 'bird', 'snake', 'wolf', 'horse', 'bear', 'lion', 'deer',
  'fish', 'spider', 'animal', 'creature', 'monster', 'ghost', 'spirit',
]

function isBeing(tag: string): boolean {
  const lower = tag.toLowerCase()
  return BEING_KEYWORDS.some(k => lower.includes(k))
}

export function MyCharactersScreen({ dreams }: Props) {
  // Count all tags across dreams
  const allCounts: Record<string, number> = {}
  dreams.forEach(d => d.tags.forEach(t => { allCounts[t] = (allCounts[t] ?? 0) + 1 }))

  // Prefer being-like tags; fall back to all tags if none match
  const beingEntries = Object.entries(allCounts)
    .filter(([tag]) => isBeing(tag))
    .sort((a, b) => b[1] - a[1])

  const allEntries = Object.entries(allCounts).sort((a, b) => b[1] - a[1])
  const sorted = beingEntries.length > 0 ? beingEntries : allEntries
  const usingFallback = beingEntries.length === 0 && allEntries.length > 0

  return (
    <div className="chars-screen">
      <div className="chars-topbar">
        <h1 className="chars-title">My Characters</h1>
        <p className="chars-sub">
          {sorted.length > 0
            ? `${sorted.length} recurring figure${sorted.length !== 1 ? 's' : ''}`
            : 'No characters yet'}
        </p>
      </div>

      <div className="chars-scroll">
        {usingFallback && (
          <p className="chars-tip">
            Tag people, animals, and beings by name (e.g. "Mom", "Stranger", "Black Cat") to track characters here.
          </p>
        )}

        {sorted.length === 0 ? (
          <div className="chars-empty">
            <p className="chars-empty-text">
              Tag people, animals, and figures in your dreams to track recurring characters here.
            </p>
          </div>
        ) : (
          sorted.map(([name, count], i) => (
            <div key={name} className="char-row">
              <div className="char-avatar">{name.slice(0, 2).toUpperCase()}</div>
              <div className="char-info">
                <span className="char-name">{name}</span>
                <span className="char-count">Appeared in {count} dream{count !== 1 ? 's' : ''}</span>
              </div>
              <span className="char-rank">#{i + 1}</span>
            </div>
          ))
        )}
        <div style={{ height: 80 }} />
      </div>
    </div>
  )
}
