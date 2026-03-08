import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Utensils, ChefHat, Leaf, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";
import { toast } from "sonner";

interface BuffetItem {
  guestName: string;
  foodItem: string;
  isVegetarian: boolean;
  isVegan: boolean;
  category: string;
  numberOfGuests: number;
}

export function BuffetList() {
  const navigate = useNavigate();
  const [buffetList, setBuffetList] = useState<BuffetItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      } else {
        toast.error("Fehler beim Laden der Buffetliste");
      }
    } catch (error) {
      console.error("Error loading buffet list:", error);
      toast.error("Fehler beim Laden der Buffetliste");
    } finally {
      setIsLoading(false);
    }
  };

  // Gruppiere Speisen nach Kategorien
  const categorizedBuffet = {
    Vorspeise: buffetList.filter(item => item.category === 'Vorspeise'),
    Hauptspeise: buffetList.filter(item => item.category === 'Hauptspeise'),
    Nachspeise: buffetList.filter(item => item.category === 'Nachspeise'),
  };

  const categoryIcons = {
    Vorspeise: '🥗',
    Hauptspeise: '🍽️',
    Nachspeise: '🍰',
  };

  const categoryColors = {
    Vorspeise: 'border-green-300 bg-green-50',
    Hauptspeise: 'border-orange-300 bg-orange-50',
    Nachspeise: 'border-pink-300 bg-pink-50',
  };

  const vegetarianItems = buffetList.filter(item => item.isVegetarian);
  const veganItems = buffetList.filter(item => item.isVegan);
  const totalVegetarian = vegetarianItems.length;
  const totalVegan = veganItems.length;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Utensils className="size-12 text-rose-500 animate-pulse mx-auto mb-4" />
          <p className="text-lg">Lädt Buffetliste...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-2"
        >
          <ArrowLeft className="size-4 mr-2" />
          Zurück
        </Button>

        <div className="text-center space-y-2">
          <h1 className="text-4xl font-serif font-bold flex items-center justify-center gap-3">
            <Utensils className="text-rose-500" />
            Buffetliste
          </h1>
        </div>

        {buffetList.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Utensils className="size-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">
                Noch keine Buffet-Beiträge vorhanden
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-2 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <Leaf className="size-5" />
                    Vegetarisch
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{totalVegetarian}</div>
                  <p className="text-sm text-muted-foreground">
                    {totalVegetarian === 1 ? 'Gericht' : 'Gerichte'}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-emerald-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-emerald-700">
                    <Leaf className="size-5" />
                    Vegan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-emerald-600">{totalVegan}</div>
                  <p className="text-sm text-muted-foreground">
                    {totalVegan === 1 ? 'Gericht' : 'Gerichte'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Categorized Buffet List */}
            <div className="space-y-8">
              {(['Vorspeise', 'Hauptspeise', 'Nachspeise'] as const).map((category) => {
                const items = categorizedBuffet[category];
                if (items.length === 0) return null;

                return (
                  <div key={category} className="space-y-4">
                    <div className={`p-4 rounded-xl border-2 ${categoryColors[category]}`}>
                      <h3 className="text-2xl font-serif text-gray-800 flex items-center gap-3">
                        <span className="text-3xl">{categoryIcons[category]}</span>
                        {category}
                        <Badge variant="outline" className="ml-auto">
                          {items.length} {items.length === 1 ? 'Gericht' : 'Gerichte'}
                        </Badge>
                      </h3>
                    </div>
                    
                    <div className="space-y-3 pl-4">
                      {items.map((item, index) => (
                        <Card key={index} className="border-2 border-rose-200 hover:border-rose-400 transition-all">
                          <CardContent className="p-5">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="p-2 bg-rose-100 rounded-full">
                                    <Utensils className="size-4 text-rose-700" />
                                  </div>
                                  <div>
                                    <p className="font-semibold text-lg">{item.foodItem}</p>
                                    <p className="text-sm text-muted-foreground">von {item.guestName}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 ml-11">
                                  {item.isVegetarian && (
                                    <Badge variant="outline" className="bg-green-50 border-green-300 text-green-700">
                                      <Leaf className="size-3 mr-1" />
                                      Vegetarisch
                                    </Badge>
                                  )}
                                  {item.isVegan && (
                                    <Badge variant="outline" className="bg-emerald-50 border-emerald-300 text-emerald-700">
                                      <Leaf className="size-3 mr-1" />
                                      Vegan
                                    </Badge>
                                  )}
                                </div>
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
          </>
        )}
      </div>
    </div>
  );
}