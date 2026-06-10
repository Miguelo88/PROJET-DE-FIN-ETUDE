import { useState, useEffect } from "react";
import {
  Plane,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  MapPin,
  Clock,
  DollarSign,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../UI/Dialog";
import { Label } from "../UI/Label";
import { Input } from "../UI/Input";

export function FlightManagement() {
  const [flights, setFlights] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFlight, setEditingFlight] = useState(null);
  const [formData, setFormData] = useState({
    airline: "",
    departureCity: "",
    arrivalCity: "",
    departureTime: "",
    arrivalTime: "",
    price: 0,
    duration: "",
    stops: 0,
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    loadFlights();
  }, []);

  const loadFlights = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/flights", {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!response.ok) {
        throw new Error("Impossible de charger les vols");
      }

      const data = await response.json();
      setFlights(data);
    } catch (error) {
      console.error("Erreur chargement vols admin :", error);
      setFlights([]);
    }
  };

  const saveFlights = (updatedFlights) => {
    setFlights(updatedFlights);
  };

  const handleAddOrUpdateFlight = async () => {
    try {
      const token = localStorage.getItem("token");
      const payload = {
        airline: formData.airline,
        departureCity: formData.departureCity,
        arrivalCity: formData.arrivalCity,
        departureTime: formData.departureTime,
        arrivalTime: formData.arrivalTime,
        price: formData.price,
        duration: formData.duration,
        stops: formData.stops,
      };

      const url = editingFlight
        ? `/api/admin/flights/${editingFlight.id}`
        : "/api/admin/flights";
      const method = editingFlight ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Impossible d'enregistrer le vol");
      }

      const savedFlight = await response.json();
      if (editingFlight) {
        saveFlights(
          flights.map((f) => (f.id === savedFlight.id ? savedFlight : f)),
        );
      } else {
        saveFlights([savedFlight, ...flights]);
      }
    } catch (error) {
      console.error("Erreur sauvegarde vol :", error);
    }

    setFormData({
      airline: "",
      departureCity: "",
      arrivalCity: "",
      departureTime: "",
      arrivalTime: "",
      price: 0,
      duration: "",
      stops: 0,
    });
    setEditingFlight(null);
    setDialogOpen(false);
  };

  const toggleVisibility = async (id) => {
    try {
      const current = flights.find((flight) => flight.id === id);
      if (!current) return;

      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/flights/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ hidden: !current.hidden }),
      });

      if (!response.ok) {
        throw new Error("Impossible de modifier la visibilité");
      }

      const updatedFlight = await response.json();
      saveFlights(flights.map((f) => (f.id === id ? updatedFlight : f)));
    } catch (error) {
      console.error("Erreur changement visibilité :", error);
    }
  };

  const deleteFlight = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/flights/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!response.ok) {
        throw new Error("Impossible de supprimer le vol");
      }

      saveFlights(flights.filter((f) => f.id !== id));
    } catch (error) {
      console.error("Erreur suppression vol :", error);
    }
  };

  const openEditDialog = (flight) => {
    setEditingFlight(flight);
    setFormData(flight);
    setDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingFlight(null);
    setFormData({
      airline: "",
      departureCity: "",
      arrivalCity: "",
      departureTime: "",
      arrivalTime: "",
      price: 0,
      duration: "",
      stops: 0,
    });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Vols</h2>
          <p className="text-sm text-gray-500 mt-1">
            Ajoutez, modifiez ou masquez des vols manuellement
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={openAddDialog}
              className="gap-2 bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4" />
              Ajouter un vol
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingFlight ? "Modifier le vol" : "Ajouter un nouveau vol"}
              </DialogTitle>
              <DialogDescription>
                Remplissez les informations du vol
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="airline">Compagnie aérienne</Label>
                <Input
                  id="airline"
                  value={formData.airline}
                  onChange={(e) =>
                    setFormData({ ...formData, airline: e.target.value })
                  }
                  placeholder="Air France"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Prix (€)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: Number(e.target.value) })
                  }
                  placeholder="150"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="departureCity">Ville de départ</Label>
                <Input
                  id="departureCity"
                  value={formData.departureCity}
                  onChange={(e) =>
                    setFormData({ ...formData, departureCity: e.target.value })
                  }
                  placeholder="Paris"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="arrivalCity">Ville d'arrivée</Label>
                <Input
                  id="arrivalCity"
                  value={formData.arrivalCity}
                  onChange={(e) =>
                    setFormData({ ...formData, arrivalCity: e.target.value })
                  }
                  placeholder="Londres"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="departureTime">Heure de départ</Label>
                <Input
                  id="departureTime"
                  value={formData.departureTime}
                  onChange={(e) =>
                    setFormData({ ...formData, departureTime: e.target.value })
                  }
                  placeholder="08:30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="arrivalTime">Heure d'arrivée</Label>
                <Input
                  id="arrivalTime"
                  value={formData.arrivalTime}
                  onChange={(e) =>
                    setFormData({ ...formData, arrivalTime: e.target.value })
                  }
                  placeholder="10:45"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Durée</Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  placeholder="2h 15m"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stops">Escales</Label>
                <Input
                  id="stops"
                  type="number"
                  value={formData.stops}
                  onChange={(e) =>
                    setFormData({ ...formData, stops: Number(e.target.value) })
                  }
                  placeholder="0"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Annuler
              </Button>
              <Button
                onClick={handleAddOrUpdateFlight}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {editingFlight ? "Mettre à jour" : "Ajouter"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Plane className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-900">
                {flights.length}
              </p>
              <p className="text-sm text-blue-600">Total de vols</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Eye className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-900">
                {flights.filter((f) => !f.hidden).length}
              </p>
              <p className="text-sm text-green-600">Vols visibles</p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <EyeOff className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-900">
                {flights.filter((f) => f.hidden).length}
              </p>
              <p className="text-sm text-orange-600">Vols masqués</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Compagnie</TableHead>
              <TableHead>Trajet</TableHead>
              <TableHead>Horaires</TableHead>
              <TableHead>Durée</TableHead>
              <TableHead>Escales</TableHead>
              <TableHead>Prix</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {flights.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-8 text-gray-500"
                >
                  Aucun vol disponible
                </TableCell>
              </TableRow>
            ) : (
              flights.map((flight) => (
                <TableRow
                  key={flight.id}
                  className={flight.hidden ? "opacity-50" : ""}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Plane className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{flight.airline}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">
                        {flight.departureCity} → {flight.arrivalCity}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {flight.departureTime} - {flight.arrivalTime}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{flight.duration}</span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={flight.stops === 0 ? "default" : "secondary"}
                    >
                      {flight.stops === 0
                        ? "Direct"
                        : `${flight.stops} escale(s)`}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="font-medium">{flight.price}€</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {flight.hidden ? (
                      <Badge variant="secondary">
                        <EyeOff className="w-3 h-3 mr-1" />
                        Masqué
                      </Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                        <Eye className="w-3 h-3 mr-1" />
                        Visible
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleVisibility(flight.id)}
                      >
                        {flight.hidden ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(flight)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteFlight(flight.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
