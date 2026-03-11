import { useState } from 'react'
import './LoginScreen.css'

interface LoginScreenProps {
  onContinue: (name: string, dob: string) => void
}

export function LoginScreen({ onContinue }: LoginScreenProps) {
  const [name, setName] = useState('')
  const [dob, setDob] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (name.trim()) onContinue(name.trim(), dob)
  }

  return (
    <div className="login-screen">
      <div className="login-top">
        <h1 className="login-wordmark">reverie</h1>
        <p className="login-tagline">Your dream journal</p>
      </div>

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

        <div className="login-field">
          <label className="login-label" htmlFor="login-dob">
            Date of birth
            <span className="login-label-note"> — for your natal chart</span>
          </label>
          <input
            id="login-dob"
            className="login-input login-input-date"
            type="date"
            value={dob}
            onChange={e => setDob(e.target.value)}
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
