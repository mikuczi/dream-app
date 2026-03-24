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

import type { Dream, FeedPost, DreamCircle, AIChatMessage, DreamPattern, DreamSymbol } from '../types/dream'
import {
  db, doc, setDoc, collection, query,
  getDocs, deleteDoc, onSnapshot, serverTimestamp, orderBy, where, limit,
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
  return onSnapshot(q, snap => {
    onUpdate(snap.docs.map(d => d.data() as Dream))
  })
}

// ── Feed (public / circle posts) ──────────────────────────

export async function saveFeedPost(post: FeedPost): Promise<void> {
  if (!db) return
  await setDoc(doc(db, 'feed', post.id), { ...post, _updatedAt: serverTimestamp() }, { merge: true })
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
