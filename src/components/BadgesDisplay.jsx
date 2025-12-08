import { useBadges } from '../context/BadgesContext'
import './BadgesDisplay.css'

const BadgesDisplay = ({ compact = false }) => {
  const { badges, achievements, getTotalBadges, getTotalAchievements } = useBadges()

  if (compact) {
    return (
      <div className="badges-display-compact">
        {getTotalBadges() > 0 && (
          <div className="badge-count">
            <span className="badge-icon">🏆</span>
            <span>{getTotalBadges()}</span>
          </div>
        )}
        {getTotalAchievements() > 0 && (
          <div className="achievement-count">
            <span className="achievement-icon">⭐</span>
            <span>{getTotalAchievements()}</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="badges-display">
      {badges.length > 0 && (
        <div className="badges-section">
          <h3>Badges ({badges.length})</h3>
          <div className="badges-grid">
            {badges.map(badge => (
              <div key={badge.id} className="badge-item" title={badge.description}>
                <div className="badge-icon-large">{badge.icon}</div>
                <div className="badge-name">{badge.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {achievements.length > 0 && (
        <div className="achievements-section">
          <h3>Achievements ({achievements.length})</h3>
          <div className="achievements-grid">
            {achievements.map(achievement => (
              <div key={achievement.id} className="achievement-item" title={achievement.description}>
                <div className="achievement-icon-large">{achievement.icon}</div>
                <div className="achievement-name">{achievement.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {badges.length === 0 && achievements.length === 0 && (
        <div className="badges-empty">
          <p>Aucun badge ou achievement pour le moment</p>
          <span>Continuez à contribuer pour débloquer des badges !</span>
        </div>
      )}
    </div>
  )
}

export default BadgesDisplay

