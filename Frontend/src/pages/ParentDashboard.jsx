import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import './Dashboard.css'

const ParentDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [children, setChildren] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchChildren()
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
          <h1>Parent Dashboard 👨‍👩‍👧‍👦</h1>
          <p>Monitor and manage your children's learning</p>
        </div>
        <button onClick={logout} className="btn btn-secondary">Logout</button>
      </header>

      <section className="dashboard-section">
        <h2>Your Children</h2>
        {children.length === 0 ? (
          <div className="monitoring-card">
            <p>No children profiles yet. Add a child to get started!</p>
            <button onClick={() => navigate('/parent/add-child')} className="btn btn-primary" style={{ marginTop: '16px' }}>
              Add Child Profile
            </button>
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
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Child ID: <strong>{child.childCode}</strong>
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
        <h2>Quick Actions</h2>
        <div className="dashboard-actions">
          <button onClick={() => navigate('/parent/add-child')} className="btn btn-primary">
            Add Child Profile
          </button>
          <button onClick={() => navigate('/leaderboard')} className="btn btn-secondary">
            View Leaderboard
          </button>
        </div>
      </section>
    </div>
  )
}

export default ParentDashboard

