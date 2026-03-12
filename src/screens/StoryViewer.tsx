import { useState, useEffect, useRef, useCallback } from 'react'
import './StoryViewer.css'
import type { CommunityDream, CommunityUser } from '../data/mockCommunity'

interface StoryViewerProps {
  stories: CommunityDream[]
  users: CommunityUser[]
  startIndex: number
  onClose: () => void
  onViewed: (dreamId: string) => void
}

const STORY_DURATION = 6000 // ms per story

export function StoryViewer({ stories, users, startIndex, onClose, onViewed }: StoryViewerProps) {
  const [current, setCurrent] = useState(startIndex)
  const [progress, setProgress] = useState(0)
  const [paused, setPaused] = useState(false)
  const [liked, setLiked] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState<Record<string, boolean>>({})
  const [replyText, setReplyText] = useState('')
  const [replySent, setReplySent] = useState(false)
  const [inputFocused, setInputFocused] = useState(false)
  const rafRef     = useRef<number>(0)
  const startRef   = useRef(performance.now())
  const pausedAt   = useRef(0)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)

  const dream = stories[current]
  const user  = users.find(u => u.id === dream?.userId)

  const goNext = useCallback(() => {
    onViewed(dream.id)
    if (current < stories.length - 1) {
      setCurrent(c => c + 1)
      setProgress(0)
      startRef.current = performance.now()
    } else {
      onClose()
    }
  }, [current, stories.length, dream, onViewed, onClose])

  const goPrev = useCallback(() => {
    if (current > 0) {
      setCurrent(c => c - 1)
      setProgress(0)
      startRef.current = performance.now()
    }
  }, [current])

  // Animate progress bar
  useEffect(() => {
    setProgress(0)
    startRef.current = performance.now()

    function tick() {
      if (paused || inputFocused) { rafRef.current = requestAnimationFrame(tick); return }
      const elapsed = performance.now() - startRef.current
      const p = Math.min(elapsed / STORY_DURATION, 1)
      setProgress(p)
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        goNext()
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [current, paused, goNext])

  // Keyboard
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft')  goPrev()
      if (e.key === 'Escape')     onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goNext, goPrev, onClose])

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    setPaused(true)
    pausedAt.current = performance.now()
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current
    const held = performance.now() - pausedAt.current

    if (Math.abs(dy) > 80 && dy > 0) { onClose(); return }
    if (Math.abs(dx) > 50) { dx < 0 ? goNext() : goPrev(); setPaused(false); return }
    if (held < 200) {
      // tap: right half = next, left half = prev
      if (touchStartX.current > window.innerWidth / 2) goNext()
      else goPrev()
    }
    // resume timer from where we paused
    startRef.current += performance.now() - pausedAt.current
    setPaused(false)
  }

  function handleTap(e: React.MouseEvent) {
    const x = e.clientX
    if (x > window.innerWidth / 2) goNext()
    else goPrev()
  }

  function handleSendReply() {
    if (!replyText.trim()) return
    setReplyText('')
    setReplySent(true)
    setTimeout(() => setReplySent(false), 2500)
  }

  if (!dream || !user) return null

  const isLiked = liked[dream.id]
  const isSaved = saved[dream.id]

  return (
    <div
      className="story-viewer"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Dream visual background */}
      <div
        className="story-bg"
        style={{ background: dream.visual }}
      />
      {/* Subtle overlay gradient */}
      <div className="story-overlay-top" />
      <div className="story-overlay-bottom" />

      {/* Progress bars */}
      <div className="story-progress-row">
        {stories.map((s, i) => (
          <div key={s.id} className="story-progress-track">
            <div
              className="story-progress-fill"
              style={{
                width: i < current ? '100%'
                     : i === current ? `${progress * 100}%`
                     : '0%',
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="story-header">
        <div className="story-user-row">
          <div className="story-avatar-sm">
          {user.avatar
            ? <img src={user.avatar} alt={user.name} className="story-avatar-img" />
            : user.initials
          }
        </div>
          <div className="story-user-info">
            <div className="story-user-name-row">
              <span className="story-username">{user.name}</span>
              <span className="story-time">· {dream.timeAgo}</span>
            </div>
            <span className="story-subtitle">Dream story preview</span>
          </div>
        </div>
        <div className="story-header-actions">
          <button className="story-icon-btn" aria-label="Mute">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M8 5L4 8H2v2h2l4 3V5zM15 6l-3 6M12 6l3 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </button>
          <button className="story-icon-btn" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Tap zones (on top of content, no pointer events on card) */}
      <div className="story-tap-zone story-tap-left"  onClick={handleTap} />
      <div className="story-tap-zone story-tap-right" onClick={handleTap} />

      {/* Content card */}
      <div className="story-card-area">
        <div className="story-content-card">
          {/* Tags */}
          <div className="story-tags">
            {dream.tags.map(t => (
              <span key={t} className="story-tag">{t}</span>
            ))}
          </div>

          {/* Title */}
          <h2 className="story-title">{dream.title}</h2>

          {/* Text */}
          <p className="story-text">{dream.text}</p>

          {/* Stats */}
          <div className="story-stats">
            <button
              className={`story-stat-btn ${isLiked ? 'active' : ''}`}
              onClick={e => { e.stopPropagation(); setLiked(l => ({ ...l, [dream.id]: !l[dream.id] })) }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill={isLiked ? 'currentColor' : 'none'}>
                <path d="M8 13.5S2 9.5 2 5.5a3 3 0 016 0 3 3 0 016 0c0 4-6 8-6 8z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
              </svg>
              <span>{dream.likes + (isLiked ? 1 : 0)}</span>
            </button>
            <button className="story-stat-btn" onClick={e => e.stopPropagation()}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M13 8A5 5 0 113 8a5 5 0 0110 0zM8 13v2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                <circle cx="8" cy="8" r="1" fill="currentColor"/>
              </svg>
              <span>{dream.comments}</span>
            </button>
            <button
              className={`story-stat-btn ${isSaved ? 'active' : ''}`}
              onClick={e => { e.stopPropagation(); setSaved(s => ({ ...s, [dream.id]: !s[dream.id] })) }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill={isSaved ? 'currentColor' : 'none'}>
                <path d="M3 2h10v12l-5-3-5 3V2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
              </svg>
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reply sent toast */}
      {replySent && (
        <div className="story-toast">Reply sent ✓</div>
      )}

      {/* Bottom reply bar */}
      <div className="story-reply-bar">
        <div className="story-reply-input-wrap">
          <input
            className="story-reply-input"
            type="text"
            placeholder={`Reply to ${user.name}'s dream…`}
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            onClick={e => e.stopPropagation()}
            onFocus={() => { setInputFocused(true); setPaused(true) }}
            onBlur={() => { setInputFocused(false); setPaused(false); startRef.current = performance.now() }}
            onKeyDown={e => { e.stopPropagation(); if (e.key === 'Enter') handleSendReply() }}
          />
        </div>
        <button className="story-reply-action" onClick={e => { e.stopPropagation(); setLiked(l => ({ ...l, [dream.id]: !l[dream.id] })) }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill={isLiked ? 'currentColor' : 'none'}>
            <path d="M9 15S3 11 3 6.5a3.5 3.5 0 017 0 3.5 3.5 0 017 0C17 11 9 15 9 15z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
          </svg>
        </button>
        <button
          className="story-reply-action story-reply-send"
          onClick={e => { e.stopPropagation(); handleSendReply() }}
          disabled={!replyText.trim()}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M16 2L2 7l6 4 4 6 4-15z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
