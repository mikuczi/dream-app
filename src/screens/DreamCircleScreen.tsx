import { useState, useEffect } from 'react'
import './DreamCircleScreen.css'
import type { Dream, CircleInvitation, CircleMembership } from '../types/dream'
import { lookupUserByEmail, sendCircleInvitation, subscribeInvitations, respondToInvitation, addCircleMembership, createNotification, fetchPublicProfile } from '../lib/firestore'
import type { AppNotification } from '../types/dream'

export interface DreamCircle {
  name: string
  color: string
  memberIds: string[]
}

type InviteStatus = 'pending' | 'accepted' | 'rejected'
interface Invitation { userId: string; email: string; status: InviteStatus }
interface MemberProfile { uid: string; name: string; photoURL?: string; zodiacSign?: string }

interface DreamCircleScreenProps {
  circle: DreamCircle
  dreams: Dream[]
  myName?: string
  currentUid?: string
  currentName?: string
  onFollowUser?: (uid: string, name: string) => void
  onUpdate: (circle: DreamCircle) => void
  onBack: () => void
}

const CIRCLE_COLORS = [
  '#9B8CFF', '#7bb3f4', '#c97bf4', '#f4c97b', '#7bf4c4',
]

export function DreamCircleScreen({ circle, dreams, myName, currentUid, currentName, onUpdate, onBack }: DreamCircleScreenProps) {
  const [editingName,   setEditingName]   = useState(false)
  const [nameVal,       setNameVal]       = useState(circle.name)
  const [showAdd,       setShowAdd]       = useState(false)
  const [showColors,    setShowColors]    = useState(false)
  const [emailInput,      setEmailInput]      = useState('')
  const [emailError,      setEmailError]      = useState('')
  const [invitations,     setInvitations]     = useState<Invitation[]>([])
  const [receivedInvites, setReceivedInvites] = useState<CircleInvitation[]>([])
  const [memberProfiles,  setMemberProfiles]  = useState<MemberProfile[]>([])
  const [inviteEmail,     setInviteEmail]     = useState<string | null>(null)

  useEffect(() => {
    if (!currentUid) return
    return subscribeInvitations(currentUid, invites => {
      setReceivedInvites(invites.filter(i => i.status === 'pending'))
    })
  }, [currentUid])

  // Fetch real Firestore profiles for circle members
  useEffect(() => {
    if (circle.memberIds.length === 0) { setMemberProfiles([]); return }
    Promise.all(circle.memberIds.map(uid => fetchPublicProfile(uid).then(p => p ? { uid, ...p } : { uid, name: uid.slice(0, 8) })))
      .then(profiles => setMemberProfiles(profiles as MemberProfile[]))
      .catch(() => {})
  }, [circle.memberIds.join(',')]) // eslint-disable-line react-hooks/exhaustive-deps

  const circleDreams = dreams.filter(d => d.visibility === 'circle')

  function openAddSheet() {
    setEmailInput('')
    setEmailError('')
    setInviteEmail(null)
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

  async function handleEmailInvite() {
    const email = emailInput.trim().toLowerCase()
    setEmailError('')
    setInviteEmail(null)
    if (!email) return

    // Firestore lookup for real users
    let fsUser: { uid: string; name: string; username: string; photoURL?: string } | null = null
    try {
      fsUser = await lookupUserByEmail(email)
    } catch (err) {
      console.error('[invite] Firestore lookup error:', err)
      setEmailError('Lookup failed — check your connection and try again')
      return
    }

    if (!fsUser) {
      setInviteEmail(email)
      return
    }
    if (fsUser.uid === currentUid) {
      setEmailError("That's your own account!")
      return
    }
    const already = invitations.find(i => i.userId === fsUser!.uid)
    if (already) {
      setEmailError(already.status === 'pending' ? 'Invitation already sent' : 'Already responded')
      return
    }

    if (currentUid) {
      const inviteId = `inv_${currentUid}_${Date.now()}`
      const invite: CircleInvitation = {
        id: inviteId,
        fromUid: currentUid,
        fromName: currentName ?? 'Someone',
        circleId: `${currentUid}_default`,
        circleName: circle.name,
        status: 'pending',
        createdAt: new Date().toISOString(),
      }
      // Write invitation doc to recipient's subcollection
      sendCircleInvitation(fsUser.uid, invite).catch(err => console.error('[invite] send error:', err))
      // Also create a bell notification so they see it immediately
      const notif: AppNotification = {
        id: `circle_invite_${inviteId}`,
        type: 'circle_invite',
        fromUserId: currentUid,
        fromUserName: currentName ?? 'Someone',
        circleId: invite.circleId,
        circleName: circle.name,
        read: false,
        createdAt: invite.createdAt,
      }
      createNotification(fsUser.uid, notif).catch(err => console.error('[invite] notif error:', err))
    }
    setInvitations(prev => [...prev, { userId: fsUser!.uid, email, status: 'pending' }])
    setEmailInput('')
  }

  async function handleInviteResponse(invite: CircleInvitation, accepted: boolean) {
    if (!currentUid) return
    setReceivedInvites(prev => prev.filter(i => i.id !== invite.id))
    await respondToInvitation(currentUid, invite.id, accepted ? 'accepted' : 'rejected').catch(() => {})
    if (accepted) {
      const membership: CircleMembership = {
        circleId: invite.circleId,
        circleName: invite.circleName,
        ownerUid: invite.fromUid,
        ownerName: invite.fromName,
        color: '#9B8CFF',
        joinedAt: new Date().toISOString(),
      }
      addCircleMembership(currentUid, membership).catch(() => {})
    }
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
            <span className="circle-stat-val">{memberProfiles.length}</span>
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

      {/* ── Received invitations ─────────────────────────── */}
      {receivedInvites.length > 0 && (
        <div className="circle-section">
          <div className="circle-section-header">
            <span className="circle-section-title">Circle Invitations</span>
            <span className="circle-invite-badge">{receivedInvites.length}</span>
          </div>
          <div className="circle-received-list">
            {receivedInvites.map(inv => (
              <div key={inv.id} className="circle-received-row">
                <div className="circle-received-info">
                  <span className="circle-received-from">{inv.fromName}</span>
                  <span className="circle-received-name">invited you to <em>{inv.circleName}</em></span>
                </div>
                <div className="circle-received-actions">
                  <button className="circle-received-accept" onClick={() => handleInviteResponse(inv, true)}>Accept</button>
                  <button className="circle-received-reject" onClick={() => handleInviteResponse(inv, false)}>Decline</button>
                </div>
              </div>
            ))}
          </div>
          <div className="circle-divider" />
        </div>
      )}

      {/* ── Members ───────────────────────────────────────── */}
      <div className="circle-section">
        <div className="circle-section-header">
          <span className="circle-section-title">Members</span>
          <button className="circle-add-btn" onClick={openAddSheet}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <line x1="6" y1="1" x2="6" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="1" y1="6" x2="11" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Add people
          </button>
        </div>

        {memberProfiles.length === 0 ? (
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
            {memberProfiles.map(m => {
              const initials = m.name.slice(0, 2).toUpperCase()
              return (
                <div key={m.uid} className="circle-member-row">
                  <div className="circle-member-avatar">
                    {m.photoURL
                      ? <img src={m.photoURL} alt={m.name} className="circle-member-img" />
                      : <span>{initials}</span>
                    }
                  </div>
                  <div className="circle-member-info">
                    <span className="circle-member-name">{m.name}</span>
                    <span className="circle-member-zodiac">{m.zodiacSign ?? ''} Member</span>
                  </div>
                  <button className="circle-member-remove" onClick={e => { e.stopPropagation(); toggleMember(m.uid) }} aria-label="Remove">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <line x1="3" y1="3" x2="11" y2="11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                      <line x1="11" y1="3" x2="3" y2="11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              )
            })}
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
      {showAdd && (
        <>
          <div className="circle-sheet-scrim" onClick={() => setShowAdd(false)} />
          <div className="circle-sheet">
            <div className="circle-sheet-handle" />
            <p className="circle-sheet-title">Add to {circle.name}</p>

            <div className="circle-email-invite-wrap">
              <div className="circle-email-row">
                <input
                  className="circle-sheet-search"
                  type="email"
                  placeholder="Enter email to invite…"
                  value={emailInput}
                  onChange={e => { setEmailInput(e.target.value); setEmailError(''); setInviteEmail(null) }}
                  onKeyDown={e => e.key === 'Enter' && handleEmailInvite()}
                  autoComplete="off"
                />
                <button className="circle-email-send-btn" onClick={handleEmailInvite}>Invite</button>
              </div>
              {emailError && <p className="circle-email-error">{emailError}</p>}
              {inviteEmail && (
                <div className="circle-invite-notfound">
                  <p className="circle-email-error">No account found for {inviteEmail}.</p>
                  <a
                    className="circle-invite-app-btn"
                    href={`mailto:${inviteEmail}?subject=Join me on Reverie&body=Hey! I've been using Reverie to record and share my dreams. Come join me — download it at https://speakwithdreams.vercel.app`}
                  >
                    Send app invite to {inviteEmail}
                  </a>
                </div>
              )}
              {invitations.length > 0 && (
                <div className="circle-invitations-list">
                  {invitations.map(inv => (
                    <div key={inv.userId} className="circle-inv-row">
                      <span className="circle-inv-name">{inv.email}</span>
                      <span className={`circle-inv-status circle-inv-${inv.status}`}>{inv.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="circle-sheet-footer">
              <button className="circle-sheet-send-btn" onClick={() => setShowAdd(false)}>Done</button>
            </div>
          </div>
        </>
      )}


    </div>
  )
}
