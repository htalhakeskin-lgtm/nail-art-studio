import { connection } from "next/server";

import {
  appointmentEvent,
  buildIcs,
  getAppointmentByTokenHash,
  hashManageToken,
  isManageToken,
} from "@/features/booking";
import { getSiteSettings } from "@/features/site";

/** E-08: the appointment as an .ics file, behind the same secret link (BR-RND-009). */
export async function GET(
  _request: Request,
  ctx: RouteContext<"/randevu/yonet/[token]/takvim.ics">,
) {
  await connection();
  const { token } = await ctx.params;
  const now = new Date();
  const appointment = isManageToken(token)
    ? await getAppointmentByTokenHash(hashManageToken(token), now)
    : null;
  if (!appointment || appointment.status === "cancelled") {
    return new Response("Bulunamadı", { status: 404 });
  }
  const settings = await getSiteSettings();
  return new Response(buildIcs(appointmentEvent(appointment, settings, token), now), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="randevu-${appointment.code}.ics"`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
