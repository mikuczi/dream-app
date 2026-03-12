import './BookmarksScreen.css'
import type { Dream } from '../types/dream'

interface Props { dreams: Dream[]; onOpenDream: (d: Dream) => void }

export function BookmarksScreen({ dreams, onOpenDream }: Props) {
  const bookmarked = dreams.filter(d => d.bookmarked)

  return (
    <div className="bm-screen">
      <div className="bm-topbar">
        <h1 className="bm-title">Bookmarks</h1>
        <p className="bm-sub">{bookmarked.length} saved dream{bookmarked.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="bm-scroll">
        {bookmarked.length === 0 ? (
          <div className="bm-empty">
            <p className="bm-empty-icon">◇</p>
            <p className="bm-empty-text">
              Bookmark a dream from its detail page to save it here.
            </p>
          </div>
        ) : (
          bookmarked.map(d => (
            <button key={d.id} className="bm-row" onClick={() => onOpenDream(d)}>
              <div className="bm-row-left">
                <span className="bm-row-title">{d.title}</span>
                <span className="bm-row-meta">
                  {new Date(d.createdAt).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })}
                  {d.mood && <> · {d.mood}</>}
                </span>
              </div>
              <span className="bm-bookmark-icon">◆</span>
            </button>
          ))
        )}
        <div style={{ height: 80 }} />
      </div>
    </div>
  )
}
