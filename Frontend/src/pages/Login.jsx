import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PasswordInput from '../components/PasswordInput'
import './Login.css'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [childId, setChildId] = useState('')
  const [pin, setPin] = useState('')
  const [loginType, setLoginType] = useState('adult') // 'adult' or 'child'
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { login, childLogin } = useAuth()
  const navigate = useNavigate()

  const handleAdultLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(email, password)
    
    if (result.success) {
      const role = result.user?.role
      if (role === 'parent') navigate('/parent')
      else if (role === 'educator') navigate('/educator')
      else navigate('/child')
    } else {
      setError(result.message)
    }
    
    setLoading(false)
  }

  const handleChildLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await childLogin(childId, pin)
    
    if (result.success) {
      navigate('/child')
    } else {
      setError(result.message)
    }
    
    setLoading(false)
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>🎮 Play, Learn & Protect</h1>
          <p>Welcome back! Let's continue learning!</p>
        </div>

        <div className="login-tabs">
          <button 
            className={loginType === 'adult' ? 'active' : ''}
            onClick={() => setLoginType('adult')}
          >
            Parent/Educator
          </button>
          <button 
            className={loginType === 'child' ? 'active' : ''}
            onClick={() => setLoginType('child')}
          >
            Child
          </button>
        </div>

        {loginType === 'adult' ? (
          <form onSubmit={handleAdultLogin} className="login-form">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input"
                placeholder="your@email.com"
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="btn btn-primary btn-large" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <p className="register-link">
              Don't have an account? <Link to="/register">Register here</Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleChildLogin} className="login-form">
            <div className="form-group">
              <label>Child ID</label>
              <input
                type="text"
                value={childId}
                onChange={(e) => setChildId(e.target.value)}
                required
                className="input"
                placeholder="Enter your ID"
              />
            </div>

            <div className="form-group">
              <label>PIN</label>
              <PasswordInput
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter your PIN"
                required
                maxLength={6}
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="btn btn-primary btn-large" disabled={loading}>
              {loading ? 'Logging in...' : 'Start Playing!'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default Login

