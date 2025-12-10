import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import './Dashboard.css'

const AddChild = () => {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await api.post('/children', {
        name,
        age: Number(age),
        pin,
      })
      navigate('/parent')
    } catch (err) {
      const message = err?.response?.data?.message || err?.response?.data?.errors?.[0]?.msg || 'Failed to create child profile'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Add Child Profile</h1>
          <p>Create a new profile for your child</p>
        </div>
      </header>

      <section className="dashboard-section">
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter child's name"
            />
          </div>

          <div className="form-group">
            <label>Age</label>
            <input
              type="number"
              className="input"
              min="3"
              max="12"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
              placeholder="3 - 12"
            />
          </div>

          <div className="form-group">
            <label>PIN (4-6 digits)</label>
            <input
              type="password"
              className="input"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
              minLength={4}
              maxLength={6}
              placeholder="Choose a PIN"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Child Profile'}
          </button>
        </form>
      </section>
    </div>
  )
}

export default AddChild
