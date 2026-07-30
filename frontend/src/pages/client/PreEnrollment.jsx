import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { User, Calendar, MapPin, Briefcase, DollarSign, Save, AlertCircle, CheckCircle, Camera, CreditCard, Upload, FileText, XCircle } from 'lucide-react'
import DocumentScanner from '../../components/DocumentScanner'
import SignaturePad from '../../components/SignaturePad'

const PreEnrollment = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    sex: '',
    nationality: 'Cameroun',
    address: '',
    city: '',
    profession: '',
    income: '',
    cni_number: '',
    passport_number: '',
    account_type: ''
  })
  const [documents, setDocuments] = useState({
    cni_recto: null,
    cni_verso: null,
    passeport: null,
    justificatif_domicile: null
  })
  const [existingProfile, setExistingProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [scanningDocumentType, setScanningDocumentType] = useState('cni_recto')
  const [scannedImageData, setScannedImageData] = useState(null)
  const [signature, setSignature] = useState(null)
  const fileInputRefs = {
    cni_recto: useRef(null),
    cni_verso: useRef(null),
    passeport: useRef(null),
    justificatif_domicile: useRef(null)
  }

  const documentTypes = [
    { key: 'cni_recto', label: 'CNI Recto', required: true },
    { key: 'cni_verso', label: 'CNI Verso', required: true },
    { key: 'passeport', label: 'Passeport', required: false },
    { key: 'justificatif_domicile', label: 'Justificatif de domicile', required: true }
  ]

  useEffect(() => {
    fetchExistingProfile()
  }, [])

  const fetchExistingProfile = async () => {
    try {
      const response = await axios.get('/api/clients/profile')
      const profileData = response.data
      
      // Format date_of_birth to yyyy-MM-dd for input type="date"
      if (profileData.date_of_birth) {
        const date = new Date(profileData.date_of_birth)
        profileData.date_of_birth = date.toISOString().split('T')[0]
      }
      
      setExistingProfile(profileData)
      setFormData(profileData)
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('Failed to fetch profile:', error)
      }
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleScanComplete = (extractedData, imageData) => {
    // Si c'est le CNI recto avec OCR, extraire les données
    if (scanningDocumentType === 'cni_recto' && extractedData) {
      setFormData(prev => ({
        ...prev,
        ...extractedData
      }))
      setScannedImageData(imageData)
    }
    
    // Ajouter l'image au document correspondant
    setDocuments(prev => ({
      ...prev,
      [scanningDocumentType]: imageData
    }))
    
    setShowScanner(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  const openScanner = (docType) => {
    setScanningDocumentType(docType)
    setShowScanner(true)
  }

  const handleFileSelect = (type) => {
    fileInputRefs[type].current.click()
  }

  const handleFileChange = (type, e) => {
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
    
    // Convert file to base64 for preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setDocuments(prev => ({
        ...prev,
        [type]: reader.result
      }))
    }
    reader.readAsDataURL(file)
  }

  const removeDocument = (type) => {
    setDocuments(prev => ({
      ...prev,
      [type]: null
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validate required documents
      const requiredDocs = documentTypes.filter(d => d.required)
      const missingDocs = requiredDocs.filter(d => !documents[d.key])
      
      if (missingDocs.length > 0) {
        setError(`Documents manquants: ${missingDocs.map(d => d.label).join(', ')}`)
        setLoading(false)
        return
      }

      // Validate signature
      if (!signature) {
        setError('Veuillez signer électroniquement le formulaire')
        setLoading(false)
        return
      }

      const formDataObj = new FormData()
      
      // Add form data
      Object.keys(formData).forEach(key => {
        formDataObj.append(key, formData[key])
      })
      
      // Add documents
      Object.keys(documents).forEach(key => {
        if (documents[key]) {
          // Convert base64 to blob
          const response = fetch(documents[key])
          const blob = response.blob()
          formDataObj.append(key, blob, `${key}.jpg`)
        }
      })

      // Add signature
      if (signature) {
        const response = fetch(signature)
        const blob = response.blob()
        formDataObj.append('signature', blob, 'signature.png')
      }

      if (existingProfile) {
        await axios.put('/api/clients/profile', formDataObj, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        setSuccess(true)
      } else {
        await axios.post('/api/clients', formDataObj, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        setSuccess(true)
        setExistingProfile(formData)
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pré-enrôlement</h1>
        <p className="text-gray-600">Remplissez vos informations personnelles pour commencer l'ouverture de compte</p>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
          <span className="text-green-800">
            {scannedImageData ? 'Données extraites avec succès ! Vérifiez les informations.' : 'Informations enregistrées avec succès !'}
          </span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Account Type Selection */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <CreditCard className="h-5 w-5 mr-2 text-primary-600" />
            Type de compte
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <label className={`relative cursor-pointer border-2 rounded-xl p-6 transition-all ${
              formData.account_type === 'courant' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}>
              <input
                type="radio"
                name="account_type"
                value="courant"
                checked={formData.account_type === 'courant'}
                onChange={handleChange}
                className="sr-only"
                required
              />
              <div className="text-center">
                <CreditCard className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Compte Courant</h3>
                <p className="text-sm text-gray-600 mt-1">Pour vos transactions quotidiennes</p>
              </div>
            </label>

            <label className={`relative cursor-pointer border-2 rounded-xl p-6 transition-all ${
              formData.account_type === 'epargne' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}>
              <input
                type="radio"
                name="account_type"
                value="epargne"
                checked={formData.account_type === 'epargne'}
                onChange={handleChange}
                className="sr-only"
              />
              <div className="text-center">
                <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <h3 className="font-semibold text-gray-900">Compte Épargne</h3>
                <p className="text-sm text-gray-600 mt-1">Pour faire fructifier votre argent</p>
              </div>
            </label>

            <label className={`relative cursor-pointer border-2 rounded-xl p-6 transition-all ${
              formData.account_type === 'professionnel' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}>
              <input
                type="radio"
                name="account_type"
                value="professionnel"
                checked={formData.account_type === 'professionnel'}
                onChange={handleChange}
                className="sr-only"
              />
              <div className="text-center">
                <Briefcase className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <h3 className="font-semibold text-gray-900">Compte Pro</h3>
                <p className="text-sm text-gray-600 mt-1">Pour vos activités professionnelles</p>
              </div>
            </label>
          </div>
        </div>

        {/* CNI Scanner */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Camera className="h-5 w-5 mr-2 text-primary-600" />
            Scan de la CNI
          </h2>
          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-dashed border-blue-300">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Scanner votre Carte d'Identité</h3>
              <p className="text-sm text-gray-600">
                Utilisez votre caméra pour scanner automatiquement votre CNI et remplir le formulaire
              </p>
              {scannedImageData && (
                <div className="mt-2 flex items-center text-green-600 text-sm">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  CNI scannée avec succès
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowScanner(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center"
            >
              <Camera className="h-5 w-5 mr-2" />
              Scanner ma CNI
            </button>
          </div>
        </div>

        {/* Personal Information */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <User className="h-5 w-5 mr-2 text-primary-600" />
            Informations personnelles
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom *
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prénom *
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de naissance *
              </label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                className="input-field"
                required
                max={new Date().toISOString().split('T')[0]}
                min="1900-01-01"
              />
              <p className="text-xs text-gray-500 mt-1">
                Cliquez sur le calendrier pour sélectionner votre date de naissance
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sexe *
              </label>
              <select
                name="sex"
                value={formData.sex}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="">Sélectionner</option>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nationalité
              </label>
              <input
                type="text"
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro CNI
              </label>
              <input
                type="text"
                name="cni_number"
                value={formData.cni_number}
                onChange={handleChange}
                className="input-field"
                placeholder="Numéro de carte d'identité nationale"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro Passeport
              </label>
              <input
                type="text"
                name="passport_number"
                value={formData.passport_number}
                onChange={handleChange}
                className="input-field"
                placeholder="Numéro de passeport"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-primary-600" />
            Adresse
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse complète *
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="input-field"
                rows={3}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ville
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Briefcase className="h-5 w-5 mr-2 text-primary-600" />
            Informations professionnelles
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profession
              </label>
              <input
                type="text"
                name="profession"
                value={formData.profession}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Revenus mensuels (FCFA)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  name="income"
                  value={formData.income}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Documents Section */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-primary-600" />
            Documents KYC
          </h2>
          <div className="space-y-4">
            {documentTypes.map((docType) => (
              <div key={docType.key} className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{docType.label}</h3>
                      <p className="text-sm text-gray-600">
                        {docType.required && <span className="text-red-600">*</span>}
                        {documents[docType.key] && (
                          <span className="ml-2 text-green-600 flex items-center">
                            <CheckCircle className="h-4 w-4 inline mr-1" />
                            Document ajouté
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => openScanner(docType.key)}
                      className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200 transition"
                      title="Scanner avec caméra"
                    >
                      <Camera className="h-5 w-5 text-blue-700" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFileSelect(docType.key)}
                      className="btn-primary flex items-center"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {documents[docType.key] ? 'Remplacer' : 'Télécharger'}
                    </button>
                    {documents[docType.key] && (
                      <button
                        type="button"
                        onClick={() => removeDocument(docType.key)}
                        className="p-2 bg-red-100 rounded-lg hover:bg-red-200 transition"
                        title="Supprimer"
                      >
                        <XCircle className="h-5 w-5 text-red-700" />
                      </button>
                    )}
                    <input
                      ref={fileInputRefs[docType.key]}
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange(docType.key, e)}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Document Preview */}
                {documents[docType.key] && (
                  <div className="mt-4">
                    {documents[docType.key].startsWith('data:image') ? (
                      <img
                        src={documents[docType.key]}
                        alt={docType.label}
                        className="max-h-48 rounded-lg border border-gray-200"
                      />
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-lg text-center">
                        <FileText className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">Document PDF</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Instructions</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Les fichiers doivent être en format JPEG, PNG, WebP ou PDF</li>
              <li>• La taille maximale est de 5MB par fichier</li>
              <li>• Assurez-vous que les documents sont lisibles et en couleur</li>
              <li>• Utilisez le scanner pour la CNI recto pour un remplissage automatique</li>
              <li>• L'authenticité des documents est vérifiée automatiquement par le système intégré</li>
            </ul>
          </div>
        </div>

        {/* Signature Section */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-primary-600" />
            Signature électronique
          </h2>
          <SignaturePad onSignatureChange={setSignature} existingSignature={signature} />
          
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-900 mb-2">Important</h3>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Votre signature électronique a valeur légale</li>
              <li>• En signant, vous certifiez que toutes les informations fournies sont exactes</li>
              <li>• Vous acceptez les conditions générales de la banque</li>
            </ul>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <Save className="h-5 w-5 mr-2" />
          {loading ? 'Enregistrement...' : existingProfile ? 'Mettre à jour' : 'Enregistrer'}
        </button>
      </form>

      {/* Document Scanner Modal */}
      {showScanner && (
        <DocumentScanner
          onScanComplete={handleScanComplete}
          onClose={() => setShowScanner(false)}
          documentType={scanningDocumentType}
          enableOCR={scanningDocumentType === 'cni_recto'}
        />
      )}
    </div>
  )
}

export default PreEnrollment
