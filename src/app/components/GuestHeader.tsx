import { useNavigate } from "react-router";
import { Heart, Clock3, Utensils, Image as ImageIcon, Sparkles, LogOut } from "lucide-react";

type GuestView = "invitation" | "ceremony" | "buffet" | "gallery" | "tja";

interface GuestHeaderProps {
  currentView: GuestView;
  onViewChange: (view: GuestView) => void;
}

const NAV_ITEMS: { view: GuestView; icon: React.ReactNode; label: string }[] = [
  { view: "invitation", icon: <Heart className="size-5" />, label: "Einladung" },
  { view: "ceremony",   icon: <Clock3 className="size-5" />, label: "Ablauf" },
  { view: "buffet",     icon: <Utensils className="size-5" />, label: "Buffet" },
  { view: "gallery",    icon: <ImageIcon className="size-5" />, label: "Galerie" },
  { view: "tja",        icon: <Sparkles className="size-5" />, label: "Fotos teilen" },
];

export function GuestHeader({ currentView, onViewChange }: GuestHeaderProps) {
  const navigate = useNavigate();

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-[#E8C7C8]/30 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

          {/* Brand + mobile logout */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Heart className="size-5 sm:size-6 text-[#C6A75E] fill-[#C6A75E] shrink-0" />
              <span className="text-lg sm:text-xl font-serif text-slate-800 truncate">
                Unsere Hochzeit
              </span>
            </div>
            <button
              onClick={() => navigate("/")}
              className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all duration-200"
            >
              <LogOut className="size-4" />
            </button>
          </div>

          {/* Navigation tabs */}
          <div className="overflow-x-auto">
            <div className="flex min-w-max gap-2 sm:gap-3 lg:gap-6">
              {NAV_ITEMS.map(({ view, icon, label }) => {
                const active = currentView === view;
                return (
                  <button
                    key={view}
                    onClick={() => onViewChange(view)}
                    className={`group flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                      active
                        ? "text-[#C6A75E] bg-[#C6A75E]/8"
                        : "text-slate-600 hover:text-[#C6A75E] hover:bg-[#C6A75E]/5"
                    }`}
                  >
                    <span className={active ? "text-[#C6A75E]" : ""}>{icon}</span>
                    <span className="font-medium text-sm">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Desktop logout */}
          <button
            onClick={() => navigate("/")}
            className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all duration-200"
          >
            <LogOut className="size-4" />
            <span className="text-sm font-medium">Abmelden</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
