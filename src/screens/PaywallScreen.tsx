import { useState } from 'react'
import './PaywallScreen.css'

interface PaywallScreenProps {
  onClose: () => void
  onSubscribe?: (tier: 'premium' | 'ai') => void
  userId?: string
}

const PREMIUM_FEATURES = [
  { icon: '✦',  text: 'Dream Constellation map' },
  { icon: '🔮', text: 'Recurring pattern insights' },
  { icon: '📊', text: 'Dream statistics & export' },
]

const AI_FEATURES = [
  { icon: '🤖', text: 'AI dream analysis' },
  { icon: '💬', text: 'Ask Your Dreams (AI chat)' },
  { icon: '◉',  text: 'Private Dream Circle' },
]

export function PaywallScreen({ onClose, onSubscribe, userId }: PaywallScreenProps) {
  const [selected,  setSelected]  = useState<'premium' | 'ai'>('ai')
  const [checkingOut, setCheckingOut] = useState(false)

  async function handleCheckout() {
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    if (!backendUrl || !userId) {
      onSubscribe?.(selected)
      onClose()
      return
    }
    setCheckingOut(true)
    try {
      const res = await fetch(`${backendUrl}/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: selected, userId }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        onSubscribe?.(selected)
        onClose()
      }
    } catch {
      onSubscribe?.(selected)
      onClose()
    } finally {
      setCheckingOut(false)
    }
  }

  return (
    <div className="paywall-overlay" onClick={onClose}>
      <div className="paywall-sheet" onClick={e => e.stopPropagation()}>
        <div className="paywall-handle" />

        <div className="paywall-header">
          <span className="paywall-star">✦</span>
          <h2 className="paywall-title">Unlock reverie</h2>
          <p className="paywall-sub">Everything you need to understand your dreams.</p>
        </div>

        {/* Tier selector */}
        <div className="paywall-tiers">
          <button
            className={`paywall-tier ${selected === 'premium' ? 'selected' : ''}`}
            onClick={() => setSelected('premium')}
          >
            <div className="paywall-tier-top">
              <span className="paywall-tier-name">Premium</span>
              <span className="paywall-tier-price">$4.99<span className="paywall-tier-per">/mo</span></span>
            </div>
            <p className="paywall-tier-desc">Patterns, insights & constellation map</p>
          </button>

          <button
            className={`paywall-tier paywall-tier-ai ${selected === 'ai' ? 'selected' : ''}`}
            onClick={() => setSelected('ai')}
          >
            <div className="paywall-tier-badge">Best value</div>
            <div className="paywall-tier-top">
              <span className="paywall-tier-name">Premium + AI</span>
              <span className="paywall-tier-price">$9.99<span className="paywall-tier-per">/mo</span></span>
            </div>
            <p className="paywall-tier-desc">Everything + AI analysis & chat</p>
          </button>
        </div>

        {/* Feature list */}
        <div className="paywall-features">
          <div className="paywall-feature-group">
            <p className="paywall-feature-group-label">Premium</p>
            {PREMIUM_FEATURES.map(f => (
              <div key={f.text} className="paywall-feature-row">
                <span className="paywall-feature-check">✓</span>
                <span className="paywall-feature-icon">{f.icon}</span>
                <span className="paywall-feature-text">{f.text}</span>
              </div>
            ))}
          </div>

          <div className={`paywall-feature-group ${selected !== 'ai' ? 'paywall-feature-group-dim' : ''}`}>
            <p className="paywall-feature-group-label">AI Add-on</p>
            {AI_FEATURES.map(f => (
              <div key={f.text} className="paywall-feature-row">
                <span className="paywall-feature-check">{selected === 'ai' ? '✓' : '·'}</span>
                <span className="paywall-feature-icon">{f.icon}</span>
                <span className="paywall-feature-text">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="paywall-cta">
          <button
            className="paywall-subscribe-btn"
            onClick={handleCheckout}
            disabled={checkingOut}
          >
            {checkingOut ? 'Redirecting…' : 'Start free 7-day trial →'}
          </button>
          <p className="paywall-legal">
            {selected === 'premium' ? '$4.99' : '$9.99'}/month after trial · Cancel anytime
          </p>
          <button className="paywall-dismiss" onClick={onClose}>Maybe later</button>
        </div>
      </div>
    </div>
  )
}
