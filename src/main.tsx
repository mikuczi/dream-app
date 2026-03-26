import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import { App } from './App'

// ── Service Worker registration ──────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {/* ignore */})
  })
}

// ── Stale chunk recovery ──────────────────────────────────
// When a new deploy changes chunk hashes, cached pages try to load
// chunks that no longer exist → the server returns HTML → MIME error.
// Catch it and reload once to pick up the latest bundle.
window.addEventListener('vite:preloadError', () => {
  window.location.reload()
})

// ── Morning dream reminder scheduler ────────────────────
// Checks once per hour whether it's time to show the reminder
function scheduleDreamReminder() {
  const enabled = localStorage.getItem('dj_notif_enabled') === '1'
  if (!enabled || Notification.permission !== 'granted') return

  const stored = localStorage.getItem('dj_notif_time') ?? '09:30'
  const [hh, mm] = stored.split(':').map(Number)
  const now = new Date()
  const target = new Date(now)
  target.setHours(hh, mm, 0, 0)

  // Already shown today?
  const lastShown = localStorage.getItem('dj_notif_last')
  const today = now.toDateString()
  if (lastShown === today) return

  const diff = target.getTime() - now.getTime()
  if (diff >= 0 && diff < 3600_000) {
    setTimeout(() => {
      new Notification('Dream Journal ✦', {
        body: 'Did you dream last night? Capture it before it fades.',
        icon: '/pwa-192x192.png',
        tag: 'dream-reminder',
      })
      localStorage.setItem('dj_notif_last', today)
    }, diff)
  }
}

setInterval(scheduleDreamReminder, 60_000)
scheduleDreamReminder()

// ── Render ───────────────────────────────────────────────
const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element not found')

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
)
