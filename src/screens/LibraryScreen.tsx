import { useState } from 'react'
import './LibraryScreen.css'

type Article = { id: string; title: string; category: string; summary: string; readTime: number }

const ARTICLES: Article[] = [
  { id: '1', title: 'Sigmund Freud & The Unconscious', category: 'Freudian', summary: 'Freud believed dreams were the "royal road to the unconscious" — a window into repressed desires and unresolved conflicts.', readTime: 4 },
  { id: '2', title: 'Carl Jung & the Collective Unconscious', category: 'Jungian', summary: 'Jung proposed that dreams draw from a shared human reservoir of archetypes: the Shadow, the Anima, the Self, and more.', readTime: 5 },
  { id: '3', title: 'Lucid Dreaming: A Practical Guide', category: 'Techniques', summary: 'Lucid dreaming is the art of becoming aware you are dreaming while the dream continues. Reality checks and MILD technique are the entry points.', readTime: 6 },
  { id: '4', title: 'The MILD Technique', category: 'Techniques', summary: 'Mnemonic Induction of Lucid Dreams (MILD) uses prospective memory: before sleep, repeat "I will realise I am dreaming."', readTime: 3 },
  { id: '5', title: 'Dream Archetypes Explained', category: 'Jungian', summary: 'The Hero, the Trickster, the Great Mother — archetypal figures that appear across cultures in myths and dreams.', readTime: 5 },
  { id: '6', title: 'REM Sleep & Dream Biology', category: 'Science', summary: 'Most vivid dreams occur during Rapid Eye Movement sleep. The brain is nearly as active as waking, but the body is paralysed.', readTime: 4 },
  { id: '7', title: 'Recurring Dreams & What They Mean', category: 'Symbols', summary: 'Dreams that repeat often signal unresolved emotional material. The story changes when the waking situation resolves.', readTime: 3 },
  { id: '8', title: 'Water as Dream Symbol', category: 'Symbols', summary: 'Across cultures, water represents the unconscious, emotion, purification, and transition. The body of water matters — ocean vs puddle.', readTime: 3 },
]

const CATEGORIES = ['All', 'Jungian', 'Freudian', 'Techniques', 'Science', 'Symbols']

export function LibraryScreen() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [expanded, setExpanded] = useState<string | null>(null)

  const filtered = activeCategory === 'All' ? ARTICLES : ARTICLES.filter(a => a.category === activeCategory)

  return (
    <div className="library-screen">
      <div className="library-topbar">
        <h1 className="library-title">Library</h1>
        <p className="library-sub">Dream knowledge & theory</p>
      </div>

      <div className="library-filters">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`library-filter ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="library-scroll">
        {filtered.map(article => {
          const isOpen = expanded === article.id
          return (
            <div key={article.id} className={`library-card ${isOpen ? 'open' : ''}`}>
              <button className="library-card-header" onClick={() => setExpanded(isOpen ? null : article.id)}>
                <div className="library-card-meta">
                  <span className="library-card-cat">{article.category}</span>
                  <span className="library-card-time">{article.readTime} min</span>
                </div>
                <h3 className="library-card-title">{article.title}</h3>
              </button>
              {isOpen && (
                <div className="library-card-body">
                  <p className="library-card-text">{article.summary}</p>
                </div>
              )}
            </div>
          )
        })}
        <div style={{ height: 80 }} />
      </div>
    </div>
  )
}
