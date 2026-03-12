import { useState, useRef } from 'react'
import './OnboardingScreen.css'
import { PhoneInput } from '../components/PhoneInput'

interface OnboardingScreenProps {
  onDone: (whatsappData?: { platform: 'whatsapp' | 'telegram'; phone: string; dialCode: string }) => void
}

const TOTAL_SLIDES = 5

export function OnboardingScreen({ onDone }: OnboardingScreenProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [selectedPlatform, setSelectedPlatform] = useState<'whatsapp' | 'telegram' | null>(null)
  const [phone, setPhone]       = useState('')
  const [dialCode, setDialCode] = useState('+1')
  const [confirmed, setConfirmed] = useState(false)
  const startXRef = useRef<number | null>(null)

  function next() {
    if (currentSlide < TOTAL_SLIDES - 1) setCurrentSlide(s => s + 1)
    else handleFinish()
  }

  function handleFinish() {
    const data = selectedPlatform && phone
      ? { platform: selectedPlatform, phone: dialCode + phone, dialCode }
      : undefined
    onDone(data)
  }

  function handleConnect() {
    if (selectedPlatform && phone) {
      setConfirmed(true)
    } else {
      next()
    }
  }

  function handleTouchStart(e: React.TouchEvent) {
    startXRef.current = e.touches[0].clientX
  }
  function handleTouchEnd(e: React.TouchEvent) {
    if (startXRef.current === null) return
    const delta = startXRef.current - e.changedTouches[0].clientX
    if (delta > 50 && currentSlide < TOTAL_SLIDES - 1) setCurrentSlide(s => s + 1)
    if (delta < -50 && currentSlide > 0) setCurrentSlide(s => s - 1)
    startXRef.current = null
  }

  const isLast = currentSlide === TOTAL_SLIDES - 1

  return (
    <div
      className="onboarding-screen"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top nav */}
      <div className="onboarding-topnav">
        {!isLast
          ? <button className="onboarding-skip" onClick={handleFinish}>Skip</button>
          : <div />
        }
        {!isLast && (
          <button className="onboarding-next" onClick={next}>Next →</button>
        )}
      </div>

      {/* Slides */}
      <div
        className="onboarding-slides"
        style={{ transform: `translateX(-${currentSlide * 20}%)` }}
      >
        {/* Slide 0 — reverie */}
        <div className="onboarding-slide">
          <div className="ob-visual ob-visual-1">
            <div className="ob-concentric">
              <div className="ob-ring ob-ring-1" />
              <div className="ob-ring ob-ring-2" />
              <div className="ob-ring ob-ring-3" />
              <div className="ob-ring ob-ring-4" />
            </div>
          </div>
          <div className="ob-text-block">
            <h1 className="ob-wordmark">reverie</h1>
            <p className="ob-subtitle">Your dreams, decoded.</p>
          </div>
        </div>

        {/* Slide 1 — Speak it */}
        <div className="onboarding-slide">
          <div className="ob-visual ob-visual-2">
            <div className="ob-mic-rings">
              <div className="ob-mic-ring ob-mic-ring-3" />
              <div className="ob-mic-ring ob-mic-ring-2" />
              <div className="ob-mic-ring ob-mic-ring-1" />
              <div className="ob-mic-center"><div className="ob-mic-dot" /></div>
            </div>
          </div>
          <div className="ob-text-block">
            <h2 className="ob-heading">Speak it.</h2>
            <p className="ob-body">Speak your dream the moment you wake.</p>
            <p className="ob-sub">Voice transcription captures every detail before it fades.</p>
          </div>
        </div>

        {/* Slide 2 — The cosmos */}
        <div className="onboarding-slide">
          <div className="ob-visual ob-visual-3">
            <div className="ob-moon-row">
              {['🌑','🌒','🌓','🌔','🌕','🌖','🌗','🌘'].map((sym, i) => (
                <span key={i} className="ob-moon-symbol">{sym}</span>
              ))}
            </div>
          </div>
          <div className="ob-text-block">
            <h2 className="ob-heading">The cosmos,<br />in context.</h2>
            <p className="ob-body">Every dream is timestamped with its moon phase and your natal chart.</p>
          </div>
        </div>

        {/* Slide 3 — Connect WhatsApp */}
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
                  Add the WhatsApp number now →
                </button>
              </div>
            )}

            {confirmed && (
              <div className="ob-confirmed-card">
                <span className="ob-confirmed-icon">✦</span>
                <p className="ob-confirmed-text">
                  We'll send you a WhatsApp message shortly.<br />
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
            <p className="ob-body">Send a voice note to our number and it's logged instantly.</p>
          </div>
        </div>

        {/* Slide 4 — Log from anywhere */}
        <div className="onboarding-slide">
          <div className="ob-visual ob-visual-4">
            <div className="ob-chat-mock">
              <div className="ob-chat-bubble ob-chat-user">
                <div className="ob-voice-wave">
                  {Array.from({ length: 18 }, (_, i) => (
                    <div
                      key={i}
                      className="ob-wave-bar"
                      style={{ height: `${6 + Math.abs(Math.sin(i * 0.9) * 18)}px` }}
                    />
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
            <p className="ob-body">Send a WhatsApp voice note — your dream is logged automatically.</p>
          </div>
          <div className="ob-cta-area">
            <button className="ob-get-started-btn" onClick={handleFinish}>
              Start journaling →
            </button>
          </div>
        </div>
      </div>

      {/* Dots */}
      <div className="onboarding-dots">
        {Array.from({ length: TOTAL_SLIDES }, (_, i) => (
          <button
            key={i}
            className={`ob-dot ${i === currentSlide ? 'active' : ''}`}
            onClick={() => setCurrentSlide(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
