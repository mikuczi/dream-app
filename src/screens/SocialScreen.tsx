import { useState } from 'react'
import './SocialScreen.css'
import {
  COMMUNITY_USERS,
  STORY_DREAMS,
  FEED_DREAMS,
  type CommunityDream,
} from '../data/mockCommunity'
import type { Dream } from '../types/dream'
import { getSharedPatterns } from '../utils/dreamConnections'
import type { DreamCircle } from './DreamCircleScreen'

interface SocialScreenProps {
  onOpenStory: (index: number) => void
  onAddStory?: () => void
  myName?: string
  myAvatar?: string
  myStories?: Dream[]
  dreams?: Dream[]
  circle?: DreamCircle
  onManageCircle?: () => void
}

type FeedSort  = 'recent' | 'top'
type SocialTab = 'community' | 'circle'

export function SocialScreen({ onOpenStory, onAddStory, myName, myAvatar, myStories = [], dreams = [], circle, onManageCircle }: SocialScreenProps) {
  const [viewedSet,  setViewedSet]  = useState<Set<string>>(
    () => new Set(COMMUNITY_USERS.filter(u => u.viewed).map(u => u.id))
  )
  const [socialTab,  setSocialTab]  = useState<SocialTab>('community')
  const [sort,       setSort]       = useState<FeedSort>('recent')
  const [liked,      setLiked]      = useState<Record<string, boolean>>({})
  const [saved,      setSaved]      = useState<Record<string, boolean>>({})

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

  const myFeedItems: CommunityDream[] = myStories.map(d => ({
    id: d.id,
    userId: 'me',
    title: d.title,
    text: d.transcript.slice(0, 120) + (d.transcript.length > 120 ? '…' : ''),
    visual: d.artwork ?? 'radial-gradient(ellipse at 50% 30%, #1a1030 0%, #080510 100%)',
    mood: d.mood,
    tags: d.tags.slice(0, 3),
    likes: 0, comments: 0, saves: 0,
    timeAgo: 'Just now',
    liked: false, saved: false,
  }))

  const sharedPatterns = getSharedPatterns(dreams)

  const sortedFeed: CommunityDream[] = [...myFeedItems, ...FEED_DREAMS].sort((a, b) =>
    sort === 'top' ? b.likes - a.likes : 0
  )

  // Circle feed — user's dreams with visibility === 'circle'
  const circleDreams = dreams.filter(d => d.visibility === 'circle')
  const circleMembers = circle
    ? COMMUNITY_USERS.filter(u => circle.memberIds.includes(u.id))
    : []

  const moodEmoji: Record<string, string> = {
    peaceful: '🌙', joyful: '✨', anxious: '🌀', strange: '🔮', sad: '💧', angry: '🔥',
  }

  return (
    <div className="social-screen">

      {/* ── Main tab switch: Community / Circle ─────────── */}
      <div className="social-main-tabs">
        <button
          className={`social-main-tab ${socialTab === 'community' ? 'active' : ''}`}
          onClick={() => setSocialTab('community')}
        >
          Community
        </button>
        <button
          className={`social-main-tab ${socialTab === 'circle' ? 'active' : ''}`}
          onClick={() => setSocialTab('circle')}
        >
          Dream Circle
          {circle && circle.memberIds.length > 0 && (
            <span className="social-main-tab-dot" />
          )}
        </button>
      </div>

      {/* ══ COMMUNITY TAB ══════════════════════════════════ */}
      {socialTab === 'community' && (
        <>
          {/* Stories strip */}
          <div className="social-stories-wrap">
            <div className="social-stories-row">
              {/* My Story */}
              <button className="story-avatar-btn" onClick={myStories.length > 0 ? undefined : onAddStory}>
                <div className={`story-ring ${myStories.length > 0 ? 'unviewed' : 'story-ring-mine'}`}>
                  <div className={`story-avatar-circle ${myStories.length === 0 ? 'story-avatar-mine' : ''}`}
                    style={myStories[0]?.artwork ? { background: myStories[0].artwork } : undefined}
                  >
                    {myAvatar
                      ? <img src={myAvatar} alt="Me" className="story-avatar-img" />
                      : <span className="story-avatar-initials">{myName ? myName.slice(0, 2).toUpperCase() : 'ME'}</span>
                    }
                    {myStories.length === 0 && <div className="story-add-badge">+</div>}
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

          {/* Shared Dreams */}
          {sharedPatterns.length > 0 && (
            <div className="shared-dreams-section">
              <div className="shared-dreams-header">
                <span className="shared-dreams-icon">🌙</span>
                <span className="shared-dreams-title">Shared Dreams</span>
              </div>
              <div className="shared-dreams-row">
                {sharedPatterns.map(p => (
                  <div key={p.symbol} className="shared-dream-card">
                    <p className="shared-dream-count">{p.totalCount}</p>
                    <p className="shared-dream-text">
                      {p.userCount > 1
                        ? `You and ${p.totalCount - p.userCount} others dreamed about`
                        : `You share a dream about`}
                    </p>
                    <p className="shared-dream-symbol">{p.symbol}</p>
                    <p className="shared-dream-sub">this month</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feed header */}
          <div className="social-feed-header">
            <span className="social-feed-title">Community Dreams</span>
            <div className="social-sort-tabs">
              <button className={`social-sort-btn ${sort === 'recent' ? 'active' : ''}`} onClick={() => setSort('recent')}>Recent</button>
              <button className={`social-sort-btn ${sort === 'top'    ? 'active' : ''}`} onClick={() => setSort('top')}>Top</button>
            </div>
          </div>

          {/* Feed cards */}
          <div className="social-feed">
            {sortedFeed.map(dream => {
              const isMe    = dream.userId === 'me'
              const user    = isMe ? null : COMMUNITY_USERS.find(u => u.id === dream.userId)
              if (!isMe && !user) return null
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
                        {isMe
                          ? (myAvatar ? <img src={myAvatar} alt="Me" className="feed-card-avatar-img" /> : (myName ? myName.slice(0,2).toUpperCase() : 'ME'))
                          : user!.avatar ? <img src={user!.avatar} alt={user!.name} className="feed-card-avatar-img" /> : user!.initials
                        }
                      </div>
                      <div className="feed-card-user-info">
                        <span className="feed-card-username">{isMe ? (myName ?? 'You') : user!.name}</span>
                        <span className="feed-card-time">{dream.timeAgo}</span>
                      </div>
                      <span className="feed-card-zodiac">{isMe ? '' : user!.zodiac}</span>
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
        </>
      )}

      {/* ══ CIRCLE TAB ═════════════════════════════════════ */}
      {socialTab === 'circle' && (
        <div className="circle-feed">

          {/* Circle header card */}
          <div className="circle-feed-header">
            <div className="circle-feed-info">
              <div
                className="circle-feed-icon"
                style={{ background: circle ? `${circle.color}22` : undefined, borderColor: circle ? `${circle.color}44` : undefined }}
              >
                <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
                  <path d="M20 6C14 6 9 11 9 17s5 11 11 11c2 0 4-.5 5.6-1.4C21.2 30.2 18.8 32 16 32 8.3 32 2 25.7 2 18S8.3 4 16 4c1.7 0 3.3.3 4.8.9L20 6z"
                    fill={circle?.color ?? '#9B8CFF'} opacity="0.8"/>
                </svg>
              </div>
              <div>
                <p className="circle-feed-name">{circle?.name ?? 'Inner Circle'}</p>
                <p className="circle-feed-sub">
                  {circleMembers.length === 0
                    ? 'No members yet'
                    : circleMembers.slice(0, 3).map(m => m.name).join(', ')
                      + (circleMembers.length > 3 ? ` +${circleMembers.length - 3}` : '')
                  }
                </p>
              </div>
            </div>
            <button className="circle-feed-manage" onClick={onManageCircle}>
              Manage
            </button>
          </div>

          {/* Members strip */}
          {circleMembers.length > 0 && (
            <div className="circle-members-strip">
              {circleMembers.map(m => (
                <div key={m.id} className="circle-strip-img" title={m.name}>
                  {m.avatar
                    ? <img src={m.avatar} alt={m.name} />
                    : <span>{m.initials}</span>
                  }
                </div>
              ))}
            </div>
          )}

          <div className="social-divider" />

          {/* Circle dreams */}
          {circleDreams.length === 0 ? (
            <div className="circle-feed-empty">
              <div className="circle-feed-empty-icon">◉</div>
              <p className="circle-feed-empty-title">Nothing shared yet</p>
              <p className="circle-feed-empty-sub">
                Open a dream and tap ··· → Share to Dream Circle to share it privately with your circle.
              </p>
            </div>
          ) : (
            <div className="social-feed">
              {circleDreams.map(dream => {
                const emoji = moodEmoji[dream.mood] ?? '💭'
                return (
                  <div key={dream.id} className="feed-card feed-card-circle">
                    <div className="feed-card-circle-badge">◉ Circle</div>
                    <div
                      className="feed-card-visual"
                      style={{ background: dream.artwork ?? 'radial-gradient(ellipse at 50% 30%, #1a1030 0%, #080510 100%)' }}
                    >
                      <span className="feed-card-mood">{emoji}</span>
                    </div>
                    <div className="feed-card-body">
                      <div className="feed-card-user-row">
                        <div className="feed-card-avatar">
                          {myAvatar
                            ? <img src={myAvatar} alt="Me" className="feed-card-avatar-img" />
                            : myName ? myName.slice(0,2).toUpperCase() : 'ME'
                          }
                        </div>
                        <div className="feed-card-user-info">
                          <span className="feed-card-username">{myName ?? 'You'}</span>
                          <span className="feed-card-time">Just now</span>
                        </div>
                      </div>
                      <h3 className="feed-card-title">{dream.title}</h3>
                      <p className="feed-card-text">
                        {dream.transcript.slice(0, 120)}{dream.transcript.length > 120 ? '…' : ''}
                      </p>
                      <div className="feed-card-tags">
                        {dream.tags.slice(0, 3).map(t => <span key={t} className="feed-card-tag">{t}</span>)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

    </div>
  )
}
