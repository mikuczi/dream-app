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
  { id: 'u1', name: 'Alicja',   initials: 'Al', zodiac: '♓', viewed: false, avatar: '/photos/Alicja.png',   email: 'alicja@example.com'   },
  { id: 'u2', name: 'Sofia',    initials: 'So', zodiac: '♏', viewed: false, avatar: '/photos/Sofia.png',    email: 'sofia@example.com'    },
  { id: 'u3', name: 'Justyna',  initials: 'Ju', zodiac: '♊', viewed: true,  avatar: '/photos/Justyna.png',  email: 'justyna@example.com'  },
  { id: 'u4', name: 'Karlina',  initials: 'Ka', zodiac: '♌', viewed: false, avatar: '/photos/Karolina.png', email: 'karlina@example.com'  },
]

// Each user gets 1–2 story dreams (the story strip)
export const STORY_DREAMS: CommunityDream[] = [
  {
    id: 's1', userId: 'u1',
    title: 'Childhood House Restored',
    text: 'I was back in my old childhood home, but everything was brand new and much larger. My old dog was there, waiting by the porch. It felt incredibly peaceful.',
    tags: ['Nostalgic', 'Home', 'Peaceful'],
    mood: 'peaceful', likes: 432, comments: 12, saves: 58, timeAgo: '1d',
    visual: 'url(/photos/Dream1.jpg) center/cover',
    liked: false, saved: false,
  },
  {
    id: 's2', userId: 'u2',
    title: 'The Glass Ocean',
    text: 'I stood at the edge of an ocean made entirely of glass. When I stepped in, it shattered silently into thousands of mirrors, each reflecting a different version of me.',
    tags: ['Water', 'Mirror', 'Surreal'],
    mood: 'strange', likes: 287, comments: 31, saves: 44, timeAgo: '3h',
    visual: 'url(/photos/Dream2.jpg) center/cover',
    liked: false, saved: false,
  },
  {
    id: 's3', userId: 'u4',
    title: 'Flying Over the City',
    text: 'I was flying effortlessly above a city I didn\'t recognize. The streets below glowed amber and violet. I could feel the cold wind — it was the most alive I\'ve ever felt.',
    tags: ['Flight', 'Freedom', 'City'],
    mood: 'joyful', likes: 614, comments: 47, saves: 89, timeAgo: '6h',
    visual: 'url(/photos/Dream3.jpg) center/cover',
    liked: false, saved: false,
  },
  {
    id: 's6', userId: 'u3',
    title: 'Underwater City',
    text: 'There was an entire civilization beneath the sea. They breathed water like air. They offered me gills carved from moonstone and asked if I wanted to stay.',
    tags: ['Ocean', 'Ancient', 'Choice'],
    mood: 'strange', likes: 509, comments: 63, saves: 77, timeAgo: '5h',
    visual: 'url(/photos/Dream6.jpg) center/cover',
    liked: false, saved: false,
  },
]

// Extended feed with more dreams
export const FEED_DREAMS: CommunityDream[] = [
  ...STORY_DREAMS,
  {
    id: 'f9', userId: 'u2',
    title: 'My Grandmother\'s Garden',
    text: 'I found the garden exactly as I remembered it from childhood — but blooming in winter. She was there, younger than I ever knew her, and she told me something I can\'t remember now.',
    tags: ['Family', 'Nostalgic', 'Garden'],
    mood: 'peaceful', likes: 883, comments: 71, saves: 134, timeAgo: '2d',
    visual: 'url(/photos/dream9.jpg) center/cover',
    liked: false, saved: false,
  },
  {
    id: 'f10', userId: 'u4',
    title: 'The Figure on the Shore',
    text: 'It stood at the edge of the water, luminous — a silhouette made of light. It reached out and I understood, without words, that it was showing me something about who I would become.',
    tags: ['Shadow', 'Light', 'Spiritual'],
    mood: 'strange', likes: 441, comments: 38, saves: 67, timeAgo: '4d',
    visual: 'url(/photos/dream10.jpg) center/cover',
    liked: false, saved: false,
  },
  {
    id: 'f11', userId: 'u1',
    title: 'The Falling Body',
    text: 'I watched myself fall through darkness, but I wasn\'t afraid. I was dissolving into particles, becoming the space between things. When I woke I still felt scattered.',
    tags: ['Falling', 'Transformation', 'Shadow'],
    mood: 'anxious', likes: 567, comments: 44, saves: 88, timeAgo: '3d',
    visual: 'url(/photos/dream11.jpg) center/cover',
    liked: false, saved: false,
  },
  {
    id: 'f12', userId: 'u3',
    title: 'Storm Made of Music',
    text: 'Every lightning bolt was a musical note. Thunder was the bass. I stood in the storm with my arms open and felt each bolt pass through me like a chord.',
    tags: ['Music', 'Storm', 'Transcendent'],
    mood: 'joyful', likes: 671, comments: 53, saves: 99, timeAgo: '5d',
    visual: 'url(/photos/Dream2.jpg) center/cover',
    liked: false, saved: false,
  },
]
