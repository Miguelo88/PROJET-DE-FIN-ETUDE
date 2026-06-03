import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plane,
  User,
  CreditCard,
  Bell,
  Heart,
  FileText,
  Shield,
  Globe,
  Star,
  ChevronRight,
  Calendar,
  Download,
  Settings,
  Users,
  Wallet,
  AlertCircle,
  X,
} from "lucide-react";
import { Header } from "../composants/shared/Header";
import { Footer } from "../composants/shared/Footer";

export function UserDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("favorites");
  const [savedFlights, setSavedFlights] = useState([]);

  const [showAuthAlert, setShowAuthAlert] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (!user) {
      // alert("Veuillez créer un compte ou vous connectez");
      setShowAuthAlert(true);
      navigate("/");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentUser(JSON.parse(user));

    const favorites = localStorage.getItem("favoriteFlights");
    if (favorites) {
      setSavedFlights(JSON.parse(favorites));
    }
  }, [navigate]);

  const removeFavorite = (flightId) => {
    const updatedFlights = savedFlights.filter((f) => f.id !== flightId);
    setSavedFlights(updatedFlights);
    localStorage.setItem("favoriteFlights", JSON.stringify(updatedFlights));
  };

  const tabs = [
    { id: "trips", label: "Mes voyages", icon: Plane },
    { id: "profile", label: "Profil & Documents", icon: User },
    { id: "loyalty", label: "Fidélité", icon: Star },
    { id: "favorites", label: "Favoris & Alertes", icon: Heart },
    { id: "payment", label: "Paiement", icon: CreditCard },
    { id: "settings", label: "Paramètres", icon: Settings },
  ];

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      {showAuthAlert && (
        <div className="fixed top-4 right-4 bg-yellow-100 text-yellow-800 px-4 py-3 rounded-lg shadow-md z-50">
          Veuillez créer un compte ou vous connecter
        </div>
      )}

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mon espace personnel
          </h1>
          <p className="text-gray-600">Bienvenue, {currentUser.name}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <nav className="bg-white rounded-lg shadow-sm p-2 sticky top-24">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-1 ${
                      activeTab === tab.id
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="lg:col-span-3">
            {activeTab === "trips" && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                      Réservations à venir
                    </h2>
                    <button className="text-sm text-blue-600 hover:text-blue-700">
                      Voir tout
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Plane className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              Paris → New York
                            </p>
                            <p className="text-sm text-gray-500">
                              Code: ABC123456
                            </p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                          Confirmé
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-gray-500">Départ</p>
                          <p className="text-sm font-medium">
                            15 juin 2026, 14:30
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Retour</p>
                          <p className="text-sm font-medium">
                            22 juin 2026, 18:45
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors">
                          Modifier
                        </button>
                        <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors">
                          Voir détails
                        </button>
                      </div>
                    </div>

                    <div className="text-center py-8 text-gray-500">
                      <Plane className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Aucune autre réservation à venir</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Historique des voyages
                  </h2>
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium">
                              Paris → Londres
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(2026, 0, i * 10).toLocaleDateString(
                                "fr-FR",
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="p-2 hover:bg-gray-100 rounded-lg">
                            <Download className="w-4 h-4 text-gray-600" />
                          </button>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Factures et reçus
                  </h2>
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium">
                              Facture #{1000 + i}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(2026, 0, i * 10).toLocaleDateString(
                                "fr-FR",
                              )}
                            </p>
                          </div>
                        </div>
                        <button className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Download className="w-4 h-4" />
                          Télécharger
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "profile" && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Informations personnelles
                  </h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Prénom
                        </label>
                        <input
                          type="text"
                          defaultValue={currentUser.name.split(" ")[0]}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nom
                        </label>
                        <input
                          type="text"
                          defaultValue={currentUser.name.split(" ")[1] || ""}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        defaultValue={currentUser.email}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date de naissance
                        </label>
                        <input
                          type="date"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Téléphone
                        </label>
                        <input
                          type="tel"
                          placeholder="+33 6 12 34 56 78"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Enregistrer les modifications
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                      Passeports et visas
                    </h2>
                    <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                      Ajouter un document
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Globe className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="font-medium">Passeport français</p>
                            <p className="text-sm text-gray-500">
                              N° 12AB34567
                            </p>
                            <p className="text-xs text-gray-500">
                              Expire le 15/03/2030
                            </p>
                          </div>
                        </div>
                        <button className="text-blue-600 hover:text-blue-700">
                          Modifier
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                      Compagnons de voyage
                    </h2>
                    <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                      Ajouter un compagnon
                    </button>
                  </div>
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Aucun compagnon enregistré</p>
                    <p className="text-sm mt-1">
                      Ajoutez vos proches pour réserver plus rapidement
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "loyalty" && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                      Programmes de fidélité
                    </h2>
                    <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                      Ajouter une carte
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4 bg-gradient-to-r from-blue-50 to-blue-100">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-bold text-gray-900">
                            Air France - Flying Blue
                          </p>
                          <p className="text-sm text-gray-600">N° 123456789</p>
                        </div>
                        <span className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                          Silver
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-blue-600">
                            12,450
                          </p>
                          <p className="text-xs text-gray-600">Miles</p>
                        </div>
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          Voir détails
                        </button>
                      </div>
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Star className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-gray-600 mb-2">
                        Ajoutez vos cartes de fidélité
                      </p>
                      <p className="text-sm text-gray-500">
                        Cumulez automatiquement vos miles et points lors de vos
                        réservations
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "favorites" && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Vols sauvegardés
                  </h2>

                  {savedFlights.length > 0 ? (
                    <div className="space-y-4">
                      {savedFlights.map((flight) => (
                        <div
                          key={flight.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Plane className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {flight.from} → {flight.to}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {flight.airline}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-blue-600">
                                {flight.price} €
                              </p>
                              <button
                                onClick={() => removeFavorite(flight.id)}
                                className="text-sm text-red-600 hover:text-red-700"
                              >
                                Retirer
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <p className="text-xs text-gray-500">Départ</p>
                              <p className="text-sm font-medium">
                                {new Date(
                                  flight.departureDate,
                                ).toLocaleDateString("fr-FR")}
                              </p>
                            </div>
                            {flight.returnDate && (
                              <div>
                                <p className="text-xs text-gray-500">Retour</p>
                                <p className="text-sm font-medium">
                                  {new Date(
                                    flight.returnDate,
                                  ).toLocaleDateString("fr-FR")}
                                </p>
                              </div>
                            )}
                          </div>

                          <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors">
                            Réserver maintenant
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Heart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Aucun vol sauvegardé</p>
                      <p className="text-sm mt-1">
                        Utilisez le bouton favoris sur les vols pour les
                        retrouver ici
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                      Alertes de prix
                    </h2>
                    <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                      Créer une alerte
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Bell className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="font-medium">Paris → Tokyo</p>
                            <p className="text-sm text-gray-500">
                              Départ flexible en juillet 2026
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Prix cible: moins de 600 €
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                            Active
                          </span>
                          <button className="text-gray-400 hover:text-gray-600">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-gray-600 mb-2">
                        Créez des alertes de prix
                      </p>
                      <p className="text-sm text-gray-500">
                        Recevez une notification quand le prix baisse sur vos
                        itinéraires préférés
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "payment" && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                      Cartes enregistrées
                    </h2>
                    <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                      Ajouter une carte
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center">
                            <CreditCard className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-medium">•••• •••• •••• 1234</p>
                            <p className="text-sm text-gray-500">
                              Expire 12/2028
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                            Principale
                          </span>
                          <button className="text-blue-600 hover:text-blue-700 text-sm">
                            Modifier
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Crédits de voyage
                  </h2>

                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Solde disponible
                        </p>
                        <p className="text-3xl font-bold text-green-700">0 €</p>
                      </div>
                      <Wallet className="w-12 h-12 text-green-600 opacity-50" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-center py-6 text-gray-500">
                      <p>Aucun crédit disponible</p>
                      <p className="text-sm mt-1">
                        Les remboursements et bons d'achat apparaîtront ici
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Sécurité
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-medium">Mot de passe</p>
                          <p className="text-sm text-gray-500">
                            Dernière modification il y a 3 mois
                          </p>
                        </div>
                      </div>
                      <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        Modifier
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-medium">
                            Authentification à deux facteurs
                          </p>
                          <p className="text-sm text-gray-500">
                            Protection supplémentaire pour votre compte
                          </p>
                        </div>
                      </div>
                      <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                        Activer
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Préférences de notification
                  </h2>
                  <div className="space-y-4">
                    {[
                      {
                        title: "Newsletters",
                        description:
                          "Recevez nos dernières offres et actualités",
                      },
                      {
                        title: "Alertes de prix",
                        description:
                          "Notifications quand le prix baisse sur vos favoris",
                      },
                      {
                        title: "Rappels de voyage",
                        description:
                          "Informations importantes sur vos réservations",
                      },
                      {
                        title: "Offres flash",
                        description: "Promotions limitées dans le temps",
                      },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-gray-500">
                            {item.description}
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            defaultChecked={i < 2}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-red-200">
                  <h2 className="text-xl font-bold text-red-600 mb-4">
                    Zone de danger
                  </h2>
                  <div className="space-y-3">
                    <button className="w-full px-4 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-left">
                      Supprimer mon compte
                    </button>
                    <p className="text-sm text-gray-500">
                      Cette action est irréversible. Toutes vos données seront
                      définitivement supprimées.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
