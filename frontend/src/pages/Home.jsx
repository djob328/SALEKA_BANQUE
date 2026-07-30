import { Link } from 'react-router-dom'
import { ArrowRight, Shield, Clock, MapPin, Smartphone, CheckCircle } from 'lucide-react'

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Bienvenue chez
              <span className="block bg-gradient-to-r from-blue-200 to-indigo-200 bg-clip-text text-transparent">
                SALEKA BANQUE
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-blue-100 max-w-3xl mx-auto">
              Votre partenaire bancaire de confiance. Inscrivez-vous à notre plateforme digitale et gérez vos finances en toute simplicité
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 inline-flex items-center justify-center">
                Commencer maintenant
                <ArrowRight className="inline ml-2 h-5 w-5" />
              </Link>
              <Link to="/login" className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 inline-flex items-center justify-center">
                Se connecter
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
            Pourquoi choisir SALEKA BANQUE ?
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Une expérience bancaire moderne et sécurisée pour gérer vos finances en toute simplicité
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <Clock className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Gain de temps</h3>
              <p className="text-gray-600 leading-relaxed">
                Inscrivez-vous en ligne et gérez vos comptes sans vous déplacer en agence
              </p>
            </div>

            <div className="text-center">
              <Shield className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Sécurité maximale</h3>
              <p className="text-gray-600 leading-relaxed">
                Protection avancée de vos données et transactions avec chiffrement SSL
              </p>
            </div>

            <div className="text-center">
              <Smartphone className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Application mobile</h3>
              <p className="text-gray-600 leading-relaxed">
                Accédez à vos comptes depuis n'importe où avec notre application responsive
              </p>
            </div>

            <div className="text-center">
              <MapPin className="h-8 w-8 text-orange-600 mx-auto mb-3" />
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Réseau d'agences</h3>
              <p className="text-gray-600 leading-relaxed">
                Des agences proches de chez vous pour un service personnalisé
              </p>
            </div>

            <div className="text-center">
              <CheckCircle className="h-8 w-8 text-cyan-600 mx-auto mb-3" />
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Support 24/24</h3>
              <p className="text-gray-600 leading-relaxed">
                Notre équipe est disponible à tout moment pour vous accompagner
              </p>
            </div>

            <div className="text-center">
              <ArrowRight className="h-8 w-8 text-indigo-600 mx-auto mb-3" />
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Services complets</h3>
              <p className="text-gray-600 leading-relaxed">
                Virements, épargne, crédits et bien plus avec SALEKA BANQUE
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
            Comment rejoindre SALEKA BANQUE ?
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Trois étapes simples pour commencer à gérer vos finances
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl text-white text-3xl font-bold">
                1
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Créez votre compte</h3>
              <p className="text-gray-600">
                Inscrivez-vous gratuitement sur la plateforme SALEKA BANQUE
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl text-white text-3xl font-bold">
                2
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Complétez votre profil</h3>
              <p className="text-gray-600">
                Remplissez vos informations et validez votre identité
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl text-white text-3xl font-bold">
                3
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Accédez à vos services</h3>
              <p className="text-gray-600">
                Profitez de tous nos services bancaires en ligne
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl font-bold mb-4">
            Prêt à rejoindre SALEKA BANQUE ?
          </h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Inscrivez-vous maintenant et découvrez une nouvelle expérience bancaire
          </p>
          <Link to="/register" className="inline-block bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
            Créer mon compte
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home
