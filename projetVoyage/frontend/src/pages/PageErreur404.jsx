import { HelpCircle } from "lucide-react";

export function PageErreur404() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <HelpCircle className="w-12 h-12 text-blue-600 mb-4 animate-bounce" />
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Page introuvable</h1>
      <p className="text-gray-600 mb-4">Oups ! La page demandée n'existe pas.</p>
      <a href="/" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        Retour à l'accueil
      </a>
    </div>
  );
}
