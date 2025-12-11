import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import './GameCatalog.css'

const GameCatalog = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [games, setGames] = useState([])
  const [filteredGames, setFilteredGames] = useState([])
  const [selectedSubject, setSelectedSubject] = useState(searchParams.get('subject') || 'all')
  const [loading, setLoading] = useState(true)

  const subjects = [
    { id: 'all', name: 'All Games', emoji: '🎮' },
    { id: 'math', name: 'Math', emoji: '🔢' },
    { id: 'physics', name: 'Physics', emoji: '⚡' },
    { id: 'chemistry', name: 'Chemistry', emoji: '🧪' },
    { id: 'language', name: 'Language', emoji: '📚' },
    { id: 'coding', name: 'Coding', emoji: '💻' }
  ]

  const subjectGameUrls = {
    math: 'https://www.mathplayground.com/number_bonds_10.html',
    language: 'https://www.roomrecess.com/mobile/WordToss/play.html',
    coding: 'https://blockly.games/maze',
    physics: 'https://phet.colorado.edu/sims/html/balancing-act/latest/balancing-act_en.html',
    chemistry: 'https://phet.colorado.edu/sims/html/build-a-molecule/latest/build-a-molecule_en.html',
    general: 'https://www.coolmathgames.com/'
  }

  useEffect(() => {
    fetchGames()
  }, [])

  useEffect(() => {
    if (selectedSubject === 'all') {
      setFilteredGames(games)
    } else {
      setFilteredGames(games.filter(g => g.subject === selectedSubject))
    }
  }, [selectedSubject, games])

  const fetchGames = async () => {
    try {
      const res = await api.get('/games')
      setGames(res.data)
      setFilteredGames(res.data)
    } catch (error) {
      console.error('Error fetching games:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGameClick = (game) => {
    const url = subjectGameUrls[game.subject] || subjectGameUrls.general
    window.open(url, '_blank')
  }

  if (loading) {
    return (
      <div className="catalog-loading">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="game-catalog">
      <header className="catalog-header">
        <button onClick={() => navigate('/child')} className="btn btn-secondary">
          ← Back to Dashboard
        </button>
        <h1>🎮 Game Catalog</h1>
        <p>Choose a game to start learning!</p>
      </header>

      <div className="subject-filters">
        {subjects.map(subject => (
          <button
            key={subject.id}
            className={`subject-filter ${selectedSubject === subject.id ? 'active' : ''}`}
            onClick={() => setSelectedSubject(subject.id)}
          >
            <span className="filter-emoji">{subject.emoji}</span>
            <span>{subject.name}</span>
          </button>
        ))}
      </div>

      <div className="games-container">
        {filteredGames.length === 0 ? (
          <div className="no-games">
            <p>No games available for this category yet!</p>
          </div>
        ) : (
          <div className="games-grid">
            {filteredGames.map(game => (
              <div
                key={game._id}
                className="game-card-large"
                onClick={() => handleGameClick(game)}
              >
                <div className="game-thumbnail-large">
                  {game.thumbnail || '🎮'}
                </div>
                <div className="game-info-large">
                  <h3>{game.title}</h3>
                  <p>{game.description}</p>
                  <div className="game-meta-large">
                    <span className="badge badge-primary">{game.subject}</span>
                    <span className="badge">{game.pointsReward} ⭐</span>
                    <span className="badge">{game.estimatedTime} min</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default GameCatalog

