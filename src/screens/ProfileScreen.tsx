import { useState } from 'react'
import './ProfileScreen.css'
import type { Dream, User } from '../types/dream'
import {
  getZodiacSymbol,
  getZodiacElement,
  getZodiacDates,
  ZODIAC_DREAM_DESCRIPTIONS,
} from '../utils/astro'

interface ProfileScreenProps {
  user: User | null
  dreams: Dream[]
  onSignOut: () => void
  onWhatsApp: () => void
  onSignIn: () => void
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

function calculateStreak(dreams: Dream[]): number {
  if (dreams.length === 0) return 0
  const sorted = [...dreams].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let streak = 0
  let current = new Date(today)

  for (let offset = 0; offset <= 365; offset++) {
    const checkDate = new Date(current)
    checkDate.setDate(current.getDate() - offset)
    const checkTime = checkDate.getTime()
    const nextTime = checkTime + 86400000

    const hasDream = sorted.some((d) => {
      const t = new Date(d.createdAt).getTime()
      return t >= checkTime && t < nextTime
    })

    if (hasDream) {
      streak++
    } else {
      break
    }
  }

  return streak
}

function Toggle({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button
      className={`toggle-track ${active ? 'active' : ''}`}
      onClick={onToggle}
      role="switch"
      aria-checked={active}
    >
      <div className="toggle-thumb" />
    </button>
  )
}

export function ProfileScreen({ user, dreams, onSignOut, onWhatsApp, onSignIn }: ProfileScreenProps) {
  const [notificationsOn, setNotificationsOn] = useState(true)

  if (!user) {
    return (
      <div className="profile-screen">
        <div className="profile-scroll">
          <div className="profile-guest">
            <span className="profile-guest-icon">◯</span>
            <h2 className="profile-guest-title">Your profile awaits.</h2>
            <p className="profile-guest-sub">
              Sign in to save your dreams, unlock your natal chart, and track your patterns over time.
            </p>
            <button className="profile-signin-btn" onClick={onSignIn}>
              Sign in
            </button>
          </div>
        </div>
      </div>
    )
  }

  const lucidCount = dreams.filter((d) => d.lucid).length
  const streak = calculateStreak(dreams)
  const zodiacSymbol = getZodiacSymbol(user.zodiacSign)
  const zodiacElement = getZodiacElement(user.zodiacSign)
  const zodiacDateRange = getZodiacDates(user.zodiacSign)
  const signName = user.zodiacSign.charAt(0).toUpperCase() + user.zodiacSign.slice(1)
  const dreamDescription = ZODIAC_DREAM_DESCRIPTIONS[user.zodiacSign]

  return (
    <div className="profile-screen">
      <div className="profile-scroll">
        {/* Avatar + identity */}
        <div className="profile-header">
          <div className="profile-avatar">
            {getInitials(user.name)}
          </div>
          <h1 className="profile-name">{user.name}</h1>
          <p className="profile-email">{user.email}</p>
          <p className="profile-sign-line">
            {zodiacSymbol} {signName}
          </p>
        </div>

        {/* Stats strip */}
        <div className="profile-stats-strip">
          <div className="profile-stat">
            <span className="profile-stat-num">{dreams.length}</span>
            <span className="profile-stat-label">Dreams</span>
          </div>
          <div className="profile-stat-divider" />
          <div className="profile-stat">
            <span className="profile-stat-num">{lucidCount}</span>
            <span className="profile-stat-label">Lucid</span>
          </div>
          <div className="profile-stat-divider" />
          <div className="profile-stat">
            <span className="profile-stat-num">{streak}</span>
            <span className="profile-stat-label">Streak</span>
          </div>
        </div>

        {/* Zodiac section */}
        <div className="profile-section">
          <p className="profile-section-title">Your Natal Chart</p>
          <div className="profile-zodiac-card">
            <div className="profile-zodiac-top">
              <span className="profile-zodiac-sym">{zodiacSymbol}</span>
              <div className="profile-zodiac-info">
                <span className="profile-zodiac-sign-name">{signName}</span>
                <span className="profile-zodiac-element">{zodiacElement} · {zodiacDateRange}</span>
              </div>
            </div>
            <p className="profile-zodiac-desc">{dreamDescription}</p>
          </div>
        </div>

        {/* Settings rows */}
        <div className="profile-section">
          <p className="profile-section-title">Preferences</p>
          <div className="profile-rows">
            <div className="profile-row">
              <span className="profile-row-label">Notifications</span>
              <Toggle active={notificationsOn} onToggle={() => setNotificationsOn((v) => !v)} />
            </div>
            <div className="profile-row-sep" />
            <button className="profile-row profile-row-btn" onClick={onWhatsApp}>
              <span className="profile-row-label">WhatsApp Integration</span>
              <span className="profile-row-chevron">›</span>
            </button>
            <div className="profile-row-sep" />
            <button className="profile-row profile-row-btn profile-row-destructive" onClick={onSignOut}>
              <span className="profile-row-label">Sign out</span>
            </button>
          </div>
        </div>

        <div className="profile-bottom-pad" />
      </div>
    </div>
  )
}
