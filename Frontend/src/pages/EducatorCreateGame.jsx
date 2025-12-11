import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import './Dashboard.css'

const EducatorCreateGame = () => {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [titleAr, setTitleAr] = useState('')
  const [description, setDescription] = useState('')
  const [descriptionAr, setDescriptionAr] = useState('')
  const [subject, setSubject] = useState('math')
  const [ageBand, setAgeBand] = useState('')
  const [thumbnail, setThumbnail] = useState('🎮')
  const [difficulty, setDifficulty] = useState('easy')
  const [estimatedTime, setEstimatedTime] = useState(10)
  const [pointsReward, setPointsReward] = useState(10)
  const [submitting, setSubmitting] = useState(false)

  const subjects = [
    { id: 'math', name: 'Math' },
    { id: 'physics', name: 'Physics' },
    { id: 'chemistry', name: 'Chemistry' },
    { id: 'language', name: 'Language' },
    { id: 'coding', name: 'Coding' },
    { id: 'general', name: 'General' }
  ]

  const ageBands = [
    { id: '3-5', label: '3-5 years' },
    { id: '6-8', label: '6-8 years' },
    { id: '9-12', label: '9-12 years' }
  ]

  const difficulties = [
    { id: 'easy', label: 'Easy' },
    { id: 'medium', label: 'Medium' },
    { id: 'hard', label: 'Hard' }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!title.trim() || !titleAr.trim() || !description.trim() || !descriptionAr.trim()) {
      alert('Please fill in all text fields')
      return
    }

    if (!ageBand) {
      alert('Please select an age band')
      return
    }

    setSubmitting(true)
    try {
      await api.post('/games', {
        title,
        titleAr,
        description,
        descriptionAr,
        subject,
        ageBand: [ageBand],
        thumbnail,
        difficulty,
        estimatedTime,
        pointsReward
      })
      alert('Game created successfully!')
      navigate('/educator')
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating game')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Create New Game 🎮</h1>
          <p>Add a learning game for your students</p>
        </div>
        <button onClick={() => navigate('/educator')} className="btn btn-secondary">
          Back to Dashboard
        </button>
      </header>

      <section className="dashboard-section">
        <form className="monitoring-card" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title (English)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Title (Arabic)</label>
            <input
              type="text"
              value={titleAr}
              onChange={(e) => setTitleAr(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Description (English)</label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Description (Arabic)</label>
            <textarea
              rows="3"
              value={descriptionAr}
              onChange={(e) => setDescriptionAr(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Subject</label>
            <select value={subject} onChange={(e) => setSubject(e.target.value)}>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Age Band</label>
            <select value={ageBand} onChange={(e) => setAgeBand(e.target.value)}>
              <option value="">Select age band</option>
              {ageBands.map(band => (
                <option key={band.id} value={band.id}>{band.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Thumbnail (emoji or short text)</label>
            <input
              type="text"
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Difficulty</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                {difficulties.map(d => (
                  <option key={d.id} value={d.id}>{d.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Estimated Time (minutes)</label>
              <input
                type="number"
                min="1"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label>Points Reward</label>
              <input
                type="number"
                min="1"
                value={pointsReward}
                onChange={(e) => setPointsReward(Number(e.target.value))}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Game'}
          </button>
        </form>
      </section>
    </div>
  )
}

export default EducatorCreateGame
