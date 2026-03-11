import { useState } from 'react'
import './DreamDetailScreen.css'
import type { Dream, DreamMood } from '../types/dream'
import { getMoonPhase, getDreamInterpretation } from '../utils/astro'
import { DREAM_SYMBOLS } from '../data/symbols'

interface DreamDetailScreenProps {
  dream: Dream
  onBack: () => void
  onTogglePrivacy: (id: string) => void
  onDelete: (id: string) => void
}

const MOOD_SYMBOLS: Record<DreamMood, string> = {
  peaceful: '〜',
  joyful: '✦',
  anxious: '⊘',
  scary: '◈',
  strange: '∿',
}

const MOOD_NAMES: Record<DreamMood, string> = {
  peaceful: 'Peaceful',
  joyful: 'Joyful',
  anxious: 'Anxious',
  scary: 'Scary',
  strange: 'Strange',
}

const PLANET_LABELS = ['Moon', 'Mars', 'Saturn']

function formatDateNice(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function DreamDetailScreen({ dream, onBack, onTogglePrivacy, onDelete }: DreamDetailScreenProps) {
  const [expandedSymbols, setExpandedSymbols] = useState<Set<string>>(new Set())
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [localComments, setLocalComments] = useState(dream.comments ?? [])

  const moonPhase = getMoonPhase(new Date(dream.createdAt))
  const interpretations = getDreamInterpretation(dream)

  const transcriptLower = dream.transcript.toLowerCase()
  const matchedSymbols = DREAM_SYMBOLS.filter(sym => {
    const tagMatch = dream.tags.some(t =>
      sym.relatedTags.some(rt => rt === t || t.includes(rt) || rt.includes(t))
    )
    const transcriptMatch = sym.relatedTags.some(rt => transcriptLower.includes(rt))
    return tagMatch || transcriptMatch
  }).slice(0, 4)

  function toggleSymbol(id: string) {
    setExpandedSymbols(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleAddComment() {
    const trimmed = commentText.trim()
    if (!trimmed) return
    setLocalComments(prev => [...prev, {
      id: Date.now().toString(),
      userId: 'me',
      userName: 'You',
      text: trimmed,
      createdAt: new Date().toISOString(),
    }])
    setCommentText('')
  }

  function formatCommentTime(isoString: string): string {
    const date = new Date(isoString)
    const diffMins = Math.floor((Date.now() - date.getTime()) / 60000)
    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHrs = Math.floor(diffMins / 60)
    if (diffHrs < 24) return `${diffHrs}h ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="dream-detail-screen">
      {/* Header */}
      <div className="dream-detail-header">
        <button className="dream-detail-back" onClick={onBack}>← back</button>
        <span className="dream-detail-date">{formatDateNice(dream.createdAt)}</span>
        <button
          className="dream-detail-privacy-btn"
          onClick={() => onTogglePrivacy(dream.id)}
        >
          {dream.isPrivate ? '◎ private' : '◯ shared'}
        </button>
      </div>

      {/* Scroll content */}
      <div className="dream-detail-scroll">

        {/* Title + mood */}
        <div className="dream-detail-title-section">
          <h1 className="dream-detail-title">{dream.title}</h1>
          <div className="dream-detail-mood-row">
            <span className="dream-detail-mood-sym">{MOOD_SYMBOLS[dream.mood]}</span>
            <span className="dream-detail-mood-name">{MOOD_NAMES[dream.mood]}</span>
            <span className="dream-detail-moon">{moonPhase.symbol}</span>
            <span className="dream-detail-moon-name">{moonPhase.phase}</span>
          </div>
        </div>

        {/* Transcript */}
        <div className="dream-detail-transcript-card">
          <p className="dream-detail-transcript">{dream.transcript}</p>
        </div>

        {/* Metadata strip */}
        <div className="dream-detail-meta-strip">
          <div className="dream-detail-meta-item">
            <span className="dream-detail-meta-value">{dream.clarity}/10</span>
            <span className="dream-detail-meta-label">Clarity</span>
          </div>
          <div className="dream-detail-meta-divider" />
          <div className="dream-detail-meta-item">
            <span className="dream-detail-meta-value">
              {dream.lucid ? '◈ Lucid' : '◇ Non-lucid'}
            </span>
            <span className="dream-detail-meta-label">State</span>
          </div>
          <div className="dream-detail-meta-divider" />
          <div className="dream-detail-meta-item">
            <span className="dream-detail-meta-value">
              {dream.recurring ? '↻ Recurring' : '↺ First time'}
            </span>
            <span className="dream-detail-meta-label">Pattern</span>
          </div>
        </div>

        {/* Symbol analysis */}
        {matchedSymbols.length > 0 && (
          <div className="dream-detail-section">
            <p className="dream-detail-section-title">Symbols detected</p>
            <div className="dream-detail-symbols">
              {matchedSymbols.map(sym => {
                const isExpanded = expandedSymbols.has(sym.id)
                return (
                  <button
                    key={sym.id}
                    className={`dream-symbol-card ${isExpanded ? 'expanded' : ''}`}
                    onClick={() => toggleSymbol(sym.id)}
                  >
                    <div className="dream-symbol-card-top">
                      <span className="dream-symbol-name">{sym.name}</span>
                      <span className="dream-symbol-category">{sym.category}</span>
                    </div>
                    <p className="dream-symbol-meaning">
                      {isExpanded ? sym.meaning : sym.meaning.split('. ')[0] + '.'}
                    </p>
                    {isExpanded && (
                      <p className="dream-symbol-jungian"><em>{sym.jungian}</em></p>
                    )}
                    <span className="dream-symbol-expand-hint">
                      {isExpanded ? '▲ Less' : '▼ More'}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Cosmic reading */}
        {interpretations.length > 0 && (
          <div className="dream-detail-section">
            <p className="dream-detail-section-title">Cosmic reading</p>
            <div className="dream-detail-interpretations">
              {interpretations.map((text, i) => (
                <div key={i} className="dream-interp-card">
                  <p className="dream-interp-text">{text}</p>
                  <span className="dream-interp-planet">{PLANET_LABELS[i] ?? 'Venus'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reflections */}
        <div className="dream-detail-section">
          <p className="dream-detail-section-title">Reflections</p>
          <div className="dream-detail-comments">
            {localComments.length === 0 && (
              <p className="dream-detail-empty-note">Add a reflection…</p>
            )}
            {localComments.map(comment => (
              <div key={comment.id} className="dream-comment-card">
                <div className="dream-comment-header">
                  <span className="dream-comment-name">{comment.userName}</span>
                  <span className="dream-comment-time">{formatCommentTime(comment.createdAt)}</span>
                </div>
                <p className="dream-comment-text">{comment.text}</p>
              </div>
            ))}
          </div>
          <div className="dream-comment-input-row">
            <input
              className="dream-comment-input"
              type="text"
              placeholder="Add a reflection…"
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAddComment() }}
            />
            <button
              className="dream-comment-send"
              onClick={handleAddComment}
              disabled={!commentText.trim()}
            >↑</button>
          </div>
        </div>

        {/* Delete */}
        <div className="dream-detail-section dream-detail-section-last">
          {confirmDelete ? (
            <div className="dream-delete-confirm">
              <p className="dream-delete-confirm-text">Delete this dream? This cannot be undone.</p>
              <div className="dream-delete-confirm-row">
                <button className="dream-delete-cancel-btn" onClick={() => setConfirmDelete(false)}>
                  Cancel
                </button>
                <button className="dream-delete-confirm-btn" onClick={() => onDelete(dream.id)}>
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <button className="dream-delete-btn" onClick={() => setConfirmDelete(true)}>
              Delete dream
            </button>
          )}
        </div>

        <div style={{ height: 40 }} />
      </div>
    </div>
  )
}
