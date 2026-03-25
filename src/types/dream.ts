export type DreamMood = 'peaceful' | 'joyful' | 'anxious' | 'scary' | 'strange'
export type DreamVisibility = 'private' | 'circle' | 'public'

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
  isPrivate?: boolean     // legacy — use visibility instead
  visibility: DreamVisibility   // 'private' | 'circle' | 'public'
  circleId?: string             // which circle, when visibility === 'circle'
  inStory: boolean              // added to dream story (24h visible)
  inFeed: boolean               // mirrored to social feed
  thumbnailUrl?: string         // auto-assigned from pool on save
  interpretations?: DreamInterpretation[]
  comments?: Comment[]
  bookmarked?: boolean
}

export interface DreamInterpretation {
  id: string
  framework: 'jungian' | 'freudian' | 'symbolic' | 'narrative' | 'neuroscience'
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
  username: string      // @handle, unique
  email: string
  dob: string           // ISO date string "1990-05-21"
  zodiacSign: ZodiacSign
  createdAt: string
  photoURL?: string
  whatsAppNumber?: string  // E.164 format e.g. "+447911123456"
}

// ── Social ────────────────────────────────────────────────

export interface DreamCircle {
  id: string
  name: string
  color: string         // CSS color
  memberIds: string[]   // Firebase UIDs
  createdAt: string
}

// Top-level feed doc (denormalised for social queries)
export interface FeedPost {
  id: string            // same as dreamId
  authorId: string
  authorName: string
  authorPhoto?: string
  dreamId: string
  title: string
  transcript: string
  mood: DreamMood
  tags: string[]
  visibility: 'circle' | 'public'
  circleId?: string
  inStory: boolean
  createdAt: string
}

// ── AI & Analysis ─────────────────────────────────────────

export interface AIChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export interface DreamPattern {
  id: string
  name: string           // e.g. "Water", "Being chased"
  count: number
  dreamIds: string[]
  lastSeen: string       // ISO date
}

export interface DreamSymbol {
  id: string
  name: string
  occurrences: number
  dreamIds: string[]
  firstSeen: string
  lastSeen: string
}

export interface MoonPhaseInfo {
  phase: string        // "New Moon", "Waxing Crescent", etc.
  symbol: string       // Unicode symbol: 🌑🌒🌓🌔🌕🌖🌗🌘
  illumination: number // 0–1
  index: number        // 0–7
}
