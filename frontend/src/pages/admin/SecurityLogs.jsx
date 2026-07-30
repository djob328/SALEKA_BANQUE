import { useState, useEffect } from 'react'
import axios from 'axios'
import { Shield, AlertTriangle, CheckCircle, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react'

const SecurityLogs = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    fetchLogs()
  }, [searchTerm, actionFilter, statusFilter])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        action: actionFilter,
        status: statusFilter
      })
      
      const response = await axios.get(`/api/admin/security-logs?${params}`)
      setLogs(response.data)
    } catch (error) {
      console.error('Failed to fetch security logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failure':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'suspicious':
        return <Shield className="h-4 w-4 text-orange-600" />
      default:
        return null
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-600'
      case 'failure': return 'text-red-600'
      case 'suspicious': return 'text-orange-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Logs de sécurité</h1>
        <p className="text-gray-600">Surveillance des activités et tentatives suspectes</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="input-field"
          >
            <option value="">Toutes les actions</option>
            <option value="login">Connexion</option>
            <option value="logout">Déconnexion</option>
            <option value="register">Inscription</option>
            <option value="document_upload">Upload document</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
          >
            <option value="">Tous les statuts</option>
            <option value="success">Succès</option>
            <option value="failure">Échec</option>
            <option value="suspicious">Suspect</option>
          </select>

          <button
            onClick={() => { setSearchTerm(''); setActionFilter(''); setStatusFilter('') }}
            className="btn-secondary flex items-center justify-center"
          >
            <Filter className="h-4 w-4 mr-2" />
            Réinitialiser
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="card overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Utilisateur</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">IP</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Statut</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Détails</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm">
                    {new Date(log.created_at).toLocaleString('fr-FR')}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium">{log.action}</span>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    {log.user_id || '-'}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    {log.ip_address || '-'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(log.status)}
                      <span className={`text-sm font-medium ${getStatusColor(log.status)}`}>
                        {log.status}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {log.details ? JSON.stringify(log.details).substring(0, 50) + '...' : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Statistics */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total logs</p>
              <p className="text-2xl font-bold">{logs.length}</p>
            </div>
            <Shield className="h-8 w-8 text-primary-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Échecs</p>
              <p className="text-2xl font-bold text-red-600">
                {logs.filter(l => l.status === 'failure').length}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Suspects</p>
              <p className="text-2xl font-bold text-orange-600">
                {logs.filter(l => l.status === 'suspicious').length}
              </p>
            </div>
            <Shield className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default SecurityLogs
