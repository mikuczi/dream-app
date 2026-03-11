/**
 * Simple JSON file-backed dream database.
 * Mirrors the localStorage schema used by the frontend.
 */
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { randomUUID } from 'crypto'

const __dir = dirname(fileURLToPath(import.meta.url))
const DB_PATH = join(__dir, 'dreams.json')

function load() {
  if (!existsSync(DB_PATH)) return []
  try { return JSON.parse(readFileSync(DB_PATH, 'utf-8')) } catch { return [] }
}

function save(dreams) {
  writeFileSync(DB_PATH, JSON.stringify(dreams, null, 2))
}

export function createDream({ transcript, whatsappFrom, analysisPromise }) {
  const dreams = load()
  const dream = {
    id:         randomUUID(),
    title:      'WhatsApp Voice Note',
    content:    transcript,
    transcript,
    tags:       [],
    mood:       'strange',
    clarity:    5,
    lucid:      false,
    isPrivate:  false,
    source:     'whatsapp',
    whatsappFrom,
    createdAt:  new Date().toISOString(),
    analysis:   null,   // filled in async
  }
  dreams.unshift(dream)
  save(dreams)

  // Resolve AI analysis in background and patch the record
  if (analysisPromise) {
    analysisPromise.then(analysis => {
      const all = load()
      const idx = all.findIndex(d => d.id === dream.id)
      if (idx !== -1) {
        all[idx] = { ...all[idx], ...analysis }
        save(all)
        console.log(`[db] analysis saved for dream ${dream.id}`)
      }
    }).catch(err => console.error('[db] analysis error:', err))
  }

  return dream
}

export function getAllDreams() {
  return load()
}
