import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import './Monitoring.css'

const Monitoring = () => {
  const { childId } = useParams()
  const navigate = useNavigate()
  const { role } = useAuth()
  const [dashboardData, setDashboardData] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
    fetchAlerts()
  }, [childId])

  const fetchDashboardData = async () => {
    try {
      const res = await api.get(`/monitoring/dashboard/${childId}`)
      setDashboardData(res.data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAlerts = async () => {
    try {
      const res = await api.get(`/monitoring/alerts/${childId}`)
      setAlerts(res.data)
    } catch (error) {
      console.error('Error fetching alerts:', error)
    }
  }

  const resolveAlert = async (alertId) => {
    try {
      await api.put(`/monitoring/alerts/${alertId}/resolve`)
      fetchAlerts()
    } catch (error) {
      console.error('Error resolving alert:', error)
    }
  }

  const prepareChartData = () => {
    if (!dashboardData?.breakdown?.daily) return []
    return Object.entries(dashboardData.breakdown.daily).map(([date, seconds]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      minutes: Math.floor(seconds / 60)
    }))
  }

  const prepareSubjectData = () => {
    if (!dashboardData?.breakdown?.bySubject) return []
    return Object.entries(dashboardData.breakdown.bySubject).map(([subject, seconds]) => ({
      subject: subject.charAt(0).toUpperCase() + subject.slice(1),
      minutes: Math.floor(seconds / 60)
    }))
  }

  if (loading) {
    return (
      <div className="monitoring-loading">
        <div className="spinner"></div>
      </div>
    )
  }

  if (!dashboardData) {
    return <div>No data available</div>
  }

  return (
    <div className="monitoring-page">
      <header className="monitoring-header">
        <button onClick={() => navigate(role === 'parent' ? '/parent' : '/educator')} className="btn btn-secondary">
          ← Back
        </button>
        <h1>📊 Monitoring Dashboard</h1>
        <p>Child: {dashboardData.child.name}</p>
      </header>

      <div className="monitoring-stats">
        <div className="stat-box">
          <div className="stat-label">Total Time (7 days)</div>
          <div className="stat-value">{dashboardData.statistics.totalTime} min</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Today's Time</div>
          <div className="stat-value">{dashboardData.statistics.todayTime} min</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Sessions</div>
          <div className="stat-value">{dashboardData.statistics.sessionCount}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Avg Session</div>
          <div className="stat-value">{dashboardData.statistics.averageSessionTime} min</div>
        </div>
      </div>

      <div className="monitoring-charts">
        <div className="chart-card">
          <h3>Daily Time Usage</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={prepareChartData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="minutes" stroke="#667eea" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Time by Subject</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={prepareSubjectData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subject" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="minutes" fill="#764ba2" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="alerts-section">
        <h2>⚠️ Alerts & Safety</h2>
        {alerts.length === 0 ? (
          <div className="no-alerts">
            <p>No alerts. Everything looks good! ✅</p>
          </div>
        ) : (
          <div className="alerts-list">
            {alerts.map(alert => (
              <div key={alert._id} className={`alert-card ${alert.severity}`}>
                <div className="alert-header">
                  <span className="alert-type">{alert.type.replace('_', ' ')}</span>
                  <span className={`alert-severity ${alert.severity}`}>{alert.severity}</span>
                  {alert.status === 'active' && (
                    <button
                      onClick={() => resolveAlert(alert._id)}
                      className="btn btn-small"
                    >
                      Resolve
                    </button>
                  )}
                </div>
                <div className="alert-message">{alert.message}</div>
                <div className="alert-guidance">{alert.guidanceText}</div>
                <div className="alert-time">
                  {new Date(alert.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="recent-sessions">
        <h2>Recent Sessions</h2>
        <div className="sessions-list">
          {dashboardData.recentSessions.map(session => (
            <div key={session._id} className="session-card">
              <div className="session-info">
                <div className="session-type">{session.contentType}</div>
                <div className="session-time">
                  {new Date(session.startTime).toLocaleString()}
                </div>
              </div>
              <div className="session-duration">
                {Math.floor(session.duration / 60)} min
              </div>
              {session.pointsEarned > 0 && (
                <div className="session-points">
                  +{session.pointsEarned} ⭐
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Monitoring

