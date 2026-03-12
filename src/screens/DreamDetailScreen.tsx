import { useState } from 'react'
import './DreamDetailScreen.css'
import type { Dream, DreamMood, DreamInterpretation } from '../types/dream'
import { DREAM_SYMBOLS } from '../data/symbols'

interface DreamDetailScreenProps {
  dream: Dream
  onBack: () => void
  onTogglePrivacy: (id: string) => void
  onDelete: (id: string) => void
  onBookmark?: (id: string) => void
}

type DreamTab = 'dream' | 'interpretations' | 'tags' | 'map'

const MOOD_SYMBOLS: Record<DreamMood, string> = {
  peaceful: '〜', joyful: '✦', anxious: '⊘', scary: '◈', strange: '∿',
}

const FRAMEWORKS: DreamInterpretation['framework'][] = [
  'jungian', 'freudian', 'symbolic',
]

const FRAMEWORK_LABELS: Record<DreamInterpretation['framework'], string> = {
  jungian:        'Jungian',
  freudian:       'Freudian',
  symbolic:       'Symbolic',
  narrative:      'Narrative',
  psychological:  'Psychological',
}

// Gradient artworks per mood — high contrast dark backgrounds
const MOOD_ARTWORK: Record<DreamMood, string> = {
  peaceful:  'radial-gradient(ellipse at 40% 30%, #0d1a0e 0%, #050d06 50%, #020502 100%)',
  joyful:    'radial-gradient(ellipse at 60% 40%, #1a1020 0%, #0d0810 50%, #030205 100%)',
  anxious:   'radial-gradient(ellipse at 50% 50%, #1a1010 0%, #100808 50%, #050202 100%)',
  scary:     'radial-gradient(ellipse at 50% 20%, #120808 0%, #090404 50%, #020101 100%)',
  strange:   'radial-gradient(ellipse at 30% 60%, #0a0a1a 0%, #060610 50%, #020204 100%)',
}

// Placeholder AI interpretation text
function generateInterpText(dream: Dream, framework: DreamInterpretation['framework']): string {
  const tags = dream.tags.slice(0, 2).join(' and ')
  const mood = dream.mood
  switch (framework) {
    case 'jungian':
      return `From a Jungian perspective, the presence of ${tags || 'these motifs'} suggests an encounter with archetypal forces from the collective unconscious. The ${mood} tone of the dream may indicate the ego's relationship with the shadow — aspects of the self that remain unintegrated. This dream invites deeper self-examination and dialogue with the inner world.`
    case 'freudian':
      return `In Freudian analysis, the imagery of ${tags || 'these elements'} may represent unconscious desires or unresolved tensions from early experiences. The ${mood} quality of the dream could reflect the interplay between the id's impulses and the superego's constraints, with the ego mediating through symbolic displacement.`
    case 'symbolic':
      return `Symbolically, ${tags || 'the central images'} carry deep archetypal weight across cultures. The ${mood} atmosphere suggests a threshold experience — the dreamer standing between two states of being. Pay attention to recurring symbols as they often form a personal mythology unique to you.`
    default:
      return `This dream reflects a meaningful inner narrative. The ${mood} quality and the presence of ${tags || 'key elements'} point toward themes your psyche is actively processing during this period.`
  }
}

function formatDateShort(isoString: string): string {
  const date = new Date(isoString)
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
}

export function DreamDetailScreen({ dream, onBack, onTogglePrivacy, onDelete, onBookmark }: DreamDetailScreenProps) {
  const [tab,           setTab]           = useState<DreamTab>('dream')
  const [interpretations, setInterpretations] = useState<DreamInterpretation[]>(dream.interpretations ?? [])
  const [interpreting,  setInterpreting]  = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [commentText,   setCommentText]   = useState('')
  const [localComments, setLocalComments] = useState(dream.comments ?? [])
  const [notes,         setNotes]         = useState(dream.notes ?? '')
  const [showMenu,      setShowMenu]      = useState(false)
  const [storyShared,   setStoryShared]   = useState(false)

  const transcriptLower = dream.transcript.toLowerCase()
  const matchedSymbols  = DREAM_SYMBOLS.filter(sym => {
    const tagMatch      = dream.tags.some(t => sym.relatedTags.some(rt => rt === t || t.includes(rt) || rt.includes(t)))
    const transcriptMatch = sym.relatedTags.some(rt => transcriptLower.includes(rt))
    return tagMatch || transcriptMatch
  }).slice(0, 6)

  // People/character entities from tags
  const characterTags = dream.tags.filter(t =>
    ['family', 'people', 'mother', 'father', 'sister', 'brother', 'friend', 'stranger', 'child', 'baby'].some(k => t.toLowerCase().includes(k))
  )

  async function handleInterpret() {
    if (interpretations.length > 0) return
    setInterpreting(true)
    // Simulate async AI call
    await new Promise(r => setTimeout(r, 1400))
    const newInterpretations: DreamInterpretation[] = FRAMEWORKS.map((fw) => ({
      id: `${dream.id}-${fw}`,
      framework: fw,
      text: generateInterpText(dream, fw),
      createdAt: new Date().toISOString(),
    }))
    setInterpretations(newInterpretations)
    setInterpreting(false)
  }

  function handleAddComment() {
    const trimmed = commentText.trim()
    if (!trimmed) return
    setLocalComments(prev => [...prev, {
      id: Date.now().toString(),
      userId: 'me',
      userName: 'You',
      text: trimmed,
      createdAt: new Date().toISOString(),
    }])
    setCommentText('')
  }

  const artwork = dream.artwork ?? MOOD_ARTWORK[dream.mood]

  return (
    <div className="dd-screen">

      {/* ── Header ──────────────────────────────────────── */}
      <div className="dd-header">
        <button className="dd-back" onClick={onBack} aria-label="Back">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 4L6 10l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className="dd-header-center">
          <div className="dd-header-avatar">{dream.mood === 'peaceful' ? '〜' : MOOD_SYMBOLS[dream.mood]}</div>
          <span className="dd-header-label">Dream</span>
        </div>

        <button className="dd-options" onClick={() => setShowMenu(v => !v)}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <circle cx="4"  cy="10" r="1.5"/>
            <circle cx="10" cy="10" r="1.5"/>
            <circle cx="16" cy="10" r="1.5"/>
          </svg>
        </button>
      </div>

      {/* Options menu */}
      {showMenu && (
        <>
          <div className="dd-menu-scrim" onClick={() => setShowMenu(false)} />
          <div className="dd-menu">
            <button className="dd-menu-item" onClick={() => { setShowMenu(false); setStoryShared(true); setTimeout(() => setStoryShared(false), 2500) }}>
              ◈ Share to my story
            </button>
            <button className="dd-menu-item" onClick={() => { onBookmark?.(dream.id); setShowMenu(false) }}>
              {dream.bookmarked ? '◆ Remove bookmark' : '◇ Bookmark dream'}
            </button>
            <button className="dd-menu-item" onClick={() => { onTogglePrivacy(dream.id); setShowMenu(false) }}>
              {dream.isPrivate ? '◯ Make public' : '◎ Make private'}
            </button>
          </div>
        </>
      )}

      {/* ── Artwork ─────────────────────────────────────── */}
      <div className="dd-artwork" style={{ background: artwork }}>
        <div className="dd-artwork-overlay" />
      </div>

      {/* ── Scrollable body ─────────────────────────────── */}
      <div className="dd-scroll">
      <div className="dd-scroll-card">

        {/* Title + date */}
        <div className="dd-title-section">
          <h1 className="dd-title">{dream.title.toUpperCase()}</h1>
          <p className="dd-date">{formatDateShort(dream.createdAt)}</p>
        </div>

        {/* ── Tab bar ─────────────────────────────────── */}
        <div className="dd-tabs">
          {(['dream', 'interpretations', 'tags', 'map'] as DreamTab[]).map(t => (
            <button
              key={t}
              className={`dd-tab ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="dd-tab-line" />

        {/* ── DREAM tab ───────────────────────────────── */}
        {tab === 'dream' && (
          <div className="dd-tab-content">
            <p className="dd-transcript">{dream.transcript}</p>

            {/* Notes */}
            <div className="dd-notes-section">
              <p className="dd-notes-label">NOTES</p>
              <textarea
                className="dd-notes-input"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Add personal notes…"
                rows={3}
              />
            </div>

            {/* Meta strip */}
            <div className="dd-meta-strip">
              <div className="dd-meta-item">
                <span className="dd-meta-val">{MOOD_SYMBOLS[dream.mood]}</span>
                <span className="dd-meta-key">{dream.mood}</span>
              </div>
              <div className="dd-meta-item">
                <span className="dd-meta-val">{dream.lucid ? 'Lucid' : 'Non-lucid'}</span>
                <span className="dd-meta-key">state</span>
              </div>
              <div className="dd-meta-item">
                <span className="dd-meta-val">{dream.clarity}/5</span>
                <span className="dd-meta-key">clarity</span>
              </div>
            </div>

            {/* Reflections */}
            <div className="dd-section">
              <p className="dd-section-title">REFLECTIONS</p>
              {localComments.length === 0 && (
                <p className="dd-empty-note">Add a reflection below.</p>
              )}
              {localComments.map(c => (
                <div key={c.id} className="dd-comment">
                  <p className="dd-comment-text">{c.text}</p>
                </div>
              ))}
              <div className="dd-comment-row">
                <input
                  className="dd-comment-input"
                  type="text"
                  placeholder="Write a reflection…"
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                />
                {commentText.trim() && (
                  <button className="dd-comment-send" onClick={handleAddComment}>↑</button>
                )}
              </div>
            </div>

            {/* Delete */}
            <div className="dd-delete-section">
              {confirmDelete ? (
                <div className="dd-delete-confirm">
                  <p className="dd-delete-text">Delete this dream? This cannot be undone.</p>
                  <div className="dd-delete-row">
                    <button className="dd-delete-cancel" onClick={() => setConfirmDelete(false)}>Cancel</button>
                    <button className="dd-delete-ok" onClick={() => onDelete(dream.id)}>Delete</button>
                  </div>
                </div>
              ) : (
                <button className="dd-delete-btn" onClick={() => setConfirmDelete(true)}>Delete dream</button>
              )}
            </div>
          </div>
        )}

        {/* ── INTERPRETATIONS tab ─────────────────────── */}
        {tab === 'interpretations' && (
          <div className="dd-tab-content">
            {interpretations.length === 0 ? (
              <div className="dd-interpret-idle">
                <p className="dd-interpret-hint">
                  Generate an AI interpretation of this dream using multiple psychological frameworks.
                </p>
                <button
                  className={`dd-interpret-btn ${interpreting ? 'loading' : ''}`}
                  onClick={handleInterpret}
                  disabled={interpreting}
                >
                  {interpreting
                    ? 'Interpreting…'
                    : <>INTERPRET <span className="dd-interpret-star">✦</span></>
                  }
                </button>
              </div>
            ) : (
              <div className="dd-interpretations">
                {interpretations.map(interp => (
                  <div key={interp.id} className="dd-interp-card">
                    <p className="dd-interp-framework">{FRAMEWORK_LABELS[interp.framework].toUpperCase()}</p>
                    <p className="dd-interp-text">{interp.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAGS tab ────────────────────────────────── */}
        {tab === 'tags' && (
          <div className="dd-tab-content">

            {/* Characters */}
            {(characterTags.length > 0 || dream.tags.length > 0) && (
              <div className="dd-tags-group">
                {dream.tags.map(tag => (
                  <div key={tag} className="dd-entity-pill">
                    <svg className="dd-entity-icon" width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
                      <path d="M2 13c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                    <span>{tag}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Symbols */}
            {matchedSymbols.length > 0 && (
              <>
                <div className="dd-tags-divider" />
                <p className="dd-tags-section-label">SYMBOLS</p>
                <div className="dd-symbol-grid">
                  {matchedSymbols.map(sym => (
                    <div key={sym.id} className="dd-symbol-card">
                      <div className="dd-symbol-icon-area">
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" opacity="0.7">
                          <circle cx="16" cy="13" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
                          <path d="M5 28c0-6.075 4.925-11 11-11s11 4.925 11 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <p className="dd-symbol-name">{sym.name}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {matchedSymbols.length === 0 && dream.tags.length === 0 && (
              <p className="dd-empty-note">No tags or symbols detected.</p>
            )}
          </div>
        )}

        {/* ── MAP tab ─────────────────────────────────── */}
        {tab === 'map' && (
          <div className="dd-tab-content">
            <div className="dd-map-placeholder">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" opacity="0.3">
                <circle cx="24" cy="20" r="8" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M24 44C24 44 8 30 8 20a16 16 0 0132 0c0 10-16 24-16 24z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
              <p className="dd-map-label">Share to global dream map</p>
              <button
                className="dd-map-btn"
                onClick={() => onTogglePrivacy(dream.id)}
              >
                {dream.isPrivate ? 'Make sharable' : 'Shared ✓'}
              </button>
            </div>
          </div>
        )}

      </div>{/* dd-scroll-card */}
      </div>{/* dd-scroll */}

      {storyShared && (
        <div className="dd-toast">Added to your story ✓</div>
      )}
    </div>
  )
}
