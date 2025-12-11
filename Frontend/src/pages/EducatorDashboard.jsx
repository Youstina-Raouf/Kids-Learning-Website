import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import './Dashboard.css'

const EducatorDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [children, setChildren] = useState([])
  const [loading, setLoading] = useState(true)
  const [games, setGames] = useState([])

  const subjectGameUrls = {
    math: 'https://www.mathplayground.com/math-games.html',
    language: 'https://www.english-room.com/games/',
    coding: 'https://www.tynker.com/',
    physics: 'https://basket-random.net/',
    chemistry: 'https://interactivechemistry.org/',
    general: 'https://www.helpfulgames.com/subjects/'
  }

  useEffect(() => {
    fetchChildren()
    fetchGames()
  }, [])

  const fetchChildren = async () => {
    try {
      const res = await api.get('/children')
      setChildren(res.data)
    } catch (error) {
      console.error('Error fetching children:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGameClick = (game) => {
    const url = subjectGameUrls[game.subject] || subjectGameUrls.general
    window.open(url, '_blank')
  }

  const fetchGames = async () => {
    try {
      const res = await api.get('/games/mine')
      setGames(res.data)
    } catch (error) {
      console.error('Error fetching games:', error)
    }
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Educator Dashboard 👨‍🏫</h1>
          <p>Monitor and guide your students' learning</p>
        </div>
        <button onClick={logout} className="btn btn-secondary">Logout</button>
      </header>

      <section className="dashboard-section">
        <h2>Your Students</h2>
        {children.length === 0 ? (
          <div className="monitoring-card">
            <p>No students assigned yet.</p>
          </div>
        ) : (
          <div className="children-list">
            {children.map(child => (
              <div
                key={child._id}
                className="child-card"
                onClick={() => navigate(`/monitoring/${child._id}`)}
              >
                <div className="child-card-header">
                  <div className="child-avatar">
                    {child.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="child-name">{child.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Age: {child.age} ({child.ageBand})
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Child Code: {child.childCode} | ID: {child._id}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Parent: {child.parentId?.name || 'N/A'} ({child.parentId?.email || 'N/A'})
                    </div>
                  </div>
                </div>
                <div className="child-stats">
                  <div className="child-stat">
                    <div className="child-stat-value">{child.totalPoints || 0}</div>
                    <div className="child-stat-label">Points</div>
                  </div>
                  <div className="child-stat">
                    <div className="child-stat-value">{child.badges?.length || 0}</div>
                    <div className="child-stat-label">Badges</div>
                  </div>
                  <div className="child-stat">
                    <div className="child-stat-value">{child.currentStreak || 0}</div>
                    <div className="child-stat-label">Streak</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="dashboard-section">
        <h2>Your Games</h2>
        {games.length === 0 ? (
          <div className="monitoring-card">
            <p>No games created yet.</p>
          </div>
        ) : (
          <div className="games-grid">
            {games.map(game => (
              <div
                key={game._id}
                className="game-card"
                onClick={() => handleGameClick(game)}
              >
                <div className="game-thumbnail">{game.thumbnail || '🎮'}</div>
                <div className="game-info">
                  <h3>{game.title}</h3>
                  <p>{game.description}</p>
                  <div className="game-meta">
                    <span className="badge badge-primary">{game.subject}</span>
                    <span className="badge">{game.pointsReward} points</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="dashboard-section">
        <h2>Quick Actions</h2>
        <div className="dashboard-actions">
          <button onClick={() => navigate('/educator/games/new')} className="btn btn-primary">
            Create New Game
          </button>
          <button onClick={() => navigate('/leaderboard')} className="btn btn-primary">
            View Leaderboard
          </button>
        </div>
      </section>
    </div>
  )
}

export default EducatorDashboard

