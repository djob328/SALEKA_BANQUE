import { useState, useEffect } from 'react'
import axios from 'axios'
import { Building2, MapPin, Phone, Mail, Plus, Edit, Trash2, Clock } from 'lucide-react'

const AgencyManagement = () => {
  const [agencies, setAgencies] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAgency, setEditingAgency] = useState(null)

  useEffect(() => {
    fetchAgencies()
  }, [])

  const fetchAgencies = async () => {
    try {
      const response = await axios.get('/api/agencies')
      setAgencies(response.data)
    } catch (error) {
      console.error('Failed to fetch agencies:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (agencyId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette agence ?')) {
      try {
        await axios.delete(`/api/agencies/${agencyId}`)
        fetchAgencies()
      } catch (error) {
        console.error('Failed to delete agency:', error)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des agences</h1>
          <p className="text-gray-600">Gérez toutes les agences bancaires</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nouvelle agence
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agencies.map((agency) => (
            <div key={agency.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-primary-600" />
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                    <Edit className="h-4 w-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(agency.id)}
                    className="p-2 hover:bg-red-100 rounded-lg transition"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
                </div>
              </div>

              <h3 className="font-semibold mb-2">{agency.name}</h3>

              <div className="space-y-2 text-sm">
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">{agency.address}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-600 flex-shrink-0" />
                  <span className="text-gray-600">{agency.phone}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-600 flex-shrink-0" />
                  <span className="text-gray-600">{agency.email}</span>
                </div>

                {agency.opening_hours && (
                  <div className="flex items-start space-x-2">
                    <Clock className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
                    <div className="text-gray-600">
                      <p>Lundi - Vendredi: {agency.opening_hours.lundi}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t">
                <span className={`status-badge ${agency.is_active ? 'status-valide' : 'status-rejete'}`}>
                  {agency.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingAgency ? 'Modifier l\'agence' : 'Nouvelle agence'}
              </h2>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l'agence
                  </label>
                  <input type="text" className="input-field" placeholder="Agence Centre" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse
                  </label>
                  <textarea className="input-field" rows={2} placeholder="Adresse complète" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Latitude
                    </label>
                    <input type="number" step="any" className="input-field" placeholder="4.0483" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Longitude
                    </label>
                    <input type="number" step="any" className="input-field" placeholder="9.7043" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone
                    </label>
                    <input type="tel" className="input-field" placeholder="+237 233 42 33 33" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input type="email" className="input-field" placeholder="agence@banque.cm" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacité maximale quotidienne
                  </label>
                  <input type="number" className="input-field" placeholder="50" />
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-secondary"
                  >
                    Annuler
                  </button>
                  <button type="submit" className="btn-primary">
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AgencyManagement
