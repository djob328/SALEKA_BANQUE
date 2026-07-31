import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'
import { API_URL } from '../config/api'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [token])

  const fetchUser = async () => {
    try {
      const response = await axios.get('/api/auth/me')
      setUser(response.data)
    } catch (error) {
      console.error('Failed to fetch user:', error)
      // Clear invalid token on 401/403 errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        logout()
      }
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    console.log('[AuthContext] Login attempt, API_URL:', API_URL);
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, { email, password })
      const { token: newToken, user: userData } = response.data
      console.log('[AuthContext] Login successful, user:', userData.email);
      localStorage.setItem('token', newToken)
      setToken(newToken)
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
      setUser(userData)

      return { success: true, user: userData }
    } catch (error) {
      console.error('[AuthContext] Login error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      }
    }
  }

  const register = async (firstName, lastName, email, password, phone) => {
    console.log('[AuthContext] Register attempt, email:', email);
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, { first_name: firstName, last_name: lastName, email, password, phone })
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      }
    }
  }

  const verifyOTP = async (otp, email) => {
    try {
      const response = await axios.post('/api/auth/verify-otp', { otp, email })
      
      // Store token and user data from verification response
      if (response.data.token) {
        localStorage.setItem('token', response.data.token)
        setToken(response.data.token)
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`
        setUser(response.data.user)
      }
      
      return { success: true, data: response.data }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'OTP verification failed' 
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
  }

  const value = {
    user,
    loading,
    login,
    register,
    verifyOTP,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin' || user?.role === 'super_admin',
    isAgent: user?.role === 'agent' || user?.role === 'admin' || user?.role === 'super_admin'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
