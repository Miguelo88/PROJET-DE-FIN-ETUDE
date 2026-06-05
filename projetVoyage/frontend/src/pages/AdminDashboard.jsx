import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Users,
  Plane,
  CreditCard,
  TrendingUp,
  Shield,
  //   Settings,
  LogOut,
  Bell,
  Search,
  BarChart3,
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../composants/UI/Tabs";
import { UserManagement } from "../composants/admin/UserManagement";
import { FlightManagement } from "../composants/admin/FlightManagement";
import { FinancialManagement } from "../composants/admin/FinancialManagement";
import { MarketingManagement } from "../composants/admin/MarketingManagement";
import { SecurityManagement } from "../composants/admin/SecurityManagement";

export function AdminDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("users");
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    totalFlights: 0,
    totalAdmins: 0,
    totalAlerts: 0,
  });

  const fetchAdminStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/dashboard", {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!response.ok) {
        throw new Error("Impossible de récupérer les statistiques admin");
      }

      const data = await response.json();
      setDashboardStats(data);
    } catch (error) {
      console.error("Erreur fetching admin dashboard stats:", error);
    }
  };

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté et est admin
    const user = JSON.parse(localStorage.getItem("currentUser") || "null");

    if (!user || !user.isAdmin) {
      // Rediriger si pas admin
      navigate("/");
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentUser(user);
    fetchAdminStats();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/");
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Shield className="w-8 h-8 text-purple-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Dashboard Administrateur
                  </h1>
                  <p className="text-sm text-gray-500">SkySearch Admin Panel</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-64"
                />
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Profile */}
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {currentUser.name}
                  </p>
                  <p className="text-xs text-purple-600">Administrateur</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
              </div>

              <button
                onClick={() => navigate("/")}
                className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Page principale
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium hidden lg:inline">
                  Déconnexion
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xs text-green-600 font-medium">
                Données réelles
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {dashboardStats.totalUsers}
            </h3>
            <p className="text-sm text-gray-500">Utilisateurs inscrits</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Plane className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-xs text-green-600 font-medium">
                Données réelles
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {dashboardStats.totalFlights}
            </h3>
            <p className="text-sm text-gray-500">Vols enregistrés</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-xs text-green-600 font-medium">
                Données réelles
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {dashboardStats.totalAdmins}
            </h3>
            <p className="text-sm text-gray-500">Administrateurs</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-xs text-green-600 font-medium">
                Données réelles
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {dashboardStats.totalAlerts}
            </h3>
            <p className="text-sm text-gray-500">Alertes enregistrées</p>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b border-gray-200 px-6">
              <TabsList className="bg-transparent h-auto p-0 gap-6">
                <TabsTrigger
                  value="users"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-purple-600 rounded-none pb-4 px-0"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Utilisateurs
                </TabsTrigger>
                <TabsTrigger
                  value="flights"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-purple-600 rounded-none pb-4 px-0"
                >
                  <Plane className="w-4 h-4 mr-2" />
                  Vols
                </TabsTrigger>
                <TabsTrigger
                  value="financial"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-purple-600 rounded-none pb-4 px-0"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Financier
                </TabsTrigger>
                <TabsTrigger
                  value="marketing"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-purple-600 rounded-none pb-4 px-0"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Marketing
                </TabsTrigger>
                <TabsTrigger
                  value="security"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-purple-600 rounded-none pb-4 px-0"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Sécurité
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="users" className="mt-0">
                <UserManagement />
              </TabsContent>

              <TabsContent value="flights" className="mt-0">
                <FlightManagement />
              </TabsContent>

              <TabsContent value="financial" className="mt-0">
                <FinancialManagement />
              </TabsContent>

              <TabsContent value="marketing" className="mt-0">
                <MarketingManagement />
              </TabsContent>

              <TabsContent value="security" className="mt-0">
                <SecurityManagement />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
