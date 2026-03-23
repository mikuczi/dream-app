import type { Dream } from '../types/dream'

export interface DreamNode {
  id: string
  title: string
  createdAt: string
  mood: string
  tags: string[]
  isLucid: boolean
  x: number
  y: number
  r: number               // visual radius
  connectionCount: number
}

export interface DreamEdge {
  id: string
  fromId: string
  toId: string
  weight: number          // effective connection strength
  reasons: string[]       // shared tag names
}

export interface DreamConstellation {
  nodes: DreamNode[]
  edges: DreamEdge[]
}

// ── Deterministic pseudo-random from string ────────────────
function seed(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) / 4294967296
}

// ── Background star field (decorative, stable) ─────────────
export interface BgStar { x: number; y: number; r: number; opacity: number }

export function generateBgStars(count = 70): BgStar[] {
  return Array.from({ length: count }, (_, i) => {
    const s = seed(`bg-star-${i}`)
    const s2 = seed(`bg-star-y-${i}`)
    const s3 = seed(`bg-star-r-${i}`)
    return {
      x: s * 800,
      y: s2 * 800,
      r: s3 < 0.65 ? 0.5 : s3 < 0.88 ? 1 : 1.5,
      opacity: 0.08 + s3 * 0.22,
    }
  })
}

// ── Force-directed layout ──────────────────────────────────
interface Mutable extends DreamNode { vx: number; vy: number }

function runForce(nodes: Mutable[], edges: DreamEdge[]): void {
  const REPULSION = 2800
  const SPRING_K  = 0.025
  const IDEAL_LEN = 150
  const GRAVITY   = 0.010
  const CX = 400, CY = 400

  for (let iter = 0; iter < 200; iter++) {
    // Repulsion between every pair of nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[j].x - nodes[i].x
        const dy = nodes[j].y - nodes[i].y
        const d2 = dx * dx + dy * dy + 1
        const d  = Math.sqrt(d2)
        const f  = REPULSION / d2
        nodes[i].vx -= (dx / d) * f
        nodes[i].vy -= (dy / d) * f
        nodes[j].vx += (dx / d) * f
        nodes[j].vy += (dy / d) * f
      }
    }

    // Spring attraction along edges
    for (const e of edges) {
      const a = nodes.find(n => n.id === e.fromId)
      const b = nodes.find(n => n.id === e.toId)
      if (!a || !b) continue
      const dx = b.x - a.x
      const dy = b.y - a.y
      const d  = Math.sqrt(dx * dx + dy * dy) + 0.001
      const target = IDEAL_LEN / Math.max(e.weight, 0.5)
      const f = (d - target) * SPRING_K
      a.vx += (dx / d) * f
      a.vy += (dy / d) * f
      b.vx -= (dx / d) * f
      b.vy -= (dy / d) * f
    }

    // Weak center gravity
    for (const n of nodes) {
      n.vx += (CX - n.x) * GRAVITY
      n.vy += (CY - n.y) * GRAVITY
    }

    // Apply velocities with damping
    for (const n of nodes) {
      n.x += n.vx
      n.y += n.vy
      n.vx *= 0.78
      n.vy *= 0.78
    }
  }
}

// ── Main export ─────────────────────────────────────────────
export function buildConstellation(dreams: Dream[]): DreamConstellation {
  const capped = dreams.slice(0, 40)
  if (capped.length === 0) return { nodes: [], edges: [] }

  // ── Build edges from shared tags ─────────────────────────
  const rawEdges: DreamEdge[] = []
  for (let i = 0; i < capped.length; i++) {
    for (let j = i + 1; j < capped.length; j++) {
      const reasons = capped[i].tags.filter(t => capped[j].tags.includes(t))
      const moodMatch = capped[i].mood === capped[j].mood
      const weight = reasons.length + (moodMatch ? 0.4 : 0)
      if (weight < 0.5) continue
      rawEdges.push({
        id: `${capped[i].id}--${capped[j].id}`,
        fromId: capped[i].id,
        toId:   capped[j].id,
        weight,
        reasons,
      })
    }
  }

  // ── Fallback: connect by mood when no tag edges exist ────
  const edges: DreamEdge[] = rawEdges.length > 0 ? rawEdges : capped.flatMap((d, i) =>
    capped.slice(i + 1).map((d2, j) => ({
      id: `mood-${d.id}--${d2.id}`,
      fromId: d.id,
      toId:   capped[i + 1 + j].id,
      weight: d.mood === d2.mood ? 0.5 : 0.1,
      reasons: d.mood === d2.mood ? [d.mood] : [],
    })).filter(e => e.weight > 0.3)
  )

  // ── Connection counts ─────────────────────────────────────
  const connCount: Record<string, number> = {}
  edges.forEach(e => {
    connCount[e.fromId] = (connCount[e.fromId] ?? 0) + 1
    connCount[e.toId]   = (connCount[e.toId]   ?? 0) + 1
  })

  // ── Initialize node positions from seeded hash ────────────
  const mutable: Mutable[] = capped.map(d => ({
    id: d.id, title: d.title, createdAt: d.createdAt,
    mood: d.mood, tags: d.tags, isLucid: d.lucid,
    x: seed(d.id)        * 600 + 100,
    y: seed(d.id + '__y') * 600 + 100,
    r: 8 + Math.min((connCount[d.id] ?? 0) * 3, 16),
    connectionCount: connCount[d.id] ?? 0,
    vx: 0, vy: 0,
  }))

  // ── Run force simulation ──────────────────────────────────
  if (capped.length > 1) runForce(mutable, edges)

  // ── Normalize to 0–800 preserving aspect ratio ───────────
  const PAD = 60
  const W   = 800
  const xs  = mutable.map(n => n.x)
  const ys  = mutable.map(n => n.y)
  const minX = Math.min(...xs), maxX = Math.max(...xs)
  const minY = Math.min(...ys), maxY = Math.max(...ys)
  const spanX = maxX - minX || 1
  const spanY = maxY - minY || 1
  const inner = W - PAD * 2
  const scale = Math.min(inner / spanX, inner / spanY)
  const offX  = PAD + (inner - spanX * scale) / 2
  const offY  = PAD + (inner - spanY * scale) / 2

  const nodes: DreamNode[] = mutable.map(n => ({
    id: n.id, title: n.title, createdAt: n.createdAt,
    mood: n.mood, tags: n.tags, isLucid: n.isLucid,
    x: (n.x - minX) * scale + offX,
    y: (n.y - minY) * scale + offY,
    r: n.r,
    connectionCount: n.connectionCount,
  }))

  return { nodes, edges }
}
