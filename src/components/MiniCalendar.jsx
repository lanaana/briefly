import styles from './MiniCalendar.module.css'

const DAY_HEADERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

function buildMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // Adjust so Mon=0, Sun=6
  let startDow = firstDay.getDay() - 1
  if (startDow < 0) startDow = 6

  const cells = [
    ...Array(startDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const weeks = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}

export default function MiniCalendar({ weekDays }) {
  // Determine month from first weekday; fall back to Apr 2025
  const refDate = weekDays?.length
    ? new Date(weekDays[0].iso + 'T00:00:00')
    : new Date(2025, 3, 14)

  const year = refDate.getFullYear()
  const month = refDate.getMonth()
  const weeks = buildMonthGrid(year, month)

  const activeIsos = new Set(
    weekDays?.map((d) => d.iso) ?? [
      '2025-04-14', '2025-04-15', '2025-04-16', '2025-04-17', '2025-04-18',
    ]
  )

  const monthLabel = refDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  function toIso(day) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  function isActive(day) {
    return day !== null && activeIsos.has(toIso(day))
  }

  function isWeekend(colIndex) {
    return colIndex === 5 || colIndex === 6
  }

  return (
    <div className={styles.calendar}>
      <div className={styles.monthLabel}>{monthLabel}</div>

      <div className={styles.grid}>
        {DAY_HEADERS.map((d, i) => (
          <div key={i} className={styles.dayHeader}>
            {d}
          </div>
        ))}

        {weeks.map((week, wi) => {
          const hasActive = week.some((d) => isActive(d))
          return week.map((day, di) => (
            <div
              key={`${wi}-${di}`}
              className={[
                styles.day,
                day === null ? styles.empty : '',
                day !== null && isActive(day) ? styles.activeDay : '',
                day !== null && !isActive(day) && isWeekend(di) ? styles.weekend : '',
                hasActive ? styles.weekRow : '',
                hasActive && di === 0 ? styles.weekRowStart : '',
                hasActive && di === 6 ? styles.weekRowEnd : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {day}
            </div>
          ))
        })}
      </div>
    </div>
  )
}
