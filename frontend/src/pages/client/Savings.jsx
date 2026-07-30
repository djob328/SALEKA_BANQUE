import React, { useState, useEffect } from 'react';
import { PiggyBank, Target, Plus, TrendingUp, Calendar } from 'lucide-react';
import axios from 'axios';

const Savings = () => {
  const [activeTab, setActiveTab] = useState('accounts');
  const [savingsAccounts, setSavingsAccounts] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavingsData();
  }, []);

  const fetchSavingsData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [accountsRes, goalsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/savings/accounts', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/savings/goals', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setSavingsAccounts(accountsRes.data.accounts || []);
      setGoals(goalsRes.data.goals || []);
    } catch (error) {
      console.error('Error fetching savings data:', error);
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
        <h1 className="text-2xl font-bold text-gray-900">Épargne</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('accounts')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'accounts'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <PiggyBank className="w-4 h-4 inline mr-2" />
          Comptes Épargne
        </button>
        <button
          onClick={() => setActiveTab('goals')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'goals'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Target className="w-4 h-4 inline mr-2" />
          Objectifs
        </button>
        <button
          onClick={() => setActiveTab('auto-deposit')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'auto-deposit'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <TrendingUp className="w-4 h-4 inline mr-2" />
          Dépôts Auto
        </button>
      </div>

      {/* Savings Accounts */}
      {activeTab === 'accounts' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nouveau compte épargne
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savingsAccounts.map((account) => (
              <div key={account.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <PiggyBank className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-sm text-gray-500">{account.type}</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {account.balance.toLocaleString('fr-FR')} FCFA
                </p>
                <p className="text-sm text-gray-500 mt-1">{account.accountNumber}</p>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600">
                    Taux d'intérêt: <span className="font-semibold">{account.interestRate}%</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Goals */}
      {activeTab === 'goals' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nouvel objectif
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goals.map((goal) => (
              <div key={goal.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">{goal.goalName}</h3>
                  <span className="text-sm text-gray-500">{goal.targetDate}</span>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Progression</span>
                    <span className="font-semibold">{goal.progress.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(goal.progress, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Actuel:</span>
                  <span className="font-semibold">{goal.currentAmount.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">Objectif:</span>
                  <span className="font-semibold">{goal.goalAmount.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">Reste:</span>
                  <span className="font-semibold text-orange-600">{goal.remaining.toLocaleString('fr-FR')} FCFA</span>
                </div>

                <button className="w-full mt-4 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
                  Effectuer un dépôt
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Auto Deposits */}
      {activeTab === 'auto-deposit' && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Dépôts Automatiques
          </h2>
          
          <div className="mb-6">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Configurer un dépôt automatique
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Épargne Projet</p>
                <p className="text-sm text-gray-500">50 000 FCFA - Mensuel - Le 1er de chaque mois</p>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Actif</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Savings;
