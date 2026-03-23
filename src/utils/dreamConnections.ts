import type { Dream } from '../types/dream'
import { FEED_DREAMS } from '../data/mockCommunity'

export type ConnectionType = 'recurring' | 'community' | 'milestone'

export interface DreamConnection {
  id: string
  type: ConnectionType
  symbol: string
  count: number
  communityCount?: number
  text: string
  notifText: string   // short version for notification bell
  dreamIds: string[]  // IDs of user dreams containing this symbol
  createdAt: string
}

// ── Count tag frequency in user dreams ────────────────────
function countUserTags(dreams: Dream[], days = 30): Record<string, string[]> {
  const cutoff = Date.now() - days * 86400_000
  const map: Record<string, string[]> = {}
  dreams
    .filter(d => d.visibility !== 'private' && !d.isPrivate && new Date(d.createdAt).getTime() > cutoff)
    .forEach(d => {
      d.tags.forEach(tag => {
        if (!map[tag]) map[tag] = []
        map[tag].push(d.id)
      })
    })
  return map
}

// ── Count tag frequency in community dreams ───────────────
function countCommunityTags(): Record<string, number> {
  const map: Record<string, number> = {}
  FEED_DREAMS.forEach(d => {
    d.tags.forEach(tag => {
      map[tag] = (map[tag] ?? 0) + 1
    })
  })
  return map
}

function capitalise(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// ── Main export ────────────────────────────────────────────
export function analyzeConnections(dreams: Dream[]): DreamConnection[] {
  if (!dreams.length) return []

  const userTags = countUserTags(dreams, 30)
  const communityTags = countCommunityTags()
  const connections: DreamConnection[] = []

  // ── Recurring patterns (user dreamed about X 2+ times) ─
  Object.entries(userTags)
    .filter(([, ids]) => ids.length >= 2)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 5)
    .forEach(([tag, ids]) => {
      const communityCount = communityTags[tag] ?? 0
      const sym = capitalise(tag)
      connections.push({
        id: `recurring-${tag}`,
        type: 'recurring',
        symbol: tag,
        count: ids.length,
        communityCount,
        text: communityCount > 0
          ? `You and ${communityCount + ids.length} others dreamed about ${sym.toLowerCase()} this month.`
          : `${sym} has appeared in ${ids.length} of your dreams this month.`,
        notifText: `${sym} is a recurring symbol in your dreams ✦`,
        dreamIds: ids,
        createdAt: new Date().toISOString(),
      })
    })

  // ── Community intersections (you share a theme with community) ─
  Object.entries(userTags)
    .filter(([tag, ids]) => ids.length === 1 && (communityTags[tag] ?? 0) >= 2)
    .sort((a, b) => (communityTags[b[0]] ?? 0) - (communityTags[a[0]] ?? 0))
    .slice(0, 3)
    .forEach(([tag, ids]) => {
      const communityCount = communityTags[tag] ?? 0
      const sym = capitalise(tag)
      connections.push({
        id: `community-${tag}`,
        type: 'community',
        symbol: tag,
        count: ids.length,
        communityCount,
        text: `You and ${communityCount} others in the community dreamed about ${sym.toLowerCase()} recently.`,
        notifText: `${communityCount} dreamers share your ${sym.toLowerCase()} symbol ✦`,
        dreamIds: ids,
        createdAt: new Date().toISOString(),
      })
    })

  // ── Milestones ─────────────────────────────────────────
  const publicCount = dreams.filter(d => !d.isPrivate).length
  if (publicCount === 1) {
    connections.push({
      id: 'milestone-first',
      type: 'milestone',
      symbol: 'first dream',
      count: 1,
      text: 'You shared your first dream with the community.',
      notifText: 'Your first dream is now part of the collective ✦',
      dreamIds: [],
      createdAt: new Date().toISOString(),
    })
  }
  if (dreams.length === 7) {
    connections.push({
      id: 'milestone-week',
      type: 'milestone',
      symbol: 'one week',
      count: 7,
      text: 'A full week of dreams logged.',
      notifText: 'One week of dreams — your subconscious is speaking ✦',
      dreamIds: [],
      createdAt: new Date().toISOString(),
    })
  }

  return connections
}

// ── Shared patterns for Social Discovery section ───────────
export interface SharedPattern {
  symbol: string
  userCount: number       // how many of user's dreams
  totalCount: number      // user + community
  dreamIds: string[]
}

export function getSharedPatterns(dreams: Dream[]): SharedPattern[] {
  const userTags = countUserTags(dreams, 30)
  const communityTags = countCommunityTags()

  return Object.entries(userTags)
    .filter(([tag]) => (communityTags[tag] ?? 0) > 0)
    .map(([tag, ids]) => ({
      symbol: tag,
      userCount: ids.length,
      totalCount: ids.length + (communityTags[tag] ?? 0),
      dreamIds: ids,
    }))
    .sort((a, b) => b.totalCount - a.totalCount)
    .slice(0, 6)
}
