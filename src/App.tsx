import { useState, useEffect } from 'react'
import { useDreams } from './hooks/useDreams'
import { getZodiacSign } from './utils/astro'
import { useFirebaseAuth } from './hooks/useFirebaseAuth'
import { saveUserProfile } from './lib/firestore'

import { LoginScreen }          from './screens/LoginScreen'
import { OnboardingScreen }     from './screens/OnboardingScreen'
import { RecordingScreen }      from './screens/RecordingScreen'
import { LogScreen }            from './screens/LogScreen'
import { JournalScreen }        from './screens/JournalScreen'
import { GalleryScreen }        from './screens/GalleryScreen'
import { MySymbolsScreen }      from './screens/MySymbolsScreen'
import { MyCharactersScreen }   from './screens/MyCharactersScreen'
import { MyPlacesScreen }       from './screens/MyPlacesScreen'
import { CollectionsScreen }    from './screens/CollectionsScreen'
import { DashboardScreen }      from './screens/DashboardScreen'
import { DreamerDigestScreen }  from './screens/DreamerDigestScreen'
import { DraftsScreen }         from './screens/DraftsScreen'
import { BookmarksScreen }      from './screens/BookmarksScreen'
import { InsightsScreen }       from './screens/InsightsScreen'
import { AskDreamsScreen }      from './screens/AskDreamsScreen'
import { LibraryScreen }        from './screens/LibraryScreen'
import { MeScreen }             from './screens/MeScreen'
import { SocialScreen }         from './screens/SocialScreen'
import { DreamDetailScreen }    from './screens/DreamDetailScreen'
import { WhatsAppScreen }       from './screens/WhatsAppScreen'
import { SettingsScreen }       from './screens/SettingsScreen'
import { StoryViewer }          from './screens/StoryViewer'
import { SearchScreen }         from './screens/SearchScreen'
import { BottomBar }            from './components/BottomBar'
import { SideDrawer }           from './components/SideDrawer'
import type { ActiveView }      from './components/BottomBar'
import type { Dream, User }     from './types/dream'
import { STORY_DREAMS, COMMUNITY_USERS } from './data/mockCommunity'

const KEY_USER      = 'dj_user'
const KEY_ONBOARDED = 'dj_onboarded'

function loadUser(): User | null {
  try { return JSON.parse(localStorage.getItem(KEY_USER) ?? 'null') }
  catch { return null }
}

type AppState = 'login' | 'onboarding' | 'app'
type Overlay  = 'recording' | 'log' | 'settings' | 'whatsapp' | 'dreamdetail' | null

export function App() {
  const { fbUser, status: fbStatus, signIn: fbSignIn, signOut: fbSignOut, configured } = useFirebaseAuth()
  const { dreams, addDream, updateDream, deleteDream } = useDreams(fbUser?.uid ?? null)

  const [appState, setAppState] = useState<AppState>(() => {
    const user = loadUser()
    if (!user) return 'login'
    if (!localStorage.getItem(KEY_ONBOARDED)) return 'onboarding'
    return 'app'
  })

  const [user,              setUser]              = useState<User | null>(loadUser)
  const [activeView,        setActiveView]        = useState<ActiveView>('journal')
  const [overlay,           setOverlay]           = useState<Overlay>(null)
  const [pendingTranscript, setPendingTranscript] = useState('')
  const [focusDream,        setFocusDream]        = useState<Dream | null>(null)
  const [storyIndex,        setStoryIndex]        = useState<number | null>(null)
  const [drawerOpen,        setDrawerOpen]        = useState(false)
  const [searchOpen,        setSearchOpen]        = useState(false)
  const [notifOpen,         setNotifOpen]         = useState(false)
  const [notifications,     setNotifications]     = useState<{ id: string; text: string; time: string; read: boolean }[]>([])
  const [saveToast,         setSaveToast]         = useState('')

  // ── Sync Firebase auth → local user profile ───────────
  useEffect(() => {
    if (fbStatus === 'loading') return
    if (fbUser) {
      // Build / merge a local User from the Google profile
      const existing = loadUser()
      const merged: User = {
        id:           fbUser.uid,
        name:         fbUser.displayName ?? existing?.name ?? 'Dreamer',
        email:        fbUser.email ?? '',
        passwordHash: '',
        dob:          existing?.dob ?? '',
        zodiacSign:   existing?.zodiacSign ?? (existing?.dob ? getZodiacSign(existing.dob).sign : 'pisces'),
        createdAt:    existing?.createdAt ?? new Date().toISOString(),
        photoURL:     fbUser.photoURL ?? undefined,
      }
      localStorage.setItem(KEY_USER, JSON.stringify(merged))
      setUser(merged)
      saveUserProfile(fbUser.uid, { name: merged.name, email: merged.email, zodiacSign: merged.zodiacSign }).catch(() => {})
      if (!localStorage.getItem(KEY_ONBOARDED)) {
        setAppState('onboarding')
      } else {
        setAppState('app')
      }
    } else if (fbStatus === 'signed-out') {
      // Only reset if we were previously signed in via Firebase
      // (don't override local-only login flow)
    }
  }, [fbUser, fbStatus])

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
    // Auto-post confirmation toast
    setSaveToast('Dream saved & added to your story ✓')
    setTimeout(() => setSaveToast(''), 3000)
    // Add in-app notification
    setNotifications(prev => [{
      id: Date.now().toString(),
      text: `"${dream.title}" was added to your story`,
      time: 'Just now',
      read: false,
    }, ...prev])
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
    if (focusDream?.id === id) setFocusDream({ ...focusDream, isPrivate: !focusDream.isPrivate })
  }

  function handleDeleteDream(id: string) {
    deleteDream(id)
    setOverlay(null)
    setFocusDream(null)
  }

  function handleBookmarkDream(id: string) {
    const dream = dreams.find(d => d.id === id)
    if (!dream) return
    updateDream(id, { bookmarked: !dream.bookmarked })
    if (focusDream?.id === id) setFocusDream({ ...focusDream, bookmarked: !focusDream.bookmarked })
  }

  // ── Sign out ──────────────────────────────────────────
  function handleSignOut() {
    fbSignOut().catch(() => {})
    localStorage.removeItem(KEY_USER)
    localStorage.removeItem(KEY_ONBOARDED)
    setUser(null)
    setActiveView('journal')
    setAppState('login')
  }

  // ── Render ────────────────────────────────────────────
  if (appState === 'login') {
    return <div className="app-shell"><LoginScreen onContinue={handleLogin} onGoogleSignIn={fbSignIn} googleConfigured={configured} /></div>
  }

  if (appState === 'onboarding') {
    return <div className="app-shell"><OnboardingScreen onDone={handleOnboardingDone} /></div>
  }

  return (
    <div className="app-shell">
      <div className="tab-content">
        {activeView === 'journal'     && <JournalScreen dreams={dreams} tabMode onOpenDream={handleOpenDream} onAsk={() => setActiveView('ask')} />}
        {activeView === 'gallery'     && <GalleryScreen dreams={dreams} onOpenDream={handleOpenDream} />}
        {activeView === 'symbols'     && <MySymbolsScreen dreams={dreams} />}
        {activeView === 'characters'  && <MyCharactersScreen dreams={dreams} />}
        {activeView === 'places'      && <MyPlacesScreen dreams={dreams} />}
        {activeView === 'collections' && <CollectionsScreen dreams={dreams} />}
        {activeView === 'dashboard'   && <DashboardScreen dreams={dreams} />}
        {activeView === 'digest'      && <DreamerDigestScreen dreams={dreams} />}
        {activeView === 'drafts'      && <DraftsScreen onResumeDraft={t => { setPendingTranscript(t); setOverlay('log') }} />}
        {activeView === 'bookmarks'   && <BookmarksScreen dreams={dreams} onOpenDream={handleOpenDream} />}
        {activeView === 'insights'    && <InsightsScreen dreams={dreams} user={user} />}
        {activeView === 'ask'         && <AskDreamsScreen dreams={dreams} />}
        {activeView === 'library'     && <LibraryScreen />}
        {activeView === 'social'      && <SocialScreen onOpenStory={idx => setStoryIndex(idx)} onAddStory={() => setOverlay('recording')} myName={user?.name} />}
        {activeView === 'me'          && (
          <MeScreen
            user={user}
            dreams={dreams}
            onSignOut={handleSignOut}
            onWhatsApp={() => setOverlay('whatsapp')}
            onSignIn={() => setAppState('login')}
            onRecord={() => setOverlay('recording')}
            onSettings={() => setOverlay('settings')}
          />
        )}
      </div>

      <BottomBar
        onMenu={() => setDrawerOpen(true)}
        onAdd={() => setOverlay('recording')}
        onSocial={() => setActiveView('social')}
        onHome={() => setActiveView('journal')}
        onProfile={() => setActiveView('me')}
        homeActive={activeView === 'journal'}
        socialActive={activeView === 'social'}
        profileActive={activeView === 'me'}
      />

      <SideDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        active={activeView}
        onNavigate={view => setActiveView(view)}
        onSearch={() => setSearchOpen(true)}
        user={user}
      />

      {overlay === 'recording' && (
        <div className="overlay-screen screen-enter">
          <RecordingScreen onDone={handleRecordingDone} onCancel={() => setOverlay(null)} />
        </div>
      )}
      {overlay === 'log' && (
        <div className="overlay-screen screen-enter">
          <LogScreen transcript={pendingTranscript} onSave={handleLogSave} onBack={() => setOverlay('recording')} />
        </div>
      )}
      {overlay === 'dreamdetail' && focusDream && (
        <div className="overlay-screen screen-enter">
          <DreamDetailScreen
            dream={focusDream}
            onBack={() => setOverlay(null)}
            onTogglePrivacy={handleTogglePrivacy}
            onDelete={handleDeleteDream}
            onBookmark={handleBookmarkDream}
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

      {searchOpen && (
        <div className="overlay-screen screen-enter">
          <SearchScreen
            dreams={dreams}
            onClose={() => setSearchOpen(false)}
            onOpenDream={d => { setSearchOpen(false); handleOpenDream(d) }}
          />
        </div>
      )}

      {storyIndex !== null && (
        <StoryViewer
          stories={STORY_DREAMS}
          users={COMMUNITY_USERS}
          startIndex={storyIndex}
          onClose={() => setStoryIndex(null)}
          onViewed={() => {}}
        />
      )}

      {/* ── Bell notification panel ──────────────────── */}
      <button
        className={`app-bell-btn ${notifications.some(n => !n.read) ? 'has-unread' : ''}`}
        onClick={() => { setNotifOpen(v => !v); setNotifications(prev => prev.map(n => ({ ...n, read: true }))) }}
        aria-label="Notifications"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 2a6 6 0 016 6v3l1.5 2.5H2.5L4 11V8a6 6 0 016-6z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
          <path d="M8 16a2 2 0 004 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
        {notifications.some(n => !n.read) && <span className="app-bell-dot" />}
      </button>

      {notifOpen && (
        <>
          <div className="app-notif-scrim" onClick={() => setNotifOpen(false)} />
          <div className="app-notif-panel">
            <div className="app-notif-header">
              <span className="app-notif-title">Notifications</span>
              {notifications.length > 0 && (
                <button className="app-notif-clear" onClick={() => setNotifications([])}>Clear all</button>
              )}
            </div>
            {notifications.length === 0 ? (
              <p className="app-notif-empty">No notifications yet.</p>
            ) : (
              notifications.map(n => (
                <div key={n.id} className="app-notif-item">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M8 1.5L9.5 6H14l-3.7 2.7 1.4 4.3L8 10.3l-3.7 2.7 1.4-4.3L2 6h4.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                  </svg>
                  <div className="app-notif-body">
                    <p className="app-notif-text">{n.text}</p>
                    <span className="app-notif-time">{n.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* ── Save toast ───────────────────────────────── */}
      {saveToast && (
        <div className="app-save-toast">{saveToast}</div>
      )}
    </div>
  )
}
