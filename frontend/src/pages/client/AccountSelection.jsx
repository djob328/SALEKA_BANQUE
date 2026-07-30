import { useState, useEffect } from 'react'
import axios from 'axios'
import { CreditCard, CheckCircle, Info } from 'lucide-react'

const AccountSelection = () => {
  const [accountTypes, setAccountTypes] = useState([])
  const [selectedAccounts, setSelectedAccounts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchAccountTypes()
  }, [])

  const fetchAccountTypes = async () => {
    try {
      const response = await axios.get('/api/admin/account-types')
      setAccountTypes(response.data)
    } catch (error) {
      console.error('Failed to fetch account types:', error)
    }
  }

  const handleToggleAccount = (accountId) => {
    setSelectedAccounts(prev => {
      if (prev.includes(accountId)) {
        return prev.filter(id => id !== accountId)
      } else {
        return [...prev, accountId]
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // API call to save selected account types
      // This would be implemented in the backend
      setSuccess(true)
    } catch (error) {
      setError(error.response?.data?.error || 'Erreur lors de la sélection')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Types de comptes</h1>
        <p className="text-gray-600">Sélectionnez les types de comptes que vous souhaitez ouvrir</p>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
          <span className="text-green-800">Sélection enregistrée avec succès !</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <Info className="h-5 w-5 text-red-600 mr-2" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {accountTypes.map((account) => (
          <div
            key={account.id}
            className={`card cursor-pointer transition-all ${
              selectedAccounts.includes(account.id)
                ? 'ring-2 ring-primary-600 bg-primary-50'
                : 'hover:shadow-lg'
            }`}
            onClick={() => handleToggleAccount(account.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  selectedAccounts.includes(account.id)
                    ? 'bg-primary-600'
                    : 'bg-primary-100'
                }`}>
                  <CreditCard className={`h-6 w-6 ${
                    selectedAccounts.includes(account.id)
                      ? 'text-white'
                      : 'text-primary-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{account.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{account.description}</p>
                  <div className="text-sm">
                    <p className="text-gray-500">
                      Solde minimum: {account.min_balance.toLocaleString()} FCFA
                    </p>
                    <p className="text-gray-500">
                      Frais mensuels: {account.monthly_fee.toLocaleString()} FCFA
                    </p>
                  </div>
                </div>
              </div>
              {selectedAccounts.includes(account.id) && (
                <CheckCircle className="h-6 w-6 text-primary-600" />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="card mb-6">
        <h3 className="font-semibold mb-2 flex items-center">
          <Info className="h-5 w-5 mr-2 text-primary-600" />
          Informations importantes
        </h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Vous pouvez sélectionner plusieurs types de comptes</li>
          <li>• Les frais mensuels s'appliquent pour chaque compte</li>
          <li>• Le solde minimum doit être versé à l'ouverture</li>
          <li>• Certains comptes nécessitent des justificatifs supplémentaires</li>
        </ul>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading || selectedAccounts.length === 0}
        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Enregistrement...' : 'Confirmer la sélection'}
      </button>
    </div>
  )
}

export default AccountSelection
