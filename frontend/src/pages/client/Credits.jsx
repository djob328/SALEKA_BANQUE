import React, { useState } from 'react';
import { Calculator, FileText, TrendingUp, CheckCircle } from 'lucide-react';

const Credits = () => {
  const [activeTab, setActiveTab] = useState('simulation');
  const [simulationData, setSimulationData] = useState({
    amount: '',
    duration: '',
    interestRate: ''
  });
  const [simulationResult, setSimulationResult] = useState(null);

  const handleSimulation = (e) => {
    e.preventDefault();
    // Simulation logic
    const amount = parseFloat(simulationData.amount);
    const duration = parseInt(simulationData.duration);
    const rate = parseFloat(simulationData.interestRate);

    if (amount && duration && rate) {
      const monthlyRate = (rate / 100) / 12;
      const monthlyPayment = amount * (monthlyRate * Math.pow(1 + monthlyRate, duration)) / 
                            (Math.pow(1 + monthlyRate, duration) - 1);
      const totalCost = monthlyPayment * duration;
      const totalInterest = totalCost - amount;

      setSimulationResult({
        amount,
        duration,
        interestRate: rate,
        monthlyPayment: monthlyPayment.toFixed(2),
        totalCost: totalCost.toFixed(2),
        totalInterest: totalInterest.toFixed(2)
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Crédits</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('simulation')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'simulation'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Calculator className="w-4 h-4 inline mr-2" />
          Simulation
        </button>
        <button
          onClick={() => setActiveTab('application')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'application'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          Demande
        </button>
        <button
          onClick={() => setActiveTab('status')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'status'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <CheckCircle className="w-4 h-4 inline mr-2" />
          Suivi
        </button>
      </div>

      {/* Simulation */}
      {activeTab === 'simulation' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Simuler un crédit</h2>
            <form onSubmit={handleSimulation} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant (FCFA)
                </label>
                <input
                  type="number"
                  value={simulationData.amount}
                  onChange={(e) => setSimulationData({ ...simulationData, amount: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: 500000"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durée (mois)
                </label>
                <input
                  type="number"
                  value={simulationData.duration}
                  onChange={(e) => setSimulationData({ ...simulationData, duration: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: 24"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Taux d'intérêt annuel (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={simulationData.interestRate}
                  onChange={(e) => setSimulationData({ ...simulationData, interestRate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: 8.5"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Simuler
              </button>
            </form>
          </div>

          {simulationResult && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Résultat de la simulation
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between p-4 bg-blue-50 rounded-lg">
                  <span className="text-gray-600">Montant du crédit</span>
                  <span className="font-semibold text-gray-900">
                    {parseInt(simulationResult.amount).toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
                <div className="flex justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Durée</span>
                  <span className="font-semibold text-gray-900">{simulationResult.duration} mois</span>
                </div>
                <div className="flex justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Taux d'intérêt</span>
                  <span className="font-semibold text-gray-900">{simulationResult.interestRate}%</span>
                </div>
                <div className="flex justify-between p-4 bg-green-50 rounded-lg">
                  <span className="text-gray-600">Mensualité</span>
                  <span className="font-semibold text-green-700">
                    {parseInt(simulationResult.monthlyPayment).toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
                <div className="flex justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Coût total</span>
                  <span className="font-semibold text-gray-900">
                    {parseInt(simulationResult.totalCost).toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
                <div className="flex justify-between p-4 bg-red-50 rounded-lg">
                  <span className="text-gray-600">Intérêts totaux</span>
                  <span className="font-semibold text-red-700">
                    {parseInt(simulationResult.totalInterest).toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              </div>
              <button className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium">
                Déposer une demande
              </button>
            </div>
          )}
        </div>
      )}

      {/* Application */}
      {activeTab === 'application' && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Déposer une demande de crédit</h2>
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant souhaité (FCFA)
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durée souhaitée (mois)
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Revenu mensuel (FCFA)
              </label>
              <input
                type="number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dépenses mensuelles (FCFA)
              </label>
              <input
                type="number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motif du crédit
              </label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Soumettre la demande
            </button>
          </form>
        </div>
      )}

      {/* Status */}
      {activeTab === 'status' && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Suivi de mes demandes</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Crédit personnel</p>
                <p className="text-sm text-gray-500">500 000 FCFA - 24 mois</p>
              </div>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                En cours
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Credits;
