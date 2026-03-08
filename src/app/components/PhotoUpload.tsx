import { Upload, Link as LinkIcon, ArrowLeft } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { useNavigate } from "react-router";

export function PhotoUpload() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Zurück Button */}
        <div className="mb-6">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="border-2 border-[#C6A75E] text-[#C6A75E] hover:bg-[#C6A75E]/10"
          >
            <ArrowLeft className="size-4 mr-2" />
            Zurück
          </Button>
        </div>

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#E8C7C8]/30 rounded-full mb-6">
            <Upload className="size-10 text-[#C6A75E]" />
          </div>
          <h1 className="text-5xl font-serif text-slate-800 mb-4">Teile deine Momente!</h1>
          <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Hast du schöne Fotos von unserer Hochzeit gemacht? Wir würden uns freuen, wenn du sie mit uns teilst!
          </p>
        </div>
        
        <Card className="border-2 border-[#E8C7C8] bg-white shadow-xl p-8 md:p-12">
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-serif text-slate-800 mb-3 flex items-center justify-center gap-2">
                <LinkIcon className="size-6 text-[#C6A75E]" />
                So kannst du deine Fotos hochladen
              </h2>
              <p className="text-base text-slate-600">
                Wähle die Methode, die dir am besten passt:
              </p>
            </div>
            
            <div className="space-y-4">
              {/* Option 1 */}
              <div className="bg-gradient-to-br from-[#F6F1E9] to-white p-6 rounded-xl border-2 border-[#E8C7C8] hover:border-[#C6A75E] transition-all shadow-sm hover:shadow-md">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#C6A75E] rounded-full flex items-center justify-center text-white font-bold text-lg">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">Google Drive Ordner</h3>
                    <p className="text-sm text-slate-600 mb-3">
                      Erstelle einen öffentlichen Google Drive Ordner und teile den Link mit uns per E-Mail oder WhatsApp.
                    </p>
                    <div className="bg-white/80 p-3 rounded-lg border border-[#E8C7C8]/50">
                      <p className="text-xs text-slate-500 font-mono">
                        📧 Email: hochzeit@beispiel.de
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Option 2 */}
              <div className="bg-gradient-to-br from-[#F6F1E9] to-white p-6 rounded-xl border-2 border-[#E8C7C8] hover:border-[#C6A75E] transition-all shadow-sm hover:shadow-md">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#C6A75E] rounded-full flex items-center justify-center text-white font-bold text-lg">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">Google Photos Album</h3>
                    <p className="text-sm text-slate-600 mb-3">
                      Erstelle ein geteiltes Album in Google Photos und lade uns ein. Perfekt für automatisches Backup!
                    </p>
                    <div className="bg-white/80 p-3 rounded-lg border border-[#E8C7C8]/50">
                      <p className="text-xs text-slate-500">
                        💡 <strong>Tipp:</strong> Google Photos komprimiert Fotos automatisch und spart Speicherplatz
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Option 3 */}
              <div className="bg-gradient-to-br from-[#F6F1E9] to-white p-6 rounded-xl border-2 border-[#E8C7C8] hover:border-[#C6A75E] transition-all shadow-sm hover:shadow-md">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#C6A75E] rounded-full flex items-center justify-center text-white font-bold text-lg">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">WeTransfer</h3>
                    <p className="text-sm text-slate-600 mb-3">
                      Sende große Dateien kostenlos über WeTransfer.com - ideal für hochauflösende Fotos.
                    </p>
                    <a
                      href="https://wetransfer.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-[#C6A75E] hover:bg-[#A3B18A] text-white px-4 py-2 rounded-lg transition-all text-sm font-medium shadow-sm hover:shadow"
                    >
                      <Upload className="size-4" />
                      WeTransfer öffnen
                    </a>
                  </div>
                </div>
              </div>
              
              {/* Option 4 */}
              <div className="bg-gradient-to-br from-[#F6F1E9] to-white p-6 rounded-xl border-2 border-[#E8C7C8] hover:border-[#C6A75E] transition-all shadow-sm hover:shadow-md">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#C6A75E] rounded-full flex items-center justify-center text-white font-bold text-lg">
                    4
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">Dropbox</h3>
                    <p className="text-sm text-slate-600">
                      Nutze Dropbox File Requests oder teile einen Ordner-Link - super einfach und zuverlässig.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Bottom Info */}
            <div className="mt-8 pt-8 border-t-2 border-[#E8C7C8]/30">
              <div className="bg-gradient-to-br from-[#C6A75E]/10 to-[#A3B18A]/10 p-6 rounded-xl border border-[#C6A75E]/30">
                <p className="text-sm text-slate-700 text-center mb-3">
                  <strong>💡 Gemeinsamer Upload-Ordner gewünscht?</strong>
                </p>
                <p className="text-xs text-slate-600 text-center leading-relaxed">
                  Wenn du möchtest, dass alle Gäste ihre Fotos an einem gemeinsamen Ort hochladen können, 
                  kontaktiere uns und wir richten einen zentralen Upload-Ordner ein!
                </p>
              </div>
            </div>
            
            <div className="text-center pt-6">
              <p className="text-lg text-[#A3B18A] font-medium">
                Wir freuen uns auf eure Bilder! 📸💕
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}