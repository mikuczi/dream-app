import { useRef, useEffect } from 'react'

interface DreamHaloProps {
  recording: boolean
  size?: number
}

interface RingConfig {
  baseRadius: number
  // Three sine wave components per ring for organic complexity
  a1: number; n1: number; p1: number; s1: number
  a2: number; n2: number; p2: number; s2: number
  a3: number; n3: number; p3: number; s3: number
  alpha: number
  lineWidth: number
  rotSpeed: number // individual slow rotation
}

const RINGS: RingConfig[] = [
  {
    baseRadius: 52,
    a1: 14, n1: 5,  p1: 0.0,  s1:  0.55,
    a2:  9, n2: 3,  p2: 1.1,  s2: -0.38,
    a3:  5, n3: 7,  p3: 2.4,  s3:  0.21,
    alpha: 0.40, lineWidth: 1.4, rotSpeed:  0.04,
  },
  {
    baseRadius: 78,
    a1: 18, n1: 7,  p1: 0.7,  s1:  0.42,
    a2: 13, n2: 4,  p2: 2.3,  s2:  0.29,
    a3:  8, n3: 9,  p3: 0.9,  s3: -0.18,
    alpha: 0.26, lineWidth: 1.1, rotSpeed: -0.03,
  },
  {
    baseRadius: 106,
    a1: 24, n1: 6,  p1: 1.4,  s1: -0.34,
    a2: 17, n2: 5,  p2: 0.5,  s2:  0.45,
    a3: 10, n3: 8,  p3: 3.1,  s3:  0.22,
    alpha: 0.17, lineWidth: 0.9, rotSpeed:  0.025,
  },
  {
    baseRadius: 136,
    a1: 32, n1: 9,  p1: 0.3,  s1:  0.26,
    a2: 22, n2: 6,  p2: 1.8,  s2: -0.21,
    a3: 14, n3: 4,  p3: 0.6,  s3:  0.35,
    alpha: 0.11, lineWidth: 0.75, rotSpeed: -0.02,
  },
  {
    baseRadius: 168,
    a1: 42, n1: 8,  p1: 2.1,  s1: -0.20,
    a2: 28, n2: 7,  p2: 0.9,  s2:  0.17,
    a3: 18, n3: 5,  p3: 1.5,  s3: -0.28,
    alpha: 0.06, lineWidth: 0.55, rotSpeed:  0.015,
  },
]

const POINTS = 256

export function DreamHalo({ recording, size = 360 }: DreamHaloProps) {
  const canvasRef     = useRef<HTMLCanvasElement>(null)
  const rafRef        = useRef<number>(0)
  const energyRef     = useRef(0)
  const recordingRef  = useRef(recording)
  const startRef      = useRef(performance.now())

  useEffect(() => { recordingRef.current = recording }, [recording])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width  = size * dpr
    canvas.height = size * dpr

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const c = ctx
    c.scale(dpr, dpr)

    const cx = size / 2
    const cy = size / 2

    function drawRing(ring: RingConfig, t: number, energy: number) {
      const ampScale   = 1 + energy * 2.4
      const speedScale = 1 + energy * 2.8
      const alphaBoost = 1 + energy * 1.1
      const rot        = ring.rotSpeed * t

      c.beginPath()

      for (let j = 0; j <= POINTS; j++) {
        const rawTheta = (j / POINTS) * Math.PI * 2
        const theta    = rawTheta + rot

        const r =
          ring.baseRadius +
          ring.a1 * ampScale * Math.sin(ring.n1 * rawTheta + ring.p1 + t * ring.s1 * speedScale) +
          ring.a2 * ampScale * Math.sin(ring.n2 * rawTheta + ring.p2 + t * ring.s2 * speedScale) +
          ring.a3 * ampScale * Math.sin(ring.n3 * rawTheta + ring.p3 + t * ring.s3 * speedScale)

        const x = cx + r * Math.cos(theta)
        const y = cy + r * Math.sin(theta)

        j === 0 ? c.moveTo(x, y) : c.lineTo(x, y)
      }

      c.closePath()
      c.strokeStyle = `rgba(255, 255, 255, ${Math.min(ring.alpha * alphaBoost, 0.65)})`
      c.lineWidth   = ring.lineWidth * (1 + energy * 0.5)
      c.stroke()
    }

    function drawFrame() {
      c.clearRect(0, 0, size, size)

      // Lerp energy
      const target = recordingRef.current ? 1.0 : 0.0
      energyRef.current += (target - energyRef.current) * 0.025
      const energy = energyRef.current

      const t = (performance.now() - startRef.current) / 1000

      // Slow global breathing pulse
      const breathe = 0.5 + 0.5 * Math.sin(t * 0.4)

      // Outer nebula glow
      const nebulaAlpha = (0.025 + energy * 0.055) * (0.8 + 0.2 * breathe)
      const nebula = c.createRadialGradient(cx, cy, 0, cx, cy, size * 0.52)
      nebula.addColorStop(0,   `rgba(255,255,255,${nebulaAlpha})`)
      nebula.addColorStop(0.45, `rgba(255,255,255,${nebulaAlpha * 0.4})`)
      nebula.addColorStop(1,   'rgba(255,255,255,0)')
      c.fillStyle = nebula
      c.fillRect(0, 0, size, size)

      // Inner tight glow (pulses with breath)
      const innerAlpha = (0.06 + energy * 0.12) * (0.7 + 0.3 * breathe)
      const inner = c.createRadialGradient(cx, cy, 0, cx, cy, 70)
      inner.addColorStop(0, `rgba(255,255,255,${innerAlpha})`)
      inner.addColorStop(1, 'rgba(255,255,255,0)')
      c.fillStyle = inner
      c.fillRect(0, 0, size, size)

      // Draw rings outer → inner so innermost paints last (most visible)
      for (let i = RINGS.length - 1; i >= 0; i--) {
        drawRing(RINGS[i], t, energy)
      }

      rafRef.current = requestAnimationFrame(drawFrame)
    }

    rafRef.current = requestAnimationFrame(drawFrame)
    return () => cancelAnimationFrame(rafRef.current)
  }, [size])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: size,
        height: size,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  )
}
