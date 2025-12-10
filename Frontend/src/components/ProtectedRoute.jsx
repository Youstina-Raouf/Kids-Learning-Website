import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { role, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="spinner"></div>
      </div>
    )
  }

  if (!role) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // Redirect based on role
    if (role === 'child') return <Navigate to="/child" replace />
    if (role === 'parent') return <Navigate to="/parent" replace />
    if (role === 'educator') return <Navigate to="/educator" replace />
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute

