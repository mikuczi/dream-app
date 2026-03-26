// Firestore helpers
//
// Schema:
//   users/{uid}                      — User profile
//   users/{uid}/dreams/{dreamId}     — Dreams (private by default)
//   users/{uid}/circles/{circleId}   — Dream circles
//   users/{uid}/chatHistory/{msgId}  — AI chat messages
//   users/{uid}/patterns/{id}        — Recurring dream patterns
//   users/{uid}/symbols/{id}         — Recurring dream symbols
//   feed/{postId}                    — Denormalised public/circle posts

import type { Dream, FeedPost, DreamCircle, AIChatMessage, DreamPattern, DreamSymbol, Follow, AppNotification, CircleInvitation, CircleMembership, Comment } from '../types/dream'
import {
  db, doc, setDoc, collection, query,
  getDocs, deleteDoc, onSnapshot, serverTimestamp, orderBy, where, limit,
  getDoc, updateDoc, increment,
} from './firebase'
import type { Unsubscribe } from 'firebase/firestore'

// ── User profile ──────────────────────────────────────────

export async function saveUserProfile(uid: string, profile: Record<string, unknown>): Promise<void> {
  if (!db) return
  await setDoc(doc(db, 'users', uid), { ...profile, _updatedAt: serverTimestamp() }, { merge: true })
}

// ── Dreams ────────────────────────────────────────────────

function dreamsCol(uid: string) {
  if (!db) throw new Error('Firestore not initialised')
  return collection(db, 'users', uid, 'dreams')
}

export async function saveDream(uid: string, dream: Dream): Promise<void> {
  if (!db) return
  await setDoc(doc(db, 'users', uid, 'dreams', dream.id), { ...dream, _updatedAt: serverTimestamp() }, { merge: true })
}

export async function deleteDream(uid: string, dreamId: string): Promise<void> {
  if (!db) return
  await deleteDoc(doc(db, 'users', uid, 'dreams', dreamId))
}

export async function fetchAllDreams(uid: string): Promise<Dream[]> {
  if (!db) return []
  const q = query(dreamsCol(uid), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => d.data() as Dream)
}

export function subscribeDreams(uid: string, onUpdate: (dreams: Dream[]) => void): Unsubscribe {
  if (!db) return () => {}
  const q = query(dreamsCol(uid), orderBy('createdAt', 'desc'))
  return onSnapshot(q,
    snap => { onUpdate(snap.docs.map(d => d.data() as Dream)) },
    err  => { console.error('[subscribeDreams] Firestore error (check rules):', err.code, err.message) }
  )
}

// ── Feed (public / circle posts) ──────────────────────────

export async function saveFeedPost(post: FeedPost): Promise<void> {
  if (!db) return
  const storyExpiresAt = post.inStory
    ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    : undefined
  await setDoc(doc(db, 'feed', post.id), { ...post, storyExpiresAt, _updatedAt: serverTimestamp() }, { merge: true })
}

// NOTE: requires Firestore composite index on feed: (inStory ASC, storyExpiresAt ASC)
// Firestore will log an error with a direct link to create the index on first call.
export async function fetchActiveStories(count = 20): Promise<FeedPost[]> {
  if (!db) return []
  const q = query(
    collection(db, 'feed'),
    where('inStory', '==', true),
    where('storyExpiresAt', '>', new Date().toISOString()),
    orderBy('storyExpiresAt', 'desc'),
    limit(count),
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => d.data() as FeedPost)
}

export async function removeFeedPost(dreamId: string): Promise<void> {
  if (!db) return
  await deleteDoc(doc(db, 'feed', dreamId))
}

export async function fetchPublicFeed(count = 30): Promise<FeedPost[]> {
  if (!db) return []
  const q = query(
    collection(db, 'feed'),
    where('visibility', '==', 'public'),
    orderBy('createdAt', 'desc'),
    limit(count),
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => d.data() as FeedPost)
}

export function subscribePublicFeed(
  count = 30,
  onUpdate: (posts: FeedPost[]) => void,
): Unsubscribe {
  if (!db) return () => {}
  const q = query(
    collection(db, 'feed'),
    where('visibility', '==', 'public'),
    orderBy('createdAt', 'desc'),
    limit(count),
  )
  return onSnapshot(q,
    snap => { onUpdate(snap.docs.map(d => d.data() as FeedPost)) },
    err  => { console.error('[subscribePublicFeed] Firestore error (check rules):', err.code, err.message) }
  )
}

// Fetch circle posts from a set of member UIDs (including self)
export async function fetchCircleFeedByMemberIds(memberIds: string[], count = 30): Promise<FeedPost[]> {
  if (!db || memberIds.length === 0) return []
  // Firestore 'in' supports max 10 values
  const ids = memberIds.slice(0, 10)
  const q = query(
    collection(db, 'feed'),
    where('visibility', '==', 'circle'),
    where('authorId', 'in', ids),
    orderBy('createdAt', 'desc'),
    limit(count),
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => d.data() as FeedPost)
}

export async function fetchCircleFeed(circleId: string, count = 30): Promise<FeedPost[]> {
  if (!db) return []
  const q = query(
    collection(db, 'feed'),
    where('visibility', '==', 'circle'),
    where('circleId', '==', circleId),
    orderBy('createdAt', 'desc'),
    limit(count),
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => d.data() as FeedPost)
}

// ── Circles ───────────────────────────────────────────────

export async function saveCircle(uid: string, circle: DreamCircle): Promise<void> {
  if (!db) return
  await setDoc(doc(db, 'users', uid, 'circles', circle.id), { ...circle, _updatedAt: serverTimestamp() }, { merge: true })
}

export async function deleteCircle(uid: string, circleId: string): Promise<void> {
  if (!db) return
  await deleteDoc(doc(db, 'users', uid, 'circles', circleId))
}

export async function fetchCircles(uid: string): Promise<DreamCircle[]> {
  if (!db) return []
  const snap = await getDocs(collection(db, 'users', uid, 'circles'))
  return snap.docs.map(d => d.data() as DreamCircle)
}

// Each user has one primary circle stored at circles/default
export async function saveDefaultCircle(
  uid: string,
  circle: { name: string; color: string; memberIds: string[] },
): Promise<void> {
  if (!db) return
  await setDoc(doc(db, 'users', uid, 'circles', 'default'), { ...circle, _updatedAt: serverTimestamp() }, { merge: true })
}

export function subscribeDefaultCircle(
  uid: string,
  onUpdate: (circle: { name: string; color: string; memberIds: string[] }) => void,
): Unsubscribe {
  if (!db) return () => {}
  return onSnapshot(doc(db, 'users', uid, 'circles', 'default'), snap => {
    if (!snap.exists()) return
    const d = snap.data()
    onUpdate({ name: d.name ?? 'Inner Circle', color: d.color ?? '#9B8CFF', memberIds: d.memberIds ?? [] })
  })
}

// ── AI chat history ───────────────────────────────────────

export async function saveChatMessage(uid: string, msg: AIChatMessage): Promise<void> {
  if (!db) return
  await setDoc(doc(db, 'users', uid, 'chatHistory', msg.id), { ...msg, _updatedAt: serverTimestamp() }, { merge: true })
}

export async function fetchChatHistory(uid: string, count = 100): Promise<AIChatMessage[]> {
  if (!db) return []
  const q = query(collection(db, 'users', uid, 'chatHistory'), orderBy('createdAt', 'asc'), limit(count))
  const snap = await getDocs(q)
  return snap.docs.map(d => d.data() as AIChatMessage)
}

// ── Patterns ──────────────────────────────────────────────

export async function savePattern(uid: string, pattern: DreamPattern): Promise<void> {
  if (!db) return
  await setDoc(doc(db, 'users', uid, 'patterns', pattern.id), { ...pattern, _updatedAt: serverTimestamp() }, { merge: true })
}

export async function fetchPatterns(uid: string): Promise<DreamPattern[]> {
  if (!db) return []
  const snap = await getDocs(collection(db, 'users', uid, 'patterns'))
  return snap.docs.map(d => d.data() as DreamPattern)
}

// ── Symbols ───────────────────────────────────────────────

export async function saveSymbol(uid: string, symbol: DreamSymbol): Promise<void> {
  if (!db) return
  await setDoc(doc(db, 'users', uid, 'symbols', symbol.id), { ...symbol, _updatedAt: serverTimestamp() }, { merge: true })
}

export async function fetchSymbols(uid: string): Promise<DreamSymbol[]> {
  if (!db) return []
  const snap = await getDocs(collection(db, 'users', uid, 'symbols'))
  return snap.docs.map(d => d.data() as DreamSymbol)
}

// ── Follow graph ───────────────────────────────────────────
//   users/{uid}/following/{targetUid}  — who this user follows
//   users/{uid}/followers/{fromUid}    — who follows this user

export async function followUser(
  myUid: string,
  myName: string,
  target: { uid: string; name: string; username: string; photoURL?: string },
): Promise<void> {
  if (!db) return
  const now = new Date().toISOString()
  await setDoc(doc(db, 'users', myUid, 'following', target.uid), {
    targetUid: target.uid, targetName: target.name,
    targetUsername: target.username, targetPhoto: target.photoURL ?? null,
    createdAt: now, _updatedAt: serverTimestamp(),
  })
  await setDoc(doc(db, 'users', target.uid, 'followers', myUid), {
    followerUid: myUid, followerName: myName,
    createdAt: now, _updatedAt: serverTimestamp(),
  })
}

export async function unfollowUser(myUid: string, targetUid: string): Promise<void> {
  if (!db) return
  await Promise.all([
    deleteDoc(doc(db, 'users', myUid, 'following', targetUid)),
    deleteDoc(doc(db, 'users', targetUid, 'followers', myUid)),
  ])
}

export async function fetchFollowing(uid: string): Promise<Follow[]> {
  if (!db) return []
  const snap = await getDocs(collection(db, 'users', uid, 'following'))
  return snap.docs.map(d => d.data() as Follow)
}

export function subscribeFollowing(uid: string, onUpdate: (uids: string[]) => void): Unsubscribe {
  if (!db) return () => {}
  return onSnapshot(collection(db, 'users', uid, 'following'), snap => {
    onUpdate(snap.docs.map(d => d.id))
  })
}

// ── Comments subcollection ────────────────────────────────
//   feed/{postId}/comments/{commentId}

export async function addComment(postId: string, comment: Comment): Promise<void> {
  if (!db) return
  await setDoc(doc(db, 'feed', postId, 'comments', comment.id), {
    ...comment, _updatedAt: serverTimestamp(),
  })
  // Keep denormalized count in sync
  await updateDoc(doc(db, 'feed', postId), { commentCount: increment(1) }).catch(() => {})
}

export async function deleteComment(postId: string, commentId: string): Promise<void> {
  if (!db) return
  await deleteDoc(doc(db, 'feed', postId, 'comments', commentId))
  await updateDoc(doc(db, 'feed', postId), { commentCount: increment(-1) }).catch(() => {})
}

export function subscribeComments(postId: string, onUpdate: (comments: Comment[]) => void): Unsubscribe {
  if (!db) return () => {}
  const q = query(collection(db, 'feed', postId, 'comments'), orderBy('createdAt', 'asc'))
  return onSnapshot(q, snap => {
    onUpdate(snap.docs.map(d => d.data() as Comment))
  })
}

// ── Likes subcollection ───────────────────────────────────
//   feed/{postId}/likes/{uid}   (doc existence = liked)

export async function setLike(postId: string, uid: string, liked: boolean): Promise<void> {
  if (!db) return
  if (liked) {
    await setDoc(doc(db, 'feed', postId, 'likes', uid), {
      createdAt: new Date().toISOString(), _updatedAt: serverTimestamp(),
    })
  } else {
    await deleteDoc(doc(db, 'feed', postId, 'likes', uid))
  }
  // Keep denormalized count in sync
  await updateDoc(doc(db, 'feed', postId), { likeCount: increment(liked ? 1 : -1) }).catch(() => {})
}

export async function fetchIsLiked(postId: string, uid: string): Promise<boolean> {
  if (!db) return false
  const snap = await getDoc(doc(db, 'feed', postId, 'likes', uid))
  return snap.exists()
}

export async function fetchLikeCount(postId: string): Promise<number> {
  if (!db) return 0
  const snap = await getDocs(collection(db, 'feed', postId, 'likes'))
  return snap.size
}

// ── Notifications subcollection ───────────────────────────
//   users/{uid}/notifications/{notifId}

export async function createNotification(targetUid: string, notif: AppNotification): Promise<void> {
  if (!db) return
  await setDoc(doc(db, 'users', targetUid, 'notifications', notif.id), {
    ...notif, _updatedAt: serverTimestamp(),
  })
}

export function subscribeNotifications(uid: string, onUpdate: (notifs: AppNotification[]) => void): Unsubscribe {
  if (!db) return () => {}
  const q = query(
    collection(db, 'users', uid, 'notifications'),
    orderBy('createdAt', 'desc'),
    limit(50),
  )
  return onSnapshot(q, snap => {
    onUpdate(snap.docs.map(d => d.data() as AppNotification))
  })
}

export async function markAllNotificationsRead(uid: string): Promise<void> {
  if (!db) return
  const snap = await getDocs(collection(db, 'users', uid, 'notifications'))
  const unread = snap.docs.filter(d => !d.data().read)
  await Promise.all(unread.map(d => updateDoc(d.ref, { read: true })))
}

export async function clearNotificationsCollection(uid: string): Promise<void> {
  if (!db) return
  const snap = await getDocs(collection(db, 'users', uid, 'notifications'))
  await Promise.all(snap.docs.map(d => deleteDoc(d.ref)))
}

// ── Email whitelist ───────────────────────────────────────
// Create a Firestore document at config/whitelist with field:
//   emails: ["user@example.com", ...]
// If the document doesn't exist or emails is empty, ALL users are allowed.

export async function checkWhitelisted(email: string): Promise<boolean> {
  if (!db) return true // if Firestore not configured, allow everyone
  try {
    const snap = await getDoc(doc(db, 'config', 'whitelist'))
    if (!snap.exists()) return true // no whitelist configured → open access
    const data = snap.data()
    const emails: string[] = data.emails ?? []
    if (emails.length === 0) return true // empty list → open access
    return emails.map(e => e.toLowerCase().trim()).includes(email.toLowerCase().trim())
  } catch {
    return true // on error (e.g. rules not set), allow to avoid lockouts
  }
}

// ── User discovery ────────────────────────────────────────
// Requires Firestore indexes on email and username fields

export async function lookupUserByEmail(
  email: string,
): Promise<{ uid: string; name: string; username: string; photoURL?: string } | null> {
  if (!db) return null
  // NOTE: requires a single-field index on users.email (created automatically by Firestore)
  // If this throws a permission error, check your Firestore security rules to allow
  // authenticated users to query the users collection.
  const normalized = email.toLowerCase().trim()
  console.log('[lookup] searching email:', normalized)
  const q = query(collection(db, 'users'), where('email', '==', normalized), limit(1))
  const snap = await getDocs(q)
  console.log('[lookup] result count:', snap.size, snap.docs.map(d => d.id))
  if (snap.empty) return null
  const d = snap.docs[0]
  return { uid: d.id, name: d.data().name, username: d.data().username ?? '', photoURL: d.data().photoURL }
}

export async function lookupUserByUsername(
  username: string,
): Promise<{ uid: string; name: string; username: string; photoURL?: string } | null> {
  if (!db) return null
  const q = query(collection(db, 'users'), where('username', '==', username), limit(1))
  const snap = await getDocs(q)
  if (snap.empty) return null
  const d = snap.docs[0]
  return { uid: d.id, name: d.data().name, username: d.data().username ?? '', photoURL: d.data().photoURL }
}

export async function fetchPublicProfile(
  uid: string,
): Promise<{ name: string; username: string; photoURL?: string; zodiacSign?: string } | null> {
  if (!db) return null
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return null
  const d = snap.data()
  return { name: d.name, username: d.username ?? '', photoURL: d.photoURL, zodiacSign: d.zodiacSign }
}

// ── Circle invitations ────────────────────────────────────
//   users/{toUid}/invitations/{inviteId}

export async function sendCircleInvitation(toUid: string, invitation: CircleInvitation): Promise<void> {
  if (!db) return
  await setDoc(doc(db, 'users', toUid, 'invitations', invitation.id), {
    ...invitation, _updatedAt: serverTimestamp(),
  })
}

export async function respondToInvitation(
  uid: string,
  inviteId: string,
  status: 'accepted' | 'rejected',
): Promise<void> {
  if (!db) return
  await updateDoc(doc(db, 'users', uid, 'invitations', inviteId), {
    status, _updatedAt: serverTimestamp(),
  })
}

export function subscribeInvitations(
  uid: string,
  onUpdate: (invitations: CircleInvitation[]) => void,
): Unsubscribe {
  if (!db) return () => {}
  const q = query(collection(db, 'users', uid, 'invitations'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, snap => {
    onUpdate(snap.docs.map(d => d.data() as CircleInvitation))
  })
}

// ── Circle memberships (reverse-index) ───────────────────
//   users/{uid}/circleMemberships/{circleId}

export async function addCircleMembership(uid: string, membership: CircleMembership): Promise<void> {
  if (!db) return
  await setDoc(doc(db, 'users', uid, 'circleMemberships', membership.circleId), {
    ...membership, _updatedAt: serverTimestamp(),
  })
}

export async function removeCircleMembership(uid: string, circleId: string): Promise<void> {
  if (!db) return
  await deleteDoc(doc(db, 'users', uid, 'circleMemberships', circleId))
}

export async function fetchCircleMemberships(uid: string): Promise<CircleMembership[]> {
  if (!db) return []
  const snap = await getDocs(collection(db, 'users', uid, 'circleMemberships'))
  return snap.docs.map(d => d.data() as CircleMembership)
}

// ── FCM tokens ────────────────────────────────────────────
//   users/{uid}/fcmTokens/{token}

export async function saveFcmToken(uid: string, token: string): Promise<void> {
  if (!db) return
  await setDoc(doc(db, 'users', uid, 'fcmTokens', token), {
    token,
    createdAt: new Date().toISOString(),
    _updatedAt: serverTimestamp(),
  })
}

// ── Personalized feed ─────────────────────────────────────
// Queries feed/ where authorId is in the list of followed UIDs.
// Firestore 'in' supports up to 30 values per query.
// NOTE: requires Firestore composite index on feed: (authorId ASC, createdAt DESC)

export async function fetchFollowingFeed(followingUids: string[], count = 30): Promise<FeedPost[]> {
  if (!db || followingUids.length === 0) return []
  const batch = followingUids.slice(0, 30)
  const q = query(
    collection(db, 'feed'),
    where('authorId', 'in', batch),
    orderBy('createdAt', 'desc'),
    limit(count),
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => d.data() as FeedPost)
}
