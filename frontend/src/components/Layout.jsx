import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useNotifications } from '../contexts/NotificationContext'
import axios from 'axios'
import { 
  Home, 
  User, 
  Calendar, 
  FileText, 
  MapPin, 
  Bell,
  LogOut,
  Shield,
  Users,
  Building2
} from 'lucide-react'
import { API_URL } from '../config/api';
import { useState, useEffect } from 'react'

const Layout = () => {
  const { user, logout, isAuthenticated, isAdmin, isAgent } = useAuth()
  const { unreadCount } = useNotifications()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profilePhotoData, setProfilePhotoData] = useState(null)

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location])

  useEffect(() => {
    if (user?.profile_photo) {
      fetchProfilePhoto()
    }
  }, [user?.profile_photo])

  const fetchProfilePhoto = async () => {
    if (!user?.profile_photo) return
    
    try {
      const filename = user.profile_photo.split('/').pop()
      const response = await axios.get(`/api/auth/profile-photo/${filename}`)
      setProfilePhotoData(response.data.data)
    } catch (error) {
      console.error('Failed to fetch profile photo:', error)
    }
  }

  const getProfilePhotoUrl = () => {
    if (profilePhotoData) {
      return profilePhotoData
    }
    if (user?.profile_photo) {
      if (user.profile_photo.startsWith('http')) {
        return user.profile_photo
      }
      const filename = user.profile_photo.split('/').pop()
      return `${API_URL}/api/auth/profile-photo/${filename}`
    }
    return null
  }

  const clientNavItems = [
    { path: '/client/dashboard', icon: Home, label: 'Tableau de bord' },
    { path: '/client/account-application', icon: FileText, label: 'Pré-enrôlement' },
    
    { path: '/client/account', icon: Building2, label: 'Solde' },
    { path: '/client/transactions-history', icon: FileText, label: 'Transactions' },
  ]

  const adminNavItems = [
    { path: '/admin/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/admin/account-applications', icon: FileText, label: 'Demandes compte' },
    { path: '/admin/clients', icon: Users, label: 'Clients' },
   
    { path: '/admin/agencies', icon: Building2, label: 'Agences' },
    { path: '/admin/security', icon: Shield, label: 'Sécurité' },
  ]

  const navItems = isAdmin || isAgent ? adminNavItems : clientNavItems

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-primary-600 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Building2 className="h-8 w-8" />
              <span className="text-xl font-bold">SALEKA BANQUE</span>
            </Link>

            <div className="flex items-center space-x-4">
              {/* Desktop Navigation */}
              {isAuthenticated && (
                <nav className="hidden lg:flex items-center space-x-1">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition ${
                          location.pathname === item.path
                            ? 'bg-primary-700 text-white'
                            : 'text-primary-100 hover:bg-primary-700'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </Link>
                    )
                  })}
                </nav>
              )}
              
              <div className="flex items-center space-x-2">
                {isAuthenticated && (
                  <>
                    <button className="relative p-2 hover:bg-primary-700 rounded-full transition">
                      <Bell className="h-6 w-6" />
                      {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                    <Link to="/client/profile" className="hidden sm:block">
                      {getProfilePhotoUrl() ? (
                        <img
                          src={getProfilePhotoUrl()}
                          alt="Profile"
                          className="w-10 h-10 rounded-full object-cover border-2 border-white/30 hover:border-white/50 transition"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/30 hover:border-white/50 transition">
                          <User className="h-5 w-5 text-white" />
                        </div>
                      )}
                    </Link>
                    <button
                      onClick={logout}
                      className="flex items-center space-x-1 hover:bg-primary-700 px-3 py-2 rounded-lg transition"
                    >
                      <LogOut className="h-5 w-5" />
                      <span className="hidden sm:inline">Déconnexion</span>
                    </button>
                  </>
                )}
                {!isAuthenticated && (
                  <Link to="/login" className="btn-primary">
                    Connexion
                  </Link>
                )}
                <button
                  className="lg:hidden p-2 hover:bg-primary-700 rounded-lg"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {mobileMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      {mobileMenuOpen && isAuthenticated && (
        <nav className="sm:hidden bg-white border-b shadow-md">
          <div className="px-4 py-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition ${
                    location.pathname === item.path
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <p className="text-gray-400 text-sm sm:text-base">© 2024 SALEKA BANQUE. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout
