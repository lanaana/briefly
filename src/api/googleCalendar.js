export async function fetchUserInfo(accessToken) {
  const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error('Failed to fetch user info')
  return res.json()
}

export async function fetchRangeEvents(accessToken, startDate, endDate) {
  const timeMin = new Date(startDate)
  timeMin.setHours(0, 0, 0, 0)
  const timeMax = new Date(endDate)
  timeMax.setHours(23, 59, 59, 999)

  const params = new URLSearchParams({
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
  })

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )

  if (res.status === 401) throw new Error('TOKEN_EXPIRED')
  if (!res.ok) throw new Error(`Calendar API error: ${res.status}`)

  const data = await res.json()
  return mapCalendarEvents(data.items || [])
}

export async function fetchWeekEvents(accessToken, monday) {
  const timeMin = new Date(monday)
  timeMin.setHours(0, 0, 0, 0)

  const timeMax = new Date(monday)
  timeMax.setDate(monday.getDate() + 6) // Mon → Sun
  timeMax.setHours(23, 59, 59, 999)

  const params = new URLSearchParams({
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
  })

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )

  if (res.status === 401) throw new Error('TOKEN_EXPIRED')
  if (!res.ok) throw new Error(`Calendar API error: ${res.status}`)

  const data = await res.json()
  return mapCalendarEvents(data.items || [])
}

function formatTime(dateTimeStr) {
  const d = new Date(dateTimeStr)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function formatDuration(startStr, endStr) {
  const mins = Math.round((new Date(endStr) - new Date(startStr)) / 60000)
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

function toIsoDate(dateTimeStr) {
  const d = new Date(dateTimeStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function mapCalendarEvents(items) {
  return items
    .filter((e) => e.start?.dateTime && e.end?.dateTime)
    .map((e) => ({
      id: e.id,
      title: e.summary || 'Untitled',
      date: toIsoDate(e.start.dateTime),
      day: new Date(e.start.dateTime).toLocaleDateString('en-US', { weekday: 'short' }),
      startTime: formatTime(e.start.dateTime),
      endTime: formatTime(e.end.dateTime),
      duration: formatDuration(e.start.dateTime, e.end.dateTime),
      attendees: (e.attendees || []).map(
        (a) => a.displayName || a.email?.split('@')[0] || 'Unknown'
      ),
    }))
}
