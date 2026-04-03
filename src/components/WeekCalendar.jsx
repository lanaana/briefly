import { useMemo, useState, useEffect } from 'react'
import WeekNav from './WeekNav.jsx'
import styles from './WeekCalendar.module.css'

const START_HOUR = 8
const END_HOUR = 18
const HOUR_PX = 60
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => i + START_HOUR)
const GRID_HEIGHT = (END_HOUR - START_HOUR) * HOUR_PX

const WEEKEND_DAYS = new Set(['Sat', 'Sun'])
const MONTH_DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// ── Helpers ──────────────────────────────────────────────

function toIsoDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getMondayOf(d) {
  const dow = d.getDay()
  const offset = dow === 0 ? -6 : 1 - dow
  const mon = new Date(d)
  mon.setDate(d.getDate() + offset)
  mon.setHours(0, 0, 0, 0)
  return mon
}

function getWeekOffsetForDate(date) {
  const targetMon = getMondayOf(date)
  const todayMon = getMondayOf(new Date())
  return Math.round((targetMon.getTime() - todayMon.getTime()) / (7 * 24 * 60 * 60 * 1000))
}

function buildMonthGrid(date) {
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1)
  const dow = firstDay.getDay()
  const daysBack = dow === 0 ? 6 : dow - 1
  const start = new Date(firstDay)
  start.setDate(firstDay.getDate() - daysBack)

  const cells = []
  const cur = new Date(start)
  for (let i = 0; i < 42; i++) {
    cells.push({
      date: cur.getDate(),
      iso: toIsoDate(cur),
      isCurrentMonth: cur.getMonth() === month,
    })
    cur.setDate(cur.getDate() + 1)
  }
  return cells
}

function getMonthGridRange(date) {
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1)
  const dow = firstDay.getDay()
  const daysBack = dow === 0 ? 6 : dow - 1
  const start = new Date(firstDay)
  start.setDate(firstDay.getDate() - daysBack)
  const end = new Date(start)
  end.setDate(start.getDate() + 41) // 42 cells
  return { start, end }
}

function timeToTopPx(timeStr) {
  const [h, m] = timeStr.split(':').map(Number)
  return (h - START_HOUR) * HOUR_PX + (m / 60) * HOUR_PX
}

function durationToPx(startTime, endTime) {
  const [sh, sm] = startTime.split(':').map(Number)
  const [eh, em] = endTime.split(':').map(Number)
  return eh * 60 + em - (sh * 60 + sm)
}

// ── Component ─────────────────────────────────────────────

export default function WeekCalendar({
  meetings,
  summaries,
  selectedId,
  onSelect,
  days,
  isConnected,
  weekLabel,
  weekOffset,
  loading,
  onPrev,
  onNext,
  onToday,
  onNavigateTo,
  onLoadRange,
}) {
  const [calView, setCalView] = useState('week')
  const [monthDate, setMonthDate] = useState(() => new Date(days[0].iso + 'T12:00:00'))

  const todayIso = toIsoDate(new Date())

  // ── Fetch month range events when month view is active ──
  useEffect(() => {
    if (calView !== 'month' || !onLoadRange) return
    const { start, end } = getMonthGridRange(monthDate)
    onLoadRange(start, end)
  }, [calView, monthDate]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Month navigation ──
  const handlePrevMonth = () =>
    setMonthDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  const handleNextMonth = () =>
    setMonthDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
  const handleThisMonth = () => setMonthDate(new Date())

  const isCurrentMonth =
    monthDate.getFullYear() === new Date().getFullYear() &&
    monthDate.getMonth() === new Date().getMonth()

  // ── View-aware nav handlers ──
  const handlePrev = calView === 'week' ? onPrev : handlePrevMonth
  const handleNext = calView === 'week' ? onNext : handleNextMonth
  const handleToday = calView === 'week' ? onToday : handleThisMonth
  const showToday = calView === 'week' && weekOffset !== 0
  const navLabel =
    calView === 'week'
      ? weekLabel
      : monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  // ── Month day click → navigate to that week ──
  const handleMonthDayClick = (isoDate) => {
    const target = new Date(isoDate + 'T12:00:00')
    const targetOffset = getWeekOffsetForDate(target)
    const delta = targetOffset - weekOffset
    if (onNavigateTo) onNavigateTo(delta)
    setCalView('week')
  }

  // ── Meetings indexed by day ──
  const meetingsByDay = useMemo(() => {
    const map = {}
    days.forEach((d) => { map[d.iso] = [] })
    meetings.forEach((m) => {
      if (map[m.date]) map[m.date].push(m)
    })
    return map
  }, [meetings, days])

  // All meetings indexed by date for month view
  const meetingsByDate = useMemo(() => {
    const map = {}
    meetings.forEach((m) => {
      if (!map[m.date]) map[m.date] = []
      map[m.date].push(m)
    })
    return map
  }, [meetings])

  const monthCells = useMemo(() => buildMonthGrid(monthDate), [monthDate])

  return (
    <div className={styles.container}>
      {/* Nav bar — always visible */}
      <WeekNav
        label={navLabel}
        showToday={showToday}
        loading={loading}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
        showArrows={isConnected}
        calView={calView}
        onSetView={setCalView}
      />

      {calView === 'week' ? (
        /* ── Week view ── */
        <div className={styles.scrollWrapper}>
          <div className={styles.calHeader}>
            <div className={styles.timeGutter} />
            {days.map((d) => (
              <div
                key={d.iso}
                className={`${styles.dayHeaderCell}
                  ${WEEKEND_DAYS.has(d.label) ? styles.weekend : ''}
                  ${d.iso === todayIso ? styles.todayHeader : ''}`}
              >
                <span className={styles.dayLabel}>{d.label}</span>
                <span className={`${styles.dayNum} ${d.iso === todayIso ? styles.todayNum : ''}`}>
                  {d.date}
                </span>
              </div>
            ))}
          </div>

          <div className={styles.gridRow}>
            <div className={styles.timeAxis}>
              {HOURS.map((h) => (
                <div
                  key={h}
                  className={styles.timeLabel}
                  style={{ '--label-top': `${(h - START_HOUR) * HOUR_PX}px` }}
                >
                  {String(h).padStart(2, '0')}:00
                </div>
              ))}
            </div>

            <div
              className={styles.daysGrid}
              style={{ gridTemplateColumns: `repeat(${days.length}, 140px)` }}
            >
              {days.map((d) => (
                <div
                  key={d.iso}
                  className={`${styles.dayCol} ${WEEKEND_DAYS.has(d.label) ? styles.dayColWeekend : ''}`}
                >
                  {HOURS.map((h) => (
                    <div
                      key={h}
                      className={styles.hourLine}
                      style={{ '--line-top': `${(h - START_HOUR) * HOUR_PX}px` }}
                    />
                  ))}
                  <div className={styles.hourLine} style={{ '--line-top': `${GRID_HEIGHT}px` }} />

                  {(meetingsByDay[d.iso] || []).map((m) => {
                    const top = timeToTopPx(m.startTime)
                    const heightPx = Math.max(durationToPx(m.startTime, m.endTime), 20)
                    const isSelected = m.id === selectedId
                    const hasSummary = !!(summaries[m.id]?.summary)

                    return (
                      <button
                        key={m.id}
                        className={`${styles.event} ${hasSummary ? styles.eventSummarized : ''} ${isSelected ? styles.eventSelected : ''}`}
                        style={{ '--event-top': `${top}px`, '--event-height': `${heightPx}px` }}
                        onClick={() => onSelect(m.id)}
                      >
                        <span className={styles.eventTitle}>{m.title}</span>
                        <span className={styles.eventTime}>{m.startTime} – {m.endTime}</span>
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ── Month view ── */
        <div className={styles.monthWrapper}>
          <div className={styles.monthDayHeaders}>
            {MONTH_DAY_LABELS.map((d) => (
              <div key={d} className={styles.monthDayHeaderLabel}>{d}</div>
            ))}
          </div>
          <div className={styles.monthGrid}>
            {monthCells.map((cell) => {
              const dayMeetings = meetingsByDate[cell.iso] || []
              const isToday = cell.iso === todayIso
              return (
                <div
                  key={cell.iso}
                  className={`${styles.monthCell}
                    ${cell.isCurrentMonth ? '' : styles.monthCellOtherMonth}
                    ${isToday ? styles.monthCellToday : ''}`}
                  onClick={() => handleMonthDayClick(cell.iso)}
                >
                  <span className={`${styles.monthDateNum} ${isToday ? styles.monthDateNumToday : ''}`}>
                    {cell.date}
                  </span>
                  <div className={styles.monthEvents}>
                    {dayMeetings.slice(0, 2).map((m) => (
                      <button
                        key={m.id}
                        className={styles.monthEventChip}
                        onClick={(e) => { e.stopPropagation(); onSelect(m.id) }}
                      >
                        <span className={styles.monthEventTime}>{m.startTime}</span>
                        {m.title}
                      </button>
                    ))}
                    {dayMeetings.length > 2 && (
                      <div className={styles.monthEventMore}>+{dayMeetings.length - 2} more</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
