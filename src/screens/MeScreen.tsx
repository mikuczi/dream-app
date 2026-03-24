import { useMemo } from 'react'
import './MeScreen.css'
import type { Dream, User } from '../types/dream'
import { getZodiacSymbol, getZodiacElement, ZODIAC_DREAM_DESCRIPTIONS } from '../utils/astro'
import { BADGES, getEarnedBadgeIds, type BadgeFlags } from '../data/badges'

interface MeScreenProps {
  user: User | null
  dreams: Dream[]
  onSignOut: () => void
  onWhatsApp: () => void
  onSignIn: () => void
  onRecord: () => void
  onSettings?: () => void
  onPaywall?: () => void
  badgeFlags?: BadgeFlags
  todayRecordings?: number
  dailyLimit?: number
}

function exportDreams(dreams: Dream[], userName?: string) {
  const data = {
    exportedAt: new Date().toISOString(),
    user: userName ?? 'Dreamer',
    totalDreams: dreams.length,
    dreams: dreams.map(d => ({
      date: d.createdAt,
      title: d.title,
      transcript: d.transcript,
      mood: d.mood,
      tags: d.tags,
      lucid: d.lucid,
      recurring: d.recurring,
      clarity: d.clarity,
      visibility: d.visibility,
      notes: d.notes ?? '',
    })),
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `reverie-dreams-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function getInitials(name: string) {
  const p = name.trim().split(/\s+/)
  return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase()
}

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

export function MeScreen({ user, dreams, onSignOut, onWhatsApp, onSignIn, onRecord, onSettings, onPaywall, badgeFlags, todayRecordings = 0, dailyLimit = 3 }: MeScreenProps) {

  // Guest
  if (!user) {
    return (
      <div className="me-screen">
        <div className="me-scroll">
          <div className="me-guest">
            <span className="me-guest-icon">◯</span>
            <h2 className="me-guest-title">Your profile awaits.</h2>
            <p className="me-guest-sub">Sign in to save your dreams, unlock your natal chart, and discover your patterns.</p>
            <button className="me-signin-btn" onClick={onSignIn}>Sign in</button>
          </div>
        </div>
      </div>
    )
  }

  const streak    = calculateStreak(dreams)
  const earnedIds = useMemo(
    () => getEarnedBadgeIds(dreams, badgeFlags ?? { viewedConstellation: false, createdCircle: false }),
    [dreams, badgeFlags]
  )
  const symbolSet = useMemo(() => {
    const counts: Record<string, number> = {}
    dreams.forEach(d => d.tags.forEach(t => { counts[t] = (counts[t] ?? 0) + 1 }))
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [dreams])

  const symbolCount  = symbolSet.length
  const zodiacSymbol = getZodiacSymbol(user.zodiacSign)
  const zodiacElem   = getZodiacElement(user.zodiacSign)
  const signName     = user.zodiacSign.charAt(0).toUpperCase() + user.zodiacSign.slice(1)
  const dreamDesc    = ZODIAC_DREAM_DESCRIPTIONS[user.zodiacSign]

  const isNew = dreams.length < 3

  const analysesCount = dreams.filter(d => (d.interpretations?.length ?? 0) > 0).length

  const stats = [
    { value: dreams.length,  label: 'dreams'   },
    { value: symbolCount,    label: 'symbols'  },
    { value: analysesCount,  label: 'analyses' },
  ]

  return (
    <div className="me-screen">
      <div className="me-scroll">

        {/* ── Profile header ─────────────────────────────── */}
        <div className="me-profile-top">
          <div className="me-avatar-name-row">
            <div className="me-avatar">{getInitials(user.name)}</div>
            <div className="me-identity">
              <h1 className="me-name">{user.name}</h1>
              <p className="me-bio-line">{zodiacSymbol} {signName} · {zodiacElem} dreamer</p>
            </div>
          </div>

          {/* Streak banner */}
          {streak > 0 && (
            <div className="me-streak-banner">
              <div className="me-streak-flame">
                <svg width="22" height="28" viewBox="0 0 22 28" fill="none">
                  <path d="M11 2C11 2 16 7 16 12c0 1.5-.4 2.8-1 3.8C15.6 14.6 16 13 16 11c0 0 3 3 3 7a8 8 0 01-16 0c0-5 5-10 5-10s0 4 3 5c-1-2-1-4 0-6 1.5 2 2 4 1.5 5.5C13.5 11.5 14 9 11 2z" fill="rgba(255,160,30,0.9)" stroke="rgba(255,200,60,0.5)" strokeWidth="0.5"/>
                </svg>
                <div className="me-streak-ring" style={{ '--streak-pct': `${Math.min(streak / 30, 1) * 100}%` } as React.CSSProperties} />
              </div>
              <div className="me-streak-info">
                <span className="me-streak-count">{streak}</span>
                <span className="me-streak-label">day streak</span>
              </div>
              <div className="me-streak-dots">
                {Array.from({ length: Math.min(streak, 7) }).map((_, i) => (
                  <div key={i} className="me-streak-dot" style={{ animationDelay: `${i * 0.08}s` }} />
                ))}
              </div>
            </div>
          )}

          <div className="me-stats-row">
            {stats.map(s => (
              <div key={s.label} className="me-stat-item">
                <span className="me-stat-value">{s.value}</span>
                <span className="me-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Dream identity blurb ───────────────────────── */}
        <div className="me-blurb-section">
          <p className="me-blurb">{dreamDesc}</p>
        </div>

        {/* ── Symbols section ────────────────────────────── */}
        {symbolSet.length > 0 && (
          <div className="me-section">
            <p className="me-section-label">Common symbols</p>
            <div className="me-symbol-chips">
              {symbolSet.slice(0, 10).map(([tag, count]) => (
                <span key={tag} className="me-symbol-chip">
                  {tag}
                  {count > 1 && <span className="me-chip-count">{count}</span>}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Badges ─────────────────────────────────────── */}
        <div className="me-section">
          <p className="me-section-label">Achievements</p>
          <div className="me-badges-grid">
            {BADGES.map(badge => {
              const earned = earnedIds.has(badge.id)
              return (
                <div key={badge.id} className={`me-badge ${earned ? 'earned' : 'locked'}`}>
                  <span className="me-badge-icon">{badge.icon}</span>
                  <span className="me-badge-name">{badge.name}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Daily recording limit ──────────────────────── */}
        <div className="me-section">
          <p className="me-section-label">Today's recordings</p>
          <div className="me-limit-bar-wrap">
            <div className="me-limit-bar">
              <div
                className="me-limit-bar-fill"
                style={{ width: `${Math.min(todayRecordings / dailyLimit, 1) * 100}%` }}
                data-full={todayRecordings >= dailyLimit}
              />
            </div>
            <span className="me-limit-text">
              {todayRecordings} / {dailyLimit} free
              {todayRecordings >= dailyLimit ? ' — limit reached' : ''}
            </span>
          </div>
          {todayRecordings >= dailyLimit && onPaywall && (
            <button className="me-limit-upgrade-btn" onClick={onPaywall}>
              Upgrade for unlimited →
            </button>
          )}
        </div>

        {/* ── Paywall CTA ─────────────────────────────────── */}
        {onPaywall && (
          <div className="me-section">
            <button className="me-paywall-cta" onClick={onPaywall}>
              <div className="me-paywall-cta-left">
                <span className="me-paywall-star">✦</span>
                <div>
                  <p className="me-paywall-title">Unlock Premium</p>
                  <p className="me-paywall-sub">AI analysis, constellation map & more</p>
                </div>
              </div>
              <span className="me-cta-chevron">›</span>
            </button>
          </div>
        )}

        {/* ── Activation CTAs (contextual) ───────────────── */}
        {isNew && (
          <div className="me-activation">
            {dreams.length === 0 && (
              <button className="me-cta-row" onClick={onRecord}>
                <span className="me-cta-icon">▷</span>
                <span className="me-cta-text">Record your first dream</span>
                <span className="me-cta-chevron">›</span>
              </button>
            )}
            <button className="me-cta-row" onClick={onWhatsApp}>
              <span className="me-cta-icon">💬</span>
              <span className="me-cta-text">Log dreams via WhatsApp</span>
              <span className="me-cta-chevron">›</span>
            </button>
            <button className="me-cta-row me-cta-muted">
              <span className="me-cta-icon">✦</span>
              <span className="me-cta-text">Get your first deep analysis</span>
              <span className="me-cta-chip">Soon</span>
            </button>
          </div>
        )}

        {/* ── Preferences ────────────────────────────────── */}
        <div className="me-section me-section-last">
          {onSettings && (
            <button className="me-row-btn" onClick={onSettings}>
              <span className="me-row-label">⚙ Settings</span>
              <span className="me-row-chevron">›</span>
            </button>
          )}
          <button className="me-row-btn" onClick={onWhatsApp}>
            <span className="me-row-label">💬 Log via WhatsApp</span>
            <span className="me-row-chevron">›</span>
          </button>
          <button className="me-row-btn" onClick={() => exportDreams(dreams, user?.name)}>
            <span className="me-row-label">↓ Export my dreams</span>
            <span className="me-row-chevron">›</span>
          </button>
          <button className="me-row-btn me-row-destructive" onClick={onSignOut}>
            <span className="me-row-label">Sign out</span>
          </button>
        </div>

        <div style={{ height: 80 }} />
      </div>
    </div>
  )
}
