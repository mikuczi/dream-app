import { useRef, useEffect } from 'react'

interface DreamHaloProps { recording: boolean }

// Teal orb — reference: glowing teal sphere with concentric dark rings + dot grid
export function DreamHalo({ recording }: DreamHaloProps) {
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const rafRef       = useRef<number>(0)
  const energyRef    = useRef(0)
  const recordingRef = useRef(recording)
  const startRef     = useRef(performance.now())
  const sizeRef      = useRef({ w: 1, h: 1 })

  useEffect(() => { recordingRef.current = recording }, [recording])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const c = ctx

    function resize() {
      const w = canvas!.offsetWidth  || 390
      const h = canvas!.offsetHeight || 844
      sizeRef.current = { w, h }
      canvas!.width  = w * dpr
      canvas!.height = h * dpr
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    function drawFrame() {
      const { w, h } = sizeRef.current
      c.setTransform(dpr, 0, 0, dpr, 0, 0)
      c.clearRect(0, 0, w, h)

      const target = recordingRef.current ? 1.0 : 0.2
      energyRef.current += (target - energyRef.current) * 0.02
      const energy  = energyRef.current
      const t       = (performance.now() - startRef.current) / 1000
      const breathe = 0.5 + 0.5 * Math.sin(t * 0.55)
      const ripple  = 0.5 + 0.5 * Math.sin(t * 1.1)

      const cx    = w / 2
      const cy    = h / 2
      const scale = Math.min(w, h) / 390

      // ── Ambient dark background glow (very subtle)
      const bgGrad = c.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.6)
      bgGrad.addColorStop(0,   `rgba(0,40,50,${0.18 * energy})`)
      bgGrad.addColorStop(0.5, `rgba(0,20,28,${0.10 * energy})`)
      bgGrad.addColorStop(1,   'rgba(0,0,0,0)')
      c.fillStyle = bgGrad
      c.fillRect(0, 0, w, h)

      // ── Outer teal glow corona
      const outerRadius = (140 + 20 * breathe) * scale
      const outerGrad = c.createRadialGradient(cx, cy, 0, cx, cy, outerRadius)
      outerGrad.addColorStop(0,    `rgba(0,200,212,${(0.10 + 0.08 * energy) * (0.75 + 0.25 * breathe)})`)
      outerGrad.addColorStop(0.45, `rgba(0,180,195,${(0.06 + 0.05 * energy)})`)
      outerGrad.addColorStop(0.75, `rgba(0,140,160,${0.025 * energy})`)
      outerGrad.addColorStop(1,    'rgba(0,0,0,0)')
      c.fillStyle = outerGrad
      c.fillRect(0, 0, w, h)

      // ── Main teal sphere glow
      const sphereR = (72 + 8 * breathe) * scale
      const sphereGrad = c.createRadialGradient(cx, cy, 0, cx, cy, sphereR)
      sphereGrad.addColorStop(0,    `rgba(180,240,248,${(0.30 + 0.18 * energy) * (0.85 + 0.15 * breathe)})`)
      sphereGrad.addColorStop(0.25, `rgba(0,210,225,${(0.22 + 0.14 * energy)})`)
      sphereGrad.addColorStop(0.55, `rgba(0,160,180,${(0.12 + 0.08 * energy)})`)
      sphereGrad.addColorStop(0.8,  `rgba(0,100,120,${0.05 * energy})`)
      sphereGrad.addColorStop(1,    'rgba(0,0,0,0)')
      c.fillStyle = sphereGrad
      c.fillRect(0, 0, w, h)

      // ── Concentric rings (5 rings, dark/teal strokes)
      const ringRadii  = [88, 110, 134, 160, 188].map(r => r * scale)
      const ringAlphas = [0.30, 0.22, 0.15, 0.10, 0.06]
      for (let i = 0; i < ringRadii.length; i++) {
        const wobble = Math.sin(t * 0.35 + i * 0.8) * 3 * scale * energy
        const r = ringRadii[i] + wobble
        c.beginPath()
        c.arc(cx, cy, r, 0, Math.PI * 2)
        c.strokeStyle = `rgba(0,200,212,${ringAlphas[i] * (0.6 + 0.4 * energy)})`
        c.lineWidth = (1.6 - i * 0.2) * scale
        c.stroke()
      }

      // ── Ripple ring (expands outward when recording)
      if (energy > 0.15) {
        const rippleR = (90 + ripple * 50) * scale
        const rippleAlpha = (1 - ripple) * 0.25 * energy
        c.beginPath()
        c.arc(cx, cy, rippleR, 0, Math.PI * 2)
        c.strokeStyle = `rgba(0,200,212,${rippleAlpha})`
        c.lineWidth = 1.2 * scale
        c.stroke()
      }

      // ── Dot grid in center (3×3)
      const dotRows = 3
      const dotCols = 3
      const dotSpacing = 11 * scale
      const dotRadius  = 2.8 * scale
      for (let row = 0; row < dotRows; row++) {
        for (let col = 0; col < dotCols; col++) {
          const dx = cx + (col - (dotCols - 1) / 2) * dotSpacing
          const dy = cy + (row - (dotRows - 1) / 2) * dotSpacing
          const dist = Math.sqrt((col - 1) ** 2 + (row - 1) ** 2)
          const dotAlpha = (0.55 + 0.35 * energy) * (1 - dist * 0.15) * (0.8 + 0.2 * breathe)
          c.beginPath()
          c.arc(dx, dy, dotRadius * (1 - dist * 0.08), 0, Math.PI * 2)
          c.fillStyle = `rgba(240,252,255,${Math.max(0.1, dotAlpha)})`
          c.fill()
        }
      }

      rafRef.current = requestAnimationFrame(drawFrame)
    }

    rafRef.current = requestAnimationFrame(drawFrame)
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect() }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    />
  )
}
