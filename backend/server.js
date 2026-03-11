/**
 * Dream Journal — WhatsApp Cloud API ingestion server
 *
 * Flow:
 *  1. Meta sends POST /webhook with voice note event
 *  2. We verify HMAC signature, immediately ACK the sender
 *  3. Download audio from Meta's short-lived URL
 *  4. Transcribe with OpenAI Whisper
 *  5. Save dream entry to local DB
 *  6. Kick off async Claude analysis (patches record when done)
 *  7. Send confirmation reply to user
 */
import 'dotenv/config'
import express             from 'express'
import crypto              from 'crypto'
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

// ── Raw body needed for HMAC verification ─────────────────
app.use(express.json({
  verify: (req, _res, buf) => { req.rawBody = buf }
}))

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
  const entry = req.body?.entry?.[0]
  const changes = entry?.changes ?? []

  for (const change of changes) {
    const messages = change.value?.messages ?? []
    for (const msg of messages) {
      if (msg.type !== 'audio') continue

      const from    = msg.from
      const mediaId = msg.audio?.id

      if (!mediaId) continue

      console.log(`[webhook] voice note from ${from}, mediaId=${mediaId}`)

      // Non-blocking pipeline
      processVoiceNote(from, mediaId).catch(err =>
        console.error('[pipeline] error:', err)
      )
    }
  }
})

async function processVoiceNote(from, mediaId) {
  // ACK the user right away
  await ackMessage(from).catch(() => {})

  // Download audio (URL is short-lived — do this first)
  console.log(`[pipeline] downloading ${mediaId}`)
  const { buffer, mimeType } = await downloadMedia(mediaId)

  // Transcribe
  console.log(`[pipeline] transcribing (${mimeType}, ${buffer.length} bytes)`)
  const transcript = await transcribeAudio(buffer, mimeType)
  console.log(`[pipeline] transcript: "${transcript.slice(0, 80)}…"`)

  if (!transcript) {
    console.warn('[pipeline] empty transcript, skipping')
    return
  }

  // Kick off analysis asynchronously (do NOT await — let DB patch itself)
  const analysisPromise = analyzeDream(transcript)

  // Save dream now with transcript; analysis will patch it when ready
  const dream = createDream({ transcript, whatsappFrom: from, analysisPromise })
  console.log(`[pipeline] dream saved id=${dream.id}`)

  // Wait for analysis to get the title/tags for the confirmation message
  const analysis = await analysisPromise
  await confirmMessage(from, analysis.title ?? 'your dream', analysis.tags).catch(() => {})
  console.log(`[pipeline] done for ${from}`)
}

// ── Debug: list saved dreams ──────────────────────────────
app.get('/dreams', (_req, res) => {
  res.json(getAllDreams())
})

app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`)
})
