import { useState } from 'react'
import './DailyLimitPaywall.css'

interface DailyLimitPaywallProps {
  usedToday: number
  onClose: () => void
  onSubscribe?: () => void
}

const FEATURES = [
  {
    title: 'Dream patterns',
    desc: 'All your previous dreams are woven into each new interpretation',
    icon: '◎',
    selected: true,
  },
  {
    title: 'Free tier',
    desc: '3 recordings per day, no cross-dream analysis',
    icon: '◯',
    selected: false,
  },
]

const PLANS = [
  {
    id: 'yearly',
    name: 'Yearly Plan',
    priceMonth: '€5.79',
    priceTotal: '€69.99',
    period: '12 mo',
    badge: 'Most popular',
    highlighted: true,
  },
  {
    id: 'monthly',
    name: 'Monthly Plan',
    priceMonth: '€9.99',
    priceTotal: null,
    period: 'per month',
    badge: null,
    highlighted: false,
  },
]

export function DailyLimitPaywall({ usedToday, onClose, onSubscribe }: DailyLimitPaywallProps) {
  const [selectedPlan, setSelectedPlan] = useState<'yearly' | 'monthly'>('yearly')
  const [featureIndex, setFeatureIndex] = useState(0)

  return (
    <div className="dlp-overlay" onClick={onClose}>
      <div className="dlp-sheet" onClick={e => e.stopPropagation()}>
        <button className="dlp-close" onClick={onClose} aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>

        <div className="dlp-header">
          <h2 className="dlp-title">Unlimited dream recording is ready</h2>
          <p className="dlp-subtitle">
            You've used {usedToday} of 3 free recordings today — redeem your offer
          </p>
        </div>

        {/* Feature carousel */}
        <div className="dlp-carousel">
          <div className="dlp-feature-card" data-selected={FEATURES[featureIndex].selected}>
            <div className="dlp-feature-icon-wrap">
              <span className="dlp-feature-icon">{FEATURES[featureIndex].icon}</span>
              {FEATURES[featureIndex].selected && (
                <span className="dlp-feature-check">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              )}
              {!FEATURES[featureIndex].selected && (
                <span className="dlp-feature-minus">
                  <svg width="10" height="2" viewBox="0 0 10 2" fill="none">
                    <path d="M1 1h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </span>
              )}
            </div>
            <p className="dlp-feature-title">{FEATURES[featureIndex].title}</p>
            <p className="dlp-feature-desc">{FEATURES[featureIndex].desc}</p>
          </div>

          {/* Dots */}
          <div className="dlp-dots">
            {FEATURES.map((_, i) => (
              <button
                key={i}
                className={`dlp-dot ${featureIndex === i ? 'active' : ''}`}
                onClick={() => setFeatureIndex(i)}
                aria-label={`Feature ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Plans */}
        <div className="dlp-plans">
          {PLANS.map(plan => (
            <button
              key={plan.id}
              className={`dlp-plan ${plan.highlighted ? 'dlp-plan-highlight' : ''} ${selectedPlan === plan.id ? 'selected' : ''}`}
              onClick={() => setSelectedPlan(plan.id as 'yearly' | 'monthly')}
            >
              <div className="dlp-plan-left">
                <span className="dlp-plan-name">{plan.name}</span>
                <span className="dlp-plan-price">{plan.priceMonth}<span className="dlp-plan-per"> · mo</span></span>
                <span className="dlp-plan-total">
                  {plan.priceTotal ? `${plan.period} · ${plan.priceTotal}` : plan.period}
                </span>
              </div>
              {plan.badge && (
                <span className="dlp-plan-badge">{plan.badge}</span>
              )}
              {!plan.badge && (
                <div className={`dlp-plan-radio ${selectedPlan === plan.id ? 'active' : ''}`} />
              )}
            </button>
          ))}
        </div>

        <button
          className="dlp-subscribe-btn"
          onClick={() => { onSubscribe?.(); onClose() }}
        >
          Start free 7-day trial
        </button>

        <div className="dlp-footer">
          <button className="dlp-footer-link">EULA</button>
          <button className="dlp-footer-link">PRIVACY</button>
          <button className="dlp-footer-link" onClick={onClose}>RESTORE</button>
        </div>
      </div>
    </div>
  )
}
