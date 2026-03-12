// Firestore helpers — dreams CRUD for a signed-in user
import type { Dream } from '../types/dream'
import {
  db, doc, setDoc, collection, query,
  getDocs, deleteDoc, onSnapshot, serverTimestamp, orderBy,
} from './firebase'
import type { Unsubscribe } from 'firebase/firestore'

function dreamsCol(uid: string) {
  if (!db) throw new Error('Firestore not initialised')
  return collection(db, 'users', uid, 'dreams')
}

export async function saveDream(uid: string, dream: Dream): Promise<void> {
  if (!db) return
  const ref = doc(db, 'users', uid, 'dreams', dream.id)
  await setDoc(ref, { ...dream, _updatedAt: serverTimestamp() }, { merge: true })
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

export async function saveUserProfile(uid: string, profile: Record<string, unknown>): Promise<void> {
  if (!db) return
  await setDoc(doc(db, 'users', uid), { ...profile, _updatedAt: serverTimestamp() }, { merge: true })
}
