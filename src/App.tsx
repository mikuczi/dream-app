import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import { useDreams } from './hooks/useDreams'
import { getZodiacSign } from './utils/astro'
import { useFirebaseAuth } from './hooks/useFirebaseAuth'
import {
  saveUserProfile, saveFeedPost, removeFeedPost, checkWhitelisted,
  subscribeNotifications, markAllNotificationsRead, clearNotificationsCollection,
  subscribeFollowing, followUser, unfollowUser, createNotification, saveFcmToken,
  saveDefaultCircle, subscribeDefaultCircle,
} from './lib/firestore'
import { getFcmToken } from './lib/firebase'
import type { AppNotification } from './types/dream'
import { analyzeConnections } from './utils/dreamConnections'

// Eagerly loaded (needed for auth flow)
import { LoginScreen }          from './screens/LoginScreen'
import { OnboardingScreen }     from './screens/OnboardingScreen'
import type { DreamCircle }     from './screens/DreamCircleScreen'

// Lazy-loaded screens (split off from main bundle)
const PaywallScreen          = lazy(() => import('./screens/PaywallScreen').then(m => ({ default: m.PaywallScreen })))
const DailyLimitPaywall      = lazy(() => import('./screens/DailyLimitPaywall').then(m => ({ default: m.DailyLimitPaywall })))
const RecordingScreen        = lazy(() => import('./screens/RecordingScreen').then(m => ({ default: m.RecordingScreen })))
const LogScreen              = lazy(() => import('./screens/LogScreen').then(m => ({ default: m.LogScreen })))
const JournalScreen          = lazy(() => import('./screens/JournalScreen').then(m => ({ default: m.JournalScreen })))
const GalleryScreen          = lazy(() => import('./screens/GalleryScreen').then(m => ({ default: m.GalleryScreen })))
const MySymbolsScreen        = lazy(() => import('./screens/MySymbolsScreen').then(m => ({ default: m.MySymbolsScreen })))
const MyCharactersScreen     = lazy(() => import('./screens/MyCharactersScreen').then(m => ({ default: m.MyCharactersScreen })))
const MyPlacesScreen         = lazy(() => import('./screens/MyPlacesScreen').then(m => ({ default: m.MyPlacesScreen })))
const CollectionsScreen      = lazy(() => import('./screens/CollectionsScreen').then(m => ({ default: m.CollectionsScreen })))
const DashboardScreen        = lazy(() => import('./screens/DashboardScreen').then(m => ({ default: m.DashboardScreen })))
const DreamerDigestScreen    = lazy(() => import('./screens/DreamerDigestScreen').then(m => ({ default: m.DreamerDigestScreen })))
const DraftsScreen           = lazy(() => import('./screens/DraftsScreen').then(m => ({ default: m.DraftsScreen })))
const BookmarksScreen        = lazy(() => import('./screens/BookmarksScreen').then(m => ({ default: m.BookmarksScreen })))
const InsightsScreen         = lazy(() => import('./screens/InsightsScreen').then(m => ({ default: m.InsightsScreen })))
const AskDreamsScreen        = lazy(() => import('./screens/AskDreamsScreen').then(m => ({ default: m.AskDreamsScreen })))
const LibraryScreen          = lazy(() => import('./screens/LibraryScreen').then(m => ({ default: m.LibraryScreen })))
const MeScreen               = lazy(() => import('./screens/MeScreen').then(m => ({ default: m.MeScreen })))
const SocialScreen           = lazy(() => import('./screens/SocialScreen').then(m => ({ default: m.SocialScreen })))
const DreamConstellationScreen = lazy(() => import('./screens/DreamConstellationScreen').then(m => ({ default: m.DreamConstellationScreen })))
const DreamDetailScreen      = lazy(() => import('./screens/DreamDetailScreen').then(m => ({ default: m.DreamDetailScreen })))
const WhatsAppScreen         = lazy(() => import('./screens/WhatsAppScreen').then(m => ({ default: m.WhatsAppScreen })))
const SettingsScreen         = lazy(() => import('./screens/SettingsScreen').then(m => ({ default: m.SettingsScreen })))
const StoryViewer            = lazy(() => import('./screens/StoryViewer').then(m => ({ default: m.StoryViewer })))
const SearchScreen           = lazy(() => import('./screens/SearchScreen').then(m => ({ default: m.SearchScreen })))
const UserProfileScreen      = lazy(() => import('./screens/UserProfileScreen').then(m => ({ default: m.UserProfileScreen })))
const DreamCircleScreen      = lazy(() => import('./screens/DreamCircleScreen').then(m => ({ default: m.DreamCircleScreen })))
import { BottomBar }            from './components/BottomBar'
import { SideDrawer }           from './components/SideDrawer'
import type { ActiveView }      from './components/BottomBar'
import type { Dream, User, DreamVisibility } from './types/dream'
import { getEarnedBadgeIds, BADGES, type BadgeFlags } from './data/badges'
import { STORY_DREAMS, COMMUNITY_USERS } from './data/mockCommunity'

const KEY_USER              = 'dj_user'
const KEY_ONBOARDED         = 'dj_onboarded' // legacy key — new code uses per-user key below
function onboardedKey(uid: string) { return `dj_onboarded_${uid}` }
const KEY_SEEN_BADGES       = 'dj_seen_badges'
const KEY_CHECKIN_DATE      = 'dj_checkin_date'
const FREE_DAILY_LIMIT      = 999 // TODO: restore to 3 before launch

// Per-user recording limit — each account gets its own daily counter
function recordingsKey(uid?: string | null) {
  return uid ? `dj_daily_recordings_${uid}` : 'dj_daily_recordings'
}

function getTodayRecordings(uid?: string | null): { date: string; count: number } {
  try {
    const raw = localStorage.getItem(recordingsKey(uid))
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed.date === new Date().toDateString()) return parsed
    }
  } catch { /* ignore */ }
  return { date: new Date().toDateString(), count: 0 }
}

function incrementTodayRecordings(uid?: string | null): number {
  const current = getTodayRecordings(uid)
  const updated = { date: current.date, count: current.count + 1 }
  localStorage.setItem(recordingsKey(uid), JSON.stringify(updated))
  return updated.count
}

function loadUser(): User | null {
  try { return JSON.parse(localStorage.getItem(KEY_USER) ?? 'null') }
  catch { return null }
}

type AppState = 'login' | 'onboarding' | 'app' | 'blocked'
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
  const [deferredInstall, setDeferredInstall]   = useState<any>(null)
  const [installSkipped,  setInstallSkipped]    = useState(false)

  const [user,              setUser]              = useState<User | null>(loadUser)
  const [activeView,        setActiveView]        = useState<ActiveView>('journal')
  const [overlay,           setOverlay]           = useState<Overlay>(null)
  const [pendingTranscript, setPendingTranscript] = useState('')
  const [focusDream,        setFocusDream]        = useState<Dream | null>(null)
  const [storyIndex,        setStoryIndex]        = useState<number | null>(null)
  const [myStories,         setMyStories]         = useState<Dream[]>([])
  const [circle,            setCircle]            = useState<DreamCircle>({ name: 'Inner Circle', color: '#9B8CFF', memberIds: [] })
  const [badgeFlags,        setBadgeFlags]        = useState<BadgeFlags>({ viewedConstellation: false, createdCircle: false })
  const [paywallOpen,       setPaywallOpen]       = useState(false)
  const [dailyLimitOpen,    setDailyLimitOpen]    = useState(false)
  const [avatarUrl,         setAvatarUrl]         = useState<string | undefined>(undefined)
  const [checkInOpen,       setCheckInOpen]       = useState(false)
  const [newBadge,          setNewBadge]          = useState<{ name: string; icon: string } | null>(null)
  const seenBadgeIds = useRef<Set<string>>(new Set(JSON.parse(localStorage.getItem(KEY_SEEN_BADGES) ?? '[]')))
  const [drawerOpen,        setDrawerOpen]        = useState(false)
  const [searchOpen,        setSearchOpen]        = useState(false)
  const [notifOpen,         setNotifOpen]         = useState(false)
  const [notifications,     setNotifications]     = useState<{ id: string; text: string; time: string; read: boolean; dreamId?: string }[]>([])
  const [saveToast,         setSaveToast]         = useState('')
  const [followingSet,      setFollowingSet]      = useState<Set<string>>(new Set())
  const [profileUid,        setProfileUid]        = useState<string | null>(null)
  const seenConnectionIds = useRef<Set<string>>(new Set())

  // ── Capture PWA install prompt ────────────────────────
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredInstall(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  // ── Firestore notifications subscription ──────────────
  useEffect(() => {
    if (!fbUser) {
      // Clear state when signed out so a new user doesn't see stale data
      setNotifications([])
      setFollowingSet(new Set())
      return
    }
    return subscribeNotifications(fbUser.uid, (fsNotifs) => {
      setNotifications(prev => {
        const prevIds = new Set(prev.map(n => n.id))
        const incoming = fsNotifs
          .filter(n => !prevIds.has(n.id))
          .map(n => ({
            id: n.id,
            text: buildNotifText(n),
            time: formatNotifTime(n.createdAt),
            read: n.read,
            dreamId: n.dreamId,
          }))
        return incoming.length ? [...incoming, ...prev] : prev
      })
    })
  }, [fbUser]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Follow graph subscription ──────────────────────────
  useEffect(() => {
    if (!fbUser) return
    return subscribeFollowing(fbUser.uid, uids => setFollowingSet(new Set(uids)))
  }, [fbUser])

  // ── Circle real-time sync ──────────────────────────────
  useEffect(() => {
    if (!fbUser) return
    return subscribeDefaultCircle(fbUser.uid, c => {
      setCircle(c)
      if (c.memberIds.length > 0) setBadgeFlags(f => ({ ...f, createdCircle: true }))
    })
  }, [fbUser])

  // ── Dream connections → notifications ─────────────────
  useEffect(() => {
    if (dreams.length < 2) return
    const connections = analyzeConnections(dreams)
    const newOnes = connections.filter(c => !seenConnectionIds.current.has(c.id))
    if (!newOnes.length) return
    newOnes.forEach(c => seenConnectionIds.current.add(c.id))
    setNotifications(prev => [
      ...newOnes.map(c => ({
        id: c.id,
        text: c.notifText,
        time: 'Just now',
        read: false,
      })),
      ...prev,
    ])
  }, [dreams])

  // ── Badge unlock toasts ────────────────────────────────
  useEffect(() => {
    if (appState !== 'app') return
    const earned = getEarnedBadgeIds(dreams, badgeFlags)
    for (const id of earned) {
      if (!seenBadgeIds.current.has(id)) {
        seenBadgeIds.current.add(id)
        localStorage.setItem(KEY_SEEN_BADGES, JSON.stringify([...seenBadgeIds.current]))
        const badge = BADGES.find(b => b.id === id)
        if (badge) {
          setNewBadge({ name: badge.name, icon: badge.icon })
          setTimeout(() => setNewBadge(null), 3500)
          break // show one at a time
        }
      }
    }
  }, [dreams, badgeFlags, appState])

  // ── Morning check-in (6am–11am, once per day) ─────────
  useEffect(() => {
    if (appState !== 'app') return
    const hour = new Date().getHours()
    if (hour < 6 || hour >= 11) return
    const today = new Date().toDateString()
    if (localStorage.getItem(KEY_CHECKIN_DATE) === today) return
    const timer = setTimeout(() => setCheckInOpen(true), 1200)
    return () => clearTimeout(timer)
  }, [appState])

  // ── Sync Firebase auth → local user profile ───────────
  useEffect(() => {
    if (fbStatus === 'loading') return
    if (fbUser) {
      // Load this user's avatar (per-user key)
      const savedAvatar = localStorage.getItem(`dj_avatar_${fbUser.uid}`) ?? undefined
      setAvatarUrl(savedAvatar)

      // Build / merge a local User from the Google profile
      const existing = loadUser()
      const merged: User = {
        id:           fbUser.uid,
        name:         fbUser.displayName ?? existing?.name ?? 'Dreamer',
        username:     existing?.username ?? fbUser.email?.split('@')[0] ?? fbUser.uid.slice(0, 8),
        email:        fbUser.email ?? '',
        dob:          existing?.dob ?? '',
        zodiacSign:   existing?.zodiacSign ?? (existing?.dob ? getZodiacSign(existing.dob).sign : 'pisces'),
        createdAt:    existing?.createdAt ?? new Date().toISOString(),
        photoURL:     avatarUrl ?? fbUser.photoURL ?? undefined,
      }
      // Check email whitelist before granting access
      checkWhitelisted(merged.email).then(allowed => {
        if (!allowed) {
          fbSignOut().catch(() => {})
          setAppState('blocked')
          return
        }
        localStorage.setItem(KEY_USER, JSON.stringify(merged))
        setUser(merged)
        saveUserProfile(fbUser.uid, {
          name: merged.name,
          email: merged.email.toLowerCase(),
          username: merged.username,
          zodiacSign: merged.zodiacSign,
          photoURL: merged.photoURL ?? null,
        }).catch(err => console.error('[profile] saveUserProfile failed:', err))
        // Register FCM token for push notifications (non-blocking)
        getFcmToken().then(token => {
          if (token) saveFcmToken(fbUser.uid, token).catch(() => {})
        }).catch(() => {})
        // Check per-user key first, fall back to legacy key for existing users
        const hasOnboarded = localStorage.getItem(onboardedKey(fbUser.uid)) || localStorage.getItem(KEY_ONBOARDED)
        if (!hasOnboarded) {
          setAppState('onboarding')
        } else {
          // Migrate legacy key to per-user key
          if (!localStorage.getItem(onboardedKey(fbUser.uid))) {
            localStorage.setItem(onboardedKey(fbUser.uid), '1')
          }
          setAppState('app')
        }
      }).catch(() => {
        // If whitelist check fails, allow access (fail open)
        localStorage.setItem(KEY_USER, JSON.stringify(merged))
        setUser(merged)
        const hasOnboarded = localStorage.getItem(onboardedKey(fbUser.uid)) || localStorage.getItem(KEY_ONBOARDED)
        if (!hasOnboarded) {
          setAppState('onboarding')
        } else {
          if (!localStorage.getItem(onboardedKey(fbUser.uid))) {
            localStorage.setItem(onboardedKey(fbUser.uid), '1')
          }
          setAppState('app')
        }
      })
    } else if (fbStatus === 'signed-out') {
      if (configured) {
        localStorage.removeItem(KEY_USER)
        // Do NOT clear KEY_ONBOARDED here — the auth listener fires signed-out
        // transiently on every page load, which would wipe onboarding progress.
        // KEY_ONBOARDED is only cleared by handleSignOut (explicit sign-out).
        setUser(null)
        setAppState('login')
        // Clear all user-specific state so it doesn't bleed into the next account
        clearUserState()
      }
    }
  }, [fbUser, fbStatus])


  function buildNotifText(n: AppNotification): string {
    switch (n.type) {
      case 'comment': return `${n.fromUserName} commented on your dream${n.dreamTitle ? ` "${n.dreamTitle}"` : ''}`
      case 'like':    return `${n.fromUserName} liked your dream${n.dreamTitle ? ` "${n.dreamTitle}"` : ''}`
      case 'follow':  return `${n.fromUserName} started following you`
      case 'circle_invite': return `${n.fromUserName} invited you to ${n.circleName ?? 'a circle'}`
      default: return n.fromUserName
    }
  }

  function formatNotifTime(isoDate: string): string {
    const mins = Math.floor((Date.now() - new Date(isoDate).getTime()) / 60000)
    if (mins < 1)  return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  function handleFollow(targetUid: string, targetName: string, targetUsername: string) {
    if (!fbUser || !user) return
    if (followingSet.has(targetUid)) {
      setFollowingSet(prev => { const s = new Set(prev); s.delete(targetUid); return s })
      unfollowUser(fbUser.uid, targetUid).catch(() => {})
    } else {
      setFollowingSet(prev => new Set([...prev, targetUid]))
      followUser(fbUser.uid, user.name, { uid: targetUid, name: targetName, username: targetUsername }).catch(() => {})
      createNotification(targetUid, {
        id: `follow_from_${fbUser.uid}`,  // stable ID — overwrites on re-follow
        type: 'follow',
        fromUserId: fbUser.uid,
        fromUserName: user.name,
        fromUserPhoto: avatarUrl ?? fbUser.photoURL ?? undefined,
        read: false,
        createdAt: new Date().toISOString(),
      }).catch(() => {})
    }
  }

  function handleOnboardingDone(data?: { platform?: 'whatsapp' | 'telegram'; phone?: string; dialCode?: string; username?: string }) {
    localStorage.setItem(KEY_ONBOARDED, '1') // legacy key
    if (fbUser) localStorage.setItem(onboardedKey(fbUser.uid), '1')
    if (data?.username && fbUser) {
      const updated = { ...user, username: data.username } as User
      localStorage.setItem(KEY_USER, JSON.stringify(updated))
      setUser(updated)
      saveUserProfile(fbUser.uid, { username: data.username }).catch(() => {})
    }
    if (data?.phone) {
      const backendUrl = import.meta.env.VITE_BACKEND_URL
      if (backendUrl) {
        fetch(`${backendUrl}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone:    data.phone,
            platform: data.platform,
            userId:   user?.id ?? 'anonymous',
            name:     user?.name ?? 'Dreamer',
          }),
        }).catch(() => {/* non-blocking */})
      }
    }
    setAppState('app')
  }

  // ── Recording ─────────────────────────────────────────
  function openRecording() {
    // TODO: re-enable limit check before launch
    // const { count } = getTodayRecordings(fbUser?.uid)
    // if (count >= FREE_DAILY_LIMIT) { setDailyLimitOpen(true); return }
    setOverlay('recording')
  }

  function handleRecordingDone(transcript: string) {
    setPendingTranscript(transcript)
    setOverlay('log')
  }

  function handleLogSave(dream: Dream) {
    addDream(dream)
    incrementTodayRecordings(fbUser?.uid)
    setOverlay(null)

    // Add to story if flagged or if it's the user's first dream
    const isFirst = dreams.length === 0
    if (dream.inStory || isFirst) {
      setMyStories(prev => [dream, ...prev.filter(d => d.id !== dream.id)])
    }

    // Mirror to feed collection if shared
    if (dream.inFeed && dream.visibility !== 'private' && fbUser) {
      saveFeedPost({
        id: dream.id,
        authorId: fbUser.uid,
        authorName: fbUser.displayName ?? user?.name ?? 'Dreamer',
        authorPhoto: fbUser.photoURL ?? undefined,
        dreamId: dream.id,
        title: dream.title,
        transcript: dream.transcript,
        mood: dream.mood,
        tags: dream.tags,
        visibility: dream.visibility as 'circle' | 'public',
        circleId: dream.circleId,
        inStory: dream.inStory,
        createdAt: dream.createdAt,
      }).catch(() => {})
    }

    const toastMsg = dream.inStory
      ? 'Dream saved & added to your story ✓'
      : 'Dream saved to your journal ✓'
    setSaveToast(toastMsg)
    setTimeout(() => setSaveToast(''), 3000)
    setNotifications(prev => [{
      id: Date.now().toString(),
      text: `"${dream.title}" was saved${dream.inStory ? ' & added to your story' : ''}`,
      time: 'Just now',
      read: false,
      dreamId: dream.id,
    }, ...prev])
  }

  // ── Dream detail ──────────────────────────────────────
  function handleOpenDream(dream: Dream) {
    setFocusDream(dream)
    setOverlay('dreamdetail')
  }

  function handleSetVisibility(id: string, visibility: DreamVisibility) {
    updateDream(id, { visibility, isPrivate: visibility === 'private' })
    if (focusDream?.id === id) setFocusDream({ ...focusDream, visibility, isPrivate: visibility === 'private' })
    // Sync with feed collection
    if (!fbUser) return
    const dream = dreams.find(d => d.id === id)
    if (!dream) return
    if (visibility === 'private') {
      removeFeedPost(id).catch(() => {})
    } else {
      saveFeedPost({
        id: dream.id,
        authorId: fbUser.uid,
        authorName: fbUser.displayName ?? user?.name ?? 'Dreamer',
        authorPhoto: fbUser.photoURL ?? undefined,
        dreamId: dream.id,
        title: dream.title,
        transcript: dream.transcript,
        mood: dream.mood,
        tags: dream.tags,
        visibility: visibility as 'circle' | 'public',
        circleId: dream.circleId,
        inStory: !!dream.inStory,
        createdAt: dream.createdAt,
      }).catch(() => {})
    }
  }

  function handleDeleteDream(id: string) {
    deleteDream(id)
    setOverlay(null)
    setFocusDream(null)
  }

  function handleShareToStory(dream: Dream) {
    setMyStories(prev => [dream, ...prev.filter(d => d.id !== dream.id)])
  }

  function handleShareToCircle(dream: Dream) {
    updateDream(dream.id, { visibility: 'circle', isPrivate: false })
    if (focusDream?.id === dream.id) setFocusDream({ ...focusDream, visibility: 'circle' })
    if (fbUser) {
      saveFeedPost({
        id: dream.id,
        authorId: fbUser.uid,
        authorName: fbUser.displayName ?? user?.name ?? 'Dreamer',
        authorPhoto: fbUser.photoURL ?? undefined,
        dreamId: dream.id,
        title: dream.title,
        transcript: dream.transcript,
        mood: dream.mood,
        tags: dream.tags,
        visibility: 'circle',
        circleId: dream.circleId,
        inStory: !!dream.inStory,
        createdAt: dream.createdAt,
      }).catch(() => {})
    }
  }

  function handleBookmarkDream(id: string) {
    const dream = dreams.find(d => d.id === id)
    if (!dream) return
    updateDream(id, { bookmarked: !dream.bookmarked })
    if (focusDream?.id === id) setFocusDream({ ...focusDream, bookmarked: !focusDream.bookmarked })
  }

  // ── Avatar upload ─────────────────────────────────────
  function handleAvatarUpload(dataUrl: string) {
    setAvatarUrl(dataUrl)
    if (fbUser) localStorage.setItem(`dj_avatar_${fbUser.uid}`, dataUrl)
  }

  // ── Sign out ──────────────────────────────────────────
  function clearUserState() {
    setAvatarUrl(undefined)
    setMyStories([])
    setCircle({ name: 'Inner Circle', color: '#9B8CFF', memberIds: [] })
    setBadgeFlags({ viewedConstellation: false, createdCircle: false })
    setStoryIndex(null)
    setFocusDream(null)
    setOverlay(null)
    setProfileUid(null)
    seenBadgeIds.current = new Set()
    seenConnectionIds.current = new Set()
  }

  function handleSignOut() {
    fbSignOut().catch(() => {})
    localStorage.removeItem(KEY_USER)
    // Do NOT remove onboarding key — it's per-user and survives sign-out intentionally
    setUser(null)
    setActiveView('journal')
    setAppState('login')
    clearUserState()
  }

  // ── Render ────────────────────────────────────────────
  if (appState === 'blocked') {
    return (
      <div className="app-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', padding: '32px', textAlign: 'center', flexDirection: 'column', gap: '16px' }}>
        <span style={{ fontSize: '48px' }}>🌙</span>
        <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '24px', color: 'var(--text-primary)', margin: 0 }}>Access Restricted</h2>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '15px', color: 'var(--text-secondary)', maxWidth: '280px', lineHeight: 1.6, margin: 0 }}>
          This account is not on the early-access list. Please contact the app admin to request access.
        </p>
        <button
          onClick={() => { fbSignOut().catch(() => {}); setAppState('login') }}
          style={{ marginTop: '8px', padding: '12px 24px', borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', fontFamily: 'var(--font-ui)', fontSize: '14px', cursor: 'pointer' }}
        >
          Sign out
        </button>
      </div>
    )
  }

  if (appState === 'login') {
    return (
      <div className="app-shell">
        <LoginScreen
          onGoogleSignIn={fbSignIn}
          googleConfigured={configured}
          deferredPrompt={deferredInstall}
          onInstallSkipped={() => setInstallSkipped(true)}
        />
      </div>
    )
  }

  if (appState === 'onboarding') {
    return (
      <div className="app-shell">
        <OnboardingScreen
          onDone={handleOnboardingDone}
          deferredPrompt={installSkipped ? deferredInstall : null}
          installSkipped={installSkipped}
        />
      </div>
    )
  }

  return (
    <div className="app-shell">
      <Suspense fallback={<div className="app-lazy-fallback" />}>
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
        {activeView === 'insights'    && <InsightsScreen dreams={dreams} user={user} onConstellation={() => { setActiveView('constellation'); setBadgeFlags(f => ({ ...f, viewedConstellation: true })) }} />}
        {activeView === 'ask'           && <AskDreamsScreen dreams={dreams} />}
        {activeView === 'constellation' && (
          <DreamConstellationScreen
            dreams={dreams}
            onOpenDream={id => { const d = dreams.find(x => x.id === id); if (d) handleOpenDream(d) }}
            onBack={() => setActiveView('insights')}
          />
        )}
        {activeView === 'library'     && <LibraryScreen />}
        {activeView === 'social'      && <SocialScreen
          onOpenStory={idx => setStoryIndex(myStories.length + idx)}
          onOpenMyStory={() => setStoryIndex(0)}
          onAddStory={openRecording}
          myName={user?.name}
          myAvatar={avatarUrl ?? user?.photoURL}
          myStories={myStories}
          dreams={dreams}
          circle={circle}
          onManageCircle={() => setActiveView('circle')}
          currentUserId={fbUser?.uid}
          currentUserName={user?.name}
          followingSet={followingSet}
          onFollow={handleFollow}
          onViewProfile={uid => setProfileUid(uid)}
        />}
        {activeView === 'circle'      && <DreamCircleScreen circle={circle} dreams={dreams} myName={user?.name} currentUid={fbUser?.uid} currentName={user?.name} onFollowUser={(uid, name) => handleFollow(uid, name, '')} onUpdate={c => { setCircle(c); if (fbUser) saveDefaultCircle(fbUser.uid, c).catch(() => {}); if (c.memberIds.length > 0) setBadgeFlags(f => ({ ...f, createdCircle: true })) }} onBack={() => setActiveView('social')} />}
        {activeView === 'me'          && (
          <MeScreen
            user={user}
            dreams={dreams}
            onSignOut={handleSignOut}
            onWhatsApp={() => setOverlay('whatsapp')}
            onSignIn={() => setAppState('login')}
            onRecord={openRecording}
            onSettings={() => setOverlay('settings')}
            onPaywall={() => setPaywallOpen(true)}
            badgeFlags={badgeFlags}
            todayRecordings={getTodayRecordings(fbUser?.uid).count}
            dailyLimit={FREE_DAILY_LIMIT}
            circleCount={circle.memberIds.length}
            onAvatarUpload={handleAvatarUpload}
          />
        )}
      </div>

      <BottomBar
        onMenu={() => setDrawerOpen(true)}
        onAdd={openRecording}
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
            onSetVisibility={handleSetVisibility}
            onDelete={handleDeleteDream}
            onBookmark={handleBookmarkDream}
            onShareToStory={handleShareToStory}
            onShareToCircle={handleShareToCircle}
            hasCircle={circle.memberIds.length > 0}
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

      {profileUid && (
        <UserProfileScreen
          targetUid={profileUid}
          currentUserId={fbUser?.uid}
          followingSet={followingSet}
          onFollow={handleFollow}
          onBack={() => setProfileUid(null)}
        />
      )}

      {storyIndex !== null && (() => {
        // Build a CommunityUser entry for the current user so StoryViewer can render their name/avatar
        const myUserId = fbUser?.uid ?? 'me'
        const myUserEntry = {
          id: myUserId,
          name: user?.name ?? 'You',
          initials: (user?.name ?? 'ME').slice(0, 2).toUpperCase(),
          zodiac: user?.zodiacSign ?? '',
          viewed: false,
          avatar: avatarUrl ?? user?.photoURL ?? undefined,
        }
        // Convert myStories Dreams → CommunityDream so they work in StoryViewer
        const myStoriesMapped = myStories.map(d => ({
          id: d.id,
          userId: myUserId,
          title: d.title,
          text: d.transcript.slice(0, 180) + (d.transcript.length > 180 ? '…' : ''),
          visual: d.artwork ?? 'radial-gradient(ellipse at 50% 30%, #1a1030 0%, #080510 100%)',
          mood: d.mood,
          tags: d.tags.slice(0, 3),
          likes: 0, comments: 0, saves: 0,
          timeAgo: 'Just now',
          liked: false, saved: false,
        }))
        const allStories = [...myStoriesMapped, ...STORY_DREAMS]
        const allUsers   = [myUserEntry, ...COMMUNITY_USERS]
        return (
          <StoryViewer
            stories={allStories}
            users={allUsers}
            startIndex={storyIndex}
            onClose={() => setStoryIndex(null)}
            onViewed={() => {}}
          />
        )
      })()}

      {/* ── Bell notification panel ──────────────────── */}
      <button
        className={`app-bell-btn ${notifications.some(n => !n.read) ? 'has-unread' : ''}`}
        onClick={() => {
          setNotifOpen(v => !v)
          setNotifications(prev => prev.map(n => ({ ...n, read: true })))
          if (fbUser) markAllNotificationsRead(fbUser.uid).catch(() => {})
        }}
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
                <button className="app-notif-clear" onClick={() => {
                  setNotifications([])
                  if (fbUser) clearNotificationsCollection(fbUser.uid).catch(() => {})
                }}>Clear all</button>
              )}
            </div>
            {notifications.length === 0 ? (
              <p className="app-notif-empty">No notifications yet.</p>
            ) : (
              notifications.map(n => (
                <div key={n.id} className={`app-notif-item ${n.dreamId ? 'app-notif-item-link' : ''}`} onClick={() => {
                  if (n.dreamId) {
                    const dream = dreams.find(d => d.id === n.dreamId)
                    if (dream) { handleOpenDream(dream); setNotifOpen(false) }
                  }
                }}>
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

      {/* ── Badge unlock toast ───────────────────────── */}
      {newBadge && (
        <div className="app-badge-toast">
          <span className="app-badge-toast-icon">{newBadge.icon}</span>
          <div className="app-badge-toast-text">
            <span className="app-badge-toast-label">Achievement unlocked</span>
            <span className="app-badge-toast-name">{newBadge.name}</span>
          </div>
        </div>
      )}

      {/* ── Morning check-in ─────────────────────────── */}
      {checkInOpen && (
        <div className="app-checkin-overlay" onClick={() => { setCheckInOpen(false); localStorage.setItem(KEY_CHECKIN_DATE, new Date().toDateString()) }}>
          <div className="app-checkin-sheet" onClick={e => e.stopPropagation()}>
            <div className="app-checkin-handle" />
            <span className="app-checkin-icon">🌙</span>
            <h3 className="app-checkin-title">Did you dream last night?</h3>
            <p className="app-checkin-sub">Capture it before it fades.</p>
            <div className="app-checkin-btns">
              <button className="app-checkin-yes" onClick={() => {
                setCheckInOpen(false)
                localStorage.setItem(KEY_CHECKIN_DATE, new Date().toDateString())
                openRecording()
              }}>
                Yes, log it →
              </button>
              <button className="app-checkin-no" onClick={() => {
                setCheckInOpen(false)
                localStorage.setItem(KEY_CHECKIN_DATE, new Date().toDateString())
              }}>
                Not today
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Paywall ───────────────────────────────────── */}
      {paywallOpen && (
        <PaywallScreen onClose={() => setPaywallOpen(false)} userId={fbUser?.uid} />
      )}

      {/* ── Daily limit paywall ───────────────────────── */}
      {dailyLimitOpen && (
        <DailyLimitPaywall
          usedToday={getTodayRecordings(fbUser?.uid).count}
          onClose={() => setDailyLimitOpen(false)}
        />
      )}
      </Suspense>
    </div>
  )
}
