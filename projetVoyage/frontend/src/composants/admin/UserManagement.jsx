import { useState, useEffect } from "react";
import {
  UserX,
  UserCheck,
  Trash2,
  Search,
  Filter,
  MoreVertical,
  Shield,
  Mail,
  Calendar,
  // Edit,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../UI/Table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../UI/DropdownMenu";
import { Badge } from "../UI/Badge";
import { Button } from "../UI/Button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../UI/AlertDialog";

export function UserManagement() {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/users", {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!response.ok) {
        throw new Error("Impossible de récupérer les utilisateurs");
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Erreur chargement utilisateurs :", error);
      setUsers([]);
    }
  };

  const saveUsers = (updatedUsers) => {
    setUsers(updatedUsers);
  };

  const toggleBlockUser = async (email) => {
    try {
      const target = users.find((user) => user.email === email);
      if (!target) return;

      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/users/${target.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ action: "toggleBlock" }),
      });

      if (!response.ok) {
        throw new Error("Impossible de modifier le statut du compte");
      }

      const updatedUser = await response.json();
      saveUsers(
        users.map((user) => (user.email === email ? updatedUser : user)),
      );
    } catch (error) {
      console.error("Erreur blocage utilisateur :", error);
    }
  };

  const deleteUser = async (email) => {
    try {
      const target = users.find((user) => user.email === email);
      if (!target) return;

      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/users/${target.id}`, {
        method: "DELETE",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!response.ok) {
        throw new Error("Impossible de supprimer l'utilisateur");
      }

      saveUsers(users.filter((user) => user.email !== email));
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Erreur suppression utilisateur :", error);
    }
  };

  const toggleAdminRole = async (email) => {
    try {
      const target = users.find((user) => user.email === email);
      if (!target) return;

      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/users/${target.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ action: "toggleAdmin" }),
      });

      if (!response.ok) {
        throw new Error("Impossible de modifier le rôle admin");
      }

      const updatedUser = await response.json();
      saveUsers(
        users.map((user) => (user.email === email ? updatedUser : user)),
      );
    } catch (error) {
      console.error("Erreur changement droit admin :", error);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterType === "all" ||
      (filterType === "admin" && user.isAdmin) ||
      (filterType === "client" && !user.isAdmin) ||
      (filterType === "blocked" && user.blocked);

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Gestion des Utilisateurs
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Gérez les comptes clients, partenaires et administrateurs
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFilterType("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterType === "all"
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Tous ({users.length})
          </button>
          <button
            onClick={() => setFilterType("admin")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterType === "admin"
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Admins ({users.filter((u) => u.isAdmin).length})
          </button>
          <button
            onClick={() => setFilterType("client")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterType === "client"
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Clients ({users.filter((u) => !u.isAdmin).length})
          </button>
          <button
            onClick={() => setFilterType("blocked")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterType === "blocked"
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Bloqués ({users.filter((u) => u.blocked).length})
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Inscription</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-gray-500"
                >
                  Aucun utilisateur trouvé
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.email}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500">{user.role}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{user.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.isAdmin ? (
                      <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
                        <Shield className="w-3 h-3 mr-1" />
                        Admin
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Client</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      {new Date(user.registrationDate).toLocaleDateString(
                        "fr-FR",
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.blocked ? (
                      <Badge variant="destructive">Bloqué</Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                        Actif
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => toggleAdminRole(user.email)}
                          className="gap-2"
                        >
                          <Shield className="w-4 h-4" />
                          {user.isAdmin
                            ? "Retirer les droits admin"
                            : "Promouvoir en admin"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => toggleBlockUser(user.email)}
                          className="gap-2"
                        >
                          {user.blocked ? (
                            <>
                              <UserCheck className="w-4 h-4" />
                              Débloquer
                            </>
                          ) : (
                            <>
                              <UserX className="w-4 h-4" />
                              Bloquer
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(user);
                            setDeleteDialogOpen(true);
                          }}
                          className="gap-2 text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer l'utilisateur{" "}
              <strong>{selectedUser?.name}</strong> ? Cette action est
              irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedUser && deleteUser(selectedUser.email)}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
