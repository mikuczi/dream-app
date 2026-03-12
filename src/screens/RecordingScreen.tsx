import { useEffect } from 'react'
import './RecordingScreen.css'
import { DreamHalo } from '../components/DreamHalo'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'

interface RecordingScreenProps {
  onDone: (transcript: string) => void
  onCancel: () => void
}

function countWords(text: string): number {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length
}

export function RecordingScreen({ onDone, onCancel }: RecordingScreenProps) {
  const { transcript, interimTranscript, isListening, isSupported, start, stop } =
    useSpeechRecognition()

  useEffect(() => {
    if (isSupported) start()
    return () => { stop() }
  }, [isSupported, start, stop])

  function handleCancel() { stop(); onCancel() }

  function handleDone() {
    stop()
    const finalText = (transcript + (interimTranscript ? ' ' + interimTranscript : '')).trim()
    onDone(finalText)
  }

  const wordCount = countWords(transcript + ' ' + interimTranscript)
  const hasContent = transcript.trim().length > 0 || interimTranscript.trim().length > 0

  return (
    <div className="recording-screen">
      {/* Full-screen halo */}
      <DreamHalo recording={isListening} />

      {/* Cancel */}
      <button className="recording-cancel" onClick={handleCancel} aria-label="Cancel recording">×</button>

      {/* Center content */}
      <div className="recording-center">
        {isSupported && (
          <div className="recording-status">
            {isListening ? (
              <div className="recording-dots">
                <div className="recording-dot" />
                <div className="recording-dot" />
                <div className="recording-dot" />
              </div>
            ) : (
              <div style={{ height: 14 }} />
            )}
            <span className="recording-status-text">
              {isListening ? 'listening…' : 'paused'}
            </span>
          </div>
        )}

        {!isSupported ? (
          <p className="recording-unsupported">
            Voice recognition is not supported in this browser.<br /><br />
            Please try Chrome, Edge, or Safari on iOS.
          </p>
        ) : !hasContent ? (
          <div className="recording-placeholder-wrap">
            <p className="recording-placeholder">Record your dream.</p>
            <p className="recording-cta-hint">Speak now — we're listening</p>
          </div>
        ) : (
          <p className="recording-transcript-text">
            {transcript}
            {interimTranscript && (
              <span className="recording-interim">
                {transcript ? ' ' : ''}{interimTranscript}
              </span>
            )}
          </p>
        )}
      </div>

      {/* Bottom controls */}
      <div className="recording-bottom">
        <span className="recording-word-count">
          {wordCount > 0 ? `${wordCount} word${wordCount === 1 ? '' : 's'}` : ''}
        </span>
        <button
          className="recording-done-btn"
          onClick={handleDone}
          disabled={!hasContent}
        >
          Save Dream
        </button>
      </div>
    </div>
  )
}
