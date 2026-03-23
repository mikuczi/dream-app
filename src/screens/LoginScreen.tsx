import { useState } from 'react'
import './LoginScreen.css'

interface LoginScreenProps {
  onContinue: (name: string, dob: string) => void
  onGoogleSignIn?: () => Promise<void>
  googleConfigured?: boolean
}

export function LoginScreen({ onContinue, onGoogleSignIn, googleConfigured }: LoginScreenProps) {
  const [name, setName] = useState('')
  const [googleLoading, setGoogleLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (name.trim()) onContinue(name.trim(), '')
  }

  async function handleGoogleSignIn() {
    if (!onGoogleSignIn) return
    setGoogleLoading(true)
    try { await onGoogleSignIn() } catch { /* dismissed */ }
    finally { setGoogleLoading(false) }
  }

  return (
    <div className="login-screen">
      <div className="login-bg">
        <div className="login-glow" />
        <div className="login-star ls1" /><div className="login-star ls2" />
        <div className="login-star ls3" /><div className="login-star ls4" />
        <div className="login-star ls5" /><div className="login-star ls6" />
        <div className="login-star ls7" /><div className="login-star ls8" />
      </div>
      <div className="login-top">
        <div className="login-moon-wrap">
          <svg className="login-moon" viewBox="0 0 80 80" fill="none">
            <path d="M52 10C38 10 27 21 27 35s11 25 25 25c4 0 7.8-.9 11.2-2.5C58.4 62.6 50.7 68 42 68 27.6 68 16 56.4 16 42S27.6 16 42 16c3.7 0 7.2.8 10.4 2.2.2-.7.3-1.4.4-2.1L52 10z"
              fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.25)" strokeWidth="1"/>
            <circle cx="56" cy="20" r="1.5" fill="rgba(255,255,255,0.6)"/>
            <circle cx="62" cy="30" r="1" fill="rgba(255,255,255,0.4)"/>
            <circle cx="50" cy="14" r="1" fill="rgba(255,255,255,0.5)"/>
          </svg>
        </div>
        <h1 className="login-wordmark">reverie</h1>
        <p className="login-tagline">speak with your dreams</p>
      </div>

      {/* Google SSO — shown when Firebase is configured */}
      {googleConfigured && (
        <div className="login-google-wrap">
          <button
            className="login-google-btn"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            type="button"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            {googleLoading ? 'Signing in…' : 'Continue with Google'}
          </button>
          <div className="login-divider"><span>or</span></div>
        </div>
      )}

      <form className="login-form" onSubmit={handleSubmit}>
        <div className="login-field">
          <label className="login-label" htmlFor="login-name">Your name</label>
          <input
            id="login-name"
            className="login-input"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="How should we call you?"
            autoFocus
            autoComplete="given-name"
          />
        </div>

        <button
          className="login-btn"
          type="submit"
          disabled={!name.trim()}
        >
          Begin journaling
        </button>
      </form>
    </div>
  )
}
