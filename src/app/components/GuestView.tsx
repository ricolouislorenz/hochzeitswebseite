import { useState, useEffect, useRef, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router";
import {
  Heart,
  Users,
  Bed,
  ChefHat,
  Utensils,
  Leaf,
  Image as ImageIcon,
  XCircle,
  Minus,
  Plus,
  Trash2,
  MessageCircle,
  Sparkles,
  Pencil,
  Clock3,
} from "lucide-react";
import { GuestHeader } from "./GuestHeader";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";
import { toast } from "sonner";
import { PhotobookGallery } from "./PhotobookGallery";
import { TJAView } from "./TJAView";
import { Ceremony } from "./Ceremony";

interface Guest {
  code: string;
  name: string;
  isPlural?: boolean;
  gender?: "male" | "female" | "plural";
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

const createEmptyFoodItem = (): FoodItem => ({
  name: "",
  isVegetarian: false,
  isVegan: false,
  category: "Hauptspeise",
});

const getDefaultGuestCount = (gender?: Guest["gender"]) =>
  gender === "plural" ? 2 : 1;

const normalizeFoodItemsForForm = (items?: FoodItem[]) => {
  if (!Array.isArray(items) || items.length === 0) {
    return [createEmptyFoodItem()];
  }

  return items.map((item) => ({
    name: item?.name ?? "",
    isVegetarian: !!item?.isVegetarian,
    isVegan: !!item?.isVegan,
    category: item?.category || "Hauptspeise",
  }));
};

export function GuestView() {
  const navigate = useNavigate();
  const { code } = useParams<{ code: string }>();

  const [guest, setGuest] = useState<Guest | null>(null);
  const [rsvp, setRsvp] = useState<RSVP | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentView, setCurrentView] = useState<
    "invitation" | "ceremony" | "buffet" | "gallery" | "tja"
  >("invitation");
  const [isEditing, setIsEditing] = useState(false);

  const [attending, setAttending] = useState<boolean | null>(null);
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([
    createEmptyFoodItem(),
  ]);
  const [needsAccommodation, setNeedsAccommodation] = useState(false);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const draftHydratedRef = useRef(false);

  const draftStorageKey = code ? `guest-form-draft:${code}` : null;
  const scrollStorageKey = code ? `guest-form-scroll:${code}` : null;

  const carouselImages = [
    "/images/einladung/1.jpeg",
    "/images/einladung/2.jpeg",
    "/images/einladung/3.jpeg",
    "/images/einladung/4.jpeg",
    "/images/einladung/5.jpeg",
  ];

  const getTexts = (gender: "male" | "female" | "plural" = "male") => {
    const isPlural = gender === "plural";
    const greeting = gender === "male" ? "Lieber" : "Liebe";

    return {
      greeting,
      welcomeMessage: isPlural
        ? "Schön, dass ihr hier seid! Hier findet ihr alle wichtigen Infos für unseren großen Tag."
        : "Schön, dass du hier bist! Hier findest du alle wichtigen Infos für unseren großen Tag.",
      attending: isPlural
        ? "Werdet ihr an unserer Hochzeit teilnehmen?"
        : "Wirst du an unserer Hochzeit teilnehmen?",
      attendingYes: isPlural ? "Ja, wir kommen gerne" : "Ja, ich komme gerne",
      attendingNo: isPlural
        ? "Leider können wir nicht teilnehmen"
        : "Leider kann ich nicht teilnehmen",
      guestCountQuestion: isPlural
        ? "Mit wie viel Personen (inklusive euch selbst) werdet ihr kommen?"
        : "Mit wie viel Personen (inklusive dir selbst) wirst du kommen?",
      food: isPlural
        ? "Was möchtet ihr zum Buffet beitragen?"
        : "Was möchtest du zum Buffet beitragen?",
      foodSubtext: isPlural
        ? "Damit für das leibliche Wohl gesorgt ist, bitten wir um einen Beitrag zum Buffet. Getränke werden gestellt. Falls ihr euch inspirieren lassen wollt, schaut doch schon mal auf der Buffetübersicht, was die anderen mitbringen."
        : "Damit für das leibliche Wohl gesorgt ist, bitten wir um einen Beitrag zum Buffet. Getränke werden gestellt. Falls du dich inspirieren lassen möchtest, schau doch schon mal auf der Buffetübersicht, was die anderen mitbringen.",
      accommodation: isPlural
        ? "Möchtet ihr bei uns übernachten?"
        : "Möchtest du bei uns übernachten?",
      accommodationSubtext: isPlural
        ? "Ihr könnt gerne bei uns zelten oder es euch mit einer Isomatte im Haus gemütlich machen."
        : "Du kannst gerne bei uns zelten oder es dir mit einer Isomatte im Haus gemütlich machen.",
      yesPlease: "Ja, gerne",
      noThanks: "Nein, danke",
      joyfulMessage: isPlural
        ? "wir freuen uns riesig, dass ihr dabei seid!"
        : "wir freuen uns riesig, dass du dabei bist!",
      meaningMessage: isPlural
        ? "Es bedeutet uns sehr viel, dass ihr an diesem besonderen Tag dabei sein werdet."
        : "Es bedeutet uns sehr viel, dass du an diesem besonderen Tag dabei sein wirst.",
      excitedMessage: isPlural
        ? "Wir können es kaum erwarten, diesen unvergesslichen Moment mit euch zu feiern!"
        : "Wir können es kaum erwarten, diesen unvergesslichen Moment mit dir zu feiern!",
      sadMessage: isPlural
        ? "schade, dass ihr nicht dabei sein könnt"
        : "schade, dass du nicht dabei sein kannst",
      sadMessageLong: isPlural
        ? "Wir werden an euch denken und hoffen, dass wir bald wieder zusammen feiern können."
        : "Wir werden an dich denken und hoffen, dass wir bald wieder zusammen feiern können.",
      yourDetails: isPlural ? "Eure Angaben" : "Deine Angaben",
      yourBuffet: isPlural ? "Euer Buffet-Beitrag" : "Dein Buffet-Beitrag",
      partnerSectionTitle: isPlural
        ? "Eure Ansprechpartner"
        : "Deine Ansprechpartner",
      partnerSectionText: isPlural
        ? "Bei Fragen könnt ihr euch gerne an unsere Trauzeugen wenden."
        : "Bei Fragen kannst du dich gerne an unsere Trauzeugen wenden.",
    };
  };

  useEffect(() => {
    loadGuestData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [carouselImages.length]);

  useEffect(() => {
    if (!draftStorageKey || !draftHydratedRef.current) return;
    if (rsvp && !isEditing) return;

    sessionStorage.setItem(
      draftStorageKey,
      JSON.stringify({
        attending,
        numberOfGuests,
        foodItems,
        needsAccommodation,
        resumeForm: true,
      }),
    );
  }, [
    attending,
    numberOfGuests,
    foodItems,
    needsAccommodation,
    isEditing,
    rsvp,
    draftStorageKey,
  ]);

  const loadGuestData = async () => {
    if (!code) return;

    setIsLoading(true);

    try {
      const guestResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bda29bfd/guest/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ code }),
        },
      );

      const guestData = await guestResponse.json();

      if (!guestResponse.ok || !guestData.success) {
        toast.error("Ungültiger Code");
        navigate("/");
        return;
      }

      const currentGuest = guestData.guest as Guest;
      const defaultGuestCount = getDefaultGuestCount(currentGuest?.gender);

      setGuest(currentGuest);
      setNumberOfGuests(defaultGuestCount);

      const rsvpResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bda29bfd/guest/rsvp/${code}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        },
      );

      const rsvpData = await rsvpResponse.json();

      let migratedRsvp: RSVP | null = null;

      if (rsvpData.rsvp) {
        migratedRsvp = { ...rsvpData.rsvp };

        if (!migratedRsvp.foodItems && (migratedRsvp as any).foodItem) {
          migratedRsvp.foodItems = [
            {
              name: (migratedRsvp as any).foodItem,
              isVegetarian: (migratedRsvp as any).isVegetarian || false,
              isVegan: (migratedRsvp as any).isVegan || false,
              category: (migratedRsvp as any).category || "Hauptspeise",
            },
          ];
        }

        if (!Array.isArray(migratedRsvp.foodItems)) {
          migratedRsvp.foodItems = [];
        }

        migratedRsvp.foodItems = migratedRsvp.foodItems.filter(
          (item: FoodItem) => item?.name?.trim()?.length > 0,
        );

        setRsvp(migratedRsvp);
      }

      const savedDraft =
        draftStorageKey && sessionStorage.getItem(draftStorageKey);

      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);

          setAttending(
            typeof parsed.attending === "boolean"
              ? parsed.attending
              : migratedRsvp?.attending ?? null,
          );

          setNumberOfGuests(
            typeof parsed.numberOfGuests === "number" &&
              parsed.numberOfGuests > 0
              ? parsed.numberOfGuests
              : migratedRsvp?.numberOfGuests || defaultGuestCount,
          );

          setFoodItems(normalizeFoodItemsForForm(parsed.foodItems));
          setNeedsAccommodation(!!parsed.needsAccommodation);

          if (migratedRsvp && parsed.resumeForm) {
            setIsEditing(true);
          }

          const savedScroll =
            scrollStorageKey && sessionStorage.getItem(scrollStorageKey);

          if (savedScroll) {
            const scrollY = Number(savedScroll);

            if (!Number.isNaN(scrollY)) {
              setTimeout(() => {
                window.scrollTo({ top: scrollY, behavior: "auto" });
              }, 0);
            }

            sessionStorage.removeItem(scrollStorageKey);
          }
        } catch (error) {
          console.error("Error restoring draft:", error);
          setFoodItems([createEmptyFoodItem()]);
          setNumberOfGuests(defaultGuestCount);
        }
      } else if (!migratedRsvp) {
        setFoodItems([createEmptyFoodItem()]);
        setNumberOfGuests(defaultGuestCount);
      }

      draftHydratedRef.current = true;
    } catch (error) {
      console.error("Error loading guest data:", error);
      toast.error("Fehler beim Laden der Daten");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (attending === null) {
      toast.error("Bitte wähle aus, ob du teilnehmen kannst.");
      return;
    }

    const cleanedFoodItems = attending
      ? foodItems
          .filter((item) => item.name.trim().length > 0)
          .map((item) => ({
            ...item,
            name: item.name.trim(),
          }))
      : [];

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bda29bfd/guest/rsvp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            code,
            attending,
            numberOfGuests: attending ? numberOfGuests : 0,
            foodItems: cleanedFoodItems,
            needsAccommodation: attending ? needsAccommodation : false,
          }),
        },
      );

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Deine Rückmeldung wurde gespeichert!");
        setRsvp(data.rsvp);
        setFoodItems(
          cleanedFoodItems.length > 0
            ? cleanedFoodItems
            : [createEmptyFoodItem()],
        );
        setIsEditing(false);

        if (draftStorageKey) {
          sessionStorage.removeItem(draftStorageKey);
        }

        if (scrollStorageKey) {
          sessionStorage.removeItem(scrollStorageKey);
        }

        window.scrollTo({ top: 0, behavior: "smooth" });
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
    if (rsvp) {
      setAttending(rsvp.attending);
      setNumberOfGuests(
        rsvp.numberOfGuests || getDefaultGuestCount(guest?.gender),
      );
      setFoodItems(normalizeFoodItemsForForm(rsvp.foodItems));
      setNeedsAccommodation(rsvp.needsAccommodation);
    }

    setIsEditing(true);
  };

  const handleOpenBuffetOverview = () => {
    if (draftStorageKey) {
      sessionStorage.setItem(
        draftStorageKey,
        JSON.stringify({
          attending,
          numberOfGuests,
          foodItems,
          needsAccommodation,
          resumeForm: true,
        }),
      );
    }

    if (scrollStorageKey) {
      sessionStorage.setItem(scrollStorageKey, String(window.scrollY));
    }

    navigate("/buffet-view");
  };

  const addFoodItem = () => {
    if (foodItems.length >= 3) return;
    setFoodItems([...foodItems, createEmptyFoodItem()]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F6F1E9] via-[#E8C7C8]/20 to-white px-4">
        <div className="text-center">
          <Heart className="size-14 sm:size-16 text-[#C6A75E] animate-pulse mx-auto mb-4" />
          <p className="text-lg sm:text-xl text-[#A3B18A]">Lädt...</p>
        </div>
      </div>
    );
  }

  if (!guest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-white flex items-center justify-center p-4 sm:p-6">
        <Card className="w-full max-w-md border-2 border-[#E8C7C8]">
          <CardContent className="p-6 sm:p-8 text-center">
            <XCircle className="size-14 sm:size-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-serif text-slate-800 mb-2">
              Gast nicht gefunden
            </h2>
            <p className="text-slate-600 mb-6">
              Der eingegebene Code ist ungültig.
            </p>
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

  if (!rsvp || isEditing) {
    const texts = getTexts(guest.gender);

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F6F1E9] via-[#E8C7C8]/20 to-white px-3 py-4 sm:px-4 sm:py-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border border-[#E8C7C8] shadow-[0_18px_60px_rgba(129,94,69,0.12)] overflow-hidden bg-white rounded-[28px]">
            <div className="relative h-64 sm:h-80 md:h-[26rem] overflow-hidden">
              {carouselImages.map((image, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    index === currentImageIndex ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {/* Blurred background fill for portrait photos */}
                  <img
                    src={image}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover scale-110 blur-xl opacity-70 pointer-events-none"
                    aria-hidden="true"
                  />
                  <img
                    src={image}
                    alt={`Wedding ${index + 1}`}
                    className="relative w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#5B473A]/35 via-transparent to-transparent" />
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-b from-[#FBF6F0] via-[#FFFDF9] to-white px-4 sm:px-8 lg:px-12 pt-6 sm:pt-10 pb-4 sm:pb-6 border-b border-[#EAD8C6]">
              <div className="mx-auto max-w-3xl rounded-[28px] border border-[#E7D9C4] bg-gradient-to-b from-[#FFFDF9] via-[#FBF4EC] to-white shadow-[0_12px_40px_rgba(139,107,84,0.10)]">
                <div className="px-5 sm:px-8 lg:px-10 pt-8 sm:pt-10 pb-6 text-center">
                  <Heart className="size-10 sm:size-12 text-[#C6A75E] mx-auto mb-5" />
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-slate-800 mb-4">
                    Herzlich Willkommen
                  </h1>
                  <p className="text-base sm:text-lg text-slate-700 leading-relaxed max-w-2xl mx-auto">
                    {texts.greeting}{" "}
                    <span className="font-semibold text-[#B2884A]">
                      {guest.name}
                    </span>
                    ! {texts.welcomeMessage}
                  </p>
                </div>

                <div className="px-5 sm:px-8 lg:px-10 pb-8 sm:pb-10">
                  <div className="h-px bg-gradient-to-r from-transparent via-[#D8C2AA] to-transparent mb-6 sm:mb-8" />

                  <div className="text-center">
                    <p className="text-xs sm:text-sm uppercase tracking-[0.28em] text-[#8FA07B] font-medium mb-3">
                      Kirchliche Trauung
                    </p>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#C6A75E] mb-5 sm:mb-6">
                      18. Juli 2026
                    </h2>

                    <div className="space-y-4 text-slate-700">
                      <div className="flex items-center justify-center gap-3 sm:gap-4">
                        <div className="w-10 sm:w-16 h-px bg-[#D9C5B0]" />
                        <p className="text-xl sm:text-2xl font-medium text-slate-800">
                          14:00 Uhr
                        </p>
                        <div className="w-10 sm:w-16 h-px bg-[#D9C5B0]" />
                      </div>

                      <div className="pt-1">
                        <p className="text-lg sm:text-xl font-medium text-slate-800">
                          Echemer Kirche
                        </p>
                        <p className="text-sm sm:text-base text-slate-600">
                          An der Kirche
                        </p>
                        <p className="text-sm sm:text-base text-slate-600">
                          21379 Echem
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-4 sm:h-6 bg-gradient-to-b from-[#FBF3EA] to-white" />

            <CardContent className="px-4 sm:px-8 lg:px-10 py-6 sm:py-8 bg-white">
              <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                <div className="rounded-2xl border border-[#EAD9C8] bg-[#FFFCF8] p-5 sm:p-6 shadow-sm">
                  <div className="space-y-4">
                    <Label className="text-lg font-medium text-slate-700 flex items-center gap-2">
                      {texts.attending}
                    </Label>

                    <div className="grid grid-cols-1 gap-3">
                      <div
                        onClick={() => {
                          setAttending(true);
                          if (numberOfGuests <= 0) {
                            setNumberOfGuests(
                              getDefaultGuestCount(guest.gender),
                            );
                          }
                        }}
                        className={`p-4 sm:p-5 border-2 rounded-xl cursor-pointer transition-all text-center ${
                          attending === true
                            ? "border-[#C6A75E] bg-[#C6A75E]/12 shadow-sm"
                            : "border-[#E7DCD0] bg-white hover:border-[#D6B88B] hover:bg-[#FCF7EF]"
                        }`}
                      >
                        <p className="text-base font-medium text-slate-700">
                          {texts.attendingYes}
                        </p>
                      </div>

                      <div
                        onClick={() => setAttending(false)}
                        className={`p-4 sm:p-5 border-2 rounded-xl cursor-pointer transition-all text-center ${
                          attending === false
                            ? "border-slate-300 bg-slate-50 shadow-sm"
                            : "border-[#E7DCD0] bg-white hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <p className="text-base font-medium text-slate-700">
                          {texts.attendingNo}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {attending && (
                  <div className="space-y-5 sm:space-y-6">
                    <div className="rounded-2xl border border-[#EAD9C8] bg-[#FFFCF8] p-5 sm:p-6 shadow-sm">
                      <div className="space-y-4">
                        <Label className="text-lg font-medium text-slate-700 flex items-start gap-2">
                          <Users className="size-5 text-[#C6A75E] mt-0.5 shrink-0" />
                          <span>{texts.guestCountQuestion}</span>
                        </Label>

                        <div className="flex items-center justify-center gap-4 sm:gap-6">
                          <Button
                            type="button"
                            onClick={() =>
                              setNumberOfGuests(Math.max(1, numberOfGuests - 1))
                            }
                            className="bg-[#E8C7C8] hover:bg-[#C6A75E] text-white rounded-full w-11 h-11 sm:w-12 sm:h-12 p-0 shadow-sm"
                            disabled={numberOfGuests <= 1}
                          >
                            <Minus className="size-5" />
                          </Button>

                          <div className="text-center min-w-[88px] sm:min-w-[100px]">
                            <p className="text-4xl sm:text-5xl font-light text-[#C6A75E] leading-none">
                              {numberOfGuests}
                            </p>
                            <p className="text-sm text-slate-500 mt-2">
                              {numberOfGuests === 1 ? "Person" : "Personen"}
                            </p>
                          </div>

                          <Button
                            type="button"
                            onClick={() =>
                              setNumberOfGuests(Math.min(10, numberOfGuests + 1))
                            }
                            className="bg-[#E8C7C8] hover:bg-[#C6A75E] text-white rounded-full w-11 h-11 sm:w-12 sm:h-12 p-0 shadow-sm"
                            disabled={numberOfGuests >= 10}
                          >
                            <Plus className="size-5" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-[#EAD9C8] bg-[#FFFCF8] p-5 sm:p-6 shadow-sm">
                      <div className="space-y-4">
                        <div className="flex flex-col gap-4">
                          <div className="space-y-2">
                            <Label className="text-lg font-medium text-slate-700 flex items-start gap-2">
                              <ChefHat className="size-5 text-[#C6A75E] mt-0.5 shrink-0" />
                              <span>{texts.food}</span>
                            </Label>
                            <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed">
                              {texts.foodSubtext}
                            </p>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                handleOpenBuffetOverview();
                              }}
                              className="w-full sm:w-auto bg-[#8FA07B] hover:bg-[#7D906A] text-white border border-[#8FA07B] shadow-sm"
                            >
                              <Utensils className="size-4 mr-2" />
                              Buffetübersicht
                            </Button>

                            {foodItems.length < 3 && (
                              <Button
                                type="button"
                                onClick={addFoodItem}
                                className="w-full sm:w-auto bg-[#C6A75E] hover:bg-[#B48F48] text-white border border-[#C6A75E] shadow-sm"
                              >
                                <Plus className="size-4 mr-2" />
                                Mehr Essen
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="space-y-3">
                          {foodItems.map((item, index) => (
                            <Card
                              key={index}
                              className="border border-[#E6D7C8] bg-white relative"
                            >
                              <CardContent className="p-4 sm:p-5">
                                <div className="space-y-3">
                                  {foodItems.length > 1 && (
                                    <div className="flex justify-end">
                                      <Button
                                        type="button"
                                        onClick={() =>
                                          setFoodItems(
                                            foodItems.filter((_, i) => i !== index),
                                          )
                                        }
                                        variant="outline"
                                        size="sm"
                                        className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 h-9 w-9 p-0 rounded-full"
                                      >
                                        <Trash2 className="size-4" />
                                      </Button>
                                    </div>
                                  )}

                                  <Input
                                    type="text"
                                    value={item.name}
                                    onChange={(e) => {
                                      const newItems = [...foodItems];
                                      newItems[index] = {
                                        ...item,
                                        name: e.target.value,
                                      };
                                      setFoodItems(newItems);
                                    }}
                                    placeholder={`Speise ${index + 1} (z. B. Nudelsalat, Obstkuchen)`}
                                    className="text-base p-4 border border-slate-200 focus:border-[#C6A75E]"
                                  />

                                  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
                                    <div className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`vegetarian-${index}`}
                                        checked={item.isVegetarian}
                                        onCheckedChange={(checked) => {
                                          const newItems = [...foodItems];
                                          newItems[index] = {
                                            ...item,
                                            isVegetarian: !!checked,
                                            isVegan: checked
                                              ? false
                                              : item.isVegan,
                                          };
                                          setFoodItems(newItems);
                                        }}
                                      />
                                      <Label
                                        htmlFor={`vegetarian-${index}`}
                                        className="cursor-pointer flex items-center gap-1 text-sm text-slate-600"
                                      >
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
                                            isVegetarian: checked
                                              ? false
                                              : item.isVegetarian,
                                          };
                                          setFoodItems(newItems);
                                        }}
                                      />
                                      <Label
                                        htmlFor={`vegan-${index}`}
                                        className="cursor-pointer flex items-center gap-1 text-sm text-slate-600"
                                      >
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
                    </div>

                    <div className="rounded-2xl border border-[#EAD9C8] bg-[#FFFCF8] p-5 sm:p-6 shadow-sm">
                      <div className="space-y-4">
                        <Label className="text-lg font-medium text-slate-700 flex items-start gap-2">
                          <Bed className="size-5 text-[#C6A75E] mt-0.5 shrink-0" />
                          <span>{texts.accommodation}</span>
                        </Label>

                        <p className="text-sm sm:text-[15px] text-slate-600 italic leading-relaxed">
                          {texts.accommodationSubtext}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <div
                            onClick={() => setNeedsAccommodation(true)}
                            className={`p-4 sm:p-5 border-2 rounded-xl cursor-pointer transition-all text-center ${
                              needsAccommodation
                                ? "border-[#C6A75E] bg-[#C6A75E]/10 shadow-sm"
                                : "border-[#E7DCD0] bg-white hover:border-[#D6B88B] hover:bg-[#FCF7EF]"
                            }`}
                          >
                            <p className="text-base font-medium text-slate-700">
                              {texts.yesPlease}
                            </p>
                          </div>

                          <div
                            onClick={() => setNeedsAccommodation(false)}
                            className={`p-4 sm:p-5 border-2 rounded-xl cursor-pointer transition-all text-center ${
                              !needsAccommodation
                                ? "border-[#A3B18A] bg-[#A3B18A]/10 shadow-sm"
                                : "border-[#E7DCD0] bg-white hover:border-[#D6B88B] hover:bg-[#FCF7EF]"
                            }`}
                          >
                            <p className="text-base font-medium text-slate-700">
                              {texts.noThanks}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-[#C6A75E] hover:bg-[#A3B18A] text-white text-base sm:text-lg py-5 sm:py-6 rounded-xl shadow-sm"
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


  const renderInvitation = () => {
    const texts = getTexts(guest.gender);

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Card className="border border-[#E8C7C8] shadow-2xl bg-white overflow-hidden rounded-[28px]">
          <div className="bg-gradient-to-br from-[#E8C7C8]/20 via-[#F6F1E9] to-white px-6 sm:px-10 lg:px-12 py-10 sm:py-12 text-center border-b border-[#E8C7C8]/30">
            <Heart className="size-14 sm:size-16 text-[#C6A75E] mx-auto mb-6" />

            {rsvp.attending ? (
              <>
                <p className="text-base sm:text-lg text-slate-600 mb-3">
                  {texts.greeting}{" "}
                  <span className="font-semibold text-[#C6A75E]">
                    {guest.name}
                  </span>
                  ,
                </p>
                <h1 className="text-3xl sm:text-4xl font-serif text-slate-800 mb-4">
                  {texts.joyfulMessage}
                </h1>
                <p className="text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
                  {texts.meaningMessage} {texts.excitedMessage}
                </p>
              </>
            ) : (
              <>
                <p className="text-base sm:text-lg text-slate-600 mb-3">
                  {texts.greeting}{" "}
                  <span className="font-semibold text-[#C6A75E]">
                    {guest.name}
                  </span>
                  ,
                </p>
                <h1 className="text-3xl sm:text-4xl font-serif text-slate-800 mb-4">
                  {texts.sadMessage}
                </h1>
                <p className="text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
                  {texts.sadMessageLong}
                </p>
              </>
            )}
          </div>

          <div className="bg-gradient-to-br from-[#F6F1E9] via-white to-[#E8C7C8]/10 px-6 sm:px-8 lg:px-10 py-8 sm:py-10 border-b border-[#E8C7C8]/30">
            <div className="text-center space-y-5">
              <div>
                <p className="text-sm uppercase tracking-wider text-[#A3B18A] font-medium mb-2">
                  Kirchliche Trauung
                </p>
                <h2 className="text-4xl sm:text-5xl font-serif text-[#C6A75E] mb-6">
                  18. Juli 2026
                </h2>
              </div>

              <div className="space-y-3 text-slate-700">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 sm:w-20 h-px bg-[#E8C7C8]" />
                  <p className="text-xl sm:text-2xl font-medium">14:00 Uhr</p>
                  <div className="w-10 sm:w-20 h-px bg-[#E8C7C8]" />
                </div>

                <div className="pt-2">
                  <p className="text-lg sm:text-xl font-medium text-slate-800">
                    Echemer Kirche
                  </p>
                  <p className="text-base text-slate-600">An der Kirche</p>
                  <p className="text-base text-slate-600">21379 Echem</p>
                </div>
              </div>
            </div>
          </div>

          {rsvp.attending && (
            <CardContent className="px-6 sm:px-8 lg:px-10 py-8 sm:py-10 border-b border-[#E8C7C8]/30">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h3 className="text-2xl font-serif text-slate-800">
                  {texts.yourDetails}
                </h3>
                <Button
                  onClick={handleEditRSVP}
                  variant="outline"
                  className="border-2 border-[#C6A75E] text-[#A3B18A] hover:bg-[#C6A75E]/10 hover:border-[#A3B18A] px-4 py-2 text-sm font-medium"
                >
                  <Pencil className="size-4 mr-2" />
                  Angaben ändern
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                <Card className="border border-[#E8C7C8] bg-gradient-to-br from-white to-[#F6F1E9]/30">
                  <CardContent className="p-6 text-center">
                    <Users className="size-10 text-[#C6A75E] mx-auto mb-3" />
                    <p className="text-sm uppercase tracking-wide text-slate-500 mb-2">
                      Anzahl Gäste
                    </p>
                    <p className="text-4xl font-light text-[#C6A75E] mb-1">
                      {rsvp.numberOfGuests}
                    </p>
                    <p className="text-sm text-slate-600">
                      {rsvp.numberOfGuests === 1 ? "Person" : "Personen"}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border border-[#E8C7C8] bg-gradient-to-br from-white to-[#F6F1E9]/30">
                  <CardContent className="p-6 text-center">
                    <Bed className="size-10 text-[#C6A75E] mx-auto mb-3" />
                    <p className="text-sm uppercase tracking-wide text-slate-500 mb-2">
                      Übernachtung
                    </p>
                    <p className="text-lg font-medium text-slate-800 mt-2">
                      {rsvp.needsAccommodation ? "Ja, gerne" : "Nein, danke"}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {rsvp.foodItems && rsvp.foodItems.length > 0 && (
                <div>
                  <div className="text-center mb-6">
                    <ChefHat className="size-10 text-[#C6A75E] mx-auto mb-2" />
                    <p className="text-sm uppercase tracking-wide text-slate-500">
                      {texts.yourBuffet}
                    </p>
                  </div>

                  <div
                    className={`grid gap-4 mb-8 ${
                      rsvp.foodItems.length === 1
                        ? "grid-cols-1 max-w-md mx-auto"
                        : rsvp.foodItems.length === 2
                          ? "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto"
                          : "grid-cols-1 md:grid-cols-3"
                    }`}
                  >
                    {rsvp.foodItems.map((item, index) => (
                      <Card
                        key={index}
                        className="border border-[#E8C7C8] bg-gradient-to-br from-white to-[#F6F1E9]/20"
                      >
                        <CardContent className="p-5 text-center">
                          <p className="text-lg font-medium text-slate-800 mb-2 break-words">
                            {item.name}
                          </p>
                          {(item.isVegetarian || item.isVegan) && (
                            <div className="flex justify-center gap-2 mt-2 flex-wrap">
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

          <div className="bg-white px-6 sm:px-8 py-8">
            <div className="text-center mb-6">
              <h3 className="text-xl font-serif text-slate-800 mb-2">
                {texts.partnerSectionTitle}
              </h3>
              <p className="text-sm text-slate-500">
                {texts.partnerSectionText}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <Card className="border border-[#E8C7C8] bg-gradient-to-br from-white to-[#F6F1E9]/20">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-[#C6A75E]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="size-8 text-[#C6A75E]" />
                  </div>
                  <p className="text-lg font-medium text-slate-800 mb-4">
                    Celli
                  </p>
                  <div className="flex justify-center">
                    <a
                      href="https://wa.me/491234567890"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all shadow-sm"
                    >
                      <MessageCircle className="size-4" />
                      <span className="text-sm font-medium">WhatsApp</span>
                    </a>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-[#E8C7C8] bg-gradient-to-br from-white to-[#F6F1E9]/20">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-[#E8C7C8]/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="size-8 text-[#C6A75E]" />
                  </div>
                  <p className="text-lg font-medium text-slate-800 mb-4">
                    Jenny
                  </p>
                  <div className="flex justify-center">
                    <a
                      href="https://wa.me/490987654321"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all shadow-sm"
                    >
                      <MessageCircle className="size-4" />
                      <span className="text-sm font-medium">WhatsApp</span>
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderCeremony = () => <Ceremony />;
  const renderBuffet = () => <BuffetView />;
  const renderGallery = () => <PhotobookGallery />;
  const renderTJA = () => <TJAView />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-white">
      <GuestHeader currentView={currentView} onViewChange={setCurrentView} />
      <div className="py-4 sm:py-8">
        {currentView === "invitation" && renderInvitation()}
        {currentView === "ceremony" && renderCeremony()}
        {currentView === "buffet" && renderBuffet()}
        {currentView === "gallery" && renderGallery()}
        {currentView === "tja" && renderTJA()}
      </div>
    </div>
  );
}

function BuffetView() {
  const [buffetList, setBuffetList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<
    "Alle" | "Vorspeise" | "Hauptspeise" | "Nachspeise"
  >("Alle");

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
        },
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

  const categorizedBuffet = {
    Vorspeise: buffetList
      .filter((item) => item.category === "Vorspeise")
      .sort((a, b) => a.foodItem.localeCompare(b.foodItem, "de")),
    Hauptspeise: buffetList
      .filter((item) => item.category === "Hauptspeise")
      .sort((a, b) => a.foodItem.localeCompare(b.foodItem, "de")),
    Nachspeise: buffetList
      .filter((item) => item.category === "Nachspeise")
      .sort((a, b) => a.foodItem.localeCompare(b.foodItem, "de")),
  };

  const getFilteredItems = () => {
    if (selectedCategory === "Alle") {
      return [
        ...categorizedBuffet.Vorspeise,
        ...categorizedBuffet.Hauptspeise,
        ...categorizedBuffet.Nachspeise,
      ];
    }

    return categorizedBuffet[selectedCategory];
  };

  const filteredItems = getFilteredItems();

  const categoriesToShow =
    selectedCategory === "Alle"
      ? (["Vorspeise", "Hauptspeise", "Nachspeise"] as const)
      : ([selectedCategory] as const);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-serif text-slate-800">
          Unser Buffet
        </h2>
      </div>

      <div className="mb-8 flex justify-center">
        <div className="inline-flex gap-2 bg-white p-2 rounded-lg border border-rose-200 shadow-sm overflow-x-auto max-w-full">
          {(
            ["Alle", "Vorspeise", "Hauptspeise", "Nachspeise"] as const
          ).map((category) => {
            const count =
              category === "Alle"
                ? buffetList.length
                : categorizedBuffet[category]?.length || 0;

            return (
              <Button
                key={category}
                variant="ghost"
                onClick={() => setSelectedCategory(category)}
                className={`px-4 sm:px-6 py-2 rounded-md transition-all whitespace-nowrap ${
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
        <Card className="p-8 sm:p-12 text-center border border-slate-200">
          <ChefHat className="size-12 text-slate-300 mx-auto mb-4" />
          <p className="text-lg text-slate-500">
            Noch keine Buffet-Beiträge in dieser Kategorie
          </p>
        </Card>
      ) : (
        <div className="space-y-8">
          {categoriesToShow.map((category) => {
            const items = categorizedBuffet[category];
            if (items.length === 0) return null;

            return (
              <div key={category} className="space-y-3">
                <div className="bg-gradient-to-r from-rose-100 via-pink-50 to-rose-50 px-4 sm:px-5 py-3 rounded-lg border border-rose-200">
                  <h3 className="text-lg sm:text-xl font-serif text-slate-700 flex items-center justify-between gap-3">
                    <span>{category}</span>
                    <Badge
                      variant="outline"
                      className="border-rose-300 text-rose-700 bg-white"
                    >
                      {items.length}{" "}
                      {items.length === 1 ? "Gericht" : "Gerichte"}
                    </Badge>
                  </h3>
                </div>

                <div className="space-y-2">
                  {items.map((item, index) => (
                    <Card
                      key={index}
                      className="border border-rose-200 hover:border-rose-300 transition-all bg-white"
                    >
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-1 min-w-0 pr-2">
                            <h4 className="text-base font-medium text-slate-800 mb-2 break-words">
                              {item.foodItem}
                            </h4>
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

                          <div className="flex flex-col items-center gap-1 w-16 sm:w-20 flex-shrink-0">
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

      {filteredItems.length > 0 && (
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            Insgesamt {filteredItems.length}{" "}
            {filteredItems.length === 1 ? "Gericht" : "Gerichte"}
          </p>
        </div>
      )}
    </div>
  );
}