import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { Upload, Camera, FileText, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react'

const DocumentUpload = () => {
  const [documents, setDocuments] = useState([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRefs = {
    cni_recto: useRef(null),
    cni_verso: useRef(null),
    passeport: useRef(null),
    justificatif_domicile: useRef(null),
    selfie: useRef(null)
  }

  const documentTypes = [
    { key: 'cni_recto', label: 'CNI Recto', required: true },
    { key: 'cni_verso', label: 'CNI Verso', required: true },
    { key: 'passeport', label: 'Passeport', required: false },
    { key: 'justificatif_domicile', label: 'Justificatif de domicile', required: true },
    { key: 'selfie', label: 'Photo Selfie', required: true }
  ]

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      const response = await axios.get('/api/documents')
      setDocuments(response.data)
    } catch (error) {
      console.error('Failed to fetch documents:', error)
    }
  }

  const handleFileSelect = (type) => {
    fileInputRefs[type].current.click()
  }

  const handleCameraCapture = (type) => {
    // In a real implementation, this would open the camera
    // For now, we'll use file input
    handleFileSelect(type)
  }

  const handleFileChange = async (type, e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      setError('Type de fichier non autorisé. Utilisez JPEG, PNG, WebP ou PDF.')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Le fichier ne doit pas dépasser 5MB.')
      return
    }

    setError('')
    await uploadDocument(type, file)
  }

  const uploadDocument = async (type, file) => {
    setUploading(true)
    const formData = new FormData()
    formData.append(type, file)

    try {
      await axios.post('/api/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      await fetchDocuments()
    } catch (error) {
      setError(error.response?.data?.error || 'Erreur lors du téléchargement')
    } finally {
      setUploading(false)
    }
  }

  const getDocumentStatus = (type) => {
    const doc = documents.find(d => d.document_type === type)
    return doc ? doc.verification_status : null
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <RefreshCw className="h-5 w-5 text-yellow-600" />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'verified':
        return 'Vérifié'
      case 'rejected':
        return 'Rejeté'
      default:
        return 'En attente'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified':
        return 'text-green-600'
      case 'rejected':
        return 'text-red-600'
      default:
        return 'text-yellow-600'
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Documents KYC</h1>
        <p className="text-gray-600">Téléchargez vos pièces justificatives pour la vérification d'identité</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      <div className="space-y-4">
        {documentTypes.map((docType) => {
          const status = getDocumentStatus(docType.key)
          return (
            <div key={docType.key} className="card">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{docType.label}</h3>
                    <p className="text-sm text-gray-600">
                      {docType.required && <span className="text-red-600">*</span>}
                      {status && (
                        <span className={`ml-2 flex items-center ${getStatusColor(status)}`}>
                          {getStatusIcon(status)}
                          <span className="ml-1">{getStatusText(status)}</span>
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleCameraCapture(docType.key)}
                    disabled={uploading}
                    className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
                    title="Prendre une photo"
                  >
                    <Camera className="h-5 w-5 text-gray-700" />
                  </button>
                  <button
                    onClick={() => handleFileSelect(docType.key)}
                    disabled={uploading}
                    className="btn-primary flex items-center"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {status ? 'Remplacer' : 'Télécharger'}
                  </button>
                  <input
                    ref={fileInputRefs[docType.key]}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange(docType.key, e)}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Instructions</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Les fichiers doivent être en format JPEG, PNG, WebP ou PDF</li>
          <li>• La taille maximale est de 5MB par fichier</li>
          <li>• Assurez-vous que les documents sont lisibles et en couleur</li>
          <li>• La photo selfie doit montrer clairement votre visage</li>
        </ul>
      </div>
    </div>
  )
}

export default DocumentUpload
