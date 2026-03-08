import { Sparkles } from "lucide-react";
import { Card, CardContent } from "./ui/card";

export function TJAView() {
  return (
    <div className="max-w-4xl mx-auto px-6">
      <div className="text-center mb-8">
        <Sparkles className="size-16 text-[#C6A75E] mx-auto mb-4" />
        <h2 className="text-4xl font-serif text-slate-800 mb-2">TJA</h2>
        <p className="text-base text-slate-500">Tja...  was soll ich dazu sagen?</p>
      </div>

      <Card className="border border-[#E8C7C8] shadow-lg bg-gradient-to-br from-white via-[#F6F1E9]/30 to-white">
        <CardContent className="p-12">
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-[#E8C7C8]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="size-12 text-[#C6A75E]" />
            </div>
            
            <h3 className="text-3xl font-serif text-slate-800 mb-4">
              Tja... 🤷‍♀️
            </h3>
            
            <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Was soll ich dazu sagen? Manchmal gibt es einfach keine Worte...
            </p>
            
            <div className="pt-8">
              <p className="text-sm text-slate-400 italic">
                Diese Seite ist bewusst minimalistisch gehalten.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optional: Decorative elements */}
      <div className="mt-12 flex justify-center gap-4">
        <div className="w-12 h-12 rounded-full bg-[#E8C7C8]/20 backdrop-blur-sm"></div>
        <div className="w-12 h-12 rounded-full bg-[#A3B18A]/20 backdrop-blur-sm"></div>
        <div className="w-12 h-12 rounded-full bg-[#C6A75E]/20 backdrop-blur-sm"></div>
      </div>
    </div>
  );
}
