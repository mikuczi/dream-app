export interface DreamSymbol {
  id: string
  name: string
  category: 'element' | 'action' | 'creature' | 'place' | 'object' | 'emotion'
  meaning: string       // 2-3 sentences, poetic but grounded
  jungian: string       // 1-sentence Jungian interpretation
  frequency: 'common' | 'rare' | 'universal'
  relatedTags: string[] // which dream tags this relates to
}

export const DREAM_SYMBOLS: DreamSymbol[] = [
  {
    id: 'water',
    name: 'Water',
    category: 'element',
    meaning:
      'Water is the oldest metaphor for the unconscious mind — formless, deep, capable of both sustaining life and swallowing it whole. In dreams it mirrors the emotional state beneath awareness: calm water suggests integration, turbulent water signals unprocessed feeling. The depth you venture into often corresponds to how far you are willing to go into yourself.',
    jungian:
      'Jung identified water as the primary symbol of the unconscious, representing the depths of the psyche where transformation originates.',
    frequency: 'universal',
    relatedTags: ['water', 'ocean', 'river', 'rain'],
  },
  {
    id: 'fire',
    name: 'Fire',
    category: 'element',
    meaning:
      'Fire in dreams is almost always transformative — it destroys what no longer serves and makes space for what must come. Unlike its waking danger, dream fire is rarely simply destructive; it tends to burn with intention, pointing toward what needs to be released or purified. Pay attention to whether you control it or it controls you.',
    jungian:
      'Fire represents the libido and creative energy in Jungian theory, the force of consciousness itself cutting through the dark of the unconscious.',
    frequency: 'common',
    relatedTags: ['fire', 'light', 'burning'],
  },
  {
    id: 'flying',
    name: 'Flying',
    category: 'action',
    meaning:
      'To fly in a dream is to inhabit freedom outside the body\'s ordinary limitations. It signals an expansion of perspective — you are gaining altitude over a situation that felt grounding or constraining. The manner of flight matters: effortless soaring suggests genuine liberation, while struggling to stay airborne points to ambition strained by doubt.',
    jungian:
      'Flying represents transcendence of the ego\'s limitations and a desire to rise above material reality into the realm of spirit and possibility.',
    frequency: 'universal',
    relatedTags: ['flying', 'freedom', 'sky'],
  },
  {
    id: 'falling',
    name: 'Falling',
    category: 'action',
    meaning:
      'Falling dreams occur most often during periods of transition or insecurity — they are the body\'s metaphor for the loss of control. The fall itself rarely matters as much as the emotional tone: do you panic, accept, or even enjoy it? Most dreamers who reach the ground find it less catastrophic than feared, suggesting the fear of falling is often worse than whatever it represents.',
    jungian:
      'Falling symbolizes the ego\'s confrontation with forces larger than itself, and the necessary deflation of inflation or overextension.',
    frequency: 'universal',
    relatedTags: ['falling', 'fear', 'loss'],
  },
  {
    id: 'being-chased',
    name: 'Being Chased',
    category: 'action',
    meaning:
      'What pursues you in dreams almost never wants to harm you in the way you fear — it wants to be acknowledged. Chase dreams are avoidance dreams, pointing to something you have been unwilling to confront: a decision, an emotion, a version of yourself you have put off meeting. The moment you stop running and turn to face the pursuer, it almost always loses its power.',
    jungian:
      'Being chased is one of the clearest manifestations of the Shadow — those aspects of the self that have been repressed and now pursue integration.',
    frequency: 'universal',
    relatedTags: ['chase', 'fear', 'darkness'],
  },
  {
    id: 'teeth',
    name: 'Teeth',
    category: 'object',
    meaning:
      'Dreams of losing teeth are among the most reported in the world, crossing culture and continent. They tend to cluster around experiences of powerlessness, fear of judgment, or transitions that require you to shed something — a relationship, an identity, a way of presenting yourself to the world. Teeth are how we bite into life; their loss signals anxiety about one\'s capacity to do so.',
    jungian:
      'Teeth represent the ability to assert, chew through obstacles, and maintain one\'s power in the world; their loss indicates threatened confidence or vitality.',
    frequency: 'universal',
    relatedTags: ['body', 'anxiety', 'loss'],
  },
  {
    id: 'house',
    name: 'House',
    category: 'place',
    meaning:
      'The house in dreams is almost universally a map of the self — its rooms correspond to aspects of your psychology, its condition reflects your inner state. An unfamiliar room discovered in a known house often signals a newly emerging capacity or a forgotten part of yourself becoming available. The basement holds what has been buried; the attic holds what has been transcended or left behind.',
    jungian:
      'Jung used the house as his central metaphor for the psyche, with the various floors and rooms representing different levels and facets of the self.',
    frequency: 'universal',
    relatedTags: ['house', 'home', 'symbols'],
  },
  {
    id: 'forest',
    name: 'Forest',
    category: 'place',
    meaning:
      'The forest is the world before it was organized by human meaning — wild, dense, and navigable only by instinct. In dreams it represents the unconscious in its most organic form, the inner life that refuses to be domesticated. To be lost in a forest is not simply frightening; it is an invitation to navigate by senses other than reason, to trust the path that shows itself rather than the one you planned.',
    jungian:
      'The forest is a symbol of the collective unconscious and the instinctual self, the place where civilization ends and the psyche\'s deeper nature begins.',
    frequency: 'common',
    relatedTags: ['nature', 'forest', 'darkness'],
  },
  {
    id: 'ocean',
    name: 'Ocean',
    category: 'place',
    meaning:
      'The ocean is water in its most vast and impersonal form — it represents the collective unconscious, the depths of inherited memory, and everything that lies beyond the individual self. Standing at its shore is a classic threshold image: the moment before a major change. To enter the ocean willingly in a dream signals a readiness to encounter what is larger than you.',
    jungian:
      'The ocean represents the collective unconscious in its fullest extent — the totality of psychic possibilities shared by all humanity across time.',
    frequency: 'universal',
    relatedTags: ['water', 'ocean', 'depth'],
  },
  {
    id: 'death-transformation',
    name: 'Death',
    category: 'emotion',
    meaning:
      'Death in dreams almost never predicts literal death — it predicts change. The psyche uses the most complete form of ending available to it when something significant is about to transform: an identity, a phase, a way of being. Dreaming of your own death often coincides with the beginning of something new that has no room for who you used to be. What dies in the dream is usually what must.',
    jungian:
      'Death represents the death-rebirth archetype, the necessary dissolution of the old self as prerequisite for individuation and growth.',
    frequency: 'common',
    relatedTags: ['death', 'transformation', 'symbols'],
  },
  {
    id: 'snake',
    name: 'Snake',
    category: 'creature',
    meaning:
      'The snake is one of humanity\'s oldest symbols — it appears in the creation stories of nearly every culture, nearly always at the intersection of wisdom and danger. In dreams it carries both the capacity to poison and the capacity to heal, often appearing at moments when transformation is imminent. To be bitten is often less ominous than it seems; the venom is frequently the medicine.',
    jungian:
      'The snake is a symbol of the unconscious libido, wisdom, and transformation — the chthonic aspect of the psyche that operates outside rational control.',
    frequency: 'common',
    relatedTags: ['animals', 'symbols', 'transformation'],
  },
  {
    id: 'mirror',
    name: 'Mirror',
    category: 'object',
    meaning:
      'A mirror in a dream presents the question of self-knowledge in its most direct form. The reflection you see — distorted, absent, replaced by a stranger, or unexpectedly clear — describes your relationship to your own image at the time of the dream. A cracked mirror suggests a self-conception under stress; a dark mirror suggests an unwillingness to look; a perfectly clear mirror indicates an unusual moment of honest self-perception.',
    jungian:
      'The mirror represents the capacity for self-reflection and the confrontation with the persona versus the authentic self beneath it.',
    frequency: 'common',
    relatedTags: ['symbols', 'light', 'self'],
  },
  {
    id: 'light',
    name: 'Light',
    category: 'element',
    meaning:
      'Light in dreams marks the presence of consciousness or insight in a place that was previously dark or unknown. The moment light appears in a dream space, something has shifted — an understanding has arrived, a problem has been illuminated, a fear has been named. The source of the light matters: sunlight speaks of outer clarity, candlelight of intimate knowing, strange sourceless light of the numinous.',
    jungian:
      'Light represents the illuminating function of consciousness, the movement of the ego toward what was previously unconscious and unknown.',
    frequency: 'universal',
    relatedTags: ['light', 'clarity', 'insight'],
  },
  {
    id: 'darkness',
    name: 'Darkness',
    category: 'element',
    meaning:
      'Darkness in dreams is not the absence of light — it is the presence of what has not yet been seen. The unconscious before it has been named is darkness, and it is not hostile; it is simply unlit. Fear of the dark in a dream reflects the mind\'s resistance to encountering what it cannot yet see or control. The things that live in dream darkness are rarely as threatening as the darkness itself suggests.',
    jungian:
      'Darkness corresponds to the unconscious itself and the Shadow — those parts of the psyche that consciousness has not yet integrated or is actively avoiding.',
    frequency: 'universal',
    relatedTags: ['darkness', 'shadow', 'unknown'],
  },
  {
    id: 'bridge',
    name: 'Bridge',
    category: 'place',
    meaning:
      'A bridge is a transition structure — it exists only to connect what is otherwise separated, and to dream of one is to stand at a passage between two states of being. The condition of the bridge matters enormously: a solid bridge suggests a reliable transition, a damaged or swaying bridge signals uncertainty about the crossing, and a bridge under construction suggests you are building the way as you go. The most significant question is always: what is on the other side?',
    jungian:
      'The bridge is an archetypal symbol of transition between psychological states, representing the capacity to cross from one level of development to another.',
    frequency: 'common',
    relatedTags: ['journey', 'symbols', 'transition'],
  },
  {
    id: 'stranger',
    name: 'Stranger',
    category: 'emotion',
    meaning:
      'Unknown figures in dreams are almost always aspects of yourself rendered unrecognizable — the parts too threatening or unfamiliar to present under your own name. The stranger who feels menacing often carries the energy of the repressed Shadow; the stranger who seems to know you already may be bringing knowledge from a part of yourself that operates below conscious awareness. It is worth asking: what quality does this person embody that you have been unwilling to claim?',
    jungian:
      'The stranger represents the Shadow or the Anima/Animus — projections of unknown aspects of the self that appear in personified form.',
    frequency: 'universal',
    relatedTags: ['people', 'shadow', 'unknown'],
  },
  {
    id: 'child',
    name: 'Child',
    category: 'creature',
    meaning:
      'A child in a dream carries the energy of potential, innocence, or the wounded early self depending on context. A radiant child often represents the divine inner child — creativity and possibility uncontaminated by experience. A frightened or abandoned child points toward unhealed early experiences still seeking integration. To care for a dream child is to tend to something essential and original in yourself.',
    jungian:
      'The child archetype represents the anticipation of future wholeness, the self in its most potential state before the damage of adaptation.',
    frequency: 'common',
    relatedTags: ['people', 'symbols', 'healing'],
  },
  {
    id: 'hands',
    name: 'Hands',
    category: 'object',
    meaning:
      'Hands in dreams speak directly to agency — to what we create, offer, take, or withhold. Hands that reach toward you may be offering help or asking for it. Hands that grip suggest control or fear of loss. Hands that open carry generosity or surrender. When you look at your own hands in a dream and they appear strange, the dream is asking you to reconsider what you are doing and whether you recognize yourself in your actions.',
    jungian:
      'Hands represent the capacity for action and creation, the executive function of the ego manifesting intention into reality.',
    frequency: 'common',
    relatedTags: ['body', 'action', 'symbols'],
  },
  {
    id: 'clock-time',
    name: 'Clock / Time',
    category: 'object',
    meaning:
      'Clocks and time distortions in dreams reflect the mind\'s relationship to mortality, urgency, and the sensation of running out of something — time, opportunity, youth. A stopped clock suggests a wish for suspension of change; a clock running backward suggests regret or an attempt to undo; a clock face without hands suggests an anxiety so complete the structure of time itself feels unreliable. Time in dreams is never just time.',
    jungian:
      'Time represents the tension between the eternal (the unconscious) and the finite (the ego), and the pressure of becoming within the limitations of a mortal life.',
    frequency: 'common',
    relatedTags: ['time', 'anxiety', 'symbols'],
  },
  {
    id: 'door',
    name: 'Door',
    category: 'object',
    meaning:
      'A door in a dream marks the threshold between states — what you know and what you do not yet know, who you are and who you might become. The dreamer\'s response to a closed door is revealing: the impulse to open it, flee from it, or stand frozen before it each carries meaning. A door that cannot be opened from one side suggests blocked access; a door that opens onto unexpected space suggests an invitation that cannot be fully anticipated.',
    jungian:
      'The door is the classic threshold symbol, representing the transition between the conscious and unconscious, and the invitation to cross from one psychological state into another.',
    frequency: 'universal',
    relatedTags: ['symbols', 'transition', 'house'],
  },
  {
    id: 'animals',
    name: 'Animals',
    category: 'creature',
    meaning:
      'Animals in dreams represent instinctual forces — the parts of the psyche that predate language and socialization. They arrive with the energy of their nature: predators bring the question of power, domestic animals bring the question of relationship, wild animals bring the question of what has been untamed in you. A dream animal behaving unusually is especially significant; the deviation from its nature points directly toward whatever the dream is trying to communicate.',
    jungian:
      'Animals represent instinctual aspects of the unconscious, the libidinal energy and autonomous forces that exist beneath the rational ego.',
    frequency: 'universal',
    relatedTags: ['animals', 'nature', 'instinct'],
  },
  {
    id: 'city',
    name: 'City',
    category: 'place',
    meaning:
      'A city in dreams represents the collective self — the organized, social dimension of the psyche, the part shaped by other people and by participation in shared life. An unfamiliar city suggests a new dimension of your social identity becoming available. A city in decay points to neglected connections or abandoned aspects of your public self. To be lost in a city is to lose orientation within your own social role.',
    jungian:
      'The city represents the collective aspect of the psyche, the persona, and the complex social structures through which the self becomes legible to others.',
    frequency: 'common',
    relatedTags: ['city', 'people', 'society'],
  },
  {
    id: 'void',
    name: 'Void',
    category: 'place',
    meaning:
      'The void is the most stripped-down dream environment — pure potential before form. It tends to feel disturbing initially because the mind expects content and finds none, but sitting with the void often reveals it to be less empty than it appears. In many traditions it is the space of creation itself, the ground state before the dream becomes populated with metaphor. To dream in the void is to visit the beginning of things.',
    jungian:
      'The void represents the prima materia — the undifferentiated unconscious from which all psychological contents must eventually emerge into form.',
    frequency: 'rare',
    relatedTags: ['darkness', 'emptiness', 'cosmos'],
  },
  {
    id: 'moon',
    name: 'Moon',
    category: 'object',
    meaning:
      'The moon in dreams governs the feminine principle, cycles, and the light that illuminates without blinding. Unlike the sun, which represents conscious understanding, the moon shows things by reflection — it reveals the shape of what is true without the full force of direct knowing. A full moon in a dream often marks a moment of culmination or revelation; a new moon marks a beginning that cannot yet be fully seen.',
    jungian:
      'The moon represents the Anima and the unconscious — the reflective, cyclical, emotionally intelligent dimension of the psyche that illuminates what the ego\'s daylight cannot reach.',
    frequency: 'universal',
    relatedTags: ['cosmos', 'light', 'symbols'],
  },
]
