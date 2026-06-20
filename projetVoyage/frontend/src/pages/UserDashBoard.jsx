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
import { getFavorites, toggleFavorite } from "../utils/favoritesStorage";
// Composant principal du tableau de bord utilisateur
export function UserDashboard() {
  const navigate = useNavigate();

  // Utilisateur connecté récupéré depuis localStorage au chargement
  const [currentUser, setCurrentUser] = useState(() => {
    const user = localStorage.getItem("currentUser");
    return user ? JSON.parse(user) : null;
  });

  // Onglet actif dans le dashboard
  const [activeTab, setActiveTab] = useState("favorites");

  // // Vols favoris sauvegardés dans localStorage
  // const [savedFlights, setSavedFlights] = useState(() => {
  //   const favorites = getFavorites();
  //   return favorites;
  // });
  // 1. Initialisez le state avec un tableau vide
  const [savedFlights, setSavedFlights] = useState([]);

  // Données du profil pré-remplies à partir de l'utilisateur connecté
  const [profileData, setProfileData] = useState(() => {
    const user = localStorage.getItem("currentUser");
    const parsed = user ? JSON.parse(user) : null;
    return {
      firstName: parsed?.name?.split(" ")[0] || "",
      lastName: parsed?.name?.split(" ")[1] || "",
      email: parsed?.email || "",
      birthDate: parsed?.birthDate || "",
      phone: parsed?.phone || "",
    };
  });

  // Liste des documents voyage
  const [documents, setDocuments] = useState([
    {
      id: "doc-1",
      type: "Passeport français",
      number: "12AB34567",
      expires: "15/03/2030",
    },
  ]);

  // Compagnons de voyage enregistrés
  const [companions, setCompanions] = useState([]);

  // Cartes de fidélité
  const [loyaltyCards, setLoyaltyCards] = useState([
    {
      id: "card-1",
      label: "Air France - Flying Blue",
      number: "123456789",
      status: "Silver",
      miles: 12450,
    },
  ]);

  // Cartes bancaires enregistrées
  const [paymentCards, setPaymentCards] = useState([
    {
      id: "payment-1",
      label: "•••• •••• •••• 1234",
      expiry: "12/2028",
      primary: true,
    },
  ]);

  // Alertes de prix sur des trajets
  const [priceAlertsData, setPriceAlertsData] = useState([
    {
      id: "alert-1",
      from: "Paris",
      to: "Tokyo",
      description: "Départ flexible en juillet 2026",
      target: "moins de 600 €",
      active: true,
    },
  ]);

  // Préférences de notification utilisateur
  const [notificationSettings, setNotificationSettings] = useState([
    {
      title: "Newsletters",
      description: "Recevez nos dernières offres et actualités",
      enabled: true,
    },
    {
      title: "Alertes de prix",
      description: "Notifications quand le prix baisse sur vos favoris",
      enabled: true,
    },
    {
      title: "Rappels de voyage",
      description: "Informations importantes sur vos réservations",
      enabled: false,
    },
    {
      title: "Offres flash",
      description: "Promotions limitées dans le temps",
      enabled: false,
    },
  ]);

  // État pour activer/désactiver la double authentification
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Message temporaire affiché après une action
  const [successMessage, setSuccessMessage] = useState(null);

  // Crédit voyage disponible
  const [travelCredit, setTravelCredit] = useState(0);

  // Affiche un message temporaire
  const showMessage = (text, type = "success") => {
    setSuccessMessage({ text, type });
    window.setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Crée un fichier texte téléchargeable
  const downloadFile = (filename, content) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Enregistre les modifications du profil
  const handleSaveProfile = () => {
    if (!currentUser) return;

    const updatedUser = {
      ...currentUser,
      name: `${profileData.firstName} ${profileData.lastName}`.trim(),
      email: profileData.email,
    };

    setCurrentUser(updatedUser);
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    showMessage("Profil enregistré avec succès.");
  };

  // Ajoute un document voyage
  const handleAddDocument = () => {
    const newDocument = {
      id: `doc-${documents.length + 1}`,
      type: "Visa Schengen",
      number: `VISA-${1000 + documents.length}`,
      expires: "15/12/2028",
    };
    setDocuments([...documents, newDocument]);
    showMessage("Document ajouté.");
  };

  // Ajoute un compagnon de voyage
  const handleAddCompanion = () => {
    const newCompanion = {
      id: `comp-${companions.length + 1}`,
      name: `Compagnon ${companions.length + 1}`,
    };
    setCompanions([...companions, newCompanion]);
    showMessage("Compagnon de voyage ajouté.");
  };

  // Ajoute une carte de fidélité
  const handleAddLoyaltyCard = () => {
    const newCard = {
      id: `card-${loyaltyCards.length + 1}`,
      label: `Programme ${loyaltyCards.length + 1}`,
      number: `00000${loyaltyCards.length + 1}`,
      status: "Bronze",
      miles: 0,
    };
    setLoyaltyCards([...loyaltyCards, newCard]);
    showMessage("Programme de fidélité ajouté.");
  };

  // Crée une nouvelle alerte de prix
  const handleCreatePriceAlert = () => {
    const newAlert = {
      id: `alert-${priceAlertsData.length + 1}`,
      from: "Paris",
      to: "New York",
      description: "Départ flexible le mois prochain",
      target: "moins de 700 €",
      active: true,
    };
    setPriceAlertsData([...priceAlertsData, newAlert]);
    showMessage("Alerte de prix créée.");
  };

  // Supprime une alerte de prix
  const handleRemovePriceAlert = (alertId) => {
    setPriceAlertsData((prev) => prev.filter((alert) => alert.id !== alertId));
    showMessage("Alerte de prix supprimée.");
  };

  // Active ou désactive une notification
  const handleToggleNotification = (index) => {
    setNotificationSettings((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, enabled: !item.enabled } : item,
      ),
    );
    showMessage("Préférence de notification mise à jour.");
  };

  // Télécharge une facture au format texte
  const handleDownloadInvoice = (invoiceId) => {
    downloadFile(
      `facture-${invoiceId}.txt`,
      `Facture ${invoiceId}\nMerci pour votre achat.`,
    );
    showMessage("Facture téléchargée.");
  };

  // Télécharge un document voyage
  const handleDownloadDocument = (doc) => {
    downloadFile(
      `${doc.type}-${doc.number}.txt`,
      `Document: ${doc.type}\nN° ${doc.number}\nExpire le ${doc.expires}`,
    );
    showMessage("Document téléchargé.");
  };

  // Lance une réservation
  const handleBookNow = (flight) => {
    showMessage(`Réservation en cours pour ${flight.from} → ${flight.to}`);
    navigate("/");
  };

  // Affiche les détails d’une réservation
  const handleViewReservationDetails = (label) => {
    showMessage(`Affichage des détails : ${label}`);
  };

  // Prépare la modification d’une réservation
  const handleEditReservation = (label) => {
    showMessage(`Modification de la réservation : ${label}`);
  };

  // Ouvre la page de changement de mot de passe
  const handleModifyPassword = () => {
    showMessage("Page de modification de mot de passe ouverte.");
  };

  // Active / désactive l’authentification à deux facteurs
  const handleToggleTwoFactor = () => {
    setTwoFactorEnabled((prev) => {
      const nextValue = !prev;
      showMessage(
        `Authentification à deux facteurs ${nextValue ? "activée" : "désactivée"}.`,
      );
      return nextValue;
    });
  };

  // Supprime le compte utilisateur et efface les données locales
  const handleDeleteAccount = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("favoriteFlights");
    setCurrentUser(null);
    setSavedFlights([]);
    navigate("/");
    showMessage("Compte supprimé avec succès.");
  };

  // Ajoute une carte bancaire
  const handleAddPaymentCard = () => {
    const newPaymentCard = {
      id: `payment-${paymentCards.length + 1}`,
      label: `•••• •••• •••• ${1234 + paymentCards.length}`,
      expiry: "01/2030",
      primary: false,
    };
    setPaymentCards([...paymentCards, newPaymentCard]);
    showMessage("Nouvelle carte ajoutée.");
  };

  // Modifie une carte bancaire
  const handleEditPaymentCard = () => {
    showMessage("Informations de paiement mises à jour.");
  };

  // Ajoute du crédit voyage
  const handleApplyCredit = () => {
    setTravelCredit((prev) => prev + 50);
    showMessage("Crédit de voyage appliqué.");
  };
 
  // Affiche toutes les réservations
  const handleViewAllTrips = () => {
   showMessage("Affichage de toutes les réservations.");
  };

  // // Si l’utilisateur n’est pas connecté, retour à l’accueil
  // useEffect(() => {
  //   if (!currentUser) {
  //     navigate("/");
  //   }
  // }, [currentUser, navigate]);

  // // Supprime un vol des favoris
  // const removeFavorite = (flightId) => {
  //   const updatedFlights = savedFlights.filter((f) => f.id !== flightId);
  //   setSavedFlights(updatedFlights);
  //   localStorage.setItem("favoriteFlights", JSON.stringify(updatedFlights));

  //   // ajout pour le bouton favoris
  //   const favorites = getFavorites();
  //   const updatedFavorites = favorites.filter((f) => f.id !== flightId);
  //   localStorage.setItem("favoriteFlights", JSON.stringify(updatedFavorites));
  //   setSavedFlights(updatedFavorites);
  // };

  // 1. Déclarer le State initialisé à vide
// const [savedFlights, setSavedFlights] = useState([]);

// Helper pour décoder un ID de vol et recréer les propriétés minimales exigées par le JSX
const decodeFlightId = (flight) => {
  // Si l'objet possède déjà les détails (cas du localStorage), on le retourne tel quel
  if (flight.from || flight.airline) return flight;

  try {
    // Découpe l'ID (ex: "JFK-BCN-2026-06-18-0")
    const parts = flight.id.split('-');
    if (parts.length >= 4) {
      return {
        id: flight.id,
        from: parts[0],                 // JFK
        to: parts[1],                   // BCN
        departureDate: `${parts[2]}-${parts[3]}-${parts[4]}`, // 2026-06-18
        airline: "Compagnies partenaires",
        price: flight.price || "Consulter",
        returnDate: null
      };
    }
  } catch (e) {
    console.error("Erreur décodage vol:", e);
  }
  return flight; // Fallback sécurisé
};

// 2. Charger et décoder les favoris asynchrones au montage
useEffect(() => {
  const loadDashboardFavorites = async () => {
    try {
      const favorites = await getFavorites(); // Appel de votre favori hybride
      
      // Transforme chaque favori pour s'assurer qu'il possède les clés attendues par le JSX
      const formattedFavorites = (favorites || []).map(decodeFlightId);
      
      setSavedFlights(formattedFavorites);
    } catch (error) {
      console.error("Impossible de charger les favoris sur le Dashboard :", error);
    }
  };

  if (currentUser) {
    loadDashboardFavorites();
  } else {
    navigate("/");
  }
}, [currentUser, navigate]);

// 3. Modifier la fonction de suppression pour qu'elle utilise la BDD
const removeFavorite = async (flightId) => {
  try {
    // Appel asynchrone de la fonction hybride (nettoie BDD ou LocalStorage selon connexion)
    const updatedRaw = await toggleFavorite({ id: flightId });
    
    // Recalcule le formatage des éléments restants
    const updatedFormatted = (updatedRaw || []).map(decodeFlightId);
    
    setSavedFlights(updatedFormatted);
    showMessage("Vol retiré de vos favoris.");
  } catch (error) {
    console.error("Erreur suppression favori Dashboard :", error);
  }
};


  // Liste des onglets du dashboard
  const tabs = [
    { id: "trips", label: "Mes voyages", icon: Plane },
    { id: "profile", label: "Profil & Documents", icon: User },
    { id: "loyalty", label: "Fidélité", icon: Star },
    { id: "favorites", label: "Favoris & Alertes", icon: Heart },
    { id: "payment", label: "Paiement", icon: CreditCard },
    { id: "settings", label: "Paramètres", icon: Settings },
  ];

  // Si l’utilisateur est absent, on ne montre rien
  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      {successMessage && (
        <div
          className={`fixed top-24 right-4 z-50 px-4 py-3 rounded-lg shadow-md text-white ${
            successMessage.type === "success" ? "bg-green-600" : "bg-blue-600"
          }`}
        >
          {successMessage.text}
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
                    <button
                      onClick={handleViewAllTrips}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
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
                        <button
                          onClick={() =>
                            handleEditReservation("Paris → New York")
                          }
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() =>
                            handleViewReservationDetails("Paris → New York")
                          }
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
                        >
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
                          <button
                            onClick={() => handleDownloadInvoice(i + 1000)}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                            title="Télécharger la facture"
                          >
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
                          value={profileData.firstName}
                          onChange={(e) =>
                            setProfileData((prev) => ({
                              ...prev,
                              firstName: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nom
                        </label>
                        <input
                          type="text"
                          value={profileData.lastName}
                          onChange={(e) =>
                            setProfileData((prev) => ({
                              ...prev,
                              lastName: e.target.value,
                            }))
                          }
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
                        value={profileData.email}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
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
                          value={profileData.birthDate}
                          onChange={(e) =>
                            setProfileData((prev) => ({
                              ...prev,
                              birthDate: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Téléphone
                        </label>
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) =>
                            setProfileData((prev) => ({
                              ...prev,
                              phone: e.target.value,
                            }))
                          }
                          placeholder="+33 6 12 34 56 78"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleSaveProfile}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Enregistrer les modifications
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                      Passeports et visas
                    </h2>
                    <button
                      onClick={handleAddDocument}
                      className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      Ajouter un document
                    </button>
                  </div>

                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Globe className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="font-medium">{doc.type}</p>
                              <p className="text-sm text-gray-500">
                                N° {doc.number}
                              </p>
                              <p className="text-xs text-gray-500">
                                Expire le {doc.expires}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDownloadDocument(doc)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            Télécharger
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                      Compagnons de voyage
                    </h2>
                    <button
                      onClick={handleAddCompanion}
                      className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      Ajouter un compagnon
                    </button>
                  </div>
                  {companions.length > 0 ? (
                    <div className="space-y-3">
                      {companions.map((companion) => (
                        <div
                          key={companion.id}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <p className="font-medium text-gray-900">
                            {companion.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            Compagnon enregistré
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Aucun compagnon enregistré</p>
                      <p className="text-sm mt-1">
                        Ajoutez vos proches pour réserver plus rapidement
                      </p>
                    </div>
                  )}
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
                    <button
                      onClick={handleAddLoyaltyCard}
                      className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      Ajouter une carte
                    </button>
                  </div>

                  <div className="space-y-4">
                    {loyaltyCards.map((card) => (
                      <div
                        key={card.id}
                        className="border border-gray-200 rounded-lg p-4 bg-gradient-to-r from-blue-50 to-blue-100"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-bold text-gray-900">
                              {card.label}
                            </p>
                            <p className="text-sm text-gray-600">
                              N° {card.number}
                            </p>
                          </div>
                          <span className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                            {card.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold text-blue-600">
                              {card.miles.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-600">Miles</p>
                          </div>
                          <button
                            onClick={() =>
                              showMessage(`Détails de ${card.label}`)
                            }
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            Voir détails
                          </button>
                        </div>
                      </div>
                    ))}

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

                          <button
                            onClick={() => handleBookNow(flight)}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
                          >
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
                    <button
                      onClick={handleCreatePriceAlert}
                      className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      Créer une alerte
                    </button>
                  </div>

                  <div className="space-y-3">
                    {priceAlertsData.map((alert) => (
                      <div
                        key={alert.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Bell className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="font-medium">
                                {alert.from} → {alert.to}
                              </p>
                              <p className="text-sm text-gray-500">
                                {alert.description}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Prix cible: {alert.target}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded ${alert.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
                            >
                              {alert.active ? "Active" : "Inactive"}
                            </span>
                            <button
                              onClick={() => handleRemovePriceAlert(alert.id)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

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
                    <button
                      onClick={handleAddPaymentCard}
                      className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      Ajouter une carte
                    </button>
                  </div>

                  <div className="space-y-3">
                    {paymentCards.map((card) => (
                      <div
                        key={card.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center">
                              <CreditCard className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <p className="font-medium">{card.label}</p>
                              <p className="text-sm text-gray-500">
                                Expire {card.expiry}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {card.primary && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                                Principale
                              </span>
                            )}
                            <button
                              onClick={handleEditPaymentCard}
                              className="text-blue-600 hover:text-blue-700 text-sm"
                            >
                              Modifier
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
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
                        <p className="text-3xl font-bold text-green-700">
                          {travelCredit} €
                        </p>
                      </div>
                      <Wallet className="w-12 h-12 text-green-600 opacity-50" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={handleApplyCredit}
                      className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Ajouter 50 € de crédit voyage
                    </button>
                    <div className="text-center py-6 text-gray-500">
                      <p>Les remboursements et bons d'achat apparaîtront ici</p>
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
                      <button
                        onClick={handleModifyPassword}
                        className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
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
                      <button
                        onClick={handleToggleTwoFactor}
                        className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        {twoFactorEnabled ? "Désactiver" : "Activer"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Préférences de notification
                  </h2>
                  <div className="space-y-4">
                    {notificationSettings.map((item, i) => (
                      <div
                        key={item.title}
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
                            checked={item.enabled}
                            onChange={() => handleToggleNotification(i)}
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
                    <button
                      onClick={handleDeleteAccount}
                      className="w-full px-4 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-left"
                    >
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
