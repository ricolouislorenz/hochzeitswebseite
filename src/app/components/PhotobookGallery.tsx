import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X, Upload, Link as LinkIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface PhotoPage {
  id: number;
  photos: {
    image: string;
    title: string;
    subtitle: string;
  }[];
}

const photoPages: PhotoPage[] = [
  {
    id: 1,
    photos: [
      {
        image: "https://images.unsplash.com/photo-1594933878077-f15b1c406ebf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3VwbGUlMjBmaXJzdCUyMG1lZXRpbmclMjBjb2ZmZWUlMjBzaG9wfGVufDF8fHx8MTc3Mjg5MTc4Nnww&ixlib=rb-4.1.0&q=80&w=1080",
        title: "Das erste Treffen",
        subtitle: "Sommer 2020"
      },
      {
        image: "https://images.unsplash.com/photo-1553478124-633048459a83?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb21hbnRpYyUyMGNvdXBsZSUyMGZpcnN0JTIwZGF0ZSUyMHJlc3RhdXJhbnR8ZW58MXx8fHwxNzcyODkxNzg2fDA&ixlib=rb-4.1.0&q=80&w=1080",
        title: "Das erste Date",
        subtitle: "August 2020"
      }
    ]
  },
  {
    id: 2,
    photos: [
      {
        image: "https://images.unsplash.com/photo-1755121718992-fba1914ad5ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3VwbGUlMjBoa2luaW5nJTIwbW91bnRhYmluJTIwYWR2ZW50dXJlcxlufDF8fHx8MTc3Mjg5MTc4Nnww&ixlib=rb-4.1.0&q=80&w=1080",
        title: "Gemeinsame Abenteuer",
        subtitle: "Herbst 2020"
      },
      {
        image: "https://images.unsplash.com/photo-1762872502191-42150bbf109f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3VwbGUlMjBjaXR5JTIwdHJhdmVsJTIwZXhwbG9yaW5nfGVufDF8fHx8MTc3Mjg5MTc4N3ww&ixlib=rb-4.1.0&q=80&w=1080",
        title: "Städtetrips",
        subtitle: "Frühjahr 2021"
      }
    ]
  },
  {
    id: 3,
    photos: [
      {
        image: "https://images.unsplash.com/photo-1621797005674-48e0150206da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3VwbGUlMjBiZWFjaCUyMHN1bnNldCUyMHJvbWFudGljfGVufDF8fHx8MTc3Mjg5MTc4N3ww&ixlib=rb-4.1.0&q=80&w=1080",
        title: "Sonnenuntergänge am Meer",
        subtitle: "Sommer 2021"
      },
      {
        image: "https://images.unsplash.com/photo-1758522489456-96afe24741dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3VwbGUlMjBjb29raW5nJTIwdG9nZXRoZXIlMjBraXRjaGVufGVufDF8fHx8MTc3Mjg0NjE3OHww&ixlib=rb-4.1.0&q=80&w=1080",
        title: "Alltag zu zweit",
        subtitle: "Herbst 2021"
      }
    ]
  },
  {
    id: 4,
    photos: [
      {
        image: "https://images.unsplash.com/photo-1731936757627-f2a1ea5893e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3VwbGUlMjBjaHJpc3RtYXMlMjB3aW50ZXIlMjBjb3p5fGVufDF8fHx8MTc3Mjg5MTc4OHww&ixlib=rb-4.1.0&q=80&w=1080",
        title: "Erste Weihnachten",
        subtitle: "Dezember 2021"
      },
      {
        image: "https://images.unsplash.com/photo-1519741497674-611481863552?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwY2VyZW1vbnklMjByb21hbnRpYyUyMGNvdXBsZXxlbnwxfHx8fDE3NzI4OTU3NzF8MA&ixlib=rb-4.1.0&q=80&w=1080",
        title: "Familienfeier",
        subtitle: "Frühjahr 2022"
      }
    ]
  },
  {
    id: 5,
    photos: [
      {
        image: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3VwbGUlMjByb2FkJTIwdHJpcCUyMGFkdmVudHVyZXxlbnwxfHx8fDE3NzI4OTU3NzF8MA&ixlib=rb-4.1.0&q=80&w=1080",
        title: "Roadtrip-Abenteuer",
        subtitle: "Sommer 2022"
      },
      {
        image: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3VwbGUlMjBwaWNuaWMlMjBwYXJrJTIwcm9tYW50aWN8ZW58MXx8fHwxNzcyODk1NzcyfDA&ixlib=rb-4.1.0&q=80&w=1080",
        title: "Picknick im Park",
        subtitle: "Herbst 2022"
      }
    ]
  },
  {
    id: 6,
    photos: [
      {
        image: "https://images.unsplash.com/photo-1513407030348-c983a97b98d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3VwbGUlMjBkYW5jaW5nJTIwcm9tYW50aWMlMjBob21lfGVufDF8fHx8MTc3Mjg5NTc3Mnww&ixlib=rb-4.1.0&q=80&w=1080",
        title: "Tanzabend zu Hause",
        subtitle: "Winter 2022"
      },
      {
        image: "https://images.unsplash.com/photo-1464047736614-af63643285bf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3VwbGUlMjBza2lpbmclMjB3aW50ZXIlMjBtb3VudGFibnxlbnwxfHx8fDE3NzI4OTU3NzN8MA&ixlib=rb-4.1.0&q=80&w=1080",
        title: "Winterurlaub",
        subtitle: "Januar 2023"
      }
    ]
  },
  {
    id: 7,
    photos: [
      {
        image: "https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3VwbGUlMjBjb2ZmZWUlMjBjYWZlJTIwZGF0ZXxlbnwxfHx8fDE3NzI4OTU3NzN8MA&ixlib=rb-4.1.0&q=80&w=1080",
        title: "Sonntags-Café-Ritual",
        subtitle: "Frühjahr 2023"
      },
      {
        image: "https://images.unsplash.com/photo-1502635385003-ee1e6a1a742d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3VwbGUlMjBnYXJkZW5pbmclMjBob21lJTIwaGFwcHl8ZW58MXx8fHwxNzcyODk1Nzc0fDA&ixlib=rb-4.1.0&q=80&w=1080",
        title: "Gartenarbeit",
        subtitle: "Sommer 2023"
      }
    ]
  },
  {
    id: 8,
    photos: [
      {
        image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3VwbGUlMjBjb25jZXJ0JTIwZmVzdGl2YWwlMjBtdXNpY3xlbnwxfHx8fDE3NzI4OTU3NzR8MA&ixlib=rb-4.1.0&q=80&w=1080",
        title: "Konzertabend",
        subtitle: "Herbst 2023"
      },
      {
        image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwcHJlcGFyYXRpb24lMjBjb3VwbGV8ZW58MXx8fHwxNzcyODk1Nzc1fDA&ixlib=rb-4.1.0&q=80&w=1080",
        title: "Jahresende-Feier",
        subtitle: "Dezember 2023"
      }
    ]
  },
  {
    id: 9,
    photos: [
      {
        image: "https://images.unsplash.com/photo-1770022006937-0e43c0b66a7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbmdhZ2VtZW50JTIwcmluZyUyMHByb3Bvc2FsJTIwcm9tYW50aWN8ZW58MXx8fHwxNzcyODkxNzg4fDA&ixlib=rb-4.1.0&q=80&w=1080",
        title: "Der Antrag",
        subtitle: "Frühjahr 2024"
      },
      {
        image: "https://images.unsplash.com/photo-1766734864456-12497ffcdce0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3VwbGUlMjBjZWxlYnJhdGluZyUyMGNoYW1wYWduZSUyMHRvYXN0fGVufDF8fHx8MTc3Mjg5MTc4OXww&ixlib=rb-4.1.0&q=80&w=1080",
        title: "Verlobungsfeier",
        subtitle: "Sommer 2024"
      }
    ]
  },
  {
    id: 10,
    photos: [
      {
        image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwcHJlcGFyYXRpb24lMjBleGNpdGVkJTIwY291cGxlfGVufDF8fHx8MTc3Mjg5NTc3Nnww&ixlib=rb-4.1.0&q=80&w=1080",
        title: "Die letzten Vorbereitungen",
        subtitle: "Frühjahr 2026"
      },
      {
        image: "https://images.unsplash.com/photo-1769107299871-be6cd912323d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwcHJlcGFyYXRpb24lMjBsb3ZlJTIwZXhjaXRlZHxlbnwxfHx8fDE3NzI4OTE3ODl8MA&ixlib=rb-4.1.0&q=80&w=1080",
        title: "Bald ist es soweit!",
        subtitle: "18. Juli 2026"
      }
    ]
  }
];

export function PhotobookGallery() {
  const [currentPage, setCurrentPage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile on mount
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const totalPages = photoPages.length; // 10 pages total

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      // Von Seite 10 zurück zu Seite 1
      setCurrentPage(0);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    } else {
      // Von Seite 1 zurück zu Seite 10
      setCurrentPage(totalPages - 1);
    }
  };

  const openFullscreen = (image: string) => {
    setFullscreenImage(image);
    setIsFullscreen(true);
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
    setFullscreenImage(null);
  };

  // Render photo page
  const renderPhotoPage = (page: PhotoPage) => (
    <div className="h-full px-8 pt-4 pb-6 md:px-12 md:pt-6 md:pb-8 bg-[#F6F1E9]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
        {page.photos.map((photo, index) => (
          <div key={index} className="relative group">
            {/* Photo frame with tape effect */}
            <div 
              className="relative bg-white p-4 shadow-2xl transition-all duration-300 cursor-pointer md:hover:scale-105 md:hover:shadow-3xl md:hover:z-10"
              onClick={() => isMobile && openFullscreen(photo.image)}
            >
              {/* Tape strips */}
              <div className="absolute -top-3 left-1/4 w-16 h-6 bg-yellow-100/40 backdrop-blur-sm border border-yellow-200/30 rotate-[-15deg] shadow-sm z-10"></div>
              <div className="absolute -top-3 right-1/4 w-16 h-6 bg-yellow-100/40 backdrop-blur-sm border border-yellow-200/30 rotate-[15deg] shadow-sm z-10"></div>
              
              {/* Photo */}
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                <ImageWithFallback
                  src={photo.image}
                  alt={photo.title}
                  className="w-full h-full object-cover transition-all duration-300 md:group-hover:brightness-110"
                />
              </div>
              
              {/* Handwritten caption */}
              <div className="mt-3 text-center">
                <p className="text-lg font-serif text-slate-800 mb-1" style={{ fontFamily: "'Satisfy', cursive" }}>
                  {photo.title}
                </p>
                <p className="text-sm text-slate-500">
                  {photo.subtitle}
                </p>
              </div>
            </div>
            
            {/* Vergrößern Button nur auf Desktop */}
            {!isMobile && (
              <div className="mt-3 flex justify-center">
                <Button
                  onClick={() => openFullscreen(photo.image)}
                  variant="outline"
                  size="sm"
                  className="bg-white hover:bg-[#F6F1E9] text-[#C6A75E] border-2 border-[#C6A75E] shadow-sm"
                >
                  <X className="size-4 mr-2 rotate-45" />
                  Vergrößern
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Photobook Container */}
      <Card className="relative border-4 border-[#E8C7C8] bg-white shadow-2xl overflow-hidden">
        {/* Book spine effect */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#C6A75E] to-transparent opacity-20 pointer-events-none"></div>
        
        {/* Page Content */}
        <div className="relative">
          {renderPhotoPage(photoPages[currentPage])}
        </div>
        
        {/* Navigation - minimal und elegant */}
        <div className="px-6 pb-3 pt-0">
          <div className="flex items-center justify-between max-w-5xl mx-auto">
            <Button
              onClick={goToPrevPage}
              variant="ghost"
              className="text-[#C6A75E] hover:bg-[#F6F1E9]/50 transition-all"
              size="lg"
            >
              <ChevronLeft className="size-6" />
            </Button>
            
            {/* Elegant Page Counter mit Progress Bar */}
            <div className="flex-1 mx-8">
              <div className="text-center mb-2">
                <span className="text-2xl font-serif text-[#C6A75E]">{currentPage + 1}</span>
                <span className="text-lg text-slate-400 mx-2">/</span>
                <span className="text-lg text-slate-500">{totalPages}</span>
              </div>
              {/* Progress Bar */}
              <div className="w-full h-1 bg-[#E8C7C8]/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#E8C7C8] to-[#C6A75E] transition-all duration-500 ease-out rounded-full"
                  style={{ width: `${((currentPage + 1) / totalPages) * 100}%` }}
                />
              </div>
            </div>
            
            <Button
              onClick={goToNextPage}
              variant="ghost"
              className="text-[#C6A75E] hover:bg-[#F6F1E9]/50 transition-all"
              size="lg"
            >
              <ChevronRight className="size-6" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Fullscreen Modal */}
      {isFullscreen && fullscreenImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={closeFullscreen}
        >
          <button
            onClick={closeFullscreen}
            className="absolute top-4 right-4 bg-white hover:bg-gray-100 text-slate-800 p-4 rounded-full transition-all shadow-2xl border-2 border-white z-50"
          >
            <X className="size-8" />
          </button>
          
          <img
            src={fullscreenImage}
            alt="Vollbild"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}