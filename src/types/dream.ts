export type DreamMood = 'peaceful' | 'joyful' | 'anxious' | 'scary' | 'strange'

export interface Dream {
  id: string
  createdAt: string       // ISO date string
  title: string
  transcript: string
  notes?: string          // additional user notes
  artwork?: string        // URL or gradient CSS string
  mood: DreamMood
  lucid: boolean
  clarity: number         // 1–5
  recurring: boolean
  tags: string[]
  sleepQuality: number    // 1–5
  isPrivate?: boolean     // default false = public
  interpretations?: DreamInterpretation[]
  comments?: Comment[]
  bookmarked?: boolean
}

export interface DreamInterpretation {
  id: string
  framework: 'jungian' | 'freudian' | 'symbolic' | 'narrative' | 'psychological'
  text: string
  createdAt: string
}

export interface Comment {
  id: string
  userId: string
  userName: string
  text: string
  createdAt: string
}

export interface Friend {
  id: string
  name: string
  zodiacSign: ZodiacSign
  avatarInitials: string  // e.g. "JD"
  dreamCount: number
  recentDreams: Dream[]   // public dreams only
  sharedTags: string[]    // tags that overlap with user's dreams
  compatibility: number   // 0-100 mock score
}

export type ZodiacSign =
  'aries' | 'taurus' | 'gemini' | 'cancer' | 'leo' | 'virgo' |
  'libra' | 'scorpio' | 'sagittarius' | 'capricorn' | 'aquarius' | 'pisces'

export interface User {
  id: string
  name: string
  email: string
  passwordHash: string  // base64 for mock
  dob: string           // ISO date string "1990-05-21"
  zodiacSign: ZodiacSign
  createdAt: string
  photoURL?: string
}

export interface MoonPhaseInfo {
  phase: string        // "New Moon", "Waxing Crescent", etc.
  symbol: string       // Unicode symbol: 🌑🌒🌓🌔🌕🌖🌗🌘
  illumination: number // 0–1
  index: number        // 0–7
}
