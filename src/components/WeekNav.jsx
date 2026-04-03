import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import styles from './WeekNav.module.css'

export default function WeekNav({
  label,
  showToday,
  loading,
  onPrev,
  onNext,
  onToday,
  showArrows,
  calView,
  onSetView,
}) {
  return (
    <div className={styles.nav}>
      <div className={styles.left}>
        {showArrows && (
          <>
            <button className={styles.arrowBtn} onClick={onPrev} aria-label="Previous">
              <ChevronLeft size={14} />
            </button>
            <button className={styles.arrowBtn} onClick={onNext} aria-label="Next">
              <ChevronRight size={14} />
            </button>
            <span className={styles.label}>{label}</span>
            {loading && <Loader2 size={12} className={styles.spinner} />}
          </>
        )}
      </div>

      <div className={styles.right}>
        {showArrows && showToday && (
          <button className={styles.todayBtn} onClick={onToday}>
            Today
          </button>
        )}

        <div className={styles.toggle}>
          <button
            className={`${styles.toggleBtn} ${calView === 'week' ? styles.toggleActive : ''}`}
            onClick={() => onSetView('week')}
          >
            Week
          </button>
          <button
            className={`${styles.toggleBtn} ${calView === 'month' ? styles.toggleActive : ''}`}
            onClick={() => onSetView('month')}
          >
            Month
          </button>
        </div>
      </div>
    </div>
  )
}
