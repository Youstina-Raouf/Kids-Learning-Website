import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import './Dashboard.css'

const ChildDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalPoints: 0,
    badges: 0,
    streak: 0,
    completedQuests: 0
  })
  const [recentGames, setRecentGames] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [gamesRes, progressRes] = await Promise.all([
        api.get('/games', { params: { ageBand: user?.ageBand } }),
        api.get('/quests')
      ])

      setRecentGames(gamesRes.data.slice(0, 6))
      
      // Calculate stats from progress
      const completed = progressRes.data.filter(q => q.status === 'completed').length
      setStats({
        totalPoints: user?.totalPoints || 0,
        badges: user?.badges?.length || 0,
        streak: user?.currentStreak || 0,
        completedQuests: completed
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const subjects = [
    { id: 'math', name: 'Math', emoji: '🔢', color: '#EF4444' },
    { id: 'physics', name: 'Physics', emoji: '⚡', color: '#3B82F6' },
    { id: 'chemistry', name: 'Chemistry', emoji: '🧪', color: '#10B981' },
    { id: 'language', name: 'Language', emoji: '📚', color: '#F59E0B' },
    { id: 'coding', name: 'Coding', emoji: '💻', color: '#8B5CF6' }
  ]

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="dashboard child-dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Welcome back, {user?.name}! 👋</h1>
          <p>Ready to learn something new today?</p>
        </div>
        <button onClick={logout} className="btn btn-secondary">Logout</button>
      </header>

      <div className="stats-grid">
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <div className="stat-icon">⭐</div>
          <div className="stat-value">{stats.totalPoints}</div>
          <div className="stat-label">Total Points</div>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
          <div className="stat-icon">🏆</div>
          <div className="stat-value">{stats.badges}</div>
          <div className="stat-label">Badges</div>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
          <div className="stat-icon">🔥</div>
          <div className="stat-value">{stats.streak}</div>
          <div className="stat-label">Day Streak</div>
        </div>

        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
          <div className="stat-icon">✅</div>
          <div className="stat-value">{stats.completedQuests}</div>
          <div className="stat-label">Quests Completed</div>
        </div>
      </div>

      <section className="dashboard-section">
        <h2>🎮 Explore by Subject</h2>
        <div className="subjects-grid">
          {subjects.map(subject => (
            <div
              key={subject.id}
              className="subject-card"
              onClick={() => navigate(`/games?subject=${subject.id}`)}
              style={{ borderColor: subject.color }}
            >
              <div className="subject-emoji">{subject.emoji}</div>
              <div className="subject-name">{subject.name}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="dashboard-section">
        <h2>🎯 Recent Games</h2>
        <div className="games-grid">
          {recentGames.map(game => (
            <div
              key={game._id}
              className="game-card"
              onClick={() => navigate(`/games/${game._id}`)}
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
      </section>

      <div className="dashboard-actions">
        <button onClick={() => navigate('/games')} className="btn btn-primary btn-large">
          Browse All Games 🎮
        </button>
        <button onClick={() => navigate('/create')} className="btn btn-secondary btn-large">
          Create Something 🎨
        </button>
        <button onClick={() => navigate('/leaderboard')} className="btn btn-secondary btn-large">
          Leaderboard 🏆
        </button>
      </div>
    </div>
  )
}

export default ChildDashboard

