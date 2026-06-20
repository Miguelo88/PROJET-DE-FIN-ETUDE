import { createContext, useContext, useEffect, useMemo, useState } from "react";

const supportedLanguages = {
  fr: { locale: "fr-FR", label: "Français" },
  en: { locale: "en-US", label: "English" },
  es: { locale: "es-ES", label: "Español" },
  de: { locale: "de-DE", label: "Deutsch" },
  it: { locale: "it-IT", label: "Italiano" },
};

const supportedCurrencies = {
  EUR: { label: "Euro", symbol: "€", rate: 1 },
  USD: { label: "Dollar américain", symbol: "$", rate: 1.1 },
  GBP: { label: "Livre sterling", symbol: "£", rate: 0.88 },
  CHF: { label: "Franc suisse", symbol: "CHF", rate: 0.98 },
  JPY: { label: "Yen japonais", symbol: "¥", rate: 157 },
};

const supportedRegions = {
  fr: "France",
  us: "États-Unis",
  uk: "Royaume-Uni",
  de: "Allemagne",
  es: "Espagne",
  it: "Italie",
};

const translations = {
  fr: {
    favorites: "Favoris",
    help: "Aide",
    settings: "Paramètres",
    logout: "Se déconnecter",
    signIn: "Se connecter",
    language: "Langue",
    country: "Pays",
    currency: "Devise",
    save: "Enregistrer",
    languageRegion: "Langue & Région",
    loginRequired: "Veuillez créer un compte ou vous connecter",
    from: "À partir de",
    direct: "Direct",
    stop: "escale",
    stops: "escales",
    select: "Sélectionner",
    seatsLeft: "Plus que {count} places disponibles",
    passenger: "passager",
    passengers: "passagers",
    foundFlights: "vol trouvé",
    foundFlightsPlural: "vols trouvés",
    noFlightsFound: "Aucun vol trouvé",
    modifyFilters:
      "Essayez de modifier vos filtres ou vos critères de recherche",
    loadingFlights: "Chargement des vols…",
    loadingFlight: "Chargement du vol...",
    flightNotFound: "Vol non trouvé",
    invalidFlightId: "ID de vol invalide",
    returnResults: "Retour aux résultats",
    date: "Date",
    duration: "Durée",
    cabinClass: "Classe",
    seatsRemaining: "Places restantes",
    directFlight: "Vol direct",
    perPassenger: "par passager",
    priceInfo: "Prix final à confirmer lors du paiement",
    sortBy: "Trier par",
    priceAscending: "Prix croissant",
    priceDescending: "Prix décroissant",
    shortestDuration: "Durée la plus courte",
    earliestDeparture: "Départ le plus tôt",
    latestDeparture: "Départ le plus tard",
    priceMaximum: "Prix maximum",
    allFlights: "Tous les vols",
    directOnly: "Direct uniquement",
    maxOneStop: "Maximum 1 escale",
    airlines: "Compagnies aériennes",
    resetFilters: "Réinitialiser les filtres",
  },
  en: {
    favorites: "Favorites",
    help: "Help",
    settings: "Settings",
    logout: "Log out",
    signIn: "Sign in",
    language: "Language",
    country: "Country",
    currency: "Currency",
    save: "Save",
    languageRegion: "Language & region",
    loginRequired: "Please sign in or create an account",
    from: "From",
    direct: "Direct",
    stop: "stop",
    stops: "stops",
    select: "Select",
    seatsLeft: "Only {count} seats left",
    passenger: "passenger",
    passengers: "passengers",
    foundFlights: "flight found",
    foundFlightsPlural: "flights found",
    noFlightsFound: "No flights found",
    modifyFilters: "Try changing your filters or search criteria",
    loadingFlights: "Loading flights...",
    loadingFlight: "Loading flight...",
    flightNotFound: "Flight not found",
    invalidFlightId: "Invalid flight ID",
    returnResults: "Back to results",
    date: "Date",
    duration: "Duration",
    cabinClass: "Class",
    seatsRemaining: "Seats remaining",
    directFlight: "Direct flight",
    perPassenger: "per passenger",
    priceInfo: "Final price to be confirmed at checkout",
    sortBy: "Sort by",
    priceAscending: "Price ascending",
    priceDescending: "Price descending",
    shortestDuration: "Shortest duration",
    earliestDeparture: "Earliest departure",
    latestDeparture: "Latest departure",
    priceMaximum: "Maximum price",
    allFlights: "All flights",
    directOnly: "Direct only",
    maxOneStop: "Maximum 1 stop",
    airlines: "Airlines",
    resetFilters: "Reset filters",
  },
  es: {
    favorites: "Favoritos",
    help: "Ayuda",
    settings: "Ajustes",
    logout: "Cerrar sesión",
    signIn: "Iniciar sesión",
    language: "Idioma",
    country: "País",
    currency: "Moneda",
    save: "Guardar",
    languageRegion: "Idioma y región",
    loginRequired: "Por favor inicie sesión o cree una cuenta",
    from: "Desde",
    direct: "Directo",
    stop: "escala",
    stops: "escalas",
    select: "Seleccionar",
    seatsLeft: "Solo quedan {count} asientos",
    passenger: "pasajero",
    passengers: "pasajeros",
    foundFlights: "vuelo encontrado",
    foundFlightsPlural: "vuelos encontrados",
    noFlightsFound: "Ningún vuelo encontrado",
    modifyFilters: "Intenta cambiar tus filtros o criterios de búsqueda",
    loadingFlights: "Cargando vuelos...",
    loadingFlight: "Cargando el vuelo...",
    flightNotFound: "Vuelo no encontrado",
    invalidFlightId: "ID de vuelo inválido",
    returnResults: "Volver a los resultados",
    date: "Fecha",
    duration: "Duración",
    cabinClass: "Clase",
    seatsRemaining: "Asientos restantes",
    directFlight: "Vuelo directo",
    perPassenger: "por pasajero",
    priceInfo: "Precio final por confirmar en el pago",
    sortBy: "Ordenar por",
    priceAscending: "Precio ascendente",
    priceDescending: "Precio descendente",
    shortestDuration: "Duración más corta",
    earliestDeparture: "Salida más temprana",
    latestDeparture: "Salida más tarde",
    priceMaximum: "Precio máximo",
    allFlights: "Todos los vuelos",
    directOnly: "Solo directo",
    maxOneStop: "Máximo 1 escala",
    airlines: "Aerolíneas",
    resetFilters: "Restablecer filtros",
  },
  de: {
    favorites: "Favoriten",
    help: "Hilfe",
    settings: "Einstellungen",
    logout: "Abmelden",
    signIn: "Anmelden",
    language: "Sprache",
    country: "Land",
    currency: "Währung",
    save: "Speichern",
    languageRegion: "Sprache & Region",
    loginRequired: "Bitte melden Sie sich an oder erstellen Sie ein Konto",
    from: "Ab",
    direct: "Direkt",
    stop: "Zwischenstopp",
    stops: "Zwischenstopps",
    select: "Auswählen",
    seatsLeft: "Nur noch {count} Plätze verfügbar",
    passenger: "Passagier",
    passengers: "Passagiere",
    foundFlights: "Flug gefunden",
    foundFlightsPlural: "Flüge gefunden",
    noFlightsFound: "Kein Flug gefunden",
    modifyFilters: "Versuchen Sie, Ihre Filter oder Suchkriterien zu ändern",
    loadingFlights: "Flüge werden geladen...",
    loadingFlight: "Flug wird geladen...",
    flightNotFound: "Flug nicht gefunden",
    invalidFlightId: "Ungültige Flug-ID",
    returnResults: "Zurück zu den Ergebnissen",
    date: "Datum",
    duration: "Dauer",
    cabinClass: "Klasse",
    seatsRemaining: "Verbleibende Plätze",
    directFlight: "Direktflug",
    perPassenger: "pro Passagier",
    priceInfo: "Endpreis wird beim Bezahlen bestätigt",
    sortBy: "Sortieren nach",
    priceAscending: "Preis aufsteigend",
    priceDescending: "Preis absteigend",
    shortestDuration: "Kürzeste Dauer",
    earliestDeparture: "Früheste Abfahrt",
    latestDeparture: "Späteste Abfahrt",
    priceMaximum: "Maximaler Preis",
    allFlights: "Alle Flüge",
    directOnly: "Nur Direktflug",
    maxOneStop: "Maximal 1 Zwischenstopp",
    airlines: "Fluggesellschaften",
    resetFilters: "Filter zurücksetzen",
  },
  it: {
    favorites: "Preferiti",
    help: "Aiuto",
    settings: "Impostazioni",
    logout: "Disconnetti",
    signIn: "Accedi",
    language: "Lingua",
    country: "Paese",
    currency: "Valuta",
    save: "Salva",
    languageRegion: "Lingua e regione",
    loginRequired: "Per favore accedi o crea un account",
    from: "Da",
    direct: "Diretto",
    stop: "scalo",
    stops: "scali",
    select: "Seleziona",
    seatsLeft: "Solo {count} posti rimasti",
    passenger: "passeggero",
    passengers: "passeggeri",
    foundFlights: "volo trovato",
    foundFlightsPlural: "voli trovati",
    noFlightsFound: "Nessun volo trovato",
    modifyFilters: "Prova a modificare i filtri o i criteri di ricerca",
    loadingFlights: "Caricamento voli...",
    loadingFlight: "Caricamento del volo...",
    flightNotFound: "Volo non trovato",
    invalidFlightId: "ID volo non valido",
    returnResults: "Torna ai risultati",
    date: "Data",
    duration: "Durata",
    cabinClass: "Classe",
    seatsRemaining: "Posti rimanenti",
    directFlight: "Volo diretto",
    perPassenger: "per passeggero",
    priceInfo: "Prezzo finale da confermare al pagamento",
    sortBy: "Ordina per",
    priceAscending: "Prezzo crescente",
    priceDescending: "Prezzo decrescente",
    shortestDuration: "Durata più breve",
    earliestDeparture: "Partenza più presto",
    latestDeparture: "Partenza più tardi",
    priceMaximum: "Prezzo massimo",
    allFlights: "Tutti i voli",
    directOnly: "Solo diretto",
    maxOneStop: "Massimo 1 scalo",
    airlines: "Compagnie aeree",
    resetFilters: "Ripristina filtri",
  },
};

const LocaleContext = createContext(null);

export function LocaleProvider({ children }) {
  const [language, setLanguage] = useState("fr");
  const [currency, setCurrency] = useState("EUR");
  const [region, setRegion] = useState("fr");

  useEffect(() => {
    const storedSettings = localStorage.getItem("travelSettings");
    if (storedSettings) {
      try {
        const parsed = JSON.parse(storedSettings);
        if (parsed.language && supportedLanguages[parsed.language]) {
          setLanguage(parsed.language);
        }
        if (parsed.currency && supportedCurrencies[parsed.currency]) {
          setCurrency(parsed.currency);
        }
        if (parsed.region && supportedRegions[parsed.region]) {
          setRegion(parsed.region);
        }
      } catch (error) {
        console.warn(
          "Impossible de lire les paramètres de langue/devise :",
          error,
        );
      }
    }
  }, []);

  useEffect(() => {
    const settings = { language, currency, region };
    localStorage.setItem("travelSettings", JSON.stringify(settings));
  }, [language, currency, region]);

  const locale = useMemo(
    () => supportedLanguages[language]?.locale || "fr-FR",
    [language],
  );

  const formatPrice = (value, currencyCode = currency) => {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
      return "-";
    }

    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(Number(value));
  };

  const convertPrice = (value, fromCurrency, toCurrency) => {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
      return null;
    }
    const fromRate = supportedCurrencies[fromCurrency]?.rate || 1;
    const toRate = supportedCurrencies[toCurrency]?.rate || 1;
    return Number((Number(value) / fromRate) * toRate);
  };

  const t = (key, params = {}) => {
    const raw = translations[language]?.[key] || translations.fr[key] || key;
    return String(raw).replace(/\{(\w+)\}/g, (_, name) => params[name] ?? "");
  };

  const contextValue = useMemo(
    () => ({
      language,
      currency,
      region,
      locale,
      supportedLanguages,
      supportedCurrencies,
      supportedRegions,
      setLanguage,
      setCurrency,
      setRegion,
      formatPrice,
      convertPrice,
      t,
    }),
    [language, currency, region, locale, formatPrice, convertPrice, t],
  );

  return (
    <LocaleContext.Provider value={contextValue}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
}
