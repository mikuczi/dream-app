import './GalleryScreen.css'
import type { Dream } from '../types/dream'

interface GalleryScreenProps { dreams: Dream[]; onOpenDream?: (d: Dream) => void }

const MOOD_ARTWORK: Record<string, string> = {
  peaceful: 'radial-gradient(ellipse at 40% 30%, #0d1a0e 0%, #050d06 50%, #020502 100%)',
  joyful:   'radial-gradient(ellipse at 60% 40%, #1a1020 0%, #0d0810 50%, #030205 100%)',
  anxious:  'radial-gradient(ellipse at 50% 50%, #1a1010 0%, #100808 50%, #050202 100%)',
  scary:    'radial-gradient(ellipse at 50% 20%, #120808 0%, #090404 50%, #020101 100%)',
  strange:  'radial-gradient(ellipse at 30% 60%, #0a0a1a 0%, #060610 50%, #020204 100%)',
}

export function GalleryScreen({ dreams, onOpenDream }: GalleryScreenProps) {
  return (
    <div className="gallery-screen">
      <div className="gallery-topbar">
        <h1 className="gallery-title">Gallery</h1>
      </div>

      {dreams.length === 0 ? (
        <div className="gallery-empty">
          <p className="gallery-empty-text">Your dream artwork will appear here.</p>
          <p className="gallery-empty-sub">Record dreams and generate AI artwork to build your gallery.</p>
        </div>
      ) : (
        <div className="gallery-grid">
          {dreams.map(dream => (
            <div
              key={dream.id}
              className="gallery-item"
              style={{ background: dream.artwork ?? MOOD_ARTWORK[dream.mood] }}
              onClick={() => onOpenDream?.(dream)}
            >
              <div className="gallery-item-overlay">
                <p className="gallery-item-title">{dream.title}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
