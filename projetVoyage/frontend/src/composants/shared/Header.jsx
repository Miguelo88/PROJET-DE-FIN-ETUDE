import { useState } from "react";
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
} from "lucide-react";

export function Header({ showBackButton = false }) {
  const navigate = useNavigate();
  // const location = useLocation();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileLanguageMenu, setShowMobileLanguageMenu] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
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
                <span className="text-sm">FR / EUR</span>
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
                        Langue
                      </p>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="fr">Français</option>
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="de">Deutsch</option>
                        <option value="it">Italiano</option>
                      </select>
                    </div>

                    {/* Country */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 mb-2">
                        Pays
                      </p>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="fr">France</option>
                        <option value="us">États-Unis</option>
                        <option value="uk">Royaume-Uni</option>
                        <option value="de">Allemagne</option>
                        <option value="es">Espagne</option>
                        <option value="it">Italie</option>
                      </select>
                    </div>

                    {/* Currency */}
                    <div className="px-4 py-3">
                      <p className="text-xs font-semibold text-gray-500 mb-2">
                        Devise
                      </p>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="eur">EUR - Euro (€)</option>
                        <option value="usd">USD - Dollar ($)</option>
                        <option value="gbp">GBP - Livre (£)</option>
                        <option value="chf">CHF - Franc suisse</option>
                        <option value="jpy">JPY - Yen (¥)</option>
                      </select>
                    </div>

                    <div className="px-4 pt-2 pb-1">
                      <button
                        onClick={() => setShowLanguageMenu(false)}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Enregistrer
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Favorites */}
            <button
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

            {/* Login */}
            <button
              onClick={() => navigate("/register")}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <User className="w-5 h-5" />
              <span className="text-sm">Se connecter</span>
            </button>
          </div>

          {/* Right Section - Mobile */}
          <div className="flex md:hidden items-center gap-3">
            {/* Favorites - Always visible on mobile */}
            <button
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
                        Langue
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
                        <option value="fr">Français</option>
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="de">Deutsch</option>
                        <option value="it">Italiano</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1 block">
                        Pays
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
                        <option value="fr">France</option>
                        <option value="us">États-Unis</option>
                        <option value="uk">Royaume-Uni</option>
                        <option value="de">Allemagne</option>
                        <option value="es">Espagne</option>
                        <option value="it">Italie</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1 block">
                        Devise
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
                        <option value="eur">EUR - Euro (€)</option>
                        <option value="usd">USD - Dollar ($)</option>
                        <option value="gbp">GBP - Livre (£)</option>
                        <option value="chf">CHF - Franc suisse</option>
                        <option value="jpy">JPY - Yen (¥)</option>
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

              {/* Login */}
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
            </div>
          </>
        )}
      </div>
    </header>
  );
}
