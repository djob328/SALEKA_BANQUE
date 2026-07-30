import { useState, useEffect } from 'react'
import axios from 'axios'
import { Search, Filter, Eye, Lock, Unlock, MoreVertical, ChevronLeft, ChevronRight, Wallet, ArrowUpCircle, ArrowDownCircle, Send, X, Calendar } from 'lucide-react'

const ClientManagement = () => {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)
  const [selectedClient, setSelectedClient] = useState(null)
  const [showAccountsModal, setShowAccountsModal] = useState(false)
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [showTransactionsHistory, setShowTransactionsHistory] = useState(false)
  const [showAppointmentsHistory, setShowAppointmentsHistory] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [appointments, setAppointments] = useState([])
  const [transactionForm, setTransactionForm] = useState({
    type: 'depot',
    amount: '',
    description: '',
    accountId: null
  })

  useEffect(() => {
    fetchClients()
  }, [page, searchTerm, statusFilter])

  const fetchClients = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page,
        search: searchTerm,
        status: statusFilter
      })
      
      const response = await axios.get(`/api/clients/all?${params}`)
      setClients(response.data.clients)
      setPagination(response.data.pagination)
    } catch (error) {
      console.error('Failed to fetch clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBlockClient = async (clientId, isBlocked) => {
    try {
      await axios.patch(`/api/admin/users/${clientId}/block`, { blocked: !isBlocked })
      fetchClients()
    } catch (error) {
      console.error('Failed to block/unblock client:', error)
    }
  }

  const handleViewAccounts = (client) => {
    setSelectedClient(client)
    setShowAccountsModal(true)
  }

  const handleTransaction = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/api/transactions', transactionForm)
      alert('Transaction effectuée avec succès')
      setShowTransactionModal(false)
      setTransactionForm({ type: 'depot', amount: '', description: '', accountId: null })
      fetchClients()
    } catch (error) {
      console.error('Failed to perform transaction:', error)
      alert('Erreur lors de la transaction')
    }
  }

  const openTransactionModal = (accountId, type) => {
    setTransactionForm({ ...transactionForm, accountId, type })
    setShowTransactionModal(true)
  }

  const fetchTransactions = async (accountId) => {
    try {
      const response = await axios.get(`/api/transactions/account/${accountId}`)
      setTransactions(response.data)
      setSelectedAccount(accountId)
      setShowTransactionsHistory(true)
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
      alert('Erreur lors de la récupération des transactions')
    }
  }

  const fetchAppointments = async (userId) => {
    try {
      const response = await axios.get(`/api/appointments/user/${userId}`)
      setAppointments(response.data)
      setShowAppointmentsHistory(true)
    } catch (error) {
      console.error('Failed to fetch appointments:', error)
      alert('Erreur lors de la récupération des rendez-vous')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'en_attente': return 'status-en_attente'
      case 'verification_en_cours': return 'status-verification_en_cours'
      case 'valide': return 'status-valide'
      case 'rejete': return 'status-rejete'
      case 'complement_demande': return 'status-complement_demande'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent mb-2">Gestion des clients</h1>
        <p className="text-gray-600">Consultez et gérez tous les clients inscrits</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher (nom, email, CNI...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-12"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
          >
            <option value="">Tous les statuts</option>
            <option value="en_attente">En attente</option>
            <option value="verification_en_cours">Vérification en cours</option>
            <option value="valide">Validé</option>
            <option value="rejete">Rejeté</option>
            <option value="complement_demande">Complement demandé</option>
          </select>

          <button
            onClick={() => { setSearchTerm(''); setStatusFilter(''); setPage(1) }}
            className="btn-secondary flex items-center justify-center"
          >
            <Filter className="h-4 w-4 mr-2" />
            Réinitialiser
          </button>
        </div>
      </div>

      {/* Clients Table */}
      <div className="table-responsive">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <table className="table-modern">
            <thead>
              <tr>
                <th>Client</th>
                <th>Contact</th>
                <th>CNI</th>
                <th>Statut</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id}>
                  <td>
                    <div>
                      <p className="font-semibold">{client.first_name} {client.last_name}</p>
                      <p className="text-sm text-gray-500">{client.email}</p>
                    </div>
                  </td>
                  <td>
                    <p className="text-sm">{client.phone || '-'}</p>
                  </td>
                  <td>
                    <p className="text-sm">{client.cni_number || '-'}</p>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusColor(client.status)}`}>
                      {client.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td>
                    <p className="text-sm">{new Date(client.created_at).toLocaleDateString('fr-FR')}</p>
                  </td>
                  <td>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleViewAccounts(client)}
                        className="p-2 hover:bg-blue-50 rounded-lg transition"
                        title="Voir les comptes"
                      >
                        <Wallet className="h-4 w-4 text-gray-600" />
                      </button>
                      <button 
                        onClick={() => fetchAppointments(client.user_id)}
                        className="p-2 hover:bg-blue-50 rounded-lg transition"
                        title="Voir les rendez-vous"
                      >
                        <Calendar className="h-4 w-4 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-blue-50 rounded-lg transition">
                        <Eye className="h-4 w-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleBlockClient(client.user_id, false)}
                        className="p-2 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Lock className="h-4 w-4 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-blue-50 rounded-lg transition">
                        <MoreVertical className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {pagination && (
          <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-4 border-t border-gray-200 gap-4">
            <p className="text-sm text-gray-600">
              Affichage de {((pagination.page - 1) * pagination.limit) + 1} à {Math.min(pagination.page * pagination.limit, pagination.total)} sur {pagination.total} clients
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={pagination.page === 1}
                className="p-2 hover:bg-blue-50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold">
                {pagination.page} / {pagination.pages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                disabled={pagination.page === pagination.pages}
                className="p-2 hover:bg-blue-50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Accounts Modal */}
        {showAccountsModal && selectedClient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="card max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Comptes bancaires - {selectedClient.first_name} {selectedClient.last_name}</h2>
                <button onClick={() => setShowAccountsModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {selectedClient.accounts && selectedClient.accounts.length > 0 ? (
                <div className="space-y-4">
                  {selectedClient.accounts.map((account) => (
                    <div key={account.id} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="font-semibold text-lg">Compte {account.account_type}</p>
                          <p className="text-sm text-gray-600">N° {account.account_number}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">{parseFloat(account.balance).toLocaleString('fr-FR')} XAF</p>
                          <p className="text-sm text-gray-500">Solde actuel</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => fetchTransactions(account.id)}
                          className="flex-1 btn-secondary flex items-center justify-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Historique
                        </button>
                        <button
                          onClick={() => openTransactionModal(account.id, 'depot')}
                          className="flex-1 btn-primary flex items-center justify-center gap-2"
                        >
                          <ArrowDownCircle className="h-4 w-4" />
                          Dépôt
                        </button>
                        <button
                          onClick={() => openTransactionModal(account.id, 'retrait')}
                          className="flex-1 btn-secondary flex items-center justify-center gap-2"
                        >
                          <ArrowUpCircle className="h-4 w-4" />
                          Retrait
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Aucun compte bancaire pour ce client</p>
              )}
            </div>
          </div>
        )}

        {/* Transaction Modal */}
        {showTransactionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="card max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold capitalize">{transactionForm.type}</h2>
                <button onClick={() => setShowTransactionModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleTransaction}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Montant (XAF)</label>
                    <input
                      type="number"
                      value={transactionForm.amount}
                      onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
                      className="input-field"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={transactionForm.description}
                      onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })}
                      className="input-field min-h-[100px]"
                      rows="3"
                      placeholder="Description de la transaction..."
                    />
                  </div>
                  
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setShowTransactionModal(false)}
                      className="flex-1 btn-secondary"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="flex-1 btn-primary"
                    >
                      Confirmer
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Transactions History Modal */}
        {showTransactionsHistory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="card max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Historique des transactions</h2>
                <button onClick={() => setShowTransactionsHistory(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {transactions.length > 0 ? (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="p-4 bg-gray-50 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold capitalize">{transaction.transaction_type}</span>
                        <span className="text-lg font-bold">
                          {parseFloat(transaction.amount).toLocaleString('fr-FR')} XAF
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{transaction.description || 'Pas de description'}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(transaction.created_at).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Aucune transaction pour ce compte</p>
              )}
            </div>
          </div>
        )}

        {/* Appointments History Modal */}
        {showAppointmentsHistory && selectedClient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="card max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Rendez-vous - {selectedClient.first_name} {selectedClient.last_name}</h2>
                <button onClick={() => setShowAppointmentsHistory(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {appointments.length > 0 ? (
                <div className="space-y-3">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="p-4 bg-gray-50 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">
                          {new Date(appointment.appointment_date).toLocaleDateString('fr-FR')}
                        </span>
                        <span className={`status-badge ${appointment.status === 'confirmed' ? 'status-valide' : appointment.status === 'pending' ? 'status-en_attente' : 'status-rejete'}`}>
                          {appointment.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">Heure: {appointment.appointment_time}</p>
                      {appointment.agency_name && (
                        <p className="text-sm text-gray-600">Agence: {appointment.agency_name}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Aucun rendez-vous pour ce client</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ClientManagement
