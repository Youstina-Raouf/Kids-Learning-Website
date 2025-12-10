import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import './Leaderboard.css'

const Leaderboard = () => {
  const { user, role } = useAuth()
  const navigate = useNavigate()
  const [leaderboard, setLeaderboard] = useState([])
  const [type, setType] = useState('points')
  const [cohort, setCohort] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [type, cohort])

  const fetchLeaderboard = async () => {
    try {
      const url = type === 'points' || type === 'streak' || type === 'badges'
        ? `/leaderboard?type=${type}&cohort=${cohort}`
        : `/leaderboard/subject/${type}?cohort=${cohort}`
      
      const res = await api.get(url)
      setLeaderboard(res.data)
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankEmoji = (rank) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  if (loading) {
    return (
      <div className="leaderboard-loading">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="leaderboard-page">
      <header className="leaderboard-header">
        <button onClick={() => navigate(role === 'child' ? '/child' : '/parent')} className="btn btn-secondary">
          ← Back
        </button>
        <h1>🏆 Leaderboard</h1>
        <p>See who's leading the way!</p>
      </header>

      <div className="leaderboard-controls">
        <div className="type-selector">
          <button
            className={`type-btn ${type === 'points' ? 'active' : ''}`}
            onClick={() => setType('points')}
          >
            ⭐ Points
          </button>
          <button
            className={`type-btn ${type === 'streak' ? 'active' : ''}`}
            onClick={() => setType('streak')}
          >
            🔥 Streak
          </button>
          <button
            className={`type-btn ${type === 'badges' ? 'active' : ''}`}
            onClick={() => setType('badges')}
          >
            🏆 Badges
          </button>
        </div>

        {(role === 'parent' || role === 'educator') && (
          <div className="cohort-selector">
            <select value={cohort} onChange={(e) => setCohort(e.target.value)} className="input">
              <option value="all">All Users</option>
              {role === 'parent' && <option value="family">Family</option>}
              {role === 'educator' && <option value="class">Class</option>}
            </select>
          </div>
        )}
      </div>

      <div className="leaderboard-list">
        {leaderboard.length === 0 ? (
          <div className="no-leaderboard">
            <p>No entries yet. Be the first!</p>
          </div>
        ) : (
          leaderboard.map((entry, index) => (
            <div
              key={entry.childId}
              className={`leaderboard-entry ${entry.childId === user?._id ? 'current-user' : ''}`}
            >
              <div className="entry-rank">
                <span className="rank-number">{getRankEmoji(entry.rank)}</span>
              </div>
              <div className="entry-avatar">
                {entry.avatar || entry.name.charAt(0).toUpperCase()}
              </div>
              <div className="entry-info">
                <div className="entry-name">{entry.name}</div>
                <div className="entry-meta">
                  {type === 'points' && <span>{entry.points} points</span>}
                  {type === 'streak' && <span>{entry.streak} day streak</span>}
                  {type === 'badges' && <span>{entry.badges} badges</span>}
                  <span className="age-band">{entry.ageBand}</span>
                </div>
              </div>
              {entry.childId === user?._id && (
                <span className="you-badge">You!</span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Leaderboard

