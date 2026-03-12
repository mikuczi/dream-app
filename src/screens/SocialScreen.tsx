import { useState } from 'react'
import './SocialScreen.css'
import {
  COMMUNITY_USERS,
  STORY_DREAMS,
  FEED_DREAMS,
  type CommunityDream,
} from '../data/mockCommunity'

interface SocialScreenProps {
  onOpenStory: (index: number) => void
  onAddStory?: () => void
  myName?: string
  myAvatar?: string
}

type FeedSort = 'recent' | 'top'

export function SocialScreen({ onOpenStory, onAddStory, myName, myAvatar }: SocialScreenProps) {
  const [viewedSet, setViewedSet] = useState<Set<string>>(
    () => new Set(COMMUNITY_USERS.filter(u => u.viewed).map(u => u.id))
  )
  const [sort,  setSort]  = useState<FeedSort>('recent')
  const [liked, setLiked] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState<Record<string, boolean>>({})

  const storyUsers = COMMUNITY_USERS.filter(u =>
    STORY_DREAMS.some(d => d.userId === u.id)
  )

  function handleAvatarTap(userId: string) {
    const idx = STORY_DREAMS.findIndex(d => d.userId === userId)
    if (idx !== -1) {
      setViewedSet(s => new Set([...s, userId]))
      onOpenStory(idx)
    }
  }

  const sortedFeed: CommunityDream[] = [...FEED_DREAMS].sort((a, b) =>
    sort === 'top' ? b.likes - a.likes : 0
  )

  const moodEmoji: Record<string, string> = {
    peaceful: '🌙', joyful: '✨', anxious: '🌀', strange: '🔮', sad: '💧', angry: '🔥',
  }

  return (
    <div className="social-screen">

      {/* ── Stories strip ──────────────────────────────── */}
      <div className="social-stories-wrap">
        <div className="social-stories-row">
          {/* My Story — always first */}
          <button className="story-avatar-btn" onClick={onAddStory}>
            <div className="story-ring story-ring-mine">
              <div className="story-avatar-circle story-avatar-mine">
                {myAvatar
                  ? <img src={myAvatar} alt="Me" className="story-avatar-img" />
                  : <span className="story-avatar-initials">{myName ? myName.slice(0, 2).toUpperCase() : 'ME'}</span>
                }
                <div className="story-add-badge">+</div>
              </div>
            </div>
            <span className="story-avatar-name">Your Story</span>
          </button>

          {storyUsers.map(user => {
            const viewed = viewedSet.has(user.id)
            return (
              <button
                key={user.id}
                className="story-avatar-btn"
                onClick={() => handleAvatarTap(user.id)}
              >
                <div className={`story-ring ${viewed ? 'viewed' : 'unviewed'}`}>
                  <div className="story-avatar-circle">
                    {user.avatar
                      ? <img src={user.avatar} alt={user.name} className="story-avatar-img" />
                      : <span className="story-avatar-initials">{user.initials}</span>
                    }
                  </div>
                </div>
                <span className="story-avatar-name">{user.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="social-divider" />

      {/* ── Feed header ──────────────────────────────── */}
      <div className="social-feed-header">
        <span className="social-feed-title">Community Dreams</span>
        <div className="social-sort-tabs">
          <button className={`social-sort-btn ${sort === 'recent' ? 'active' : ''}`} onClick={() => setSort('recent')}>Recent</button>
          <button className={`social-sort-btn ${sort === 'top'    ? 'active' : ''}`} onClick={() => setSort('top')}>Top</button>
        </div>
      </div>

      {/* ── Feed cards ───────────────────────────────── */}
      <div className="social-feed">
        {sortedFeed.map(dream => {
          const user    = COMMUNITY_USERS.find(u => u.id === dream.userId)
          if (!user) return null
          const isLiked = liked[dream.id] ?? dream.liked
          const isSaved = saved[dream.id] ?? dream.saved
          const emoji   = moodEmoji[dream.mood] ?? '💭'

          return (
            <div key={dream.id} className="feed-card">
              <div className="feed-card-visual" style={{ background: dream.visual }}>
                <span className="feed-card-mood">{emoji}</span>
              </div>
              <div className="feed-card-body">
                <div className="feed-card-user-row">
                  <div className="feed-card-avatar">
                    {user.avatar
                      ? <img src={user.avatar} alt={user.name} className="feed-card-avatar-img" />
                      : user.initials
                    }
                  </div>
                  <div className="feed-card-user-info">
                    <span className="feed-card-username">{user.name}</span>
                    <span className="feed-card-time">{dream.timeAgo}</span>
                  </div>
                  <span className="feed-card-zodiac">{user.zodiac}</span>
                </div>
                <h3 className="feed-card-title">{dream.title}</h3>
                <p className="feed-card-text">{dream.text}</p>
                <div className="feed-card-tags">
                  {dream.tags.map(t => <span key={t} className="feed-card-tag">{t}</span>)}
                </div>
                <div className="feed-card-actions">
                  <button
                    className={`feed-action-btn ${isLiked ? 'active' : ''}`}
                    onClick={() => setLiked(l => ({ ...l, [dream.id]: !isLiked }))}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill={isLiked ? 'currentColor' : 'none'}>
                      <path d="M8 13.5S2 9.5 2 5.5a3 3 0 016 0 3 3 0 016 0c0 4-6 8-6 8z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                    </svg>
                    <span>{dream.likes + (isLiked ? 1 : 0)}</span>
                  </button>
                  <button className="feed-action-btn">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M2 3h12v8H9l-3 2v-2H2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                    </svg>
                    <span>{dream.comments}</span>
                  </button>
                  <button
                    className={`feed-action-btn ${isSaved ? 'active' : ''}`}
                    onClick={() => setSaved(s => ({ ...s, [dream.id]: !isSaved }))}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill={isSaved ? 'currentColor' : 'none'}>
                      <path d="M3 2h10v12l-5-3-5 3V2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                    </svg>
                    <span>{dream.saves + (isSaved ? 1 : 0)}</span>
                  </button>
                  <button className="feed-action-btn feed-action-share">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M13 2L2 7l4.5 2.5L9 14l4-12z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}
