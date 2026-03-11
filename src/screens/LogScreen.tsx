import { useState } from 'react'
import './LogScreen.css'
import type { Dream, DreamMood } from '../types/dream'

interface LogScreenProps {
  transcript: string
  onSave: (dream: Dream) => void
  onBack: () => void
}

const MOODS: { value: DreamMood; label: string; symbol: string }[] = [
  { value: 'peaceful', label: 'peaceful', symbol: '〜' },
  { value: 'joyful', label: 'joyful', symbol: '✦' },
  { value: 'anxious', label: 'anxious', symbol: '⊘' },
  { value: 'scary', label: 'scary', symbol: '◈' },
  { value: 'strange', label: 'strange', symbol: '∿' },
]

const ALL_TAGS = [
  'people',
  'flying',
  'falling',
  'water',
  'work',
  'nature',
  'symbols',
  'chase',
  'light',
  'darkness',
]

function generateTitle(transcript: string): string {
  const words = transcript.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return 'Untitled Dream'
  if (words.length <= 6) return words.join(' ')
  return words.slice(0, 6).join(' ') + '…'
}

function Toggle({
  active,
  onToggle,
}: {
  active: boolean
  onToggle: () => void
}) {
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

function DotRating({
  value,
  max = 5,
  onChange,
}: {
  value: number
  max?: number
  onChange: (v: number) => void
}) {
  return (
    <div className="dot-row">
      {Array.from({ length: max }, (_, i) => (
        <button
          key={i}
          className="dot-btn"
          onClick={() => onChange(i + 1)}
          aria-label={`Rate ${i + 1} of ${max}`}
        >
          <div className={`dot-icon ${i < value ? 'filled' : ''}`} />
        </button>
      ))}
    </div>
  )
}

export function LogScreen({ transcript, onSave, onBack }: LogScreenProps) {
  const [title, setTitle] = useState(() => generateTitle(transcript))
  const [mood, setMood] = useState<DreamMood>('peaceful')
  const [lucid, setLucid] = useState(false)
  const [clarity, setClarity] = useState(3)
  const [recurring, setRecurring] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sleepQuality, setSleepQuality] = useState(3)

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  function handleSave() {
    const dream: Dream = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      title: title.trim() || 'Untitled Dream',
      transcript,
      mood,
      lucid,
      clarity,
      recurring,
      tags: selectedTags,
      sleepQuality,
    }
    onSave(dream)
  }

  const previewText =
    transcript.length > 100 ? transcript.slice(0, 100).trimEnd() + '…' : transcript

  return (
    <div className="log-screen screen">
      {/* Header */}
      <div className="log-header">
        <button className="log-back-btn" onClick={onBack} aria-label="Go back">
          ← back
        </button>
        <span className="log-title">Log Dream</span>
      </div>

      {/* Scrollable form */}
      <div className="log-scroll">
        {/* Transcript preview */}
        <div className="log-section">
          <div className="log-transcript-card">
            <p className="log-transcript-preview">{previewText || 'No transcript recorded.'}</p>
          </div>
        </div>

        {/* Title */}
        <div className="log-section" style={{ marginTop: 20 }}>
          <div className="log-label">Dream title</div>
          <input
            className="log-title-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Name this dream…"
            maxLength={80}
          />
        </div>

        {/* Mood */}
        <div className="log-section" style={{ marginTop: 20 }}>
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

        {/* Lucid */}
        <div className="log-section" style={{ marginTop: 20 }}>
          <div className="log-label">Were you lucid?</div>
          <div className="log-toggle-row">
            <span className="log-toggle-value">{lucid ? 'Yes' : 'No'}</span>
            <Toggle active={lucid} onToggle={() => setLucid((v) => !v)} />
          </div>
        </div>

        {/* Clarity */}
        <div className="log-section" style={{ marginTop: 20 }}>
          <div className="log-label">Dream clarity</div>
          <DotRating value={clarity} onChange={setClarity} />
        </div>

        {/* Recurring */}
        <div className="log-section" style={{ marginTop: 20 }}>
          <div className="log-label">Seen before?</div>
          <div className="log-toggle-row">
            <span className="log-toggle-value">{recurring ? 'Yes' : 'No'}</span>
            <Toggle active={recurring} onToggle={() => setRecurring((v) => !v)} />
          </div>
        </div>

        {/* Tags */}
        <div className="log-section" style={{ marginTop: 20 }}>
          <div className="log-label">Elements</div>
          <div className="tags-grid">
            {ALL_TAGS.map((tag) => (
              <button
                key={tag}
                className={`tag-chip ${selectedTags.includes(tag) ? 'selected' : ''}`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Sleep quality */}
        <div className="log-section" style={{ marginTop: 20 }}>
          <div className="log-label">Sleep quality</div>
          <DotRating value={sleepQuality} onChange={setSleepQuality} />
        </div>

        {/* Save */}
        <div className="log-save-section">
          <button className="log-save-btn" onClick={handleSave}>
            Add to Journal
          </button>
        </div>
      </div>
    </div>
  )
}
