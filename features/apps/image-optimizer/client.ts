// features/apps/image-optimizer/client.ts
// Browser-side optimization pipeline — everything runs locally on the
// client, no uploads. Canvas encoding supports WebP/JPEG/PNG output.
import { EXT_BY_FORMAT, MIME_BY_FORMAT } from "./constants";

export const CLIENT_FORMATS = ["webp", "jpeg", "png"] as const;
export type ClientFormat = (typeof CLIENT_FORMATS)[number];

export type OptimizeOptions = {
  format: ClientFormat;
  /** 1-100; ignored by PNG. */
  quality: number;
  /** Max output width in px; null keeps the original dimensions. */
  maxWidth: number | null;
};

export type OptimizeResult = {
  blob: Blob;
  width: number;
  height: number;
  originalBytes: number;
  optimizedBytes: number;
};

export function outputFileName(originalName: string, format: ClientFormat): string {
  const base = (originalName.split(/[\\/]/).pop() ?? "image").replace(/\.[^.]+$/, "") || "image";
  return `${base}.${EXT_BY_FORMAT[format]}`;
}

/**
 * Decodes, resizes, re-encodes a single image. `createImageBitmap` applies
 * EXIF orientation automatically, and canvas encoding strips all metadata.
 */
export async function optimizeImageInBrowser(
  file: File,
  options: OptimizeOptions
): Promise<OptimizeResult> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  try {
    const scale =
      options.maxWidth && bitmap.width > options.maxWidth
        ? options.maxWidth / bitmap.width
        : 1;
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D context is unavailable.");

    ctx.drawImage(bitmap, 0, 0, width, height);
    const blob = await canvasToBlob(canvas, MIME_BY_FORMAT[options.format], options.quality / 100);
    return { blob, width, height, originalBytes: file.size, optimizedBytes: blob.size };
  } finally {
    bitmap.close();
  }
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mime: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Image encoding failed."))),
      mime,
      quality
    );
  });
}

export function formatBytes(bytes: number): string {
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${bytes} B`;
}
