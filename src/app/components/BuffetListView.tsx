import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Utensils, X, ChefHat, Leaf } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";

type BuffetCategory = "Vorspeise" | "Hauptspeise" | "Nachspeise";
type FilterCategory = "Alle" | BuffetCategory;

interface BuffetItem {
  foodItem: string;
  guestName: string;
  category: BuffetCategory;
  isVegetarian?: boolean;
  isVegan?: boolean;
}

const CATEGORY_OPTIONS: FilterCategory[] = [
  "Alle",
  "Vorspeise",
  "Hauptspeise",
  "Nachspeise",
];

const BUFFET_CATEGORIES: BuffetCategory[] = [
  "Vorspeise",
  "Hauptspeise",
  "Nachspeise",
];

export function BuffetListView() {
  const navigate = useNavigate();
  const [buffetList, setBuffetList] = useState<BuffetItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] =
    useState<FilterCategory>("Alle");

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
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success && Array.isArray(data.buffetList)) {
        setBuffetList(data.buffetList);
      } else {
        setBuffetList([]);
      }
    } catch (error) {
      console.error("Error loading buffet list:", error);
      setBuffetList([]);
    } finally {
      setIsLoading(false);
    }
  };

  const categorizedBuffet = useMemo(
    () => ({
      Vorspeise: buffetList
        .filter((item) => item.category === "Vorspeise")
        .sort((a, b) => a.foodItem.localeCompare(b.foodItem, "de")),
      Hauptspeise: buffetList
        .filter((item) => item.category === "Hauptspeise")
        .sort((a, b) => a.foodItem.localeCompare(b.foodItem, "de")),
      Nachspeise: buffetList
        .filter((item) => item.category === "Nachspeise")
        .sort((a, b) => a.foodItem.localeCompare(b.foodItem, "de")),
    }),
    [buffetList]
  );

  const filteredItems = useMemo(() => {
    if (selectedCategory === "Alle") {
      return [
        ...categorizedBuffet.Vorspeise,
        ...categorizedBuffet.Hauptspeise,
        ...categorizedBuffet.Nachspeise,
      ];
    }

    return categorizedBuffet[selectedCategory];
  }, [categorizedBuffet, selectedCategory]);

  const categoriesToShow: BuffetCategory[] =
    selectedCategory === "Alle" ? BUFFET_CATEGORIES : [selectedCategory];

  const handleClose = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F6F1E9] via-[#E8C7C8]/20 to-white px-4">
        <Utensils className="size-12 text-[#C6A75E] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F1E9] via-[#E8C7C8]/20 to-white">
      <div className="bg-white/80 backdrop-blur-sm border-b border-[#E8C7C8]/50 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Utensils className="size-5 sm:size-6 text-[#C6A75E] shrink-0" />
            <h1 className="text-xl sm:text-2xl font-serif text-slate-800 truncate">
              Buffetübersicht
            </h1>
          </div>

          <Button
            onClick={handleClose}
            variant="outline"
            className="border-[#E8C7C8] text-slate-600 hover:bg-[#E8C7C8]/10 hover:border-[#C6A75E] shrink-0 min-h-[44px] px-3 sm:px-4 text-sm sm:text-base"
          >
            <X className="size-4 mr-1 sm:mr-2" />
            Zurück
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-serif text-slate-800">
            Was andere mitbringen
          </h2>
        </div>

        <div className="mb-6 sm:mb-8 w-full">
          <div className="w-full overflow-x-auto">
            <div className="flex w-full min-w-max gap-2 bg-white p-2 rounded-lg border border-[#DDB9BB] shadow-sm">
              {CATEGORY_OPTIONS.map((category) => {
                const count =
                  category === "Alle"
                    ? buffetList.length
                    : categorizedBuffet[category].length;

                return (
                  <Button
                    key={category}
                    variant="ghost"
                    onClick={() => setSelectedCategory(category)}
                    className={`flex-1 min-h-[44px] px-4 sm:px-6 py-2 rounded-md transition-all whitespace-nowrap ${
                      selectedCategory === category
                        ? "bg-[#DDB9BB] text-[#6F7E5D] shadow-sm"
                        : "text-slate-700 hover:bg-[#F1E1E2] hover:text-[#A67C52]"
                    }`}
                  >
                    <span className="font-medium">{category}</span>
                    <Badge
                      variant="outline"
                      className={`ml-2 ${
                        selectedCategory === category
                          ? "border-[#B98A45] text-[#B98A45] bg-white"
                          : "border-slate-300 text-slate-600 bg-white"
                      }`}
                    >
                      {count}
                    </Badge>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <Card className="p-8 sm:p-12 text-center border border-[#E8C7C8] bg-white">
            <ChefHat className="size-10 sm:size-12 text-slate-300 mx-auto mb-4" />
            <p className="text-base sm:text-lg text-slate-500">
              {selectedCategory === "Alle"
                ? "Noch keine Buffet-Beiträge vorhanden"
                : `Noch keine ${selectedCategory} vorhanden`}
            </p>
          </Card>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {categoriesToShow.map((category) => {
              const items = categorizedBuffet[category];

              if (items.length === 0) return null;

              return (
                <div key={category} className="space-y-3">
                  <div className="px-4 sm:px-5 py-3 rounded-lg border border-[#D4A7AA] bg-gradient-to-r from-[#E3B9BC] via-[#F3E6D8] to-[#E8C7C8] shadow-sm">
                    <h3 className="text-lg sm:text-xl font-serif text-slate-800 flex items-center justify-between gap-3">
                      <span className="min-w-0 break-words">{category}</span>
                      <Badge
                        variant="outline"
                        className="border-[#B98A45] text-[#8A6338] bg-white shrink-0"
                      >
                        {items.length} {items.length === 1 ? "Gericht" : "Gerichte"}
                      </Badge>
                    </h3>
                  </div>

                  <div className="space-y-2">
                    {items.map((item, index) => (
                      <Card
                        key={`${item.guestName}-${item.foodItem}-${index}`}
                        className="border border-[#E8C7C8] hover:border-[#C6A75E] transition-all bg-white"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3 sm:gap-4">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm sm:text-base font-medium text-slate-800 mb-2 break-words">
                                {item.foodItem}
                              </h4>

                              <div className="flex flex-wrap gap-1.5">
                                {item.isVegetarian && (
                                  <Badge className="bg-green-50 text-green-700 border border-green-300 text-xs font-normal">
                                    <Leaf className="size-3 mr-1" />
                                    Vegetarisch
                                  </Badge>
                                )}

                                {item.isVegan && (
                                  <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-300 text-xs font-normal">
                                    <Leaf className="size-3 mr-1" />
                                    Vegan
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-col items-center gap-1 flex-shrink-0 w-16 sm:w-20">
                              <ChefHat className="size-5 sm:size-6 text-[#C6A75E]" />
                              <p className="text-[11px] sm:text-xs text-slate-500 text-center break-words leading-tight w-full">
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
      </div>
    </div>
  );
}