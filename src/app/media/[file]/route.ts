import { eq } from "drizzle-orm";
import { connection } from "next/server";

import { db } from "@/server/db/client";
import { mediaFiles } from "@/server/db/schema";

const KEY = /^[0-9a-f-]{36}-(480|960|1600)\.webp$/;

/**
 * Serves uploaded image variants stored in the database (K-39: environments without a Blob
 * store). Keys contain a random id, the content never changes, so browsers cache it for a year.
 */
export async function GET(_request: Request, ctx: RouteContext<"/media/[file]">) {
  await connection();
  const { file } = await ctx.params;
  if (!KEY.test(file)) return new Response("Bulunamadı", { status: 404 });
  const [row] = await db
    .select({ content: mediaFiles.content, contentType: mediaFiles.contentType })
    .from(mediaFiles)
    .where(eq(mediaFiles.key, file))
    .limit(1);
  if (!row) return new Response("Bulunamadı", { status: 404 });
  return new Response(new Uint8Array(row.content), {
    headers: {
      "Content-Type": row.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
