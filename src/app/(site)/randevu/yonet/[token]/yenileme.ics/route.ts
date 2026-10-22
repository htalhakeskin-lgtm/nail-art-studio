import { connection } from "next/server";

import {
  buildIcs,
  getAppointmentByTokenHash,
  hashManageToken,
  isManageToken,
  refillEvent,
} from "@/features/booking";
import { getSiteSettings } from "@/features/site";

/** PRJ-03 (REQ-012): the refill reminder as an .ics file for the visitor's own calendar. */
export async function GET(
  _request: Request,
  ctx: RouteContext<"/randevu/yonet/[token]/yenileme.ics">,
) {
  await connection();
  const { token } = await ctx.params;
  const now = new Date();
  const appointment = isManageToken(token)
    ? await getAppointmentByTokenHash(hashManageToken(token), now)
    : null;
  const settings = await getSiteSettings();
  const event = appointment ? refillEvent(appointment, settings) : null;
  if (!appointment || !event) return new Response("Bulunamadı", { status: 404 });
  return new Response(buildIcs(event, now), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="yenileme-${appointment.code}.ics"`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
