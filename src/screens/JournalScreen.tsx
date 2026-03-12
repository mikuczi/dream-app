import { useState, useMemo } from 'react'
import './JournalScreen.css'
import type { Dream, DreamMood } from '../types/dream'

interface JournalScreenProps {
  dreams: Dream[]
  onBack?: () => void
  tabMode?: boolean
  onOpenDream?: (dream: Dream) => void
  onAsk?: () => void
}

type FilterMode = 'all' | 'lucid' | 'recurring'

const MOOD_SYMBOLS: Record<DreamMood, string> = {
  peaceful: '〜',
  joyful: '✦',
  anxious: '⊘',
  scary: '◈',
  strange: '∿',
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

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
  return new Date(isoString).toLocaleDateString('en-US', {
    weekday: 'short', month: 'long', day: 'numeric',
  })
}

function getDreamsForDay(dreams: Dream[], year: number, month: number, day: number): Dream[] {
  return dreams.filter(d => {
    const date = new Date(d.createdAt)
    return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day
  })
}

function DreamCard({ dream, onOpenDream }: { dream: Dream; onOpenDream?: (dream: Dream) => void }) {
  const excerpt = dream.transcript.length > 80
    ? dream.transcript.slice(0, 80).trimEnd() + '…'
    : dream.transcript

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
          {dream.tags.slice(0, 3).map(tag => (
            <span key={tag} className="dream-mini-tag">{tag}</span>
          ))}
        </div>
        <div className="dream-card-clarity">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className={`clarity-dot ${i < dream.clarity ? 'filled' : ''}`} />
          ))}
        </div>
      </div>
    </button>
  )
}

interface CalendarMonthProps {
  year: number
  month: number
  dreams: Dream[]
  todayDate: Date
  selectedDay: Date | null
  onDayClick: (dreams: Dream[], day: Date) => void
}

function CalendarMonth({ year, month, dreams, todayDate, selectedDay, onDayClick }: CalendarMonthProps) {
  const monthName = new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const firstDay = new Date(year, month, 1).getDay()
  const startOffset = (firstDay + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: Array<number | null> = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div className="cal-month">
      <div className="cal-month-header">{monthName}</div>
      <div className="cal-grid">
        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
          <div key={d} className="cal-day-header">{d}</div>
        ))}
        {cells.map((day, idx) => {
          if (day === null) return <div key={`e-${idx}`} className="cal-cell cal-cell-empty" />
          const dayDreams = getDreamsForDay(dreams, year, month, day)
          const hasDreams = dayDreams.length > 0
          const isToday   = todayDate.getFullYear() === year && todayDate.getMonth() === month && todayDate.getDate() === day
          const dayDate   = new Date(year, month, day)
          const isSelected = selectedDay?.getTime() === dayDate.getTime()
          return (
            <button
              key={day}
              className={`cal-cell ${isToday ? 'cal-cell-today' : ''} ${hasDreams ? 'cal-cell-has-dreams' : ''} ${isSelected ? 'cal-cell-selected' : ''}`}
              onClick={() => hasDreams && onDayClick(dayDreams, dayDate)}
              disabled={!hasDreams}
            >
              <span className="cal-cell-num">{day}</span>
              {hasDreams && <div className="cal-dot" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function JournalScreen({ dreams, onBack, tabMode = false, onOpenDream, onAsk }: JournalScreenProps) {
  const [filter,         setFilter]         = useState<FilterMode>('all')
  const [showCalendar,   setShowCalendar]   = useState(false)
  const [selectedDay,    setSelectedDay]    = useState<Date | null>(null)
  const [calDayDreams,   setCalDayDreams]   = useState<Dream[] | null>(null)

  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d }, [])

  const sorted = useMemo(
    () => [...dreams].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [dreams]
  )

  const filtered = useMemo(() => {
    let base = calDayDreams ?? sorted
    if (filter === 'lucid')     return base.filter(d => d.lucid)
    if (filter === 'recurring') return base.filter(d => d.recurring)
    return base
  }, [sorted, calDayDreams, filter])

  // 7-day strip: rolling last 7 days ending today
  const strip7 = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today)
      d.setDate(today.getDate() - (6 - i))
      return d
    }),
    [today]
  )

  // Calendar months: current first, then 2 previous
  const calMonths = useMemo(() => {
    return Array.from({ length: 3 }, (_, i) => {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }, [today])

  function handleStripDayClick(day: Date) {
    const y = day.getFullYear(), m = day.getMonth(), d = day.getDate()
    const dayDreams = getDreamsForDay(dreams, y, m, d)
    if (!dayDreams.length) return
    if (selectedDay?.getTime() === day.getTime()) {
      setSelectedDay(null); setCalDayDreams(null)
    } else {
      setSelectedDay(day); setCalDayDreams(dayDreams)
    }
  }

  function handleCalDayClick(dayDreams: Dream[], day: Date) {
    if (selectedDay?.getTime() === day.getTime()) {
      setSelectedDay(null); setCalDayDreams(null)
    } else {
      setSelectedDay(day); setCalDayDreams(dayDreams)
    }
  }

  return (
    <div className={`journal-screen screen ${tabMode ? 'journal-tab-mode' : ''}`}>

      {/* Header */}
      <div className="journal-header">
        {onBack
          ? <button className="journal-back-btn" onClick={onBack}>← back</button>
          : <div style={{ width: 60 }} />
        }
        <span className="journal-header-title">Journal</span>
        <button
          className={`journal-cal-btn ${showCalendar ? 'active' : ''}`}
          onClick={() => setShowCalendar(v => !v)}
          aria-label="Toggle calendar"
        >
          {showCalendar ? '✕' : '⊞'}
        </button>
      </div>

      <div className="journal-scroll">

        {/* 7-day strip — always visible when not in full calendar mode */}
        {!showCalendar && (
          <div className="journal-strip-wrap">
            <div className="journal-strip">
              {strip7.map((day, i) => {
                const hasDreams = getDreamsForDay(dreams, day.getFullYear(), day.getMonth(), day.getDate()).length > 0
                const isToday   = day.getTime() === today.getTime()
                const isSelected = selectedDay?.getTime() === day.getTime()
                return (
                  <button
                    key={i}
                    className={`strip-day ${isToday ? 'strip-day-today' : ''} ${isSelected ? 'strip-day-selected' : ''}`}
                    onClick={() => handleStripDayClick(day)}
                  >
                    <span className="strip-day-label">{DAY_LABELS[day.getDay()]}</span>
                    <span className="strip-day-num">{day.getDate()}</span>
                    <div className={`strip-dot ${hasDreams ? 'has-dreams' : ''}`} />
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Full calendar */}
        {showCalendar && (
          <div className="journal-calendar">
            {calMonths.map(({ year, month }) => (
              <CalendarMonth
                key={`${year}-${month}`}
                year={year}
                month={month}
                dreams={dreams}
                todayDate={today}
                selectedDay={selectedDay}
                onDayClick={handleCalDayClick}
              />
            ))}
          </div>
        )}

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
          {calDayDreams && (
            <button
              className="journal-filter-chip journal-clear-day"
              onClick={() => { setSelectedDay(null); setCalDayDreams(null) }}
            >
              {selectedDay ? formatDateLong(selectedDay.toISOString()) : ''} ×
            </button>
          )}
        </div>

        {/* Dream list */}
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
            {filtered.map(dream => (
              <DreamCard key={dream.id} dream={dream} onOpenDream={onOpenDream} />
            ))}
          </div>
        )}

        <div style={{ height: 80 }} />
      </div>

      {/* Floating Ask Your Dreams button */}
      {onAsk && (
        <button className="journal-ask-fab" onClick={onAsk}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M5 5.5C5 4.4 5.9 3.5 7 3.5s2 .9 2 2c0 .8-.5 1.4-1.2 1.7C7.3 7.4 7 7.8 7 8.3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            <circle cx="7" cy="10" r="0.6" fill="currentColor"/>
          </svg>
          Ask Your Dreams
        </button>
      )}
    </div>
  )
}
