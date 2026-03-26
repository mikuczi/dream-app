import { useState, useEffect } from 'react'
import './SocialScreen.css'
import type { CommunityDream } from '../data/mockCommunity'
import type { Dream, Comment, AppNotification, FeedPost } from '../types/dream'
import { getSharedPatterns } from '../utils/dreamConnections'
import type { DreamCircle } from './DreamCircleScreen'
import { setLike, addComment, createNotification, subscribePublicFeed, fetchActiveStories, fetchCircleFeedByMemberIds } from '../lib/firestore'

interface SocialScreenProps {
  onOpenStory: (index: number) => void
  onOpenMyStory?: () => void
  onAddStory?: () => void
  myName?: string
  myAvatar?: string
  myStories?: Dream[]
  dreams?: Dream[]
  circle?: DreamCircle
  onManageCircle?: () => void
  currentUserId?: string
  currentUserName?: string
  followingSet?: Set<string>
  onFollow?: (targetUid: string, targetName: string, targetUsername: string) => void
  onViewProfile?: (uid: string) => void
}

type FeedSort  = 'recent' | 'top'
type SocialTab = 'community' | 'circle'

function feedPostToCommunityDream(p: FeedPost): CommunityDream {
  const mins = Math.floor((Date.now() - new Date(p.createdAt).getTime()) / 60000)
  const timeAgo = mins < 1 ? 'Just now' : mins < 60 ? `${mins}m ago` : mins < 1440 ? `${Math.floor(mins/60)}h ago` : `${Math.floor(mins/1440)}d ago`
  return {
    id: p.id,
    userId: p.authorId,
    title: p.title,
    text: p.transcript.slice(0, 180) + (p.transcript.length > 180 ? '…' : ''),
    visual: 'radial-gradient(ellipse at 50% 30%, #1a1030 0%, #080510 100%)',
    mood: p.mood,
    tags: p.tags.slice(0, 3),
    likes: p.likeCount ?? 0, comments: p.commentCount ?? 0, saves: 0,
    timeAgo,
    liked: false, saved: false,
    authorName: p.authorName,
    authorPhoto: p.authorPhoto,
  }
}

export function SocialScreen({ onOpenMyStory, onAddStory, myName, myAvatar, myStories = [], dreams = [], circle, onManageCircle, currentUserId, currentUserName, followingSet, onFollow, onViewProfile }: SocialScreenProps) {
  const [viewedSet,       setViewedSet]       = useState<Set<string>>(new Set())
  const [socialTab,       setSocialTab]       = useState<SocialTab>('community')
  const [sort,            setSort]            = useState<FeedSort>('recent')
  const [liked,           setLiked]           = useState<Record<string, boolean>>({})
  const [saved,           setSaved]           = useState<Record<string, boolean>>({})
  const [focusDream,      setFocusDream]      = useState<CommunityDream | null>(null)
  const [commentInput,    setCommentInput]    = useState('')
  const [localComments,   setLocalComments]   = useState<{ text: string; time: string }[]>([])
  const [liveFeed,        setLiveFeed]        = useState<CommunityDream[]>([])
  const [feedLoading,     setFeedLoading]     = useState(true)
  // authorId → { name, photo } for real story bubbles
  const [liveStoryUsers,  setLiveStoryUsers]  = useState<Map<string, { name: string; photo?: string }>>(new Map())
  const [circleLiveFeed,  setCircleLiveFeed]  = useState<CommunityDream[]>([])

  useEffect(() => {
    return subscribePublicFeed(30, posts => {
      setLiveFeed(posts.map(feedPostToCommunityDream))
      setFeedLoading(false)
    })
  }, [])

  // Real story strip from Firestore
  useEffect(() => {
    fetchActiveStories(20).then(posts => {
      const map = new Map<string, { name: string; photo?: string }>()
      posts.forEach(p => {
        if (p.authorId !== currentUserId) {
          map.set(p.authorId, { name: p.authorName, photo: p.authorPhoto })
        }
      })
      setLiveStoryUsers(map)
    }).catch(() => {})
  }, [currentUserId])

  // Circle feed from Firestore
  useEffect(() => {
    if (!currentUserId) return
    const memberIds = [currentUserId, ...(circle?.memberIds ?? [])]
    fetchCircleFeedByMemberIds(memberIds, 30).then(posts => {
      setCircleLiveFeed(posts.map(feedPostToCommunityDream))
    }).catch(() => {})
  }, [currentUserId, circle?.memberIds?.join(',')]) // eslint-disable-line react-hooks/exhaustive-deps

  function submitComment() {
    const text = commentInput.trim()
    if (!text || !focusDream) return
    const comment: Comment = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      userId: currentUserId ?? 'me',
      userName: currentUserName ?? myName ?? 'You',
      text,
      createdAt: new Date().toISOString(),
    }
    setLocalComments(prev => [...prev, { text, time: 'Just now' }])
    setCommentInput('')
    if (currentUserId && focusDream.userId !== 'me') {
      addComment(focusDream.id, comment).catch(() => {})
      const notif: AppNotification = {
        id: `comment_${comment.id}`,
        type: 'comment',
        fromUserId: currentUserId,
        fromUserName: currentUserName ?? myName ?? 'Someone',
        dreamId: focusDream.id,
        dreamTitle: focusDream.title,
        read: false,
        createdAt: comment.createdAt,
      }
      createNotification(focusDream.userId, notif).catch(() => {})
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

  const sortedFeed: CommunityDream[] = [...myFeedItems, ...liveFeed].sort((a, b) =>
    sort === 'top' ? b.likes - a.likes : 0
  )

  // Circle feed — merge Firestore live posts with local circle dreams as fallback
  const localCircleDreams: CommunityDream[] = dreams
    .filter(d => d.visibility === 'circle')
    .map(d => ({
      id: d.id, userId: 'me', title: d.title,
      text: d.transcript.slice(0, 120) + (d.transcript.length > 120 ? '…' : ''),
      visual: d.artwork ?? 'radial-gradient(ellipse at 50% 30%, #1a1030 0%, #080510 100%)',
      mood: d.mood, tags: d.tags.slice(0, 3),
      likes: 0, comments: 0, saves: 0,
      timeAgo: 'Just now', liked: false, saved: false,
    }))
  const liveCircleIds = new Set(circleLiveFeed.map(d => d.id))
  const mergedCircleFeed = [...circleLiveFeed, ...localCircleDreams.filter(d => !liveCircleIds.has(d.id))]
  const circleMembers = circle
    ? circle.memberIds.map(uid => {
        const live = circleLiveFeed.find(d => d.userId === uid)
        if (live) return { id: uid, name: live.authorName ?? uid, initials: (live.authorName ?? uid).slice(0,2).toUpperCase(), avatar: live.authorPhoto }
        return { id: uid, name: uid.slice(0, 8), initials: uid.slice(0,2).toUpperCase(), avatar: undefined }
      })
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
              <button
                className="story-avatar-btn"
                onClick={myStories.length > 0 ? onOpenMyStory : onAddStory}
              >
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

              {/* Real Firestore story authors */}
              {[...liveStoryUsers.entries()].map(([uid, info]) => {
                const viewed = viewedSet.has(uid)
                const initials = info.name.slice(0, 2).toUpperCase()
                const livePost = liveFeed.find(d => d.userId === uid)
                return (
                  <button
                    key={uid}
                    className="story-avatar-btn"
                    onClick={() => {
                      setViewedSet(s => new Set([...s, uid]))
                      if (livePost) setFocusDream(livePost)
                    }}
                  >
                    <div className={`story-ring ${viewed ? 'viewed' : 'unviewed'}`}>
                      <div className="story-avatar-circle">
                        {info.photo
                          ? <img src={info.photo} alt={info.name} className="story-avatar-img" />
                          : <span className="story-avatar-initials">{initials}</span>
                        }
                      </div>
                    </div>
                    <span className="story-avatar-name">{info.name.split(' ')[0]}</span>
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
            {feedLoading && liveFeed.length === 0 && (
              <div className="feed-loading">
                {[0,1,2].map(i => <div key={i} className="feed-skeleton" />)}
              </div>
            )}
            {!feedLoading && sortedFeed.length === 0 && (
              <div className="circle-feed-empty">
                <div className="circle-feed-empty-icon">🌙</div>
                <p className="circle-feed-empty-title">No dreams shared yet</p>
                <p className="circle-feed-empty-sub">Record a dream and set its visibility to Public to see it here.</p>
              </div>
            )}
            {sortedFeed.map(dream => {
              const isMe = dream.userId === 'me'
              const user = isMe ? null : (dream.authorName ? { id: dream.userId, name: dream.authorName, initials: dream.authorName.slice(0,2).toUpperCase(), zodiac: '', avatar: dream.authorPhoto } : null)
              if (!isMe && !user) return null
              const isLiked = liked[dream.id] ?? dream.liked
              const isSaved = saved[dream.id] ?? dream.saved
              const emoji   = moodEmoji[dream.mood] ?? '💭'

              return (
                <div key={dream.id} className="feed-card" onClick={() => setFocusDream(dream)} style={{ cursor: 'pointer' }}>
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
                        onClick={(e) => {
                          e.stopPropagation()
                          const next = !isLiked
                          setLiked(l => ({ ...l, [dream.id]: next }))
                          if (currentUserId) setLike(dream.id, currentUserId, next).catch(() => {})
                        }}
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
                        onClick={(e) => { e.stopPropagation(); setSaved(s => ({ ...s, [dream.id]: !isSaved })) }}
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill={isSaved ? 'currentColor' : 'none'}>
                          <path d="M3 2h10v12l-5-3-5 3V2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                        </svg>
                        <span>{dream.saves + (isSaved ? 1 : 0)}</span>
                      </button>
                      <button className="feed-action-btn feed-action-share" onClick={(e) => e.stopPropagation()}>
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
          {mergedCircleFeed.length === 0 ? (
            <div className="circle-feed-empty">
              <div className="circle-feed-empty-icon">◉</div>
              <p className="circle-feed-empty-title">Nothing shared yet</p>
              <p className="circle-feed-empty-sub">
                Open a dream and tap ··· → Share to Dream Circle to share it privately with your circle.
              </p>
            </div>
          ) : (
            <div className="social-feed">
              {mergedCircleFeed.map(dream => {
                const isMe  = dream.userId === 'me' || dream.userId === currentUserId
                const name  = isMe ? (myName ?? 'You') : (dream.authorName ?? 'Member')
                const photo = isMe ? myAvatar : dream.authorPhoto
                const emoji = moodEmoji[dream.mood] ?? '💭'
                return (
                  <div key={dream.id} className="feed-card feed-card-circle" onClick={() => setFocusDream(dream)} style={{ cursor: 'pointer' }}>
                    <div className="feed-card-circle-badge">◉ Circle</div>
                    <div className="feed-card-visual" style={{ background: dream.visual }}>
                      <span className="feed-card-mood">{emoji}</span>
                    </div>
                    <div className="feed-card-body">
                      <div className="feed-card-user-row">
                        <div className="feed-card-avatar">
                          {photo
                            ? <img src={photo} alt={name} className="feed-card-avatar-img" />
                            : name.slice(0, 2).toUpperCase()
                          }
                        </div>
                        <div className="feed-card-user-info">
                          <span className="feed-card-username">{name}</span>
                          <span className="feed-card-time">{dream.timeAgo}</span>
                        </div>
                      </div>
                      <h3 className="feed-card-title">{dream.title}</h3>
                      <p className="feed-card-text">{dream.text}</p>
                      <div className="feed-card-tags">
                        {dream.tags.map(t => <span key={t} className="feed-card-tag">{t}</span>)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Full-screen dream overlay ─────────────────────── */}
      {focusDream && (() => {
        const isMe  = focusDream.userId === 'me'
        const fUser = isMe ? null : (focusDream.authorName ? { id: focusDream.userId, name: focusDream.authorName, initials: focusDream.authorName.slice(0,2).toUpperCase(), zodiac: '', avatar: focusDream.authorPhoto } : null)
        const isLiked = liked[focusDream.id] ?? focusDream.liked
        const isSaved = saved[focusDream.id] ?? focusDream.saved
        return (
          <div className="feed-detail-overlay">
            <div className="feed-detail-header">
              <button className="feed-detail-back" onClick={() => { setFocusDream(null); setCommentInput(''); setLocalComments([]) }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M12 4L6 10l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <div
                className="feed-detail-user"
                style={!isMe && onViewProfile ? { cursor: 'pointer' } : undefined}
                onClick={!isMe && onViewProfile ? () => onViewProfile(focusDream.userId) : undefined}
              >
                <div className="feed-card-avatar" style={{ width: 32, height: 32, fontSize: 11 }}>
                  {isMe
                    ? (myAvatar ? <img src={myAvatar} alt="Me" className="feed-card-avatar-img" /> : (myName ?? 'ME').slice(0,2).toUpperCase())
                    : fUser?.avatar ? <img src={fUser.avatar} alt={fUser.name} className="feed-card-avatar-img" /> : fUser?.initials
                  }
                </div>
                <div>
                  <span className="feed-detail-username">{isMe ? (myName ?? 'You') : fUser?.name}</span>
                  <span className="feed-detail-zodiac">{isMe ? '' : fUser?.zodiac}</span>
                </div>
              </div>
              {!isMe && (
                <button
                  className={`feed-detail-follow-btn ${followingSet?.has(focusDream.userId) ? 'following' : ''}`}
                  onClick={() => onFollow?.(focusDream.userId, fUser?.name ?? '', '')}
                >
                  {followingSet?.has(focusDream.userId) ? 'Following' : 'Follow'}
                </button>
              )}
            </div>

            <div className="feed-detail-image" style={{ background: focusDream.visual }} />

            <div className="feed-detail-scroll">
              <h2 className="feed-detail-title">{focusDream.title}</h2>
              <p className="feed-detail-text">{focusDream.text}</p>
              <div className="feed-card-tags" style={{ marginTop: 12 }}>
                {focusDream.tags.map(t => <span key={t} className="feed-card-tag">{t}</span>)}
              </div>

              <div className="feed-detail-actions">
                <button
                  className={`feed-action-btn ${isLiked ? 'active' : ''}`}
                  onClick={() => {
                    const next = !isLiked
                    setLiked(l => ({ ...l, [focusDream.id]: next }))
                    if (currentUserId) {
                      setLike(focusDream.id, currentUserId, next).catch(() => {})
                      if (next && !isMe) {
                        const notif: AppNotification = {
                          id: `like_${currentUserId}_${focusDream.id}`,
                          type: 'like',
                          fromUserId: currentUserId,
                          fromUserName: currentUserName ?? myName ?? 'Someone',
                          dreamId: focusDream.id,
                          dreamTitle: focusDream.title,
                          read: false,
                          createdAt: new Date().toISOString(),
                        }
                        createNotification(focusDream.userId, notif).catch(() => {})
                      }
                    }
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 16 16" fill={isLiked ? 'currentColor' : 'none'}>
                    <path d="M8 13.5S2 9.5 2 5.5a3 3 0 016 0 3 3 0 016 0c0 4-6 8-6 8z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                  </svg>
                  <span>{focusDream.likes + (isLiked ? 1 : 0)}</span>
                </button>
                <button
                  className={`feed-action-btn ${isSaved ? 'active' : ''}`}
                  onClick={() => setSaved(s => ({ ...s, [focusDream.id]: !isSaved }))}
                >
                  <svg width="18" height="18" viewBox="0 0 16 16" fill={isSaved ? 'currentColor' : 'none'}>
                    <path d="M3 2h10v12l-5-3-5 3V2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                  </svg>
                  <span>{focusDream.saves + (isSaved ? 1 : 0)}</span>
                </button>
              </div>

              <div className="feed-detail-comments">
                <p className="feed-detail-comments-label">Comments · {focusDream.comments + localComments.length}</p>
                {localComments.map((c, i) => (
                  <div key={i} className="feed-detail-comment-row">
                    <span className="feed-detail-comment-name">You</span>
                    <span className="feed-detail-comment-text">{c.text}</span>
                    <span className="feed-detail-comment-time">{c.time}</span>
                  </div>
                ))}
                <div className="feed-detail-comment-input-row">
                  <input
                    className="feed-detail-comment-input"
                    placeholder="Add a comment…"
                    value={commentInput}
                    onChange={e => setCommentInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') submitComment() }}
                  />
                  {commentInput.trim() && (
                    <button className="feed-detail-comment-send" onClick={submitComment}>Send</button>
                  )}
                </div>
              </div>

              <div style={{ height: 80 }} />
            </div>
          </div>
        )
      })()}

    </div>
  )
}
