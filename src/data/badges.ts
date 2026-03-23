import type { Dream } from '../types/dream'

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
}

export const BADGES: Badge[] = [
  { id: 'first-dream',   name: 'First Dream',       description: 'You logged your first dream.',                icon: '🌙' },
  { id: 'dream-7',       name: 'Dream Explorer',    description: "You've logged 7 dreams.",                    icon: '✦'  },
  { id: 'dream-30',      name: 'Night Archivist',   description: '30 dreams recorded.',                        icon: '◈'  },
  { id: 'dream-100',     name: 'Dream Keeper',      description: '100 dreams in your archive.',                icon: '∿'  },
  { id: 'lucid',         name: 'Lucid Pathfinder',  description: 'You marked your first lucid dream.',         icon: '💜' },
  { id: 'pattern',       name: 'Pattern Seeker',    description: 'A symbol appeared in 3+ of your dreams.',    icon: '🔮' },
  { id: 'interpreter',   name: 'Dream Interpreter', description: 'You generated your first AI interpretation.', icon: '✧'  },
  { id: 'streak-3',      name: '3-Day Dreamer',     description: 'Logged dreams 3 days in a row.',             icon: '🔥' },
  { id: 'streak-7',      name: 'Week of Dreams',    description: '7-day dream recall streak.',                 icon: '🌟' },
  { id: 'constellation', name: 'Star Mapper',       description: 'You explored your Dream Constellation.',     icon: '✦'  },
  { id: 'circle',        name: 'Dream Circle',      description: 'You created your first Dream Circle.',       icon: '◉'  },
]

function getStreak(dreams: Dream[]): number {
  if (!dreams.length) return 0
  const today = new Date(); today.setHours(0, 0, 0, 0)
  let streak = 0
  for (let i = 0; i <= 365; i++) {
    const d = new Date(today); d.setDate(today.getDate() - i)
    const has = dreams.some(dr => {
      const t = new Date(dr.createdAt).getTime()
      return t >= d.getTime() && t < d.getTime() + 86400_000
    })
    if (has) streak++; else break
  }
  return streak
}

export interface BadgeFlags {
  viewedConstellation: boolean
  createdCircle: boolean
}

export function getEarnedBadgeIds(dreams: Dream[], flags: BadgeFlags = { viewedConstellation: false, createdCircle: false }): Set<string> {
  const earned = new Set<string>()
  if (dreams.length >= 1)   earned.add('first-dream')
  if (dreams.length >= 7)   earned.add('dream-7')
  if (dreams.length >= 30)  earned.add('dream-30')
  if (dreams.length >= 100) earned.add('dream-100')
  if (dreams.some(d => d.lucid)) earned.add('lucid')
  if (dreams.some(d => (d.interpretations?.length ?? 0) > 0)) earned.add('interpreter')
  const streak = getStreak(dreams)
  if (streak >= 3) earned.add('streak-3')
  if (streak >= 7) earned.add('streak-7')
  // Tag recurrence
  const tagCounts: Record<string, number> = {}
  dreams.forEach(d => d.tags.forEach(t => { tagCounts[t] = (tagCounts[t] ?? 0) + 1 }))
  if (Object.values(tagCounts).some(c => c >= 3)) earned.add('pattern')
  if (flags.viewedConstellation) earned.add('constellation')
  if (flags.createdCircle)       earned.add('circle')
  return earned
}
