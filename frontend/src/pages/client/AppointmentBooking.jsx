import { useState, useEffect } from 'react'
import axios from 'axios'
import { Calendar, Clock, MapPin, Building2, CheckCircle, AlertCircle, QrCode } from 'lucide-react'

const AppointmentBooking = () => {
  const [agencies, setAgencies] = useState([])
  const [appointments, setAppointments] = useState([])
  const [selectedAgency, setSelectedAgency] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [qrCode, setQrCode] = useState(null)
  const [queueNumber, setQueueNumber] = useState(null)

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30'
  ]

  useEffect(() => {
    fetchAgencies()
    fetchAppointments()
  }, [])

  const fetchAgencies = async () => {
    try {
      const response = await axios.get('/api/agencies')
      setAgencies(response.data)
    } catch (error) {
      console.error('Failed to fetch agencies:', error)
    }
  }

  const fetchAppointments = async () => {
    try {
      const response = await axios.get('/api/appointments')
      setAppointments(response.data)
    } catch (error) {
      console.error('Failed to fetch appointments:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await axios.post('/api/appointments', {
        agency_id: selectedAgency,
        appointment_date: selectedDate,
        appointment_time: selectedTime
      })

      setQrCode(response.data.qrCode)
      setQueueNumber(response.data.queueNumber)
      setSuccess(true)
      fetchAppointments()
    } catch (error) {
      setError(error.response?.data?.error || 'Erreur lors de la réservation')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (appointmentId) => {
    try {
      await axios.patch(`/api/appointments/${appointmentId}/cancel`)
      fetchAppointments()
    } catch (error) {
      setError('Erreur lors de l\'annulation')
    }
  }

  const getMinDate = () => {
    const today = new Date()
    today.setDate(today.getDate() + 1)
    return today.toISOString().split('T')[0]
  }

  const getMaxDate = () => {
    const maxDate = new Date()
    maxDate.setDate(maxDate.getDate() + 30)
    return maxDate.toISOString().split('T')[0]
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Rendez-vous</h1>
        <p className="text-gray-600">Réservez votre créneau en agence pour finaliser l'ouverture de compte</p>
      </div>

      {success && (
        <div className="mb-6 p-6 bg-green-50 border border-green-200 rounded-lg text-center">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-green-900 mb-2">Rendez-vous confirmé !</h2>
          <p className="text-green-800 mb-4">
            Votre numéro de file : <span className="font-bold text-2xl">{queueNumber}</span>
          </p>
          {qrCode && (
            <div className="inline-block p-4 bg-white rounded-lg">
              <img src={qrCode} alt="QR Code" className="w-48 h-48" />
            </div>
          )}
          <p className="text-sm text-green-700 mt-4">
            Présentez ce QR code à l'agence le jour du rendez-vous
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="mt-4 btn-primary"
          >
            Réserver un autre rendez-vous
          </button>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      {/* Existing Appointments */}
      {appointments.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Vos rendez-vous</h2>
          <div className="space-y-4">
            {appointments.map((apt) => (
              <div key={apt.id} className="card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{apt.agency_name}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(apt.appointment_date).toLocaleDateString('fr-FR')} à {apt.appointment_time}
                      </p>
                      <p className="text-sm text-gray-600">
                        {apt.address}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`status-badge ${
                      apt.status === 'confirmed' ? 'status-valide' :
                      apt.status === 'completed' ? 'status-verification_en_cours' :
                      apt.status === 'cancelled' ? 'status-rejete' :
                      'status-en_attente'
                    }`}>
                      {apt.status === 'confirmed' ? 'Confirmé' :
                       apt.status === 'completed' ? 'Terminé' :
                       apt.status === 'cancelled' ? 'Annulé' :
                       apt.status}
                    </span>
                    {apt.status === 'confirmed' && (
                      <button
                        onClick={() => handleCancel(apt.id)}
                        className="mt-2 text-sm text-red-600 hover:text-red-700"
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Booking Form */}
      {!success && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-primary-600" />
            Réserver un nouveau rendez-vous
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Agence *
              </label>
              <select
                value={selectedAgency}
                onChange={(e) => setSelectedAgency(e.target.value)}
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
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={getMinDate()}
                  max={getMaxDate()}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heure *
                </label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="">Sélectionner une heure</option>
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? 'Réservation...' : 'Réserver'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default AppointmentBooking
