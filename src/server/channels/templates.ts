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
  appointmentRequestedBusiness: {
    subject: (d: { code: string; serviceName: string; when: string; status: string }) =>
      `Yeni randevu: ${d.code}`,
    text: (d: { code: string; serviceName: string; when: string; status: string }) =>
      [
        "Siteden yeni bir randevu geldi.",
        `Kod: ${d.code}`,
        `Hizmet: ${d.serviceName}`,
        `Tarih: ${d.when}`,
        `Durum: ${d.status}`,
        "Ayrıntılar ve onay için panelde Randevular bölümünü açın.",
      ].join("\n"),
  },
  appointmentReceivedVisitor: {
    subject: (d: { code: string; companyName: string }) => `Randevu talebiniz alındı (${d.code})`,
    text: (d: {
      code: string;
      companyName: string;
      serviceName: string;
      when: string;
      confirmed: boolean;
      manageUrl: string;
    }) =>
      [
        "Merhaba,",
        "",
        d.confirmed
          ? `${d.companyName} randevunuz onaylandı.`
          : `${d.companyName} randevu talebinizi aldık; onayladığımızda size haber vereceğiz.`,
        `Kod: ${d.code}`,
        `Hizmet: ${d.serviceName}`,
        `Tarih: ${d.when}`,
        "",
        `Randevunuzu görmek, ertelemek ya da iptal etmek için: ${d.manageUrl}`,
      ].join("\n"),
  },
  appointmentConfirmedVisitor: {
    subject: (d: { code: string; companyName: string }) => `Randevunuz onaylandı (${d.code})`,
    text: (d: {
      code: string;
      companyName: string;
      serviceName: string;
      when: string;
      address: string;
    }) =>
      [
        "Merhaba,",
        "",
        `${d.companyName} randevunuz onaylandı.`,
        `Kod: ${d.code}`,
        `Hizmet: ${d.serviceName}`,
        `Tarih: ${d.when}`,
        `Adres: ${d.address}`,
        "",
        "Değişiklik için randevu e-postanızdaki bağlantıyı kullanabilir ya da WhatsApp'tan yazabilirsiniz.",
      ].join("\n"),
  },
  appointmentChangedBusiness: {
    subject: (d: { code: string; change: string; when: string; serviceName: string }) =>
      `Randevu ${d.change}: ${d.code}`,
    text: (d: { code: string; change: string; when: string; serviceName: string }) =>
      [
        `Müşteri randevusunu yönetim bağlantısından değiştirdi (${d.change}).`,
        `Kod: ${d.code}`,
        `Hizmet: ${d.serviceName}`,
        `Tarih: ${d.when}`,
        "Ayrıntılar için panelde Randevular bölümünü açın.",
      ].join("\n"),
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
