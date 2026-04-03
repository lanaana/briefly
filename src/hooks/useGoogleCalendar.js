import { useState, useCallback, useRef, useEffect } from 'react'
import { fetchWeekEvents, fetchRangeEvents, fetchUserInfo } from '../api/googleCalendar.js'
import { MEETINGS } from '../data/meetings.js'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const TOKEN_KEY = 'gcal_token'

function saveToken(accessToken, expiresIn, userInfo) {
  const expiry = Date.now() + (expiresIn || 3600) * 1000
  localStorage.setItem(TOKEN_KEY, JSON.stringify({ accessToken, expiry, userInfo }))
}

function loadStoredToken() {
  try {
    const raw = localStorage.getItem(TOKEN_KEY)
    if (!raw) return null
    const stored = JSON.parse(raw)
    if (!stored.accessToken || stored.expiry < Date.now()) {
      localStorage.removeItem(TOKEN_KEY)
      return null
    }
    return stored
  } catch {
    return null
  }
}

// Hardcoded demo week — used when not connected (Mon–Sun)
const DEMO_WEEK_DAYS = [
  { label: 'Mon', date: 14, iso: '2025-04-14' },
  { label: 'Tue', date: 15, iso: '2025-04-15' },
  { label: 'Wed', date: 16, iso: '2025-04-16' },
  { label: 'Thu', date: 17, iso: '2025-04-17' },
  { label: 'Fri', date: 18, iso: '2025-04-18' },
  { label: 'Sat', date: 19, iso: '2025-04-19' },
  { label: 'Sun', date: 20, iso: '2025-04-20' },
]
const DEMO_WEEK_LABEL = 'Apr 14 – 20'

// ── Week helpers ──────────────────────────────────────────

function getMondayOfWeek(offsetWeeks = 0) {
  const now = new Date()
  const dow = now.getDay() // 0=Sun
  const daysToMon = dow === 0 ? -6 : 1 - dow
  const mon = new Date(now)
  mon.setDate(now.getDate() + daysToMon + offsetWeeks * 7)
  mon.setHours(0, 0, 0, 0)
  return mon
}

function toIsoDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const SHORT_DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getWeekDays(monday) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return { label: SHORT_DAY[d.getDay()], date: d.getDate(), iso: toIsoDate(d) }
  })
}

function getWeekLabel(days) {
  if (!days.length) return ''
  const a = new Date(days[0].iso + 'T00:00:00')
  const b = new Date(days[days.length - 1].iso + 'T00:00:00')
  const ma = a.toLocaleDateString('en-US', { month: 'short' })
  const mb = b.toLocaleDateString('en-US', { month: 'short' })
  return ma === mb
    ? `${ma} ${days[0].date} – ${days[days.length - 1].date}`
    : `${ma} ${days[0].date} – ${mb} ${days[days.length - 1].date}`
}

// ── Hook ──────────────────────────────────────────────────

export function useGoogleCalendar() {
  const [accessToken, setAccessToken] = useState(null)
  const [userInfo, setUserInfo] = useState(null)
  const [calendarMeetings, setCalendarMeetings] = useState(null) // null = use demo
  const [weekOffset, setWeekOffset] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null) // null | 'token_expired' | string

  // Keep token in a ref so async callbacks always see the latest value
  const tokenRef = useRef(null)

  const isConnected = !!accessToken

  // ── Restore token from localStorage on mount ──
  useEffect(() => {
    const stored = loadStoredToken()
    if (!stored) return
    const { accessToken: token, userInfo: info } = stored
    setAccessToken(token)
    tokenRef.current = token
    if (info) setUserInfo(info)
    loadEvents(token, 0)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // When connected, compute real week; otherwise use demo
  const monday = getMondayOfWeek(weekOffset)
  const realWeekDays = getWeekDays(monday)
  const weekDays = isConnected ? realWeekDays : DEMO_WEEK_DAYS
  const weekLabel = isConnected ? getWeekLabel(realWeekDays) : DEMO_WEEK_LABEL

  const meetings = calendarMeetings ?? MEETINGS

  // ── Internal: load events for a given offset ──
  const loadEvents = useCallback(async (token, offset) => {
    setLoading(true)
    setError(null)
    try {
      const mon = getMondayOfWeek(offset)
      const events = await fetchWeekEvents(token, mon)
      setCalendarMeetings(events)
    } catch (err) {
      if (err.message === 'TOKEN_EXPIRED') {
        setError('token_expired')
        localStorage.removeItem(TOKEN_KEY)
        setAccessToken(null)
        tokenRef.current = null
        setCalendarMeetings(null)
      } else {
        setError(err.message || 'Failed to load events')
        setCalendarMeetings(null) // fall back to demo meetings
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Connect ──
  const connect = useCallback(() => {
    if (!window.google?.accounts?.oauth2) {
      setError('Google sign-in unavailable. Please refresh and try again.')
      return
    }
    setError(null)

    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/calendar.readonly',
      callback: async (response) => {
        if (response.error) {
          setError('Authentication failed. Please try again.')
          return
        }
        const token = response.access_token
        setAccessToken(token)
        tokenRef.current = token

        let info = null
        try {
          info = await fetchUserInfo(token)
          setUserInfo(info)
        } catch {
          // non-critical
        }

        saveToken(token, response.expires_in, info)

        // Reset to current week on connect
        setWeekOffset(0)
        await loadEvents(token, 0)
      },
    })

    client.requestAccessToken()
  }, [loadEvents])

  // ── Disconnect ──
  const disconnect = useCallback(() => {
    const token = tokenRef.current
    if (token && window.google?.accounts?.oauth2) {
      window.google.accounts.oauth2.revoke(token, () => {})
    }
    localStorage.removeItem(TOKEN_KEY)
    setAccessToken(null)
    tokenRef.current = null
    setUserInfo(null)
    setCalendarMeetings(null)
    setWeekOffset(0)
    setError(null)
    setLoading(false)
  }, [])

  // ── Load arbitrary date range (for month view) ──
  const loadRange = useCallback(async (startDate, endDate) => {
    const token = tokenRef.current
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const events = await fetchRangeEvents(token, startDate, endDate)
      setCalendarMeetings(events)
    } catch (err) {
      if (err.message === 'TOKEN_EXPIRED') {
        setError('token_expired')
        localStorage.removeItem(TOKEN_KEY)
        setAccessToken(null)
        tokenRef.current = null
        setCalendarMeetings(null)
      } else {
        setError(err.message || 'Failed to load events')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Week navigation (only meaningful when connected) ──
  const navigateWeek = useCallback(
    (delta) => {
      const next = weekOffset + delta
      setWeekOffset(next)
      const token = tokenRef.current
      if (token) loadEvents(token, next)
    },
    [weekOffset, loadEvents]
  )

  const goToToday = useCallback(() => {
    setWeekOffset(0)
    const token = tokenRef.current
    if (token) loadEvents(token, 0)
  }, [loadEvents])

  return {
    isConnected,
    userInfo,
    meetings,
    weekDays,
    weekLabel,
    weekOffset,
    loading,
    error,
    connect,
    disconnect,
    navigateWeek,
    goToToday,
    loadRange,
  }
}
