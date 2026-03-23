/**
 * Dream persistence — Firestore-backed.
 * Replaces the old JSON file store so dreams survive deploys and are per-user.
 */
import { randomUUID } from 'crypto'
import { db } from './firebase-admin.js'

const COLLECTION = 'dreams'

export async function createDream({ transcript, whatsappFrom, userId, analysisPromise }) {
  if (!db) throw new Error('Firestore not configured — set Firebase env vars')
  const dream = {
    id:           randomUUID(),
    title:        'WhatsApp Voice Note',
    content:      transcript,
    transcript,
    tags:         [],
    mood:         'strange',
    clarity:      5,
    lucid:        false,
    isPrivate:    false,
    source:       'whatsapp',
    whatsappFrom: whatsappFrom ?? null,
    userId:       userId ?? null,
    createdAt:    new Date().toISOString(),
    analysis:     null,
  }

  await db.collection(COLLECTION).doc(dream.id).set(dream)
  console.log(`[db] dream created id=${dream.id}`)

  // Patch the record once Claude analysis resolves (non-blocking)
  if (analysisPromise) {
    analysisPromise
      .then(analysis => db.collection(COLLECTION).doc(dream.id).update(analysis))
      .then(() => console.log(`[db] analysis patched for dream ${dream.id}`))
      .catch(err => console.error('[db] analysis error:', err))
  }

  return dream
}

export async function getAllDreams() {
  if (!db) return []
  const snap = await db.collection(COLLECTION).orderBy('createdAt', 'desc').get()
  return snap.docs.map(d => d.data())
}
