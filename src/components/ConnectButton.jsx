import styles from './ConnectButton.module.css'

export default function ConnectButton({
  isConnected,
  userInfo,
  error,
  loading,
  onConnect,
  onDisconnect,
}) {
  if (isConnected) {
    const name = userInfo?.name || userInfo?.email || 'Google Calendar'
    return (
      <div className={styles.connectedRow} title={`Syncing events for ${name}`}>
        <span className={styles.greenDot} />
        <span className={styles.connectedLabel}>Google Calendar</span>
        <button className={styles.disconnectLink} onClick={onDisconnect}>
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <button
        className={styles.connectBtn}
        onClick={onConnect}
        disabled={loading}
      >
        <span className={styles.greyDot} />
        Connect Google Calendar
      </button>
      {error === 'token_expired' && (
        <button className={styles.reconnectBtn} onClick={onConnect}>
          Session expired — Reconnect
        </button>
      )}
      {error && error !== 'token_expired' && (
        <p className={styles.errorText}>{error}</p>
      )}
    </div>
  )
}
