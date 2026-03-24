import { useState } from 'react'
import './ShareDreamSheet.css'
import type { Dream } from '../types/dream'

interface ShareDreamSheetProps {
  dream: Dream
  onClose: () => void
  onShareToStory?: (dream: Dream) => void
  onAddFriends?: () => void
}

export function ShareDreamSheet({ dream, onClose, onShareToStory, onAddFriends }: ShareDreamSheetProps) {
  const [shareWithCommunity, setShareWithCommunity] = useState(false)
  const [shared, setShared] = useState(false)

  function handleShare() {
    if (shareWithCommunity) {
      onShareToStory?.(dream)
    }
    setShared(true)
    setTimeout(() => {
      onClose()
    }, 800)
  }

  return (
    <div className="sds-overlay" onClick={onClose}>
      <div className="sds-sheet" onClick={e => e.stopPropagation()}>
        <div className="sds-handle" />

        <button className="sds-close" onClick={onClose} aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>

        <div className="sds-header">
          <h2 className="sds-title">Share this dream</h2>
          <p className="sds-subtitle">Decide who you want to share with</p>
        </div>

        {/* Share with community */}
        <button
          className={`sds-community-card ${shareWithCommunity ? 'selected' : ''}`}
          onClick={() => setShareWithCommunity(v => !v)}
        >
          <div className="sds-community-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C9.5 2 7.5 4 7.5 6.5S9.5 11 12 11s4.5-2 4.5-4.5S14.5 2 12 2z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              <path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              <path d="M17 8c1.1.6 2 1.8 2 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity=".5"/>
              <path d="M7 8c-1.1.6-2 1.8-2 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity=".5"/>
            </svg>
          </div>
          <div className="sds-community-info">
            <span className="sds-community-name">Share with community</span>
            <span className="sds-community-desc">
              Contribute to the community by sharing your dream. It will help train our AI, and allow others to discover it.
            </span>
          </div>
          <div className={`sds-radio ${shareWithCommunity ? 'active' : ''}`} />
        </button>

        {/* Friends section */}
        <div className="sds-friends-card">
          <div className="sds-friends-illustration">
            {/* Abstract embrace illustration using CSS shapes */}
            <div className="sds-friends-art">
              <div className="sds-art-body" />
              <div className="sds-art-arm" />
            </div>
          </div>
          <p className="sds-friends-empty">Your friends haven't shared any dreams with you yet</p>
          <p className="sds-friends-cta">Add friends and share your dreams with them</p>
          <button className="sds-add-friends-btn" onClick={onAddFriends}>
            Add friends
          </button>
        </div>

        {/* Share CTA */}
        <button
          className={`sds-share-btn ${shared ? 'shared' : ''}`}
          onClick={handleShare}
          disabled={shared}
        >
          {shared ? 'Shared ✓' : 'Share'}
        </button>
      </div>
    </div>
  )
}
