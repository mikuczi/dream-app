import { useState } from 'react'
import './WhatsAppScreen.css'

interface WhatsAppScreenProps {
  onBack: () => void
}

export function WhatsAppScreen({ onBack }: WhatsAppScreenProps) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText('+18007383743').catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="whatsapp-screen screen">
      {/* Header */}
      <div className="wa-header">
        <button className="wa-back-btn" onClick={onBack} aria-label="Go back">
          ← back
        </button>
        <span className="wa-header-title">WhatsApp Journal</span>
      </div>

      <div className="wa-scroll">
        {/* Hero illustration */}
        <div className="wa-hero">
          <div className="wa-phone-mock">
            <div className="wa-phone-screen">
              <div className="wa-chat-header">
                <div className="wa-chat-avatar" />
                <div className="wa-chat-name-block">
                  <span className="wa-chat-name">Reverie</span>
                  <span className="wa-chat-status">
                    <span className="wa-status-dot" />
                    online
                  </span>
                </div>
              </div>
              <div className="wa-chat-body">
                <div className="wa-bubble wa-bubble-right">
                  <div className="wa-voice-note">
                    <div className="wa-voice-play">▶</div>
                    <div className="wa-voice-bars">
                      {Array.from({ length: 22 }, (_, i) => (
                        <div
                          key={i}
                          className="wa-voice-bar"
                          style={{
                            height: `${6 + Math.abs(Math.sin(i * 0.9) * 16)}px`,
                          }}
                        />
                      ))}
                    </div>
                    <span className="wa-voice-time">0:18</span>
                  </div>
                </div>
                <div className="wa-bubble wa-bubble-left">
                  <span className="wa-bubble-text">✦ Dream logged. Sweet dreams.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Title + description */}
        <div className="wa-content">
          <h1 className="wa-title">Log dreams without opening the app.</h1>
          <p className="wa-desc">
            Add our number to WhatsApp. Send yourself a voice note when you wake up.
            We transcribe it, analyze it, and add it to your journal automatically.
          </p>

          {/* Number card */}
          <div className="wa-number-card">
            <span className="wa-number">+1 (800) REVERIE</span>
            <button className="wa-copy-btn" onClick={handleCopy}>
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>

          {/* Steps */}
          <div className="wa-steps">
            {[
              'Add the number to your contacts',
              'Send a voice note describing your dream',
              'It appears in your journal within seconds',
            ].map((step, i) => (
              <div key={i} className="wa-step">
                <span className="wa-step-num">{i + 1}</span>
                <p className="wa-step-text">{step}</p>
              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <p className="wa-disclaimer">
            This feature requires a Reverie account.
          </p>
        </div>

        <div className="wa-bottom-pad" />
      </div>
    </div>
  )
}
