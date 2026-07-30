import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import axios from 'axios'
import { Wallet, Calendar, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'

const Account = () => {
  const { user } = useAuth()
  const [account, setAccount] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAccount()
  }, [])

  const fetchAccount = async () => {
    try {
      const response = await axios.get('/api/accounts')
      setAccount(response.data)
    } catch (error) {
      console.error('Failed to fetch account:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!account) {
    return (
      <div className="space-y-6 pb-8">
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-2xl p-6 sm:p-8 shadow-xl">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Mon compte</h1>
          <p className="text-primary-100 text-sm sm:text-base">Gérez votre compte bancaire</p>
        </div>

        <div className="card text-center py-12">
          <Wallet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun compte trouvé</h3>
          <p className="text-gray-600 mb-6">Vous n'avez pas encore de compte bancaire</p>
          <button
            onClick={async () => {
              try {
                await axios.post('/api/accounts/create')
                fetchAccount()
              } catch (error) {
                console.error('Failed to create account:', error)
              }
            }}
            className="btn-primary"
          >
            Créer un compte
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-2xl p-6 sm:p-8 shadow-xl">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Mon compte</h1>
        <p className="text-primary-100 text-sm sm:text-base">Consultez votre solde et vos informations</p>
      </div>

      <div className="card">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white mb-6 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-blue-100 text-sm mb-1">Numéro de compte</p>
              <p className="text-2xl font-bold tracking-wider">{account.account_number}</p>
            </div>
            <Wallet className="h-12 w-12 text-white/80" />
          </div>
          
          <div className="border-t border-white/20 pt-4 mt-4">
            <p className="text-blue-100 text-sm mb-1">Solde actuel</p>
            <p className="text-4xl font-bold">{parseFloat(account.balance).toLocaleString('fr-FR')} FCFA</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center mb-2">
              <Calendar className="h-5 w-5 text-gray-600 mr-2" />
              <span className="text-sm text-gray-600">Date de création</span>
            </div>
            <p className="font-medium">
              {new Date(account.created_at).toLocaleDateString('fr-FR')}
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center mb-2">
              <Wallet className="h-5 w-5 text-gray-600 mr-2" />
              <span className="text-sm text-gray-600">Type de compte</span>
            </div>
            <p className="font-medium capitalize">
              {account.account_type === 'courant' ? 'Compte courant' : 'Compte épargne'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Account
