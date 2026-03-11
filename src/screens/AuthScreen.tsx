import { useState } from 'react'
import './AuthScreen.css'
import type { AuthHook } from '../hooks/useAuth'

interface AuthScreenProps {
  onBack: () => void
  onSuccess: () => void
  onGuest: () => void
  initialMode?: 'signin' | 'signup'
  auth: AuthHook
}

export function AuthScreen({ onBack, onSuccess, onGuest, initialMode = 'signup', auth }: AuthScreenProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [dob, setDob] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleSignUp() {
    setError('')
    if (!name.trim()) { setError('Please enter your name.'); return }
    if (!email.trim()) { setError('Please enter your email.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (!dob) { setError('Please enter your date of birth.'); return }
    setLoading(true)
    try {
      auth.signUp(name, email, password, dob)
      onSuccess()
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  function handleSignIn() {
    setError('')
    if (!email.trim()) { setError('Please enter your email.'); return }
    if (!password) { setError('Please enter your password.'); return }
    setLoading(true)
    const ok = auth.signIn(email, password)
    if (ok) {
      onSuccess()
    } else {
      setError('Email or password is incorrect.')
      setLoading(false)
    }
  }

  function switchMode(m: 'signin' | 'signup') {
    setMode(m)
    setError('')
    setLoading(false)
  }

  return (
    <div className="auth-screen">
      <button className="auth-back-btn" onClick={onBack} aria-label="Go back">
        ← back
      </button>

      <div className="auth-scroll">
        <div className="auth-content">
          <h1 className="auth-title">
            {mode === 'signup' ? 'Create account' : 'Welcome back'}
          </h1>
          <p className="auth-subtitle">
            {mode === 'signup'
              ? 'Begin your dream journal.'
              : 'Your dreams are waiting.'}
          </p>

          <div className="auth-form">
            {mode === 'signup' && (
              <div className="auth-field">
                <label className="auth-label" htmlFor="auth-name">Full name</label>
                <input
                  id="auth-name"
                  className="auth-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                />
              </div>
            )}

            <div className="auth-field">
              <label className="auth-label" htmlFor="auth-email">Email</label>
              <input
                id="auth-email"
                className="auth-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="auth-password">Password</label>
              <input
                id="auth-password"
                className="auth-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              />
            </div>

            {mode === 'signup' && (
              <div className="auth-field">
                <label className="auth-label" htmlFor="auth-dob">
                  When were you born? <span className="auth-label-note">(for your natal chart)</span>
                </label>
                <input
                  id="auth-dob"
                  className="auth-input auth-input-date"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />
              </div>
            )}

            {error && <p className="auth-error">{error}</p>}

            <button
              className="auth-submit-btn"
              onClick={mode === 'signup' ? handleSignUp : handleSignIn}
              disabled={loading}
            >
              {loading
                ? '…'
                : mode === 'signup'
                ? 'Begin journaling'
                : 'Continue'}
            </button>

            <button
              className="auth-toggle-link"
              onClick={() => switchMode(mode === 'signup' ? 'signin' : 'signup')}
            >
              {mode === 'signup'
                ? 'Already have an account? Sign in'
                : 'New here? Create account'}
            </button>

            {mode === 'signin' && (
              <button className="auth-guest-link" onClick={onGuest}>
                Continue without account
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
