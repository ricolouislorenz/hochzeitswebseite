import { useEffect, useRef, useState } from "react";
import { AlertCircle, Download, Image as ImageIcon, LoaderCircle, RefreshCw, X } from "lucide-react";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";

interface UploadedImage {
  id: string;
  name: string;
  createdTime: string;
}

function DriveImage({ image, onOpen }: { image: UploadedImage; onOpen: (url: string, name: string) => void }) {
  const containerRef = useRef<HTMLButtonElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!shouldLoad) return;
    let objectUrl: string | null = null;
    const controller = new AbortController();
    const guestCode = localStorage.getItem("guestCode");

    fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-bda29bfd/media/images/${encodeURIComponent(image.id)}`,
      {
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
          "X-Guest-Code": guestCode ?? "",
        },
        signal: controller.signal,
      },
    )
      .then((response) => {
        if (!response.ok) throw new Error("Bild konnte nicht geladen werden");
        return response.blob();
      })
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch((error) => {
        if (error.name !== "AbortError") setFailed(true);
      });

    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [image.id, shouldLoad]);

  return (
    <button
      ref={containerRef}
      type="button"
      disabled={!url}
      onClick={() => url && onOpen(url, image.name)}
      className="group relative aspect-square overflow-hidden rounded-2xl border border-[#E8C7C8]/70 bg-white shadow-sm disabled:cursor-default"
    >
      {url ? (
        <img src={url} alt={image.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
      ) : failed ? (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400">
          <AlertCircle className="size-7" />
          <span className="text-xs">Nicht verfügbar</span>
        </div>
      ) : (
        <div className="flex h-full items-center justify-center"><LoaderCircle className="size-7 animate-spin text-[#C6A75E]" /></div>
      )}
    </button>
  );
}

export function UploadedImagesGallery() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState<{ url: string; name: string } | null>(null);

  const loadImages = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const guestCode = localStorage.getItem("guestCode");
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bda29bfd/media/images`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            "X-Guest-Code": guestCode ?? "",
          },
        },
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) throw new Error(data.error || "Die Bilder konnten nicht geladen werden.");
      setImages(data.images);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Die Bilder konnten nicht geladen werden.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { void loadImages(); }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-8">
      <div className="mb-8 text-center">
        <ImageIcon className="mx-auto mb-4 size-14 text-[#C6A75E]" />
        <h2 className="mb-3 text-3xl font-serif text-slate-800 sm:text-4xl">Bilder</h2>
        <p className="mx-auto max-w-2xl text-slate-600">Hier findet ihr die Fotos, die über „Fotos hochladen“ mit uns geteilt wurden.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><LoaderCircle className="size-9 animate-spin text-[#C6A75E]" /></div>
      ) : error ? (
        <div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
          <p>{error}</p>
          <button type="button" onClick={loadImages} className="mt-4 inline-flex items-center gap-2 font-medium underline"><RefreshCw className="size-4" />Erneut versuchen</button>
        </div>
      ) : images.length === 0 ? (
        <div className="rounded-2xl border border-[#E8C7C8] bg-white/70 px-6 py-16 text-center text-slate-500">
          <ImageIcon className="mx-auto mb-4 size-12 text-[#C6A75E]/60" />
          <p>Noch wurden keine passenden Bilder hochgeladen.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
          {images.map((image) => <DriveImage key={image.id} image={image} onOpen={(url, name) => setFullscreen({ url, name })} />)}
        </div>
      )}

      {fullscreen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4" onClick={() => setFullscreen(null)}>
          <button type="button" aria-label="Vollbild schließen" onClick={() => setFullscreen(null)} className="absolute right-4 top-4 rounded-full bg-white/15 p-2 text-white hover:bg-white/25"><X className="size-7" /></button>
          <a
            href={fullscreen.url}
            download={fullscreen.name}
            onClick={(event) => event.stopPropagation()}
            className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-lg transition-colors hover:bg-[#F6F1E9]"
          >
            <Download className="size-5" />
            Herunterladen
          </a>
          <img src={fullscreen.url} alt={fullscreen.name} className="max-h-full max-w-full object-contain" onClick={(event) => event.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
