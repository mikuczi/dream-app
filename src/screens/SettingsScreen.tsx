import { useState } from 'react'
import './SettingsScreen.css'
import type { User } from '../types/dream'

interface SettingsScreenProps {
  user: User | null
  onBack: () => void
  onClearDreams: () => void
}

function Toggle({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button
      className={`toggle-track ${active ? 'active' : ''}`}
      onClick={onToggle}
      role="switch"
      aria-checked={active}
    >
      <div className="toggle-thumb" />
    </button>
  )
}

function SettingsRow({
  label,
  value,
  chevron,
  destructive,
  onClick,
  right,
}: {
  label: string
  value?: string
  chevron?: boolean
  destructive?: boolean
  onClick?: () => void
  right?: React.ReactNode
}) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      className={`settings-row ${onClick ? 'settings-row-btn' : ''} ${destructive ? 'settings-row-destructive' : ''}`}
      onClick={onClick}
    >
      <span className="settings-row-label">{label}</span>
      <div className="settings-row-right">
        {right ?? null}
        {value && <span className="settings-row-value">{value}</span>}
        {chevron && <span className="settings-row-chevron">›</span>}
      </div>
    </Tag>
  )
}

function SettingsGroup({ children }: { children: React.ReactNode }) {
  return <div className="settings-group">{children}</div>
}

function RowSep() {
  return <div className="settings-row-sep" />
}

export function SettingsScreen({ user, onBack, onClearDreams }: SettingsScreenProps) {
  const [reminderOn, setReminderOn] = useState(true)
  const [cosmicOn, setCosmicOn] = useState(true)
  const [whatsappAlertsOn, setWhatsappAlertsOn] = useState(false)
  const [clearConfirm, setClearConfirm] = useState(false)

  function handleExport() {
    alert('Export feature coming soon.')
  }

  function handleClearDreams() {
    if (!clearConfirm) {
      setClearConfirm(true)
      return
    }
    onClearDreams()
    setClearConfirm(false)
  }

  const signName = user
    ? user.zodiacSign.charAt(0).toUpperCase() + user.zodiacSign.slice(1)
    : null

  return (
    <div className="settings-screen screen">
      {/* Header */}
      <div className="settings-header">
        <button className="settings-back-btn" onClick={onBack} aria-label="Go back">
          ← back
        </button>
        <span className="settings-header-title">Settings</span>
      </div>

      <div className="settings-scroll">
        {/* Account */}
        {user && (
          <div className="settings-section">
            <p className="settings-section-label">Account</p>
            <SettingsGroup>
              <SettingsRow label="Name" value={user.name} />
              <RowSep />
              <SettingsRow label="Email" value={user.email} />
              <RowSep />
              <SettingsRow label="Date of Birth" value={user.dob} />
              <RowSep />
              <SettingsRow label="Zodiac Sign" value={signName ?? ''} />
            </SettingsGroup>
          </div>
        )}

        {!user && (
          <div className="settings-section">
            <p className="settings-section-label">Account</p>
            <SettingsGroup>
              <SettingsRow label="Signed in as" value="Guest" />
            </SettingsGroup>
          </div>
        )}

        {/* Notifications */}
        <div className="settings-section">
          <p className="settings-section-label">Notifications</p>
          <SettingsGroup>
            <SettingsRow
              label="Dream reminder"
              right={<Toggle active={reminderOn} onToggle={() => setReminderOn((v) => !v)} />}
            />
            <RowSep />
            <SettingsRow
              label="Daily cosmic reading"
              right={<Toggle active={cosmicOn} onToggle={() => setCosmicOn((v) => !v)} />}
            />
            <RowSep />
            <SettingsRow
              label="WhatsApp alerts"
              right={<Toggle active={whatsappAlertsOn} onToggle={() => setWhatsappAlertsOn((v) => !v)} />}
            />
          </SettingsGroup>
        </div>

        {/* Appearance */}
        <div className="settings-section">
          <p className="settings-section-label">Appearance</p>
          <SettingsGroup>
            <SettingsRow label="Theme" value="Dark · always" />
          </SettingsGroup>
        </div>

        {/* Data */}
        <div className="settings-section">
          <p className="settings-section-label">Data</p>
          <SettingsGroup>
            <SettingsRow
              label="Export dreams"
              chevron
              onClick={handleExport}
            />
            <RowSep />
            <SettingsRow
              label={clearConfirm ? 'Tap again to confirm' : 'Clear all dreams'}
              destructive
              onClick={handleClearDreams}
            />
          </SettingsGroup>
        </div>

        {/* About */}
        <div className="settings-section">
          <p className="settings-section-label">About</p>
          <SettingsGroup>
            <SettingsRow label="Version" value="0.1.0" />
            <RowSep />
            <SettingsRow label="Made with" value="◯" />
          </SettingsGroup>
        </div>

        <div className="settings-bottom-pad" />
      </div>
    </div>
  )
}
