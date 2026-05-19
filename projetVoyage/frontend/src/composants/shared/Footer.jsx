import { Plane, Mail, Phone, MapPin} from "lucide-react";
// J'AI ENLEVER LE LOGO DE FACEBOOK,Twitter,Instagram,Linkedin DANS MON DEVOIR , VA FALLOIR CHERCHER UNE IMAGE POUR REMPLACER 

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Plane className="w-6 h-6 text-blue-400" />
              <h3 className="font-bold text-white text-lg">SkySearch</h3>
            </div>
            <p className="text-sm mb-4">
              Votre partenaire de confiance pour trouver les meilleurs vols au meilleur prix. Comparez et réservez en toute simplicité.
            </p>
            <div className="flex gap-3">
              {/* <a
                href="#"
                className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a> */}
              {/* <a
                href="#"
                className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-400 transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a> */}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Liens rapides</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  À propos de nous
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Comment ça marche
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Destinations populaires
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Offres spéciales
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Programme de fidélité
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Centre d'aide
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Conditions générales
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Politique de confidentialité
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Politique de cookies
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <span>
                  123 Avenue des Champs-Élysées<br />75008 Paris, France
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <a href="tel:+33123456789" className="hover:text-blue-400 transition-colors">
                  +33 1 23 45 67 89
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <a href="mailto:contact@skysearch.fr" className="hover:text-blue-400 transition-colors">
                  contact@skysearch.fr
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p>© 2026 SkySearch. Tous droits réservés.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-blue-400 transition-colors">
                Mentions légales
              </a>
              <a href="#" className="hover:text-blue-400 transition-colors">
                Plan du site
              </a>
              <a href="#" className="hover:text-blue-400 transition-colors">
                Accessibilité
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}