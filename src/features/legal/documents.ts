/** Published legal pages (plan §6, SCR-013…016). The file lives in content/yasal/. */
export const legalDocuments = {
  kvkk: {
    file: "kvkk-aydinlatma.md",
    path: "/kvkk",
    description:
      "Nail Art Studios'un randevu, iletişim ve çalışma fotoğrafları için kişisel verileri hangi amaçla işlediği ve haklarınız.",
  },
  gizlilik: {
    file: "gizlilik-politikasi.md",
    path: "/gizlilik",
    description:
      "Randevu ve iletişim bilgilerinizi nasıl koruduğumuzu, hangi sağlayıcılarla çalıştığımızı sade bir dille anlatır.",
  },
  cerez: {
    file: "cerez-politikasi.md",
    path: "/cerez-politikasi",
    description:
      "Nail Art Studios sitesi ziyaretçiler için çerez kullanmaz; yalnızca yönetim paneli oturum çerezi bu sayfada açıklanır.",
  },
  randevu: {
    file: "randevu-kosullari.md",
    path: "/randevu-kosullari",
    description:
      "Online randevunun nasıl onaylandığı, 24 saat öncesine kadar erteleme ve iptal, geç kalma ve fiyat bilgisi koşulları.",
  },
} as const;

export type LegalDocumentKey = keyof typeof legalDocuments;
