import { useState, useMemo } from 'react'
import './MeScreen.css'
import type { Dream, User } from '../types/dream'
import {
  getZodiacSymbol, getZodiacElement, getZodiacDates,
  ZODIAC_DREAM_DESCRIPTIONS, getMoonPhase, getDreamInterpretation,
} from '../utils/astro'
import { DREAM_SYMBOLS } from '../data/symbols'
import type { DreamSymbol } from '../data/symbols'

interface MeScreenProps {
  user: User | null
  dreams: Dream[]
  onSignOut: () => void
  onWhatsApp: () => void
  onSignIn: () => void
  onRecord: () => void
}

const MOOD_SYMBOLS: Record<string, string> = {
  peaceful: '〜', joyful: '✦', anxious: '⊘', scary: '◈', strange: '∿',
}

const PLANET_LABELS = ['Moon', 'Mars', 'Saturn']

function getInitials(name: string) {
  const p = name.trim().split(/\s+/)
  return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase()
}

function calculateStreak(dreams: Dream[]) {
  if (!dreams.length) return 0
  const sorted = [...dreams].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  let streak = 0
  const today = new Date(); today.setHours(0, 0, 0, 0)
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

function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i)); d.setHours(0, 0, 0, 0); return d
  })
}

function Toggle({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button className={`me-toggle ${active ? 'active' : ''}`} onClick={onToggle}
      role="switch" aria-checked={active}>
      <div className="me-toggle-thumb" />
    </button>
  )
}

export function MeScreen({ user, dreams, onSignOut, onWhatsApp, onSignIn, onRecord }: MeScreenProps) {
  const [notifs, setNotifs]       = useState(true)
  const [dictCat, setDictCat]     = useState<DreamSymbol['category'] | 'all'>('all')
  const [expandedSym, setExpSym]  = useState<string | null>(null)

  const sorted = useMemo(() =>
    [...dreams].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [dreams]
  )

  const tagCounts = useMemo(() => {
    const c: Record<string, number> = {}
    dreams.forEach(d => d.tags.forEach(t => { c[t] = (c[t] ?? 0) + 1 }))
    return Object.entries(c).sort((a, b) => b[1] - a[1])
  }, [dreams])

  const lucidCount   = dreams.filter(d => d.lucid).length
  const avgClarity   = dreams.length ? Math.round(dreams.reduce((s, d) => s + d.clarity, 0) / dreams.length * 10) / 10 : 0
  const streak       = calculateStreak(dreams)
  const mostRecent   = sorted[0] ?? null
  const interpretations = mostRecent ? getDreamInterpretation(mostRecent) : []
  const last7        = getLast7Days()
  const todayMidnight = new Date(); todayMidnight.setHours(0, 0, 0, 0)

  const DICT_CATS: Array<{ id: DreamSymbol['category'] | 'all'; label: string }> = [
    { id: 'all', label: 'All' }, { id: 'element', label: 'Elements' },
    { id: 'action', label: 'Actions' }, { id: 'place', label: 'Places' },
    { id: 'creature', label: 'Creatures' }, { id: 'object', label: 'Objects' },
  ]
  const filteredSymbols = dictCat === 'all' ? DREAM_SYMBOLS : DREAM_SYMBOLS.filter(s => s.category === dictCat)

  // ── Guest state ───────────────────────────────────────────────
  if (!user) {
    return (
      <div className="me-screen">
        <div className="me-scroll">
          <div className="me-guest">
            <span className="me-guest-icon">◯</span>
            <h2 className="me-guest-title">Your profile awaits.</h2>
            <p className="me-guest-sub">
              Sign in to save your dreams, unlock your natal chart, and discover your patterns.
            </p>
            <button className="me-signin-btn" onClick={onSignIn}>Sign in</button>
          </div>
          <div style={{ height: 24 }} />
          {/* Show dictionary even for guests */}
          <DictSection
            cats={DICT_CATS} dictCat={dictCat} setDictCat={setDictCat}
            filteredSymbols={filteredSymbols} expandedSym={expandedSym} setExpSym={setExpSym}
          />
        </div>
      </div>
    )
  }

  const zodiacSymbol  = getZodiacSymbol(user.zodiacSign)
  const zodiacElement = getZodiacElement(user.zodiacSign)
  const zodiacDates   = getZodiacDates(user.zodiacSign)
  const signName      = user.zodiacSign.charAt(0).toUpperCase() + user.zodiacSign.slice(1)
  const dreamDesc     = ZODIAC_DREAM_DESCRIPTIONS[user.zodiacSign]

  return (
    <div className="me-screen">
      <div className="me-scroll">

        {/* ── Identity ─────────────────────────────────────── */}
        <div className="me-header">
          <div className="me-avatar">{getInitials(user.name)}</div>
          <h1 className="me-name">{user.name}</h1>
          <p className="me-sign">{zodiacSymbol} {signName}</p>
        </div>

        {/* ── Stats ────────────────────────────────────────── */}
        <div className="me-stats">
          {[
            { n: dreams.length, l: 'Dreams' },
            { n: lucidCount,    l: 'Lucid' },
            { n: streak,        l: 'Streak' },
            { n: avgClarity || '—', l: 'Clarity' },
          ].map((s, i, arr) => (
            <div key={s.l} className="me-stat-wrap">
              <div className="me-stat">
                <span className="me-stat-num">{s.n}</span>
                <span className="me-stat-label">{s.l}</span>
              </div>
              {i < arr.length - 1 && <div className="me-stat-sep" />}
            </div>
          ))}
        </div>

        {/* ── Empty dream CTA ──────────────────────────────── */}
        {dreams.length === 0 && (
          <div className="me-empty-cta">
            <p className="me-empty-text">No dreams recorded yet.</p>
            <button className="me-empty-btn" onClick={onRecord}>Record your first dream</button>
          </div>
        )}

        {/* ── Natal chart ──────────────────────────────────── */}
        <div className="me-section">
          <p className="me-section-title">Natal Chart</p>
          <div className="me-zodiac-card">
            <div className="me-zodiac-row">
              <span className="me-zodiac-sym">{zodiacSymbol}</span>
              <div>
                <p className="me-zodiac-name">{signName}</p>
                <p className="me-zodiac-meta">{zodiacElement} · {zodiacDates}</p>
              </div>
            </div>
            <p className="me-zodiac-desc">{dreamDesc}</p>
          </div>
        </div>

        {/* ── This month stats ─────────────────────────────── */}
        {dreams.length > 0 && (
          <div className="me-section">
            <p className="me-section-title">Moon this Week</p>
            <div className="me-moon-row">
              {last7.map((day, i) => {
                const phase   = getMoonPhase(day)
                const isToday = day.getTime() === todayMidnight.getTime()
                return (
                  <div key={i} className={`me-moon-day ${isToday ? 'today' : ''}`}>
                    <span className="me-moon-sym">{phase.symbol}</span>
                    <span className="me-moon-date">{day.getDate()}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Recurring themes ─────────────────────────────── */}
        {tagCounts.length > 0 && (
          <div className="me-section">
            <p className="me-section-title">Recurring Themes</p>
            <div className="me-tags-row">
              {tagCounts.map(([tag, count]) => (
                <span key={tag} className="me-tag-chip">
                  {tag} <span className="me-tag-count">×{count}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── AI analysis ──────────────────────────────────── */}
        {mostRecent && interpretations.length > 0 && (
          <div className="me-section">
            <p className="me-section-title">What the cosmos say</p>
            <p className="me-analysis-from">From: {mostRecent.title}</p>
            {interpretations.map((text, i) => (
              <div key={i} className="me-interp-card">
                <p className="me-interp-text">{text}</p>
                <span className="me-interp-label">{PLANET_LABELS[i] ?? 'Venus'}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── Mood trend ───────────────────────────────────── */}
        {sorted.length > 0 && (
          <div className="me-section">
            <p className="me-section-title">Mood Trend</p>
            <div className="me-mood-row">
              {sorted.slice(0, 5).map(d => (
                <div key={d.id} className="me-mood-item">
                  <span className="me-mood-sym">{MOOD_SYMBOLS[d.mood]}</span>
                  <span className="me-mood-title">
                    {d.title.length > 9 ? d.title.slice(0, 9) + '…' : d.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Dream dictionary ─────────────────────────────── */}
        <DictSection
          cats={DICT_CATS} dictCat={dictCat} setDictCat={setDictCat}
          filteredSymbols={filteredSymbols} expandedSym={expandedSym} setExpSym={setExpSym}
        />

        {/* ── Preferences ──────────────────────────────────── */}
        <div className="me-section">
          <p className="me-section-title">Preferences</p>
          <div className="me-rows">
            <div className="me-row">
              <span className="me-row-label">Notifications</span>
              <Toggle active={notifs} onToggle={() => setNotifs(v => !v)} />
            </div>
            <div className="me-row-sep" />
            <button className="me-row me-row-btn" onClick={onWhatsApp}>
              <span className="me-row-label">WhatsApp Integration</span>
              <span className="me-row-chevron">›</span>
            </button>
            <div className="me-row-sep" />
            <button className="me-row me-row-btn me-row-destructive" onClick={onSignOut}>
              <span className="me-row-label">Sign out</span>
            </button>
          </div>
        </div>

        <div style={{ height: 40 }} />
      </div>
    </div>
  )
}

// ── Extracted to avoid repetition ──────────────────────────
function DictSection({ cats, dictCat, setDictCat, filteredSymbols, expandedSym, setExpSym }: {
  cats: Array<{ id: DreamSymbol['category'] | 'all'; label: string }>
  dictCat: DreamSymbol['category'] | 'all'
  setDictCat: (c: DreamSymbol['category'] | 'all') => void
  filteredSymbols: DreamSymbol[]
  expandedSym: string | null
  setExpSym: (id: string | null) => void
}) {
  return (
    <div className="me-section">
      <p className="me-section-title">Dream Dictionary</p>
      <p className="me-dict-sub">Universal symbols and their meanings</p>
      <div className="me-dict-filters">
        {cats.map(c => (
          <button key={c.id}
            className={`me-dict-filter ${dictCat === c.id ? 'active' : ''}`}
            onClick={() => setDictCat(c.id)}>
            {c.label}
          </button>
        ))}
      </div>
      <div className="me-dict-list">
        {filteredSymbols.map(sym => {
          const open = expandedSym === sym.id
          return (
            <button key={sym.id}
              className={`me-dict-card ${open ? 'open' : ''}`}
              onClick={() => setExpSym(open ? null : sym.id)}>
              <div className="me-dict-row">
                <span className="me-dict-name">{sym.name}</span>
                <span className="me-dict-cat">{sym.category}</span>
                <span className="me-dict-toggle">{open ? '−' : '+'}</span>
              </div>
              <p className="me-dict-preview">{sym.meaning.split('.')[0]}.</p>
              {open && (
                <div className="me-dict-expanded">
                  <p className="me-dict-full">{sym.meaning}</p>
                  <div className="me-dict-jung">
                    <span className="me-dict-jung-label">Jung</span>
                    <p className="me-dict-jung-text">{sym.jungian}</p>
                  </div>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
