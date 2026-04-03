import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar.jsx'
import WeekCalendar from './components/WeekCalendar.jsx'
import DetailPanel from './components/DetailPanel.jsx'
import { useGoogleCalendar } from './hooks/useGoogleCalendar.js'
import { INITIAL_SUMMARIES } from './data/meetings.js'
import styles from './App.module.css'

const STORAGE_KEY = 'briefly_summaries'

function loadSummaries() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return { ...INITIAL_SUMMARIES, ...JSON.parse(stored) }
  } catch {
    // ignore
  }
  return { ...INITIAL_SUMMARIES }
}

export default function App() {
  const [selectedId, setSelectedId] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [summaries, setSummaries] = useState(loadSummaries)
  const [mobileView, setMobileView] = useState('list')

  const {
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
  } = useGoogleCalendar()

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(summaries))
    } catch {
      // ignore
    }
  }, [summaries])

  const handleSelect = (id) => {
    setSelectedId(id)
    setDetailOpen(true)
    setMobileView('detail')
  }

  const handleClose = () => {
    setDetailOpen(false)
    setMobileView('list')
  }

  const handleSave = (data) => {
    setSummaries((prev) => ({ ...prev, [selectedId]: data }))
  }

  const selectedMeeting = meetings.find((m) => m.id === selectedId)

  return (
    <div className={styles.app}>
      <div className={`${styles.sidebar} ${mobileView === 'detail' ? styles.sidebarHidden : ''}`}>
        <Sidebar
          meetings={meetings}
          selectedId={selectedId}
          summaries={summaries}
          weekDays={weekDays}
          weekLabel={weekLabel}
          isConnected={isConnected}
          userInfo={userInfo}
          error={error}
          loading={loading}
          onSelect={handleSelect}
          onConnect={connect}
          onDisconnect={disconnect}
        />
      </div>

      <div className={styles.divider} />

      <div className={styles.center}>
        <WeekCalendar
          meetings={meetings}
          summaries={summaries}
          selectedId={selectedId}
          onSelect={handleSelect}
          days={weekDays}
          isConnected={isConnected}
          weekLabel={weekLabel}
          weekOffset={weekOffset}
          loading={loading}
          onPrev={() => navigateWeek(-1)}
          onNext={() => navigateWeek(1)}
          onToday={goToToday}
          onNavigateTo={navigateWeek}
          onLoadRange={loadRange}
        />
      </div>

      <div className={`${styles.rightWrapper} ${detailOpen ? styles.rightWrapperOpen : ''} ${mobileView === 'detail' ? styles.rightWrapperMobile : ''}`}>
        <div className={styles.rightDivider} />
        {selectedMeeting && (
          <DetailPanel
            key={selectedId}
            meeting={selectedMeeting}
            summaryData={summaries[selectedId]}
            onSave={handleSave}
            onClose={handleClose}
          />
        )}
      </div>
    </div>
  )
}
