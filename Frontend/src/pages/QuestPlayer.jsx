import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import './QuestPlayer.css'

const QuestPlayer = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [quest, setQuest] = useState(null)
  const [progress, setProgress] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [sessionId, setSessionId] = useState(null)

  useEffect(() => {
    fetchQuest()
    startSession()
  }, [id])

  const fetchQuest = async () => {
    try {
      const [questRes, progressRes] = await Promise.all([
        api.get(`/quests/${id}`),
        api.get(`/quests/${id}/progress`)
      ])

      setQuest(questRes.data)
      
      if (progressRes.data.status === 'not_started') {
        // Start the quest
        const startRes = await api.post(`/quests/${id}/start`)
        setProgress(startRes.data)
        setCurrentStep(0)
      } else {
        setProgress(progressRes.data)
        // Find the next incomplete step
        const completedSteps = progressRes.data.completedSteps.map(cs => cs.stepNumber)
        const nextStep = questRes.data.steps.findIndex(
          (s, idx) => !completedSteps.includes(idx + 1)
        )
        setCurrentStep(nextStep >= 0 ? nextStep : questRes.data.steps.length)
      }
    } catch (error) {
      console.error('Error fetching quest:', error)
    } finally {
      setLoading(false)
    }
  }

  const startSession = async () => {
    try {
      const res = await api.post('/monitoring/session/start', {
        contentType: 'quest',
        contentId: id,
        subject: quest?.subject
      })
      setSessionId(res.data._id)
    } catch (error) {
      console.error('Error starting session:', error)
    }
  }

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) return

    setSubmitting(true)
    try {
      const step = quest.steps[currentStep]
      const res = await api.post(`/quests/${id}/complete-step`, {
        stepNumber: step.stepNumber,
        answer: answer
      })

      setProgress(res.data)

      if (res.data.status === 'completed') {
        // End session
        if (sessionId) {
          await api.post('/monitoring/session/end', {
            sessionId,
            pointsEarned: res.data.totalPointsEarned
          })
        }
        // Show completion screen
        setTimeout(() => {
          navigate('/child')
        }, 3000)
      } else {
        // Move to next step
        setCurrentStep(currentStep + 1)
        setAnswer('')
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Error submitting answer')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="quest-loading">
        <div className="spinner"></div>
      </div>
    )
  }

  if (!quest) {
    return <div>Quest not found</div>
  }

  const step = quest.steps[currentStep]
  const isCompleted = progress?.status === 'completed'
  const completedSteps = progress?.completedSteps?.map(cs => cs.stepNumber) || []

  return (
    <div className="quest-player">
      <header className="quest-header">
        <button onClick={() => navigate('/games')} className="btn btn-secondary">
          ← Back
        </button>
        <h1>{quest.title}</h1>
        <div className="quest-progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${((currentStep + 1) / quest.steps.length) * 100}%`
            }}
          />
        </div>
        <div className="quest-progress-text">
          Step {currentStep + 1} of {quest.steps.length}
        </div>
      </header>

      {isCompleted ? (
        <div className="quest-completed">
          <div className="completion-icon">🎉</div>
          <h2>Congratulations!</h2>
          <p>You completed the quest!</p>
          <div className="rewards">
            <div className="reward-item">
              <span className="reward-icon">⭐</span>
              <span>{progress.totalPointsEarned} Points Earned</span>
            </div>
            {quest.rewards.badge && (
              <div className="reward-item">
                <span className="reward-icon">🏆</span>
                <span>Badge Unlocked!</span>
              </div>
            )}
          </div>
          <p>Redirecting to dashboard...</p>
        </div>
      ) : (
        <div className="quest-content">
          <div className="step-card">
            <div className="step-header">
              <h2>Step {step.stepNumber}</h2>
            </div>
            <div className="step-instruction">
              <p>{step.instruction}</p>
            </div>
            {step.hint && (
              <div className="step-hint">
                <span className="hint-label">💡 Hint:</span>
                <p>{step.hint}</p>
              </div>
            )}
            <div className="step-answer">
              <label>Your Answer:</label>
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="input"
                placeholder="Enter your answer..."
                onKeyPress={(e) => e.key === 'Enter' && handleSubmitAnswer()}
              />
            </div>
            <button
              onClick={handleSubmitAnswer}
              className="btn btn-primary btn-large"
              disabled={submitting || !answer.trim()}
            >
              {submitting ? 'Checking...' : 'Submit Answer'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default QuestPlayer

