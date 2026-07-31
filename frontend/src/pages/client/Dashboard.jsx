import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import axios from 'axios'
import { API_URL } from '../../config/api'
import { User, Wallet, ArrowRight, LogOut, ArrowDownCircle, ArrowUpCircle, FileText, AlertCircle, CheckCircle, TrendingUp, CreditCard, Send, PieChart, Activity } from 'lucide-react'

const ClientDashboard = () => {
  const { user, logout } = useAuth()
  const [account, setAccount] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [application, setApplication] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profilePhotoData, setProfilePhotoData] = useState(null)

  useEffect(() => {
    console.log('[Dashboard] Component mounted, user:', user?.email);
    fetchData()
    if (user?.profile_photo) {
      fetchProfilePhoto()
    }
  }, [user?.profile_photo])

  const fetchData = async () => {
    try {
      // First check if user has an application
      const applicationRes = await axios.get('/api/account-applications/my-application').catch(() => ({ data: null }))
      setApplication(applicationRes.data)

      // Only fetch account and transactions if application is approved
      if (applicationRes.data && applicationRes.data.status === 'approuve') {
        const [accountRes, transactionsRes] = await Promise.all([
          axios.get('/api/accounts').catch(() => ({ data: null })),
          axios.get('/api/transactions').catch(() => ({ data: [] }))
        ])
        setAccount(accountRes.data)
        setTransactions(transactionsRes.data)
      } else {
        setAccount(null)
        setTransactions([])
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const userName = user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.email || 'Client'

  return (
    <div className="space-y-6 pb-8">
      {/* Welcome Section - Modern Design */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-4 mb-4">
            {getProfilePhotoUrl() ? (
              <img
                src={getProfilePhotoUrl()}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover border-4 border-white/30 shadow-lg"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/30 shadow-lg">
                <User className="h-10 w-10 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-1">Bienvenue, {userName}</h1>
              <p className="text-blue-100 text-base sm:text-lg">Gérez vos finances avec SALEKA BANQUE</p>
            </div>
          </div>
          {account && (
            <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Solde total</p>
                  <p className="text-3xl font-bold">{parseFloat(account.balance).toLocaleString('fr-FR')} FCFA</p>
                </div>
                <TrendingUp className="h-12 w-12 text-white/80" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Application Status Card */}
      {application && application.status !== 'approuve' && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Statut de votre demande</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              application.status === 'approuve' ? 'bg-green-100 text-green-800' :
              application.status === 'rejete' ? 'bg-red-100 text-red-800' :
              application.status === 'en_cours_verification' ? 'bg-yellow-100 text-yellow-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {application.status === 'approuve' ? 'Approuvé' :
               application.status === 'rejete' ? 'Rejeté' :
               application.status === 'en_cours_verification' ? 'En cours de vérification' :
               application.status === 'soumis' ? 'Soumis' : 'Brouillon'}
            </span>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Progression</span>
              <span className="text-sm font-medium">{application.completion_percentage || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${application.completion_percentage || 0}%` }}
              />
            </div>
          </div>

          {application.rejection_reason && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
              <p className="text-sm text-red-800">
                <strong>Motif de rejet:</strong> {application.rejection_reason}
              </p>
            </div>
          )}

          {application.correction_request && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Demande de correction:</strong> {application.correction_request}
              </p>
            </div>
          )}

          <Link
            to="/client/account-application"
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <FileText className="h-5 w-5" />
            {application.status === 'brouillon' ? 'Continuer ma demande' : 'Voir ma demande'}
          </Link>
        </div>
      )}

      {/* No Account / No Application */}
      {!account && !application && (
        <div className="card">
          <div className="text-center py-8">
            <Wallet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Ouvrez votre compte bancaire</h2>
            <p className="text-gray-600 mb-6">Commencez votre pré-enrôlement en quelques minutes</p>
            <Link
              to="/client/account-application"
              className="btn-primary inline-flex items-center gap-2"
            >
              <FileText className="h-5 w-5" />
              Démarrer le pré-enrôlement
            </Link>
          </div>
        </div>
      )}

      {/* Quick Actions - Modern Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/client/transfers" className="card hover:shadow-2xl transition-all duration-300 group transform hover:-translate-y-1">
          <div className="p-6">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition">
              <Send className="h-7 w-7 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1 text-lg">Transferts</h3>
            <p className="text-sm text-gray-600">Envoyer de l'argent</p>
          </div>
        </Link>

        <Link to="/client/account" className="card hover:shadow-2xl transition-all duration-300 group transform hover:-translate-y-1">
          <div className="p-6">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition">
              <Wallet className="h-7 w-7 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1 text-lg">Solde</h3>
            <p className="text-sm text-gray-600">Consultez votre compte</p>
          </div>
        </Link>

        <Link to="/client/cards" className="card hover:shadow-2xl transition-all duration-300 group transform hover:-translate-y-1">
          <div className="p-6">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition">
              <CreditCard className="h-7 w-7 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1 text-lg">Cartes</h3>
            <p className="text-sm text-gray-600">Gérez vos cartes</p>
          </div>
        </Link>

        <Link to="/client/savings" className="card hover:shadow-2xl transition-all duration-300 group transform hover:-translate-y-1">
          <div className="p-6">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition">
              <PieChart className="h-7 w-7 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1 text-lg">Épargne</h3>
            <p className="text-sm text-gray-600">Vos économies</p>
          </div>
        </Link>
      </div>

      {/* Stats Cards */}
      {account && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <Activity className="h-6 w-6 text-white/80" />
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Ce mois</span>
            </div>
            <p className="text-3xl font-bold mb-1">{transactions.length}</p>
            <p className="text-blue-100 text-sm">Transactions</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-6 w-6 text-white/80" />
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Entrées</span>
            </div>
            <p className="text-3xl font-bold mb-1">
              {transactions
                .filter(t => t.transaction_type === 'depot')
                .reduce((sum, t) => sum + parseFloat(t.amount), 0)
                .toLocaleString('fr-FR')} FCFA
            </p>
            <p className="text-green-100 text-sm">Dépôts</p>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-rose-600 text-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <ArrowUpCircle className="h-6 w-6 text-white/80" />
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Sorties</span>
            </div>
            <p className="text-3xl font-bold mb-1">
              {transactions
                .filter(t => t.transaction_type === 'retrait')
                .reduce((sum, t) => sum + parseFloat(t.amount), 0)
                .toLocaleString('fr-FR')} FCFA
            </p>
            <p className="text-red-100 text-sm">Retraits</p>
          </div>
        </div>
      )}

      {/* Recent Transactions - Modern Design */}
      {transactions.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Transactions récentes</h2>
            <Link to="/client/transactions-history" className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1">
              Voir tout <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {transactions.slice(0, 5).map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${
                    transaction.transaction_type === 'depot' 
                      ? 'bg-gradient-to-br from-green-400 to-green-600' 
                      : 'bg-gradient-to-br from-red-400 to-red-600'
                  }`}>
                    {transaction.transaction_type === 'depot' ? (
                      <ArrowDownCircle className="h-6 w-6 text-white" />
                    ) : (
                      <ArrowUpCircle className="h-6 w-6 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 capitalize">
                      {transaction.transaction_type === 'depot' ? 'Dépôt' : 'Retrait'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(transaction.created_at).toLocaleDateString('fr-FR', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xl font-bold ${
                    transaction.transaction_type === 'depot' 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {transaction.transaction_type === 'depot' ? '+' : '-'}
                    {parseFloat(transaction.amount).toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Logout - Modern Design */}
      <button
        onClick={logout}
        className="w-full card flex items-center justify-center space-x-3 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 transition-all duration-300 text-red-600 hover:text-red-700 group"
      >
        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center group-hover:bg-red-200 transition">
          <LogOut className="h-5 w-5" />
        </div>
        <span className="font-semibold">Déconnexion</span>
      </button>
    </div>
  )
}

export default ClientDashboard
