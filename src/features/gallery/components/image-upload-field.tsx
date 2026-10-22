"use client";

import { ImagePlus } from "lucide-react";
import Image from "next/image";
import { useId, useState } from "react";

import { uploadGalleryImageForm } from "../editor-actions";

const MAX_EDGE = 2560;
/** Vercel functions accept ~4.5 MB per request; everything is shrunk well below that (K-39). */
const SEND_LIMIT = 3_500_000;

/**
 * Phone photos are often 5–12 MB. The browser first scales the photo down to 2560 px and
 * re-encodes it as JPEG; the server still checks and re-encodes it (BR-GLR-002), so this step
 * is only about getting under the request size limit quickly on a mobile connection.
 */
async function shrink(file: File): Promise<Blob> {
  if (file.size <= SEND_LIMIT && file.type === "image/jpeg") return file;
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("encode failed"));
      },
      "image/jpeg",
      0.9,
    );
  });
}

type Uploaded = { id: string; basePath: string; width: number; height: number };

/**
 * Upload field for a gallery photo: preview, progress and errors in plain words. The chosen
 * asset's id goes into a hidden input named `name`, submitted with the work form.
 */
export function ImageUploadField({
  name,
  label,
  hint,
  current,
  error,
}: {
  name: string;
  label: string;
  hint?: string;
  current?: { path: string; alt: string } | null;
  error?: string;
}) {
  const inputId = useId();
  const [uploaded, setUploaded] = useState<Uploaded | null>(null);
  const [status, setStatus] = useState<"idle" | "busy" | "error">("idle");
  const [message, setMessage] = useState("");
  const preview = uploaded?.basePath ?? current?.path;
  const shownError = status === "error" ? message : error;

  async function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    setStatus("busy");
    setMessage("Fotoğraf hazırlanıyor ve yükleniyor…");
    try {
      const body = new FormData();
      body.set("file", await shrink(file), "upload.jpg");
      const result = await uploadGalleryImageForm(body);
      if (!result.ok) {
        setStatus("error");
        setMessage(result.message);
        return;
      }
      setUploaded(result);
      setStatus("idle");
      setMessage("Fotoğraf yüklendi.");
    } catch {
      setStatus("error");
      setMessage("Fotoğraf yüklenemedi. Bağlantınızı kontrol edip tekrar deneyin.");
    }
  }

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="text-sm font-semibold">
        {label}
      </label>
      {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {preview ? (
          <Image
            src={preview}
            width={480}
            height={600}
            alt=""
            sizes="6rem"
            className="h-30 w-24 shrink-0 rounded-lg object-cover"
          />
        ) : (
          <span className="flex h-30 w-24 shrink-0 items-center justify-center rounded-lg border border-dashed bg-surface-muted text-muted-foreground">
            <ImagePlus aria-hidden="true" className="size-6" />
          </span>
        )}
        <input
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => {
            void onChange(event);
          }}
          disabled={status === "busy"}
          aria-invalid={shownError ? true : undefined}
          aria-describedby={`${inputId}-durum`}
          className="min-h-11 w-full text-base file:mr-3 file:min-h-11 file:rounded-full file:border-0 file:bg-primary file:px-4 file:font-semibold file:text-primary-foreground"
        />
      </div>
      <p
        id={`${inputId}-durum`}
        aria-live="polite"
        className={
          shownError ? "text-sm font-semibold text-danger" : "text-sm text-muted-foreground"
        }
      >
        {shownError ?? message}
      </p>
      <input type="hidden" name={name} value={uploaded?.id ?? ""} />
    </div>
  );
}
