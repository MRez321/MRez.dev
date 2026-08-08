// features/apps/image-optimizer/server.ts
// Server-side optimization pipeline (sharp) + the option schema the public
// API validates against. Imported only by route handlers / server actions.
import sharp from "sharp";
import { z } from "zod";
import { MIME_BY_FORMAT, OUTPUT_FORMATS, type OutputFormat } from "./constants";

export const optimizeOptionsSchema = z
  .object({
    format: z.enum(OUTPUT_FORMATS).default("webp"),
    quality: z.number().int().min(1).max(100).default(80),
    lossless: z.boolean().default(false),
    progressive: z.boolean().default(false),
    stripMetadata: z.boolean().default(true),
    /** Max output width in px; scales down proportionally, never upscales. */
    width: z.number().int().min(1).max(16384).optional(),
  })
  .strict();

export type OptimizeOptions = z.infer<typeof optimizeOptionsSchema>;

export type OptimizeResult = {
  data: Buffer;
  width: number;
  height: number;
  format: OutputFormat;
  mime: string;
};

/**
 * Runs the sharp pipeline. When stripping metadata (default) the image is
 * auto-oriented first so the baked-in EXIF rotation becomes real pixels —
 * otherwise removing the EXIF tag would leave the image rotated.
 */
export async function optimizeImage(
  input: Buffer,
  options: OptimizeOptions
): Promise<OptimizeResult> {
  let pipeline = sharp(input, { failOn: "none" });

  if (options.stripMetadata) {
    pipeline = pipeline.rotate();
  } else {
    pipeline = pipeline.withMetadata();
  }

  if (options.width) {
    pipeline = pipeline.resize({ width: options.width, withoutEnlargement: true });
  }

  switch (options.format) {
    case "jpeg":
      pipeline = pipeline.jpeg({
        quality: options.quality,
        progressive: options.progressive,
      });
      break;
    case "png":
      pipeline = pipeline.png({ compressionLevel: options.lossless ? 9 : 6 });
      break;
    case "webp":
      pipeline = pipeline.webp({
        quality: options.quality,
        lossless: options.lossless,
      });
      break;
    case "gif":
      pipeline = pipeline.gif();
      break;
    case "tiff":
      pipeline = pipeline.tiff({ quality: options.quality });
      break;
  }

  const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });
  return {
    data,
    width: info.width,
    height: info.height,
    format: options.format,
    mime: MIME_BY_FORMAT[options.format],
  };
}
