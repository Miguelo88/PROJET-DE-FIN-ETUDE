import { useState } from "react";
import {
  CreditCard,
  TrendingUp,
  RefreshCw,
  Download,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
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
import { Label } from "../UI/Label";
import { Input } from "../UI/Input";

export function FinancialManagement() {
  const [serviceFee, setServiceFee] = useState(5);
  const [commissionRate, setCommissionRate] = useState(10);

  // Mock data pour les réservations
  const bookings = [
    {
      id: "BK001",
      userId: "U001",
      userName: "Jean Dupont",
      flightId: "FL001",
      route: "Paris → Londres",
      amount: 150,
      date: "2026-05-25T10:30:00",
      status: "completed",
    },
    {
      id: "BK002",
      userId: "U002",
      userName: "Marie Martin",
      flightId: "FL002",
      route: "Madrid → Rome",
      amount: 220,
      date: "2026-05-24T14:20:00",
      status: "completed",
    },
    {
      id: "BK003",
      userId: "U003",
      userName: "Pierre Dubois",
      flightId: "FL003",
      route: "Berlin → Amsterdam",
      amount: 180,
      date: "2026-05-23T08:15:00",
      status: "pending",
    },
  ];

  const refundRequests = [
    {
      id: "RF001",
      bookingId: "BK004",
      userName: "Sophie Laurent",
      amount: 195,
      reason: "Vol annulé par la compagnie",
      date: "2026-05-26T16:45:00",
      status: "pending",
    },
    {
      id: "RF002",
      bookingId: "BK005",
      userName: "Thomas Bernard",
      amount: 210,
      reason: "Changement de plans",
      date: "2026-05-25T11:20:00",
      status: "pending",
    },
  ];

  const totalRevenue = bookings
    .filter((b) => b.status === "completed")
    .reduce((sum, b) => sum + b.amount, 0);

  const pendingRefunds = refundRequests.filter((r) => r.status === "pending").length;

  const handleRefundAction = (id, action) => {
    console.log(`Refund ${id} ${action}`);
    // Logique de traitement du remboursement
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion Financière</h2>
          <p className="text-sm text-gray-500 mt-1">
            Suivez les ventes, remboursements et commissions
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-xs bg-white/20 px-2 py-1 rounded">+23%</span>
          </div>
          <h3 className="text-3xl font-bold">€{totalRevenue.toLocaleString()}</h3>
          <p className="text-sm opacity-90 mt-1">Revenus totaux</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">{bookings.length}</h3>
          <p className="text-sm text-gray-500 mt-1">Réservations</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <RefreshCw className="w-6 h-6 text-orange-600" />
            </div>
            {pendingRefunds > 0 && (
              <span className="w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {pendingRefunds}
              </span>
            )}
          </div>
          <h3 className="text-3xl font-bold text-gray-900">{pendingRefunds}</h3>
          <p className="text-sm text-gray-500 mt-1">Demandes de remboursement</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">
            €{((totalRevenue * commissionRate) / 100).toFixed(0)}
          </h3>
          <p className="text-sm text-gray-500 mt-1">Commissions</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="bookings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="bookings">Réservations</TabsTrigger>
          <TabsTrigger value="refunds">
            Remboursements
            {pendingRefunds > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {pendingRefunds}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Trajet</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.id}</TableCell>
                    <TableCell>{booking.userName}</TableCell>
                    <TableCell>{booking.route}</TableCell>
                    <TableCell className="font-medium">€{booking.amount}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {new Date(booking.date).toLocaleDateString("fr-FR")}
                      </div>
                    </TableCell>
                    <TableCell>
                      {booking.status === "completed" && (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Complété
                        </Badge>
                      )}
                      {booking.status === "pending" && (
                        <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          En attente
                        </Badge>
                      )}
                      {booking.status === "cancelled" && (
                        <Badge variant="destructive">
                          <XCircle className="w-3 h-3 mr-1" />
                          Annulé
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="refunds">
          <div className="space-y-4">
            {refundRequests.map((request) => (
              <div
                key={request.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{request.userName}</h3>
                      <Badge variant="outline">ID: {request.bookingId}</Badge>
                    </div>
                    <p className="text-gray-600 mb-3">{request.reason}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-medium">€{request.amount}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(request.date).toLocaleDateString("fr-FR")}
                      </div>
                    </div>
                  </div>

                  {request.status === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleRefundAction(request.id, "approved")}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approuver
                      </Button>
                      <Button
                        onClick={() => handleRefundAction(request.id, "rejected")}
                        variant="outline"
                        className="text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Refuser
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {refundRequests.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                Aucune demande de remboursement en attente
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Paramètres financiers</h3>
              <p className="text-sm text-gray-500 mb-6">
                Configurez les frais de service et les taux de commission
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="serviceFee">Frais de service (€)</Label>
                <Input
                  id="serviceFee"
                  type="number"
                  value={serviceFee}
                  onChange={(e) => setServiceFee(Number(e.target.value))}
                  min="0"
                />
                <p className="text-xs text-gray-500">
                  Frais fixes ajoutés à chaque réservation
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="commission">Taux de commission (%)</Label>
                <Input
                  id="commission"
                  type="number"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(Number(e.target.value))}
                  min="0"
                  max="100"
                />
                <p className="text-xs text-gray-500">
                  Pourcentage prélevé sur chaque vente
                </p>
              </div>
            </div>

            <div className="pt-4">
              <Button className="bg-purple-600 hover:bg-purple-700">
                Sauvegarder les modifications
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}