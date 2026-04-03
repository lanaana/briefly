import styles from './Avatar.module.css'

function getInitials(name) {
  const clean = name.replace(/\(.*\)/, '').trim()
  const parts = clean.split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function getColorIndex(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0
  }
  return Math.abs(hash) % 8
}

export default function Avatar({ name }) {
  const initials = getInitials(name)
  const colorClass = `color${getColorIndex(name)}`

  return (
    <div className={`${styles.avatar} ${styles[colorClass]}`} title={name}>
      {initials}
    </div>
  )
}
