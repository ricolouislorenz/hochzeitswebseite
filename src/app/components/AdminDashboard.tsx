import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { 
  Users, 
  UserPlus, 
  Check, 
  X, 
  Home, 
  LogOut, 
  Trash2,
  Heart,
  LayoutDashboard,
  Utensils,
  BarChart,
  CheckCircle,
  XCircle,
  Edit,
  Copy,
  RotateCcw,
  Bed
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";
import { toast } from "sonner";

interface Guest {
  code: string;
  name: string;
  createdAt: string;
  isPlural?: boolean;
  gender?: 'male' | 'female' | 'plural';
}

interface FoodItem {
  name: string;
  isVegetarian: boolean;
  isVegan: boolean;
  category: string;
}

interface RSVP {
  code: string;
  guestName: string;
  attending: boolean;
  numberOfGuests: number;
  foodItems?: FoodItem[];
  foodItem?: string;
  isVegetarian?: boolean;
  isVegan?: boolean;
  category?: string;
  needsAccommodation: boolean;
  submittedAt: string;
}

interface DashboardStats {
  totalGuests: number;
  totalResponses: number;
  attending: number;
  declined: number;
  pending: number;
  totalAttendingGuests: number;
  rsvps: RSVP[];
}

interface BuffetItem {
  guestCode: string;
  guestName: string;
  foodItem: string;
  isVegetarian: boolean;
  isVegan: boolean;
  category: string;
  itemIndex: number;
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<"dashboard" | "buffet" | "guests" | "accommodation">("dashboard");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [buffetItems, setBuffetItems] = useState<BuffetItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load stats
      const statsResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bda29bfd/admin/dashboard`,
        {
          headers: {
            "Authorization": `Bearer ${publicAnonKey}`,
          },
        }
      );
      const statsData = await statsResponse.json();
      if (statsData.success) {
        setStats(statsData.stats);
      }

      // Load guests
      const guestsResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bda29bfd/admin/guests`,
        {
          headers: {
            "Authorization": `Bearer ${publicAnonKey}`,
          },
        }
      );
      const guestsData = await guestsResponse.json();
      if (guestsData.success) {
        setGuests(guestsData.guests);
      }

      // Load buffet items
      const buffetResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bda29bfd/buffet`,
        {
          headers: {
            "Authorization": `Bearer ${publicAnonKey}`,
          },
        }
      );
      const buffetData = await buffetResponse.json();
      if (buffetData.success) {
        setBuffetItems(buffetData.buffetList);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Fehler beim Laden der Daten");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F6F1E9] via-[#E8C7C8]/20 to-white">
        <div className="text-center">
          <Heart className="size-12 text-[#C6A75E] animate-pulse mx-auto mb-4" />
          <p className="text-lg text-[#A3B18A]">Lädt...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F1E9] via-[#E8C7C8]/20 to-white">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-[#E8C7C8]/30 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo/Title */}
            <div className="flex items-center gap-2">
              <Heart className="size-6 text-[#C6A75E] fill-[#C6A75E]" />
              <span className="text-xl font-serif text-slate-800">Admin-Bereich</span>
            </div>
            
            {/* Main Navigation */}
            <div className="flex gap-6">
              <button
                onClick={() => setCurrentView("dashboard")}
                className={`group flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                  currentView === "dashboard" 
                    ? "text-[#C6A75E]" 
                    : "text-slate-600 hover:text-[#C6A75E]"
                }`}
              >
                <LayoutDashboard className={`size-5 transition-all duration-200 ${
                  currentView === "dashboard" 
                    ? "stroke-[#C6A75E]" 
                    : ""
                }`} />
                <span className="font-medium text-sm">Dashboard</span>
                {currentView === "dashboard" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C6A75E] rounded-full" />
                )}
              </button>
              
              <button
                onClick={() => setCurrentView("buffet")}
                className={`group flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                  currentView === "buffet" 
                    ? "text-[#C6A75E]" 
                    : "text-slate-600 hover:text-[#C6A75E]"
                }`}
              >
                <Utensils className={`size-5 transition-all duration-200 ${
                  currentView === "buffet" 
                    ? "stroke-[#C6A75E]" 
                    : ""
                }`} />
                <span className="font-medium text-sm">Buffet</span>
                {currentView === "buffet" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C6A75E] rounded-full" />
                )}
              </button>
              
              <button
                onClick={() => setCurrentView("guests")}
                className={`group flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                  currentView === "guests" 
                    ? "text-[#C6A75E]" 
                    : "text-slate-600 hover:text-[#C6A75E]"
                }`}
              >
                <Users className={`size-5 transition-all duration-200 ${
                  currentView === "guests" 
                    ? "stroke-[#C6A75E]" 
                    : ""
                }`} />
                <span className="font-medium text-sm">Gästeliste</span>
                {currentView === "guests" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C6A75E] rounded-full" />
                )}
              </button>
              
              <button
                onClick={() => setCurrentView("accommodation")}
                className={`group flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                  currentView === "accommodation" 
                    ? "text-[#C6A75E]" 
                    : "text-slate-600 hover:text-[#C6A75E]"
                }`}
              >
                <Bed className={`size-5 transition-all duration-200 ${
                  currentView === "accommodation" 
                    ? "stroke-[#C6A75E]" 
                    : ""
                }`} />
                <span className="font-medium text-sm">Übernachtung</span>
                {currentView === "accommodation" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C6A75E] rounded-full" />
                )}
              </button>
            </div>
            
            {/* Logout Button */}
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all duration-200"
            >
              <LogOut className="size-4" />
              <span className="text-sm font-medium">Abmelden</span>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {currentView === "dashboard" && <DashboardView stats={stats} />}
        {currentView === "buffet" && <BuffetView buffetItems={buffetItems} onUpdate={loadData} />}
        {currentView === "guests" && <GuestsView guests={guests} stats={stats} onUpdate={loadData} />}
        {currentView === "accommodation" && <AccommodationView stats={stats} />}
      </div>
    </div>
  );
}

// Dashboard View Component
function DashboardView({ stats }: { stats: DashboardStats | null }) {
  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border border-[#E8C7C8] bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Users className="size-4 text-[#A3B18A]" />
              Gäste angelegt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#C6A75E]">{stats.totalGuests}</div>
          </CardContent>
        </Card>

        <Card className="border border-[#E8C7C8] bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <BarChart className="size-4 text-[#A3B18A]" />
              Haben reagiert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#A3B18A]">{stats.totalResponses}</div>
            <p className="text-xs text-slate-500 mt-1">
              von {stats.totalGuests} Gästen
            </p>
          </CardContent>
        </Card>

        <Card className="border border-green-200 bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <CheckCircle className="size-4 text-green-600" />
              Zusagen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.attending}</div>
          </CardContent>
        </Card>

        <Card className="border border-red-200 bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <XCircle className="size-4 text-red-600" />
              Absagen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.declined}</div>
          </CardContent>
        </Card>

        <Card className="border border-[#C6A75E] bg-gradient-to-br from-[#C6A75E]/10 to-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Users className="size-4 text-[#C6A75E]" />
              Gesamt Teilnehmer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#C6A75E]">{stats.totalAttendingGuests}</div>
            <p className="text-xs text-slate-500 mt-1">
              Personen insgesamt
            </p>
          </CardContent>
        </Card>
      </div>

      {/* RSVP Details */}
      {stats.rsvps.length > 0 && (
        <Card className="border border-[#E8C7C8] bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <BarChart className="size-5 text-[#C6A75E]" />
              RSVP Übersicht
            </CardTitle>
            <CardDescription>
              Detaillierte Übersicht aller Rückmeldungen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-[#E8C7C8] overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F6F1E9]/50">
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Personen</TableHead>
                    <TableHead>Schlafplatz</TableHead>
                    <TableHead>Geantwortet am</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.rsvps.map((rsvp) => (
                    <TableRow key={rsvp.code}>
                      <TableCell className="font-medium">{rsvp.guestName}</TableCell>
                      <TableCell>
                        {rsvp.attending ? (
                          <Badge className="bg-green-500 hover:bg-green-600">Zugesagt</Badge>
                        ) : (
                          <Badge variant="destructive">Abgesagt</Badge>
                        )}
                      </TableCell>
                      <TableCell>{rsvp.attending ? rsvp.numberOfGuests : "-"}</TableCell>
                      <TableCell>
                        {rsvp.attending ? (rsvp.needsAccommodation ? "Ja" : "Nein") : "-"}
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {new Date(rsvp.submittedAt).toLocaleDateString("de-DE", {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Buffet View Component
function BuffetView({ buffetItems, onUpdate }: { buffetItems: BuffetItem[]; onUpdate: () => void }) {
  const [editingItem, setEditingItem] = useState<BuffetItem | null>(null);
  const [editName, setEditName] = useState<string>("");
  const [editCategory, setEditCategory] = useState<string>("");
  const [editIsVegetarian, setEditIsVegetarian] = useState<boolean>(false);
  const [editIsVegan, setEditIsVegan] = useState<boolean>(false);

  const openEditDialog = (item: BuffetItem) => {
    setEditingItem(item);
    setEditName(item.foodItem);
    setEditCategory(item.category);
    setEditIsVegetarian(item.isVegetarian);
    setEditIsVegan(item.isVegan);
  };

  const handleUpdateItem = async () => {
    if (!editingItem || !editName.trim()) {
      toast.error("Bitte gib einen Namen ein");
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bda29bfd/admin/buffet/update-item`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            guestCode: editingItem.guestCode,
            itemIndex: editingItem.itemIndex,
            name: editName,
            category: editCategory,
            isVegetarian: editIsVegetarian,
            isVegan: editIsVegan,
          }),
        }
      );

      if (response.ok) {
        toast.success("Eintrag aktualisiert");
        setEditingItem(null);
        onUpdate();
      } else {
        toast.error("Fehler beim Aktualisieren");
      }
    } catch (error) {
      console.error("Error updating buffet item:", error);
      toast.error("Fehler beim Aktualisieren");
    }
  };

  const handleDeleteItem = async (item: BuffetItem) => {
    if (!confirm(`Möchtest du "${item.foodItem}" wirklich löschen?`)) {
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bda29bfd/admin/buffet/delete-item`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            guestCode: item.guestCode,
            itemIndex: item.itemIndex,
          }),
        }
      );

      if (response.ok) {
        toast.success("Eintrag gelöscht");
        onUpdate();
      } else {
        toast.error("Fehler beim Löschen");
      }
    } catch (error) {
      console.error("Error deleting buffet item:", error);
      toast.error("Fehler beim Löschen");
    }
  };

  const categorizedItems = {
    Vorspeise: buffetItems.filter(item => item.category === 'Vorspeise'),
    Hauptspeise: buffetItems.filter(item => item.category === 'Hauptspeise'),
    Nachspeise: buffetItems.filter(item => item.category === 'Nachspeise'),
  };

  return (
    <div className="space-y-6">
      <Card className="border border-[#E8C7C8] bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <Utensils className="size-5 text-[#C6A75E]" />
            Buffet-Verwaltung
          </CardTitle>
          <CardDescription>
            Verwalte alle Buffet-Beiträge: Name, Kategorie und Eigenschaften anpassen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {(['Vorspeise', 'Hauptspeise', 'Nachspeise'] as const).map((category) => {
              const items = categorizedItems[category];
              
              return (
                <div key={category}>
                  <div className="bg-gradient-to-r from-[#E8C7C8]/20 via-[#F6F1E9]/50 to-[#E8C7C8]/20 px-4 py-3 rounded-lg border border-[#E8C7C8]/50 mb-3">
                    <h3 className="text-lg font-semibold text-slate-700 flex items-center justify-between">
                      <span>{category}</span>
                      <Badge variant="outline" className="border-[#C6A75E] text-[#C6A75E]">
                        {items.length} {items.length === 1 ? 'Eintrag' : 'Einträge'}
                      </Badge>
                    </h3>
                  </div>
                  
                  {items.length === 0 ? (
                    <p className="text-sm text-slate-400 italic px-4 pb-4">Keine Einträge</p>
                  ) : (
                    <div className="rounded-lg border border-[#E8C7C8] overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-[#F6F1E9]/30">
                            <TableHead>Speise</TableHead>
                            <TableHead>Gast</TableHead>
                            <TableHead>Eigenschaften</TableHead>
                            <TableHead className="text-right">Aktionen</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {items.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{item.foodItem}</TableCell>
                              <TableCell className="text-slate-600">{item.guestName}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  {item.isVegetarian && (
                                    <Badge className="bg-green-50 text-green-700 border border-green-200 text-xs">
                                      Vegetarisch
                                    </Badge>
                                  )}
                                  {item.isVegan && (
                                    <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs">
                                      Vegan
                                    </Badge>
                                  )}
                                  {!item.isVegetarian && !item.isVegan && (
                                    <span className="text-sm text-slate-400">-</span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openEditDialog(item)}
                                    className="text-[#A3B18A] hover:text-[#C6A75E] hover:bg-[#E8C7C8]/10"
                                  >
                                    <Edit className="size-4 mr-1" />
                                    Bearbeiten
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteItem(item)}
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 className="size-4 mr-1" />
                                    Löschen
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Edit Item Dialog */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="border-[#E8C7C8]">
          <DialogHeader>
            <DialogTitle>Buffet-Eintrag bearbeiten</DialogTitle>
            <DialogDescription>
              Gast: <strong>{editingItem?.guestName}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Name der Speise *</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="z.B. Kartoffelsalat"
                className="border-[#E8C7C8] focus:ring-[#C6A75E]"
              />
            </div>

            <div>
              <Label htmlFor="edit-category">Kategorie *</Label>
              <Select value={editCategory} onValueChange={setEditCategory}>
                <SelectTrigger id="edit-category" className="border-[#E8C7C8] focus:ring-[#C6A75E]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Vorspeise">Vorspeise</SelectItem>
                  <SelectItem value="Hauptspeise">Hauptspeise</SelectItem>
                  <SelectItem value="Nachspeise">Nachspeise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Eigenschaften</Label>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editIsVegetarian}
                    onChange={(e) => setEditIsVegetarian(e.target.checked)}
                    className="w-4 h-4 text-[#A3B18A] border-[#E8C7C8] rounded focus:ring-[#C6A75E]"
                  />
                  <span className="text-sm text-slate-700">Vegetarisch</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editIsVegan}
                    onChange={(e) => setEditIsVegan(e.target.checked)}
                    className="w-4 h-4 text-[#A3B18A] border-[#E8C7C8] rounded focus:ring-[#C6A75E]"
                  />
                  <span className="text-sm text-slate-700">Vegan</span>
                </label>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleUpdateItem}
                className="flex-1 bg-[#C6A75E] hover:bg-[#A3B18A] text-white"
              >
                Speichern
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditingItem(null)}
                className="flex-1 border-[#E8C7C8]"
              >
                Abbrechen
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Guests View Component
function GuestsView({ guests, stats, onUpdate }: { guests: Guest[], stats: DashboardStats | null, onUpdate: () => void }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestGender, setNewGuestGender] = useState<'male' | 'female' | 'plural'>('male');
  const [isCreating, setIsCreating] = useState(false);
  
  // Edit dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [editName, setEditName] = useState("");
  const [editCode, setEditCode] = useState("");
  const [editGender, setEditGender] = useState<'male' | 'female' | 'plural'>('male');
  const [editNumberOfGuests, setEditNumberOfGuests] = useState(2);
  const [editNeedsAccommodation, setEditNeedsAccommodation] = useState(false);
  const [editFoodItems, setEditFoodItems] = useState<FoodItem[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleCreateGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newGuestName.trim()) {
      toast.error("Bitte gib einen Namen ein");
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bda29bfd/admin/guests`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            name: newGuestName,
            isPlural: newGuestGender === 'plural',
            gender: newGuestGender,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(`Gast erstellt! Code: ${data.guest.code}`);
        setNewGuestName("");
        setNewGuestGender('male');
        setIsDialogOpen(false);
        onUpdate();
      } else {
        toast.error(`Fehler: ${data.error || 'Unbekannter Fehler'}`);
      }
    } catch (error) {
      console.error("Error creating guest:", error);
      toast.error(`Fehler beim Erstellen: ${error}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleResetRSVP = async (code: string) => {
    if (!confirm("Möchtest du die Eingaben dieses Gastes wirklich zurücksetzen?")) {
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bda29bfd/admin/guests/${code}/reset`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        toast.success("Eingaben zurückgesetzt");
        onUpdate();
      } else {
        toast.error("Fehler beim Zurücksetzen");
      }
    } catch (error) {
      console.error("Error resetting RSVP:", error);
      toast.error("Fehler beim Zurücksetzen");
    }
  };

  const handleDeleteGuest = async (code: string) => {
    if (!confirm("Möchtest du diesen Gast wirklich löschen?")) {
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bda29bfd/admin/guests/${code}`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        toast.success("Gast gelöscht");
        onUpdate();
      } else {
        toast.error("Fehler beim Löschen");
      }
    } catch (error) {
      console.error("Error deleting guest:", error);
      toast.error("Fehler beim Löschen");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Code kopiert!");
  };

  const openEditDialog = async (guest: Guest) => {
    setEditingGuest(guest);
    setEditName(guest.name);
    setEditCode(guest.code);
    setEditGender(guest.gender || 'male');
    
    // Load RSVP data if exists
    const rsvp = stats?.rsvps.find(r => r.code === guest.code);
    if (rsvp) {
      setEditNumberOfGuests(rsvp.numberOfGuests);
      setEditNeedsAccommodation(rsvp.needsAccommodation);
      setEditFoodItems(rsvp.foodItems || []);
    } else {
      setEditNumberOfGuests(2);
      setEditNeedsAccommodation(false);
      setEditFoodItems([]);
    }
    
    setIsEditDialogOpen(true);
  };

  const handleUpdateGuest = async () => {
    if (!editingGuest || !editName.trim()) {
      toast.error("Bitte gib einen Namen ein");
      return;
    }

    if (!editCode || editCode.length !== 7) {
      toast.error("Code muss 7 Zeichen lang sein");
      return;
    }

    setIsUpdating(true);

    try {
      // Check if RSVP exists to decide whether to update it
      const rsvp = stats?.rsvps.find(r => r.code === editingGuest.code);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bda29bfd/admin/guests/${editingGuest.code}/update`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            name: editName,
            newCode: editCode !== editingGuest.code ? editCode : undefined,
            gender: editGender,
            // Only update RSVP fields if RSVP exists
            ...(rsvp ? {
              numberOfGuests: editNumberOfGuests,
              needsAccommodation: editNeedsAccommodation,
              foodItems: editFoodItems,
            } : {})
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(`Gast aktualisiert!`);
        setIsEditDialogOpen(false);
        onUpdate();
      } else {
        // Show specific error message for duplicate code
        if (data.error === 'New code already exists') {
          toast.error(`Der Code ${editCode} ist bereits vergeben. Bitte wähle einen anderen Code.`);
        } else {
          toast.error(`Fehler: ${data.error || 'Unbekannter Fehler'}`);
        }
      }
    } catch (error) {
      console.error("Error updating guest:", error);
      toast.error(`Fehler beim Aktualisieren: ${error}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border border-[#E8C7C8] bg-white shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <Users className="size-5 text-[#C6A75E]" />
                Gästeliste
              </CardTitle>
              <CardDescription>
                Verwaltung aller eingeladenen Gäste
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#C6A75E] hover:bg-[#A3B18A] text-white">
                  <UserPlus className="size-4 mr-2" />
                  Gast hinzufügen
                </Button>
              </DialogTrigger>
              <DialogContent className="border-[#E8C7C8]">
                <DialogHeader>
                  <DialogTitle>Neuen Gast hinzufügen</DialogTitle>
                  <DialogDescription>
                    Ein eindeutiger 7-stelliger Code wird automatisch generiert
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateGuest} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={newGuestName}
                      onChange={(e) => setNewGuestName(e.target.value)}
                      placeholder="Max Mustermann"
                      disabled={isCreating}
                      className="border-[#E8C7C8] focus:ring-[#C6A75E]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Ansprache</Label>
                    <Select value={newGuestGender} onValueChange={(value) => setNewGuestGender(value as 'male' | 'female' | 'plural')}>
                      <SelectTrigger id="gender" className="border-[#E8C7C8] focus:ring-[#C6A75E]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Männlich (Lieber ... / du/dich/deine)</SelectItem>
                        <SelectItem value="female">Weiblich (Liebe ... / du/dich/deine)</SelectItem>
                        <SelectItem value="plural">Mehrere Personen (Liebe ... / ihr/euch/eure)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-slate-500 mt-1">
                      Legt die Anrede und das Geschlecht fest
                    </p>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-[#C6A75E] hover:bg-[#A3B18A] text-white"
                    disabled={isCreating}
                  >
                    {isCreating ? "Wird erstellt..." : "Gast erstellen"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-[#E8C7C8] overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F6F1E9]/50">
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {guests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-slate-400 py-8">
                      Noch keine Gäste angelegt
                    </TableCell>
                  </TableRow>
                ) : (
                  guests.map((guest) => {
                    const rsvp = stats?.rsvps.find(r => r.code === guest.code);
                    return (
                      <TableRow key={guest.code}>
                        <TableCell className="font-medium">{guest.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="bg-slate-100 px-2 py-1 rounded text-sm font-mono">
                              {guest.code}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(guest.code)}
                              className="h-8 w-8 p-0"
                            >
                              <Copy className="size-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          {!rsvp && (
                            <Badge variant="outline" className="border-orange-400 text-orange-600 bg-orange-50">
                              Ausstehend
                            </Badge>
                          )}
                          {rsvp?.attending && (
                            <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50">
                              Zugesagt ({rsvp.numberOfGuests})
                            </Badge>
                          )}
                          {rsvp && !rsvp.attending && (
                            <Badge variant="outline" className="border-red-500 text-red-600 bg-red-50">
                              Abgesagt
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {rsvp && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleResetRSVP(guest.code)}
                                className="text-[#A3B18A] hover:text-[#C6A75E] hover:bg-[#E8C7C8]/10"
                              >
                                <RotateCcw className="size-4 mr-1" />
                                Zurücksetzen
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(guest)}
                              className="text-[#A3B18A] hover:text-[#C6A75E] hover:bg-[#E8C7C8]/10"
                            >
                              <Edit className="size-4 mr-1" />
                              Bearbeiten
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteGuest(guest.code)}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="size-4 mr-1" />
                              Löschen
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Guest Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="border-[#E8C7C8]">
          <DialogHeader>
            <DialogTitle>Gast bearbeiten</DialogTitle>
            <DialogDescription>
              Gast: <strong>{editingGuest?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Max Mustermann"
                disabled={isUpdating}
                className="border-[#E8C7C8] focus:ring-[#C6A75E]"
              />
            </div>

            <div>
              <Label htmlFor="edit-code">Code *</Label>
              <Input
                id="edit-code"
                value={editCode}
                onChange={(e) => setEditCode(e.target.value)}
                placeholder="1234567"
                disabled={isUpdating}
                className="border-[#E8C7C8] focus:ring-[#C6A75E]"
              />
            </div>

            <div>
              <Label htmlFor="edit-gender">Ansprache</Label>
              <Select value={editGender} onValueChange={(value) => setEditGender(value as 'male' | 'female' | 'plural')}>
                <SelectTrigger id="edit-gender" className="border-[#E8C7C8] focus:ring-[#C6A75E]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Männlich (Lieber ... / du/dich/deine)</SelectItem>
                  <SelectItem value="female">Weiblich (Liebe ... / du/dich/deine)</SelectItem>
                  <SelectItem value="plural">Mehrere Personen (Liebe ... / ihr/euch/eure)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500 mt-1">
                Legt die Anrede und das Geschlecht fest
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleUpdateGuest}
                className="flex-1 bg-[#C6A75E] hover:bg-[#A3B18A] text-white"
              >
                Speichern
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="flex-1 border-[#E8C7C8]"
              >
                Abbrechen
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Accommodation View Component
function AccommodationView({ stats }: { stats: DashboardStats | null }) {
  if (!stats) return null;

  // Filter RSVPs where guests are attending and need accommodation
  const guestsNeedingAccommodation = stats.rsvps.filter(
    rsvp => rsvp.attending && rsvp.needsAccommodation
  );

  // Calculate total persons needing accommodation
  const totalPersonsNeedingAccommodation = guestsNeedingAccommodation.reduce(
    (total, rsvp) => total + rsvp.numberOfGuests,
    0
  );

  // Calculate total persons NOT needing accommodation
  const guestsNotNeedingAccommodation = stats.rsvps.filter(
    rsvp => rsvp.attending && !rsvp.needsAccommodation
  );
  const totalPersonsNotNeedingAccommodation = guestsNotNeedingAccommodation.reduce(
    (total, rsvp) => total + rsvp.numberOfGuests,
    0
  );

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-[#C6A75E] bg-gradient-to-br from-[#C6A75E]/10 to-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Bed className="size-4 text-[#C6A75E]" />
              Benötigen Schlafplatz
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#C6A75E]">{guestsNeedingAccommodation.length}</div>
            <p className="text-xs text-slate-500 mt-1">
              Gäste
            </p>
          </CardContent>
        </Card>

        <Card className="border border-[#A3B18A] bg-gradient-to-br from-[#A3B18A]/10 to-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Users className="size-4 text-[#A3B18A]"/>
              Personen mit Schlafplatz
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#A3B18A]">{totalPersonsNeedingAccommodation}</div>
            <p className="text-xs text-slate-500 mt-1">
              Personen insgesamt
            </p>
          </CardContent>
        </Card>

        <Card className="border border-[#E8C7C8] bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Home className="size-4 text-slate-600" />
              Kein Schlafplatz nötig
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-600">{guestsNotNeedingAccommodation.length}</div>
            <p className="text-xs text-slate-500 mt-1">
              Gäste
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Guests Needing Accommodation */}
      {guestsNeedingAccommodation.length > 0 && (
        <Card className="border border-[#E8C7C8] bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Bed className="size-5 text-[#C6A75E]"/>
              Gäste mit Schlafplatz-Bedarf
            </CardTitle>
            <CardDescription>
              Übersicht aller Gäste, die einen Schlafplatz benötigen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-[#E8C7C8] overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F6F1E9]/50">
                    <TableHead>Name</TableHead>
                    <TableHead>Anzahl Personen</TableHead>
                    <TableHead>Geantwortet am</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {guestsNeedingAccommodation.map((rsvp) => (
                    <TableRow key={rsvp.code}>
                      <TableCell className="font-medium">{rsvp.guestName}</TableCell>
                      <TableCell>
                        <Badge className="bg-[#C6A75E] hover:bg-[#A3B18A]">
                          {rsvp.numberOfGuests} {rsvp.numberOfGuests === 1 ? 'Person' : 'Personen'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {new Date(rsvp.submittedAt).toLocaleDateString("de-DE", {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {guestsNeedingAccommodation.length === 0 && (
        <Card className="border border-[#E8C7C8] bg-white shadow-sm">
          <CardContent className="py-12 text-center">
            <Bed className="size-16 text-slate-300 mx-auto mb-4" />
            <p className="text-lg text-slate-600 font-medium mb-2">
              Keine Schlafplatz-Anfragen
            </p>
            <p className="text-sm text-slate-400">
              Bisher hat noch kein Gast einen Schlafplatz angefordert.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}