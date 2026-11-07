"use client";

import { useState, useRef, useTransition } from "react";
import NextImage from "next/image";
import {
  Camera,
  Image as ImageIcon,
  Plus,
  Trash2,
  X,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import type { EventData } from "./types";
import type { ResolvedTheme } from "@/lib/theme";
import { compressImage } from "@/lib/client-image";
import { addEventPhoto, deleteEventPhoto } from "@/app/actions/event/photos";
import { useCaptcha } from "@/components/ui/CaptchaProvider";
import { CAPTCHA_RESPONSE_FIELD } from "@/lib/captcha-types";

type PhotoItem = {
  id: string;
  url: string;
  caption: string | null;
  uploaderName: string | null;
  uploaderId: string | null;
  isVenuePhoto: boolean;
  createdAt: Date;
};

export function EventPhotosBlock({
  event,
  isHost,
  isApprovedGuest,
  guestEditToken,
  guestRsvpId,
  theme: t,
}: {
  event: EventData;
  isHost: boolean;
  isApprovedGuest: boolean;
  guestEditToken?: string | null;
  guestRsvpId?: string | null;
  theme: ResolvedTheme;
}) {
  const [photos, setPhotos] = useState<PhotoItem[]>((event.photos as PhotoItem[]) || []);
  const [activeTab, setActiveTab] = useState<"all" | "venue" | "community">("all");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "compressing" | "uploading">("idle");
  const [caption, setCaption] = useState("");
  const [asVenuePhoto, setAsVenuePhoto] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { runWithCaptcha } = useCaptcha();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canUpload = isHost || isApprovedGuest;

  const venuePhotos = photos.filter((p) => p.isVenuePhoto);
  const communityPhotos = photos.filter((p) => !p.isVenuePhoto);

  const displayedPhotos =
    activeTab === "venue" ? venuePhotos : activeTab === "community" ? communityPhotos : photos;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileToUpload(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setShowUploadModal(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUploadSubmit = async () => {
    if (!fileToUpload) return;
    setIsUploading(true);
    setUploadStatus("compressing");

    try {
      // Client-side compression
      const compressed = await compressImage(fileToUpload, {
        maxWidth: 1600,
        maxHeight: 1600,
        quality: 0.82,
      });

      setUploadStatus("uploading");
      const form = new FormData();
      form.append("file", compressed);
      form.append("eventId", event.id);
      if (guestEditToken) {
        form.append("guestEditToken", guestEditToken);
      }

      const res = await runWithCaptcha("image_upload", (token) => {
        if (token) form.set(CAPTCHA_RESPONSE_FIELD, token);
        return fetch("/api/upload", { method: "POST", body: form });
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Error al subir la imagen");
      }

      const { url } = (await res.json()) as { url: string };

      // Register photo in db
      const result = await addEventPhoto({
        eventId: event.id,
        url,
        caption: caption.trim() || undefined,
        isVenuePhoto: isHost ? asVenuePhoto : false,
        guestEditToken: guestEditToken ?? undefined,
      });

      if (result.success && result.photo) {
        const newPhoto: PhotoItem = {
          ...result.photo,
          createdAt: new Date(result.photo.createdAt),
        };
        setPhotos((prev) => [newPhoto, ...prev]);
        setShowUploadModal(false);
        setFileToUpload(null);
        setPreviewUrl(null);
        setCaption("");
        setAsVenuePhoto(false);
      } else {
        alert(result.error || "No se pudo registrar la foto");
      }
    } catch (err: unknown) {
      console.error("Error subiendo foto:", err);
      alert(err instanceof Error ? err.message : "Error inesperado al subir la foto");
    } finally {
      setIsUploading(false);
      setUploadStatus("idle");
    }
  };

  const handleDeletePhoto = (photoId: string) => {
    if (!confirm("¿Deseas eliminar esta foto?")) return;
    startTransition(async () => {
      const res = await deleteEventPhoto({
        photoId,
        guestEditToken: guestEditToken ?? undefined,
      });
      if (res.success) {
        setPhotos((prev) => prev.filter((p) => p.id !== photoId));
        if (selectedPhoto?.id === photoId) {
          setSelectedPhoto(null);
        }
      } else {
        alert(res.error || "No se pudo eliminar la foto");
      }
    });
  };

  return (
    <section className="card-sheet mb-8 p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="tech-index text-[var(--signal)]">SEC-04</span>
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-[var(--muted)]">
              Galería & Espacio
            </span>
          </div>
          <h2 className="text-2xl font-black font-display tracking-tight text-[var(--ink)]">
            Registro Visual del Evento
          </h2>
          <p className="text-sm text-[var(--muted)] mt-0.5">
            Fotos del recinto verificadas y momentos compartidos por los asistentes.
          </p>
        </div>

        {/* Upload Button */}
        {canUpload && (
          <div className="flex items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileSelect}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-invita btn-signal inline-flex items-center gap-2 text-xs py-2.5 px-4"
            >
              <Camera size={14} />
              <span>Subir Foto</span>
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 pt-4 pb-4">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-3 py-1.5 text-xs font-mono font-bold tracking-wider uppercase border transition-all ${
            activeTab === "all"
              ? "bg-[var(--ink)] text-[var(--ground)] border-[var(--ink)]"
              : "bg-[var(--paper)] text-[var(--muted)] border-[var(--line)] hover:text-[var(--ink)]"
          }`}
        >
          Todas ({photos.length})
        </button>
        <button
          onClick={() => setActiveTab("venue")}
          className={`px-3 py-1.5 text-xs font-mono font-bold tracking-wider uppercase border transition-all ${
            activeTab === "venue"
              ? "bg-[var(--ink)] text-[var(--ground)] border-[var(--ink)]"
              : "bg-[var(--paper)] text-[var(--muted)] border-[var(--line)] hover:text-[var(--ink)]"
          }`}
        >
          El Recinto ({venuePhotos.length})
        </button>
        <button
          onClick={() => setActiveTab("community")}
          className={`px-3 py-1.5 text-xs font-mono font-bold tracking-wider uppercase border transition-all ${
            activeTab === "community"
              ? "bg-[var(--ink)] text-[var(--ground)] border-[var(--ink)]"
              : "bg-[var(--paper)] text-[var(--muted)] border-[var(--line)] hover:text-[var(--ink)]"
          }`}
        >
          Comunidad ({communityPhotos.length})
        </button>
      </div>

      {/* Grid */}
      {displayedPhotos.length === 0 ? (
        <div className="py-12 text-center border-2 border-dashed border-[var(--line)] bg-[var(--ground)]/40 p-8 mt-2">
          <ImageIcon className="mx-auto text-[var(--muted)] mb-3" size={32} />
          <h3 className="font-display font-bold text-base text-[var(--ink)]">
            Aún no hay fotos en esta sección
          </h3>
          <p className="text-xs text-[var(--muted)] max-w-sm mx-auto mt-1">
            {canUpload
              ? "Sé el primero en compartir fotos del lugar o de la previa del evento."
              : "Las fotos compartidas por el anfitrión y asistentes aparecerán aquí."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-2">
          {displayedPhotos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              className="group relative aspect-square bg-[var(--ground)] border border-[var(--ink)] overflow-hidden cursor-pointer hard-shadow hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform"
            >
              <NextImage
                src={photo.url}
                alt={photo.caption || "Foto del evento"}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* Badges overlay */}
              <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                {photo.isVenuePhoto && (
                  <span className="bg-[var(--ink)] text-[var(--ground)] text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 border border-white/20">
                    Recinto
                  </span>
                )}
              </div>

              {/* Bottom Caption / Author Bar on Hover */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 pt-6 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between">
                <span className="truncate font-sans text-[11px] font-medium">
                  {photo.caption || photo.uploaderName}
                </span>
                {photo.isVenuePhoto && (
                  <ShieldCheck size={12} className="text-[var(--signal)] flex-shrink-0" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-[var(--paper)] border-2 border-[var(--ink)] hard-shadow overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--line)] bg-[var(--ground)]">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                  Por {selectedPhoto.uploaderName || "Anónimo"}
                </span>
                {selectedPhoto.isVenuePhoto && (
                  <span className="bg-[var(--signal)] text-white text-[9px] font-mono font-bold uppercase px-1.5 py-0.5">
                    Oficial Recinto
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {(isHost || (guestRsvpId && selectedPhoto.uploaderId === guestRsvpId)) && (
                  <button
                    onClick={() => handleDeletePhoto(selectedPhoto.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 transition-colors"
                    title="Eliminar foto"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="p-1.5 text-[var(--ink)] hover:bg-[var(--line)] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Image */}
            <div className="relative w-full max-h-[70vh] aspect-video bg-black flex items-center justify-center">
              <NextImage
                src={selectedPhoto.url}
                alt={selectedPhoto.caption || "Foto del evento"}
                fill
                sizes="(max-width: 1200px) 90vw, 1000px"
                className="object-contain"
              />
            </div>

            {/* Modal Footer */}
            {selectedPhoto.caption && (
              <div className="p-4 border-t border-[var(--line)] bg-[var(--paper)]">
                <p className="text-sm font-sans text-[var(--ink)]">{selectedPhoto.caption}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload Preview & Caption Modal */}
      {showUploadModal && previewUrl && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-lg w-full bg-[var(--paper)] border-2 border-[var(--ink)] hard-shadow p-6">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--line)] mb-4">
              <h3 className="font-display font-black text-lg text-[var(--ink)]">
                Publicar Fotografía
              </h3>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setFileToUpload(null);
                  setPreviewUrl(null);
                }}
                disabled={isUploading}
                className="p-1 hover:bg-[var(--line)]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative aspect-video w-full bg-[var(--ground)] border border-[var(--ink)] mb-4 overflow-hidden">
              <NextImage src={previewUrl} alt="Vista previa" fill className="object-contain" />
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
                  Leyenda / Descripción (opcional)
                </label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Ej: La terraza lista para la tarde..."
                  className="w-full px-3 py-2 text-sm bg-[var(--paper)] border border-[var(--ink)] focus:outline-none focus:ring-1 focus:ring-[var(--signal)] font-sans"
                  maxLength={120}
                />
              </div>

              {isHost && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={asVenuePhoto}
                    onChange={(e) => setAsVenuePhoto(e.target.checked)}
                    className="accent-[var(--signal)] w-4 h-4"
                  />
                  <span className="text-xs font-sans text-[var(--ink)] font-semibold">
                    Marcar como foto oficial del recinto / instalaciones
                  </span>
                </label>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    setFileToUpload(null);
                    setPreviewUrl(null);
                  }}
                  disabled={isUploading}
                  className="btn-invita text-xs py-2 px-4"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleUploadSubmit}
                  disabled={isUploading}
                  className="btn-invita btn-signal text-xs py-2 px-5 inline-flex items-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      <span>
                        {uploadStatus === "compressing" ? "Optimizando..." : "Subiendo..."}
                      </span>
                    </>
                  ) : (
                    <span>Publicar</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
