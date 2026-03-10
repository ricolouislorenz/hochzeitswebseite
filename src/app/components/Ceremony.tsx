import { Clock3 } from "lucide-react";
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
    time: "anschließend",
    title: "Sektempfang",
    description:
      "Im Anschluss stoßen wir gemeinsam an und genießen die ersten Momente zusammen.",
  },
  {
    time: "anschließend",
    title: "Kaffee & Kuchen",
    description:
      "Eine süße Pause mit Kaffee, Kuchen und guten Gesprächen.",
  },
  {
    time: "anschließend",
    title: "Beisammensein & Fotos",
    description:
      "Zeit für Begegnungen, Erinnerungsfotos und ein entspanntes Miteinander.",
  },
  {
    time: "anschließend",
    title: "Buffeteröffnung",
    description:
      "Wir freuen uns auf ein gemeinsames Essen mit euren liebevoll mitgebrachten Beiträgen.",
  },
  {
    time: "anschließend",
    title: "Party",
    description:
      "Zum Abschluss möchten wir mit euch lachen, tanzen und einen unvergesslichen Abend verbringen.",
  },
];

export function Ceremony() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="text-center mb-8 sm:mb-10">
        <h2 className="text-3xl sm:text-4xl font-serif text-slate-800 mb-3">
          Ablauf
        </h2>

        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Bitte meldet euch bei unseren Trauzeugen, wenn ihr Programmpunkte einplanen wollt.
        </p>
      </div>

      <Card className="border border-[#E8C7C8] shadow-xl bg-gradient-to-br from-white via-[#F6F1E9]/35 to-white overflow-hidden rounded-[28px]">
        <CardContent className="p-5 sm:p-8 lg:p-10">
          <div className="space-y-4 sm:space-y-5">
            {timelineItems.map((item, index) => (
              <div key={`${item.time}-${item.title}-${index}`}>
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

        </CardContent>
      </Card>
    </div>
  );
}
