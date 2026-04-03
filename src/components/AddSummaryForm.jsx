import { useState, useRef, useEffect } from 'react'
import { Loader2, AlertCircle, Mic, Check } from 'lucide-react'
import { generateSummary } from '../api/claude.js'
import styles from './AddSummaryForm.module.css'

const SpeechRecognition =
  typeof window !== 'undefined' &&
  (window.SpeechRecognition || window.webkitSpeechRecognition)

export default function AddSummaryForm({ initialNotes, onSaved, onCancel }) {
  const [notes, setNotes] = useState(initialNotes || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [interimTranscript, setInterimTranscript] = useState('')
  const [micError, setMicError] = useState(null)
  const [transcribed, setTranscribed] = useState(false)
  const recognitionRef = useRef(null)
  // Ref tracks the latest interim text so onend (a stale closure) can access it
  const interimRef = useRef('')
  const transcribedTimerRef = useRef(null)

  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop()
      if (transcribedTimerRef.current) clearTimeout(transcribedTimerRef.current)
    }
  }, [])

  const startRecording = () => {
    if (!SpeechRecognition) return
    setMicError(null)
    setTranscribed(false)

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1]
      const transcript = result[0].transcript
      if (result.isFinal) {
        setNotes((prev) => {
          const trimmed = prev.trimEnd()
          return trimmed ? trimmed + ' ' + transcript : transcript
        })
        interimRef.current = ''
        setInterimTranscript('')
      } else {
        interimRef.current = transcript
        setInterimTranscript(transcript)
      }
    }

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed') {
        setMicError('Microphone access denied. Please allow mic access and try again.')
      } else if (event.error !== 'aborted') {
        setMicError('Microphone error. Please try again.')
      }
      interimRef.current = ''
      setIsRecording(false)
      setInterimTranscript('')
    }

    recognition.onend = () => {
      // Commit any interim text the browser didn't finalize (stale closure safe via ref)
      const pending = interimRef.current.trim()
      if (pending) {
        setNotes((prev) => {
          const trimmed = prev.trimEnd()
          return trimmed ? trimmed + ' ' + pending : pending
        })
      }
      interimRef.current = ''
      setInterimTranscript('')
      setIsRecording(false)
      // Show brief "Transcribed ✓" confirmation
      setTranscribed(true)
      transcribedTimerRef.current = setTimeout(() => setTranscribed(false), 1800)
    }

    try {
      recognition.start()
      recognitionRef.current = recognition
      setIsRecording(true)
    } catch {
      setMicError('Could not start microphone. Please try again.')
    }
  }

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    // onend fires automatically and handles committing text + updating state
  }

  const handleGenerate = async () => {
    if (!notes.trim()) return
    setLoading(true)
    setError(null)
    try {
      const summary = await generateSummary(notes.trim())
      onSaved({
        summary,
        rawNotes: notes.trim(),
        generatedAt: new Date().toISOString(),
      })
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const displayValue = isRecording && interimTranscript
    ? notes + (notes.trimEnd() ? ' ' : '') + interimTranscript
    : notes

  return (
    <div className={styles.container}>
      <div className={styles.labelRow}>
        <label className={styles.label} htmlFor="notes-input">
          Paste your raw notes or thoughts
        </label>
        {SpeechRecognition && (
          <button
            type="button"
            className={`${styles.micBtn} ${isRecording ? styles.micBtnRecording : ''} ${transcribed ? styles.micBtnTranscribed : ''}`}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={loading}
            aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
          >
            {transcribed ? <Check size={14} /> : <Mic size={14} />}
          </button>
        )}
        {transcribed && <span className={styles.transcribedLabel}>Transcribed ✓</span>}
      </div>

      <div className={`${styles.textareaWrap} ${isRecording ? styles.textareaWrapRecording : ''}`}>
        <textarea
          id="notes-input"
          className={styles.textarea}
          value={displayValue}
          onChange={(e) => !isRecording && setNotes(e.target.value)}
          placeholder="e.g. We discussed the Q2 roadmap, John mentioned delays in feature X, we agreed to push the deadline to May 15..."
          disabled={loading}
          readOnly={isRecording}
          rows={7}
        />
        {isRecording && interimTranscript && (
          <div className={styles.interimOverlay}>
            <span className={styles.interimDot} />
            <span className={styles.interimText}>{interimTranscript}</span>
          </div>
        )}
      </div>

      {isRecording && (
        <p className={styles.recordingHint}>Listening… speak your notes. Recording stops automatically when you pause.</p>
      )}

      {micError && (
        <p className={styles.micErrorText}>{micError}</p>
      )}

      {error && (
        <div className={styles.errorBox}>
          <AlertCircle size={14} />
          <span>{error}</span>
          <button className={styles.retryBtn} onClick={handleGenerate}>
            Retry
          </button>
        </div>
      )}

      <button
        className={`${styles.generateBtn} ${loading ? styles.isLoading : ''}`}
        onClick={handleGenerate}
        disabled={loading || isRecording || !notes.trim()}
      >
        {loading ? (
          <>
            <Loader2 size={15} className={styles.spinner} />
            Generating summary…
          </>
        ) : isRecording ? (
          'Save Note'
        ) : (
          'Generate Summary'
        )}
      </button>

      <button
        className={styles.cancelBtn}
        onClick={onCancel}
        disabled={loading}
      >
        Cancel
      </button>
    </div>
  )
}
