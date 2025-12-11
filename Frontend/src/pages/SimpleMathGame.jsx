import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './GameCatalog.css'

const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const generateProblem = () => {
  const isAddition = Math.random() < 0.5
  const a = getRandomInt(1, 20)
  const b = getRandomInt(1, 20)
  return {
    a,
    b,
    operator: isAddition ? '+' : '-',
    answer: isAddition ? a + b : a - b
  }
}

const SimpleMathGame = () => {
  const navigate = useNavigate()
  const [problem, setProblem] = useState(generateProblem())
  const [userAnswer, setUserAnswer] = useState('')
  const [score, setScore] = useState(0)
  const [message, setMessage] = useState('')
  const [questionsLeft, setQuestionsLeft] = useState(10)

  useEffect(() => {
    setProblem(generateProblem())
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (userAnswer.trim() === '') return

    const numericAnswer = Number(userAnswer)
    if (numericAnswer === problem.answer) {
      setScore(prev => prev + 1)
      setMessage('✅ Correct! Great job!')
    } else {
      setMessage(`❌ Oops! The correct answer was ${problem.answer}`)
    }

    setQuestionsLeft(prev => prev - 1)

    setTimeout(() => {
      setProblem(generateProblem())
      setUserAnswer('')
      setMessage('')
    }, 1000)
  }

  const handlePlayAgain = () => {
    setScore(0)
    setQuestionsLeft(10)
    setProblem(generateProblem())
    setUserAnswer('')
    setMessage('')
  }

  const gameOver = questionsLeft <= 0

  return (
    <div className="game-catalog">
      <header className="catalog-header">
        <button onClick={() => navigate('/child')} className="btn btn-secondary">
          ← Back to Dashboard
        </button>
        <h1> Simple Math Game</h1>
        <p>Practice addition and subtraction!</p>
      </header>

      <div className="games-container">
        <div className="game-card-large" style={{ maxWidth: '480px', margin: '0 auto' }}>
          <div className="game-info-large">
            <h3>Score: {score}</h3>
            <p>Questions left: {questionsLeft}</p>

            {gameOver ? (
              <div>
                <h2>Game Over!</h2>
                <p>You answered {score} out of 10 correctly.</p>
                <button className="btn btn-primary" onClick={handlePlayAgain}>
                  Play Again
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={{ fontSize: '32px', margin: '16px 0' }}>
                  {problem.a} {problem.operator} {problem.b} = ?
                </div>
                <input
                  type="number"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  style={{
                    fontSize: '24px',
                    padding: '8px 12px',
                    width: '100%',
                    boxSizing: 'border-box',
                    marginBottom: '12px'
                  }}
                />
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  Check Answer
                </button>
              </form>
            )}

            {message && (
              <div style={{ marginTop: '12px', fontSize: '18px' }}>
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SimpleMathGame
