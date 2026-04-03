import { FileText } from 'lucide-react'
import styles from './EmptyState.module.css'

export default function EmptyState({ onAdd }) {
  return (
    <div className={styles.container}>
      <div className={styles.iconWrap}>
        <FileText size={28} />
      </div>
      <h3 className={styles.title}>No summary yet</h3>
      <p className={styles.description}>
        Add your raw notes and let AI transform them into a clean, structured summary.
      </p>
      <button className={styles.button} onClick={onAdd}>
        Add Summary
      </button>
    </div>
  )
}
