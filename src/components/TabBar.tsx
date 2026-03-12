import './TabBar.css'

export type Tab = 'journal' | 'social' | 'explore' | 'me'

interface TabBarProps {
  active: Tab
  onChange: (tab: Tab) => void
  onRecord: () => void
}

function IconJournal() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <line x1="5" y1="7"  x2="17" y2="7"  stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="5" y1="11" x2="14" y2="11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="5" y1="15" x2="17" y2="15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function IconSocial() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="8"  cy="10" r="3.8" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="15" cy="10" r="3.8" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

function IconExplore() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="7.5" stroke="currentColor" strokeWidth="1.4" />
      <line x1="11" y1="3.5"  x2="11" y2="6.5"  stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="11" y1="15.5" x2="11" y2="18.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="3.5"  y1="11" x2="6.5"  y2="11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="15.5" y1="11" x2="18.5" y2="11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function IconMe() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M4.5 18.5C4.5 15.186 7.462 12.5 11 12.5s6.5 2.686 6.5 6"
        stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

const LEFT_TABS: Array<{ id: Tab; label: string; Icon: React.FC }> = [
  { id: 'journal', label: 'Journal', Icon: IconJournal },
  { id: 'social',  label: 'Social',  Icon: IconSocial  },
]
const RIGHT_TABS: Array<{ id: Tab; label: string; Icon: React.FC }> = [
  { id: 'explore', label: 'Explore', Icon: IconExplore },
  { id: 'me',      label: 'Me',      Icon: IconMe      },
]

export function TabBar({ active, onChange, onRecord }: TabBarProps) {
  return (
    <nav className="tab-bar" role="tablist">
      {LEFT_TABS.map(({ id, label, Icon }) => (
        <button
          key={id}
          className={`tab-btn ${active === id ? 'active' : ''}`}
          onClick={() => onChange(id)}
          role="tab"
          aria-selected={active === id}
          aria-label={label}
        >
          <Icon />
          <span className="tab-label">{label}</span>
        </button>
      ))}

      {/* Center record button */}
      <div className="tab-record-wrap">
        <button
          className="tab-record-btn"
          onClick={onRecord}
          aria-label="Record a dream"
        >
          <div className="tab-record-dot" />
        </button>
      </div>

      {RIGHT_TABS.map(({ id, label, Icon }) => (
        <button
          key={id}
          className={`tab-btn ${active === id ? 'active' : ''}`}
          onClick={() => onChange(id)}
          role="tab"
          aria-selected={active === id}
          aria-label={label}
        >
          <Icon />
          <span className="tab-label">{label}</span>
        </button>
      ))}
    </nav>
  )
}
