import { useState, useEffect } from "react";
import { Utensils } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";

export function BuffetListView() {
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F6F1E9] via-[#E8C7C8]/20 to-white">
        <Utensils className="size-12 text-[#C6A75E] animate-pulse" />
      </div>
    );
  }

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
    <div className="min-h-screen bg-gradient-to-br from-[#F6F1E9] via-[#E8C7C8]/20 to-white">
      {/* Header with Close Button */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-[#E8C7C8]/50 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Utensils className="size-6 text-[#C6A75E]" />
            <h1 className="text-2xl font-serif text-slate-800">Buffetübersicht</h1>
          </div>
          <Button
            onClick={() => window.close()}
            variant="outline"
            className="border-[#E8C7C8] text-slate-600 hover:bg-[#E8C7C8]/10 hover:border-[#C6A75E]"
          >
            <X className="size-4 mr-2" />
            Schließen
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif text-slate-800 mb-2">Was andere mitbringen</h2>
          <p className="text-base text-slate-500">Alle bereits eingetragenen Buffet-Beiträge</p>
        </div>

        {/* Category Tabs */}
        <div className="mb-8 flex justify-center">
          <div className="inline-flex gap-2 bg-white p-2 rounded-lg border border-[#E8C7C8] shadow-sm">
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
                      ? "bg-[#E8C7C8]/30 text-[#A3B18A] shadow-sm"
                      : "text-slate-600 hover:bg-[#E8C7C8]/10 hover:text-[#C6A75E]"
                  }`}
                >
                  <span className="font-medium">{category}</span>
                  <Badge 
                    variant="outline" 
                    className={`ml-2 ${
                      selectedCategory === category
                        ? "border-[#C6A75E] text-[#C6A75E] bg-white"
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
          <Card className="p-12 text-center border border-[#E8C7C8] bg-white">
            <ChefHat className="size-12 text-slate-300 mx-auto mb-4" />
            <p className="text-lg text-slate-500">
              {selectedCategory === 'Alle' 
                ? "Noch keine Buffet-Beiträge vorhanden" 
                : `Noch keine ${selectedCategory} vorhanden`}
            </p>
          </Card>
        ) : (
          <div className="space-y-8">
            {categoriesToShow.map((category) => {
              const items = categorizedBuffet[category];
              if (items.length === 0) return null;

              return (
                <div key={category} className="space-y-3">
                  {/* Category Header */}
                  <div className="bg-gradient-to-r from-[#E8C7C8]/30 via-[#F6F1E9]/50 to-[#E8C7C8]/20 px-5 py-3 rounded-lg border border-[#E8C7C8]">
                    <h3 className="text-xl font-serif text-slate-700 flex items-center justify-between">
                      <span>{category}</span>
                      <Badge variant="outline" className="border-[#C6A75E] text-[#C6A75E] bg-white">
                        {items.length} {items.length === 1 ? 'Gericht' : 'Gerichte'}
                      </Badge>
                    </h3>
                  </div>
                  
                  {/* Category Items */}
                  <div className="space-y-2">
                    {items.map((item, index) => (
                      <Card key={index} className="border border-[#E8C7C8] hover:border-[#C6A75E] transition-all bg-white">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            {/* Left: Food Name & Labels */}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-base font-medium text-slate-800 mb-2">{item.foodItem}</h4>
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
                            
                            {/* Right: Chef Icon & Guest Name */}
                            <div className="flex flex-col items-center gap-1 flex-shrink-0">
                              <ChefHat className="size-6 text-[#C6A75E]" />
                              <p className="text-xs text-slate-500 text-center whitespace-nowrap">
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
    </div>
  );
}