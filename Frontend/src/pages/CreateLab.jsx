import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import './CreateLab.css'

const CreateLab = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [type, setType] = useState('story')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [subject, setSubject] = useState('general')
  const [submitting, setSubmitting] = useState(false)

  const artifactTypes = [
    { id: 'story', name: 'Story', emoji: '📖' },
    { id: 'code', name: 'Code', emoji: '💻' },
    { id: 'drawing', name: 'Drawing', emoji: '🎨' }
  ]

  const subjects = [
    { id: 'math', name: 'Math' },
    { id: 'physics', name: 'Physics' },
    { id: 'chemistry', name: 'Chemistry' },
    { id: 'language', name: 'Language' },
    { id: 'coding', name: 'Coding' },
    { id: 'general', name: 'General' }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      alert('Please fill in all fields')
      return
    }

    setSubmitting(true)
    try {
      await api.post('/artifacts', {
        type,
        title,
        content,
        subject
      })
      alert('Your creation has been submitted! A parent or teacher will review it soon.')
      navigate('/child')
    } catch (error) {
      alert(error.response?.data?.message || 'Error submitting your creation')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="create-lab">
      <header className="create-header">
        <button onClick={() => navigate('/child')} className="btn btn-secondary">
          ← Back to Dashboard
        </button>
        <h1>🎨 Create Lab</h1>
        <p>Show what you've learned by creating something!</p>
      </header>

      <form onSubmit={handleSubmit} className="create-form">
        <div className="form-section">
          <label>What would you like to create?</label>
          <div className="type-selector">
            {artifactTypes.map(artifactType => (
              <button
                key={artifactType.id}
                type="button"
                className={`type-option ${type === artifactType.id ? 'active' : ''}`}
                onClick={() => setType(artifactType.id)}
              >
                <span className="type-emoji">{artifactType.emoji}</span>
                <span>{artifactType.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="form-section">
          <label>Subject</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="input"
          >
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="form-section">
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input"
            placeholder="Give your creation a title..."
            required
          />
        </div>

        <div className="form-section">
          <label>Your Creation</label>
          {type === 'code' ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="input code-input"
              placeholder="Write your code here..."
              rows={15}
              required
            />
          ) : type === 'story' ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="input"
              placeholder="Write your story here..."
              rows={15}
              required
            />
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="input"
              placeholder="Describe your drawing or upload instructions..."
              rows={10}
              required
            />
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-large"
          disabled={submitting}
        >
          {submitting ? 'Submitting...' : 'Submit Creation'}
        </button>
      </form>
    </div>
  )
}

export default CreateLab

