import { useState } from 'react'
import './InstallScreen.css'

const BENEFITS = [
  {
    icon: '🌙',
    title: 'Capture dreams before they vanish',
    desc: 'Dreams fade within minutes of waking. One tap from your home screen — no browser, no delay.',
  },
  {
    icon: '✦',
    title: 'Works without internet',
    desc: 'Journal offline at 3am. Your entries sync automatically when you reconnect.',
  },
  {
    icon: '◉',
    title: 'Built for your phone',
    desc: 'Full-screen, edge to edge. No browser bars, no distractions — just your dream world.',
  },
]

interface InstallScreenProps {
  deferredPrompt: any
  onInstalled: () => void
  onSkip: () => void
}

export function InstallScreen({ deferredPrompt, onInstalled, onSkip }: InstallScreenProps) {
  const [installing, setInstalling] = useState(false)
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent.toLowerCase())
  const canInstall = !!deferredPrompt

  async function handleInstall() {
    if (!deferredPrompt) return
    setInstalling(true)
    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') onInstalled()
      else onSkip()
    } catch {
      onSkip()
    } finally {
      setInstalling(false)
    }
  }

  return (
    <div className="install-screen">

      {/* ── Background atmosphere ─────────────────────────── */}
      <div className="install-bg" aria-hidden="true">
        <div className="install-glow" />
        <div className="install-star is1" /><div className="install-star is2" />
        <div className="install-star is3" /><div className="install-star is4" />
        <div className="install-star is5" /><div className="install-star is6" />
      </div>

      {/* ── Top: visual + wordmark ────────────────────────── */}
      <div className="install-top">
        <div className="install-rings" aria-hidden="true">
          <div className="install-ring install-ring-4" />
          <div className="install-ring install-ring-3" />
          <div className="install-ring install-ring-2" />
          <div className="install-ring install-ring-1" />
          <span className="install-ring-icon">🌙</span>
        </div>
        <h1 className="install-wordmark">reverie</h1>
        <p className="install-subtitle">Your dream journal, always within reach.</p>
      </div>

      {/* ── Benefits ─────────────────────────────────────── */}
      <div className="install-benefits">
        {BENEFITS.map(b => (
          <div key={b.title} className="install-benefit-row">
            <span className="install-benefit-icon">{b.icon}</span>
            <div className="install-benefit-text">
              <span className="install-benefit-title">{b.title}</span>
              <span className="install-benefit-desc">{b.desc}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Actions ──────────────────────────────────────── */}
      <div className="install-actions">
        {isIOS ? (
          <>
            <div className="install-ios-hint">
              <span className="install-ios-icon">↑</span>
              Tap <strong>Share</strong> then <strong>Add to Home Screen</strong> in Safari to install.
            </div>
            <button className="install-skip-btn" onClick={onSkip}>
              Skip for now
            </button>
          </>
        ) : canInstall ? (
          <>
            <button
              className="install-btn"
              onClick={handleInstall}
              disabled={installing}
            >
              {installing ? 'Installing…' : 'Install App'}
            </button>
            <button className="install-skip-btn" onClick={onSkip}>
              Skip for now
            </button>
          </>
        ) : (
          /* Browser doesn't support prompt (desktop, or already dismissed) */
          <button className="install-skip-btn install-skip-solo" onClick={onSkip}>
            Continue to app →
          </button>
        )}
      </div>

    </div>
  )
}
