export interface CommunityUser {
  id: string
  name: string
  initials: string
  zodiac: string
  viewed: boolean
  avatar?: string
  email?: string
}

export interface CommunityDream {
  id: string
  userId: string
  title: string
  text: string
  tags: string[]
  mood: string
  likes: number
  comments: number
  saves: number
  timeAgo: string
  /** CSS background value or image URL for the dream visual */
  visual: string
  liked: boolean
  saved: boolean
  /** Story expiry ISO timestamp */
  storyExpiresAt?: string
  /** For Firestore-backed posts: author display info */
  authorName?: string
  authorPhoto?: string
}

export const COMMUNITY_USERS: CommunityUser[] = []

export const STORY_DREAMS: CommunityDream[] = []

export const FEED_DREAMS: CommunityDream[] = []
