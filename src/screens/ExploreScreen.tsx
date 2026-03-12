import { useState } from 'react'
import './ExploreScreen.css'
import { DREAM_SYMBOLS } from '../data/symbols'
import type { DreamSymbol } from '../data/symbols'

const CATS: Array<{ id: DreamSymbol['category'] | 'all'; label: string }> = [
  { id: 'all',      label: 'All'       },
  { id: 'element',  label: 'Elements'  },
  { id: 'action',   label: 'Actions'   },
  { id: 'place',    label: 'Places'    },
  { id: 'creature', label: 'Creatures' },
  { id: 'object',   label: 'Objects'   },
]

export function ExploreScreen() {
  const [cat, setCat]         = useState<DreamSymbol['category'] | 'all'>('all')
  const [expanded, setExp]    = useState<string | null>(null)

  const symbols = cat === 'all' ? DREAM_SYMBOLS : DREAM_SYMBOLS.filter(s => s.category === cat)

  return (
    <div className="explore-screen">
      <div className="explore-header">
        <h1 className="explore-title">Explore</h1>
        <p className="explore-sub">Dream symbols &amp; meanings</p>
      </div>

      <div className="explore-scroll">
        {/* Filter chips */}
        <div className="explore-filters">
          {CATS.map(c => (
            <button
              key={c.id}
              className={`explore-filter ${cat === c.id ? 'active' : ''}`}
              onClick={() => setCat(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Symbol list */}
        <div className="explore-list">
          {symbols.map(sym => {
            const open = expanded === sym.id
            return (
              <button
                key={sym.id}
                className={`explore-card ${open ? 'open' : ''}`}
                onClick={() => setExp(open ? null : sym.id)}
              >
                <div className="explore-card-row">
                  <span className="explore-card-name">{sym.name}</span>
                  <span className="explore-card-cat">{sym.category}</span>
                  <span className="explore-card-toggle">{open ? '−' : '+'}</span>
                </div>
                <p className="explore-card-preview">{sym.meaning.split('.')[0]}.</p>
                {open && (
                  <div className="explore-card-expanded">
                    <p className="explore-card-full">{sym.meaning}</p>
                    <div className="explore-card-jung">
                      <span className="explore-card-jung-label">Jung</span>
                      <p className="explore-card-jung-text">{sym.jungian}</p>
                    </div>
                  </div>
                )}
              </button>
            )
          })}
        </div>

        <div style={{ height: 32 }} />
      </div>
    </div>
  )
}
