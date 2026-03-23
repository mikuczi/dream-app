import { useMemo, useState } from 'react'
import './InsightsScreen.css'
import type { Dream, User } from '../types/dream'
import { getMoonPhase, getDreamInterpretation, getZodiacSymbol } from '../utils/astro'
import { DREAM_SYMBOLS } from '../data/symbols'
import type { DreamSymbol } from '../data/symbols'

interface InsightsScreenProps {
  dreams: Dream[]
  user: User | null
  onConstellation?: () => void
}

const MOOD_SYMBOLS: Record<string, string> = {
  peaceful: '〜',
  joyful: '✦',
  anxious: '⊘',
  scary: '◈',
  strange: '∿',
}

const PLANET_LABELS = ['Moon', 'Mars', 'Saturn']


function getLast7Days(): Date[] {
  const days: Date[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    d.setHours(0, 0, 0, 0)
    days.push(d)
  }
  return days
}

export function InsightsScreen({ dreams, user, onConstellation }: InsightsScreenProps) {
  const sorted = useMemo(
    () => [...dreams].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [dreams]
  )

  const totalDreams = dreams.length
  const lucidDreams = dreams.filter((d) => d.lucid).length
  const avgClarity = dreams.length
    ? Math.round((dreams.reduce((s, d) => s + d.clarity, 0) / dreams.length) * 10) / 10
    : 0

  // Tag frequency
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const dream of dreams) {
      for (const tag of dream.tags) {
        counts[tag] = (counts[tag] ?? 0) + 1
      }
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [dreams])

  const last7Days = getLast7Days()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const mostRecentDream = sorted[0] ?? null
  const interpretations = mostRecentDream ? getDreamInterpretation(mostRecentDream) : []
  const last5Moods = sorted.slice(0, 5)

  // Dictionary state
  const [dictCategory, setDictCategory] = useState<DreamSymbol['category'] | 'all'>('all')
  const [expandedSymbol, setExpandedSymbol] = useState<string | null>(null)

  const CATEGORIES: Array<{ id: DreamSymbol['category'] | 'all'; label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'element', label: 'Elements' },
    { id: 'action', label: 'Actions' },
    { id: 'place', label: 'Places' },
    { id: 'creature', label: 'Creatures' },
    { id: 'object', label: 'Objects' },
    { id: 'emotion', label: 'Emotions' },
  ]

  const filteredSymbols = dictCategory === 'all'
    ? DREAM_SYMBOLS
    : DREAM_SYMBOLS.filter(s => s.category === dictCategory)

  const zodiacSymbol = user ? getZodiacSymbol(user.zodiacSign) : null
  const signName = user ? (user.zodiacSign.charAt(0).toUpperCase() + user.zodiacSign.slice(1)) : null

  return (
    <div className="insights-screen">
      <div className="insights-scroll">
        {/* Natal header */}
        {user && (
          <div className="insights-natal-header">
            <span className="insights-zodiac-symbol">{zodiacSymbol}</span>
            <h2 className="insights-zodiac-name">{signName}</h2>
            <p className="insights-natal-sub">Your natal chart shapes your dream language.</p>
          </div>
        )}

        {!user && (
          <div className="insights-natal-header">
            <span className="insights-zodiac-symbol">✦</span>
            <h2 className="insights-zodiac-name">Dream Insights</h2>
            <p className="insights-natal-sub">Sign in to unlock your natal chart reading.</p>
          </div>
        )}

        {/* Constellation entry */}
        {onConstellation && dreams.length >= 2 && (
          <button className="insights-constellation-btn" onClick={onConstellation}>
            <div className="insights-constellation-preview">
              <svg width="60" height="60" viewBox="0 0 60 60" fill="none" opacity="0.8">
                <circle cx="30" cy="30" r="4" fill="#9B8CFF" opacity="0.7"/>
                <circle cx="12" cy="14" r="2.5" fill="#4ab893" opacity="0.6"/>
                <circle cx="50" cy="12" r="2.5" fill="#f4c97b" opacity="0.6"/>
                <circle cx="48" cy="46" r="2.5" fill="#e05a6b" opacity="0.6"/>
                <circle cx="14" cy="46" r="2.5" fill="#e09060" opacity="0.6"/>
                <line x1="14" y1="15" x2="26" y2="27" stroke="rgba(200,190,255,0.35)" strokeWidth="0.8"/>
                <line x1="48" y1="14" x2="34" y2="27" stroke="rgba(200,190,255,0.35)" strokeWidth="0.8"/>
                <line x1="47" y1="45" x2="34" y2="33" stroke="rgba(200,190,255,0.35)" strokeWidth="0.8"/>
                <line x1="15" y1="45" x2="26" y2="33" stroke="rgba(200,190,255,0.35)" strokeWidth="0.8"/>
              </svg>
            </div>
            <div className="insights-constellation-text">
              <span className="insights-constellation-title">Dream Constellation</span>
              <span className="insights-constellation-sub">{dreams.length} dreams mapped · {dreams.length > 1 ? 'see connections' : ''}</span>
            </div>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="insights-constellation-arrow">
              <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </button>
        )}

        {/* Stats */}
        <div className="insights-section">
          <p className="insights-section-title">This Month</p>
          <div className="insights-stats-row">
            <div className="insights-stat-card">
              <span className="insights-stat-num">{totalDreams}</span>
              <span className="insights-stat-label">Total</span>
            </div>
            <div className="insights-stat-card">
              <span className="insights-stat-num">{lucidDreams}</span>
              <span className="insights-stat-label">Lucid</span>
            </div>
            <div className="insights-stat-card">
              <span className="insights-stat-num">{avgClarity || '—'}</span>
              <span className="insights-stat-label">Avg Clarity</span>
            </div>
          </div>
        </div>

        {/* Moon phase calendar */}
        <div className="insights-section">
          <p className="insights-section-title">Moon this Week</p>
          <div className="insights-moon-row">
            {last7Days.map((day, i) => {
              const phase = getMoonPhase(day)
              const isToday = day.getTime() === today.getTime()
              return (
                <div key={i} className={`insights-moon-day ${isToday ? 'today' : ''}`}>
                  <span className="insights-moon-phase-sym">{phase.symbol}</span>
                  <span className="insights-moon-date">{day.getDate()}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Dream themes */}
        {tagCounts.length > 0 && (
          <div className="insights-section">
            <p className="insights-section-title">Recurring Themes</p>
            <div className="insights-tags-wrap">
              {tagCounts.map(([tag, count]) => (
                <span key={tag} className="insights-tag-chip">
                  {tag} <span className="insights-tag-count">×{count}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* AI Analysis */}
        {mostRecentDream && interpretations.length > 0 && (
          <div className="insights-section">
            <p className="insights-section-title">What the cosmos say</p>
            <p className="insights-analysis-dream-title">From: {mostRecentDream.title}</p>
            <div className="insights-interpretations">
              {interpretations.map((text, i) => (
                <div key={i} className="insights-interp-card">
                  <p className="insights-interp-text">{text}</p>
                  <span className="insights-interp-planet">{PLANET_LABELS[i] ?? 'Venus'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mood trend */}
        {last5Moods.length > 0 && (
          <div className="insights-section">
            <p className="insights-section-title">Mood Trend</p>
            <div className="insights-mood-row">
              {last5Moods.map((dream) => (
                <div key={dream.id} className="insights-mood-item">
                  <span className="insights-mood-sym">{MOOD_SYMBOLS[dream.mood]}</span>
                  <span className="insights-mood-title">
                    {dream.title.length > 10 ? dream.title.slice(0, 10) + '…' : dream.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {dreams.length === 0 && (
          <div className="insights-empty">
            <p className="insights-empty-text">Record your first dream to see insights here.</p>
          </div>
        )}

        {/* Symbol Dictionary */}
        <div className="insights-section">
          <p className="insights-section-title">Dream Dictionary</p>
          <p className="insights-dict-sub">Universal symbols and their meanings</p>

          <div className="insights-dict-filters">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                className={`insights-dict-filter ${dictCategory === cat.id ? 'active' : ''}`}
                onClick={() => setDictCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="insights-dict-list">
            {filteredSymbols.map(sym => {
              const isOpen = expandedSymbol === sym.id
              return (
                <button
                  key={sym.id}
                  className={`insights-dict-card ${isOpen ? 'open' : ''}`}
                  onClick={() => setExpandedSymbol(isOpen ? null : sym.id)}
                >
                  <div className="insights-dict-card-header">
                    <span className="insights-dict-name">{sym.name}</span>
                    <span className="insights-dict-cat">{sym.category}</span>
                    <span className="insights-dict-chevron">{isOpen ? '−' : '+'}</span>
                  </div>
                  <p className="insights-dict-preview">
                    {sym.meaning.split('.')[0]}.
                  </p>
                  {isOpen && (
                    <div className="insights-dict-expanded">
                      <p className="insights-dict-full">{sym.meaning}</p>
                      <div className="insights-dict-jungian">
                        <span className="insights-dict-jungian-label">Jung</span>
                        <p className="insights-dict-jungian-text">{sym.jungian}</p>
                      </div>
                      {sym.relatedTags.length > 0 && (
                        <div className="insights-dict-tags">
                          {sym.relatedTags.map(t => (
                            <span key={t} className="insights-tag-chip">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div className="insights-bottom-pad" />
      </div>
    </div>
  )
}
