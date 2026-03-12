import './HomeScreen.css'
import { DreamHalo } from '../components/DreamHalo'

interface HomeScreenProps {
  onRecord: () => void
  onSettings: () => void
}

export function HomeScreen({ onRecord, onSettings }: HomeScreenProps) {
  return (
    <div className="home-screen">
      {/* Top bar */}
      <div className="home-topbar">
        <span className="home-wordmark">reverie</span>
        <button
          className="home-settings-btn"
          onClick={onSettings}
          aria-label="Open settings"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.3" />
            <circle cx="10" cy="10" r="2" fill="currentColor" />
          </svg>
        </button>
      </div>

      {/* Center stage — halo + record button */}
      <div className="home-center">
        <div className="halo-container">
          <DreamHalo recording={false} />
          <button
            className="record-btn"
            onClick={onRecord}
            aria-label="Start recording your dream"
          >
            <div className="record-btn-dot" />
          </button>
        </div>
        <span className="home-hint">tap to remember</span>
      </div>
    </div>
  )
}
