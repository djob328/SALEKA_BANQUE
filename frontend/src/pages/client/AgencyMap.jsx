import { useState, useEffect } from 'react'
import axios from 'axios'
import { MapPin, Phone, Clock, Navigation, Building2 } from 'lucide-react'

const AgencyMap = () => {
  const [agencies, setAgencies] = useState([])
  const [selectedAgency, setSelectedAgency] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchAgencies()
    getUserLocation()
  }, [])

  const fetchAgencies = async () => {
    try {
      const response = await axios.get('/api/agencies')
      setAgencies(response.data)
    } catch (error) {
      console.error('Failed to fetch agencies:', error)
    }
  }

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.error('Error getting location:', error)
        }
      )
    }
  }

  const getDistance = (agency) => {
    if (!userLocation) return null
    
    const R = 6371 // Earth's radius in km
    const dLat = (agency.latitude - userLocation.lat) * Math.PI / 180
    const dLon = (agency.longitude - userLocation.lng) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(agency.latitude * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    const distance = R * c
    
    return distance.toFixed(1)
  }

  const openInMaps = (agency) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${agency.latitude},${agency.longitude}`
    window.open(url, '_blank')
  }

  const openNearbyAgencies = async () => {
    if (!userLocation) {
      alert('Veuillez activer la géolocalisation')
      return
    }

    setLoading(true)
    try {
      const response = await axios.get(`/api/agencies/nearby/${userLocation.lat}/${userLocation.lng}`)
      setAgencies(response.data)
    } catch (error) {
      console.error('Failed to fetch nearby agencies:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Nos agences</h1>
        <p className="text-gray-600">Trouvez l'agence la plus proche de chez vous</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Agency List */}
        <div className="space-y-4">
          {userLocation && (
            <button
              onClick={openNearbyAgencies}
              disabled={loading}
              className="w-full btn-primary mb-4"
            >
              {loading ? 'Recherche...' : 'Trouver les agences les plus proches'}
            </button>
          )}

          {agencies.map((agency) => {
            const distance = getDistance(agency)
            return (
              <div
                key={agency.id}
                className={`card cursor-pointer transition-all ${
                  selectedAgency?.id === agency.id ? 'ring-2 ring-primary-600' : 'hover:shadow-lg'
                }`}
                onClick={() => setSelectedAgency(agency)}
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{agency.name}</h3>
                    <p className="text-sm text-gray-600 mb-2 flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {agency.address}
                    </p>
                    {distance && (
                      <p className="text-sm text-primary-600 mb-2">
                        {distance} km de votre position
                      </p>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Phone className="h-4 w-4 mr-1" />
                        {agency.phone}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Ouvert
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Agency Details */}
        {selectedAgency && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">{selectedAgency.name}</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-primary-600" />
                  Adresse
                </h3>
                <p className="text-gray-600">{selectedAgency.address}</p>
              </div>

              <div>
                <h3 className="font-medium mb-2 flex items-center">
                  <Phone className="h-5 w-5 mr-2 text-primary-600" />
                  Contact
                </h3>
                <p className="text-gray-600">{selectedAgency.phone}</p>
                <p className="text-gray-600">{selectedAgency.email}</p>
              </div>

              {selectedAgency.opening_hours && (
                <div>
                  <h3 className="font-medium mb-2 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-primary-600" />
                    Horaires d'ouverture
                  </h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    {Object.entries(selectedAgency.opening_hours).map(([day, hours]) => (
                      <div key={day} className="flex justify-between">
                        <span className="capitalize">{day}</span>
                        <span>{hours}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedAgency.services && (
                <div>
                  <h3 className="font-medium mb-2">Services disponibles</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedAgency.services.map((service, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => openInMaps(selectedAgency)}
                className="w-full btn-primary flex items-center justify-center"
              >
                <Navigation className="h-5 w-5 mr-2" />
                Itinéraire
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AgencyMap
