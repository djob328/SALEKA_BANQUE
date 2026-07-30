import { useState, useEffect } from 'react'
import axios from 'axios'
import { Clock, Users, ArrowRight, AlertCircle, CheckCircle, LogOut } from 'lucide-react'

const QueueStatus = () => {
  const [queuePosition, setQueuePosition] = useState(null)
  const [agencies, setAgencies] = useState([])
  const [selectedAgency, setSelectedAgency] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAgencies()
    fetchMyPosition()
  }, [])

  const fetchAgencies = async () => {
    try {
      const response = await axios.get('/api/agencies')
      setAgencies(response.data)
    } catch (error) {
      console.error('Failed to fetch agencies:', error)
    }
  }

  const fetchMyPosition = async () => {
    try {
      const response = await axios.get('/api/queue/my-position')
      setQueuePosition(response.data)
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('Failed to fetch queue position:', error)
      }
    }
  }

  const handleJoinQueue = async () => {
    if (!selectedAgency) {
      setError('Veuillez sélectionner une agence')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await axios.post('/api/queue/join', { agency_id: selectedAgency })
      setQueuePosition(response.data)
    } catch (error) {
      setError(error.response?.data?.error || 'Erreur lors de l\'inscription dans la file')
    } finally {
      setLoading(false)
    }
  }

  const handleLeaveQueue = async () => {
    try {
      await axios.delete('/api/queue/leave')
      setQueuePosition(null)
    } catch (error) {
      setError('Erreur lors de la sortie de la file')
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">File d'attente intelligente</h1>
        <p className="text-gray-600">Rejoignez la file virtuelle et suivez votre position en temps réel</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      {/* Current Queue Position */}
      {queuePosition ? (
        <div className="card mb-6">
          <div className="text-center">
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-12 w-12 text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Votre position</h2>
            <p className="text-5xl font-bold text-primary-600 mb-4">
              #{queuePosition.position}
            </p>
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <div className="bg-gray-50 rounded-lg p-4">
                <Clock className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Temps estimé</p>
                <p className="text-xl font-semibold">{queuePosition.estimated_wait_time} min</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <Users className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Numéro de file</p>
                <p className="text-xl font-semibold">{queuePosition.queue_number}</p>
              </div>
            </div>
            <button
              onClick={handleLeaveQueue}
              className="mt-6 btn-secondary flex items-center justify-center mx-auto"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Quitter la file
            </button>
          </div>
        </div>
      ) : (
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">Rejoindre une file</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sélectionner une agence
              </label>
              <select
                value={selectedAgency}
                onChange={(e) => setSelectedAgency(e.target.value)}
                className="input-field"
              >
                <option value="">Sélectionner une agence</option>
                {agencies.map((agency) => (
                  <option key={agency.id} value={agency.id}>
                    {agency.name} - {agency.address}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleJoinQueue}
              disabled={loading || !selectedAgency}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <ArrowRight className="h-5 w-5 mr-2" />
              {loading ? 'Inscription...' : 'Rejoindre la file'}
            </button>
          </div>
        </div>
      )}

      {/* Queue Info */}
      <div className="card">
        <h3 className="font-semibold mb-4 flex items-center">
          <Info className="h-5 w-5 mr-2 text-primary-600" />
          Comment ça marche ?
        </h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary-600 font-bold">1</span>
            </div>
            <div>
              <h4 className="font-medium">Sélectionnez votre agence</h4>
              <p className="text-sm text-gray-600">Choisissez l'agence où vous souhaitez vous rendre</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary-600 font-bold">2</span>
            </div>
            <div>
              <h4 className="font-medium">Rejoignez la file virtuelle</h4>
              <p className="text-sm text-gray-600">Obtenez votre numéro de passage sans vous déplacer</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary-600 font-bold">3</span>
            </div>
            <div>
              <h4 className="font-medium">Suivez votre position</h4>
              <p className="text-sm text-gray-600">Consultez votre position et le temps d'attente estimé en temps réel</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary-600 font-bold">4</span>
            </div>
            <div>
              <h4 className="font-medium">Présentez-vous à temps</h4>
              <p className="text-sm text-gray-600">Arrivez à l'agence quand votre tour approche</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QueueStatus
