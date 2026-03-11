/**
 * Download a WhatsApp media file and transcribe it with OpenAI Whisper.
 */
import axios from 'axios'
import FormData from 'form-data'

const { WHATSAPP_TOKEN, OPENAI_API_KEY } = process.env

/**
 * Download audio bytes from Meta's media endpoint.
 * Media URLs are short-lived (~5 min) so call this immediately on receipt.
 */
export async function downloadMedia(mediaId) {
  // Step 1: resolve the download URL
  const { data: meta } = await axios.get(
    `https://graph.facebook.com/v19.0/${mediaId}`,
    { headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` } }
  )

  // Step 2: download the actual bytes
  const { data: audioBuffer } = await axios.get(meta.url, {
    headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` },
    responseType: 'arraybuffer',
  })

  return { buffer: Buffer.from(audioBuffer), mimeType: meta.mime_type }
}

/**
 * Transcribe audio buffer via OpenAI Whisper.
 * WhatsApp sends audio/ogg (opus) which Whisper handles natively.
 */
export async function transcribeAudio(buffer, mimeType) {
  const ext = mimeType?.includes('ogg') ? 'ogg'
             : mimeType?.includes('mpeg') ? 'mp3'
             : mimeType?.includes('mp4')  ? 'mp4'
             : 'ogg'

  const form = new FormData()
  form.append('file', buffer, { filename: `voice.${ext}`, contentType: mimeType ?? 'audio/ogg' })
  form.append('model', 'whisper-1')
  form.append('language', 'en')

  const { data } = await axios.post(
    'https://api.openai.com/v1/audio/transcriptions',
    form,
    {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        ...form.getHeaders(),
      },
    }
  )

  return data.text?.trim() ?? ''
}
