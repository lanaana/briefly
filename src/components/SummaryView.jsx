import { useState } from 'react'
import { Copy, Check, Edit2, Square, Trash2 } from 'lucide-react'
import styles from './SummaryView.module.css'

function formatGeneratedAt(isoString) {
  const date = new Date(isoString)
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
  return `${dateStr} at ${timeStr}`
}

function buildCopyText(summary) {
  const lines = [
    'CONTEXT',
    summary.context,
    '',
    'MAIN IDEAS',
    ...summary.mainIdeas.map((i) => `• ${i}`),
    '',
    'ACTION POINTS',
    ...summary.actionPoints.map((a) => `☐ ${a}`),
  ]
  return lines.join('\n')
}

export default function SummaryView({ summaryData, onEdit, onDelete }) {
  const [copied, setCopied] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const { summary, generatedAt } = summaryData

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildCopyText(summary))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard not available — fail silently
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.sections}>
        <div className={styles.section}>
          <span className={styles.label}>Context</span>
          <p className={styles.contextText}>{summary.context}</p>
        </div>

        <div className={styles.section}>
          <span className={styles.label}>Main Ideas</span>
          <ul className={styles.list}>
            {summary.mainIdeas.map((idea, i) => (
              <li key={i} className={styles.listItem}>
                <span className={styles.bullet} />
                <span>{idea}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.section}>
          <span className={styles.label}>Action Points</span>
          <ul className={styles.checklist}>
            {summary.actionPoints.map((action, i) => (
              <li key={i} className={styles.checkItem}>
                <Square size={13} className={styles.checkbox} />
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {summary.tags && summary.tags.length > 0 && (
        <div className={styles.tagsRow}>
          {summary.tags.map((tag) => (
            <span key={tag} className={styles.tagPill}>{tag}</span>
          ))}
        </div>
      )}

      <div className={styles.actions}>
        <button className={styles.outlineBtn} onClick={onEdit}>
          <Edit2 size={13} />
          Edit Notes
        </button>
        <button
          className={`${styles.outlineBtn} ${copied ? styles.isCopied : ''}`}
          onClick={handleCopy}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? 'Copied!' : 'Copy Summary'}
        </button>
      </div>

      {generatedAt && (
        <p className={styles.timestamp}>Generated on {formatGeneratedAt(generatedAt)}</p>
      )}

      <div className={styles.deleteArea}>
        {confirmDelete ? (
          <div className={styles.deleteConfirm}>
            <span className={styles.deleteConfirmText}>Delete this summary?</span>
            <button className={styles.deleteConfirmYes} onClick={onDelete}>
              Delete
            </button>
            <button
              className={styles.deleteConfirmNo}
              onClick={() => setConfirmDelete(false)}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button className={styles.deleteBtn} onClick={() => setConfirmDelete(true)}>
            <Trash2 size={12} />
            Delete summary
          </button>
        )}
      </div>
    </div>
  )
}
