import { useState } from 'react'
import './CollectionsScreen.css'
import type { Dream } from '../types/dream'

interface Props { dreams: Dream[] }

type Collection = { id: string; name: string; emoji: string; filter: (d: Dream) => boolean }

const BUILT_IN: Collection[] = [
  { id: 'lucid',     name: 'Lucid Dreams',    emoji: '✦', filter: d => d.lucid },
  { id: 'peaceful',  name: 'Peaceful',         emoji: '〜', filter: d => d.mood === 'peaceful' },
  { id: 'recurring', name: 'Recurring',        emoji: '↺', filter: d => d.recurring },
  { id: 'joyful',    name: 'Joyful',           emoji: '☀', filter: d => d.mood === 'joyful' },
  { id: 'anxious',   name: 'Anxious',          emoji: '⊘', filter: d => d.mood === 'anxious' },
  { id: 'scary',     name: 'Nightmares',       emoji: '◈', filter: d => d.mood === 'scary' },
]

export function CollectionsScreen({ dreams }: Props) {
  const [active, setActive] = useState<string | null>(null)

  const activeCol = BUILT_IN.find(c => c.id === active)
  const colDreams = activeCol ? dreams.filter(activeCol.filter) : []

  if (active && activeCol) {
    return (
      <div className="col-screen">
        <div className="col-topbar">
          <button className="col-back-btn" onClick={() => setActive(null)}>←</button>
          <h1 className="col-title">{activeCol.emoji} {activeCol.name}</h1>
          <p className="col-sub">{colDreams.length} dream{colDreams.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="col-scroll">
          {colDreams.length === 0 ? (
            <div className="col-empty">
              <p className="col-empty-text">No dreams in this collection yet.</p>
            </div>
          ) : (
            colDreams.map(d => (
              <div key={d.id} className="col-dream-row">
                <span className="col-dream-title">{d.title}</span>
                <span className="col-dream-date">
                  {new Date(d.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))
          )}
          <div style={{ height: 80 }} />
        </div>
      </div>
    )
  }

  return (
    <div className="col-screen">
      <div className="col-topbar">
        <h1 className="col-title">Collections</h1>
        <p className="col-sub">Curated dream groups</p>
      </div>
      <div className="col-scroll">
        <div className="col-grid">
          {BUILT_IN.map(col => {
            const count = dreams.filter(col.filter).length
            return (
              <button key={col.id} className="col-card" onClick={() => setActive(col.id)}>
                <span className="col-card-emoji">{col.emoji}</span>
                <span className="col-card-name">{col.name}</span>
                <span className="col-card-count">{count}</span>
              </button>
            )
          })}
        </div>
        <div style={{ height: 80 }} />
      </div>
    </div>
  )
}
