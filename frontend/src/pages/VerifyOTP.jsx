import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Building2, Shield, AlertCircle, CheckCircle } from 'lucide-react'

const VerifyOTP = () => {
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { verifyOTP } = useAuth()
  const navigate = useNavigate()
  
  // Get email from localStorage (set during registration)
  const email = localStorage.getItem('pendingEmail') || ''

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await verifyOTP(otp, email)
      
      if (result.success) {
        // Clear pending email after successful verification
        localStorage.removeItem('pendingEmail')
        navigate('/client/dashboard')
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Shield className="h-12 w-12 text-primary-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900">Vérification OTP</h2>
          <p className="text-gray-600 mt-2">Entrez le code envoyé par SMS</p>
        </div>

        <div className="card">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-800 text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="input-field text-center text-2xl tracking-widest"
                placeholder="000000"
                maxLength={6}
                required
              />
              <p className="text-sm text-gray-500 mt-2">
                Entrez le code à 6 chiffres reçu par SMS
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Vérification...' : 'Vérifier'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Code non reçu ?{' '}
              <button className="text-primary-600 hover:text-primary-700 font-medium">
                Renvoyer le code
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerifyOTP
