import './MyPlacesScreen.css'
import type { Dream } from '../types/dream'

interface Props { dreams: Dream[] }

const PLACE_KEYWORDS = [
  'house', 'home', 'room', 'door', 'hallway', 'corridor', 'building', 'apartment',
  'school', 'classroom', 'office', 'library', 'hospital', 'church', 'temple', 'market',
  'forest', 'garden', 'park', 'field', 'mountain', 'hill', 'cave', 'tunnel',
  'ocean', 'sea', 'river', 'lake', 'beach', 'shore', 'island', 'water',
  'city', 'town', 'village', 'street', 'road', 'bridge', 'alley', 'path',
  'airport', 'train', 'station', 'hotel', 'restaurant', 'store', 'shop',
  'castle', 'palace', 'tower', 'ruin', 'barn', 'basement', 'attic', 'rooftop',
  'space', 'sky', 'desert', 'jungle', 'valley', 'cliff', 'underground',
]

function isPlace(tag: string): boolean {
  const lower = tag.toLowerCase()
  return PLACE_KEYWORDS.some(k => lower.includes(k))
}

export function MyPlacesScreen({ dreams }: Props) {
  const allCounts: Record<string, number> = {}
  dreams.forEach(d => d.tags.forEach(t => { allCounts[t] = (allCounts[t] ?? 0) + 1 }))

  const placeEntries = Object.entries(allCounts)
    .filter(([tag]) => isPlace(tag))
    .sort((a, b) => b[1] - a[1])

  const allEntries = Object.entries(allCounts).sort((a, b) => b[1] - a[1])
  const sorted = placeEntries.length > 0 ? placeEntries : allEntries
  const usingFallback = placeEntries.length === 0 && allEntries.length > 0

  const maxCount = sorted[0]?.[1] ?? 1

  return (
    <div className="places-screen">
      <div className="places-topbar">
        <h1 className="places-title">My Places</h1>
        <p className="places-sub">
          {sorted.length > 0
            ? `${sorted.length} recurring location${sorted.length !== 1 ? 's' : ''}`
            : 'No places yet'}
        </p>
      </div>

      <div className="places-scroll">
        {usingFallback && (
          <p className="places-tip">
            Tag locations in your dreams (e.g. "Forest", "Old House", "School") to map your inner landscape.
          </p>
        )}

        {sorted.length === 0 ? (
          <div className="places-empty">
            <p className="places-empty-text">Tag locations in your dreams to map your inner landscape.</p>
          </div>
        ) : (
          sorted.map(([place, count]) => (
            <div key={place} className="place-row">
              <div className="place-icon">◌</div>
              <div className="place-info">
                <span className="place-name">{place}</span>
                <span className="place-count">{count} dream{count !== 1 ? 's' : ''}</span>
              </div>
              <div className="place-bar-wrap">
                <div className="place-bar" style={{ width: `${Math.min((count / maxCount) * 100, 100)}%` }} />
              </div>
            </div>
          ))
        )}
        <div style={{ height: 80 }} />
      </div>
    </div>
  )
}
