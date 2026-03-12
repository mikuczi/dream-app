import { useState, useCallback, useEffect } from 'react'
import type { Dream } from '../types/dream'
import {
  saveDream as fsSave,
  deleteDream as fsDelete,
  subscribeDreams,
} from '../lib/firestore'

const STORAGE_KEY = 'dream-journal-dreams'

function loadLocal(): Dream[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Dream[]
      if (Array.isArray(parsed)) return parsed
    }
  } catch { /* ignore */ }
  return []
}

function saveLocal(dreams: Dream[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dreams))
}

export function useDreams(uid?: string | null) {
  const [dreams, setDreams] = useState<Dream[]>(loadLocal)

  // ── Firestore real-time sync when signed in ──────────
  useEffect(() => {
    if (!uid) return
    const unsub = subscribeDreams(uid, remoteDreams => {
      setDreams(remoteDreams)
      saveLocal(remoteDreams) // keep local cache in sync
    })
    return unsub
  }, [uid])

  const addDream = useCallback((dream: Dream) => {
    setDreams(prev => {
      const updated = [dream, ...prev]
      saveLocal(updated)
      return updated
    })
    if (uid) fsSave(uid, dream).catch(console.error)
  }, [uid])

  const getDream = useCallback(
    (id: string): Dream | undefined => dreams.find(d => d.id === id),
    [dreams]
  )

  const updateDream = useCallback((id: string, partial: Partial<Dream>) => {
    setDreams(prev => {
      const updated = prev.map(d => d.id === id ? { ...d, ...partial } : d)
      saveLocal(updated)
      if (uid) {
        const full = updated.find(d => d.id === id)
        if (full) fsSave(uid, full).catch(console.error)
      }
      return updated
    })
  }, [uid])

  const deleteDream = useCallback((id: string) => {
    setDreams(prev => {
      const updated = prev.filter(d => d.id !== id)
      saveLocal(updated)
      return updated
    })
    if (uid) fsDelete(uid, id).catch(console.error)
  }, [uid])

  return { dreams, addDream, getDream, updateDream, deleteDream }
}
