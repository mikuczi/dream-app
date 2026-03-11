import type { Dream, MoonPhaseInfo, ZodiacSign } from '../types/dream'

// ── Zodiac ────────────────────────────────────────────────────────────────

interface ZodiacData {
  sign: ZodiacSign
  symbol: string
  element: string
  dates: string
}

const ZODIAC_TABLE: Array<{
  sign: ZodiacSign
  symbol: string
  element: string
  dates: string
  startMonth: number
  startDay: number
}> = [
  { sign: 'capricorn',   symbol: '♑', element: 'Earth', dates: 'Dec 22 – Jan 19', startMonth: 12, startDay: 22 },
  { sign: 'aquarius',    symbol: '♒', element: 'Air',   dates: 'Jan 20 – Feb 18', startMonth: 1,  startDay: 20 },
  { sign: 'pisces',      symbol: '♓', element: 'Water', dates: 'Feb 19 – Mar 20', startMonth: 2,  startDay: 19 },
  { sign: 'aries',       symbol: '♈', element: 'Fire',  dates: 'Mar 21 – Apr 19', startMonth: 3,  startDay: 21 },
  { sign: 'taurus',      symbol: '♉', element: 'Earth', dates: 'Apr 20 – May 20', startMonth: 4,  startDay: 20 },
  { sign: 'gemini',      symbol: '♊', element: 'Air',   dates: 'May 21 – Jun 20', startMonth: 5,  startDay: 21 },
  { sign: 'cancer',      symbol: '♋', element: 'Water', dates: 'Jun 21 – Jul 22', startMonth: 6,  startDay: 21 },
  { sign: 'leo',         symbol: '♌', element: 'Fire',  dates: 'Jul 23 – Aug 22', startMonth: 7,  startDay: 23 },
  { sign: 'virgo',       symbol: '♍', element: 'Earth', dates: 'Aug 23 – Sep 22', startMonth: 8,  startDay: 23 },
  { sign: 'libra',       symbol: '♎', element: 'Air',   dates: 'Sep 23 – Oct 22', startMonth: 9,  startDay: 23 },
  { sign: 'scorpio',     symbol: '♏', element: 'Water', dates: 'Oct 23 – Nov 21', startMonth: 10, startDay: 23 },
  { sign: 'sagittarius', symbol: '♐', element: 'Fire',  dates: 'Nov 22 – Dec 21', startMonth: 11, startDay: 22 },
]

export function getZodiacSign(dob: string): ZodiacData {
  const date = new Date(dob)
  const month = date.getUTCMonth() + 1 // 1-12
  const day = date.getUTCDate()

  // Walk the table and find which sign the month/day falls in
  // Capricorn spans two calendar years (Dec 22 – Jan 19), handle specially
  for (const entry of ZODIAC_TABLE) {
    if (entry.sign === 'capricorn') {
      if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
        return { sign: entry.sign, symbol: entry.symbol, element: entry.element, dates: entry.dates }
      }
    } else {
      const nextIdx = ZODIAC_TABLE.indexOf(entry) + 1
      const next = ZODIAC_TABLE[nextIdx]
      // same month start
      if (month === entry.startMonth && day >= entry.startDay) {
        return { sign: entry.sign, symbol: entry.symbol, element: entry.element, dates: entry.dates }
      }
      // next sign starts next month — so this month before next start
      if (next && month === next.startMonth && day < next.startDay) {
        return { sign: entry.sign, symbol: entry.symbol, element: entry.element, dates: entry.dates }
      }
    }
  }

  // Fallback (shouldn't happen)
  return { sign: 'capricorn', symbol: '♑', element: 'Earth', dates: 'Dec 22 – Jan 19' }
}

export function getZodiacSymbol(sign: ZodiacSign): string {
  const entry = ZODIAC_TABLE.find((z) => z.sign === sign)
  return entry ? entry.symbol : '✦'
}

export function getZodiacElement(sign: ZodiacSign): string {
  const entry = ZODIAC_TABLE.find((z) => z.sign === sign)
  return entry ? entry.element : 'Fire'
}

export function getZodiacDates(sign: ZodiacSign): string {
  const entry = ZODIAC_TABLE.find((z) => z.sign === sign)
  return entry ? entry.dates : ''
}

// ── Moon Phase ────────────────────────────────────────────────────────────

const KNOWN_NEW_MOON = new Date('2000-01-06T18:14:00Z').getTime()
const SYNODIC_PERIOD = 29.53058867
const MS_PER_DAY = 86400000

const PHASE_NAMES = [
  'New Moon',
  'Waxing Crescent',
  'First Quarter',
  'Waxing Gibbous',
  'Full Moon',
  'Waning Gibbous',
  'Last Quarter',
  'Waning Crescent',
]

const PHASE_SYMBOLS = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘']

export function getMoonPhase(date: Date): MoonPhaseInfo {
  const daysSince = (date.getTime() - KNOWN_NEW_MOON) / MS_PER_DAY
  const cyclePos = ((daysSince % SYNODIC_PERIOD) + SYNODIC_PERIOD) % SYNODIC_PERIOD
  const index = Math.floor((cyclePos / SYNODIC_PERIOD) * 8)
  const safeIndex = Math.min(index, 7)
  const illumination = (1 - Math.cos((cyclePos / SYNODIC_PERIOD) * 2 * Math.PI)) / 2

  return {
    phase: PHASE_NAMES[safeIndex],
    symbol: PHASE_SYMBOLS[safeIndex],
    illumination,
    index: safeIndex,
  }
}

// ── Daily Cosmic Reading ──────────────────────────────────────────────────

type ElementGroup = 'fire' | 'earth' | 'air' | 'water'

function getElement(sign: ZodiacSign): ElementGroup {
  const fireSign: ZodiacSign[] = ['aries', 'leo', 'sagittarius']
  const earthSign: ZodiacSign[] = ['taurus', 'virgo', 'capricorn']
  const airSign: ZodiacSign[] = ['gemini', 'libra', 'aquarius']
  if (fireSign.includes(sign)) return 'fire'
  if (earthSign.includes(sign)) return 'earth'
  if (airSign.includes(sign)) return 'air'
  return 'water'
}

const READINGS: Record<ElementGroup, string[]> = {
  fire: [
    'The veil between worlds is thin tonight — your subconscious blazes with ancient fire.',
    'Mars ignites your dream space; expect visions of pursuit and triumph.',
    'Your sleeping mind burns with prophecy; what you see tonight has weight.',
    'The celestial fires stoke your inner vision — bold imagery awaits you.',
    'Solar energy pours through the dream gate; your night visions carry power.',
    'You walk through ember-lit corridors tonight, seeking what only sleep can reveal.',
    'The stars align your dreams with momentum — restless, vivid, alive.',
    'Ancestral fires flicker in tonight\'s dream landscape; listen to what they show.',
    'Your subconscious speaks in flame and light — transformation is close.',
    'The cosmos send you cinematic dreams tonight, full of motion and meaning.',
    'A burning clarity descends as you sleep; your night mind knows the answer.',
    'Tonight\'s sky ignites your dreamscape with courage and revelation.',
    'Your dreams carry the heat of unspoken truths tonight.',
    'The fire signs breathe through your sleep; expect journeys to unfamiliar suns.',
    'Boundaries dissolve between waking will and dreaming surrender.',
    'The celestial forge shapes something in your sleep tonight.',
    'What you seek in waking life appears in dream as symbol — watch for it.',
    'Your night visions are lit from within; the meaning lives in the light itself.',
    'The cosmos whisper of beginnings through tonight\'s dream language.',
    'Sleep is your oracle tonight; let the images come without resistance.',
  ],
  earth: [
    'The deep roots of memory rise through soil and sleep tonight.',
    'Your subconscious speaks in landscapes — forests, stone, and ancient earth.',
    'Tonight the ground beneath your dreams is steady; something solid is revealed.',
    'The earth remembers what the waking mind forgets; your sleep holds those memories.',
    'Slow and heavy, tonight\'s visions carry the weight of real meaning.',
    'Ancestral memories surface like roots seeking water in tonight\'s dream.',
    'Your sleeping mind tends the garden of what you truly need.',
    'The cosmos place your feet on firm ground even as you drift through dream.',
    'Something buried becomes visible tonight — a truth your body already knows.',
    'The earth element in you dreams in textures and seasons.',
    'Saturn\'s patience shapes your night visions; nothing shown is wasted.',
    'Tonight your dreams are archeological — layers of meaning wait to be uncovered.',
    'The body knows what the mind hides; sleep is where they finally meet.',
    'Your night mind moves slowly, deliberately, toward something essential.',
    'The veil is thin tonight and the earth side is rich with symbol.',
    'Old patterns surface gently in tonight\'s dream architecture.',
    'What you plant in intention blooms in tonight\'s unconscious landscape.',
    'The cosmos offer grounding visions tonight — pay attention to what feels real.',
    'Your subconscious speaks in the language of seasons and stone.',
    'Tonight\'s dream carries the weight of what is true and enduring.',
  ],
  air: [
    'Your subconscious speaks clearly tonight — the words come fast and full of meaning.',
    'Mercury dances through your dream corridors, leaving messages on every wall.',
    'The veil parts like a curtain in wind; what lies beyond is yours to read.',
    'Tonight your dreams move at the speed of thought — catch the flickers.',
    'Ideas that escaped you waking find you now in sleep.',
    'The cosmic winds carry your dreaming mind to places logic cannot reach.',
    'Your night visions are full of conversation, symbol, and sudden knowing.',
    'Boundaries dissolve between your mind and the wider dream field tonight.',
    'The air signs speak through image and word; listen to what is said in your sleep.',
    'A transmission arrives tonight in dream — take note of what you hear.',
    'Your sleeping mind is a receiver tuned to something just beyond ordinary sense.',
    'Tonight the stars scatter meaning like seeds — your dreams gather them.',
    'The cosmos gift you with clarity tonight; the symbols in your sleep are legible.',
    'Your subconscious reaches across time tonight, retrieving what was lost.',
    'What you could not articulate waking becomes clear in tonight\'s dream language.',
    'The veil thins and thought becomes vision — your mind ranges freely.',
    'Gemini energy weaves through tonight\'s dreamscape in riddle and rhyme.',
    'Your night mind is restless and brilliant; do not dismiss the fragments.',
    'Tonight\'s dreams are electric with possibility and half-remembered knowing.',
    'The cosmos speak in your own language tonight — the dreams will feel familiar.',
  ],
  water: [
    'The tides of the unconscious run deep tonight — surrender to what rises.',
    'Your subconscious speaks in oceans; let the symbols wash over you.',
    'The veil is thinnest at the water\'s edge, and tonight you dream there.',
    'Ancestral memories surface like waves; what arrives uninvited holds meaning.',
    'Boundaries dissolve between self and something older tonight.',
    'The moon pulls at your dream-water; expect visions of depth and reflection.',
    'Tonight you swim in the collective dream — what you see, others have seen.',
    'The water in you dreams of origin tonight; let it carry you.',
    'Your sleeping mind moves in currents older than memory.',
    'What the waking world cannot hold, the dreaming ocean receives tonight.',
    'Neptune\'s influence deepens your night visions beyond ordinary knowing.',
    'The cosmos flood your dream space with feeling — trust what moves you.',
    'Tonight you are permeable to whatever the deep sends up.',
    'Your subconscious speaks in tides and rain; the symbols are emotional, true.',
    'The veil is water-thin tonight and what lies beyond is already inside you.',
    'Scorpio\'s depth and Pisces\' dissolution shape tonight\'s dream current.',
    'What you feel most strongly in sleep holds the most waking truth.',
    'The dream waters are warm and full tonight — do not be afraid to go under.',
    'Boundaries between past and present dissolve in tonight\'s dream current.',
    'The cosmos have prepared a deep well for you tonight; your dreams know the way.',
  ],
}

function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

export function getDailyCosmicReading(sign: ZodiacSign, date: Date): string {
  const element = getElement(sign)
  const pool = READINGS[element]
  const key = sign + date.toDateString()
  const idx = hashString(key) % pool.length
  return pool[idx]
}

// ── Dream Interpretation ──────────────────────────────────────────────────

const MOOD_INSIGHTS: Record<string, string> = {
  peaceful: 'A serene emotional signature suggests your psyche is integrating past tensions — water imagery and open spaces often carry messages of resolution.',
  joyful: 'The uplift you felt points to creative energy seeking expression; your unconscious is rehearsing possibility.',
  anxious: 'Anxiety in dreams is rarely a warning — it is the mind metabolizing pressure, converting stress into symbol.',
  scary: 'Fear in the dream state marks the threshold of something important; what frightened you most likely holds the deepest meaning.',
  strange: 'Strange dreams signal the unconscious operating beyond habitual pattern — the stranger the imagery, the more original the insight.',
}

const TAG_INSIGHTS: Record<string, string> = {
  water: 'Water is the universal symbol of the unconscious itself — its presence suggests emotional processing and depth of feeling.',
  flying: 'Flight in dreams represents liberation from limitation; your psyche is testing what it feels like to move beyond constraint.',
  falling: 'Falling signals a release of control — the mind practicing surrender, or confronting a fear of loss.',
  chase: 'Being pursued suggests avoidance of something real; what chases you in dreams usually carries the face of what you have been putting off.',
  light: 'Luminosity in dreams marks moments of insight or awakening — the light appeared where meaning was most concentrated.',
  darkness: 'Darkness in dreams is not absence but potential — the unconscious before it has been named.',
  people: 'The figures in your dreams are often aspects of yourself in dialogue; notice who held power and who sought it.',
  symbols: 'Symbolic content suggests your unconscious is communicating in its most precise language — the symbols chose you, not the reverse.',
  nature: 'Natural settings in dreams represent the self in its least defended state; the landscape mirrors inner terrain.',
  work: 'Work imagery points to identity, performance, and the unresolved tensions of purpose and recognition.',
}

const LUCID_INSIGHTS = [
  'Lucid dreaming indicates heightened metacognitive capacity — you are developing the rare ability to witness your own unconscious.',
  'The moment of lucidity is a window between states; what you chose to do in that awareness reveals your deepest instincts.',
  'Consciousness within the dream is a profound threshold — your psyche is becoming its own observer.',
]

const CLARITY_INSIGHTS: Record<number, string> = {
  1: 'Faint impressions are not lesser dreams — often what barely survives into waking carries the most compressed meaning.',
  2: 'Fragmentary recall suggests the dream content was emotionally charged; the mind protecting something not yet ready for full light.',
  3: 'A moderate clarity is typical of REM-rich sleep; the images you do retain are the ones your unconscious most wanted you to keep.',
  4: 'High recall means these images arrived with intention — your sleeping mind wanted them remembered.',
  5: 'Crystalline clarity in a dream is rare and significant; the unconscious presented this material without ambiguity.',
}

export function getDreamInterpretation(dream: Dream): string[] {
  const insights: string[] = []

  // 1. Mood insight
  insights.push(MOOD_INSIGHTS[dream.mood] ?? MOOD_INSIGHTS['strange'])

  // 2. Tag insight — pick the first recognized tag
  let tagInsight: string | null = null
  for (const tag of dream.tags) {
    if (TAG_INSIGHTS[tag]) {
      tagInsight = TAG_INSIGHTS[tag]
      break
    }
  }
  if (!tagInsight) {
    tagInsight = 'The elements you noted act as coordinates — each one points toward a different layer of meaning.'
  }
  insights.push(tagInsight)

  // 3. Lucidity / clarity insight
  if (dream.lucid) {
    const idx = Math.abs(hashString(dream.id)) % LUCID_INSIGHTS.length
    insights.push(LUCID_INSIGHTS[idx])
  } else {
    const clarityKey = Math.min(Math.max(Math.round(dream.clarity), 1), 5) as 1 | 2 | 3 | 4 | 5
    insights.push(CLARITY_INSIGHTS[clarityKey])
  }

  return insights
}

// ── Zodiac Dream Descriptions ─────────────────────────────────────────────

export const ZODIAC_DREAM_DESCRIPTIONS: Record<ZodiacSign, string> = {
  aries: 'You dream in motion — pursuit, confrontation, and breakthrough are your native dream grammar. Your sleep is rarely passive; it rehearses courage. When Aries dreams deeply, even obstacles become doorways.',
  taurus: 'Your dreams are sensory and slow, rich with texture and terrain. You sleep to restore what the world depletes. In your deepest dreams, the earth speaks and beauty becomes instruction.',
  gemini: 'Your dreams are crowded with conversation and contradiction — two selves speaking across a shifting landscape. Sleep is where your duality finally meets. The fragments that don\'t cohere often carry the most meaning.',
  cancer: 'You dream in tides, returning always to origin — the house, the mother, the sea. Your sleep is emotionally full and sometimes difficult to leave. The feelings in your dreams are data, not drama.',
  leo: 'Your dreams are cinematic and self-aware. You tend to appear at the center of your own night theater, often with something essential at stake. When you dream well, you wake with renewed conviction.',
  virgo: 'Your dreams solve problems your waking mind cannot quite reach. Detail-rich and symbolic, they often contain precise images that carry practical meaning. Sleep is your most honest analyst.',
  libra: 'Your dreams are relational — filled with connection, negotiation, and the weight of unresolved beauty. You sleep best when your waking relationships are in balance. In dreams, you are always seeking the still point.',
  scorpio: 'You dream at depth others rarely reach. Your night visions carry transformation and revelation — what you encounter in sleep, you cannot fully unsee. The unconscious is your native terrain.',
  sagittarius: 'Your dreams take you far — across landscapes, civilizations, and timelines. Sleep is where your restlessness becomes vision. What you discover in your dreams expands the map you carry waking.',
  capricorn: 'Your dreams surface slowly and carry weight. The images are often architectural — towers, stairs, foundations. In sleep, your ambition meets your doubt, and sometimes, your ancestors speak.',
  aquarius: 'You dream in systems and futures — visions of what could exist, warnings of what should not. Your sleeping mind is a laboratory. What arrives in Aquarian dreams is rarely personal and always significant.',
  pisces: 'You are the most natural dreamer of the zodiac — the boundaries between sleep and waking are always thinner for you. Your dreams are mythic, porous, and full of feeling. What you dream, you half-remember all day.',
}
