import { hasPermission } from "@/config/permissions";
import { istanbulDate } from "@/features/booking";
import { consentsCsv, listConsentRecordsForExport } from "@/features/consents";
import { getSession } from "@/server/auth";

/**
 * SCR-111 CSV download (REQ-019). A route handler because it returns a file (05-sunucu §6);
 * the panel layout does not run here, so the session and permission are checked again.
 */
export async function GET(): Promise<Response> {
  const session = await getSession();
  const role = (session?.user as { role?: string | null } | undefined)?.role;
  if (!session || !hasPermission(role, "audit.view")) {
    return new Response("Bulunamadı", { status: 404 });
  }

  const csv = consentsCsv(await listConsentRecordsForExport());
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="onay-kayitlari-${istanbulDate(new Date())}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
