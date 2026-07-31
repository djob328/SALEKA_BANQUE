import { useState, useEffect } from 'react'
import axios from 'axios'
import { API_URL } from '../../config/api'
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  FileText, 
  User, 
  Calendar,
  Building2,
  Eye,
  Download,
  Search,
  Filter,
  X
} from 'lucide-react'

const AccountApplications = () => {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [filter, setFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [actionLoading, setActionLoading] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [correctionRequest, setCorrectionRequest] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showCorrectionModal, setShowCorrectionModal] = useState(false)
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)
  const [documentData, setDocumentData] = useState({})
  const [showDocumentModal, setShowDocumentModal] = useState(false)
  const [currentDocument, setCurrentDocument] = useState(null)
  const [appointmentForm, setAppointmentForm] = useState({
    agency_id: '',
    appointment_date: '',
    appointment_time: ''
  })
  const [agencies, setAgencies] = useState([])

  useEffect(() => {
    fetchApplications()
    fetchAgencies()
  }, [page, statusFilter])

  const fetchAgencies = async () => {
    try {
      const response = await axios.get('/api/agencies')
      setAgencies(response.data)
    } catch (error) {
      console.error('Failed to fetch agencies:', error)
    }
  }

  const fetchApplications = async () => {
    setLoading(true)
    try {
      const params = { page }
      if (statusFilter) params.status = statusFilter
      
      const response = await axios.get('/api/account-applications/all', { params })
      setApplications(response.data.applications)
      setTotalPages(response.data.pagination.pages)
    } catch (error) {
      console.error('Failed to fetch applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewApplication = async (applicationId) => {
    try {
      const response = await axios.get(`/api/account-applications/${applicationId}`)
      setSelectedApplication(response.data)
    } catch (error) {
      console.error('Failed to fetch application details:', error)
    }
  }

  const handleApprove = async (applicationId) => {
    setActionLoading(true)
    try {
      await axios.post(`/api/account-applications/${applicationId}/approve`)
      // Ouvrir automatiquement la modale de planification après approbation
      const application = applications.find(app => app.id === applicationId)
      if (application) {
        setSelectedApplication(application)
        setShowAppointmentModal(true)
      }
      fetchApplications()
    } catch (error) {
      alert('Erreur lors de l\'approbation')
    } finally {
      setActionLoading(false)
    }
  }

  const handleScheduleAppointment = async (e) => {
    e.preventDefault()
    setActionLoading(true)
    try {
      await axios.post(`/api/account-applications/${selectedApplication.id}/schedule-appointment`, appointmentForm)
      alert('Rendez-vous planifié avec succès. Une notification WhatsApp a été envoyée au client.')
      setShowAppointmentModal(false)
      setAppointmentForm({ agency_id: '', appointment_date: '', appointment_time: '' })
      fetchApplications()
      setSelectedApplication(null)
    } catch (error) {
      alert('Erreur lors de la planification du rendez-vous')
    } finally {
      setActionLoading(false)
    }
  }

  const openAppointmentModal = (application) => {
    setSelectedApplication(application)
    setShowAppointmentModal(true)
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Veuillez fournir un motif de rejet')
      return
    }
    
    setActionLoading(true)
    try {
      await axios.post(`/api/account-applications/${selectedApplication.id}/reject`, { 
        reason: rejectionReason 
      })
      alert('Demande rejetée')
      setShowRejectModal(false)
      setRejectionReason('')
      fetchApplications()
      setSelectedApplication(null)
    } catch (error) {
      alert('Erreur lors du rejet')
    } finally {
      setActionLoading(false)
    }
  }

  const handleRequestCorrection = async () => {
    if (!correctionRequest.trim()) {
      alert('Veuillez fournir une demande de correction')
      return
    }
    
    setActionLoading(true)
    try {
      await axios.post(`/api/account-applications/${selectedApplication.id}/request-correction`, { 
        correction_request: correctionRequest 
      })
      alert('Demande de correction envoyée')
      setShowCorrectionModal(false)
      setCorrectionRequest('')
      fetchApplications()
      setSelectedApplication(null)
    } catch (error) {
      alert('Erreur lors de la demande de correction')
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approuve': return 'bg-green-100 text-green-800'
      case 'rejete': return 'bg-red-100 text-red-800'
      case 'en_cours_verification': return 'bg-yellow-100 text-yellow-800'
      case 'soumis': return 'bg-blue-100 text-blue-800'
      case 'correction_demandee': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'approuve': return 'Approuvé'
      case 'rejete': return 'Rejeté'
      case 'en_cours_verification': return 'En cours'
      case 'soumis': return 'Soumis'
      case 'correction_demandee': return 'Correction'
      default: return status
    }
  }

  const getDocumentUrl = (path) => {
    if (!path) return null
    if (path.startsWith('http')) return path
    // Extract filename from path (handles both relative and absolute paths)
    const filename = path.split(/[\\/]/).pop()
    return `${API_URL}/api/account-applications/document/${filename}`
  }

  const fetchDocument = async (path) => {
    if (!path) return null
    // Extract filename from path (handles both relative and absolute paths)
    const filename = path.split(/[\\/]/).pop()
    const cacheKey = filename
    
    if (documentData[cacheKey]) {
      return documentData[cacheKey]
    }
    
    try {
      const response = await axios.get(`/api/account-applications/document/${filename}`)
      setDocumentData(prev => ({ ...prev, [cacheKey]: response.data.data }))
      return response.data.data
    } catch (error) {
      console.error('Failed to fetch document:', error)
      return null
    }
  }

  const openDocument = async (path) => {
    const data = await fetchDocument(path)
    if (!data) return
    
    setCurrentDocument(data)
    setShowDocumentModal(true)
  }

  const filteredApplications = applications.filter(app => {
    if (!filter) return true
    const search = filter.toLowerCase()
    return (
      app.reference?.toLowerCase().includes(search) ||
      app.first_name?.toLowerCase().includes(search) ||
      app.last_name?.toLowerCase().includes(search) ||
      app.email?.toLowerCase().includes(search)
    )
  })

  if (loading && applications.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-2xl p-6 sm:p-8 shadow-xl">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Demandes d'ouverture de compte</h1>
        <p className="text-primary-100 text-sm sm:text-base">Gérez et validez les demandes des clients</p>
      </div>

      {!selectedApplication ? (
        <>
          {/* Filters */}
          <div className="card">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par référence, nom, email..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="input-field pl-12"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field"
              >
                <option value="">Tous les statuts</option>
                <option value="brouillon">Brouillon</option>
                <option value="soumis">Soumis</option>
                <option value="en_cours_verification">En cours</option>
                <option value="approuve">Approuvé</option>
                <option value="rejete">Rejeté</option>
                <option value="correction_demandee">Correction</option>
              </select>
            </div>
          </div>

          {/* Applications Table */}
          <div className="card overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Référence</th>
                  <th className="text-left py-3 px-4 font-semibold">Client</th>
                  <th className="text-left py-3 px-4 font-semibold">Produit</th>
                  <th className="text-left py-3 px-4 font-semibold">Date</th>
                  <th className="text-left py-3 px-4 font-semibold">Statut</th>
                  <th className="text-left py-3 px-4 font-semibold">Progression</th>
                  <th className="text-left py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-gray-500">
                      Aucune demande trouvée
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map((application) => (
                    <tr key={application.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{application.reference}</td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{application.first_name} {application.last_name}</p>
                          <p className="text-sm text-gray-500">{application.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 capitalize">{application.account_type}</td>
                      <td className="py-3 px-4">
                        {new Date(application.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                          {getStatusLabel(application.status)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full"
                              style={{ width: `${application.completion_percentage || 0}%` }}
                            />
                          </div>
                          <span className="text-sm">{application.completion_percentage || 0}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleViewApplication(application.id)}
                          className="btn-primary btn-sm flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Voir
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-secondary btn-sm disabled:opacity-50"
                >
                  Précédent
                </button>
                <span className="py-2 px-4">
                  Page {page} sur {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn-secondary btn-sm disabled:opacity-50"
                >
                  Suivant
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Application Detail View */
        <div className="space-y-6">
          <button
            onClick={() => setSelectedApplication(null)}
            className="btn-secondary flex items-center gap-2"
          >
            ← Retour à la liste
          </button>

          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">{selectedApplication.reference}</h2>
                <p className="text-gray-600">
                  {selectedApplication.first_name} {selectedApplication.last_name} - {selectedApplication.email}
                </p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(selectedApplication.status)}`}>
                {getStatusLabel(selectedApplication.status)}
              </span>
            </div>

            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Progression</span>
                <span className="text-sm font-medium">{selectedApplication.completion_percentage || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full"
                  style={{ width: `${selectedApplication.completion_percentage || 0}%` }}
                />
              </div>
            </div>

            {/* Admin Feedback */}
            {selectedApplication.rejection_reason && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
                <p className="text-sm text-red-800">
                  <strong>Motif de rejet:</strong> {selectedApplication.rejection_reason}
                </p>
              </div>
            )}

            {selectedApplication.correction_request && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
                <p className="text-sm text-yellow-800">
                  <strong>Demande de correction:</strong> {selectedApplication.correction_request}
                </p>
              </div>
            )}

            {/* Tabs */}
            <div className="border-b mb-6">
              <div className="flex gap-4">
                <button className="pb-2 border-b-2 border-primary-600 text-primary-600 font-medium">
                  Informations
                </button>
              </div>
            </div>

            {/* Personal Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informations personnelles
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Sexe</p>
                    <p className="font-medium">{selectedApplication.sex === 'M' ? 'Masculin' : 'Féminin'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Date de naissance</p>
                    <p className="font-medium">{new Date(selectedApplication.date_of_birth).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Lieu de naissance</p>
                    <p className="font-medium">{selectedApplication.place_of_birth}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Nationalité</p>
                    <p className="font-medium">{selectedApplication.nationality}</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Informations de contact
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Téléphone</p>
                    <p className="font-medium">{selectedApplication.phone}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{selectedApplication.email}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg md:col-span-2">
                    <p className="text-sm text-gray-500">Adresse</p>
                    <p className="font-medium">{selectedApplication.address}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Ville</p>
                    <p className="font-medium">{selectedApplication.city}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Quartier</p>
                    <p className="font-medium">{selectedApplication.neighborhood}</p>
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Informations professionnelles
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Profession</p>
                    <p className="font-medium">{selectedApplication.profession}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Employeur</p>
                    <p className="font-medium">{selectedApplication.employer || 'Non spécifié'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Revenu mensuel</p>
                    <p className="font-medium">{selectedApplication.monthly_income ? parseFloat(selectedApplication.monthly_income).toLocaleString('fr-FR') + ' FCFA' : 'Non spécifié'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Source des revenus</p>
                    <p className="font-medium">{selectedApplication.income_source}</p>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documents
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedApplication.cni_recto_path && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-2">CNI Recto</p>
                      <button
                        onClick={() => openDocument(selectedApplication.cni_recto_path)}
                        className="btn-secondary btn-sm flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Voir
                      </button>
                    </div>
                  )}
                  {selectedApplication.cni_verso_path && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-2">CNI Verso</p>
                      <button
                        onClick={() => openDocument(selectedApplication.cni_verso_path)}
                        className="btn-secondary btn-sm flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Voir
                      </button>
                    </div>
                  )}
                  {selectedApplication.photo_identite_path && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-2">Photo d'identité</p>
                      <button
                        onClick={() => openDocument(selectedApplication.photo_identite_path)}
                        className="btn-secondary btn-sm flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Voir
                      </button>
                    </div>
                  )}
                  {selectedApplication.justificatif_domicile_path && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-2">Justificatif de domicile</p>
                      <button
                        onClick={() => openDocument(selectedApplication.justificatif_domicile_path)}
                        className="btn-secondary btn-sm flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Voir
                      </button>
                    </div>
                  )}
                  {selectedApplication.selfie_path && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-2">Selfie</p>
                      <button
                        onClick={() => openDocument(selectedApplication.selfie_path)}
                        className="btn-secondary btn-sm flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Voir
                      </button>
                    </div>
                  )}
                  {selectedApplication.signature_path && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-2">Signature</p>
                      <button
                        onClick={() => openDocument(selectedApplication.signature_path)}
                        className="btn-secondary btn-sm flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Voir
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              {selectedApplication.status === 'soumis' ? (
                <div className="flex flex-wrap gap-4 pt-6 border-t">
                  <button
                    onClick={() => handleApprove(selectedApplication.id)}
                    disabled={actionLoading}
                    className="btn-primary flex items-center gap-2 disabled:opacity-50"
                  >
                    <CheckCircle className="h-5 w-5" />
                    Approuver
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    disabled={actionLoading}
                    className="btn-secondary flex items-center gap-2 text-red-600 hover:text-red-700 disabled:opacity-50"
                  >
                    <XCircle className="h-5 w-5" />
                    Rejeter
                  </button>
                  <button
                    onClick={() => setShowCorrectionModal(true)}
                    disabled={actionLoading}
                    className="btn-secondary flex items-center gap-2 text-yellow-600 hover:text-yellow-700 disabled:opacity-50"
                  >
                    <AlertCircle className="h-5 w-5" />
                    Demander correction
                  </button>
                </div>
              ) : selectedApplication.status === 'en_cours_verification' ? (
                <div className="flex flex-wrap gap-4 pt-6 border-t">
                  <button
                    onClick={() => openAppointmentModal(selectedApplication)}
                    disabled={actionLoading}
                    className="btn-primary flex items-center gap-2 disabled:opacity-50"
                  >
                    <Calendar className="h-5 w-5" />
                    Planifier rendez-vous
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    disabled={actionLoading}
                    className="btn-secondary flex items-center gap-2 text-red-600 hover:text-red-700 disabled:opacity-50"
                  >
                    <XCircle className="h-5 w-5" />
                    Rejeter
                  </button>
                </div>
              ) : (
                <div className="pt-6 border-t">
                  <p className="text-gray-600">
                    Cette demande a déjà été traitée (statut: {getStatusLabel(selectedApplication.status)})
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Reject Modal */}
          {showRejectModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="card max-w-md w-full mx-4">
                <h3 className="text-xl font-bold mb-4">Rejeter la demande</h3>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Motif du rejet..."
                  className="input-field min-h-[100px] mb-4"
                  rows="4"
                />
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowRejectModal(false)}
                    className="btn-secondary flex-1"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={actionLoading}
                    className="btn-primary flex-1 text-red-600 hover:text-red-700 disabled:opacity-50"
                  >
                    Confirmer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Correction Modal */}
          {showCorrectionModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="card max-w-md w-full mx-4">
                <h3 className="text-xl font-bold mb-4">Demander une correction</h3>
                <textarea
                  value={correctionRequest}
                  onChange={(e) => setCorrectionRequest(e.target.value)}
                  placeholder="Demande de correction..."
                  className="input-field min-h-[100px] mb-4"
                  rows="4"
                />
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowCorrectionModal(false)}
                    className="btn-secondary flex-1"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleRequestCorrection}
                    disabled={actionLoading}
                    className="btn-primary flex-1 disabled:opacity-50"
                  >
                    Envoyer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Appointment Modal */}
          {showAppointmentModal && selectedApplication && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="card max-w-md w-full mx-4">
                <h3 className="text-xl font-bold mb-4">Planifier un rendez-vous</h3>
                <form onSubmit={handleScheduleAppointment} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Agence</label>
                    <select
                      value={appointmentForm.agency_id}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, agency_id: e.target.value })}
                      className="input-field"
                      required
                    >
                      <option value="">Sélectionner une agence</option>
                      {agencies.map((agency) => (
                        <option key={agency.id} value={agency.id}>
                          {agency.name} - {agency.address}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Choisissez l'agence la plus proche du domicile du client
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date du rendez-vous</label>
                    <input
                      type="date"
                      value={appointmentForm.appointment_date}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, appointment_date: e.target.value })}
                      className="input-field"
                      required
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Heure du rendez-vous</label>
                    <input
                      type="time"
                      value={appointmentForm.appointment_time}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, appointment_time: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setShowAppointmentModal(false)}
                      className="flex-1 btn-secondary"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="flex-1 btn-primary disabled:opacity-50"
                    >
                      {actionLoading ? 'Traitement...' : 'Confirmer'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Document Modal */}
          {showDocumentModal && currentDocument && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
              <div className="relative max-w-4xl w-full mx-4 max-h-[90vh]">
                <button
                  onClick={() => setShowDocumentModal(false)}
                  className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 z-10"
                >
                  <X className="h-6 w-6" />
                </button>
                {currentDocument.startsWith('data:image') ? (
                  <img
                    src={currentDocument}
                    alt="Document"
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <iframe
                    src={currentDocument}
                    className="w-full h-[90vh] rounded-lg"
                    title="Document"
                  />
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AccountApplications
