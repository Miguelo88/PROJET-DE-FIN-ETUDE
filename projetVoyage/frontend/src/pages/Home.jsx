import { SearchForm } from "../composants/shared/SearchForm";
import { Header } from "../composants/shared/Header";
import { Footer } from "../composants/shared/Footer";
import { ImageWithFallback } from "../composants/shared/ImageWithFallback";
import { Plane } from "lucide-react";

export function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center px-4 pt-20 pb-32">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-white mb-4">
            Trouvez votre vol idéal
          </h2>
          <p className="text-xl text-blue-100">
            Comparez des centaines de vols et réservez au meilleur prix
          </p>
        </div>

        <SearchForm />

        {/* Image after the form */}
        <div className="mt-12 w-full max-w-5xl">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1609765685592-703a97c877ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhaXJwbGFuZSUyMHdpbmRvdyUyMHRyYXZlbHxlbnwxfHx8fDE3NzYzODg3Nzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Vue depuis un avion"
            className="w-full h-64 object-cover rounded-2xl shadow-2xl"
          />
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-5xl w-full">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-white mb-2">Meilleurs prix</h3>
            <p className="text-blue-100 text-sm">
              Comparez les prix de toutes les compagnies aériennes
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-white mb-2">
              Réservation facile
            </h3>
            <p className="text-blue-100 text-sm">
              Processus de réservation simple et sécurisé
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-white mb-2">Support 24/7</h3>
            <p className="text-blue-100 text-sm">
              Notre équipe est toujours là pour vous aider
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
