import { useState } from 'react'
import { useDreams } from './hooks/useDreams'
import { getZodiacSign } from './utils/astro'

import { LoginScreen }        from './screens/LoginScreen'
import { OnboardingScreen }   from './screens/OnboardingScreen'
import { HomeScreen }         from './screens/HomeScreen'
import { RecordingScreen }    from './screens/RecordingScreen'
import { LogScreen }          from './screens/LogScreen'
import { JournalScreen }      from './screens/JournalScreen'
import { SocialScreen }       from './screens/SocialScreen'
import { MeScreen }           from './screens/MeScreen'
import { DreamDetailScreen }  from './screens/DreamDetailScreen'
import { WhatsAppScreen }     from './screens/WhatsAppScreen'
import { SettingsScreen }     from './screens/SettingsScreen'
import { TabBar }             from './components/TabBar'
import type { Tab }           from './components/TabBar'
import type { Dream, User }   from './types/dream'

const KEY_USER      = 'dj_user'
const KEY_ONBOARDED = 'dj_onboarded'

function loadUser(): User | null {
  try { return JSON.parse(localStorage.getItem(KEY_USER) ?? 'null') }
  catch { return null }
}

type AppState = 'login' | 'onboarding' | 'app'
type Overlay  = 'recording' | 'log' | 'settings' | 'whatsapp' | 'dreamdetail' | null

export function App() {
  const { dreams, addDream, updateDream, deleteDream } = useDreams()

  const [appState, setAppState] = useState<AppState>(() => {
    const user = loadUser()
    if (!user) return 'login'
    if (!localStorage.getItem(KEY_ONBOARDED)) return 'onboarding'
    return 'app'
  })

  const [user,              setUser]              = useState<User | null>(loadUser)
  const [activeTab,         setActiveTab]         = useState<Tab>('record')
  const [overlay,           setOverlay]           = useState<Overlay>(null)
  const [pendingTranscript, setPendingTranscript] = useState('')
  const [focusDream,        setFocusDream]        = useState<Dream | null>(null)

  // ── Login ─────────────────────────────────────────────
  function handleLogin(name: string, dob: string) {
    const zodiacSign = dob ? getZodiacSign(dob).sign : 'pisces' as const
    const newUser: User = {
      id: Date.now().toString(),
      name, email: '', passwordHash: '', dob, zodiacSign,
      createdAt: new Date().toISOString(),
    }
    localStorage.setItem(KEY_USER, JSON.stringify(newUser))
    setUser(newUser)
    setAppState('onboarding')
  }

  function handleOnboardingDone() {
    localStorage.setItem(KEY_ONBOARDED, '1')
    setAppState('app')
  }

  // ── Recording ─────────────────────────────────────────
  function handleRecordingDone(transcript: string) {
    setPendingTranscript(transcript)
    setOverlay('log')
  }

  function handleLogSave(dream: Dream) {
    addDream(dream)
    setOverlay(null)
  }

  // ── Dream detail ──────────────────────────────────────
  function handleOpenDream(dream: Dream) {
    setFocusDream(dream)
    setOverlay('dreamdetail')
  }

  function handleTogglePrivacy(id: string) {
    const dream = dreams.find(d => d.id === id)
    if (!dream) return
    updateDream(id, { isPrivate: !dream.isPrivate })
    if (focusDream?.id === id) {
      setFocusDream({ ...focusDream, isPrivate: !focusDream.isPrivate })
    }
  }

  function handleDeleteDream(id: string) {
    deleteDream(id)
    setOverlay(null)
    setFocusDream(null)
  }

  // ── Sign out ──────────────────────────────────────────
  function handleSignOut() {
    localStorage.removeItem(KEY_USER)
    localStorage.removeItem(KEY_ONBOARDED)
    setUser(null)
    setActiveTab('record')
    setAppState('login')
  }


  // ── Render ────────────────────────────────────────────
  if (appState === 'login') {
    return <div className="app-shell"><LoginScreen onContinue={handleLogin} /></div>
  }

  if (appState === 'onboarding') {
    return <div className="app-shell"><OnboardingScreen onDone={handleOnboardingDone} /></div>
  }

  return (
    <div className="app-shell">
      <div className="tab-content">
        {activeTab === 'record' && (
          <HomeScreen
            onRecord={() => setOverlay('recording')}
            onSettings={() => setOverlay('settings')}
          />
        )}
        {activeTab === 'journal' && (
          <JournalScreen dreams={dreams} tabMode onOpenDream={handleOpenDream} />
        )}
        {activeTab === 'social' && (
          <SocialScreen />
        )}
        {activeTab === 'me' && (
          <MeScreen
            user={user}
            dreams={dreams}
            onSignOut={handleSignOut}
            onWhatsApp={() => setOverlay('whatsapp')}
            onSignIn={() => setAppState('login')}
            onRecord={() => setOverlay('recording')}
          />
        )}
      </div>

      <TabBar active={activeTab} onChange={setActiveTab} />

      {overlay === 'recording' && (
        <div className="overlay-screen screen-enter">
          <RecordingScreen
            onDone={handleRecordingDone}
            onCancel={() => setOverlay(null)}
          />
        </div>
      )}
      {overlay === 'log' && (
        <div className="overlay-screen screen-enter">
          <LogScreen
            transcript={pendingTranscript}
            onSave={handleLogSave}
            onBack={() => setOverlay('recording')}
          />
        </div>
      )}
      {overlay === 'dreamdetail' && focusDream && (
        <div className="overlay-screen screen-enter">
          <DreamDetailScreen
            dream={focusDream}
            onBack={() => setOverlay(null)}
            onTogglePrivacy={handleTogglePrivacy}
            onDelete={handleDeleteDream}
          />
        </div>
      )}
      {overlay === 'settings' && (
        <div className="overlay-screen screen-enter">
          <SettingsScreen
            user={user}
            onBack={() => setOverlay(null)}
            onClearDreams={() => { localStorage.removeItem('dream-journal-dreams'); window.location.reload() }}
          />
        </div>
      )}
      {overlay === 'whatsapp' && (
        <div className="overlay-screen screen-enter">
          <WhatsAppScreen onBack={() => setOverlay(null)} />
        </div>
      )}
    </div>
  )
}
