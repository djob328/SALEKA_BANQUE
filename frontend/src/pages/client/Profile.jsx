import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import axios from 'axios'
import { API_URL } from '../../config/api'
import { User, Calendar, MapPin, Briefcase, Globe, Save, AlertCircle, CheckCircle, Camera, Upload } from 'lucide-react'

const Profile = () => {
  const { user, setUser } = useAuth()
  const [formData, setFormData] = useState({
    dateOfBirth: '',
    address: '',
    nationality: '',
    profession: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [photoLoading, setPhotoLoading] = useState(false)
  const [photoError, setPhotoError] = useState('')
  const [profilePhotoData, setProfilePhotoData] = useState(null)

  useEffect(() => {
    fetchProfile()
    if (user?.profile_photo) {
      fetchProfilePhoto()
    }
  }, [user?.profile_photo])

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/api/clients/profile')
      if (response.data) {
        // Format date_of_birth to yyyy-MM-DD for input
        let formattedDateOfBirth = ''
        if (response.data.date_of_birth) {
          const date = new Date(response.data.date_of_birth)
          formattedDateOfBirth = date.toISOString().split('T')[0]
        }
        
        setFormData({
          dateOfBirth: formattedDateOfBirth,
          address: response.data.address || '',
          nationality: response.data.nationality || '',
          profession: response.data.profession || ''
        })
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    try {
      await axios.put('/api/clients/profile', {
        date_of_birth: formData.dateOfBirth,
        address: formData.address,
        nationality: formData.nationality,
        profession: formData.profession
      })
      setSuccess(true)
    } catch (error) {
      setError(error.response?.data?.error || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setPhotoError('')
    setPhotoLoading(true)

    const formData = new FormData()
    formData.append('photo', file)

    try {
      const response = await axios.post('/api/auth/profile-photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      // Update user state with new photo
      setUser({
        ...user,
        profile_photo: response.data.photoPath
      })

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      setPhotoError(error.response?.data?.error || 'Erreur lors de l\'upload de la photo')
    } finally {
      setPhotoLoading(false)
    }
  }

  const getProfilePhotoUrl = () => {
    // Use base64 data if available
    if (profilePhotoData) {
      return profilePhotoData
    }
    // Fallback to old method
    if (user?.profile_photo) {
      if (user.profile_photo.startsWith('http')) {
        return user.profile_photo
      }
      const filename = user.profile_photo.split('/').pop()
      return `${API_URL}/api/auth/profile-photo/${filename}`
    }
    return null
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-2xl p-6 sm:p-8 shadow-xl">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Profil utilisateur</h1>
        <p className="text-primary-100 text-sm sm:text-base">Complétez vos informations personnelles</p>
      </div>

      {/* Profile Photo Section */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Photo de profil</h2>
        <div className="flex items-center space-x-6">
          <div className="relative">
            {getProfilePhotoUrl() ? (
              <img
                src={getProfilePhotoUrl()}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-primary-200"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center border-4 border-primary-200">
                <User className="h-12 w-12 text-primary-600" />
              </div>
            )}
            <label className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700 transition">
              <Camera className="h-4 w-4" />
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handlePhotoUpload}
                className="hidden"
                disabled={photoLoading}
              />
            </label>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1">{user?.first_name} {user?.last_name}</h3>
            <p className="text-sm text-gray-600">{user?.email}</p>
            {photoError && (
              <p className="text-sm text-red-600 mt-2">{photoError}</p>
            )}
            {photoLoading && (
              <p className="text-sm text-primary-600 mt-2">Upload en cours...</p>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800 text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-green-800 text-sm">Profil mis à jour avec succès</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date de naissance
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="input-field pl-12"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-3 h-5 w-5 text-gray-400" />
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="input-field pl-12 min-h-[100px]"
                placeholder="Votre adresse complète"
                rows="3"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nationalité
            </label>
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
                className="input-field pl-12"
                placeholder="Ex: Cameroun"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profession
            </label>
            <div className="relative">
              <Briefcase className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="profession"
                value={formData.profession}
                onChange={handleChange}
                className="input-field pl-12"
                placeholder="Ex: Ingénieur"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-5 w-5" />
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Profile
