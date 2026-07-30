import React, { useState } from 'react';
import { Smartphone, ArrowUp, ArrowDown, Receipt, RefreshCw } from 'lucide-react';
import axios from 'axios';

const MobileMoney = () => {
  const [activeTab, setActiveTab] = useState('topup');
  const [formData, setFormData] = useState({
    amount: '',
    phoneNumber: '',
    provider: 'mtn_momo'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const endpoint = activeTab === 'topup' 
        ? '/api/transactions/mobile-money/topup'
        : '/api/transactions/mobile-money/withdrawal';
      
      const response = await axios.post(endpoint, formData);
      setMessage({
        type: 'success',
        text: response.data.message
      });
      setFormData({ amount: '', phoneNumber: '', provider: formData.provider });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Erreur lors de la transaction'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Mobile Money</h1>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('topup')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'topup'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <ArrowDown className="w-4 h-4 inline mr-2" />
          Alimenter Compte
        </button>
        <button
          onClick={() => setActiveTab('withdrawal')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'withdrawal'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <ArrowUp className="w-4 h-4 inline mr-2" />
          Retrait vers Mobile Money
        </button>
        <button
          onClick={() => setActiveTab('bills')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'bills'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Receipt className="w-4 h-4 inline mr-2" />
          Paiement Factures
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'history'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <RefreshCw className="w-4 h-4 inline mr-2" />
          Historique
        </button>
      </div>

      {/* Topup Form */}
      {activeTab === 'topup' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              Alimenter votre compte bancaire
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Opérateur Mobile Money
                </label>
                <select
                  name="provider"
                  value={formData.provider}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="mtn_momo">MTN Mobile Money</option>
                  <option value="orange_money">Orange Money</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro de téléphone
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: 237 6XX XXX XXX"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant (FCFA)
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: 50000"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Traitement en cours...' : 'Alimenter le compte'}
              </button>
            </form>
          </div>

          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-sm p-6 text-white">
            <h3 className="text-lg font-semibold mb-4">Informations</h3>
            <div className="space-y-4">
              <div className="bg-white/20 rounded-lg p-4">
                <p className="font-medium">MTN Mobile Money</p>
                <p className="text-sm opacity-90">Minimum: 100 FCFA</p>
                <p className="text-sm opacity-90">Maximum: 500 000 FCFA</p>
              </div>
              <div className="bg-white/20 rounded-lg p-4">
                <p className="font-medium">Orange Money</p>
                <p className="text-sm opacity-90">Minimum: 100 FCFA</p>
                <p className="text-sm opacity-90">Maximum: 500 000 FCFA</p>
              </div>
              <p className="text-sm opacity-90">
                Les fonds sont transférés instantanément vers votre compte bancaire.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal */}
      {activeTab === 'withdrawal' && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Retrait vers Mobile Money
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Opérateur Mobile Money
              </label>
              <select
                name="provider"
                value={formData.provider}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="mtn_momo">MTN Mobile Money</option>
                <option value="orange_money">Orange Money</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de téléphone
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: 237 6XX XXX XXX"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Montant (FCFA)
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: 50000"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Traitement en cours...' : 'Effectuer le retrait'}
            </button>
          </form>
        </div>
      )}

      {/* Bills */}
      {activeTab === 'bills' && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Paiement de factures
          </h2>
          <form className="space-y-6 max-w-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de facture
              </label>
              <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Électricité - Eneo</option>
                <option>Eau - Camwater</option>
                <option>Internet - Camtel</option>
                <option>Téléphonie - Orange/MTN</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Référence de facture
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Numéro de facture"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Montant (FCFA)
              </label>
              <input
                type="number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Montant à payer"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Payer la facture
            </button>
          </form>
        </div>
      )}

      {/* History */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Historique des transactions Mobile Money
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Smartphone className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Alimentation MTN MoMo</p>
                  <p className="text-sm text-gray-500">01/06/2026 - 14:30</p>
                </div>
              </div>
              <p className="font-semibold text-green-600">+50 000 FCFA</p>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Smartphone className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Retrait Orange Money</p>
                  <p className="text-sm text-gray-500">31/05/2026 - 10:15</p>
                </div>
              </div>
              <p className="font-semibold text-red-600">-20 000 FCFA</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileMoney;
