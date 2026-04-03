import { Users } from 'lucide-react'
import styles from './MeetingItem.module.css'

function highlight(text, query) {
  if (!query) return text
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <mark className={styles.mark}>{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  )
}

export default function MeetingItem({ meeting, isSelected, hasSummary, onClick, searchQuery }) {
  const attendeeCount = meeting.isFullTeam ? meeting.teamSize : meeting.attendees.length
  const q = searchQuery || ''

  return (
    <button
      className={`${styles.item} ${isSelected ? styles.selected : ''}`}
      onClick={onClick}
    >
      <div className={styles.top}>
        <span className={styles.title}>{highlight(meeting.title, q)}</span>
        <span className={`${styles.dot} ${hasSummary ? styles.hasSummary : ''}`} />
      </div>
      <div className={styles.meta}>
        <span className={styles.time}>
          {meeting.day} · {meeting.startTime}
        </span>
        <div className={styles.right}>
          <span className={styles.duration}>{meeting.duration}</span>
          <span className={styles.attendees}>
            <Users size={11} />
            {attendeeCount}
          </span>
        </div>
      </div>
    </button>
  )
}
