import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth()

  console.log('ProtectedRoute - User:', user)
  console.log('ProtectedRoute - IsAuthenticated:', isAuthenticated)
  console.log('ProtectedRoute - Loading:', loading)
  console.log('ProtectedRoute - Required roles:', roles)
  console.log('ProtectedRoute - User role:', user?.role)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    console.log('ProtectedRoute - Not authenticated, redirecting to login')
    return <Navigate to="/login" replace />
  }

  if (roles.length > 0 && !roles.includes(user?.role)) {
    console.log('ProtectedRoute - Role mismatch, redirecting to home')
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute
