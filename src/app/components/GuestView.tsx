import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Heart, Users, Bed, ChefHat, Utensils, Clock, Leaf, Home as HomeIcon, Image as ImageIcon, XCircle, LogOut, Minus, Plus, Trash2, Phone, MessageCircle, Sparkles, Pencil } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";
import { toast } from "sonner";
import { PhotobookGallery } from "./PhotobookGallery";
import { TJAView } from "./TJAView";

interface Guest {
  code: string;
  name: string;
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
  foodItems: FoodItem[];
  needsAccommodation: boolean;
}

export function GuestView() {
  const navigate = useNavigate();
  const { code } = useParams<{ code: string }>();
  const [guest, setGuest] = useState<Guest | null>(null);
  const [rsvp, setRsvp] = useState<RSVP | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentView, setCurrentView] = useState<"invitation" | "buffet" | "gallery" | "tja">("invitation");
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [attending, setAttending] = useState<boolean | null>(null);
  const [numberOfGuests, setNumberOfGuests] = useState(2);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([{ name: "", isVegetarian: false, isVegan: false, category: 'Hauptspeise' }]);
  const [needsAccommodation, setNeedsAccommodation] = useState(false);

  // Carousel state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const carouselImages = [
    "https://images.unsplash.com/photo-1759850845355-48359dba30e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwd2VkZGluZyUyMGNodXJjaCUyMGNlcmVtb255fGVufDF8fHx8MTc3Mjg5OTcxNnww&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1771315021882-f881c02c6b3b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb21hbnRpYyUyMHdlZGRpbmclMjBjb3VwbGUlMjBjZWxlYnJhdGlvbnxlbnwxfHx8fDE3NzI4OTk3MTd8MA&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1767986012547-3fc29b18339f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwcmVjZXB0aW9uJTIwZWxlZ2FudCUyMGRlY29yfGVufDF8fHx8MTc3MjgxNDg4Mnww&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1649228167407-602c5437da82?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwcmluZ3MlMjBmbG93ZXJzJTIwYm91cXVldHxlbnwxfHx8fDE3NzI4OTk3MTh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1762216444919-043cf813e4de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwdmVudWUlMjBvdXRkb29yJTIwZ2FyZGVufGVufDF8fHx8MTc3MjgzMjUwMHww&ixlib=rb-4.1.0&q=80&w=1080"
  ];

  // Helper function for dynamic texts based on singular/plural and gender
  const getTexts = (gender: 'male' | 'female' | 'plural' = 'male') => {
    const isPlural = gender === 'plural';
    const greeting = gender === 'male' ? 'Lieber' : gender === 'female' ? 'Liebe' : 'Liebe';
    
    return {
      greeting,
      attending: isPlural ? "Werdet ihr an unserer Hochzeit teilnehmen?" : "Wirst du an unserer Hochzeit teilnehmen?",
      attendingYes: isPlural ? "Ja, wir kommen gerne" : "Ja, ich komme gerne",
      attendingNo: isPlural ? "Leider können wir nicht teilnehmen" : "Leider kann ich nicht teilnehmen",
      food: isPlural ? "Was möchtet ihr zum Buffet beitragen?" : "Was möchtest du zum Buffet beitragen?",
      accommodation: isPlural ? "Braucht ihr eine Übernachtungsmöglichkeit?" : "Brauchst du eine Übernachtungsmöglichkeit?",
      yesPlease: "Ja, bitte",
      noThanks: "Nein, danke",
      joyfulMessage: isPlural ? "wir freuen uns riesig, dass ihr dabei seid!" : "wir freuen uns riesig, dass du dabei bist!",
      meaningMessage: isPlural ? "Es bedeutet uns sehr viel, dass ihr an diesem besonderen Tag dabei sein werdet." : "Es bedeutet uns sehr viel, dass du an diesem besonderen Tag dabei sein wirst.",
      excitedMessage: isPlural ? "Wir können es kaum erwarten, diesen unvergesslichen Moment mit euch zu feiern!" : "Wir können es kaum erwarten, diesen unvergesslichen Moment mit dir zu feiern!",
      sadMessage: isPlural ? "schade, dass ihr nicht dabei sein könnt" : "schade, dass du nicht dabei sein kannst",
      sadMessageLong: isPlural ? "Wir werden an euch denken und hoffen, dass wir bald wieder zusammen feiern können." : "Wir werden an dich denken und hoffen, dass wir bald wieder zusammen feiern können.",
      yourDetails: isPlural ? "Eure Angaben" : "Deine Angaben",
      yourDetailsDesc: isPlural ? "Übersicht eurer Rückmeldung" : "Übersicht deiner Rückmeldung",
      yourBuffet: isPlural ? "Euer Buffet-Beitrag" : "Dein Buffet-Beitrag",
    };
  };

  useEffect(() => {
    loadGuestData();
  }, []);

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, [carouselImages.length]);

  const loadGuestData = async () => {
    if (!code) return;

    setIsLoading(true);
    try {
      // Load guest info
      const guestResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bda29bfd/guest/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ code }),
        }
      );

      const guestData = await guestResponse.json();
      
      if (!guestResponse.ok || !guestData.success) {
        toast.error("Ungültiger Code");
        navigate("/");
        return;
      }

      setGuest(guestData.guest);

      // Load existing RSVP
      const rsvpResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bda29bfd/guest/rsvp/${code}`,
        {
          headers: {
            "Authorization": `Bearer ${publicAnonKey}`,
          },
        }
      );

      const rsvpData = await rsvpResponse.json();
      
      if (rsvpData.rsvp) {
        // Migrate old format to new format if needed
        let migratedRsvp = { ...rsvpData.rsvp };
        
        // If foodItems doesn't exist but foodItem does, migrate it
        if (!migratedRsvp.foodItems && migratedRsvp.foodItem) {
          migratedRsvp.foodItems = [{
            name: migratedRsvp.foodItem,
            isVegetarian: migratedRsvp.isVegetarian || false,
            isVegan: migratedRsvp.isVegan || false,
            category: migratedRsvp.category || 'Hauptspeise'
          }];
        }
        
        // Ensure foodItems is always an array
        if (!migratedRsvp.foodItems) {
          migratedRsvp.foodItems = [];
        }
        
        setRsvp(migratedRsvp);
      }
    } catch (error) {
      console.error("Error loading guest data:", error);
      toast.error("Fehler beim Laden der Daten");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (attending === null) {
      toast.error("Bitte wählen Sie Zusage oder Absage");
      return;
    }

    if (attending && foodItems.length === 0) {
      toast.error("Bitte geben Sie mindestens eine Speise ein");
      return;
    }

    if (attending && foodItems.some(item => !item.name.trim())) {
      toast.error("Bitte füllen Sie alle Speisen-Felder aus oder löschen Sie leere Einträge");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bda29bfd/guest/rsvp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            code: code, // Use code from URL params
            attending,
            numberOfGuests: attending ? numberOfGuests : 0,
            foodItems: attending ? foodItems.filter(item => item.name.trim()) : [],
            needsAccommodation: attending ? needsAccommodation : false,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Ihre Rückmeldung wurde gespeichert!");
        setRsvp(data.rsvp);
        setIsEditing(false);
        // Scroll to top when showing the invitation card
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        toast.error(data.error || "Fehler beim Speichern");
      }
    } catch (error) {
      console.error("Error submitting RSVP:", error);
      toast.error("Fehler beim Speichern");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditRSVP = () => {
    // Pre-fill form with existing RSVP data
    if (rsvp) {
      setAttending(rsvp.attending);
      setNumberOfGuests(rsvp.numberOfGuests);
      // Ensure at least one food item
      const items = rsvp.foodItems && rsvp.foodItems.length > 0 
        ? rsvp.foodItems 
        : [{ name: "", isVegetarian: false, isVegan: false, category: 'Hauptspeise' }];
      setFoodItems(items);
      setNeedsAccommodation(rsvp.needsAccommodation);
    }
    setIsEditing(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F6F1E9] via-[#E8C7C8]/20 to-white">
        <div className="text-center">
          <Heart className="size-16 text-[#C6A75E] animate-pulse mx-auto mb-4" />
          <p className="text-xl text-[#A3B18A]">Lädt...</p>
        </div>
      </div>
    );
  }

  // Error state - guest not found
  if (!guest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-white flex items-center justify-center p-6">
        <Card className="max-w-md border-2 border-[#E8C7C8]">
          <CardContent className="p-8 text-center">
            <XCircle className="size-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-serif text-slate-800 mb-2">Gast nicht gefunden</h2>
            <p className="text-slate-600 mb-6">Der eingegebene Code ist ungültig.</p>
            <Button
              onClick={() => navigate("/")}
              className="bg-[#C6A75E] hover:bg-[#A3B18A] text-white"
            >
              Zurück zur Anmeldung
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show RSVP form if not completed
  if (!rsvp || isEditing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F6F1E9] via-[#E8C7C8]/20 to-white p-4">
        <div className="max-w-3xl mx-auto py-8">
          <Card className="border border-[#E8C7C8] shadow-xl overflow-hidden bg-white">
            {/* Image Carousel */}
            <div className="relative h-80 overflow-hidden">
              {carouselImages.map((image, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Wedding ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>

            {/* Welcome Message under Image */}
            <div className="bg-gradient-to-br from-[#F6F1E9] via-white to-[#E8C7C8]/10 p-8 text-center border-b border-[#E8C7C8]/30">
              <h1 className="text-3xl font-serif mb-3 text-slate-800">Herzlich Willkommen</h1>
              <p className="text-xl text-slate-700 mb-2">
                {getTexts(guest.gender).greeting} <span className="font-semibold text-[#C6A75E]">{guest.name}</span>
              </p>
              <p className="text-base text-slate-600">
                Schön, dass du hier bist! Bitte fülle das folgende Formular aus.
              </p>
            </div>

            {/* Wedding Details */}
            <div className="bg-gradient-to-br from-[#E8C7C8]/30 via-[#F6F1E9]/50 to-white p-8 text-center border-b border-[#E8C7C8]/50">
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-[#E8C7C8]/30">
                <p className="text-sm uppercase tracking-wider text-[#A3B18A] font-medium mb-2">Kirchliche Trauung</p>
                <h2 className="text-3xl font-serif text-[#C6A75E] mb-4">18. Juli 2026</h2>
                <div className="space-y-2 text-slate-700">
                  <p className="text-lg font-medium">14:00 Uhr</p>
                  <div className="pt-2">
                    <p className="text-base font-medium">Echemer Kirche</p>
                    <p className="text-sm text-slate-600">An der Kirche 3, 21379 Echem</p>
                  </div>
                </div>
              </div>
            </div>
            
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Attending Section */}
                <div className="space-y-4">
                  <Label className="text-lg font-medium text-slate-700 flex items-center gap-2">
                    {getTexts(guest.gender).attending}
                  </Label>
                  <div className="space-y-3">
                    <div 
                      onClick={() => {
                        setAttending(true);
                        // Reset to default value if currently 0
                        if (numberOfGuests === 0) {
                          setNumberOfGuests(2);
                        }
                      }}
                      className={`p-5 border-2 rounded-lg cursor-pointer transition-all text-center ${
                        attending === true 
                          ? 'border-[#C6A75E] bg-[#C6A75E]/10 shadow-sm' 
                          : 'border-slate-200 bg-white hover:border-[#E8C7C8] hover:bg-[#E8C7C8]/10'
                      }`}
                    >
                      <p className="text-base font-medium text-slate-700">{getTexts(guest.gender).attendingYes}</p>
                    </div>
                    <div 
                      onClick={() => setAttending(false)}
                      className={`p-5 border-2 rounded-lg cursor-pointer transition-all text-center ${
                        attending === false 
                          ? 'border-slate-300 bg-slate-50 shadow-sm' 
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <p className="text-base font-medium text-slate-700">{getTexts(guest.gender).attendingNo}</p>
                    </div>
                  </div>
                </div>

                {attending && (
                  <div className="space-y-8 pt-4">
                    {/* Number of Guests */}
                    <div className="space-y-4">
                      <Label className="text-lg font-medium text-slate-700 flex items-center gap-2">
                        <Users className="size-5 text-[#C6A75E]" />
                        Wie viele Personen kommen?
                      </Label>
                      <div className="flex items-center justify-center gap-6">
                        <Button
                          type="button"
                          onClick={() => setNumberOfGuests(Math.max(1, numberOfGuests - 1))}
                          className="bg-[#E8C7C8] hover:bg-[#C6A75E] text-white rounded-full w-12 h-12 p-0 shadow-sm"
                          disabled={numberOfGuests <= 1}
                        >
                          <Minus className="size-5" />
                        </Button>
                        
                        <div className="text-center min-w-[100px]">
                          <p className="text-5xl font-light text-[#C6A75E]">{numberOfGuests}</p>
                          <p className="text-sm text-slate-500 mt-1">
                            {numberOfGuests === 1 ? "Person" : "Personen"}
                          </p>
                        </div>
                        
                        <Button
                          type="button"
                          onClick={() => setNumberOfGuests(Math.min(10, numberOfGuests + 1))}
                          className="bg-[#E8C7C8] hover:bg-[#C6A75E] text-white rounded-full w-12 h-12 p-0 shadow-sm"
                          disabled={numberOfGuests >= 10}
                        >
                          <Plus className="size-5" />
                        </Button>
                      </div>
                    </div>

                    {/* Food Items */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <Label className="text-lg font-medium text-slate-700 flex items-center gap-2">
                          <ChefHat className="size-5 text-[#C6A75E]" />
                          {getTexts(guest.gender).food}
                        </Label>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              const newWindow = window.open('/buffet-view', '_blank', 'noopener,noreferrer');
                              if (!newWindow) {
                                toast.error('Bitte erlaube Pop-ups für diese Seite');
                              }
                            }}
                            variant="outline"
                            size="sm"
                            className="border-2 border-[#A3B18A] bg-white text-[#A3B18A] hover:bg-[#A3B18A] hover:text-white font-medium transition-all shadow-sm"
                          >
                            <Utensils className="size-4 mr-1" />
                            Buffetübersicht
                          </Button>
                          {foodItems.length < 3 && (
                            <Button
                              type="button"
                              onClick={() => setFoodItems([...foodItems, { name: "", isVegetarian: false, isVegan: false, category: 'Hauptspeise' }])}
                              variant="outline"
                              size="sm"
                              className="border-2 border-[#C6A75E] bg-white text-[#C6A75E] hover:bg-[#C6A75E] hover:text-white font-medium transition-all shadow-sm"
                            >
                              <Plus className="size-4 mr-1" />
                              Hinzufügen
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {foodItems.map((item, index) => (
                          <Card key={index} className="border border-[#E8C7C8] bg-white relative">
                            <CardContent className="p-5">
                              {foodItems.length >= 2 && (
                                <Button
                                  type="button"
                                  onClick={() => setFoodItems(foodItems.filter((_, i) => i !== index))}
                                  variant="outline"
                                  size="sm"
                                  className="absolute top-3 right-3 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 h-9 w-9 p-0 rounded-full"
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              )}
                              
                              <div className="space-y-3">
                                <Input
                                  type="text"
                                  value={item.name}
                                  onChange={(e) => {
                                    const newItems = [...foodItems];
                                    newItems[index] = { ...item, name: e.target.value };
                                    setFoodItems(newItems);
                                  }}
                                  placeholder={`Speise ${index + 1} (z.B. Nudelsalat, Obstkuchen)`}
                                  className="text-base p-4 border border-slate-200 focus:border-[#C6A75E]"
                                />
                                
                                <div className="flex flex-wrap gap-3">
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`vegetarian-${index}`}
                                      checked={item.isVegetarian}
                                      onCheckedChange={(checked) => {
                                        const newItems = [...foodItems];
                                        newItems[index] = { 
                                          ...item, 
                                          isVegetarian: !!checked,
                                          isVegan: checked ? false : item.isVegan
                                        };
                                        setFoodItems(newItems);
                                      }}
                                    />
                                    <Label htmlFor={`vegetarian-${index}`} className="cursor-pointer flex items-center gap-1 text-sm text-slate-600">
                                      <Leaf className="size-3 text-green-500" />
                                      Vegetarisch
                                    </Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`vegan-${index}`}
                                      checked={item.isVegan}
                                      onCheckedChange={(checked) => {
                                        const newItems = [...foodItems];
                                        newItems[index] = { 
                                          ...item, 
                                          isVegan: !!checked,
                                          isVegetarian: checked ? false : item.isVegetarian
                                        };
                                        setFoodItems(newItems);
                                      }}
                                    />
                                    <Label htmlFor={`vegan-${index}`} className="cursor-pointer flex items-center gap-1 text-sm text-slate-600">
                                      <Leaf className="size-3 text-emerald-500" />
                                      Vegan
                                    </Label>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    {/* Accommodation */}
                    <div className="space-y-4">
                      <Label className="text-lg font-medium text-slate-700 flex items-center gap-2 mb-4">
                        <Bed className="size-5 text-[#C6A75E]" />
                        {getTexts(guest.gender).accommodation}
                      </Label>
                      <p className="text-sm text-slate-500 mb-4 italic">
                        Wir haben keine Schlafplätze im Haus, aber können gerne Platz für Zelte o.ä. zur Verfügung stellen.
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div 
                          onClick={() => setNeedsAccommodation(true)}
                          className={`p-5 border-2 rounded-lg cursor-pointer transition-all text-center ${
                            needsAccommodation 
                              ? 'border-[#C6A75E] bg-[#C6A75E]/10 shadow-sm' 
                              : 'border-slate-200 bg-white hover:border-[#E8C7C8] hover:bg-[#E8C7C8]/10'
                          }`}
                        >
                          <p className="text-base font-medium text-slate-700">{getTexts(guest.gender).yesPlease}</p>
                        </div>
                        <div 
                          onClick={() => setNeedsAccommodation(false)}
                          className={`p-5 border-2 rounded-lg cursor-pointer transition-all text-center ${
                            !needsAccommodation 
                              ? 'border-[#A3B18A] bg-[#A3B18A]/10 shadow-sm' 
                              : 'border-slate-200 bg-white hover:border-[#E8C7C8] hover:bg-[#E8C7C8]/10'
                          }`}
                        >
                          <p className="text-base font-medium text-slate-700">{getTexts(guest.gender).noThanks}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-[#C6A75E] hover:bg-[#A3B18A] text-white text-lg py-6 rounded-lg shadow-sm"
                  disabled={isSubmitting || attending === null}
                >
                  {isSubmitting ? "Wird gespeichert..." : "Rückmeldung absenden"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Navigation for completed RSVP
  const renderNavigation = () => (
    <nav className="bg-white/95 backdrop-blur-md border-b border-[#E8C7C8]/30 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Title */}
          <div className="flex items-center gap-2">
            <Heart className="size-6 text-[#C6A75E] fill-[#C6A75E]" />
            <span className="text-xl font-serif text-slate-800">Unsere Hochzeit</span>
          </div>

          {/* Main Navigation */}
          <div className="flex gap-6">
            <button
              onClick={() => setCurrentView("invitation")}
              className={`group flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                currentView === "invitation" 
                  ? "text-[#C6A75E]" 
                  : "text-slate-600 hover:text-[#C6A75E]"
              }`}
            >
              <Heart className={`size-5 transition-all duration-200 ${
                currentView === "invitation" 
                  ? "fill-[#C6A75E]" 
                  : "group-hover:fill-[#C6A75E]/30"
              }`} />
              <span className="font-medium text-sm">Einladung</span>
              {currentView === "invitation" && (
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
              onClick={() => setCurrentView("gallery")}
              className={`group flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                currentView === "gallery" 
                  ? "text-[#C6A75E]" 
                  : "text-slate-600 hover:text-[#C6A75E]"
              }`}
            >
              <ImageIcon className={`size-5 transition-all duration-200 ${
                currentView === "gallery" 
                  ? "stroke-[#C6A75E]" 
                  : ""
              }`} />
              <span className="font-medium text-sm">Galerie</span>
              {currentView === "gallery" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C6A75E] rounded-full" />
              )}
            </button>
            
            <button
              onClick={() => setCurrentView("tja")}
              className={`group flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                currentView === "tja" 
                  ? "text-[#C6A75E]" 
                  : "text-slate-600 hover:text-[#C6A75E]"
              }`}
            >
              <Sparkles className={`size-5 transition-all duration-200 ${
                currentView === "tja" 
                  ? "stroke-[#C6A75E]" 
                  : ""
              }`} />
              <span className="font-medium text-sm">Fotos teilen</span>
              {currentView === "tja" && (
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
    </nav>
  );

  const renderInvitation = () => (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="border border-[#E8C7C8] shadow-2xl bg-white overflow-hidden">
        {/* Top Section: Welcome Message */}
        <div className="bg-gradient-to-br from-[#E8C7C8]/20 via-[#F6F1E9] to-white p-12 text-center border-b border-[#E8C7C8]/30">
          <Heart className="size-16 text-[#C6A75E] mx-auto mb-6" />
          
          {rsvp.attending ? (
            <>
              <p className="text-lg text-slate-600 mb-3">{getTexts(guest.gender).greeting} <span className="font-semibold text-[#C6A75E]">{guest.name}</span>,</p>
              <h1 className="text-4xl font-serif text-slate-800 mb-4">{getTexts(guest.gender).joyfulMessage}</h1>
              <p className="text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
                {getTexts(guest.gender).meaningMessage} 
                {getTexts(guest.gender).excitedMessage}
              </p>
            </>
          ) : (
            <>
              <p className="text-lg text-slate-600 mb-3">{getTexts(guest.gender).greeting} <span className="font-semibold text-[#C6A75E]">{guest.name}</span>,</p>
              <h1 className="text-4xl font-serif text-slate-800 mb-4">{getTexts(guest.gender).sadMessage}</h1>
              <p className="text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
                {getTexts(guest.gender).sadMessageLong}
              </p>
            </>
          )}
        </div>
        
        {/* Wedding Details Section */}
        <div className="bg-gradient-to-br from-[#F6F1E9] via-white to-[#E8C7C8]/10 p-10 border-b border-[#E8C7C8]/30">
          <div className="text-center space-y-5">
            <div>
              <p className="text-sm uppercase tracking-wider text-[#A3B18A] font-medium mb-2">Kirchliche Trauung</p>
              <h2 className="text-5xl font-serif text-[#C6A75E] mb-6">18. Juli 2026</h2>
            </div>
            
            <div className="space-y-3 text-slate-700">
              <div className="flex items-center justify-center gap-3">
                <div className="w-20 h-px bg-[#E8C7C8]"></div>
                <p className="text-2xl font-medium">14:00 Uhr</p>
                <div className="w-20 h-px bg-[#E8C7C8]"></div>
              </div>
              
              <div className="pt-2">
                <p className="text-xl font-medium text-slate-800">Echemer Kirche</p>
                <p className="text-base text-slate-600">An der Kirche 3</p>
                <p className="text-base text-slate-600">21379 Echem</p>
              </div>
            </div>
          </div>
        </div>

        {/* RSVP Details Section (only for attending guests) */}
        {rsvp.attending && (
          <CardContent className="p-10 border-b border-[#E8C7C8]/30">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-serif text-slate-800">{getTexts(guest.gender).yourDetails}</h3>
              <Button
                onClick={handleEditRSVP}
                variant="outline"
                className="border-2 border-[#C6A75E] text-[#A3B18A] hover:bg-[#C6A75E]/10 hover:border-[#A3B18A] px-4 py-2 text-sm font-medium"
              >
                <Pencil className="size-4 mr-2" />
                Angaben ändern
              </Button>
            </div>

            {/* RSVP Details Cards */}
            <div className="grid md:grid-cols-2 gap-5 mb-8">
              {/* Guests Count */}
              <Card className="border border-[#E8C7C8] bg-gradient-to-br from-white to-[#F6F1E9]/30">
                <CardContent className="p-6 text-center">
                  <Users className="size-10 text-[#C6A75E] mx-auto mb-3" />
                  <p className="text-sm uppercase tracking-wide text-slate-500 mb-2">Anzahl Gäste</p>
                  <p className="text-4xl font-light text-[#C6A75E] mb-1">{rsvp.numberOfGuests}</p>
                  <p className="text-sm text-slate-600">
                    {rsvp.numberOfGuests === 1 ? "Person" : "Personen"}
                  </p>
                </CardContent>
              </Card>

              {/* Accommodation */}
              <Card className="border border-[#E8C7C8] bg-gradient-to-br from-white to-[#F6F1E9]/30">
                <CardContent className="p-6 text-center">
                  <Bed className="size-10 text-[#C6A75E] mx-auto mb-3" />
                  <p className="text-sm uppercase tracking-wide text-slate-500 mb-2">Übernachtung</p>
                  <p className="text-lg font-medium text-slate-800 mt-2">
                    {rsvp.needsAccommodation ? "Wird benötigt" : "Nicht benötigt"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Buffet Contributions */}
            {rsvp.foodItems && rsvp.foodItems.length > 0 && (
              <div>
                <div className="text-center mb-6">
                  <ChefHat className="size-10 text-[#C6A75E] mx-auto mb-2" />
                  <p className="text-sm uppercase tracking-wide text-slate-500">{getTexts(guest.gender).yourBuffet}</p>
                </div>
                
                <div className={`grid gap-4 mb-8 ${
                  rsvp.foodItems.length === 1 ? 'grid-cols-1 max-w-md mx-auto' :
                  rsvp.foodItems.length === 2 ? 'grid-cols-2 max-w-2xl mx-auto' :
                  'grid-cols-3'
                }`}>
                  {rsvp.foodItems.map((item, index) => (
                    <Card 
                      key={index} 
                      className="border border-[#E8C7C8] bg-gradient-to-br from-white to-[#F6F1E9]/20"
                    >
                      <CardContent className="p-5 text-center">
                        <p className="text-lg font-medium text-slate-800 mb-2">{item.name}</p>
                        {(item.isVegetarian || item.isVegan) && (
                          <div className="flex justify-center gap-2 mt-2">
                            {item.isVegetarian && (
                              <Badge className="bg-green-50 text-green-700 border border-green-200 text-xs">
                                <Leaf className="size-3 mr-1" />
                                Vegetarisch
                              </Badge>
                            )}
                            {item.isVegan && (
                              <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs">
                                <Leaf className="size-3 mr-1" />
                                Vegan
                              </Badge>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        )}

        {/* Trauzeugen Kontakt Section */}
        <div className="bg-white p-8">
          <div className="text-center mb-6">
            <h3 className="text-xl font-serif text-slate-800 mb-2">Deine Ansprechpartner</h3>
            <p className="text-sm text-slate-500">Bei Fragen kannst du dich gerne an unsere Trauzeugen wenden</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Celli */}
            <Card className="border border-[#E8C7C8] bg-gradient-to-br from-white to-[#F6F1E9]/20">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-[#C6A75E]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="size-8 text-[#C6A75E]" />
                </div>
                <p className="text-lg font-medium text-slate-800 mb-4">Celli</p>
                <div className="flex gap-3 justify-center">
                  <a
                    href="https://wa.me/491234567890"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all shadow-sm"
                  >
                    <MessageCircle className="size-4" />
                    <span className="text-sm font-medium">WhatsApp</span>
                  </a>
                  <a
                    href="tel:+491234567890"
                    className="flex items-center gap-2 px-4 py-2 bg-[#C6A75E] hover:bg-[#A3B18A] text-white rounded-lg transition-all shadow-sm"
                  >
                    <Phone className="size-4" />
                    <span className="text-sm font-medium">Anrufen</span>
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Jenny */}
            <Card className="border border-[#E8C7C8] bg-gradient-to-br from-white to-[#F6F1E9]/20">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-[#E8C7C8]/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="size-8 text-[#C6A75E]" />
                </div>
                <p className="text-lg font-medium text-slate-800 mb-4">Jenny</p>
                <div className="flex gap-3 justify-center">
                  <a
                    href="https://wa.me/490987654321"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all shadow-sm"
                  >
                    <MessageCircle className="size-4" />
                    <span className="text-sm font-medium">WhatsApp</span>
                  </a>
                  <a
                    href="tel:+490987654321"
                    className="flex items-center gap-2 px-4 py-2 bg-[#C6A75E] hover:bg-[#A3B18A] text-white rounded-lg transition-all shadow-sm"
                  >
                    <Phone className="size-4" />
                    <span className="text-sm font-medium">Anrufen</span>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderBuffet = () => <BuffetView />;
  const renderGallery = () => <PhotobookGallery />;
  const renderTJA = () => <TJAView />;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Utensils className="size-12 text-rose-500 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-white">
      {renderNavigation()}
      <div className="py-8">
        {currentView === "invitation" && renderInvitation()}
        {currentView === "buffet" && renderBuffet()}
        {currentView === "gallery" && renderGallery()}
        {currentView === "tja" && renderTJA()}
      </div>
    </div>
  );
}

// Buffet View Component
function BuffetView() {
  const [buffetList, setBuffetList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<'Alle' | 'Vorspeise' | 'Hauptspeise' | 'Nachspeise'>('Alle');

  useEffect(() => {
    loadBuffetList();
  }, []);

  const loadBuffetList = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bda29bfd/buffet`,
        {
          headers: {
            "Authorization": `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setBuffetList(data.buffetList);
      }
    } catch (error) {
      console.error("Error loading buffet list:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Gruppiere und sortiere Speisen nach Kategorien (alphabetisch)
  const categorizedBuffet = {
    Vorspeise: buffetList
      .filter(item => item.category === 'Vorspeise')
      .sort((a, b) => a.foodItem.localeCompare(b.foodItem, 'de')),
    Hauptspeise: buffetList
      .filter(item => item.category === 'Hauptspeise')
      .sort((a, b) => a.foodItem.localeCompare(b.foodItem, 'de')),
    Nachspeise: buffetList
      .filter(item => item.category === 'Nachspeise')
      .sort((a, b) => a.foodItem.localeCompare(b.foodItem, 'de')),
  };

  // Erstelle gefilterte Liste basierend auf Auswahl
  const getFilteredItems = () => {
    if (selectedCategory === 'Alle') {
      return [
        ...categorizedBuffet.Vorspeise,
        ...categorizedBuffet.Hauptspeise,
        ...categorizedBuffet.Nachspeise,
      ];
    }
    return categorizedBuffet[selectedCategory];
  };

  const filteredItems = getFilteredItems();

  // Bestimme welche Kategorien angezeigt werden sollen
  const categoriesToShow = selectedCategory === 'Alle' 
    ? (['Vorspeise', 'Hauptspeise', 'Nachspeise'] as const)
    : ([selectedCategory] as const);

  return (
    <div className="max-w-4xl mx-auto px-6">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-serif text-slate-800">Unser Buffet</h2>
      </div>

      {/* Category Tabs */}
      <div className="mb-8 flex justify-center">
        <div className="inline-flex gap-2 bg-white p-2 rounded-lg border border-rose-200 shadow-sm">
          {(['Alle', 'Vorspeise', 'Hauptspeise', 'Nachspeise'] as const).map((category) => {
            const count = category === 'Alle' 
              ? buffetList.length 
              : categorizedBuffet[category]?.length || 0;
            
            return (
              <Button
                key={category}
                variant="ghost"
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-md transition-all ${
                  selectedCategory === category
                    ? "bg-rose-100 text-rose-700 shadow-sm"
                    : "text-slate-600 hover:bg-rose-50 hover:text-rose-600"
                }`}
              >
                <span className="font-medium">{category}</span>
                <Badge 
                  variant="outline" 
                  className={`ml-2 ${
                    selectedCategory === category
                      ? "border-rose-300 text-rose-700 bg-white"
                      : "border-slate-200 text-slate-500"
                  }`}
                >
                  {count}
                </Badge>
              </Button>
            );
          })}
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <Card className="p-12 text-center border border-slate-200">
          <ChefHat className="size-12 text-slate-300 mx-auto mb-4" />
          <p className="text-lg text-slate-500">Noch keine Buffet-Beiträge in dieser Kategorie</p>
        </Card>
      ) : (
        <div className="space-y-8">
          {categoriesToShow.map((category) => {
            const items = categorizedBuffet[category];
            if (items.length === 0) return null;

            return (
              <div key={category} className="space-y-3">
                {/* Category Header */}
                <div className="bg-gradient-to-r from-rose-100 via-pink-50 to-rose-50 px-5 py-3 rounded-lg border border-rose-200">
                  <h3 className="text-xl font-serif text-slate-700 flex items-center justify-between">
                    <span>{category}</span>
                    <Badge variant="outline" className="border-rose-300 text-rose-700 bg-white">
                      {items.length} {items.length === 1 ? 'Gericht' : 'Gerichte'}
                    </Badge>
                  </h3>
                </div>
                
                {/* Category Items */}
                <div className="space-y-2">
                  {items.map((item, index) => (
                    <Card key={index} className="border border-rose-200 hover:border-rose-300 transition-all bg-white">
                      <CardContent className="p-3">
                        <div className="flex items-start gap-4">
                          {/* Left: Food Name & Labels */}
                          <div className="flex-1 min-w-0 pr-2">
                            <h4 className="text-base font-medium text-slate-800 mb-2 break-words">{item.foodItem}</h4>
                            <div className="flex flex-wrap gap-1.5">
                              {item.isVegetarian && (
                                <Badge className="bg-green-50 text-green-700 border border-green-200 text-xs font-normal">
                                  <Leaf className="size-3 mr-1" />
                                  Vegetarisch
                                </Badge>
                              )}
                              {item.isVegan && (
                                <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-normal">
                                  <Leaf className="size-3 mr-1" />
                                  Vegan
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          {/* Right: Chef Icon & Guest Name - Fixed width to keep alignment */}
                          <div className="flex flex-col items-center gap-1 w-20 flex-shrink-0">
                            <ChefHat className="size-6 text-rose-300" />
                            <p className="text-xs text-slate-500 text-center break-words w-full leading-tight">
                              {item.guestName}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary */}
      {filteredItems.length > 0 && (
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            Insgesamt {filteredItems.length} {filteredItems.length === 1 ? 'Gericht' : 'Gerichte'}
          </p>
        </div>
      )}
    </div>
  );
}