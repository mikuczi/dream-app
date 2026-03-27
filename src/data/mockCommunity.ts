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

export const COMMUNITY_USERS: CommunityUser[] = [
  { id: 'luna',  name: 'Luna M.',   initials: 'LM', zodiac: '♓', viewed: false },
  { id: 'theo',  name: 'Theo K.',   initials: 'TK', zodiac: '♊', viewed: false },
  { id: 'aria',  name: 'Aria S.',   initials: 'AS', zodiac: '♏', viewed: true  },
  { id: 'river', name: 'River J.',  initials: 'RJ', zodiac: '♒', viewed: false },
]

export const STORY_DREAMS: CommunityDream[] = [
  {
    id: 'story-1',
    userId: 'luna',
    title: 'The Silver Forest',
    text: 'I wandered through trees made of moonlight, each step leaving glowing footprints in the silver grass.',
    tags: ['Forest', 'Light', 'Transformation'],
    mood: 'peaceful',
    likes: 14, comments: 3, saves: 2,
    timeAgo: '2h ago',
    visual: 'radial-gradient(ellipse at 30% 40%, #1a2a4a 0%, #0d1a2e 60%, #060c18 100%)',
    liked: false, saved: false,
    authorName: 'Luna M.',
  },
  {
    id: 'story-2',
    userId: 'theo',
    title: 'Falling Upward',
    text: 'Instead of falling down, I kept rising through layers of clouds until the earth below looked like a painting.',
    tags: ['Flying', 'Stars', 'Journey'],
    mood: 'joyful',
    likes: 9, comments: 1, saves: 5,
    timeAgo: '5h ago',
    visual: 'linear-gradient(160deg, #0a0a2e 0%, #1a0a3a 50%, #0d0520 100%)',
    liked: false, saved: false,
    authorName: 'Theo K.',
  },
  {
    id: 'story-3',
    userId: 'river',
    title: 'The Endless Library',
    text: 'Every book contained a different version of my life. I read three before the librarian told me I had to choose one.',
    tags: ['Time', 'Transformation', 'People'],
    mood: 'strange',
    likes: 22, comments: 7, saves: 11,
    timeAgo: '8h ago',
    visual: 'radial-gradient(ellipse at 60% 50%, #1e0a30 0%, #0a0518 70%, #050210 100%)',
    liked: false, saved: false,
    authorName: 'River J.',
  },
]

export const FEED_DREAMS: CommunityDream[] = [
  {
    id: 'feed-1',
    userId: 'luna',
    title: 'The Silver Forest',
    text: 'I wandered through trees made of moonlight, each step leaving glowing footprints in the silver grass. A deer made of starlight crossed my path.',
    tags: ['Forest', 'Light', 'Animals'],
    mood: 'peaceful',
    likes: 14, comments: 3, saves: 2,
    timeAgo: '2h ago',
    visual: 'radial-gradient(ellipse at 30% 40%, #1a2a4a 0%, #0d1a2e 60%, #060c18 100%)',
    liked: false, saved: false,
    authorName: 'Luna M.',
  },
  {
    id: 'feed-2',
    userId: 'theo',
    title: 'Falling Upward',
    text: 'Instead of falling down, I kept rising through layers of clouds until the earth below looked like a painting.',
    tags: ['Flying', 'Stars', 'Journey'],
    mood: 'joyful',
    likes: 9, comments: 1, saves: 5,
    timeAgo: '5h ago',
    visual: 'linear-gradient(160deg, #0a0a2e 0%, #1a0a3a 50%, #0d0520 100%)',
    liked: false, saved: false,
    authorName: 'Theo K.',
  },
  {
    id: 'feed-3',
    userId: 'aria',
    title: 'Ocean Made of Glass',
    text: 'The sea was completely still and transparent — I could see cities beneath, their lights still on, people going about their lives.',
    tags: ['Ocean', 'Water', 'People'],
    mood: 'strange',
    likes: 31, comments: 8, saves: 14,
    timeAgo: '1d ago',
    visual: 'radial-gradient(ellipse at 50% 80%, #0a1e30 0%, #040e1c 60%, #020710 100%)',
    liked: false, saved: false,
    authorName: 'Aria S.',
  },
  {
    id: 'feed-4',
    userId: 'river',
    title: 'The Endless Library',
    text: 'Every book contained a different version of my life. I read three before the librarian told me I had to choose one.',
    tags: ['Time', 'Transformation', 'People'],
    mood: 'strange',
    likes: 22, comments: 7, saves: 11,
    timeAgo: '1d ago',
    visual: 'radial-gradient(ellipse at 60% 50%, #1e0a30 0%, #0a0518 70%, #050210 100%)',
    liked: false, saved: false,
    authorName: 'River J.',
  },
  {
    id: 'feed-5',
    userId: 'luna',
    title: 'My Grandmother\'s Kitchen',
    text: 'She was cooking something that smelled like every childhood memory at once. She spoke a language I don\'t know but understood completely.',
    tags: ['Family', 'Childhood', 'House'],
    mood: 'peaceful',
    likes: 44, comments: 12, saves: 19,
    timeAgo: '2d ago',
    visual: 'radial-gradient(ellipse at 40% 30%, #1a1010 0%, #0d0808 60%, #060404 100%)',
    liked: false, saved: false,
    authorName: 'Luna M.',
  },
]
