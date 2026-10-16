/**
 * Business rule codes (plan §9) → user-facing Turkish message. The code is also the error
 * code returned by actions and the prefix of the rule's test names (18-dokumantasyon §3).
 * Messages say what happened and what to do next (05-sunucu-ve-api §4).
 * Rules without a user-facing failure (calculations, defaults) have no entry.
 */
export const ruleMessages = {
  "BR-RND-001": "Seçtiğiniz saat çalışma saatlerimizin dışında. Lütfen listeden bir saat seçin.",
  "BR-RND-002": "Stüdyo bu saatte kapalı. Lütfen başka bir gün ya da saat seçin.",
  "BR-RND-003": "Bu saat az önce doldu. Size en yakın boş saatleri gösterdik.",
  "BR-RND-005": "Bu tarih randevu alınabilen aralığın dışında. Lütfen daha yakın bir gün seçin.",
  "BR-RND-006":
    "Bu telefon numarasıyla bekleyen randevularınız var. Değişiklik için WhatsApp'tan yazabilirsiniz.",
  "BR-RND-007":
    "Randevunuza 24 saatten az kaldı. Değişiklik için lütfen WhatsApp'tan ya da telefonla ulaşın.",
  "BR-RND-008": "Randevunun durumu bu değişikliğe izin vermiyor. Sayfayı yenileyip tekrar deneyin.",
  "BR-RND-009": "Bu bağlantının süresi dolmuş ya da bağlantı geçersiz.",
  "BR-RND-014": "Bu hizmet için online randevu alınamıyor. WhatsApp'tan bize yazabilirsiniz.",
  "BR-HZM-002": "Bu kısa ad başka bir hizmette kullanılıyor. Lütfen farklı bir kısa ad girin.",
  "BR-GLR-001": "Öncesi / sonrası için iki görsel de gerekli ve oranları aynı olmalı.",
  "BR-GLR-002": "Dosya JPEG, PNG ya da WebP olmalı ve 10 MB'ı geçmemeli.",
  "BR-GLR-003": "Gerçek müşteri işi, müşteri izni işaretlenmeden yayımlanamaz.",
  "BR-TLP-001": "Lütfen adınızı ve telefon ya da e-posta bilgilerinizden birini girin.",
} as const satisfies Record<`BR-${string}`, string>;

export type RuleCode = keyof typeof ruleMessages;
