import { useState, useCallback } from 'react'
import type { User, ZodiacSign } from '../types/dream'
import { getZodiacSign } from '../utils/astro'

const STORAGE_KEY = 'dj_user'

function hashPassword(password: string): string {
  // Simple base64 mock for demonstration — not production security
  return btoa(encodeURIComponent(password))
}

function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash
}

function loadUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw) as User
    }
  } catch {
    // ignore
  }
  return null
}

function saveUser(user: User): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
}

export interface AuthHook {
  user: User | null
  signIn: (email: string, password: string) => boolean
  signUp: (name: string, email: string, password: string, dob: string) => User
  signOut: () => void
}

export function useAuth(): AuthHook {
  const [user, setUser] = useState<User | null>(loadUser)

  const signIn = useCallback((email: string, password: string): boolean => {
    const stored = loadUser()
    if (!stored) return false
    if (stored.email.toLowerCase() !== email.toLowerCase()) return false
    if (!verifyPassword(password, stored.passwordHash)) return false
    setUser(stored)
    return true
  }, [])

  const signUp = useCallback((
    name: string,
    email: string,
    password: string,
    dob: string,
  ): User => {
    const zodiacData = getZodiacSign(dob)
    const newUser: User = {
      id: Date.now().toString(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash: hashPassword(password),
      dob,
      zodiacSign: zodiacData.sign as ZodiacSign,
      createdAt: new Date().toISOString(),
    }
    saveUser(newUser)
    setUser(newUser)
    return newUser
  }, [])

  const signOut = useCallback((): void => {
    // Keep in localStorage — just clear session state
    setUser(null)
  }, [])

  return { user, signIn, signUp, signOut }
}
