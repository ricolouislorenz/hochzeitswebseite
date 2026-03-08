import { Sparkles, Camera, Images } from "lucide-react";
import { Card, CardContent } from "./ui/card";

export function TJAView() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="text-center mb-8 sm:mb-10">
        <Sparkles className="size-14 sm:size-16 text-[#C6A75E] mx-auto mb-4" />
        <h2 className="text-3xl sm:text-4xl font-serif text-slate-800 mb-3">
          Fotos teilen
        </h2>
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Hier könnt ihr nach unserer Hochzeit eure Fotos hochladen und euch
          die schönsten Erinnerungen anschauen.
        </p>
      </div>

      <Card className="border border-[#E8C7C8] shadow-lg bg-gradient-to-br from-white via-[#F6F1E9]/40 to-white overflow-hidden">
        <CardContent className="p-8 sm:p-12">
          <div className="text-center space-y-6 sm:space-y-8">
            <div className="w-24 h-24 sm:w-28 sm:h-28 bg-[#E8C7C8]/20 rounded-full flex items-center justify-center mx-auto">
              <Camera className="size-12 sm:size-14 text-[#C6A75E]" />
            </div>

            <div className="space-y-3">
              <h3 className="text-2xl sm:text-3xl font-serif text-slate-800">
                Dieser Bereich wird noch vorbereitet
              </h3>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
                Diese Seite ist dafür gedacht, die Fotos unserer Hochzeit
                hochzuladen und anzusehen.
              </p>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
                Sie wird pünktlich zur Hochzeit verfügbar sein.
              </p>
            </div>

            <div className="mx-auto max-w-2xl rounded-2xl border border-[#E8C7C8]/70 bg-[#FFFDF9] px-6 py-5">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-slate-700">
                <div className="flex items-center gap-2">
                  <Camera className="size-5 text-[#C6A75E]" />
                  <span className="text-sm sm:text-base">Fotos hochladen</span>
                </div>
                <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-[#C6A75E]/60" />
                <div className="flex items-center gap-2">
                  <Images className="size-5 text-[#C6A75E]" />
                  <span className="text-sm sm:text-base">Erinnerungen ansehen</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-sm text-slate-400 italic">
                Noch im Aufbau – zur Hochzeit geht’s hier los.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-10 sm:mt-12 flex justify-center gap-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#E8C7C8]/20 backdrop-blur-sm" />
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#A3B18A]/20 backdrop-blur-sm" />
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#C6A75E]/20 backdrop-blur-sm" />
      </div>
    </div>
  );
}