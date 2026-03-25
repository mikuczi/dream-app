import { useState, useEffect } from 'react'
import './UserProfileScreen.css'
import { fetchPublicProfile, fetchPublicFeed } from '../lib/firestore'
import type { FeedPost } from '../types/dream'

interface UserProfileScreenProps {
  targetUid: string
  currentUserId?: string
  followingSet?: Set<string>
  onFollow?: (uid: string, name: string, username: string) => void
  onBack: () => void
}

export function UserProfileScreen({ targetUid, currentUserId, followingSet, onFollow, onBack }: UserProfileScreenProps) {
  const [profile, setProfile] = useState<{ name: string; username: string; photoURL?: string; zodiacSign?: string } | null>(null)
  const [dreams,  setDreams]  = useState<FeedPost[]>([])
  const [loading, setLoading] = useState(true)

  const isFollowing = followingSet?.has(targetUid) ?? false

  useEffect(() => {
    Promise.all([
      fetchPublicProfile(targetUid),
      fetchPublicFeed(20),
    ]).then(([prof, feed]) => {
      setProfile(prof)
      setDreams(feed.filter(p => p.authorId === targetUid))
    }).catch(() => {}).finally(() => setLoading(false))
  }, [targetUid])

  const moodEmoji: Record<string, string> = {
    peaceful: '🌙', joyful: '✨', anxious: '🌀', strange: '🔮', sad: '💧', angry: '🔥',
  }

  return (
    <div className="userprofile-screen overlay-screen screen-enter">

      {/* Header */}
      <div className="userprofile-header">
        <button className="userprofile-back" onClick={onBack} aria-label="Back">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 4L6 10l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="userprofile-header-title">Profile</span>
        <div style={{ width: 36 }} />
      </div>

      <div className="userprofile-scroll">
        {loading ? (
          <div className="userprofile-loading">
            <div className="userprofile-avatar-skel" />
            <div className="userprofile-name-skel" />
          </div>
        ) : profile ? (
          <>
            {/* Avatar + name */}
            <div className="userprofile-hero">
              <div className="userprofile-avatar">
                {profile.photoURL
                  ? <img src={profile.photoURL} alt={profile.name} className="userprofile-avatar-img" />
                  : <span className="userprofile-avatar-initials">{profile.name.slice(0,2).toUpperCase()}</span>
                }
              </div>
              <h2 className="userprofile-name">{profile.name}</h2>
              {profile.username && (
                <p className="userprofile-username">@{profile.username}</p>
              )}
              {profile.zodiacSign && (
                <p className="userprofile-zodiac">{profile.zodiacSign}</p>
              )}

              {currentUserId && currentUserId !== targetUid && (
                <button
                  className={`userprofile-follow-btn ${isFollowing ? 'following' : ''}`}
                  onClick={() => onFollow?.(targetUid, profile.name, profile.username ?? '')}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              )}
            </div>

            <div className="userprofile-divider" />

            {/* Public dreams */}
            <div className="userprofile-dreams-header">
              <span className="userprofile-dreams-title">Public Dreams</span>
              <span className="userprofile-dreams-count">{dreams.length}</span>
            </div>

            {dreams.length === 0 ? (
              <div className="userprofile-empty">
                <p>No public dreams yet.</p>
              </div>
            ) : (
              <div className="userprofile-dreams">
                {dreams.map(d => (
                  <div key={d.id} className="userprofile-dream-card">
                    <span className="userprofile-dream-mood">{moodEmoji[d.mood] ?? '💭'}</span>
                    <div className="userprofile-dream-body">
                      <h3 className="userprofile-dream-title">{d.title}</h3>
                      <p className="userprofile-dream-text">
                        {d.transcript.slice(0, 100)}{d.transcript.length > 100 ? '…' : ''}
                      </p>
                      <div className="userprofile-dream-tags">
                        {d.tags.slice(0, 3).map(t => <span key={t} className="userprofile-dream-tag">{t}</span>)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ height: 80 }} />
          </>
        ) : (
          <div className="userprofile-empty">
            <p>User not found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
