import { useState, useEffect } from 'react'
import axios from 'axios'
import { FileText, CheckCircle, XCircle, Eye, Download, AlertCircle } from 'lucide-react'

const KYCVerification = () => {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [filter, setFilter] = useState('pending')

  useEffect(() => {
    fetchDocuments()
  }, [filter])

  const fetchDocuments = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`/api/documents/admin/all${filter ? `?status=${filter}` : ''}`)
      const formattedDocuments = response.data.map(doc => ({
        id: doc.id,
        client_name: `${doc.first_name} ${doc.last_name}`,
        client_id: doc.client_id,
        document_type: doc.document_type,
        file_name: doc.file_name,
        verification_status: doc.verification_status,
        uploaded_at: doc.uploaded_at,
        file_path: doc.file_path
      }))
      setDocuments(formattedDocuments)
    } catch (error) {
      console.error('Failed to fetch documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (documentId, status, reason = '') => {
    try {
      await axios.patch(`/api/documents/${documentId}/verify`, {
        status,
        rejection_reason: reason
      })
      fetchDocuments()
      setSelectedDocument(null)
    } catch (error) {
      console.error('Failed to verify document:', error)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'status-valide'
      case 'rejected': return 'status-rejete'
      default: return 'status-en_attente'
    }
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent mb-2">Vérification KYC</h1>
        <p className="text-gray-600">Vérifiez les documents d'identité des clients</p>
      </div>

      {/* Filter */}
      <div className="card">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setFilter('pending')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
              filter === 'pending' 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            En attente
          </button>
          <button
            onClick={() => setFilter('verified')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
              filter === 'verified' 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Vérifiés
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
              filter === 'rejected' 
                ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Rejetés
          </button>
        </div>
      </div>

      {/* Documents List */}
      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Aucun document à vérifier</p>
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => (
              <div key={doc.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:shadow-lg transition-all duration-300">
                <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <FileText className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{doc.client_name}</h3>
                    <p className="text-sm text-gray-600 font-medium">{doc.document_type.replace(/_/g, ' ')}</p>
                    <p className="text-sm text-gray-500">{doc.file_name}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                  <span className={`status-badge ${getStatusColor(doc.verification_status)}`}>
                    {doc.verification_status === 'pending' ? 'En attente' :
                     doc.verification_status === 'verified' ? 'Vérifié' : 'Rejeté'}
                  </span>

                  {doc.verification_status === 'pending' && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedDocument(doc)}
                        className="p-3 bg-blue-100 rounded-xl hover:bg-blue-200 transition shadow-md"
                      >
                        <Eye className="h-5 w-5 text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleVerify(doc.id, 'verified')}
                        className="p-3 bg-green-100 rounded-xl hover:bg-green-200 transition shadow-md"
                      >
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </button>
                      <button
                        onClick={() => handleVerify(doc.id, 'rejected', 'Document illisible')}
                        className="p-3 bg-red-100 rounded-xl hover:bg-red-200 transition shadow-md"
                      >
                        <XCircle className="h-5 w-5 text-red-600" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Document Preview Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                  {selectedDocument.client_name} - {selectedDocument.document_type.replace(/_/g, ' ')}
                </h2>
                <button
                  onClick={() => setSelectedDocument(null)}
                  className="p-3 hover:bg-gray-100 rounded-xl transition"
                >
                  <XCircle className="h-6 w-6 text-gray-600" />
                </button>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 mb-6">
                <p className="text-center text-gray-600 font-medium mb-4">Aperçu du document</p>
                <div className="aspect-video bg-white rounded-xl flex items-center justify-center shadow-inner border-2 border-dashed border-gray-300 overflow-hidden">
                  {selectedDocument.file_path ? (
                    <img 
                      src={`/api/documents/file/${selectedDocument.file_path.split(/[\\/]/).pop()}`} 
                      alt={selectedDocument.file_name}
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        console.error('Failed to load image:', e.target.src);
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="hidden flex-col items-center justify-center">
                    <FileText className="h-20 w-20 text-gray-400" />
                    <p className="text-gray-500 mt-2">Image non disponible</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={() => handleVerify(selectedDocument.id, 'rejected')}
                  className="btn-secondary flex items-center justify-center"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Rejeter
                </button>
                <button
                  onClick={() => handleVerify(selectedDocument.id, 'verified')}
                  className="btn-primary flex items-center justify-center"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Valider
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default KYCVerification
