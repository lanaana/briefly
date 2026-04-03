import { useState } from 'react'
import { Search, X } from 'lucide-react'
import MiniCalendar from './MiniCalendar.jsx'
import MeetingItem from './MeetingItem.jsx'
import ConnectButton from './ConnectButton.jsx'
import styles from './Sidebar.module.css'

export default function Sidebar({
  meetings,
  selectedId,
  summaries,
  weekDays,
  weekLabel,
  isConnected,
  userInfo,
  error,
  loading,
  onSelect,
  onConnect,
  onDisconnect,
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const q = searchQuery.trim().toLowerCase()

  const filteredMeetings = q
    ? meetings.filter((m) => {
        if (m.title.toLowerCase().includes(q)) return true
        if ((m.attendees || []).some((a) => a.toLowerCase().includes(q))) return true
        const sd = summaries[m.id]?.summary
        if (sd) {
          if (sd.context?.toLowerCase().includes(q)) return true
          if (sd.mainIdeas?.some((i) => i.toLowerCase().includes(q))) return true
          if (sd.actionPoints?.some((a) => a.toLowerCase().includes(q))) return true
        }
        return false
      })
    : meetings

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <div className={styles.logoRow}>
          <span className={styles.appName}>Briefly</span>
        </div>
        <ConnectButton
          isConnected={isConnected}
          userInfo={userInfo}
          error={error}
          loading={loading}
          onConnect={onConnect}
          onDisconnect={onDisconnect}
        />
      </div>

      <div className={styles.searchRow}>
        <Search size={12} className={styles.searchIcon} />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search events…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button className={styles.clearBtn} onClick={() => setSearchQuery('')} aria-label="Clear search">
            <X size={11} />
          </button>
        )}
      </div>

      <MiniCalendar weekDays={weekDays} />

      <div className={styles.sectionHeader}>
        <span className={styles.sectionLabel}>This Week</span>
        <span className={styles.dateRange}>{weekLabel}</span>
      </div>

      <div className={styles.list}>
        {filteredMeetings.length === 0 ? (
          <p className={styles.emptyList}>
            {q ? 'No matching events' : 'No events this week'}
          </p>
        ) : (
          filteredMeetings.map((meeting) => (
            <MeetingItem
              key={meeting.id}
              meeting={meeting}
              isSelected={meeting.id === selectedId}
              hasSummary={!!(summaries[meeting.id]?.summary)}
              onClick={() => onSelect(meeting.id)}
              searchQuery={searchQuery.trim()}
            />
          ))
        )}
      </div>
    </div>
  )
}
