/**
 * Demo reviews (plan §15: 8 samples, 1 hidden). All fictional, all `is_sample`: the site labels
 * them "örnek yorum" and never emits Review / AggregateRating data (VR-09, RSK-03). Names are
 * first name + initial; no real person is quoted.
 */
export type SeedTestimonial = {
  displayName: string;
  body: string;
  serviceSlug?: string;
  isVisible?: boolean;
};

export const seedTestimonials: SeedTestimonial[] = [
  {
    displayName: "Ayşe K.",
    body: "Instagram'da gördüğüm lila tasarımı ekran görüntüsüyle gönderdim, renkleri tenime göre birlikte uyarladık. Üç hafta oldu, tek bir kalkma yok.",
    serviceSlug: "el-boyamasi-nail-art",
  },
  {
    displayName: "Deniz T.",
    body: "Randevuyu siteden aldım, aynı gün WhatsApp'tan onay geldi. Kalıcı oje öncesi tırnaklarımı nasıl koruyacağımı da anlattılar.",
    serviceSlug: "kalici-oje",
  },
  {
    displayName: "Selin Ö.",
    body: "Kendi tırnaklarım çok ince ve kırılgandı. Jel güçlendirmeden sonra ilk kez uzatabildim; dolgu zamanı gelince hatırlatma da geldi.",
    serviceSlug: "jel-guclendirme",
  },
  {
    displayName: "Merve A.",
    body: "Aletlerin paketinden açıldığını görmek içimi rahatlattı. Stüdyo çok temiz, sohbet de çok keyifliydi.",
    serviceSlug: "spa-manikur",
  },
  {
    displayName: "Ece B.",
    body: "Düğünüm için ince bir french ve minik taşlar istedim. Fotoğraflarda o kadar güzel çıktı ki hâlâ soruyorlar.",
    serviceSlug: "french-kalici-oje",
  },
  {
    displayName: "Gizem Y.",
    body: "Krom efekti hep abartılı bulurdum; pastel bir krom önerdiler, tam istediğim gibi zarif oldu.",
    serviceSlug: "krom-ve-sim-efekt",
  },
  {
    displayName: "Nazlı Ç.",
    body: "Protez tırnağın doğal görünebileceğine inanmazdım. Uzunluğu ve formu birlikte seçtik, çok hafif duruyor.",
    serviceSlug: "protez-tirnak",
  },
  {
    displayName: "Burcu E.",
    body: "Pedikürden sonra ayaklarım hiç bu kadar rahat olmamıştı. Bir sonraki randevumu hemen aldım.",
    serviceSlug: "pedikur",
    isVisible: false,
  },
];
