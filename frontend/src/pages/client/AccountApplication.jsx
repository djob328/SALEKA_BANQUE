import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  Upload, 
  Camera, 
  FileText,
  CreditCard,
  Building2,
  User,
  MapPin,
  Briefcase,
  DollarSign,
  Shield,
  Pen
} from 'lucide-react'

const AccountApplication = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [existingApplication, setExistingApplication] = useState(null)
  const signatureCanvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)

  const [formData, setFormData] = useState({
    // Step 1: Account Type
    account_type: '',
    
    // Step 2: Personal Information
    sex: '',
    date_of_birth: '',
    place_of_birth: '',
    nationality: '',
    
    // Step 3: Contact Information
    phone: user?.phone || '',
    email: user?.email || '',
    address: '',
    country: 'Cameroun',
    region: '',
    city: '',
    neighborhood: '',
    
    // Step 4: Professional Information
    profession: '',
    employer: '',
    monthly_income: '',
    income_source: '',
    
    // Step 5: Documents
    cni_recto: null,
    cni_verso: null,
    passport: null,
    photo_identite: null,
    justificatif_domicile: null,
    bulletin_salaire: null,
    registre_commerce: null,
    carte_contribuable: null,
    attestation_travail: null,
    
    // Step 6: Biometric
    selfie: null,
    
    // Step 7: Legal
    terms_accepted: false,
    privacy_accepted: false
  })

  const accountTypes = [
    {
      id: 'courant',
      name: 'Compte Courant',
      icon: CreditCard,
      description: 'Pour vos opérations quotidiennes',
      minBalance: '0 FCFA',
      monthlyFees: '500 FCFA',
      conditions: 'Âge minimum 18 ans',
      documents: ['CNI', 'Justificatif de domicile']
    },
    {
      id: 'epargne',
      name: 'Compte Épargne',
      icon: DollarSign,
      description: 'Faites fructifier votre argent',
      minBalance: '10 000 FCFA',
      monthlyFees: 'Gratuit',
      conditions: 'Âge minimum 18 ans',
      documents: ['CNI', 'Justificatif de domicile']
    },
    {
      id: 'jeune',
      name: 'Compte Jeune',
      icon: User,
      description: 'Pour les 15-25 ans',
      minBalance: '5 000 FCFA',
      monthlyFees: 'Gratuit',
      conditions: 'Âge 15-25 ans',
      documents: ['CNI', 'Justificatif de domicile', 'Autorisation parentale']
    },
    {
      id: 'entreprise',
      name: 'Compte Entreprise',
      icon: Building2,
      description: 'Pour les professionnels',
      minBalance: '50 000 FCFA',
      monthlyFees: '1 000 FCFA',
      conditions: 'Registre de commerce requis',
      documents: ['CNI', 'Registre de commerce', 'Carte contribuable']
    },
    {
      id: 'premium',
      name: 'Compte Premium',
      icon: Shield,
      description: 'Services exclusifs',
      minBalance: '500 000 FCFA',
      monthlyFees: '2 000 FCFA',
      conditions: 'Solde minimum 500 000 FCFA',
      documents: ['CNI', 'Justificatif de domicile', 'Bulletin de salaire']
    }
  ]

  useEffect(() => {
    fetchExistingApplication()
  }, [])

  const fetchExistingApplication = async () => {
    try {
      const response = await axios.get('/api/account-applications/my-application')
      if (response.data) {
        setExistingApplication(response.data)
        
        // Format date_of_birth to yyyy-MM-DD for input
        let formattedDateOfBirth = ''
        if (response.data.date_of_birth) {
          const date = new Date(response.data.date_of_birth)
          formattedDateOfBirth = date.toISOString().split('T')[0]
        }
        
        setFormData({
          ...formData,
          account_type: response.data.account_type || '',
          sex: response.data.sex || '',
          date_of_birth: formattedDateOfBirth,
          place_of_birth: response.data.place_of_birth || '',
          nationality: response.data.nationality || '',
          phone: response.data.phone || '',
          email: response.data.email || '',
          address: response.data.address || '',
          country: response.data.country || 'Cameroun',
          region: response.data.region || '',
          city: response.data.city || '',
          neighborhood: response.data.neighborhood || '',
          profession: response.data.profession || '',
          employer: response.data.employer || '',
          monthly_income: response.data.monthly_income || '',
          income_source: response.data.income_source || '',
          terms_accepted: response.data.terms_accepted || false,
          privacy_accepted: response.data.privacy_accepted || false
        })
        
        if (response.data.status === 'soumis' || response.data.status === 'en_cours_verification') {
          setCurrentStep(8) // Go to status page
        }
      }
    } catch (error) {
      console.error('Failed to fetch application:', error)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleFileChange = (e) => {
    const { name, files } = e.target
    if (files[0]) {
      setFormData({
        ...formData,
        [name]: files[0]
      })
    }
  }

  const handleNext = () => {
    setError('')
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const formDataToSend = new FormData()
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (key !== 'cni_recto' && key !== 'cni_verso' && key !== 'passport' && 
            key !== 'photo_identite' && key !== 'justificatif_domicile' && 
            key !== 'bulletin_salaire' && key !== 'registre_commerce' && 
            key !== 'carte_contribuable' && key !== 'attestation_travail' && 
            key !== 'selfie') {
          formDataToSend.append(key, formData[key])
        }
      })

      // Add files
      if (formData.cni_recto) formDataToSend.append('cni_recto', formData.cni_recto)
      if (formData.cni_verso) formDataToSend.append('cni_verso', formData.cni_verso)
      if (formData.passport) formDataToSend.append('passport', formData.passport)
      if (formData.photo_identite) formDataToSend.append('photo_identite', formData.photo_identite)
      if (formData.justificatif_domicile) formDataToSend.append('justificatif_domicile', formData.justificatif_domicile)
      if (formData.bulletin_salaire) formDataToSend.append('bulletin_salaire', formData.bulletin_salaire)
      if (formData.registre_commerce) formDataToSend.append('registre_commerce', formData.registre_commerce)
      if (formData.carte_contribuable) formDataToSend.append('carte_contribuable', formData.carte_contribuable)
      if (formData.attestation_travail) formDataToSend.append('attestation_travail', formData.attestation_travail)
      if (formData.selfie) formDataToSend.append('selfie', formData.selfie)

      // Add signature if exists
      if (signatureCanvasRef.current) {
        const signatureData = signatureCanvasRef.current.toDataURL('image/png')
        const signatureBlob = await fetch(signatureData).then(r => r.blob())
        formDataToSend.append('signature', signatureBlob, 'signature.png')
      }

      const response = await axios.post('/api/account-applications', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      // Submit the application
      await axios.post(`/api/account-applications/${response.data.applicationId}/submit`)

      setSuccess(true)
      setTimeout(() => {
        navigate('/client/dashboard')
      }, 2000)
    } catch (error) {
      setError(error.response?.data?.error || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  // Signature canvas functions
  const startDrawing = (e) => {
    setIsDrawing(true)
    const canvas = signatureCanvasRef.current
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    ctx.beginPath()
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
  }

  const draw = (e) => {
    if (!isDrawing) return
    const canvas = signatureCanvasRef.current
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Choisissez votre type de compte</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accountTypes.map((type) => {
                const Icon = type.icon
                return (
                  <div
                    key={type.id}
                    onClick={() => setFormData({ ...formData, account_type: type.id })}
                    className={`card cursor-pointer transition-all duration-300 ${
                      formData.account_type === type.id 
                        ? 'ring-2 ring-primary-600 bg-primary-50' 
                        : 'hover:shadow-xl'
                    }`}
                  >
                    <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mb-4">
                      <Icon className="h-8 w-8 text-primary-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{type.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{type.description}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Solde minimum:</span>
                        <span className="font-medium">{type.minBalance}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Frais mensuels:</span>
                        <span className="font-medium">{type.monthlyFees}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Informations personnelles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sexe</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Date de naissance</label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lieu de naissance</label>
                <input
                  type="text"
                  name="place_of_birth"
                  value={formData.place_of_birth}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Ex: Douala"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nationalité</label>
                <input
                  type="text"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Ex: Camerounaise"
                  required
                />
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Informations de contact</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="+237..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Adresse complète</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="input-field min-h-[100px]"
                  placeholder="Votre adresse complète"
                  rows="3"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pays</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Région</label>
                <input
                  type="text"
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Ex: Littoral"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Ex: Douala"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quartier</label>
                <input
                  type="text"
                  name="neighborhood"
                  value={formData.neighborhood}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Ex: Akwa"
                  required
                />
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Informations professionnelles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profession</label>
                <input
                  type="text"
                  name="profession"
                  value={formData.profession}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Ex: Ingénieur"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Employeur</label>
                <input
                  type="text"
                  name="employer"
                  value={formData.employer}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Ex: Entreprise XYZ"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Revenu mensuel (FCFA)</label>
                <input
                  type="number"
                  name="monthly_income"
                  value={formData.monthly_income}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Ex: 500000"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Source des revenus</label>
                <input
                  type="text"
                  name="income_source"
                  value={formData.income_source}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Ex: Salaire, Business..."
                  required
                />
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Documents requis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card">
                <label className="block text-sm font-medium text-gray-700 mb-2">CNI Recto *</label>
                <input
                  type="file"
                  name="cni_recto"
                  onChange={handleFileChange}
                  accept="image/*,application/pdf"
                  className="w-full"
                  required
                />
                {formData.cni_recto && (
                  <p className="text-sm text-green-600 mt-2">✓ Fichier sélectionné</p>
                )}
              </div>
              <div className="card">
                <label className="block text-sm font-medium text-gray-700 mb-2">CNI Verso *</label>
                <input
                  type="file"
                  name="cni_verso"
                  onChange={handleFileChange}
                  accept="image/*,application/pdf"
                  className="w-full"
                  required
                />
                {formData.cni_verso && (
                  <p className="text-sm text-green-600 mt-2">✓ Fichier sélectionné</p>
                )}
              </div>
              <div className="card">
                <label className="block text-sm font-medium text-gray-700 mb-2">Photo d'identité *</label>
                <input
                  type="file"
                  name="photo_identite"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="w-full"
                  required
                />
                {formData.photo_identite && (
                  <p className="text-sm text-green-600 mt-2">✓ Fichier sélectionné</p>
                )}
              </div>
              <div className="card">
                <label className="block text-sm font-medium text-gray-700 mb-2">Justificatif de domicile *</label>
                <input
                  type="file"
                  name="justificatif_domicile"
                  onChange={handleFileChange}
                  accept="image/*,application/pdf"
                  className="w-full"
                  required
                />
                {formData.justificatif_domicile && (
                  <p className="text-sm text-green-600 mt-2">✓ Fichier sélectionné</p>
                )}
              </div>
              <div className="card">
                <label className="block text-sm font-medium text-gray-700 mb-2">Passeport (optionnel)</label>
                <input
                  type="file"
                  name="passport"
                  onChange={handleFileChange}
                  accept="image/*,application/pdf"
                  className="w-full"
                />
                {formData.passport && (
                  <p className="text-sm text-green-600 mt-2">✓ Fichier sélectionné</p>
                )}
              </div>
              {formData.account_type === 'premium' && (
                <div className="card">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bulletin de salaire</label>
                  <input
                    type="file"
                    name="bulletin_salaire"
                    onChange={handleFileChange}
                    accept="image/*,application/pdf"
                    className="w-full"
                  />
                  {formData.bulletin_salaire && (
                    <p className="text-sm text-green-600 mt-2">✓ Fichier sélectionné</p>
                  )}
                </div>
              )}
              {formData.account_type === 'entreprise' && (
                <>
                  <div className="card">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Registre de commerce</label>
                    <input
                      type="file"
                      name="registre_commerce"
                      onChange={handleFileChange}
                      accept="image/*,application/pdf"
                      className="w-full"
                    />
                    {formData.registre_commerce && (
                      <p className="text-sm text-green-600 mt-2">✓ Fichier sélectionné</p>
                    )}
                  </div>
                  <div className="card">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Carte contribuable</label>
                    <input
                      type="file"
                      name="carte_contribuable"
                      onChange={handleFileChange}
                      accept="image/*,application/pdf"
                      className="w-full"
                    />
                    {formData.carte_contribuable && (
                      <p className="text-sm text-green-600 mt-2">✓ Fichier sélectionné</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Vérification biométrique</h2>
            <div className="card">
              <label className="block text-sm font-medium text-gray-700 mb-2">Selfie *</label>
              <input
                type="file"
                name="selfie"
                onChange={handleFileChange}
                accept="image/*"
                capture="user"
                className="w-full"
                required
              />
              {formData.selfie && (
                <p className="text-sm text-green-600 mt-2">✓ Fichier sélectionné</p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                Prenez un selfie clair pour vérifier votre identité
              </p>
            </div>
          </div>
        )

      case 7:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Signature électronique</h2>
            <div className="card">
              <label className="block text-sm font-medium text-gray-700 mb-4">Votre signature</label>
              <canvas
                ref={signatureCanvasRef}
                width={400}
                height={200}
                className="border-2 border-gray-300 rounded-lg bg-white cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />
              <button
                type="button"
                onClick={clearSignature}
                className="mt-4 text-sm text-primary-600 hover:text-primary-700"
              >
                Effacer la signature
              </button>
            </div>

            <div className="space-y-4">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="terms_accepted"
                  checked={formData.terms_accepted}
                  onChange={handleChange}
                  className="mt-1"
                  required
                />
                <span className="text-sm text-gray-700">
                  J'accepte les conditions générales de SALEKA BANQUE *
                </span>
              </label>
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="privacy_accepted"
                  checked={formData.privacy_accepted}
                  onChange={handleChange}
                  className="mt-1"
                  required
                />
                <span className="text-sm text-gray-700">
                  J'accepte la politique de confidentialité *
                </span>
              </label>
            </div>
          </div>
        )

      case 8:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Statut de votre demande</h2>
            {existingApplication && (
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-gray-500">Référence</p>
                    <p className="text-xl font-bold">{existingApplication.reference}</p>
                  </div>
                  <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                    existingApplication.status === 'approuve' ? 'bg-green-100 text-green-800' :
                    existingApplication.status === 'rejete' ? 'bg-red-100 text-red-800' :
                    existingApplication.status === 'en_cours_verification' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {existingApplication.status === 'approuve' ? 'Approuvé' :
                     existingApplication.status === 'rejete' ? 'Rejeté' :
                     existingApplication.status === 'en_cours_verification' ? 'En cours de vérification' :
                     existingApplication.status === 'soumis' ? 'Soumis' : existingApplication.status}
                  </div>
                </div>

                {existingApplication.completion_percentage && (
                  <div className="mb-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Progression</span>
                      <span className="text-sm font-medium">{existingApplication.completion_percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${existingApplication.completion_percentage}%` }}
                      />
                    </div>
                  </div>
                )}

                {existingApplication.rejection_reason && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">
                      <strong>Motif de rejet:</strong> {existingApplication.rejection_reason}
                    </p>
                  </div>
                )}

                {existingApplication.correction_request && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Demande de correction:</strong> {existingApplication.correction_request}
                    </p>
                  </div>
                )}

                {existingApplication.status === 'approuve' && (
                  <button
                    onClick={() => navigate('/client/account')}
                    className="w-full btn-primary mt-6"
                  >
                    Accéder à mon compte
                  </button>
                )}
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  const getStepTitle = () => {
    const titles = {
      1: 'Choix du compte',
      2: 'Informations personnelles',
      3: 'Informations de contact',
      4: 'Informations professionnelles',
      5: 'Documents',
      6: 'Vérification biométrique',
      7: 'Signature',
      8: 'Statut'
    }
    return titles[currentStep] || ''
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return !!formData.account_type
      case 2:
        return !!formData.sex && !!formData.date_of_birth && !!formData.nationality
      case 3:
        return !!formData.phone && !!formData.email && !!formData.address && !!formData.city
      case 4:
        return !!formData.profession && !!formData.monthly_income && !!formData.income_source
      case 5:
        return !!formData.cni_recto && !!formData.cni_verso && !!formData.photo_identite && !!formData.justificatif_domicile
      case 6:
        return !!formData.selfie
      case 7:
        return formData.terms_accepted && formData.privacy_accepted
      default:
        return true
    }
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-2xl p-6 sm:p-8 shadow-xl">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Pré-enrôlement bancaire</h1>
        <p className="text-primary-100 text-sm sm:text-base">Étape {currentStep}/7 - {getStepTitle()}</p>
      </div>

      {/* Progress Bar */}
      {currentStep <= 7 && (
        <div className="card">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-600">Progression</span>
            <span className="text-sm font-medium">{Math.round((currentStep / 7) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 7) * 100}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <span className="text-red-800 text-sm">{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
          <span className="text-green-800 text-sm">Demande soumise avec succès</span>
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit}>
          {renderStep()}

          {currentStep <= 7 && (
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="h-5 w-5" />
                Précédent
              </button>

              {currentStep < 7 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!isStepValid()}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant
                  <ArrowRight className="h-5 w-5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || !isStepValid()}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Soumission...' : 'Soumettre la demande'}
                  <CheckCircle className="h-5 w-5" />
                </button>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default AccountApplication
