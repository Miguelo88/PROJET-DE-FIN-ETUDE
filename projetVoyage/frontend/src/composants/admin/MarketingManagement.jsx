import { useState } from "react";
import {
  Percent,
  Mail,
  Megaphone,
  Plus,
  Edit,
  Trash2,
  Copy,
  Send,
} from "lucide-react";
import { Badge } from "../UI/Badge";
import { Button } from "../UI/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../UI/Tabs";
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
// import { Textarea } from "../UI/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../UI/Table";

export function MarketingManagement() {
  const [promoCodes, setPromoCodes] = useState([
    {
      id: "PC001",
      code: "SUMMER2026",
      discount: 20,
      type: "percentage",
      startDate: "2026-06-01",
      endDate: "2026-08-31",
      used: 45,
      limit: 100,
      active: true,
    },
    {
      id: "PC002",
      code: "WELCOME10",
      discount: 10,
      type: "fixed",
      startDate: "2026-01-01",
      endDate: "2026-12-31",
      used: 234,
      limit: 500,
      active: true,
    },
  ]);

  const [campaigns, setCampaigns] = useState([
    {
      id: "CM001",
      name: "Offres d'été",
      subject: "Découvrez nos meilleures offres pour l'été",
      recipients: 2847,
      sent: true,
      sentDate: "2026-05-20",
    },
    {
      id: "CM002",
      name: "Alerte baisse de prix",
      subject: "Votre vol Paris → Londres a baissé de prix !",
      recipients: 156,
      sent: false,
    },
  ]);

  const [promoDialogOpen, setPromoDialogOpen] = useState(false);
//   const [, setCampaignDialogOpen] = useState(false);

  const [newPromo, setNewPromo] = useState({
    code: "",
    discount: 0,
    type: "percentage",
    startDate: "",
    endDate: "",
    limit: 100,
  });

//   const [newCampaign, setNewCampaign] = useState({
//     name: "",
//     subject: "",
//     message: "",
//   });

  const handleCreatePromo = () => {
    const promo = {
      id: `PC${String(promoCodes.length + 1).padStart(3, "0")}`,
      code: newPromo.code,
      discount: newPromo.discount,
      type: newPromo.type,
      startDate: newPromo.startDate,
      endDate: newPromo.endDate,
      used: 0,
      limit: newPromo.limit,
      active: true,
    };

    setPromoCodes([...promoCodes, promo]);
    setPromoDialogOpen(false);
    setNewPromo({
      code: "",
      discount: 0,
      type: "percentage",
      startDate: "",
      endDate: "",
      limit: 100,
    });
  };

  const handleSendCampaign = (id) => {
    setCampaigns(
      campaigns.map((c) =>
        c.id === id
          ? { ...c, sent: true, sentDate: new Date().toISOString().split("T")[0] }
          : c
      )
    );
  };

  const togglePromoStatus = (id) => {
    setPromoCodes(
      promoCodes.map((p) => (p.id === id ? { ...p, active: !p.active } : p))
    );
  };

  const copyPromoCode = (code) => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Marketing & Fidélisation
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Gérez vos codes promos et campagnes email
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <Percent className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-3xl font-bold">{promoCodes.length}</h3>
          <p className="text-sm opacity-90 mt-1">Codes promos actifs</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <Mail className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-3xl font-bold">
            {campaigns.filter((c) => c.sent).length}
          </h3>
          <p className="text-sm opacity-90 mt-1">Campagnes envoyées</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <Megaphone className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-3xl font-bold">
            {promoCodes.reduce((sum, p) => sum + p.used, 0)}
          </h3>
          <p className="text-sm opacity-90 mt-1">Codes utilisés</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="promo" className="space-y-4">
        <TabsList>
          <TabsTrigger value="promo">Codes Promos</TabsTrigger>
          <TabsTrigger value="campaigns">Campagnes Email</TabsTrigger>
        </TabsList>

        <TabsContent value="promo">
          <div className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={promoDialogOpen} onOpenChange={setPromoDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-purple-600 hover:bg-purple-700">
                    <Plus className="w-4 h-4" />
                    Créer un code promo
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Créer un nouveau code promo</DialogTitle>
                    <DialogDescription>
                      Configurez votre code de réduction
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="code">Code promo</Label>
                      <Input
                        id="code"
                        value={newPromo.code}
                        onChange={(e) =>
                          setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })
                        }
                        placeholder="SUMMER2026"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="discount">Réduction</Label>
                        <Input
                          id="discount"
                          type="number"
                          value={newPromo.discount}
                          onChange={(e) =>
                            setNewPromo({ ...newPromo, discount: Number(e.target.value) })
                          }
                          placeholder="20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="type">Type</Label>
                        <select
                          id="type"
                          value={newPromo.type}
                          onChange={(e) =>
                            setNewPromo({
                              ...newPromo,
                              type: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="percentage">Pourcentage (%)</option>
                          <option value="fixed">Montant fixe (€)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startDate">Date de début</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={newPromo.startDate}
                          onChange={(e) =>
                            setNewPromo({ ...newPromo, startDate: e.target.value })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="endDate">Date de fin</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={newPromo.endDate}
                          onChange={(e) =>
                            setNewPromo({ ...newPromo, endDate: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="limit">Limite d'utilisation</Label>
                      <Input
                        id="limit"
                        type="number"
                        value={newPromo.limit}
                        onChange={(e) =>
                          setNewPromo({ ...newPromo, limit: Number(e.target.value) })
                        }
                        placeholder="100"
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setPromoDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button
                      onClick={handleCreatePromo}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Créer
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Réduction</TableHead>
                    <TableHead>Période</TableHead>
                    <TableHead>Utilisation</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promoCodes.map((promo) => (
                    <TableRow key={promo.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="px-2 py-1 bg-gray-100 rounded font-mono text-sm">
                            {promo.code}
                          </code>
                          <button
                            onClick={() => copyPromoCode(promo.code)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <Copy className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {promo.type === "percentage"
                            ? `${promo.discount}%`
                            : `€${promo.discount}`}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(promo.startDate).toLocaleDateString("fr-FR")} -{" "}
                        {new Date(promo.endDate).toLocaleDateString("fr-FR")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-purple-600 h-2 rounded-full"
                              style={{
                                width: `${(promo.used / promo.limit) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm text-gray-500">
                            {promo.used}/{promo.limit}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {promo.active ? (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                            Actif
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Inactif</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => togglePromoStatus(promo.id)}
                          >
                            {promo.active ? "Désactiver" : "Activer"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="campaigns">
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button className="gap-2 bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4" />
                Nouvelle campagne
              </Button>
            </div>

            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{campaign.name}</h3>
                        {campaign.sent ? (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                            Envoyée
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
                            Brouillon
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3">{campaign.subject}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          <span>{campaign.recipients} destinataires</span>
                        </div>
                        {campaign.sentDate && (
                          <span>
                            Envoyée le{" "}
                            {new Date(campaign.sentDate).toLocaleDateString("fr-FR")}
                          </span>
                        )}
                      </div>
                    </div>

                    {!campaign.sent && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          Modifier
                        </Button>
                        <Button
                          onClick={() => handleSendCampaign(campaign.id)}
                          className="bg-purple-600 hover:bg-purple-700"
                          size="sm"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Envoyer
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}