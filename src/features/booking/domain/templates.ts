import { describeAppointmentTime } from "./messages";

/**
 * Panel WhatsApp templates (REQ-005c, PRJ-01, K-35): the owner taps once and WhatsApp opens on
 * the customer's number with the text ready. Transactional only: time, place, code and the
 * manage link — never a price (BR-HZM-001), never a promotion (İYS).
 */
export type TemplateKey = "confirm" | "reminder" | "change";

export const templateLabels: Record<TemplateKey, string> = {
  confirm: "Onay mesajı",
  reminder: "Hatırlatma",
  change: "Değişiklik iste",
};

type TemplateInput = {
  customerName: string;
  companyName: string;
  serviceName: string;
  code: string;
  startsAt: Date;
  address: string;
  manageUrl: string | null;
};

const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? name;

export function whatsappTemplate(key: TemplateKey, input: TemplateInput): string {
  const when = describeAppointmentTime(input.startsAt);
  const greeting = `Merhaba ${firstName(input.customerName)},`;
  const manage = input.manageUrl
    ? `Randevunuzu buradan yönetebilirsiniz: ${input.manageUrl}`
    : null;
  const lines: (string | null)[] =
    key === "confirm"
      ? [
          greeting,
          `${input.companyName} randevunuz onaylandı.`,
          `Hizmet: ${input.serviceName}`,
          `Tarih: ${when}`,
          `Adres: ${input.address}`,
          `Kod: ${input.code}`,
          manage,
        ]
      : key === "reminder"
        ? [
            greeting,
            `${input.companyName} randevunuzu hatırlatmak isteriz.`,
            `Hizmet: ${input.serviceName}`,
            `Tarih: ${when}`,
            `Adres: ${input.address}`,
            manage,
          ]
        : [
            greeting,
            `${input.serviceName} randevunuz (${when}) için saatte bir değişiklik yapmamız gerekiyor.`,
            "Size uygun başka bir gün ve saat yazabilir misiniz?",
            `Kod: ${input.code}`,
          ];
  return lines.filter((line): line is string => line !== null).join("\n");
}
