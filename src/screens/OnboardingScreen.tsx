import { useState, useRef } from 'react'
import './OnboardingScreen.css'
import { PhoneInput } from '../components/PhoneInput'

interface OnboardingResult {
  platform?: 'whatsapp' | 'telegram'
  phone?: string
  dialCode?: string
  goals?: string[]
  reminderTime?: string
  username?: string
}

interface OnboardingScreenProps {
  onDone: (data?: OnboardingResult) => void
  deferredPrompt?: any
  installSkipped?: boolean
}

const TOTAL_SLIDES = 7

const GOAL_OPTIONS = [
  { id: 'recall',   icon: '🌙', label: 'Remember more dreams',     sub: 'Capture details before they fade'    },
  { id: 'symbols',  icon: '🔮', label: 'Understand dream symbols',  sub: 'Learn what your images mean'        },
  { id: 'patterns', icon: '✦',  label: 'Explore subconscious patterns', sub: 'Find recurring themes and emotions' },
  { id: 'lucid',    icon: '💜', label: 'Practice lucid dreaming',   sub: 'Become aware inside your dreams'    },
]

const REMINDER_TIMES = [
  { id: '0630', label: '6:30', sub: 'First light' },
  { id: '0730', label: '7:30', sub: 'Wake routine' },
  { id: '0900', label: '9:00', sub: 'Morning coffee' },
]

const PREMIUM_FEATURES = [
  { icon: '✦',  text: 'Dream Constellation map' },
  { icon: '🔮', text: 'Recurring pattern insights' },
  { icon: '📊', text: 'Dream statistics & export' },
  { icon: '🤖', text: 'AI dream analysis' },
  { icon: '💬', text: 'Ask Your Dreams (AI chat)' },
  { icon: '◉',  text: 'Private Dream Circle' },
]

export function OnboardingScreen({ onDone, deferredPrompt, installSkipped }: OnboardingScreenProps) {
  const [currentSlide,      setCurrentSlide]      = useState(0)
  const [username,          setUsername]          = useState('')
  const [usernameError,     setUsernameError]     = useState('')
  const [goals,             setGoals]             = useState<string[]>([])
  const [reminderTime,      setReminderTime]      = useState<string | null>(null)
  const [selectedPlatform,  setSelectedPlatform]  = useState<'whatsapp' | 'telegram' | null>(null)
  const [phone,             setPhone]             = useState('')
  const [dialCode,          setDialCode]          = useState('+1')
  const [confirmed,         setConfirmed]         = useState(false)
  const [installing, setInstalling] = useState(false)
  const startXRef = useRef<number | null>(null)

  async function handleInstallFromOnboarding() {
    if (!deferredPrompt) return
    setInstalling(true)
    try {
      deferredPrompt.prompt()
      await deferredPrompt.userChoice
    } catch { /* dismissed */ }
    setInstalling(false)
  }

  function next() {
    if (currentSlide < TOTAL_SLIDES - 1) setCurrentSlide(s => s + 1)
    else handleFinish()
  }

  function handleFinish() {
    const data: OnboardingResult = { goals, reminderTime: reminderTime ?? undefined }
    if (username.trim()) data.username = username.trim().toLowerCase().replace(/\s+/g, '_')
    if (selectedPlatform && phone) {
      data.platform = selectedPlatform
      data.phone    = dialCode + phone
      data.dialCode = dialCode
    }
    onDone(data)
  }

  function handleUsernameNext() {
    const val = username.trim()
    if (val && !/^[a-z0-9_]{2,20}$/.test(val.toLowerCase())) {
      setUsernameError('2–20 characters, letters/numbers/underscore only')
      return
    }
    setUsernameError('')
    next()
  }

  function handleConnect() {
    if (selectedPlatform && phone) setConfirmed(true)
    else next()
  }

  function toggleGoal(id: string) {
    setGoals(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id])
  }

  function handleTouchStart(e: React.TouchEvent) { startXRef.current = e.touches[0].clientX }
  function handleTouchEnd(e: React.TouchEvent) {
    if (startXRef.current === null) return
    const delta = startXRef.current - e.changedTouches[0].clientX
    if (delta > 50 && currentSlide < TOTAL_SLIDES - 1) setCurrentSlide(s => s + 1)
    if (delta < -50 && currentSlide > 0) setCurrentSlide(s => s - 1)
    startXRef.current = null
  }

  const isLast = currentSlide === TOTAL_SLIDES - 1
  const pct    = (100 / TOTAL_SLIDES)

  return (
    <div className="onboarding-screen" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>

      {/* ── Top nav ──────────────────────────────────────── */}
      <div className="onboarding-topnav">
        {!isLast
          ? <button className="onboarding-skip" onClick={handleFinish}>Skip</button>
          : <div />
        }
        <div />
      </div>

      {/* ── Slides track ─────────────────────────────────── */}
      <div
        className="onboarding-slides ob-slides-7"
        style={{ transform: `translateX(-${currentSlide * pct}%)` }}
      >

        {/* ── Slide 0: Welcome — private archive ────────── */}
        <div className="onboarding-slide">
          <div className="ob-visual ob-visual-1">
            <div className="ob-concentric">
              <div className="ob-ring ob-ring-1" />
              <div className="ob-ring ob-ring-2" />
              <div className="ob-ring ob-ring-3" />
              <div className="ob-ring ob-ring-4" />
              <div className="ob-ring-center-icon">🌙</div>
            </div>
          </div>
          <div className="ob-text-block">
            <h1 className="ob-wordmark">reverie</h1>
            <p className="ob-subtitle">You're creating a private space<br/>for your dreams.</p>
            <p className="ob-sub ob-sub-soft">A place where your subconscious patterns<br/>unfold over time.</p>
          </div>
        </div>

        {/* ── Slide 1: Username ────────────────────────── */}
        <div className="onboarding-slide ob-slide-username">
          <div className="ob-text-block ob-text-left">
            <h2 className="ob-heading">Choose your<br/>dream name.</h2>
            <p className="ob-sub">This is how others will find you in the community.</p>
          </div>
          <div className="ob-username-wrap">
            <div className="ob-username-field">
              <span className="ob-username-at">@</span>
              <input
                className="ob-username-input"
                placeholder="yourname"
                value={username}
                onChange={e => { setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')); setUsernameError('') }}
                maxLength={20}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
              />
            </div>
            {usernameError && <p className="ob-username-error">{usernameError}</p>}
            <p className="ob-username-hint">Letters, numbers, underscores · 2–20 characters</p>
          </div>
          <button className="ob-skip-link" onClick={() => { setUsernameError(''); next() }}>Skip for now</button>
        </div>

        <div className="onboarding-slide ob-slide-goals">
          <div className="ob-text-block ob-text-left">
            <h2 className="ob-heading">What draws you<br/>to dreaming?</h2>
            <p className="ob-sub">Select all that resonate.</p>
          </div>
          <div className="ob-goals-list">
            {GOAL_OPTIONS.map(g => {
              const active = goals.includes(g.id)
              return (
                <button
                  key={g.id}
                  className={`ob-goal-row ${active ? 'active' : ''}`}
                  onClick={() => toggleGoal(g.id)}
                >
                  <span className="ob-goal-icon">{g.icon}</span>
                  <div className="ob-goal-text">
                    <span className="ob-goal-label">{g.label}</span>
                    <span className="ob-goal-sub">{g.sub}</span>
                  </div>
                  <div className={`ob-goal-check ${active ? 'active' : ''}`}>
                    {active && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Slide 2: Morning reminder ─────────────────── */}
        <div className="onboarding-slide ob-slide-reminder">
          <div className="ob-text-block ob-text-left">
            <h2 className="ob-heading">When should we<br/>remind you?</h2>
          </div>
          <div className="ob-reminder-note">
            <span className="ob-reminder-note-icon">🌅</span>
            <p className="ob-reminder-note-text">Dreams fade within minutes of waking.<br/>A gentle reminder helps you capture them.</p>
          </div>
          <div className="ob-time-grid">
            {REMINDER_TIMES.map(t => (
              <button
                key={t.id}
                className={`ob-time-card ${reminderTime === t.id ? 'active' : ''}`}
                onClick={() => setReminderTime(reminderTime === t.id ? null : t.id)}
              >
                <span className="ob-time-clock">{t.label}</span>
                <span className="ob-time-sub">{t.sub}</span>
              </button>
            ))}
          </div>
          <button className="ob-skip-link" onClick={next}>Skip for now</button>
        </div>

        {/* ── Slide 3: Premium preview ──────────────────── */}
        <div className="onboarding-slide ob-slide-premium">
          <div className="ob-text-block">
            <h2 className="ob-heading ob-heading-center">Your dream world<br/>is waiting.</h2>
            <p className="ob-sub">Everything you need — free to start.</p>
          </div>

          <div className="ob-feature-list">
            {PREMIUM_FEATURES.map(f => (
              <div key={f.text} className="ob-feature-row">
                <span className="ob-feature-icon">{f.icon}</span>
                <span className="ob-feature-text">{f.text}</span>
              </div>
            ))}
          </div>

        </div>

        {/* ── Slide 4: WhatsApp connect ─────────────────── */}
        <div className="onboarding-slide">
          <div className="ob-visual ob-visual-connect">
            <div className="ob-connect-pills">
              <button
                className={`ob-platform-pill ob-platform-whatsapp ${selectedPlatform === 'whatsapp' ? 'selected' : ''}`}
                onClick={() => { setSelectedPlatform('whatsapp'); setConfirmed(false) }}
              >
                <span className="ob-platform-icon">💬</span>
                <span>WhatsApp</span>
                {selectedPlatform === 'whatsapp' && <span className="ob-platform-check">✓</span>}
              </button>
              <button
                className={`ob-platform-pill ob-platform-telegram ${selectedPlatform === 'telegram' ? 'selected' : ''}`}
                onClick={() => { setSelectedPlatform('telegram'); setConfirmed(false) }}
              >
                <span className="ob-platform-icon">✈</span>
                <span>Telegram</span>
                {selectedPlatform === 'telegram' && <span className="ob-platform-check">✓</span>}
              </button>
            </div>

            {selectedPlatform && !confirmed && (
              <div className="ob-phone-wrap">
                <PhoneInput
                  value={phone}
                  dialCode={dialCode}
                  onChange={(p, d, _c) => { setPhone(p); setDialCode(d) }}
                />
                <button
                  className="ob-connect-btn"
                  onClick={handleConnect}
                  disabled={!phone.trim()}
                >
                  Connect {selectedPlatform === 'whatsapp' ? 'WhatsApp' : 'Telegram'} →
                </button>
              </div>
            )}

            {confirmed && (
              <div className="ob-confirmed-card">
                <span className="ob-confirmed-icon">✦</span>
                <p className="ob-confirmed-text">
                  We'll send you a message shortly.<br/>
                  Tap the link to confirm your number.
                </p>
                <button className="ob-continue-btn" onClick={next}>Continue →</button>
              </div>
            )}

            {!selectedPlatform && (
              <button className="ob-skip-link" onClick={next}>Skip for now</button>
            )}
          </div>
          <div className="ob-text-block">
            <h2 className="ob-heading">Never miss a dream.</h2>
            <p className="ob-body">Send a voice note and it's logged instantly.</p>
          </div>
        </div>

        {/* ── Slide 5: Start now ────────────────────────── */}
        <div className="onboarding-slide">
          <div className="ob-visual ob-visual-4">
            <div className="ob-chat-mock">
              <div className="ob-chat-bubble ob-chat-user">
                <div className="ob-voice-wave">
                  {Array.from({ length: 18 }, (_, i) => (
                    <div key={i} className="ob-wave-bar" style={{ height: `${6 + Math.abs(Math.sin(i * 0.9) * 18)}px` }} />
                  ))}
                </div>
                <span className="ob-chat-time">0:23</span>
              </div>
              <div className="ob-chat-bubble ob-chat-bot">
                <span className="ob-chat-bot-text">✦ Dream logged. Sweet dreams.</span>
              </div>
            </div>
          </div>
          <div className="ob-text-block">
            <h2 className="ob-heading">Log from anywhere.</h2>
            <p className="ob-body">Speak, and your subconscious is archived.</p>
          </div>
          {installSkipped && deferredPrompt && (
            <div className="ob-install-reminder">
              <p className="ob-install-reminder-title">One more thing — install the app</p>
              <div className="ob-install-reminder-reasons">
                <span>🌙 Wake up &amp; tap instantly — dreams fade fast</span>
                <span>✦ Works offline at 3am, no signal needed</span>
                <span>◉ Full-screen, no browser interruptions</span>
              </div>
              <button
                className="ob-install-reminder-btn"
                onClick={handleInstallFromOnboarding}
                disabled={installing}
              >
                {installing ? 'Installing…' : 'Install App'}
              </button>
            </div>
          )}

          <div className="ob-cta-area">
            <button className="ob-get-started-btn" onClick={handleFinish}>
              Start journaling →
            </button>
          </div>
        </div>

      </div>

      {/* ── Bottom nav: Next + Dots ───────────────────────── */}
      <div className="onboarding-bottom-nav">
        {!isLast && (
          <button className="ob-next-btn" onClick={currentSlide === 1 ? handleUsernameNext : next}>Next →</button>
        )}
        <div className="onboarding-dots">
          {Array.from({ length: TOTAL_SLIDES }, (_, i) => (
            <button
              key={i}
              className={`ob-dot ${i === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
