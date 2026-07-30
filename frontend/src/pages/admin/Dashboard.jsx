import { useState, useEffect } from 'react'
import axios from 'axios'
import { 
  Users, 
  Calendar, 
  FileText, 
  Building2, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react'

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState(null)
  const [modalData, setModalData] = useState([])

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/admin/dashboard')
      setStats(response.data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCardClick = async (type) => {
    setModalType(type)
    setShowModal(true)
    setModalData([])

    try {
      let response
      switch (type) {
        case 'clients':
          response = await axios.get('/api/clients/all?limit=50')
          setModalData(response.data.clients)
          break
        case 'applications':
          response = await axios.get('/api/account-applications/all?limit=50')
          setModalData(response.data.applications || [])
          break
        case 'accounts':
          response = await axios.get('/api/accounts/all?limit=50')
          setModalData(response.data.accounts || [])
          break
        case 'transactions':
          response = await axios.get('/api/transactions/all?limit=50')
          setModalData(response.data.transactions || [])
          break
        case 'appointments':
          response = await axios.get('/api/appointments/all?limit=50')
          setModalData(response.data.appointments || [])
          break
        default:
          break
      }
    } catch (error) {
      console.error('Failed to fetch modal data:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Administrateur</h1>
        <p className="text-gray-600">Vue d'ensemble de l'activité de la plateforme</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleCardClick('clients')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Clients</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.totalClients || 0}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleCardClick('applications')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Demandes de compte</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.totalApplications || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleCardClick('accounts')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Comptes bancaires</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.totalAccounts || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Building2 className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleCardClick('transactions')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Solde total (XAF)</p>
              <p className="text-3xl font-bold text-gray-900">{(stats?.totalBalance || 0).toLocaleString('fr-FR')}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleCardClick('transactions')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Transactions totales</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.totalTransactions || 0}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Transactions aujourd'hui</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.todayTransactions || 0}</p>
            </div>
            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-teal-600" />
            </div>
          </div>
        </div>

        <div className="card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleCardClick('appointments')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rendez-vous Aujourd'hui</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.todayAppointments || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Documents en attente</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.pendingDocuments || 0}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Client Status Breakdown */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Statut des clients</h2>
          <div className="space-y-3">
            {stats?.clientsByStatus?.map((status) => (
              <div key={status.status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="capitalize">{status.status.replace(/_/g, ' ')}</span>
                <span className="font-semibold">{status.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Activité par agence</h2>
          <div className="space-y-3">
            {stats?.agencyStats?.map((agency) => (
              <div key={agency.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span>{agency.name}</span>
                <span className="font-semibold">{agency.appointment_count} rendez-vous</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Actions rapides</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <a href="/admin/clients" className="flex items-center space-x-3 p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition">
            <Users className="h-6 w-6 text-primary-600" />
            <span className="font-medium">Gérer les clients</span>
          </a>
          <a href="/admin/kyc" className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <span className="font-medium">Vérifier KYC</span>
          </a>
          <a href="/admin/security" className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg hover:bg-red-100 transition">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <span className="font-medium">Logs sécurité</span>
          </a>
        </div>
      </div>

      {/* Details Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold capitalize">
                {modalType === 'clients' && 'Liste des clients'}
                {modalType === 'applications' && 'Demandes de compte'}
                {modalType === 'accounts' && 'Comptes bancaires'}
                {modalType === 'transactions' && 'Transactions'}
                {modalType === 'appointments' && 'Rendez-vous'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {modalData.length > 0 ? (
              <div className="space-y-3">
                {modalType === 'clients' && modalData.map((client) => (
                  <div key={client.user_id} className="p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{client.first_name} {client.last_name}</p>
                        <p className="text-sm text-gray-600">{client.email}</p>
                        <p className="text-sm text-gray-600">{client.phone || 'N/A'}</p>
                      </div>
                      <span className={`status-badge ${client.status === 'valide' ? 'status-valide' : client.status === 'en_attente' ? 'status-en_attente' : 'status-rejete'}`}>
                        {client.status}
                      </span>
                    </div>
                  </div>
                ))}
                
                {modalType === 'applications' && modalData.map((app) => (
                  <div key={app.id} className="p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{app.reference}</p>
                        <p className="text-sm text-gray-600">{app.account_type}</p>
                        <p className="text-sm text-gray-600">{app.email}</p>
                      </div>
                      <span className={`status-badge ${app.status === 'approuve' ? 'status-valide' : app.status === 'en_cours_verification' ? 'status-en_attente' : 'status-rejete'}`}>
                        {app.status}
                      </span>
                    </div>
                  </div>
                ))}
                
                {modalType === 'accounts' && modalData.map((account) => (
                  <div key={account.id} className="p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{account.account_number}</p>
                        <p className="text-sm text-gray-600">{account.account_type}</p>
                      </div>
                      <p className="text-lg font-bold text-green-600">{parseFloat(account.balance).toLocaleString('fr-FR')} XAF</p>
                    </div>
                  </div>
                ))}
                
                {modalType === 'transactions' && modalData.map((transaction) => (
                  <div key={transaction.id} className="p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold capitalize">{transaction.type || transaction.transaction_type}</p>
                        <p className="text-sm text-gray-600">{transaction.description || 'Pas de description'}</p>
                        <p className="text-xs text-gray-500">{new Date(transaction.created_at).toLocaleString('fr-FR')}</p>
                      </div>
                      <p className={`text-lg font-bold ${transaction.type === 'credit' || transaction.transaction_type === 'depot' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'credit' || transaction.transaction_type === 'depot' ? '+' : '-'}{parseFloat(transaction.amount).toLocaleString('fr-FR')} XAF
                      </p>
                    </div>
                  </div>
                ))}
                
                {modalType === 'appointments' && modalData.map((appointment) => (
                  <div key={appointment.id} className="p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{appointment.user_name || 'Client'}</p>
                        <p className="text-sm text-gray-600">{new Date(appointment.appointment_date).toLocaleDateString('fr-FR')}</p>
                        <p className="text-sm text-gray-600">{appointment.appointment_time}</p>
                      </div>
                      <span className={`status-badge ${appointment.status === 'confirmed' ? 'status-valide' : appointment.status === 'pending' ? 'status-en_attente' : 'status-rejete'}`}>
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Aucune donnée disponible</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
