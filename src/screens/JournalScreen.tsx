import { useState, useMemo } from 'react'
import './JournalScreen.css'
import type { Dream, DreamMood } from '../types/dream'

interface JournalScreenProps {
  dreams: Dream[]
  onBack?: () => void
  tabMode?: boolean
  onOpenDream?: (dream: Dream) => void
}

type ViewMode = 'list' | 'calendar'
type FilterMode = 'all' | 'lucid' | 'recurring'

const MOOD_SYMBOLS: Record<DreamMood, string> = {
  peaceful: '〜',
  joyful: '✦',
  anxious: '⊘',
  scary: '◈',
  strange: '∿',
}

function formatDate(isoString: string): string {
  const date = new Date(isoString)
  const now = new Date()

  const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (dateDay.getTime() === today.getTime()) return 'Today'
  if (dateDay.getTime() === yesterday.getTime()) return 'Yesterday'

  const diffDays = Math.round((today.getTime() - dateDay.getTime()) / 86400000)
  if (diffDays < 7) return `${diffDays} days ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatDateLong(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })
}

function DreamCard({ dream, onOpenDream }: { dream: Dream; onOpenDream?: (dream: Dream) => void }) {
  const excerpt =
    dream.transcript.length > 80
      ? dream.transcript.slice(0, 80).trimEnd() + '…'
      : dream.transcript

  const visibleTags = dream.tags.slice(0, 3)

  return (
    <button
      className="dream-card"
      onClick={() => onOpenDream?.(dream)}
      style={{ textAlign: 'left', width: '100%' }}
    >
      <div className="dream-card-header">
        <span className="dream-card-date">{formatDate(dream.createdAt)}</span>
        <div className="dream-card-header-right">
          <span className="dream-card-privacy">
            {dream.isPrivate ? '◎ private' : '◯ shared'}
          </span>
          <span className="dream-card-mood" title={dream.mood}>
            {MOOD_SYMBOLS[dream.mood]}
          </span>
        </div>
      </div>

      <div className="dream-card-title">{dream.title}</div>

      {excerpt && <div className="dream-card-excerpt">{excerpt}</div>}

      <div className="dream-card-meta">
        <div className="dream-card-tags">
          {visibleTags.map((tag) => (
            <span key={tag} className="dream-mini-tag">
              {tag}
            </span>
          ))}
        </div>

        <div className="dream-card-clarity">
          {Array.from({ length: 5 }, (_, i) => (
            <div
              key={i}
              className={`clarity-dot ${i < dream.clarity ? 'filled' : ''}`}
            />
          ))}
        </div>
      </div>
    </button>
  )
}

function getDreamsForDay(dreams: Dream[], year: number, month: number, day: number): Dream[] {
  return dreams.filter(d => {
    const date = new Date(d.createdAt)
    return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day
  })
}

interface CalendarMonthProps {
  year: number
  month: number // 0-indexed
  dreams: Dream[]
  todayDate: Date
  onDayClick: (dreams: Dream[]) => void
}

function CalendarMonth({ year, month, dreams, todayDate, onDayClick }: CalendarMonthProps) {
  const monthName = new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  // Day of week for first of month (0=Sun, convert to Mon-based)
  const firstDay = new Date(year, month, 1).getDay()
  const startOffset = (firstDay + 6) % 7 // Mon=0, Tue=1, ..., Sun=6

  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: Array<number | null> = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  // Pad to full rows
  while (cells.length % 7 !== 0) cells.push(null)

  const dayHeaders = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

  return (
    <div className="cal-month">
      <div className="cal-month-header">{monthName}</div>
      <div className="cal-grid">
        {dayHeaders.map(d => (
          <div key={d} className="cal-day-header">{d}</div>
        ))}
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="cal-cell cal-cell-empty" />
          }
          const dayDreams = getDreamsForDay(dreams, year, month, day)
          const hasDreams = dayDreams.length > 0
          const isToday =
            todayDate.getFullYear() === year &&
            todayDate.getMonth() === month &&
            todayDate.getDate() === day

          const dotSize = hasDreams ? Math.min(8 + dayDreams.length * 2, 13) : 6

          return (
            <button
              key={day}
              className={`cal-cell ${isToday ? 'cal-cell-today' : ''} ${hasDreams ? 'cal-cell-has-dreams' : ''}`}
              onClick={() => hasDreams && onDayClick(dayDreams)}
              disabled={!hasDreams}
            >
              <div
                className="cal-dot"
                style={{
                  width: dotSize,
                  height: dotSize,
                  opacity: hasDreams ? 1 : 0.2,
                }}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function JournalScreen({ dreams, onBack, tabMode = false, onOpenDream }: JournalScreenProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [filter, setFilter] = useState<FilterMode>('all')
  const [calendarDayDreams, setCalendarDayDreams] = useState<Dream[] | null>(null)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const sorted = useMemo(
    () => [...dreams].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [dreams]
  )

  const filtered = useMemo(() => {
    if (filter === 'lucid') return sorted.filter(d => d.lucid)
    if (filter === 'recurring') return sorted.filter(d => d.recurring)
    return sorted
  }, [sorted, filter])

  // Build 3 months: current + 2 previous
  const calMonths = useMemo(() => {
    const months: Array<{ year: number; month: number }> = []
    for (let i = 2; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
      months.push({ year: d.getFullYear(), month: d.getMonth() })
    }
    return months
  }, [today])

  function handleCalendarDayClick(dayDreams: Dream[]) {
    setCalendarDayDreams(dayDreams)
  }

  return (
    <div className={`journal-screen screen ${tabMode ? 'journal-tab-mode' : ''}`}>
      {/* Header */}
      <div className="journal-header">
        {onBack ? (
          <button className="journal-back-btn" onClick={onBack} aria-label="Go back">
            ← back
          </button>
        ) : (
          <div style={{ width: 60 }} />
        )}
        <span className="journal-header-title">Journal</span>
        <div className="journal-view-toggle">
          <button
            className={`journal-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            ≡ List
          </button>
          <button
            className={`journal-toggle-btn ${viewMode === 'calendar' ? 'active' : ''}`}
            onClick={() => setViewMode('calendar')}
          >
            · Cal
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="journal-scroll">
        {viewMode === 'list' ? (
          <>
            {/* Filter chips */}
            <div className="journal-filter-row">
              {(['all', 'lucid', 'recurring'] as FilterMode[]).map(f => (
                <button
                  key={f}
                  className={`journal-filter-chip ${filter === f ? 'active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f === 'all' ? 'All' : f === 'lucid' ? 'Lucid' : 'Recurring'}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="journal-empty">
                <p className="journal-empty-text">
                  {dreams.length === 0
                    ? 'No dreams yet.\nYour dreams will appear here.'
                    : 'No dreams match this filter.'}
                </p>
              </div>
            ) : (
              <div className="journal-list">
                {filtered.map((dream) => (
                  <DreamCard key={dream.id} dream={dream} onOpenDream={onOpenDream} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="journal-calendar">
            {calMonths.map(({ year, month }) => (
              <CalendarMonth
                key={`${year}-${month}`}
                year={year}
                month={month}
                dreams={dreams}
                todayDate={today}
                onDayClick={handleCalendarDayClick}
              />
            ))}

            {/* Mini list for selected day */}
            {calendarDayDreams && calendarDayDreams.length > 0 && (
              <div className="cal-day-preview">
                <div className="cal-day-preview-header">
                  <span className="cal-day-preview-date">
                    {formatDateLong(calendarDayDreams[0].createdAt)}
                  </span>
                  <button
                    className="cal-day-preview-close"
                    onClick={() => setCalendarDayDreams(null)}
                  >
                    ✕
                  </button>
                </div>
                {calendarDayDreams.map(dream => (
                  <button
                    key={dream.id}
                    className="cal-day-dream-row"
                    onClick={() => onOpenDream?.(dream)}
                  >
                    <span className="cal-day-dream-mood">{MOOD_SYMBOLS[dream.mood]}</span>
                    <span className="cal-day-dream-title">{dream.title}</span>
                    <span className="cal-day-dream-arrow">›</span>
                  </button>
                ))}
              </div>
            )}

            {dreams.length === 0 && (
              <div className="journal-empty">
                <p className="journal-empty-text">No dreams recorded yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
