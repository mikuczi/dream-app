/**
 * WhatsApp Cloud API helper — send text reply to a user.
 */
import axios from 'axios'

const { WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID } = process.env

export async function sendMessage(to, text) {
  await axios.post(
    `https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    },
    { headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' } }
  )
}

export function ackMessage(to) {
  return sendMessage(to,
    '✦ Voice note received — transcribing your dream...'
  )
}

export function confirmMessage(to, title, tags) {
  const tagLine = tags?.length ? `\n\nThemes: ${tags.slice(0, 4).join(', ')}` : ''
  return sendMessage(to,
    `✦ Dream saved: "${title}"${tagLine}\n\nSweet dreams. 🌙`
  )
}
