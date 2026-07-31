import React, { useState, useEffect } from 'react';
import { Wallet, CreditCard, TrendingUp, FileText } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../../config/api';

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[Accounts] Component mounted');
    fetchAccountData();
  }, []);

  const fetchAccountData = async () => {
    console.log('[Accounts] Fetching account data, API_URL:', API_URL);
    try {
      const token = localStorage.getItem('token');
      console.log('[Accounts] Token found:', !!token);
      const [accountsRes, transactionsRes, cardsRes] = await Promise.all([
        axios.get(`${API_URL}/api/accounts`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/api/transactions?limit=5`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/api/cards`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      console.log('[Accounts] Data fetched successfully:', {
        accounts: accountsRes.data.accounts?.length,
        transactions: transactionsRes.data.transactions?.length,
        cards: cardsRes.data.cards?.length
      });
      setAccounts(accountsRes.data.accounts || []);
      setTransactions(transactionsRes.data.transactions || []);
      setCards(cardsRes.data.cards || []);
    } catch (error) {
      console.error('[Accounts] Error fetching account data:', error);
    } finally {
      setLoading(false);
    }
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
        <h1 className="text-2xl font-bold text-gray-900">Mes Comptes</h1>
      </div>

      {/* Account Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {accounts.map((account) => (
          <div key={account.accountNumber} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Wallet className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm text-gray-500">{account.accountType}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {account.balance.toLocaleString('fr-FR')} {account.currency}
            </p>
            <p className="text-sm text-gray-500 mt-1">{account.accountNumber}</p>
            <p className="text-xs text-gray-400 mt-2">{account.iban}</p>
          </div>
        ))}
      </div>

      {/* Cards Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Mes Cartes
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cards.map((card) => (
            <div key={card.id} className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
              <div className="flex justify-between items-start mb-8">
                <span className="text-sm opacity-80">{card.cardType}</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  card.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {card.status}
                </span>
              </div>
              <p className="text-xl tracking-widest mb-4">{card.cardNumber}</p>
              <div className="flex justify-between text-sm opacity-80">
                <span>Exp: {card.expiryDate}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Transactions Récentes
          </h2>
          <button className="text-blue-600 text-sm hover:underline">Voir tout</button>
        </div>
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${
                  transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {transaction.type === 'credit' ? (
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  ) : (
                    <FileText className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{transaction.description}</p>
                  <p className="text-sm text-gray-500">{transaction.date}</p>
                </div>
              </div>
              <p className={`font-semibold ${
                transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
              }`}>
                {transaction.type === 'credit' ? '+' : '-'}
                {transaction.amount.toLocaleString('fr-FR')} FCFA
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Accounts;
