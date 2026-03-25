import { useState } from 'react'
import './LogScreen.css'
import type { Dream, DreamMood, DreamVisibility } from '../types/dream'

interface LogScreenProps {
  transcript: string
  onSave: (dream: Dream) => void
  onBack: () => void
}

const MOODS: { value: DreamMood; label: string; symbol: string }[] = [
  { value: 'peaceful', label: 'peaceful', symbol: '〜' },
  { value: 'joyful',   label: 'joyful',   symbol: '✦' },
  { value: 'anxious',  label: 'anxious',  symbol: '⊘' },
  { value: 'scary',    label: 'scary',    symbol: '◈' },
  { value: 'strange',  label: 'strange',  symbol: '∿' },
]

// All available symbols/patterns to suggest
const ALL_SYMBOLS = [
  'Water', 'House', 'Flying', 'Falling', 'Being chased', 'Animals',
  'Family', 'Childhood', 'Mirror', 'Forest', 'Stars', 'Darkness',
  'Light', 'Time', 'Journey', 'Transformation', 'People', 'Death',
  'Fire', 'Ocean', 'School', 'Recurring',
]

const SYMBOL_KEYWORDS: Record<string, string[]> = {
  'Water':         ['water', 'ocean', 'sea', 'river', 'lake', 'rain', 'flood', 'swim', 'wave', 'shore', 'pool', 'stream'],
  'House':         ['house', 'home', 'room', 'door', 'window', 'hallway', 'corridor', 'building', 'apartment', 'upstairs'],
  'Flying':        ['fly', 'flying', 'float', 'soar', 'hover', 'wings', 'air', 'levitat'],
  'Falling':       ['fall', 'fell', 'falling', 'drop', 'plummet', 'tumble', 'plunge'],
  'Being chased':  ['chase', 'chased', 'chasing', 'running', 'escape', 'flee', 'pursue', 'hunting', 'following'],
  'Animals':       ['dog', 'cat', 'bird', 'snake', 'wolf', 'horse', 'animal', 'creature', 'bear', 'lion', 'deer', 'fish'],
  'Family':        ['family', 'mother', 'father', 'sister', 'brother', 'parent', 'mom', 'dad', 'grandmother', 'grandfather'],
  'Childhood':     ['child', 'childhood', 'young', 'little', 'school', 'kid', 'baby', 'past', 'memory', 'grew up'],
  'Mirror':        ['mirror', 'reflection', 'reflect', 'glass', 'duplicate'],
  'Forest':        ['forest', 'tree', 'wood', 'woods', 'garden', 'nature', 'jungle', 'path through'],
  'Stars':         ['star', 'moon', 'sky', 'night sky', 'space', 'universe', 'cosmos', 'celestial', 'planet'],
  'Darkness':      ['dark', 'darkness', 'shadow', 'black', 'night', 'hidden'],
  'Light':         ['light', 'bright', 'glow', 'shine', 'luminous', 'radiant', 'golden'],
  'Time':          ['time', 'clock', 'watch', 'late', 'early', 'future', 'past', 'suddenly', 'years ago'],
  'Journey':       ['travel', 'journey', 'road', 'path', 'walk', 'drive', 'train', 'car', 'bus', 'trip'],
  'Transformation':['change', 'transform', 'morph', 'become', 'turn into', 'shift'],
  'People':        ['person', 'people', 'stranger', 'someone', 'friend', 'crowd', 'woman', 'man'],
  'Death':         ['death', 'dead', 'dying', 'die', 'funeral', 'grave', 'coffin'],
  'Fire':          ['fire', 'flame', 'burn', 'burning', 'smoke', 'heat', 'torch'],
  'Ocean':         ['ocean', 'sea', 'wave', 'tide', 'deep water', 'underwater', 'abyss'],
  'School':        ['school', 'exam', 'test', 'classroom', 'teacher', 'study', 'university', 'class'],
  'Recurring':     [],
}

function detectSymbols(transcript: string): string[] {
  const lower = transcript.toLowerCase()
  const found: string[] = []
  for (const [symbol, keywords] of Object.entries(SYMBOL_KEYWORDS)) {
    if (symbol === 'Recurring') continue
    if (keywords.some(kw => lower.includes(kw))) {
      found.push(symbol)
    }
  }
  // Return top 5 most relevant
  return found.slice(0, 6)
}

function generateTitle(transcript: string): string {
  if (!transcript.trim()) return 'Untitled Dream'
  const t = transcript.toLowerCase()

  if (t.match(/\bfly(ing)?\b|\bfloat(ing)?\b|\bsoar(ing)?\b/))       return 'Rising Above'
  if (t.match(/\bfall(ing)?\b|\bfell\b/))                             return 'The Long Fall'
  if (t.match(/\bocean\b|\bwave\b/) && t.match(/\bstand\b|\bwalk\b/)) return 'At the Edge of the Ocean'
  if (t.match(/\bocean\b|\bsea\b|\bunderwater\b/))                    return 'Beneath the Surface'
  if (t.match(/\bchase\b|\bchased\b|\brunning.*away\b/))              return 'Running Through the Dark'
  if (t.match(/\bhouse\b|\bhome\b/) && t.match(/\bchildre?n\b|\bchildhood\b|\bold\b/)) return 'The House I Once Knew'
  if (t.match(/\bhouse\b|\bhome\b|\bhallway\b|\bcorridor\b/))         return 'The House With No Doors'
  if (t.match(/\bschool\b|\bexam\b|\btest\b/))                        return 'The Exam I Never Took'
  if (t.match(/\bforest\b|\btrees?\b|\bwoods?\b/))                    return 'Into the Forest'
  if (t.match(/\bmirror\b|\breflect/))                                 return 'The Mirror'
  if (t.match(/\bdead\b|\bdying\b|\bdeath\b/))                        return 'At the Edge'
  if (t.match(/\bchildre?n\b|\bchildhood\b|\byoung\b.*\bself\b/))     return 'When I Was Small'
  if (t.match(/\btrain\b|\bstation\b/))                               return 'The Train to Nowhere'
  if (t.match(/\bfire\b|\bflame\b/))                                  return 'Everything on Fire'
  if (t.match(/\bstars?\b|\bsky\b|\bspace\b/))                        return 'Among the Stars'
  if (t.match(/\bstranger\b|\bunknown\b/))                            return 'Someone I Didn\'t Know'
  if (t.match(/\bstuck\b|\bcouldn.t move\b|\bparalyz/))               return 'Frozen in Place'
  if (t.match(/\blost\b|\bcouldn.t find\b/))                          return 'Something Lost'
  if (t.match(/\bdeep\b.*\bwater\b|\bsink\b|\bdrown/))               return 'Sinking Down'

  // Fall back: take first 4–5 meaningful words
  const words = transcript.trim().split(/\s+/).filter(w => w.length > 3)
  if (words.length >= 2) {
    return words.slice(0, 4).map(w => w[0].toUpperCase() + w.slice(1).toLowerCase()).join(' ')
  }
  return transcript.trim().slice(0, 40)
}

function generateSummary(transcript: string): string {
  if (!transcript.trim()) return ''
  const sentences = transcript.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 10)
  if (sentences.length >= 2) return sentences.slice(0, 2).join(' ')
  if (transcript.length <= 160) return transcript.trim()
  return transcript.slice(0, 160).trimEnd() + '…'
}

function Toggle({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button
      className={`toggle-track ${active ? 'active' : ''}`}
      onClick={onToggle}
      role="switch"
      aria-checked={active}
    >
      <div className="toggle-thumb" />
    </button>
  )
}

function todayISO() {
  const d = new Date()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

const DREAM_THUMBNAILS = [
  '/photos/Dream1.jpg', '/photos/Dream2.jpg', '/photos/Dream3.jpg',
  '/photos/Dream4.jpg', '/photos/Dream5.jpg', '/photos/Dream6.jpg',
  '/photos/Dream7.jpg', '/photos/Dream8.jpg',
  '/photos/dream9.jpg', '/photos/dream10.jpg', '/photos/dream11.jpg',
]

function pickThumbnail(): string {
  return DREAM_THUMBNAILS[Math.floor(Math.random() * DREAM_THUMBNAILS.length)]
}

const VISIBILITY_OPTIONS: { value: DreamVisibility; label: string; desc: string; icon: string }[] = [
  { value: 'private', label: 'Only me',  desc: 'Just your journal',        icon: '🔒' },
  { value: 'circle',  label: 'Circle',   desc: 'Your dream circle only',   icon: '👥' },
  { value: 'public',  label: 'Public',   desc: 'Anyone can discover it',   icon: '🌍' },
]

export function LogScreen({ transcript, onSave, onBack }: LogScreenProps) {
  const [title,      setTitle]      = useState(() => generateTitle(transcript))
  const [dreamDate,  setDreamDate]  = useState(todayISO())
  const [mood,       setMood]       = useState<DreamMood>('peaceful')
  const [symbols,    setSymbols]    = useState<string[]>(() => detectSymbols(transcript))
  const [newTag,     setNewTag]     = useState('')
  const [showMore,   setShowMore]   = useState(false)
  const [lucid,      setLucid]      = useState(false)
  const [recurring,  setRecurring]  = useState(false)
  const [visibility, setVisibility] = useState<DreamVisibility>('private')
  const [inStory,    setInStory]    = useState(true)
  const [inFeed,     setInFeed]     = useState(false)

  function handleSetVisibility(v: DreamVisibility) {
    setVisibility(v)
    // When making public/circle, automatically add to feed
    if (v !== 'private') setInFeed(true)
    else setInFeed(false)
  }

  const summary = generateSummary(transcript)

  function toggleSymbol(s: string) {
    setSymbols(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  function addCustomTag() {
    const t = newTag.trim()
    if (t && !symbols.includes(t)) setSymbols(prev => [...prev, t])
    setNewTag('')
  }

  function handleSave() {
    const dream: Dream = {
      id: Date.now().toString(),
      createdAt: new Date(dreamDate + 'T12:00:00').toISOString(),
      title: title.trim() || 'Untitled Dream',
      transcript,
      mood,
      lucid,
      clarity: 3,
      recurring,
      tags: symbols,
      sleepQuality: 3,
      visibility,
      inStory,
      inFeed: visibility !== 'private' && inFeed,
      thumbnailUrl: pickThumbnail(),
    }
    onSave(dream)
  }

  const unusedSymbols = ALL_SYMBOLS.filter(s => !symbols.includes(s))

  return (
    <div className="log-screen screen">
      {/* Header */}
      <div className="log-header">
        <button className="log-back-btn" onClick={onBack} aria-label="Go back">← back</button>
      </div>

      <div className="log-scroll">

        {/* Generated title — large, editable */}
        <div className="log-title-section">
          <input
            className="log-title-input-hero"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Name this dream…"
            maxLength={80}
          />
          {summary && <p className="log-summary">{summary}</p>}
          {/* Date picker */}
          <div className="log-date-row">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="3" width="14" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
              <line x1="5" y1="1" x2="5" y2="5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              <line x1="11" y1="1" x2="11" y2="5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              <line x1="1" y1="7" x2="15" y2="7" stroke="currentColor" strokeWidth="1.1"/>
            </svg>
            <input
              className="log-date-input"
              type="date"
              value={dreamDate}
              max={todayISO()}
              onChange={e => setDreamDate(e.target.value)}
            />
          </div>
        </div>

        {/* Symbols & patterns */}
        <div className="log-section">
          <div className="log-label">Symbols & patterns</div>
          <div className="log-chips-row">
            {symbols.map(s => (
              <button key={s} className="log-chip log-chip-selected" onClick={() => toggleSymbol(s)}>
                {s} ×
              </button>
            ))}
          </div>

          {/* Add more symbols */}
          <div className="log-add-symbols">
            {unusedSymbols.slice(0, 8).map(s => (
              <button key={s} className="log-chip" onClick={() => toggleSymbol(s)}>
                + {s}
              </button>
            ))}
          </div>

          {/* Custom tag input */}
          <div className="log-custom-tag-row">
            <input
              className="log-custom-tag-input"
              type="text"
              value={newTag}
              onChange={e => setNewTag(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCustomTag()}
              placeholder="Add your own…"
              maxLength={30}
            />
            {newTag.trim() && (
              <button className="log-custom-tag-add" onClick={addCustomTag}>Add</button>
            )}
          </div>
        </div>

        {/* Mood */}
        <div className="log-section">
          <div className="log-label">How did it feel?</div>
          <div className="mood-pills">
            {MOODS.map(({ value, label, symbol }) => (
              <button
                key={value}
                className={`mood-pill ${mood === value ? 'selected' : ''}`}
                onClick={() => setMood(value)}
              >
                <span className="mood-symbol">{symbol}</span>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Transcript preview */}
        {transcript && (
          <div className="log-section">
            <div className="log-transcript-card">
              <p className="log-transcript-preview">{transcript}</p>
            </div>
          </div>
        )}

        {/* More details toggle */}
        <div className="log-section">
          <button className="log-more-toggle" onClick={() => setShowMore(v => !v)}>
            {showMore ? 'Less details ↑' : 'More details ↓'}
          </button>
          {showMore && (
            <div className="log-more-content">
              <div className="log-more-row">
                <span className="log-more-label">Lucid dream</span>
                <Toggle active={lucid} onToggle={() => setLucid(v => !v)} />
              </div>
              <div className="log-more-row">
                <span className="log-more-label">Recurring</span>
                <Toggle active={recurring} onToggle={() => setRecurring(v => !v)} />
              </div>
            </div>
          )}
        </div>

        {/* Visibility */}
        <div className="log-section">
          <div className="log-label">Who can see this?</div>
          <div className="log-visibility-row">
            {VISIBILITY_OPTIONS.map(({ value, label, desc, icon }) => (
              <button
                key={value}
                className={`log-vis-card ${visibility === value ? 'selected' : ''}`}
                onClick={() => handleSetVisibility(value)}
              >
                <span className="log-vis-icon">{icon}</span>
                <span className="log-vis-label">{label}</span>
                <span className="log-vis-desc">{desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Story & Feed toggles */}
        <div className="log-section log-sharing-section">
          <div className="log-more-row">
            <div className="log-toggle-info">
              <span className="log-more-label">Add to Dream Story</span>
              <span className="log-more-hint">Visible for 24h like stories</span>
            </div>
            <Toggle active={inStory} onToggle={() => setInStory(v => !v)} />
          </div>
          {visibility !== 'private' && (
            <div className="log-more-row">
              <div className="log-toggle-info">
                <span className="log-more-label">Share to Feed</span>
                <span className="log-more-hint">
                  {visibility === 'circle' ? 'Visible to your circle' : 'Visible to everyone'}
                </span>
              </div>
              <Toggle active={inFeed} onToggle={() => setInFeed(v => !v)} />
            </div>
          )}
        </div>

        {/* Save */}
        <div className="log-save-section">
          <button className="log-save-btn" onClick={handleSave}>
            Add to Journal
          </button>
          <button className="log-deep-analysis-btn" onClick={handleSave}>
            Analyze this dream deeper →
          </button>
        </div>

      </div>
    </div>
  )
}
