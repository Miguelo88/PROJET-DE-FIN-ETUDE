import { useState } from "react";
import { useEffect } from "react";

import { useNavigate } from "react-router-dom";
import {
  Plane,
  ArrowLeft,
  Heart,
  Globe,
  User,
  HelpCircle,
  ChevronDown,
  Menu,
  X,
  LogOut,
  Settings,
} from "lucide-react";
import { useLocale } from "../../contexts/LocaleContext.jsx";

// SVG icons pour les réseaux sociaux
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="currentColor"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="currentColor"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="currentColor"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const AppleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
  </svg>
);

export function Header({ showBackButton = false }) {
  const navigate = useNavigate();
  // const location = useLocation();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileLanguageMenu, setShowMobileLanguageMenu] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const [showAuthAlert, setShowAuthAlert] = useState(false);

  const {
    language,
    currency,
    region,
    supportedLanguages,
    supportedCurrencies,
    supportedRegions,
    setLanguage,
    setCurrency,
    setRegion,
    t,
  } = useLocale();

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    setShowUserMenu(false);
    setShowMobileMenu(false);
    navigate("/");
  };

  const handleFavoritesClick = () => {
    if (currentUser) {
      navigate("/user/favorites");
    } else {
      setShowAuthAlert(true);
      setTimeout(() => setShowAuthAlert(false), 3000);
    }
  };

  const getUserAvatar = () => {
    if (!currentUser) return null;

    if (currentUser.provider === "google") {
      return (
        <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-gray-700">
          <GoogleIcon />
        </div>
      );
    } else if (currentUser.provider === "facebook") {
      return (
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
          <FacebookIcon />
        </div>
      );
    } else if (currentUser.provider === "apple") {
      return (
        <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white">
          <AppleIcon />
        </div>
      );
    } else {
      // Utilisateur email par défaut
      return (
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
          <User className="w-5 h-5" />
        </div>
      );
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {showAuthAlert && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          <p className="text-sm font-medium">
            Veuillez vous connecter ou créer un compte
          </p>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            {showBackButton && (
              <>
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="hidden sm:inline">Retour</span>
                </button>
                <div className="h-6 w-px bg-gray-300 hidden sm:block"></div>
              </>
            )}
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Plane className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold">TKSkySearch</h1>
            </button>
          </div>

          {/* Right Section - Desktop */}
          <div className="hidden md:flex items-center gap-6">
            {/* Language/Region Selector */}
            <div className="relative">
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <Globe className="w-5 h-5" />
                <span className="text-sm">
                  {supportedLanguages[language]?.label || "Français"} /{" "}
                  {currency}
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {showLanguageMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowLanguageMenu(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-20">
                    {/* Language */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 mb-2">
                        {t("language")}
                      </p>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {Object.entries(supportedLanguages).map(
                          ([code, item]) => (
                            <option key={code} value={code}>
                              {item.label}
                            </option>
                          ),
                        )}
                      </select>
                    </div>

                    {/* Country */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 mb-2">
                        {t("country")}
                      </p>
                      <select
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {Object.entries(supportedRegions).map(
                          ([code, label]) => (
                            <option key={code} value={code}>
                              {label}
                            </option>
                          ),
                        )}
                      </select>
                    </div>

                    {/* Currency */}
                    <div className="px-4 py-3">
                      <p className="text-xs font-semibold text-gray-500 mb-2">
                        {t("currency")}
                      </p>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {Object.entries(supportedCurrencies).map(
                          ([code, item]) => (
                            <option key={code} value={code}>
                              {`${code} - ${item.label} (${item.symbol})`}
                            </option>
                          ),
                        )}
                      </select>
                    </div>

                    <div className="px-4 pt-2 pb-1">
                      <button
                        onClick={() => setShowLanguageMenu(false)}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        {t("save")}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Favorites */}
            <button
              onClick={handleFavoritesClick}
              className="flex items-center gap-2 text-gray-700 hover:text-red-500 transition-colors"
              title="Favoris"
            >
              <Heart className="w-5 h-5" />
              <span className="text-sm">Favoris</span>
            </button>

            {/* Help */}
            <button
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
              title="Aide"
            >
              <HelpCircle className="w-5 h-5" />
              <span className="text-sm">Aide</span>
            </button>

            {/* User Profile / Login */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  {getUserAvatar()}
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {currentUser.name}
                    </p>
                    <p className="text-xs text-gray-500">{currentUser.email}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-600 hidden lg:block" />
                </button>

                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowUserMenu(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-20">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {currentUser.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {currentUser.email}
                        </p>
                        {currentUser.provider && (
                          <p className="text-xs text-gray-400 mt-1">
                            Connecté via {currentUser.provider}
                          </p>
                        )}
                      </div>

                      {/* Menu Items */}
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          // Navigate to settings page
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Settings className="w-4 h-4" />
                        Paramètres
                      </button>

                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-100"
                      >
                        <LogOut className="w-4 h-4" />
                        Se déconnecter
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate("/register")}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="text-sm">Se connecter</span>
              </button>
            )}
          </div>

          {/* Right Section - Mobile */}
          <div className="flex md:hidden items-center gap-3">
            {/* Favorites - Always visible on mobile */}
            {showAuthAlert && (
              <div className="fixed top-4 right-4 bg-yellow-100 text-yellow-800 px-4 py-3 rounded-lg shadow-md z-50">
                Veuillez créer un compte ou vous connecter
              </div>
            )}

            <button
              onClick={handleFavoritesClick}
              className="text-gray-700 hover:text-red-500 transition-colors"
              title="Favoris"
            >
              <Heart className="w-5 h-5" />
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="text-gray-700 hover:text-blue-600 transition-colors p-2"
            >
              {showMobileMenu ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {showMobileMenu && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-25 z-30 md:hidden"
              onClick={() => {
                setShowMobileMenu(false);
                setShowMobileLanguageMenu(false);
              }}
            ></div>
            <div className="absolute right-4 left-4 mt-4 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-40 md:hidden">
              {/* Language/Region Selector */}
              <div className="border-b border-gray-100">
                <button
                  onClick={() =>
                    setShowMobileLanguageMenu(!showMobileLanguageMenu)
                  }
                  className="w-full px-4 py-3 flex items-center justify-between text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5" />
                    <span className="text-sm">Langue & Région</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      showMobileLanguageMenu ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showMobileLanguageMenu && (
                  <div className="px-4 pb-3 space-y-3 bg-gray-50">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1 block">
                        {t("language")}
                      </label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      >
                        {Object.entries(supportedLanguages).map(
                          ([code, item]) => (
                            <option key={code} value={code}>
                              {item.label}
                            </option>
                          ),
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1 block">
                        {t("country")}
                      </label>
                      <select
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      >
                        {Object.entries(supportedRegions).map(
                          ([code, label]) => (
                            <option key={code} value={code}>
                              {label}
                            </option>
                          ),
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1 block">
                        {t("currency")}
                      </label>
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      >
                        {Object.entries(supportedCurrencies).map(
                          ([code, item]) => (
                            <option key={code} value={code}>
                              {`${code} - ${item.label} (${item.symbol})`}
                            </option>
                          ),
                        )}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Help */}
              <button
                onClick={() => setShowMobileMenu(false)}
                className="w-full px-4 py-3 flex items-center gap-3 text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100"
              >
                <HelpCircle className="w-5 h-5" />
                <span className="text-sm">Aide</span>
              </button>

              {/* User Profile / Login */}
              {currentUser ? (
                <>
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                    <div className="flex items-center gap-3">
                      {getUserAvatar()}
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {currentUser.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {currentUser.email}
                        </p>
                        {currentUser.provider && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            via {currentUser.provider}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Settings */}
                  <button
                    onClick={() => setShowMobileMenu(false)}
                    className="w-full px-4 py-3 flex items-center gap-3 text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100"
                  >
                    <Settings className="w-5 h-5" />
                    <span className="text-sm">Paramètres</span>
                  </button>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 flex items-center gap-3 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="text-sm">Se déconnecter</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setShowMobileMenu(false);
                    navigate("/register");
                  }}
                  className="w-full px-4 py-3 flex items-center gap-3 text-blue-600 hover:bg-blue-50 transition-colors font-medium"
                >
                  <User className="w-5 h-5" />
                  <span className="text-sm">Se connecter</span>
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}
