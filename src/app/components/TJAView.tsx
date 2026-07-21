import { useRef, useState } from "react";
import {
  AlertCircle,
  Camera,
  Check,
  FileText,
  Image as ImageIcon,
  LoaderCircle,
  Sparkles,
  Trash2,
  Upload,
  Video,
} from "lucide-react";
import { projectId, publicAnonKey } from "../../../utils/supabase/info";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Progress } from "./ui/progress";

type UploadStatus = "waiting" | "uploading" | "success" | "error";

interface UploadItem {
  id: string;
  file: File;
  progress: number;
  status: UploadStatus;
  error?: string;
}

const MAX_FILES = 30;
const MAX_IMAGE_OR_PDF_SIZE = 50 * 1024 * 1024;
const MAX_VIDEO_SIZE = 1024 * 1024 * 1024;
const CHUNK_SIZE = 8 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "heic", "heif", "mp4", "mov", "m4v", "pdf"];

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function getExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

function isVideo(file: File) {
  return file.type.startsWith("video/") || ["mp4", "mov", "m4v"].includes(getExtension(file.name));
}

function validateFile(file: File): string | null {
  const extension = getExtension(file.name);
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return "Nicht unterstütztes Dateiformat";
  }

  const maximumSize = isVideo(file) ? MAX_VIDEO_SIZE : MAX_IMAGE_OR_PDF_SIZE;
  if (file.size > maximumSize) {
    return isVideo(file) ? "Video ist größer als 1 GB" : "Datei ist größer als 50 MB";
  }

  if (file.size === 0) return "Die Datei ist leer";
  return null;
}

function getFileIcon(file: File) {
  if (isVideo(file)) return Video;
  if (file.type === "application/pdf" || getExtension(file.name) === "pdf") return FileText;
  return ImageIcon;
}

async function createUploadSession(file: File, guestCode: string) {
  const response = await fetch(
    `https://${projectId}.supabase.co/functions/v1/make-server-bda29bfd/media/upload-session`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({
        guestCode,
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        fileSize: file.size,
      }),
    },
  );

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.uploadUrl) {
    throw new Error(data.error || "Der Upload konnte nicht vorbereitet werden.");
  }

  return data.uploadUrl as string;
}

function uploadChunk(
  uploadUrl: string,
  chunk: Blob,
  start: number,
  fileSize: number,
  mimeType: string,
  onProgress: (loaded: number) => void,
) {
  return new Promise<number>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("PUT", uploadUrl);
    request.setRequestHeader("Content-Type", mimeType);
    request.setRequestHeader("Content-Range", `bytes ${start}-${start + chunk.size - 1}/${fileSize}`);

    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(event.loaded);
    };

    request.onload = () => {
      if ([200, 201, 308].includes(request.status)) {
        resolve(request.status);
      } else {
        reject(new Error(`Google Drive hat den Upload abgelehnt (${request.status}).`));
      }
    };
    request.onerror = () => reject(new Error("Die Verbindung zu Google Drive wurde unterbrochen."));
    request.onabort = () => reject(new Error("Der Upload wurde abgebrochen."));
    request.send(chunk);
  });
}

async function uploadFileToDrive(
  file: File,
  uploadUrl: string,
  onProgress: (progress: number) => void,
) {
  const mimeType = file.type || "application/octet-stream";
  let uploadedBytes = 0;

  while (uploadedBytes < file.size) {
    const end = Math.min(uploadedBytes + CHUNK_SIZE, file.size);
    const chunk = file.slice(uploadedBytes, end);
    const status = await uploadChunk(
      uploadUrl,
      chunk,
      uploadedBytes,
      file.size,
      mimeType,
      (loaded) => onProgress(Math.min(99, Math.round(((uploadedBytes + loaded) / file.size) * 100))),
    );

    uploadedBytes = end;
    onProgress(status === 200 || status === 201 ? 100 : Math.round((uploadedBytes / file.size) * 100));
  }
}

export function TJAView() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<UploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectionError, setSelectionError] = useState<string | null>(null);

  const updateItem = (id: string, update: Partial<UploadItem>) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...update } : item)));
  };

  const addFiles = (newFiles: File[]) => {
    setSelectionError(null);
    const remainingPlaces = MAX_FILES - items.length;
    if (remainingPlaces <= 0) {
      setSelectionError(`Es können maximal ${MAX_FILES} Dateien gleichzeitig ausgewählt werden.`);
      return;
    }

    const accepted: UploadItem[] = [];
    const rejected: string[] = [];

    newFiles.slice(0, remainingPlaces).forEach((file) => {
      const validationError = validateFile(file);
      if (validationError) {
        rejected.push(`${file.name}: ${validationError}`);
      } else {
        accepted.push({
          id: crypto.randomUUID(),
          file,
          progress: 0,
          status: "waiting",
        });
      }
    });

    if (newFiles.length > remainingPlaces) {
      rejected.push(`Es wurden nur die ersten ${remainingPlaces} Dateien übernommen.`);
    }
    if (rejected.length) setSelectionError(rejected.slice(0, 3).join(" · "));
    setItems((current) => [...current, ...accepted]);
  };

  const uploadOne = async (item: UploadItem, guestCode: string) => {
    updateItem(item.id, { status: "uploading", progress: 0, error: undefined });
    try {
      const uploadUrl = await createUploadSession(item.file, guestCode);
      await uploadFileToDrive(item.file, uploadUrl, (progress) => updateItem(item.id, { progress }));
      updateItem(item.id, { status: "success", progress: 100 });
    } catch (error) {
      updateItem(item.id, {
        status: "error",
        error: error instanceof Error ? error.message : "Unbekannter Upload-Fehler",
      });
    }
  };

  const startUploads = async (onlyItem?: UploadItem) => {
    const guestCode = localStorage.getItem("guestCode");
    if (!guestCode) {
      setSelectionError("Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.");
      return;
    }

    const queue = onlyItem
      ? [onlyItem]
      : items.filter((item) => item.status === "waiting" || item.status === "error");
    if (!queue.length) return;

    setIsUploading(true);
    const workers = Array.from({ length: Math.min(2, queue.length) }, async () => {
      while (queue.length) {
        const nextItem = queue.shift();
        if (nextItem) await uploadOne(nextItem, guestCode);
      }
    });
    await Promise.all(workers);
    setIsUploading(false);
  };

  const successfulUploads = items.filter((item) => item.status === "success").length;
  const pendingUploads = items.filter((item) => item.status !== "success").length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="text-center mb-8 sm:mb-10">
        <Sparkles className="size-14 sm:size-16 text-[#C6A75E] mx-auto mb-4" />
        <h2 className="text-3xl sm:text-4xl font-serif text-slate-800 mb-3">Fotos teilen</h2>
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Teilt eure schönsten Fotos, Videos und Erinnerungen mit uns. Eure Dateien werden sicher
          in unserem privaten Hochzeitsalbum gespeichert.
        </p>
      </div>

      <Card className="border border-[#E8C7C8] shadow-lg bg-gradient-to-br from-white via-[#F6F1E9]/40 to-white overflow-hidden">
        <CardContent className="p-5 sm:p-8">
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif,video/mp4,video/quicktime,application/pdf,.heic,.heif,.mov,.m4v"
            className="hidden"
            onChange={(event) => {
              addFiles(Array.from(event.target.files ?? []));
              event.target.value = "";
            }}
          />

          <button
            type="button"
            disabled={isUploading}
            onClick={() => inputRef.current?.click()}
            onDragEnter={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              addFiles(Array.from(event.dataTransfer.files));
            }}
            className={`w-full rounded-2xl border-2 border-dashed px-5 py-10 sm:py-14 transition-all ${
              isDragging
                ? "border-[#C6A75E] bg-[#C6A75E]/10 scale-[1.01]"
                : "border-[#D8C2AA] bg-[#FFFDF9] hover:border-[#C6A75E] hover:bg-[#F6F1E9]/60"
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            <div className="w-20 h-20 bg-[#E8C7C8]/25 rounded-full flex items-center justify-center mx-auto mb-5">
              <Camera className="size-10 text-[#C6A75E]" />
            </div>
            <span className="block text-xl sm:text-2xl font-serif text-slate-800 mb-2">
              Fotos und Videos auswählen
            </span>
            <span className="block text-sm sm:text-base text-slate-500">
              Antippen oder Dateien hierher ziehen
            </span>
            <span className="block text-xs text-slate-400 mt-3">
              JPG, PNG, HEIC, WebP, MP4, MOV und PDF
            </span>
          </button>

          {selectionError && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="size-5 shrink-0 mt-0.5" />
              <span>{selectionError}</span>
            </div>
          )}

          {items.length > 0 && (
            <div className="mt-7 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-medium text-slate-700">
                  {items.length} {items.length === 1 ? "Datei" : "Dateien"} ausgewählt
                </h3>
                {!isUploading && successfulUploads === items.length && (
                  <span className="inline-flex items-center gap-1.5 text-sm text-emerald-700">
                    <Check className="size-4" /> Alle hochgeladen
                  </span>
                )}
              </div>

              {items.map((item) => {
                const FileIcon = getFileIcon(item.file);
                return (
                  <div key={item.id} className="rounded-xl border border-[#E8C7C8]/80 bg-white p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-[#F6F1E9] p-2.5">
                        <FileIcon className="size-5 text-[#C6A75E]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-700" title={item.file.name}>
                          {item.file.name}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-400">{formatFileSize(item.file.size)}</p>

                        {item.status === "uploading" && (
                          <div className="mt-3 flex items-center gap-3">
                            <Progress value={item.progress} className="h-2 flex-1" />
                            <span className="w-10 text-right text-xs text-slate-500">{item.progress}%</span>
                          </div>
                        )}
                        {item.status === "success" && (
                          <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                            <Check className="size-4" /> Erfolgreich hochgeladen
                          </p>
                        )}
                        {item.status === "error" && (
                          <div className="mt-2">
                            <p className="text-xs text-red-600">{item.error}</p>
                            <button
                              type="button"
                              onClick={() => startUploads(item)}
                              disabled={isUploading}
                              className="mt-1 text-xs font-medium text-[#A88030] underline underline-offset-2 disabled:opacity-50"
                            >
                              Erneut versuchen
                            </button>
                          </div>
                        )}
                      </div>

                      {item.status === "uploading" ? (
                        <LoaderCircle className="size-5 shrink-0 animate-spin text-[#C6A75E]" />
                      ) : item.status === "success" ? (
                        <div className="rounded-full bg-emerald-100 p-1">
                          <Check className="size-4 text-emerald-700" />
                        </div>
                      ) : (
                        <button
                          type="button"
                          aria-label={`${item.file.name} entfernen`}
                          onClick={() => setItems((current) => current.filter(({ id }) => id !== item.id))}
                          disabled={isUploading}
                          className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                        >
                          <Trash2 className="size-5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {pendingUploads > 0 && (
                <Button
                  type="button"
                  onClick={() => startUploads()}
                  disabled={isUploading}
                  className="mt-3 w-full bg-[#C6A75E] py-6 text-base text-white hover:bg-[#A3B18A]"
                >
                  {isUploading ? (
                    <><LoaderCircle className="mr-2 size-5 animate-spin" /> Dateien werden hochgeladen …</>
                  ) : (
                    <><Upload className="mr-2 size-5" /> {pendingUploads} {pendingUploads === 1 ? "Datei" : "Dateien"} hochladen</>
                  )}
                </Button>
              )}

              {successfulUploads > 0 && !isUploading && (
                <button
                  type="button"
                  onClick={() => setItems((current) => current.filter((item) => item.status !== "success"))}
                  className="w-full py-2 text-sm text-slate-500 hover:text-slate-700"
                >
                  Erfolgreiche Uploads aus der Liste entfernen
                </button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <p className="mx-auto mt-5 max-w-2xl text-center text-xs leading-relaxed text-slate-400">
        Videos dürfen bis zu 1 GB, Fotos und PDFs bis zu 50 MB groß sein. Bitte lasst diese Seite
        geöffnet, bis alle Dateien vollständig hochgeladen wurden.
      </p>
    </div>
  );
}
