import { useState } from "react";
import {
  Shield,
  AlertTriangle,
  Activity,
  TrendingUp,
  Users,
  Search,
  Ban,
  CheckCircle,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../UI/Table";
import { Badge } from "../UI/Badge";
import { Button } from "../UI/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../UI/Tabs";

export function SecurityManagement() {
  const [securityEvents] = useState([
    {
      id: "SE001",
      type: "login_failed",
      ip: "192.168.1.100",
      userAgent: "Chrome/120.0",
      timestamp: "2026-05-27T10:30:00",
      details: "5 tentatives de connexion échouées",
    },
    {
      id: "SE002",
      type: "bot_detected",
      ip: "45.123.45.67",
      userAgent: "Python-urllib/3.8",
      timestamp: "2026-05-27T09:15:00",
      details: "Activité bot détectée - IP bloquée automatiquement",
    },
    {
      id: "SE003",
      type: "suspicious_activity",
      ip: "89.234.12.45",
      userAgent: "Firefox/119.0",
      timestamp: "2026-05-27T08:45:00",
      details: "Trafic anormal - 200 requêtes en 5 minutes",
    },
  ]);

  const [errorReports, setErrorReports] = useState([
    {
      id: "ER001",
      type: "payment",
      message: "Erreur de paiement - carte refusée",
      user: "jean.dupont@example.com",
      timestamp: "2026-05-27T11:20:00",
      resolved: false,
    },
    {
      id: "ER002",
      type: "search",
      message: "Échec de recherche - timeout API",
      user: "marie.martin@example.com",
      timestamp: "2026-05-27T10:50:00",
      resolved: false,
    },
    {
      id: "ER003",
      type: "api",
      message: "API externe indisponible",
      user: "system",
      timestamp: "2026-05-27T09:30:00",
      resolved: true,
    },
  ]);

  const [trafficStats] = useState({
    visitors: 12847,
    searches: 8934,
    conversions: 7803,
    conversionRate: 87.3,
  });

  const getEventIcon = (type) => {
    switch (type) {
      case "login_failed":
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case "bot_detected":
        return <Ban className="w-5 h-5 text-red-600" />;
      case "suspicious_activity":
        return <Shield className="w-5 h-5 text-yellow-600" />;
      case "blocked_ip":
        return <Ban className="w-5 h-5 text-red-600" />;
    }
  };

  const getEventBadge = (type) => {
    switch (type) {
      case "login_failed":
        return (
          <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
            Échec connexion
          </Badge>
        );
      case "bot_detected":
        return <Badge variant="destructive">Bot détecté</Badge>;
      case "suspicious_activity":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
            Activité suspecte
          </Badge>
        );
      case "blocked_ip":
        return <Badge variant="destructive">IP bloquée</Badge>;
    }
  };

  const getErrorBadge = (type) => {
    switch (type) {
      case "payment":
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Paiement</Badge>
        );
      case "search":
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
            Recherche
          </Badge>
        );
      case "api":
        return (
          <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">API</Badge>
        );
      case "other":
        return <Badge variant="secondary">Autre</Badge>;
    }
  };

  const markAsResolved = (id) => {
    setErrorReports(
      errorReports.map((e) => (e.id === id ? { ...e, resolved: true } : e))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Sécurité & Maintenance
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Surveillez la sécurité et les performances du site
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xs text-green-600 font-medium">+15%</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">
            {trafficStats.visitors.toLocaleString()}
          </h3>
          <p className="text-sm text-gray-500 mt-1">Visiteurs aujourd'hui</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Search className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-xs text-green-600 font-medium">+8%</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">
            {trafficStats.searches.toLocaleString()}
          </h3>
          <p className="text-sm text-gray-500 mt-1">Recherches effectuées</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-xs text-green-600 font-medium">+12%</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">
            {trafficStats.conversions.toLocaleString()}
          </h3>
          <p className="text-sm text-gray-500 mt-1">Conversions</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <Activity className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-3xl font-bold">{trafficStats.conversionRate}%</h3>
          <p className="text-sm opacity-90 mt-1">Taux de conversion</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="security" className="space-y-4">
        <TabsList>
          <TabsTrigger value="security">
            Événements de sécurité
            <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              {securityEvents.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="errors">
            Rapports d'erreurs
            <span className="ml-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
              {errorReports.filter((e) => !e.resolved).length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="analytics">Analyses</TabsTrigger>
        </TabsList>

        <TabsContent value="security">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Adresse IP</TableHead>
                  <TableHead>User Agent</TableHead>
                  <TableHead>Détails</TableHead>
                  <TableHead>Date & Heure</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {securityEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getEventIcon(event.type)}
                        {getEventBadge(event.type)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                        {event.ip}
                      </code>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {event.userAgent}
                    </TableCell>
                    <TableCell className="text-sm">{event.details}</TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(event.timestamp).toLocaleString("fr-FR")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Ban className="w-4 h-4 mr-2" />
                        Bloquer IP
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="errors">
          <div className="space-y-4">
            {errorReports.map((error) => (
              <div
                key={error.id}
                className={`border rounded-lg p-6 transition-all ${
                  error.resolved
                    ? "border-gray-200 bg-gray-50"
                    : "border-orange-200 bg-orange-50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getErrorBadge(error.type)}
                      {error.resolved && (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Résolu
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{error.message}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Utilisateur: {error.user}</span>
                      <span>
                        {new Date(error.timestamp).toLocaleString("fr-FR")}
                      </span>
                    </div>
                  </div>

                  {!error.resolved && (
                    <Button
                      onClick={() => markAsResolved(error.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Marquer comme résolu
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="space-y-6">
            {/* Traffic Chart Placeholder */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Trafic du site</h3>
              <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center border border-blue-100">
                <div className="text-center text-gray-500">
                  <Activity className="w-12 h-12 mx-auto mb-2 text-blue-600" />
                  <p>Graphique de trafic</p>
                  <p className="text-sm">
                    Visualisation des visiteurs et conversions
                  </p>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Pages les plus visitées
                </h3>
                <div className="space-y-3">
                  {[
                    { page: "/", visits: 5234, percentage: 40.7 },
                    { page: "/results", visits: 3821, percentage: 29.7 },
                    { page: "/flight/:id", visits: 2156, percentage: 16.8 },
                    { page: "/register", visits: 1636, percentage: 12.8 },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{item.page}</span>
                          <span className="text-sm text-gray-500">
                            {item.visits.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Sources de trafic</h3>
                <div className="space-y-3">
                  {[
                    { source: "Direct", visits: 4523, percentage: 35.2 },
                    { source: "Google", visits: 3912, percentage: 30.4 },
                    { source: "Réseaux sociaux", visits: 2634, percentage: 20.5 },
                    { source: "Referral", visits: 1778, percentage: 13.9 },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{item.source}</span>
                          <span className="text-sm text-gray-500">
                            {item.visits.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}