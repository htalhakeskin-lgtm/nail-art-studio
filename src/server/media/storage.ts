import "server-only";

import { put } from "@vercel/blob";

import { env } from "@/lib/env";
import { db } from "@/server/db/client";
import { mediaFiles } from "@/server/db/schema";

import type { EncodedImage } from "./image";

/**
 * Where encoded variants live (K-39). With BLOB_READ_WRITE_TOKEN (Vercel preview and
 * production) they go to Vercel Blob; without it (local, CI) to the media_files table, served
 * by /media/[file]. Either way the page stores one base path and the image loader adds
 * "-<width>.webp", exactly like the pre-encoded demo images (K-21).
 */
export async function storeVariants(
  assetId: string,
  image: EncodedImage,
): Promise<{ basePath: string; driver: "blob" | "db" }> {
  if (env.BLOB_READ_WRITE_TOKEN) {
    const urls = await Promise.all(
      image.variants.map(({ width, content }) =>
        put(`gallery/${assetId}-${String(width)}.webp`, content, {
          access: "public",
          contentType: "image/webp",
          addRandomSuffix: false,
          cacheControlMaxAge: 31_536_000,
          token: env.BLOB_READ_WRITE_TOKEN,
        }),
      ),
    );
    const first = urls[0]?.url ?? "";
    return { basePath: first.replace(/-\d+\.webp$/, ""), driver: "blob" };
  }
  await db.insert(mediaFiles).values(
    image.variants.map(({ width, content }) => ({
      key: `${assetId}-${String(width)}.webp`,
      content,
      contentType: "image/webp",
    })),
  );
  return { basePath: `/media/${assetId}`, driver: "db" };
}
