import { Heart, Clock3, Sparkles } from "lucide-react";
import { Card, CardContent } from "./ui/card";

const timelineItems = [
  {
    time: "13:30",
    title: "Ankommen",
    description:
      "Bitte plant etwas Zeit ein, damit ihr ganz entspannt ankommen könnt.",
  },
  {
    time: "14:00",
    title: "Kirchliche Trauung",
    description:
      "Wir feiern unsere Trauung gemeinsam in der Echemer Kirche.",
  },
  {
    time: "15:00",
    title: "Sektempfang",
    description:
      "Im Anschluss stoßen wir gemeinsam an und genießen die ersten Momente zusammen.",
  },
  {
    time: "16:00",
    title: "Zeit für Gespräche & Fotos",
    description:
      "Bevor es weitergeht, bleibt Zeit für Begegnungen, Fotos und ein entspanntes Ankommen.",
  },
  {
    time: "18:00",
    title: "Buffet",
    description:
      "Am Abend freuen wir uns auf ein gemeinsames Essen mit euren liebevoll mitgebrachten Beiträgen.",
  },
  {
    time: "20:00",
    title: "Eröffnung des Abends",
    description:
      "Danach beginnt der gemütliche und festliche Teil des Abends.",
  },
  {
    time: "ab 20:30",
    title: "Feiern",
    description:
      "Zum Abschluss möchten wir mit euch lachen, tanzen und einen unvergesslichen Abend verbringen.",
  },
];

export function Ceremony() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="text-center mb-8 sm:mb-10">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#E8C7C8]/25 flex items-center justify-center mx-auto mb-4 sm:mb-5">
          <Heart className="size-8 sm:size-10 text-[#C6A75E]" />
        </div>

        <h2 className="text-3xl sm:text-4xl font-serif text-slate-800 mb-3">
          Ablauf
        </h2>

        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Hier findet ihr den geplanten Ablauf unseres Hochzeitstages.
        </p>
      </div>

      <Card className="border border-[#E8C7C8] shadow-xl bg-gradient-to-br from-white via-[#F6F1E9]/35 to-white overflow-hidden rounded-[28px]">
        <CardContent className="p-5 sm:p-8 lg:p-10">
          <div className="text-center mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F8F1E8] border border-[#E8D6C3] text-[#8A6A45]">
              <Sparkles className="size-4" />
              <span className="text-sm font-medium">Unser Hochzeitstag</span>
            </div>
          </div>

          <div className="space-y-4 sm:space-y-5">
            {timelineItems.map((item, index) => (
              <div key={`${item.time}-${item.title}`}>
                <div className="grid grid-cols-1 md:grid-cols-[120px_minmax(0,1fr)] gap-3 sm:gap-4 items-stretch">
                  <div className="flex md:justify-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#E5D2BE] bg-[#FFF9F2] px-4 py-2 text-[#8A6A45] min-h-[44px]">
                      <Clock3 className="size-4 shrink-0" />
                      <span className="text-sm sm:text-base font-medium whitespace-nowrap">
                        {item.time}
                      </span>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="hidden md:block absolute left-[-18px] top-6 w-3 h-3 rounded-full bg-[#C6A75E] shadow-[0_0_0_6px_rgba(232,199,200,0.35)]" />

                    <div className="rounded-2xl border border-[#E8C7C8] bg-white/95 px-4 sm:px-5 py-4 sm:py-5 shadow-sm">
                      <h3 className="text-lg sm:text-xl font-serif text-slate-800 mb-2">
                        {item.title}
                      </h3>
                      <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>

                {index < timelineItems.length - 1 && (
                  <div className="hidden md:block ml-[59px] mt-2 mb-2 h-6 w-px bg-gradient-to-b from-[#E8C7C8] to-transparent" />
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 sm:mt-10 text-center">
            <p className="text-sm text-slate-400 italic">
              Kleine zeitliche Änderungen sind natürlich noch möglich.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}