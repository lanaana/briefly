import { useState } from 'react'
import { ArrowLeft, Calendar, Clock, X } from 'lucide-react'
import Avatar from './Avatar.jsx'
import EmptyState from './EmptyState.jsx'
import AddSummaryForm from './AddSummaryForm.jsx'
import SummaryView from './SummaryView.jsx'
import styles from './DetailPanel.module.css'

function formatDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export default function DetailPanel({ meeting, summaryData, onSave, onClose }) {
  const [mode, setMode] = useState('view')
  const [editNotes, setEditNotes] = useState('')
  const hasSummary = !!(summaryData?.summary)

  const handleAddClick = () => {
    setEditNotes(summaryData?.rawNotes || '')
    setMode('add')
  }

  const handleSaved = (data) => {
    onSave(data)
    setMode('view')
  }

  const handleDelete = () => {
    onSave({ rawNotes: summaryData?.rawNotes || '' })
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <button className={styles.backBtn} onClick={onClose} aria-label="Back to meetings">
            <ArrowLeft size={14} />
            Meetings
          </button>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close panel">
            <X size={15} />
          </button>
        </div>

        <h1 className={styles.title}>{meeting.title}</h1>

        <div className={styles.metaRow}>
          <span className={styles.metaItem}>
            <Calendar size={12} />
            {formatDate(meeting.date)}
          </span>
          <span className={styles.metaDot}>·</span>
          <span className={styles.metaItem}>
            <Clock size={12} />
            {meeting.startTime} – {meeting.endTime}
          </span>
          <span className={styles.metaDot}>·</span>
          <span className={styles.metaItem}>{meeting.duration}</span>
        </div>

        <div className={styles.attendeesRow}>
          {meeting.isFullTeam ? (
            <div className={styles.fullTeamBadge}>
              Full team · {meeting.teamSize} people
            </div>
          ) : (
            <>
              <div className={styles.avatarStack}>
                {meeting.attendees.slice(0, 4).map((name) => (
                  <Avatar key={name} name={name} />
                ))}
                {meeting.attendees.length > 4 && (
                  <div className={styles.moreAvatar}>+{meeting.attendees.length - 4}</div>
                )}
              </div>
              <span className={styles.attendeeNames}>
                {meeting.attendees.join(', ')}
              </span>
            </>
          )}
        </div>
      </div>

      <div className={styles.body}>
        {mode === 'add' ? (
          <AddSummaryForm
            initialNotes={editNotes}
            onSaved={handleSaved}
            onCancel={() => setMode('view')}
          />
        ) : hasSummary ? (
          <SummaryView summaryData={summaryData} onEdit={handleAddClick} onDelete={handleDelete} />
        ) : (
          <EmptyState onAdd={handleAddClick} />
        )}
      </div>
    </div>
  )
}
