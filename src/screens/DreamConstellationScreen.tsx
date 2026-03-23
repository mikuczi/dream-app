import { useState, useMemo, useCallback } from 'react'
import './DreamConstellationScreen.css'
import type { Dream } from '../types/dream'
import { buildConstellation, generateBgStars, type DreamNode } from '../utils/dreamConstellation'

interface DreamConstellationScreenProps {
  dreams: Dream[]
  onOpenDream: (dreamId: string) => void
  onBack: () => void
}

type Timeframe = '7d' | '30d' | 'all'

const MOOD_COLOR: Record<string, string> = {
  peaceful: '#4ab893',
  joyful:   '#f4c97b',
  anxious:  '#e09060',
  scary:    '#e05a6b',
  strange:  '#9B8CFF',
}

const MOOD_EMOJI: Record<string, string> = {
  peaceful: '🌙', joyful: '✨', anxious: '🌀', scary: '◈', strange: '🔮',
}

const BG_STARS = generateBgStars(70)

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`
}

const ALL_MOODS = ['peaceful', 'joyful', 'anxious', 'scary', 'strange'] as const

export function DreamConstellationScreen({ dreams, onOpenDream, onBack }: DreamConstellationScreenProps) {
  const [timeframe,   setTimeframe]   = useState<Timeframe>('all')
  const [moodFilter,  setMoodFilter]  = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<DreamNode | null>(null)

  const filtered = useMemo(() => {
    let ds = [...dreams].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    if (timeframe !== 'all') {
      const cutoff = Date.now() - (timeframe === '7d' ? 7 : 30) * 86400_000
      ds = ds.filter(d => new Date(d.createdAt).getTime() > cutoff)
    }
    if (moodFilter) ds = ds.filter(d => d.mood === moodFilter)
    return ds
  }, [dreams, timeframe, moodFilter])

  const { nodes, edges } = useMemo(() => buildConstellation(filtered), [filtered])

  const nodeMap = useMemo(() => {
    const m: Record<string, DreamNode> = {}
    nodes.forEach(n => { m[n.id] = n })
    return m
  }, [nodes])

  const handleNodeClick = useCallback((n: DreamNode) => {
    setSelectedNode(prev => prev?.id === n.id ? null : n)
  }, [])

  function handleSvgClick(e: React.MouseEvent<SVGSVGElement>) {
    const svg = e.currentTarget
    const rect = svg.getBoundingClientRect()
    const vb = svg.viewBox.baseVal
    const scaleX = vb.width  / rect.width
    const scaleY = vb.height / rect.height
    const svgX = (e.clientX - rect.left)  * scaleX
    const svgY = (e.clientY - rect.top)   * scaleY

    const hit = nodes.find(n => {
      const dx = n.x - svgX, dy = n.y - svgY
      return Math.sqrt(dx * dx + dy * dy) <= n.r + 14
    })
    setSelectedNode(hit ?? (selectedNode ? null : selectedNode))
  }

  function handleOpenSelected() {
    if (!selectedNode) return
    const dream = dreams.find(d => d.id === selectedNode.id)
    if (dream) onOpenDream(selectedNode.id)
    setSelectedNode(null)
  }

  const edgeCount = edges.filter(e => e.weight >= 1).length

  return (
    <div className="cs-screen">

      {/* ── Header ──────────────────────────────────────── */}
      <div className="cs-header">
        <button className="cs-back" onClick={onBack} aria-label="Back">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 4L6 10l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="cs-header-center">
          <span className="cs-title">Dream Constellation</span>
          <span className="cs-subtitle">{nodes.length} dreams · {edgeCount} connections</span>
        </div>
        <div style={{ width: 36 }} />
      </div>

      {/* ── Filters ─────────────────────────────────────── */}
      <div className="cs-filters">
        <div className="cs-time-tabs">
          {(['7d', '30d', 'all'] as Timeframe[]).map(t => (
            <button
              key={t}
              className={`cs-time-tab ${timeframe === t ? 'active' : ''}`}
              onClick={() => setTimeframe(t)}
            >
              {t === 'all' ? 'All time' : t === '7d' ? '7 days' : '30 days'}
            </button>
          ))}
        </div>
        <div className="cs-mood-row">
          {ALL_MOODS.map(m => {
            const color = MOOD_COLOR[m]
            const active = moodFilter === m
            return (
              <button
                key={m}
                className={`cs-mood-chip ${active ? 'active' : ''}`}
                style={active ? { borderColor: color, color } : undefined}
                onClick={() => setMoodFilter(active ? null : m)}
                title={m}
              >
                {MOOD_EMOJI[m]}
              </button>
            )
          })}
          {moodFilter && (
            <button className="cs-mood-clear" onClick={() => setMoodFilter(null)}>
              Clear ✕
            </button>
          )}
        </div>
      </div>

      {/* ── Constellation SVG ─────────────────────────── */}
      <div className="cs-canvas-wrap">
        {nodes.length === 0 ? (
          <div className="cs-empty">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" opacity="0.25">
              <circle cx="24" cy="24" r="4" stroke="currentColor" strokeWidth="1.5"/>
              <line x1="24" y1="6"  x2="24" y2="14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              <line x1="24" y1="34" x2="24" y2="42" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              <line x1="6"  y1="24" x2="14" y2="24" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              <line x1="34" y1="24" x2="42" y2="24" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              <line x1="10" y1="10" x2="16" y2="16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              <line x1="32" y1="32" x2="38" y2="38" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              <line x1="38" y1="10" x2="32" y2="16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              <line x1="16" y1="32" x2="10" y2="38" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <p className="cs-empty-title">No constellations yet</p>
            <p className="cs-empty-sub">
              {dreams.length === 0
                ? 'Log some dreams to reveal your subconscious map.'
                : 'No dreams match this filter.'}
            </p>
          </div>
        ) : (
          <svg
            className="cs-canvas"
            viewBox="0 0 800 800"
            onClick={handleSvgClick}
          >
            <defs>
              {/* Glow filter per mood */}
              {Object.entries(MOOD_COLOR).map(([mood, color]) => (
                <filter key={mood} id={`glow-${mood}`} x="-60%" y="-60%" width="220%" height="220%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur"/>
                  <feFlood floodColor={color} floodOpacity="0.6" result="flood"/>
                  <feComposite in="flood" in2="blur" operator="in" result="glow"/>
                  <feMerge>
                    <feMergeNode in="glow"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              ))}
              {/* Selected node glow (stronger) */}
              <filter id="glow-selected" x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur"/>
                <feMerge>
                  <feMergeNode in="blur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <radialGradient id="bg-grad" cx="50%" cy="50%" r="60%">
                <stop offset="0%"   stopColor="#120830" stopOpacity="1"/>
                <stop offset="100%" stopColor="#040209" stopOpacity="1"/>
              </radialGradient>
            </defs>

            {/* Background */}
            <rect width="800" height="800" fill="url(#bg-grad)"/>

            {/* Background star field */}
            {BG_STARS.map((s, i) => (
              <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="white" opacity={s.opacity}/>
            ))}

            {/* ── Edges ─────────────────────────────────── */}
            {edges.map(e => {
              const a = nodeMap[e.fromId]
              const b = nodeMap[e.toId]
              if (!a || !b) return null
              const isDashed  = e.weight < 1
              const opacity   = Math.max(0.06, Math.min(e.weight * 0.18, 0.55))
              const thickness = e.weight >= 2 ? 1.5 : e.weight >= 1 ? 1 : 0.6
              const isHighlit = selectedNode?.id === e.fromId || selectedNode?.id === e.toId
              return (
                <line
                  key={e.id}
                  x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                  stroke="rgba(200,190,255,1)"
                  strokeWidth={isHighlit ? thickness * 2 : thickness}
                  strokeOpacity={isHighlit ? Math.min(opacity * 2.5, 0.8) : opacity}
                  strokeDasharray={isDashed ? '4 6' : undefined}
                />
              )
            })}

            {/* ── Nodes ─────────────────────────────────── */}
            {nodes.map(n => {
              const color    = MOOD_COLOR[n.mood] ?? '#9B8CFF'
              const isSelected = selectedNode?.id === n.id
              const isRelated  = selectedNode
                ? edges.some(e => (e.fromId === selectedNode.id && e.toId === n.id) || (e.toId === selectedNode.id && e.fromId === n.id))
                : false
              const dimmed = selectedNode && !isSelected && !isRelated
              return (
                <g
                  key={n.id}
                  onClick={ev => { ev.stopPropagation(); handleNodeClick(n) }}
                  style={{ cursor: 'pointer' }}
                  opacity={dimmed ? 0.25 : 1}
                >
                  {/* Hit target (invisible, larger) */}
                  <circle cx={n.x} cy={n.y} r={n.r + 14} fill="transparent"/>

                  {/* Outer halo */}
                  <circle
                    cx={n.x} cy={n.y} r={n.r + (isSelected ? 8 : 4)}
                    fill={color}
                    opacity={isSelected ? 0.18 : 0.07}
                  />

                  {/* Main circle */}
                  <circle
                    cx={n.x} cy={n.y} r={n.r}
                    fill={`${color}28`}
                    stroke={color}
                    strokeWidth={isSelected ? 2 : 1.2}
                    filter={`url(#glow-${n.mood})`}
                  />

                  {/* Lucid badge */}
                  {n.isLucid && (
                    <circle
                      cx={n.x + n.r * 0.65}
                      cy={n.y - n.r * 0.65}
                      r={3.5}
                      fill="#f4c97b"
                      opacity="0.9"
                    />
                  )}

                  {/* Label — only for well-connected or selected nodes */}
                  {(n.connectionCount >= 2 || isSelected) && (
                    <text
                      x={n.x}
                      y={n.y + n.r + 14}
                      textAnchor="middle"
                      fill={isSelected ? color : 'rgba(255,255,255,0.45)'}
                      fontSize="9"
                      fontFamily="system-ui, sans-serif"
                    >
                      {n.title.length > 18 ? n.title.slice(0, 16) + '…' : n.title}
                    </text>
                  )}
                </g>
              )
            })}
          </svg>
        )}
      </div>

      {/* ── Legend ──────────────────────────────────────── */}
      {nodes.length > 0 && (
        <div className="cs-legend">
          {Object.entries(MOOD_COLOR).map(([mood, color]) => {
            const count = nodes.filter(n => n.mood === mood).length
            if (count === 0) return null
            return (
              <div key={mood} className="cs-legend-item">
                <div className="cs-legend-dot" style={{ background: color }} />
                <span className="cs-legend-label">{mood}</span>
                <span className="cs-legend-count">{count}</span>
              </div>
            )
          })}
          {nodes.some(n => n.isLucid) && (
            <div className="cs-legend-item">
              <div className="cs-legend-dot" style={{ background: '#f4c97b' }} />
              <span className="cs-legend-label">lucid</span>
            </div>
          )}
        </div>
      )}

      {/* ── Selected node bottom sheet ───────────────── */}
      {selectedNode && (
        <>
          <div className="cs-scrim" onClick={() => setSelectedNode(null)}/>
          <div className="cs-sheet">
            <div className="cs-sheet-handle"/>
            <div className="cs-sheet-top">
              <span className="cs-sheet-mood-icon">
                {MOOD_EMOJI[selectedNode.mood] ?? '💭'}
              </span>
              <div className="cs-sheet-meta">
                <p className="cs-sheet-title">{selectedNode.title}</p>
                <p className="cs-sheet-date">{formatDate(selectedNode.createdAt)}</p>
              </div>
              {selectedNode.connectionCount > 0 && (
                <div className="cs-sheet-conn" style={{ borderColor: `${MOOD_COLOR[selectedNode.mood]}44` }}>
                  <span className="cs-sheet-conn-val">{selectedNode.connectionCount}</span>
                  <span className="cs-sheet-conn-label">links</span>
                </div>
              )}
            </div>

            {selectedNode.tags.length > 0 && (
              <div className="cs-sheet-tags">
                {selectedNode.tags.slice(0, 6).map(t => (
                  <span key={t} className="cs-sheet-tag">{t}</span>
                ))}
              </div>
            )}

            {/* Shared reasons with adjacent nodes */}
            {(() => {
              const reasons = edges
                .filter(e => (e.fromId === selectedNode.id || e.toId === selectedNode.id) && e.reasons.length > 0)
                .flatMap(e => e.reasons)
                .filter((v, i, a) => a.indexOf(v) === i)
                .slice(0, 4)
              return reasons.length > 0 ? (
                <p className="cs-sheet-reasons">
                  Connected via: {reasons.join(', ')}
                </p>
              ) : null
            })()}

            <button
              className="cs-sheet-open"
              onClick={handleOpenSelected}
            >
              Open dream
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </>
      )}

    </div>
  )
}
