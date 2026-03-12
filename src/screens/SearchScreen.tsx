import { useState, useRef, useEffect } from 'react'
import './SearchScreen.css'
import type { Dream } from '../types/dream'

interface Props {
  dreams: Dream[]
  onClose: () => void
  onOpenDream: (d: Dream) => void
}

export function SearchScreen({ dreams, onClose, onOpenDream }: Props) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const q = query.trim().toLowerCase()
  const results = q.length < 1 ? [] : dreams.filter(d =>
    d.title.toLowerCase().includes(q) ||
    d.transcript.toLowerCase().includes(q) ||
    d.tags.some(t => t.toLowerCase().includes(q)) ||
    d.mood.toLowerCase().includes(q)
  )

  function open(d: Dream) {
    onClose()
    onOpenDream(d)
  }

  return (
    <div className="search-screen">
      <div className="search-bar-row">
        <div className="search-input-wrap">
          <svg width="16" height="16" viewBox="0 0 22 22" fill="none" className="search-icon">
            <circle cx="10" cy="10" r="6.5" stroke="currentColor" strokeWidth="1.6"/>
            <line x1="15" y1="15" x2="20" y2="20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
          <input
            ref={inputRef}
            className="search-input"
            placeholder="Search dreams, symbols, moods…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {query && (
            <button className="search-clear" onClick={() => setQuery('')}>✕</button>
          )}
        </div>
        <button className="search-cancel" onClick={onClose}>Cancel</button>
      </div>

      <div className="search-results">
        {q.length > 0 && results.length === 0 && (
          <p className="search-empty">No dreams match "{query}"</p>
        )}

        {q.length === 0 && (
          <div className="search-hint">
            <p className="search-hint-text">Search by title, mood, symbol, or any word from your dream.</p>
          </div>
        )}

        {results.map(d => (
          <button key={d.id} className="search-result-row" onClick={() => open(d)}>
            <div className="search-result-left">
              <span className="search-result-title">{d.title}</span>
              <span className="search-result-meta">
                {new Date(d.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                {' · '}{d.mood}
                {d.tags.length > 0 && <> · {d.tags.slice(0, 2).join(', ')}</>}
              </span>
            </div>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="search-result-arrow">
              <path d="M4 7h6M7 4l3 3-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        ))}
      </div>
    </div>
  )
}
