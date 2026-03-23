import './SideDrawer.css'
import type { ActiveView } from './BottomBar'
import type { User } from '../types/dream'

interface SideDrawerProps {
  open: boolean
  onClose: () => void
  active: ActiveView
  onNavigate: (view: ActiveView) => void
  onSearch: () => void
  user: User | null
}

type NavItem = { id: ActiveView; label: string; badge?: number; icon: JSX.Element }
type NavSection = { title?: string; items: NavItem[] }

const I = {
  journal: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="3" y="1" width="12" height="16" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
      <line x1="3" y1="1" x2="3" y2="17" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
      <line x1="7" y1="6" x2="13" y2="6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
      <line x1="7" y1="9" x2="13" y2="9" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
      <line x1="7" y1="12" x2="10" y2="12" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    </svg>
  ),
  social: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="6.5" cy="7" r="2.8" stroke="currentColor" strokeWidth="1.3"/>
      <circle cx="12.5" cy="5.5" r="2" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M1.5 15c0-2.5 2.2-4.5 5-4.5s5 2 5 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M12.5 11c2 .4 3.5 1.6 3.5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
  gallery: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="1.5" y="1.5" width="6.5" height="6.5" rx="1.2" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="10" y="1.5" width="6.5" height="6.5" rx="1.2" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="1.5" y="10" width="6.5" height="6.5" rx="1.2" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="10" y="10" width="6.5" height="6.5" rx="1.2" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  ),
  symbols: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M9 2L10.8 7H16l-4.2 3 1.6 5L9 12l-4.4 3 1.6-5L2 7h5.2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
    </svg>
  ),
  characters: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="6" r="3.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M2 17c0-3.9 3.1-7 7-7s7 3.1 7 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
  places: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="7.5" r="3" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M9 2a5.5 5.5 0 015.5 5.5C14.5 12 9 17 9 17S3.5 12 3.5 7.5A5.5 5.5 0 019 2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
    </svg>
  ),
  collections: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="1.5" y="5" width="15" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M5 5V3.5A1.5 1.5 0 016.5 2h5A1.5 1.5 0 0113 3.5V5" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  ),
  ask: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M6.5 6.8C6.5 5.5 7.6 4.5 9 4.5s2.5.9 2.5 2.1c0 .9-.6 1.6-1.5 1.9C9.4 8.8 9 9.2 9 9.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <circle cx="9" cy="12.5" r="0.8" fill="currentColor"/>
    </svg>
  ),
  insights: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M9 2v2M15 4l-1.5 1.5M16 9h-2M15 14l-1.5-1.5M9 16v-2M3 14l1.5-1.5M2 9h2M3 4l1.5 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  ),
  digest: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M9 1.5L3 5v8l6 3.5L15 13V5L9 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
      <path d="M9 1.5v13M3 5l6 3.5L15 5" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  ),
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="1.5" y="1.5" width="6" height="9" rx="1.2" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="10.5" y="1.5" width="6" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="1.5" y="13" width="6" height="3.5" rx="1.2" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="10.5" y="9" width="6" height="7.5" rx="1.2" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  ),
  library: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <line x1="3" y1="2" x2="3" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="7" y1="2" x2="7" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <rect x="10" y="2" width="5.5" height="14" rx="1" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  ),
  bookmarks: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M4 1h10v16l-5-3-5 3V1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
    </svg>
  ),
  drafts: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M3 15l2.5-.5L15 5a1.4 1.4 0 00-2-2L3 12.5 3 15z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
      <line x1="11.5" y1="4.5" x2="13.5" y2="6.5" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  ),
  me: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="6" r="3.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M2 17c0-3.9 3.1-7 7-7s7 3.1 7 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
}

const I_circle = (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M12 2.5C8 2.5 5 5.5 5 9.5s3 7 7 7c1.2 0 2.4-.3 3.4-.9C13.4 17.1 11.5 18 9.5 18 4.8 18 1 14.2 1 9.5S4.8 1 9.5 1c1.1 0 2.1.2 3 .6L12 2.5z"
      stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
    <circle cx="14" cy="4" r="1.2" fill="currentColor" opacity="0.6"/>
  </svg>
)

const NAV_SECTIONS: NavSection[] = [
  {
    items: [
      { id: 'journal',  label: 'Journal',        icon: I.journal  },
      { id: 'social',   label: 'Community',       icon: I.social   },
      { id: 'circle',   label: 'Dream Circle',    icon: I_circle   },
    ],
  },
  {
    title: 'My Dream World',
    items: [
      { id: 'gallery',     label: 'Gallery',     icon: I.gallery     },
      { id: 'symbols',     label: 'Symbols',     icon: I.symbols     },
      { id: 'characters',  label: 'Characters',  icon: I.characters  },
      { id: 'places',      label: 'Places',      icon: I.places      },
      { id: 'collections', label: 'Collections', icon: I.collections },
    ],
  },
  {
    title: 'Explore & Reflect',
    items: [
      { id: 'ask',           label: 'Ask Your Dreams',      icon: I.ask       },
      { id: 'constellation', label: 'Dream Constellation',  icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="9"  cy="9"  r="2"   stroke="currentColor" strokeWidth="1.2"/>
          <circle cx="3"  cy="4"  r="1.2" stroke="currentColor" strokeWidth="1.1"/>
          <circle cx="15" cy="3"  r="1.2" stroke="currentColor" strokeWidth="1.1"/>
          <circle cx="15" cy="14" r="1.2" stroke="currentColor" strokeWidth="1.1"/>
          <circle cx="3"  cy="14" r="1.2" stroke="currentColor" strokeWidth="1.1"/>
          <line x1="4"  y1="5"  x2="7.5" y2="7.5" stroke="currentColor" strokeWidth="0.9" strokeOpacity="0.6"/>
          <line x1="14" y1="4"  x2="10.5" y2="7.5" stroke="currentColor" strokeWidth="0.9" strokeOpacity="0.6"/>
          <line x1="14" y1="13" x2="10.5" y2="10.5" stroke="currentColor" strokeWidth="0.9" strokeOpacity="0.6"/>
          <line x1="4"  y1="13" x2="7.5" y2="10.5" stroke="currentColor" strokeWidth="0.9" strokeOpacity="0.6"/>
        </svg>
      )},
      { id: 'insights', label: 'Insights',         icon: I.insights  },
      { id: 'library',  label: 'Library',          icon: I.library   },
    ],
  },
  {
    title: 'Saved',
    items: [
      { id: 'bookmarks', label: 'Bookmarks', icon: I.bookmarks },
      { id: 'drafts',    label: 'Drafts',    icon: I.drafts    },
    ],
  },
]

function getInitials(name: string) {
  const p = name.trim().split(/\s+/)
  return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase()
}

export function SideDrawer({ open, onClose, active, onNavigate, onSearch, user }: SideDrawerProps) {
  function go(view: ActiveView) {
    onNavigate(view)
    onClose()
  }

  function handleSearch() {
    onClose()
    onSearch()
  }

  return (
    <>
      {/* Scrim */}
      <div
        className={`drawer-scrim ${open ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div className={`side-drawer ${open ? 'open' : ''}`} role="navigation">

        {/* ── Top: App name + search ─── */}
        <div className="drawer-top">
          <span className="drawer-app-name">Speak with Dreams</span>
          <button className="drawer-search-btn" onClick={handleSearch}>
            <svg width="14" height="14" viewBox="0 0 22 22" fill="none">
              <circle cx="10" cy="10" r="6.5" stroke="currentColor" strokeWidth="1.6"/>
              <line x1="15" y1="15" x2="20" y2="20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
            <span>Search dreams…</span>
          </button>
        </div>

        {/* ── Nav list ─────────────── */}
        <nav className="drawer-nav">
          {NAV_SECTIONS.map((section, si) => (
            <div key={si} className="drawer-nav-section">
              {section.title && (
                <span className="drawer-section-title">{section.title}</span>
              )}
              {section.items.map(item => (
                <button
                  key={item.id}
                  className={`drawer-nav-item ${active === item.id ? 'active' : ''}`}
                  onClick={() => go(item.id)}
                >
                  <span className="drawer-nav-icon">{item.icon}</span>
                  <span className="drawer-nav-label">{item.label}</span>
                  {item.badge != null && (
                    <span className="drawer-nav-badge">{item.badge}</span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* ── Profile card at bottom ─ */}
        <div className="drawer-profile-bottom">
          <button className="drawer-profile-card" onClick={() => go('me')}>
            <div className="drawer-profile-avatar">
              {user ? getInitials(user.name) : 'ME'}
            </div>
            <div className="drawer-profile-info">
              <span className="drawer-profile-name">{user ? user.name : 'Guest'}</span>
              <span className="drawer-profile-sub">{user?.zodiacSign ?? 'Sign in to sync'}</span>
            </div>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="drawer-profile-chevron">
              <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>
    </>
  )
}
