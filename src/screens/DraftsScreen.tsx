import './DraftsScreen.css'

// Drafts are stored in localStorage under 'dream-journal-drafts'
function getDrafts(): Array<{ id: string; title: string; transcript: string; savedAt: string }> {
  try { return JSON.parse(localStorage.getItem('dream-journal-drafts') ?? '[]') }
  catch { return [] }
}

interface Props { onResumeDraft?: (transcript: string) => void }

export function DraftsScreen({ onResumeDraft }: Props) {
  const drafts = getDrafts()

  function handleDelete(id: string) {
    const updated = drafts.filter(d => d.id !== id)
    localStorage.setItem('dream-journal-drafts', JSON.stringify(updated))
    window.dispatchEvent(new Event('storage'))
  }

  return (
    <div className="drafts-screen">
      <div className="drafts-topbar">
        <h1 className="drafts-title">Drafts</h1>
        <p className="drafts-sub">{drafts.length} unfinished dream{drafts.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="drafts-scroll">
        {drafts.length === 0 ? (
          <div className="drafts-empty">
            <p className="drafts-empty-text">
              Unfinished recordings will appear here. Start recording to capture a dream.
            </p>
          </div>
        ) : (
          drafts.map(draft => (
            <div key={draft.id} className="draft-row">
              <div className="draft-info">
                <span className="draft-title">{draft.title || 'Untitled dream'}</span>
                <span className="draft-date">
                  {new Date(draft.savedAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <div className="draft-actions">
                {onResumeDraft && (
                  <button className="draft-resume-btn" onClick={() => onResumeDraft(draft.transcript)}>
                    Resume
                  </button>
                )}
                <button className="draft-delete-btn" onClick={() => handleDelete(draft.id)}>✕</button>
              </div>
            </div>
          ))
        )}
        <div style={{ height: 80 }} />
      </div>
    </div>
  )
}
