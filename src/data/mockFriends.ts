import type { Dream, Friend } from '../types/dream'

function daysAgo(n: number): string {
  return new Date(Date.now() - 86400000 * n).toISOString()
}

const LUNA_DREAMS: Dream[] = [
  {
    id: 'luna-1',
    createdAt: daysAgo(1),
    title: 'The Silver Ocean',
    transcript:
      'I stood at the edge of an ocean that was entirely silver — not grey, but metallic and mirror-bright. The waves moved in slow motion and when they broke they made no sound. I walked in and the water rose around me but I could breathe. At the bottom I found a garden of black coral with fish made of light moving through it. A woman with no face handed me a stone that felt warm. I held it and understood something I cannot explain in words.',
    mood: 'peaceful',
    lucid: false,
    clarity: 5,
    recurring: false,
    tags: ['water', 'light', 'symbols'],
    sleepQuality: 5,
    isPrivate: false,
  },
  {
    id: 'luna-2',
    createdAt: daysAgo(4),
    title: 'The Forest That Breathed',
    transcript:
      'I was in a forest where every tree trunk had a faint pulse, like a heartbeat under bark. I pressed my hand to one and felt it beating in sync with mine. The leaves were dark green and enormous, filtering the light into something almost purple. A deer with antlers made of branches appeared and led me to a clearing where a ring of mushrooms formed a perfect circle. Inside the circle the air was different — thicker, older. I sat down and wept, though I did not know why.',
    mood: 'strange',
    lucid: false,
    clarity: 4,
    recurring: false,
    tags: ['nature', 'animals', 'symbols'],
    sleepQuality: 4,
    isPrivate: false,
  },
  {
    id: 'luna-3',
    createdAt: daysAgo(11),
    title: 'Falling Into Stars',
    transcript:
      'I fell but not downward — I fell upward, through the floor of the sky and into open space. Stars surrounded me in every direction. I was not afraid. My body dissolved at the edges until I was not sure where I ended and the cosmos began. I heard a sound like a very low frequency hum, and I understood it was the sound of everything existing at once. Then a hand reached down and pulled me back through.',
    mood: 'joyful',
    lucid: true,
    clarity: 5,
    recurring: false,
    tags: ['flying', 'light', 'cosmos'],
    sleepQuality: 5,
    isPrivate: false,
  },
  {
    id: 'luna-4',
    createdAt: daysAgo(19),
    title: 'The House of Many Doors',
    transcript:
      'There was a house I had never seen but knew intimately. Every room had a door that opened onto a different landscape — one onto a desert at dawn, one onto a city underwater, one onto pure darkness. I kept opening doors looking for something specific but I could not remember what I was looking for. The last door I opened led back to my childhood bedroom exactly as I remembered it down to a crack in the ceiling I had forgotten.',
    mood: 'anxious',
    lucid: false,
    clarity: 3,
    recurring: true,
    tags: ['house', 'symbols', 'darkness'],
    sleepQuality: 3,
    isPrivate: false,
  },
]

const THEO_DREAMS: Dream[] = [
  {
    id: 'theo-1',
    createdAt: daysAgo(2),
    title: 'Underwater City',
    transcript:
      'An entire city at the bottom of a sea, perfectly preserved and lit by bioluminescent plants growing through the windows. People moved through it in slow motion, going about ordinary tasks — buying bread, arguing, reading newspapers — as if being underwater was entirely normal. I swam between the buildings and no one noticed me. I found a library where all the books were sealed in glass and their pages kept turning by themselves.',
    mood: 'strange',
    lucid: false,
    clarity: 4,
    recurring: false,
    tags: ['water', 'city', 'symbols'],
    sleepQuality: 4,
    isPrivate: false,
  },
  {
    id: 'theo-2',
    createdAt: daysAgo(7),
    title: 'The Serpent Bridge',
    transcript:
      'A bridge stretched across a gorge so deep the bottom was invisible. The bridge itself was alive — it moved and contracted like a serpent breathing. I had to cross it to reach something important on the other side, a building or a person I cannot remember. Every step I took the bridge rippled under me. Halfway across I looked down and understood the depth was not empty but full of things I had left behind at different points in my life. The crossing took everything I had.',
    mood: 'anxious',
    lucid: false,
    clarity: 4,
    recurring: true,
    tags: ['symbols', 'darkness', 'animals'],
    sleepQuality: 2,
    isPrivate: false,
  },
  {
    id: 'theo-3',
    createdAt: daysAgo(14),
    title: 'The Burning Archive',
    transcript:
      'I was inside what appeared to be an ancient archive — scrolls and documents piled from floor to ceiling — and it was on fire but the fire moved in the wrong direction, downward, as if the floor was the source. I tried to save the documents and could grab some but they crumbled into ash as soon as I touched them. The fire did not feel hot. A man in a long coat stood in the corner reading calmly as everything burned and he looked at me and said something I could not hear.',
    mood: 'scary',
    lucid: false,
    clarity: 3,
    recurring: false,
    tags: ['fire', 'darkness', 'people'],
    sleepQuality: 2,
    isPrivate: false,
  },
]

const MAYA_DREAMS: Dream[] = [
  {
    id: 'maya-1',
    createdAt: daysAgo(1),
    title: 'Two Skies at Once',
    transcript:
      'The sky was split in half — literally bisected by a clean horizontal line. Above the line it was noon, blazing and hot. Below the line it was night with full stars. I stood at the exact boundary and could put one hand into each. The people around me could only see one sky or the other depending on where they were standing. I was the only one who could see both. A child tugged my sleeve and said "you are standing in the seam." I woke up repeating that sentence.',
    mood: 'strange',
    lucid: true,
    clarity: 5,
    recurring: false,
    tags: ['light', 'symbols', 'people'],
    sleepQuality: 5,
    isPrivate: false,
  },
  {
    id: 'maya-2',
    createdAt: daysAgo(5),
    title: 'Flying Through a Market',
    transcript:
      'I discovered I could fly but only about four feet off the ground, which meant I skimmed through a crowded market at exactly eye level with the awnings. People were selling things I did not recognize — bottled sounds, folded silences, small jars of color. I bought something but cannot remember what. The flying felt completely natural and I kept thinking I should do this more often. At the end of the market the ground dropped away into ocean and I just kept flying.',
    mood: 'joyful',
    lucid: true,
    clarity: 5,
    recurring: true,
    tags: ['flying', 'people', 'water'],
    sleepQuality: 5,
    isPrivate: false,
  },
  {
    id: 'maya-3',
    createdAt: daysAgo(12),
    title: 'The Mirror Maze',
    transcript:
      'I was inside a maze made entirely of mirrors, each one reflecting a version of me that was slightly different — older, younger, sadder, laughing. I tried to find my actual reflection but every mirror showed a different version and none of them matched how I felt on the inside. In the center of the maze there was no mirror at all, just open sky and a chair. I sat down and the mirrors all went dark one by one. It was the most peaceful feeling I have ever had in a dream.',
    mood: 'peaceful',
    lucid: false,
    clarity: 4,
    recurring: false,
    tags: ['symbols', 'light', 'darkness'],
    sleepQuality: 4,
    isPrivate: false,
  },
]

const ZARA_DREAMS: Dream[] = [
  {
    id: 'zara-1',
    createdAt: daysAgo(3),
    title: 'The Golden Audience',
    transcript:
      'I was performing on a stage but the audience was made of golden statues, all turned toward me, all perfectly still. When I spoke the statues vibrated slightly, a barely perceptible hum. I realized they were not statues but people who had turned to gold while waiting — waiting specifically for this, for me to arrive and perform. I sang something I do not know how to sing and it was the most beautiful sound I have ever made. When I finished, one statue — the one in the front row — began to crack.',
    mood: 'joyful',
    lucid: false,
    clarity: 4,
    recurring: false,
    tags: ['light', 'people', 'symbols'],
    sleepQuality: 4,
    isPrivate: false,
  },
  {
    id: 'zara-2',
    createdAt: daysAgo(8),
    title: 'Running Through Light',
    transcript:
      'I was running through what seemed like solid light — not space lit by light, but light itself as a physical medium, warm and slightly resistant like moving through water. I was not running from anything, only toward. The landscape shifted constantly — desert, then forest, then a city that was also a garden. My legs never tired. I felt like I was burning from the inside with something good. I outran every geography until I reached an edge that was simply sky in every direction.',
    mood: 'joyful',
    lucid: false,
    clarity: 5,
    recurring: false,
    tags: ['light', 'flying', 'nature'],
    sleepQuality: 5,
    isPrivate: false,
  },
  {
    id: 'zara-3',
    createdAt: daysAgo(16),
    title: 'The Moon Came Down',
    transcript:
      'The moon descended, slowly but visibly, until it was just above the rooftops. It was huge — bigger than anything has a right to be — and warm orange-white. People came out of their buildings to look at it and no one was afraid, everyone was just in awe. I climbed to the roof and reached out and touched it and it was warm like a living thing. It hummed under my hand. A crack appeared in it and light poured out in a beam that hit me in the chest.',
    mood: 'peaceful',
    lucid: false,
    clarity: 5,
    recurring: false,
    tags: ['light', 'cosmos', 'people'],
    sleepQuality: 5,
    isPrivate: false,
  },
  {
    id: 'zara-4',
    createdAt: daysAgo(23),
    title: 'The Chase in the Library',
    transcript:
      'Something was chasing me through a library that kept adding shelves behind me, blocking my route back. I could hear it moving — a rhythmic scraping sound — but every time I turned there was only more shelving. The books on the shelves had my name on their spines and I wanted to stop and read them but the sound kept getting closer. I finally found a door, went through it, and was in the same library again from the beginning, the sound already starting behind me.',
    mood: 'scary',
    lucid: false,
    clarity: 3,
    recurring: true,
    tags: ['chase', 'darkness', 'symbols'],
    sleepQuality: 2,
    isPrivate: false,
  },
]

export const MOCK_FRIENDS: Friend[] = [
  {
    id: 'friend-luna',
    name: 'Luna',
    zodiacSign: 'pisces',
    avatarInitials: 'LN',
    dreamCount: 47,
    recentDreams: LUNA_DREAMS,
    sharedTags: ['water', 'light', 'symbols'],
    compatibility: 88,
  },
  {
    id: 'friend-theo',
    name: 'Theo',
    zodiacSign: 'scorpio',
    avatarInitials: 'TH',
    dreamCount: 31,
    recentDreams: THEO_DREAMS,
    sharedTags: ['darkness', 'symbols', 'water'],
    compatibility: 72,
  },
  {
    id: 'friend-maya',
    name: 'Maya',
    zodiacSign: 'gemini',
    avatarInitials: 'MY',
    dreamCount: 58,
    recentDreams: MAYA_DREAMS,
    sharedTags: ['flying', 'light', 'people'],
    compatibility: 65,
  },
  {
    id: 'friend-zara',
    name: 'Zara',
    zodiacSign: 'leo',
    avatarInitials: 'ZR',
    dreamCount: 39,
    recentDreams: ZARA_DREAMS,
    sharedTags: ['light', 'people', 'flying'],
    compatibility: 74,
  },
]
