import './BottomBar.css'

export type ActiveView = 'journal' | 'gallery' | 'symbols' | 'characters' | 'places'
  | 'collections' | 'dashboard' | 'digest' | 'drafts' | 'bookmarks'
  | 'insights' | 'ask' | 'library' | 'social' | 'me'

interface BottomBarProps {
  onMenu: () => void
  onAdd: () => void
  onSocial: () => void
  onHome: () => void
  onProfile: () => void
  homeActive?: boolean
  socialActive?: boolean
  profileActive?: boolean
}

export function BottomBar({ onMenu, onAdd, onSocial, onHome, onProfile, homeActive, socialActive, profileActive }: BottomBarProps) {
  return (
    <nav className="bottom-bar">
      {/* ≡ Menu */}
      <button className="bb-btn" onClick={onMenu} aria-label="Menu">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <line x1="3" y1="6"  x2="19" y2="6"  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="3" y1="11" x2="19" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="3" y1="16" x2="19" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>

      {/* 👥 Social — left of add */}
      <button className={`bb-btn ${socialActive ? 'active' : ''}`} onClick={onSocial} aria-label="Community">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <circle cx="8"  cy="9"  r="3.5" stroke="currentColor" strokeWidth="1.4"/>
          <circle cx="15" cy="7"  r="2.5" stroke="currentColor" strokeWidth="1.4"/>
          <path d="M2 19c0-3 2.5-5 6-5s6 2 6 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          <path d="M15 14c2.5 0.5 4 2 4 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      </button>

      {/* + Add dream */}
      <button className="bb-btn bb-add-btn" onClick={onAdd} aria-label="Record dream">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10.5" stroke="currentColor" strokeWidth="1.5"/>
          <line x1="12" y1="7" x2="12" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="7"  y1="12" x2="17" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>

      {/* 📖 Journal */}
      <button className={`bb-btn ${homeActive ? 'active' : ''}`} onClick={onHome} aria-label="Journal">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <rect x="4" y="2" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="1.4"/>
          <line x1="4" y1="2" x2="4" y2="20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="8" y1="7" x2="15" y2="7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          <line x1="8" y1="11" x2="15" y2="11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          <line x1="8" y1="15" x2="12" y2="15" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      </button>

      {/* 👤 Profile */}
      <button className={`bb-btn ${profileActive ? 'active' : ''}`} onClick={onProfile} aria-label="Profile">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <circle cx="11" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.4"/>
          <path d="M4 19c0-3.866 3.134-7 7-7h0c3.866 0 7 3.134 7 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      </button>
    </nav>
  )
}
