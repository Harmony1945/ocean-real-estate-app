"use client";

import { ChangeEvent, useState } from "react";
import {
  PROPERTY_PHOTO_LIMIT,
  PROPERTY_PHOTO_MAX_SIZE,
  PROPERTY_PHOTO_MIME_TYPES,
  type PropertyMediaRow
} from "@/lib/supabase/client";

export type PropertyPhotoPreviewItem = PropertyMediaRow & {
  preview_url?: string;
  is_pending?: boolean;
};

export function validatePropertyPhotoFiles(files: File[], currentCount: number) {
  if (currentCount + files.length > PROPERTY_PHOTO_LIMIT) {
    return `En fazla ${PROPERTY_PHOTO_LIMIT} fotoğraf yüklenebilir.`;
  }

  const invalidFile = files.find((file) => !PROPERTY_PHOTO_MIME_TYPES.includes(file.type as typeof PROPERTY_PHOTO_MIME_TYPES[number]));
  if (invalidFile) return "Sadece JPEG, PNG veya WebP fotoğraf yüklenebilir.";

  const oversizedFile = files.find((file) => file.size > PROPERTY_PHOTO_MAX_SIZE);
  if (oversizedFile) return "Her fotoğraf en fazla 10 MB olabilir.";

  return "";
}

export function PropertyPhotoManager({
  disabled,
  loading,
  markingCoverId,
  media,
  message,
  progress,
  refreshingId = "",
  removingId = "",
  uploadId,
  onMarkCover,
  onRemove,
  onRefreshWatermark,
  onUpload
}: {
  disabled: boolean;
  loading: boolean;
  markingCoverId: string;
  media: PropertyPhotoPreviewItem[];
  message: string;
  progress: number | null;
  refreshingId?: string;
  removingId?: string;
  uploadId: string;
  onMarkCover: (mediaId: string) => void;
  onRemove?: (mediaId: string) => void;
  onRefreshWatermark?: (mediaId: string) => void;
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  const remaining = Math.max(PROPERTY_PHOTO_LIMIT - media.length, 0);
  const isUploading = progress !== null;

  return (
    <div className="mt-6 rounded-3xl border border-slate-200 bg-stone-50 p-4 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-950 dark:text-slate-100">Portföy Fotoğrafları</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {media.length}/{PROPERTY_PHOTO_LIMIT} · JPEG, PNG veya WebP · maksimum 10 MB
          </p>
        </div>
        {isUploading ? (
          <div
            className="grid h-12 w-12 place-items-center rounded-full text-xs font-semibold text-slate-950 dark:text-slate-100"
            style={{ background: `conic-gradient(#16a34a ${progress * 3.6}deg, #e5e7eb 0deg)` }}
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-stone-50 dark:bg-[#080808]">
              {progress === 100 ? "✓" : `${progress}%`}
            </span>
          </div>
        ) : null}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {media.map((item) => (
          <PropertyPhotoPreviewCard
            key={item.id}
            item={item}
            markingCoverId={markingCoverId}
            refreshingId={refreshingId}
            removingId={removingId}
            onMarkCover={onMarkCover}
            onRemove={onRemove}
            onRefreshWatermark={onRefreshWatermark}
          />
        ))}

        <label
          htmlFor={uploadId}
          className={`flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center transition dark:border-white/10 dark:bg-[#080808] ${
            disabled || remaining === 0 ? "cursor-not-allowed opacity-60" : "hover:border-slate-500 dark:hover:border-white/25"
          }`}
        >
          <span className="grid h-12 w-12 place-items-center rounded-full border border-slate-200 text-xl dark:border-white/10">↑</span>
          <span className="mt-3 text-sm font-semibold text-slate-950 dark:text-slate-100">
            {remaining === 0 ? "Limit doldu" : "Fotoğraf yükle"}
          </span>
          <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {loading ? "Fotoğraflar yükleniyor..." : `${remaining} hak kaldı`}
          </span>
          <input
            id={uploadId}
            className="sr-only"
            type="file"
            accept={PROPERTY_PHOTO_MIME_TYPES.join(",")}
            multiple
            disabled={disabled || remaining === 0}
            onChange={onUpload}
          />
        </label>
      </div>

      {message ? (
        <p className={`mt-3 text-sm ${message.includes("yüklendi") || message.includes("güncellendi") || message.includes("kaldırıldı") ? "text-emerald-700" : "text-amber-700"}`}>
          {message}
        </p>
      ) : null}
    </div>
  );
}

function PropertyPhotoPreviewCard({
  item,
  markingCoverId,
  refreshingId,
  removingId,
  onMarkCover,
  onRemove,
  onRefreshWatermark
}: {
  item: PropertyPhotoPreviewItem;
  markingCoverId: string;
  refreshingId: string;
  removingId: string;
  onMarkCover: (mediaId: string) => void;
  onRemove?: (mediaId: string) => void;
  onRefreshWatermark?: (mediaId: string) => void;
}) {
  const [previewFailed, setPreviewFailed] = useState(false);
  const previewUrl = item.signed_url || item.preview_url || "";

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#080808]">
      {previewUrl && !previewFailed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewUrl}
          alt={item.file_name || "Portföy fotoğrafı"}
          className="h-32 w-full object-cover"
          onError={() => setPreviewFailed(true)}
        />
      ) : (
        <div className="grid h-32 place-items-center bg-slate-100 px-3 text-center text-xs text-slate-500 dark:bg-white/[0.06] dark:text-slate-400">
          {previewFailed ? "Önizleme gösterilemedi" : "Önizleme hazırlanıyor"}
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
        <span className="truncate text-xs text-slate-500 dark:text-slate-400">
          {item.is_pending ? "Seçildi" : item.is_cover ? "Kapak" : item.mime_type || "Fotoğraf"}
        </span>
        <div className="flex items-center gap-2">
          {!item.is_cover && !item.is_pending ? (
            <button
              className="text-xs font-medium text-slate-700 transition hover:text-slate-950 disabled:opacity-50 dark:text-slate-300 dark:hover:text-white"
              type="button"
              disabled={Boolean(markingCoverId || refreshingId || removingId)}
              onClick={() => onMarkCover(item.id)}
            >
              {markingCoverId === item.id ? "İşleniyor..." : "Kapak yap"}
            </button>
          ) : null}
          {!item.is_pending && onRefreshWatermark ? (
            <button
              className="text-xs font-medium text-slate-700 transition hover:text-slate-950 disabled:opacity-50 dark:text-slate-300 dark:hover:text-white"
              type="button"
              disabled={Boolean(markingCoverId || refreshingId || removingId)}
              onClick={() => onRefreshWatermark(item.id)}
            >
              {refreshingId === item.id ? "Yenileniyor..." : "Watermark Yenile"}
            </button>
          ) : null}
          {!item.is_pending && onRemove ? (
            <button
              className="text-xs font-medium text-red-600 transition hover:text-red-700 disabled:opacity-50 dark:text-red-300 dark:hover:text-red-200"
              type="button"
              disabled={Boolean(markingCoverId || refreshingId || removingId)}
              onClick={() => onRemove(item.id)}
            >
              {removingId === item.id ? "Kaldırılıyor..." : "Kaldır"}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
