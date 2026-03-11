import { useState, useCallback } from 'react'
import type { Dream } from '../types/dream'

const STORAGE_KEY = 'dream-journal-dreams'

function loadDreams(): Dream[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Dream[]
      if (Array.isArray(parsed)) return parsed
    }
  } catch { /* ignore */ }
  return []
}

function saveDreams(dreams: Dream[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dreams))
}

export function useDreams() {
  const [dreams, setDreams] = useState<Dream[]>(loadDreams)

  const addDream = useCallback((dream: Dream) => {
    setDreams((prev) => {
      const updated = [dream, ...prev]
      saveDreams(updated)
      return updated
    })
  }, [])

  const getDream = useCallback(
    (id: string): Dream | undefined => dreams.find((d) => d.id === id),
    [dreams]
  )

  const updateDream = useCallback((id: string, partial: Partial<Dream>) => {
    setDreams((prev) => {
      const updated = prev.map((d) => d.id === id ? { ...d, ...partial } : d)
      saveDreams(updated)
      return updated
    })
  }, [])

  const deleteDream = useCallback((id: string) => {
    setDreams((prev) => {
      const updated = prev.filter((d) => d.id !== id)
      saveDreams(updated)
      return updated
    })
  }, [])

  return { dreams, addDream, getDream, updateDream, deleteDream }
}
