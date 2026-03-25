/**
 * Dream Journal — WhatsApp Cloud API ingestion server
 *
 * Flow:
 *  1. Meta sends POST /webhook with voice note event
 *  2. We verify HMAC signature, immediately ACK the sender
 *  3. Download audio from Meta's short-lived URL
 *  4. Transcribe with OpenAI Whisper
 *  5. Save dream entry to Firestore
 *  6. Kick off async Claude analysis (patches record when done)
 *  7. Send confirmation reply to user
 */
import 'dotenv/config'
import express  from 'express'
import crypto   from 'crypto'
import { db }   from './firebase-admin.js'
import { downloadMedia, transcribeAudio } from './transcribe.js'
import { analyzeDream }    from './analyze.js'
import { createDream, getAllDreams } from './db.js'
import { ackMessage, confirmMessage } from './whatsapp.js'

const {
  WHATSAPP_VERIFY_TOKEN,
  WHATSAPP_APP_SECRET,
  PORT = 3000,
} = process.env

const app = express()

// ── CORS ───────────────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL ?? '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

// ── Raw body needed for HMAC verification ─────────────────
app.use(express.json({
  verify: (req, _res, buf) => { req.rawBody = buf }
}))

// ── Health check (Railway uses this) ─────────────────────
app.get('/health', (_req, res) => res.json({ ok: true }))

// ── Webhook verification (GET) ────────────────────────────
app.get('/webhook', (req, res) => {
  const mode      = req.query['hub.mode']
  const token     = req.query['hub.verify_token']
  const challenge = req.query['hub.challenge']

  if (mode === 'subscribe' && token === WHATSAPP_VERIFY_TOKEN) {
    console.log('[webhook] verified')
    return res.status(200).send(challenge)
  }
  res.sendStatus(403)
})

// ── Webhook event receiver (POST) ─────────────────────────
app.post('/webhook', async (req, res) => {
  // 1. Verify HMAC signature
  const sig = req.headers['x-hub-signature-256']
  if (WHATSAPP_APP_SECRET && sig) {
    const expected = 'sha256=' + crypto
      .createHmac('sha256', WHATSAPP_APP_SECRET)
      .update(req.rawBody)
      .digest('hex')
    if (sig !== expected) {
      console.warn('[webhook] bad signature')
      return res.sendStatus(401)
    }
  }

  // 2. Acknowledge Meta immediately (must reply within 20 s)
  res.sendStatus(200)

  // 3. Extract audio message(s)
  const entry   = req.body?.entry?.[0]
  const changes = entry?.changes ?? []

  for (const change of changes) {
    const messages = change.value?.messages ?? []
    for (const msg of messages) {
      if (msg.type !== 'audio') continue

      const from    = msg.from
      const mediaId = msg.audio?.id
      if (!mediaId) continue

      // Look up registered user from Firestore
      const userSnap = await db.collection('whatsapp_users').doc(from).get().catch(() => null)
      const userRecord = userSnap?.exists ? userSnap.data() : null
      console.log(`[webhook] voice note from ${from}, user=${userRecord?.userId ?? 'unknown'}, mediaId=${mediaId}`)

      processVoiceNote(from, mediaId, userRecord).catch(err =>
        console.error('[pipeline] error:', err)
      )
    }
  }
})

async function processVoiceNote(from, mediaId, userRecord = null) {
  await ackMessage(from).catch(() => {})

  console.log(`[pipeline] downloading ${mediaId}`)
  const { buffer, mimeType } = await downloadMedia(mediaId)

  console.log(`[pipeline] transcribing (${mimeType}, ${buffer.length} bytes)`)
  const transcript = await transcribeAudio(buffer, mimeType)
  console.log(`[pipeline] transcript: "${transcript.slice(0, 80)}…"`)

  if (!transcript) {
    console.warn('[pipeline] empty transcript, skipping')
    return
  }

  const analysisPromise = analyzeDream(transcript)

  const dream = await createDream({
    transcript,
    whatsappFrom: from,
    userId: userRecord?.userId,
    analysisPromise,
  })
  console.log(`[pipeline] dream saved id=${dream.id}`)

  const analysis = await analysisPromise
  await confirmMessage(from, analysis.title ?? 'your dream', analysis.tags).catch(() => {})
  console.log(`[pipeline] done for ${from}`)
}

// ── Register phone → user mapping (called from the PWA) ──
app.post('/register', async (req, res) => {
  const { phone, platform, userId, name } = req.body ?? {}
  if (!phone || !userId) return res.status(400).json({ error: 'phone and userId required' })

  const normalised = phone.replace(/[\s\-()]/g, '')
  await db.collection('whatsapp_users').doc(normalised).set({
    userId,
    name:         name ?? 'Dreamer',
    platform:     platform ?? 'whatsapp',
    registeredAt: new Date().toISOString(),
  })
  console.log(`[register] ${normalised} → userId=${userId}`)
  res.json({ ok: true })
})

// ── Debug: list saved dreams ──────────────────────────────
app.get('/dreams', async (_req, res) => {
  res.json(await getAllDreams())
})

// ── Stripe checkout ───────────────────────────────────────
// Requires: STRIPE_SECRET_KEY in env
// Returns a Stripe Checkout session URL for the given tier.
app.post('/create-checkout-session', async (req, res) => {
  const { tier, userId } = req.body ?? {}
  if (!tier || !userId) return res.status(400).json({ error: 'tier and userId required' })

  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) return res.status(503).json({ error: 'Stripe not configured' })

  const Stripe = (await import('stripe')).default
  const stripe = new Stripe(stripeKey)

  const PRICE_IDS = {
    premium: process.env.STRIPE_PRICE_PREMIUM,
    ai:      process.env.STRIPE_PRICE_AI,
  }
  const priceId = PRICE_IDS[tier]
  if (!priceId) return res.status(400).json({ error: 'Unknown tier' })

  const frontendUrl = process.env.FRONTEND_URL ?? 'https://speakwithdreams.vercel.app'

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode:                 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${frontendUrl}/?checkout=success`,
      cancel_url:  `${frontendUrl}/?checkout=cancel`,
      metadata: { userId, tier },
    })
    res.json({ url: session.url })
  } catch (err) {
    console.error('[stripe] checkout error:', err)
    res.status(500).json({ error: 'Failed to create checkout session' })
  }
})

app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`)
})
