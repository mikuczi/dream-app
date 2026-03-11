/**
 * Async dream analysis via Anthropic Claude.
 * Returns structured fields to patch into the dream record.
 */
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM = `You are a dream interpreter drawing on Jungian psychology, symbolism, and archetypal analysis.
Given a raw dream transcript, return a JSON object with these fields:
- title: string — a poetic 3–6 word title for the dream
- tags: string[] — 3–8 archetypal symbols or themes present (e.g. "water", "shadow", "flight")
- mood: "peaceful" | "joyful" | "anxious" | "scary" | "strange"
- lucid: boolean — did the dreamer seem aware they were dreaming?
- clarity: number — 1–10 vividness score based on detail richness
- interpretations: string[] — 2–4 short interpretive sentences (cosmic/Jungian tone)
- jungianTheme: string — the dominant Jungian archetype or complex at play
Respond ONLY with valid JSON. No markdown fences.`

export async function analyzeDream(transcript) {
  const message = await client.messages.create({
    model:      'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [
      {
        role:    'user',
        content: `Transcript:\n\n${transcript}`,
      },
    ],
    system: SYSTEM,
  })

  const raw = message.content[0]?.text ?? '{}'
  try {
    return JSON.parse(raw)
  } catch {
    console.error('[analyze] JSON parse failed:', raw)
    return {}
  }
}
