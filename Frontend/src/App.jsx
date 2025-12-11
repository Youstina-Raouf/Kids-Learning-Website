import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import ChildDashboard from './pages/ChildDashboard'
import ParentDashboard from './pages/ParentDashboard'
import AddChild from './pages/AddChild'
import EducatorDashboard from './pages/EducatorDashboard'
import EducatorCreateGame from './pages/EducatorCreateGame'
import GameCatalog from './pages/GameCatalog'
import SimpleMathGame from './pages/SimpleMathGame'
import QuestPlayer from './pages/QuestPlayer'
import CreateLab from './pages/CreateLab'
import Leaderboard from './pages/Leaderboard'
import Monitoring from './pages/Monitoring'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/child" element={
            <ProtectedRoute allowedRoles={['child']}>
              <ChildDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/parent" element={
            <ProtectedRoute allowedRoles={['parent']}>
              <ParentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/parent/add-child" element={
            <ProtectedRoute allowedRoles={['parent']}>
              <AddChild />
            </ProtectedRoute>
          } />
          
          <Route path="/educator" element={
            <ProtectedRoute allowedRoles={['educator']}>
              <EducatorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/educator/games/new" element={
            <ProtectedRoute allowedRoles={['educator']}>
              <EducatorCreateGame />
            </ProtectedRoute>
          } />
          
          <Route path="/games" element={
            <ProtectedRoute allowedRoles={['child']}>
              <GameCatalog />
            </ProtectedRoute>
          } />
          <Route path="/games/simple-math" element={
            <ProtectedRoute allowedRoles={['child']}>
              <SimpleMathGame />
            </ProtectedRoute>
          } />
          
          <Route path="/quest/:id" element={
            <ProtectedRoute allowedRoles={['child']}>
              <QuestPlayer />
            </ProtectedRoute>
          } />
          
          <Route path="/create" element={
            <ProtectedRoute allowedRoles={['child']}>
              <CreateLab />
            </ProtectedRoute>
          } />
          
          <Route path="/leaderboard" element={
            <ProtectedRoute>
              <Leaderboard />
            </ProtectedRoute>
          } />
          
          <Route path="/monitoring/:childId" element={
            <ProtectedRoute allowedRoles={['parent', 'educator']}>
              <Monitoring />
            </ProtectedRoute>
          } />
          
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App

