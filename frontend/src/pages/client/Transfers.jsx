import React, { useState } from 'react';
import { Send, Calendar, UserPlus, Clock } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../config/api';

const Transfers = () => {
  const [activeTab, setActiveTab] = useState('immediate');
  const [transferMethod, setTransferMethod] = useState('account'); // 'account', 'mobile_money', 'orange_money'
  const [formData, setFormData] = useState({
    amount: '',
    beneficiaryAccount: '',
    phoneNumber: '',
    description: ''
  });
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(false);

  console.log('[Transfers] Component mounted');

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    console.log('[Transfers] Transfer attempt, API_URL:', API_URL);
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/transfers`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.requiresOTP) {
        alert('Un code OTP a été envoyé. Veuillez le saisir pour confirmer.');
      }
    } catch (error) {
      console.error('Transfer error:', error);
      alert('Erreur lors du virement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Virements</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('immediate')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'immediate'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Send className="w-4 h-4 inline mr-2" />
          Immédiat
        </button>
        <button
          onClick={() => setActiveTab('scheduled')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'scheduled'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Calendar className="w-4 h-4 inline mr-2" />
          Programmé
        </button>
        <button
          onClick={() => setActiveTab('beneficiaries')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'beneficiaries'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <UserPlus className="w-4 h-4 inline mr-2" />
          Bénéficiaires
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'history'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Clock className="w-4 h-4 inline mr-2" />
          Historique
        </button>
      </div>

      {/* Immediate Transfer Form */}
      {activeTab === 'immediate' && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Effectuer un virement</h2>
          
          {/* Transfer Method Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Méthode de transfert
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Account Transfer */}
              <button
                type="button"
                onClick={() => setTransferMethod('account')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  transferMethod === 'account'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <Send className="h-6 w-6 text-white" />
                  </div>
                  <span className="font-medium text-sm">Compte bancaire</span>
                </div>
              </button>

              {/* Mobile Money */}
              <button
                type="button"
                onClick={() => setTransferMethod('mobile_money')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  transferMethod === 'mobile_money'
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <img src="/transfert/mo.webp" alt="Mobile Money" className="w-12 h-12 object-contain" />
                  <span className="font-medium text-sm">MTN Mobile Money</span>
                </div>
              </button>

              {/* Orange Money */}
              <button
                type="button"
                onClick={() => setTransferMethod('orange_money')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  transferMethod === 'orange_money'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <img src="/transfert/om.webp" alt="Orange Money" className="w-12 h-12 object-contain" />
                  <span className="font-medium text-sm">Orange Money</span>
                </div>
              </button>
            </div>
          </div>

          <form onSubmit={handleTransfer} className="space-y-6">
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

            {/* Account Number for Bank Transfer */}
            {transferMethod === 'account' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro de compte du bénéficiaire
                </label>
                <input
                  type="text"
                  name="beneficiaryAccount"
                  value={formData.beneficiaryAccount}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: SALEKABANQUE123456"
                  required
                />
              </div>
            )}

            {/* Phone Number for Mobile Money */}
            {(transferMethod === 'mobile_money' || transferMethod === 'orange_money') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro de téléphone du bénéficiaire
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: 2376595294719"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (optionnel)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                placeholder="Description du virement"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Traitement en cours...' : 'Effectuer le virement'}
            </button>
          </form>
        </div>
      )}

      {/* Scheduled Transfer */}
      {activeTab === 'scheduled' && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Virement programmé</h2>
          <p className="text-gray-600 mb-4">Planifiez vos virements à l'avance.</p>
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Montant (FCFA)
              </label>
              <input
                type="number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: 50000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date du virement
              </label>
              <input
                type="date"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fréquence
              </label>
              <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Unique</option>
                <option>Hebdomadaire</option>
                <option>Mensuel</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Programmer le virement
            </button>
          </form>
        </div>
      )}

      {/* Beneficiaries */}
      {activeTab === 'beneficiaries' && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Mes Bénéficiaires</h2>
          <button className="mb-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Ajouter un bénéficiaire
          </button>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Marie Dupont</p>
                <p className="text-sm text-gray-500">SALEKABANQUE789012</p>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Favori</span>
            </div>
          </div>
        </div>
      )}

      {/* History */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Historique des virements</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Virement à Marie Dupont</p>
                <p className="text-sm text-gray-500">01/06/2026 - 14:30</p>
              </div>
              <p className="font-semibold text-red-600">-50 000 FCFA</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transfers;
