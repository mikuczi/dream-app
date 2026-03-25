import { useState } from 'react'
import './DreamCircleScreen.css'
import { COMMUNITY_USERS, type CommunityUser } from '../data/mockCommunity'
import type { Dream } from '../types/dream'

export interface DreamCircle {
  name: string
  color: string
  memberIds: string[]
}

type InviteStatus = 'pending' | 'accepted' | 'rejected'
interface Invitation { userId: string; email: string; status: InviteStatus }

interface DreamCircleScreenProps {
  circle: DreamCircle
  dreams: Dream[]
  myName?: string
  onUpdate: (circle: DreamCircle) => void
  onBack: () => void
}

const CIRCLE_COLORS = [
  '#9B8CFF', '#7bb3f4', '#c97bf4', '#f4c97b', '#7bf4c4',
]

export function DreamCircleScreen({ circle, dreams, myName, onUpdate, onBack }: DreamCircleScreenProps) {
  const [editingName,   setEditingName]   = useState(false)
  const [nameVal,       setNameVal]       = useState(circle.name)
  const [showAdd,       setShowAdd]       = useState(false)
  const [showColors,    setShowColors]    = useState(false)
  const [pendingIds,    setPendingIds]    = useState<string[]>([])
  const [emailInput,    setEmailInput]    = useState('')
  const [emailError,    setEmailError]    = useState('')
  const [invitations,   setInvitations]   = useState<Invitation[]>([])
  const [profileUser,   setProfileUser]   = useState<CommunityUser | null>(null)

  const members      = COMMUNITY_USERS.filter(u => circle.memberIds.includes(u.id))
  const circleDreams = dreams.filter(d => d.visibility === 'circle')

  function openAddSheet() {
    setPendingIds([...circle.memberIds])
    setEmailInput('')
    setShowAdd(true)
  }

  function saveName() {
    const trimmed = nameVal.trim()
    if (trimmed) onUpdate({ ...circle, name: trimmed })
    setEditingName(false)
  }

  function toggleMember(userId: string) {
    const ids = circle.memberIds.includes(userId)
      ? circle.memberIds.filter(id => id !== userId)
      : [...circle.memberIds, userId]
    onUpdate({ ...circle, memberIds: ids })
  }

  function togglePending(userId: string) {
    setPendingIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    )
  }

  function handleEmailInvite() {
    const email = emailInput.trim().toLowerCase()
    setEmailError('')
    if (!email) return
    const found = COMMUNITY_USERS.find(u => u.email?.toLowerCase() === email)
    if (!found) {
      setEmailError('User not found')
      return
    }
    const already = invitations.find(i => i.userId === found.id)
    if (already) {
      setEmailError(already.status === 'pending' ? 'Invitation already sent' : 'Already responded')
      return
    }
    setInvitations(prev => [...prev, { userId: found.id, email, status: 'pending' }])
    setEmailInput('')
  }

  function handleSendInvites() {
    onUpdate({ ...circle, memberIds: pendingIds })
    setShowAdd(false)
  }

  function setColor(color: string) {
    onUpdate({ ...circle, color })
    setShowColors(false)
  }

  return (
    <div className="circle-screen">

      {/* ── Header ────────────────────────────────────────── */}
      <div className="circle-header">
        <button className="circle-back" onClick={onBack} aria-label="Back">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 4L6 10l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="circle-header-title">Dream Circle</span>
        <div style={{ width: 36 }} />
      </div>

      {/* ── Hero ──────────────────────────────────────────── */}
      <div className="circle-hero">
        <button
          className="circle-badge"
          style={{ background: `radial-gradient(ellipse at 40% 35%, ${circle.color}33 0%, ${circle.color}11 60%, transparent 100%)`, borderColor: `${circle.color}44` }}
          onClick={() => setShowColors(v => !v)}
          aria-label="Change colour"
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M20 6C14 6 9 11 9 17s5 11 11 11c2 0 4-.5 5.6-1.4C21.2 30.2 18.8 32 16 32 8.3 32 2 25.7 2 18S8.3 4 16 4c1.7 0 3.3.3 4.8.9L20 6z"
              fill={circle.color} opacity="0.7"/>
          </svg>
        </button>

        {showColors && (
          <div className="circle-color-picker">
            {CIRCLE_COLORS.map(c => (
              <button
                key={c}
                className={`circle-color-dot ${c === circle.color ? 'active' : ''}`}
                style={{ background: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
        )}

        {editingName ? (
          <input
            className="circle-name-input"
            value={nameVal}
            onChange={e => setNameVal(e.target.value)}
            onBlur={saveName}
            onKeyDown={e => e.key === 'Enter' && saveName()}
            autoFocus
          />
        ) : (
          <button className="circle-name-btn" onClick={() => setEditingName(true)}>
            <span className="circle-name">{circle.name}</span>
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" opacity="0.4">
              <path d="M2 10l1.5-.3L11 2.2a1 1 0 00-1.4-1.4L2 8.5 2 10z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
            </svg>
          </button>
        )}

        <div className="circle-stats">
          <span className="circle-stat">
            <span className="circle-stat-val">{members.length}</span>
            <span className="circle-stat-label">members</span>
          </span>
          <span className="circle-stat-dot" />
          <span className="circle-stat">
            <span className="circle-stat-val">{circleDreams.length}</span>
            <span className="circle-stat-label">dreams shared</span>
          </span>
        </div>

        <p className="circle-privacy-note">
          Only circle members can see dreams you share privately.
        </p>
      </div>

      <div className="circle-divider" />

      {/* ── Members ───────────────────────────────────────── */}
      <div className="circle-section">
        <div className="circle-section-header">
          <span className="circle-section-title">Members</span>
          {COMMUNITY_USERS.length > 0 && (
            <button className="circle-add-btn" onClick={openAddSheet}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <line x1="6" y1="1" x2="6" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="1" y1="6" x2="11" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Add people
            </button>
          )}
        </div>

        {members.length === 0 ? (
          <div className="circle-empty">
            <p className="circle-empty-text">Your circle is empty.</p>
            <p className="circle-empty-sub">Add close friends to share dreams privately.</p>
            <button className="circle-empty-add" onClick={openAddSheet}>
              Add your first member
            </button>
          </div>
        ) : (
          <div className="circle-members-list">
            {/* You — always first */}
            <div className="circle-member-row circle-member-you">
              <div className="circle-member-avatar" style={{ background: `${circle.color}22`, borderColor: `${circle.color}44` }}>
                <span style={{ color: circle.color, fontSize: 11, fontWeight: 700 }}>
                  {myName ? myName.slice(0, 2).toUpperCase() : 'ME'}
                </span>
              </div>
              <div className="circle-member-info">
                <span className="circle-member-name">{myName ?? 'You'}</span>
                <span className="circle-member-role">Owner</span>
              </div>
            </div>
            {members.map(m => (
              <div key={m.id} className="circle-member-row" onClick={() => setProfileUser(m)} style={{ cursor: 'pointer' }}>
                <div className="circle-member-avatar">
                  {m.avatar
                    ? <img src={m.avatar} alt={m.name} className="circle-member-img" />
                    : <span>{m.initials}</span>
                  }
                </div>
                <div className="circle-member-info">
                  <span className="circle-member-name">{m.name}</span>
                  <span className="circle-member-zodiac">{m.zodiac} Member</span>
                </div>
                <button className="circle-member-remove" onClick={e => { e.stopPropagation(); toggleMember(m.id) }} aria-label="Remove">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <line x1="3" y1="3" x2="11" y2="11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    <line x1="11" y1="3" x2="3" y2="11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Recent circle dreams ───────────────────────────── */}
      {circleDreams.length > 0 && (
        <>
          <div className="circle-divider" />
          <div className="circle-section">
            <span className="circle-section-title">Shared with Circle</span>
            <div className="circle-dreams-list">
              {circleDreams.slice(0, 5).map(d => (
                <div key={d.id} className="circle-dream-row">
                  <div className="circle-dream-dot" style={{ background: circle.color }} />
                  <span className="circle-dream-title">{d.title}</span>
                  <span className="circle-dream-tags">{d.tags.slice(0, 2).join(' · ')}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── Add people sheet ──────────────────────────────── */}
      {showAdd && (() => {
        const filtered = emailInput.trim()
          ? COMMUNITY_USERS.filter(u => u.name.toLowerCase().includes(emailInput.toLowerCase()))
          : COMMUNITY_USERS
        const newCount = pendingIds.filter(id => !circle.memberIds.includes(id)).length
        return (
          <>
            <div className="circle-sheet-scrim" onClick={() => setShowAdd(false)} />
            <div className="circle-sheet">
              <div className="circle-sheet-handle" />
              <p className="circle-sheet-title">Add to {circle.name}</p>

              {/* Email invite */}
              <div className="circle-email-invite-wrap">
                <div className="circle-email-row">
                  <input
                    className="circle-sheet-search"
                    type="email"
                    placeholder="Enter email to invite…"
                    value={emailInput}
                    onChange={e => { setEmailInput(e.target.value); setEmailError('') }}
                    onKeyDown={e => e.key === 'Enter' && handleEmailInvite()}
                    autoComplete="off"
                  />
                  <button className="circle-email-send-btn" onClick={handleEmailInvite}>Send</button>
                </div>
                {emailError && <p className="circle-email-error">{emailError}</p>}
                {invitations.length > 0 && (
                  <div className="circle-invitations-list">
                    {invitations.map(inv => {
                      const u = COMMUNITY_USERS.find(u => u.id === inv.userId)
                      return (
                        <div key={inv.userId} className="circle-inv-row">
                          <span className="circle-inv-name">{u?.name ?? inv.email}</span>
                          <span className={`circle-inv-status circle-inv-${inv.status}`}>{inv.status}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="circle-sheet-divider"><span>or browse</span></div>

              {filtered.length === 0 ? (
                <p className="circle-sheet-empty">No results found.</p>
              ) : (
                filtered.map(u => {
                  const isAdded = pendingIds.includes(u.id)
                  return (
                    <button key={u.id} className="circle-sheet-row" onClick={() => togglePending(u.id)}>
                      <div className="circle-member-avatar">
                        {u.avatar
                          ? <img src={u.avatar} alt={u.name} className="circle-member-img" />
                          : <span>{u.initials}</span>
                        }
                      </div>
                      <div className="circle-member-info">
                        <span className="circle-member-name">{u.name}</span>
                        <span className="circle-member-zodiac">{u.zodiac}</span>
                      </div>
                      <div className={`circle-sheet-toggle ${isAdded ? 'added' : ''}`}>
                        {isAdded ? (
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M2.5 7l3.5 3.5 5.5-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <line x1="7" y1="2" x2="7" y2="12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                            <line x1="2" y1="7" x2="12" y2="7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                          </svg>
                        )}
                      </div>
                    </button>
                  )
                })
              )}

              <div className="circle-sheet-footer">
                <button
                  className="circle-sheet-send-btn"
                  onClick={handleSendInvites}
                >
                  {newCount > 0 ? `Send Invites (${newCount})` : 'Done'}
                </button>
              </div>
            </div>
          </>
        )
      })()}

      {/* ── Member profile preview ───────────────────────── */}
      {profileUser && (
        <>
          <div className="circle-sheet-scrim" onClick={() => setProfileUser(null)} />
          <div className="circle-sheet circle-profile-sheet">
            <div className="circle-sheet-handle" />
            <div className="circle-profile-header">
              <div className="circle-profile-avatar">
                {profileUser.avatar
                  ? <img src={profileUser.avatar} alt={profileUser.name} className="circle-member-img" />
                  : <span>{profileUser.initials}</span>
                }
              </div>
              <div>
                <p className="circle-profile-name">{profileUser.name}</p>
                <p className="circle-profile-zodiac">{profileUser.zodiac} Dream Circle member</p>
              </div>
            </div>
            <div className="circle-profile-actions">
              <button
                className="circle-profile-action-btn circle-profile-follow"
                onClick={() => setProfileUser(null)}
              >
                Follow
              </button>
              {!circle.memberIds.includes(profileUser.id) ? (
                <button
                  className="circle-profile-action-btn circle-profile-add"
                  onClick={() => { toggleMember(profileUser.id); setProfileUser(null) }}
                >
                  Add to Circle
                </button>
              ) : (
                <button
                  className="circle-profile-action-btn circle-profile-remove-circle"
                  onClick={() => { toggleMember(profileUser.id); setProfileUser(null) }}
                >
                  Remove from Circle
                </button>
              )}
            </div>
          </div>
        </>
      )}

    </div>
  )
}
