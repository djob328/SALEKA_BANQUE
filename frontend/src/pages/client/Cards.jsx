import React, { useState, useEffect } from 'react';
import { CreditCard, Lock, Unlock, Key, Plus, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

const Cards = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPinModal, setShowPinModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/cards', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCards(response.data.cards || []);
    } catch (error) {
      console.error('Error fetching cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockCard = async (cardId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir bloquer cette carte ?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/cards/${cardId}/block`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Carte bloquée avec succès');
      fetchCards();
    } catch (error) {
      console.error('Error blocking card:', error);
      alert('Erreur lors du blocage de la carte');
    }
  };

  const handleUnblockCard = async (cardId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/cards/${cardId}/unblock`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Carte débloquée avec succès');
      fetchCards();
    } catch (error) {
      console.error('Error unblocking card:', error);
      alert('Erreur lors du déblocage de la carte');
    }
  };

  const handlePinChange = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/cards/${selectedCard.id}/pin`,
        { oldPin, newPin },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('PIN modifié avec succès');
      setShowPinModal(false);
      setOldPin('');
      setNewPin('');
    } catch (error) {
      console.error('Error changing PIN:', error);
      alert('Erreur lors de la modification du PIN');
    }
  };

  const openPinModal = (card) => {
    setSelectedCard(card);
    setShowPinModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Mes Cartes</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Commander une carte
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((card) => (
          <div key={card.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white mb-4">
              <div className="flex justify-between items-start mb-8">
                <span className="text-sm opacity-80">{card.cardType}</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  card.status === 'active' ? 'bg-green-500' : 
                  card.status === 'blocked' ? 'bg-red-500' : 'bg-yellow-500'
                }`}>
                  {card.status}
                </span>
              </div>
              <p className="text-xl tracking-widest mb-4">{card.cardNumber}</p>
              <div className="flex justify-between text-sm opacity-80">
                <span>Exp: {card.expiryDate}</span>
              </div>
            </div>

            <div className="flex gap-2">
              {card.status === 'active' ? (
                <>
                  <button
                    onClick={() => handleBlockCard(card.id)}
                    className="flex-1 bg-red-100 text-red-700 py-2 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    Bloquer
                  </button>
                  <button
                    onClick={() => openPinModal(card)}
                    className="flex-1 bg-blue-100 text-blue-700 py-2 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <Key className="w-4 h-4" />
                    Changer PIN
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleUnblockCard(card.id)}
                  className="flex-1 bg-green-100 text-green-700 py-2 rounded-lg hover:bg-green-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Unlock className="w-4 h-4" />
                  Débloquer
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* PIN Change Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Changer le code PIN</h3>
            <form onSubmit={handlePinChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ancien PIN
                </label>
                <input
                  type="password"
                  value={oldPin}
                  onChange={(e) => setOldPin(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength="4"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nouveau PIN
                </label>
                <input
                  type="password"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength="4"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Confirmer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cards;
