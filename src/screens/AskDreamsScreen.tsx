import { useState, useRef, useEffect, useCallback } from 'react'
import './AskDreamsScreen.css'
import type { Dream } from '../types/dream'

interface Props { dreams: Dream[] }

type Message = { id: string; role: 'user' | 'assistant'; text: string }

const SUGGESTIONS = [
  'What does water mean in my dreams?',
  'Why do I keep dreaming about falling?',
  'What does it mean to dream about flying?',
  'Are my recurring symbols connected?',
]

const CANNED: Record<string, string> = {
  water: 'Water in dreams often represents the unconscious mind, emotions, and the flow of life. Still water suggests inner calm; turbulent water may reflect emotional unrest.',
  falling: 'Falling dreams often arise during transitions or periods of anxiety. They can signal a loss of control or fear of failure — but they rarely predict anything literal.',
  flying: 'Flying dreams are among the most positive. They suggest freedom, ambition, and transcendence. Often they correlate with waking confidence or a feeling of breaking free.',
  default: 'That\'s a fascinating dream pattern. Your symbols suggest a deeper emotional narrative worth exploring. Try journaling about what those images evoke for you in waking life.',
}

function generateReply(question: string): string {
  const q = question.toLowerCase()
  if (q.includes('water') || q.includes('ocean') || q.includes('river')) return CANNED.water
  if (q.includes('fall') || q.includes('falling')) return CANNED.falling
  if (q.includes('fly') || q.includes('flying')) return CANNED.flying
  return CANNED.default
}

export function AskDreamsScreen({ dreams }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'assistant', text: 'Ask me anything about your dreams. I can help you interpret symbols, patterns, and recurring themes.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [listening, setListening] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const startListening = useCallback(() => {
    const SR = (window as typeof window & { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition
      || (window as typeof window & { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition
    if (!SR) return
    const rec = new SR()
    rec.lang = 'en-US'
    rec.interimResults = true
    rec.continuous = false
    rec.onstart = () => setListening(true)
    rec.onend   = () => setListening(false)
    rec.onresult = (e: SpeechRecognitionEvent) => {
      const t = Array.from(e.results).map(r => r[0].transcript).join('')
      setInput(t)
    }
    recognitionRef.current = rec
    rec.start()
  }, [])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function send(text: string) {
    if (!text.trim() || loading) return
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: text.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    setTimeout(() => {
      const reply = generateReply(text)
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', text: reply }])
      setLoading(false)
    }, 1000 + Math.random() * 800)
  }

  return (
    <div className="ask-screen">
      <div className="ask-topbar">
        <h1 className="ask-title">Ask Your Dreams</h1>
        <p className="ask-sub">{dreams.length} dreams in your journal</p>
      </div>

      <div className="ask-messages">
        {messages.map(msg => (
          <div key={msg.id} className={`ask-msg ${msg.role}`}>
            <p className="ask-msg-text">{msg.text}</p>
          </div>
        ))}
        {loading && (
          <div className="ask-msg assistant">
            <p className="ask-msg-text ask-loading">···</p>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {messages.length <= 1 && (
        <div className="ask-suggestions">
          {SUGGESTIONS.map(s => (
            <button key={s} className="ask-suggestion-chip" onClick={() => send(s)}>
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="ask-input-bar">
        <button
          className={`ask-mic-btn ${listening ? 'active' : ''}`}
          onClick={listening ? stopListening : startListening}
          aria-label={listening ? 'Stop dictation' : 'Dictate'}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="6" y="1" width="6" height="10" rx="3" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M3 9a6 6 0 0012 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            <line x1="9" y1="15" x2="9" y2="17" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        </button>
        <input
          className="ask-input"
          placeholder={listening ? 'Listening…' : 'Ask about a dream or symbol…'}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send(input)}
        />
        <button className="ask-send-btn" onClick={() => send(input)} disabled={!input.trim() || loading}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 10L17 3l-4 7 4 7L3 10z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
