import { formatDateTime } from "@/lib/format";

/**
 * Message templates. Plain text first; add React Email for HTML when the plan asks for it.
 * Each template declares the data it needs, so callers are type-checked.
 */
const templates = {
  leadReceivedBusiness: {
    subject: (d: { code: string; kind: string }) => `Yeni talep: ${d.code}`,
    text: (d: { code: string; kind: string }) =>
      `Siteden yeni bir talep geldi (${d.kind}). Ayrıntılar için panelde ${d.code} numaralı talebi açın.`,
  },
  leadReceivedVisitor: {
    subject: (d: { code: string; companyName: string }) => `Talebiniz alındı (${d.code})`,
    text: (d: { code: string; companyName: string }) =>
      `Merhaba,\n\n${d.companyName} olarak talebinizi aldık. Talep numaranız: ${d.code}. En kısa sürede size dönüş yapacağız.`,
  },
  appointmentReminder: {
    subject: (d: { startsAt: string; companyName: string }) =>
      `Randevu hatırlatması: ${formatDateTime(d.startsAt)}`,
    text: (d: { startsAt: string; companyName: string; manageUrl: string }) =>
      `${d.companyName} randevunuz ${formatDateTime(d.startsAt)} tarihinde. Değişiklik için: ${d.manageUrl}`,
  },
} satisfies Record<string, { subject: (data: never) => string; text: (data: never) => string }>;

export type TemplateName = keyof typeof templates;
export type TemplateData<N extends TemplateName> = Parameters<(typeof templates)[N]["text"]>[0] &
  Parameters<(typeof templates)[N]["subject"]>[0];

export function renderTemplate<N extends TemplateName>(
  name: N,
  data: TemplateData<N>,
): { subject: string; text: string } {
  const template = templates[name] as unknown as {
    subject: (d: TemplateData<N>) => string;
    text: (d: TemplateData<N>) => string;
  };
  return { subject: template.subject(data), text: template.text(data) };
}
