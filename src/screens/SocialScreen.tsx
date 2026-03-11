import './SocialScreen.css'

export function SocialScreen() {
  return (
    <div className="social-screen">
      <div className="social-header">
        <h1 className="social-title">Social</h1>
        <p className="social-subtitle">Your dream circle</p>
      </div>
      <div className="social-empty">
        <span className="social-empty-icon">◯</span>
        <p className="social-empty-heading">No friends yet.</p>
        <p className="social-empty-sub">
          Invite friends to share dreams, discover patterns, and see who dreams like you.
        </p>
        <button className="social-invite-btn">Invite a friend</button>
      </div>
    </div>
  )
}
