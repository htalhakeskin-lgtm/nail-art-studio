import type { SERVICE_CATEGORIES } from "@/config/services";
import type { ServiceFaq } from "@/server/db/schema/services";

import type { DemoImageKey } from "./demo-images";

/**
 * Demo service menu (plan §19: 16 services; VR-07). Durations and texts are samples; prices are
 * stored but hidden while P-08 = "contact" (K-05). Edge cases: one service that cannot be
 * booked online, one long name, services without a refill interval.
 */
export type SeedService = {
  slug: string;
  name: string;
  category: (typeof SERVICE_CATEGORIES)[number];
  summary: string;
  suitableFor: string;
  body: string;
  aftercare: string;
  durabilityText: string | null;
  durationMinutes: number;
  refillIntervalDays: number | null;
  priceMinor: number;
  faqs: ServiceFaq[];
  image: DemoImageKey;
  isBookable?: boolean;
};

const removalNote =
  "Önceki uygulamanız başka bir yerde yapıldıysa çıkarma işlemi için randevu notuna yazın; süreye eklenir.";

export const seedServices: SeedService[] = [
  // ── Kalıcı oje ─────────────────────────────────────────────────────────────────────────────
  {
    slug: "kalici-oje",
    name: "Kalıcı oje",
    category: "kalici-oje",
    summary: "Kendi tırnağınıza tek renk kalıcı oje; parlak, düzgün ve 2–3 hafta dayanıklı.",
    suitableFor:
      "Doğal uzunluğunu korumak isteyen, her gün oje tazelemekle uğraşmak istemeyenler için.",
    body:
      "Tırnak yüzeyi hazırlanır, şekil verilir ve kütikül bakımı yapılır. Ardından baz, iki kat renk ve üst kat uygulanıp her katman lambada kurutulur.\n\n" +
      removalNote,
    aftercare:
      "- İlk gün sıcak su ve buhardan kaçının.\n- Temizlik yaparken eldiven kullanın.\n- Kütikül yağını günde bir kez sürün.",
    durabilityText: "Ortalama 2–3 hafta",
    durationMinutes: 60,
    refillIntervalDays: 21,
    priceMinor: 65000,
    faqs: [
      {
        question: "Kalıcı oje tırnağıma zarar verir mi?",
        answer:
          "Doğru hazırlık ve doğru çıkarma ile tırnak zarar görmez. Çıkarırken asla kazımayız; ürünü eriterek alırız.",
      },
    ],
    image: "galleryPinkPlain",
  },
  {
    slug: "french-kalici-oje",
    name: "French kalıcı oje",
    category: "kalici-oje",
    summary: "Klasik beyaz uçlu ya da renkli uçlu french, kalıcı oje ile.",
    suitableFor: "Sade ama özenli bir görünüm isteyenler; düğün, mezuniyet gibi özel günler.",
    body: "Hazırlıktan sonra nude ya da pembe baz sürülür, uç çizgisi ince fırçayla elde çizilir. Uç rengini ve kalınlığını birlikte seçeriz.",
    aftercare: "- Uçları kapı, kutu açmak için kullanmayın.\n- Kütikül yağını düzenli sürün.",
    durabilityText: "Ortalama 2–3 hafta",
    durationMinutes: 75,
    refillIntervalDays: 21,
    priceMinor: 80000,
    faqs: [],
    image: "galleryClassicFrench",
  },
  {
    slug: "ayak-kalici-oje",
    name: "Ayak kalıcı oje",
    category: "kalici-oje",
    summary: "Ayak tırnaklarına kalıcı oje; yaz boyunca bakımlı ayaklar.",
    suitableFor: "Sandalet sezonunda ojesiyle uğraşmak istemeyenler için.",
    body: "Ayak tırnakları kısaltılır, şekillendirilir ve kalıcı oje uygulanır. Pedikürle birlikte almak isterseniz pedikür hizmetini seçin.",
    aftercare:
      "- İlk gün havuz ve denizden kaçının.\n- Dar ayakkabı ilk saatlerde ojeyi bozabilir.",
    durabilityText: "Ortalama 4–5 hafta",
    durationMinutes: 45,
    refillIntervalDays: 35,
    priceMinor: 55000,
    faqs: [],
    image: "galleryTangerine",
  },
  // ── Jel ──────────────────────────────────────────────────────────────────────────────────
  {
    slug: "jel-guclendirme",
    name: "Jel güçlendirme",
    category: "jel",
    summary: "Kendi tırnağınızın üzerine ince bir jel katı; kırılan, incelen tırnaklar için.",
    suitableFor: "Tırnağı kolay kırılan, uzatmak isteyip uzatamayanlar.",
    body: "Tırnak hazırlandıktan sonra ince bir jel tabakası ile güçlendirilir, ardından renk ya da şeffaf üst kat uygulanır.",
    aftercare: "- 3–4 haftada bir dolgu yaptırın.\n- Jeli kendiniz koparmayın.",
    durabilityText: "Dolgu ile 3–4 hafta",
    durationMinutes: 90,
    refillIntervalDays: 25,
    priceMinor: 90000,
    faqs: [
      {
        question: "Jel ile kalıcı oje arasındaki fark nedir?",
        answer:
          "Kalıcı oje renk katıdır; jel ise tırnağa yapı ve dayanıklılık kazandırır. Tırnağınız zayıfsa jel öneririz.",
      },
    ],
    image: "galleryPearl",
  },
  {
    slug: "jel-dolgu",
    name: "Jel dolgu",
    category: "jel",
    summary: "Uzayan jelin tırnak dibine yakın boşluğunun doldurulması ve yenilenmesi.",
    suitableFor: "Daha önce jel güçlendirme ya da jel uzatma yaptırmış olanlar.",
    body: "Uzayan kısım dengelenir, boşluk jel ile doldurulur ve renk yenilenir.",
    aftercare: "- Bir sonraki dolguyu 3–4 hafta içinde planlayın.",
    durabilityText: "3–4 hafta",
    durationMinutes: 75,
    refillIntervalDays: 25,
    priceMinor: 75000,
    faqs: [],
    image: "galleryNudeGlitter",
  },
  // ── Protez ───────────────────────────────────────────────────────────────────────────────
  {
    slug: "protez-tirnak",
    name: "Protez tırnak",
    category: "protez",
    summary: "Kalıp ya da tips ile istediğiniz uzunluk ve formda tırnak; badem, kare, stiletto.",
    suitableFor: "Uzun tırnak isteyen ya da kendi tırnağı kısa olanlar.",
    body: "Form ve uzunluğu birlikte seçeriz. Tırnak kalıp ya da tips ile uzatılır, jel ile şekillendirilir, ardından renk ya da tasarım uygulanır.",
    aftercare:
      "- 3–4 haftada bir dolgu yaptırın.\n- Kalkma fark ederseniz yapıştırmayın, WhatsApp'tan yazın.",
    durabilityText: "Dolgu ile 3–4 hafta",
    durationMinutes: 150,
    refillIntervalDays: 25,
    priceMinor: 140000,
    faqs: [
      {
        question: "Protez tırnak doğal tırnağıma zarar verir mi?",
        answer:
          "Doğru uygulama ve düzenli dolgu ile zarar vermez. Çıkarmayı mutlaka stüdyoda yaptırmanızı öneririz.",
      },
    ],
    image: "galleryTurquoiseAlmond",
  },
  {
    slug: "protez-tirnak-dolgu",
    name: "Protez tırnak dolgusu",
    category: "protez",
    summary: "Protez tırnağın uzayan kısmının dolgusu, formun düzeltilmesi ve renk yenileme.",
    suitableFor: "Protez tırnağı 3–4 hafta önce yapılmış olanlar.",
    body: "Uzayan kısım dengelenir, form yeniden verilir ve renk yenilenir. Kırık tırnak varsa onarılır.",
    aftercare: "- Bir sonraki dolguyu 3–4 hafta içinde planlayın.",
    durabilityText: "3–4 hafta",
    durationMinutes: 105,
    refillIntervalDays: 25,
    priceMinor: 100000,
    faqs: [],
    image: "galleryBabyBoomer",
  },
  // ── Nail art ─────────────────────────────────────────────────────────────────────────────
  {
    slug: "el-boyamasi-nail-art",
    name: "El boyaması nail art",
    category: "nail-art",
    summary: "Çiçek, çizgi, desen ya da tamamen size özel bir tasarım; fırçayla elde çizilir.",
    suitableFor: "Tırnağında küçük bir sanat eseri taşımak isteyen herkes.",
    body: "Tasarımı randevu başında birlikte seçeriz: Instagram'da beğendiğiniz bir iş, bir renk ya da kıyafetiniz. Kalıcı oje ya da jel üzerine elde çizilir.",
    aftercare: "- Üst kat çizilmesin diye sert yüzeylere sürtmeyin.",
    durabilityText: "Zemine göre 2–4 hafta",
    durationMinutes: 120,
    refillIntervalDays: null,
    priceMinor: 120000,
    faqs: [
      {
        question: "Kendi tasarımımı getirebilir miyim?",
        answer:
          "Elbette. Fotoğrafını WhatsApp'tan önceden gönderirseniz süreyi ve uygulanabilirliğini birlikte konuşuruz.",
      },
    ],
    image: "galleryLineArt",
  },
  {
    slug: "krom-ve-sim-efekt",
    name: "Krom ve sim efekt",
    category: "nail-art",
    summary: "Ayna parlaklığında krom, inci ya da sim tozları; tek tırnakta ya da tümünde.",
    suitableFor: "Işıltılı ama sade bir görünüm isteyenler.",
    body: "Renk katının üzerine krom ya da sim tozu işlenir ve üst katla sabitlenir.",
    aftercare: "- İlk gün sıcak sudan kaçının.",
    durabilityText: "Ortalama 2–3 hafta",
    durationMinutes: 75,
    refillIntervalDays: null,
    priceMinor: 85000,
    faqs: [],
    image: "galleryGoldGlitter",
  },
  {
    slug: "tas-ve-aksesuar",
    name: "Taş ve aksesuar uygulaması",
    category: "nail-art",
    summary: "Küçük taşlar, metal takılar ve 3D süslemeler.",
    suitableFor: "Özel günler ve göz alıcı tasarımlar için.",
    body: "Süslemeler jel ile sabitlenir; günlük kullanımda takılmaması için yerleri birlikte seçeriz.",
    aftercare: "- Örgü, dar cep gibi takılabilecek yüzeylerde dikkatli olun.",
    durabilityText: "Ortalama 2 hafta",
    durationMinutes: 45,
    refillIntervalDays: null,
    priceMinor: 40000,
    faqs: [],
    image: "galleryCharms",
  },
  {
    slug: "ozel-tasarim-danismanligi",
    name: "Özel tasarım danışmanlığı",
    category: "nail-art",
    summary:
      "Gelin tırnağı, çekim ya da etkinlik için tasarımı önceden birlikte planladığımız görüşme.",
    suitableFor: "Özel bir gün için tasarımı önceden netleştirmek isteyenler.",
    body: "Tarih, kıyafet ve istediğiniz havayı konuşuruz; gerekirse deneme yaparız. Bu görüşme online randevuyla değil, WhatsApp üzerinden planlanır.",
    aftercare: "",
    durabilityText: null,
    durationMinutes: 30,
    refillIntervalDays: null,
    priceMinor: 0,
    faqs: [],
    image: "galleryGoldFrench",
    isBookable: false,
  },
  // ── Manikür / pedikür ────────────────────────────────────────────────────────────────────
  {
    slug: "klasik-manikur",
    name: "Klasik manikür",
    category: "manikur-pedikur",
    summary: "Şekillendirme, kütikül bakımı ve dilerseniz normal oje.",
    suitableFor: "Bakımlı, temiz eller için düzenli bakım isteyenler.",
    body: "Tırnaklar kısaltılır ve şekillendirilir, kütiküller yumuşatılıp temizlenir, eller nemlendirilir.",
    aftercare: "- Kütikül yağını düzenli kullanın.",
    durabilityText: null,
    durationMinutes: 45,
    refillIntervalDays: 14,
    priceMinor: 45000,
    faqs: [],
    image: "galleryLilacPink",
  },
  {
    slug: "spa-manikur",
    name: "Spa manikür",
    category: "manikur-pedikur",
    summary: "Klasik maniküre peeling, maske ve el masajı eklenmiş uzun bakım.",
    suitableFor: "Kendine bir saat ayırmak isteyenler.",
    body: "Manikürün ardından el peelingi, nem maskesi ve kısa bir masaj uygulanır.",
    aftercare: "- Gün içinde el kremini sık kullanın.",
    durabilityText: null,
    durationMinutes: 60,
    refillIntervalDays: null,
    priceMinor: 60000,
    faqs: [],
    image: "galleryPinkFade",
  },
  {
    slug: "pedikur",
    name: "Pedikür",
    category: "manikur-pedikur",
    summary: "Ayak tırnaklarının bakımı, topuk ve sertleşmelerin yumuşatılması.",
    suitableFor: "Düzenli ayak bakımı isteyen herkes.",
    body: "Ayaklar ılık suda yumuşatılır, tırnaklar şekillendirilir, sertleşmeler törpülenir ve nemlendirilir. Tüm aletler her müşteriden sonra sterilize edilir.",
    aftercare: "- Ayak kremini akşamları kullanın.",
    durabilityText: null,
    durationMinutes: 60,
    refillIntervalDays: 30,
    priceMinor: 70000,
    faqs: [
      {
        question: "Batık tırnak için gelebilir miyim?",
        answer:
          "Ağrılı ya da iltihaplı batık tırnakta önce bir sağlık uzmanına görünmenizi öneririz; bu bir tıbbi işlemdir.",
      },
    ],
    image: "galleryMixed",
  },
  {
    slug: "manikur-ve-pedikur-bir-arada-kalici-oje-ile-uzun-bakim",
    name: "Manikür ve pedikür bir arada, el ve ayakta kalıcı oje ile uzun bakım",
    category: "manikur-pedikur",
    summary: "El ve ayak bakımı ile kalıcı oje tek randevuda.",
    suitableFor: "Tatil öncesi ya da özel bir gün için her şeyi tek seferde halletmek isteyenler.",
    body: "Önce manikür ve el kalıcı ojesi, ardından pedikür ve ayak kalıcı ojesi uygulanır.",
    aftercare: "- İlk gün sıcak su ve buhardan kaçının.",
    durabilityText: "El 2–3, ayak 4–5 hafta",
    durationMinutes: 150,
    refillIntervalDays: 21,
    priceMinor: 130000,
    faqs: [],
    image: "galleryHearts",
  },
  // ── Bakım ────────────────────────────────────────────────────────────────────────────────
  {
    slug: "kalici-oje-cikarma-ve-bakim",
    name: "Kalıcı oje çıkarma ve tırnak bakımı",
    category: "bakim",
    summary: "Kalıcı oje, jel ya da protezin kazımadan çıkarılması ve tırnağa dinlenme bakımı.",
    suitableFor: "Bir süre ara vermek ya da başka yerde yapılmış uygulamayı çıkarmak isteyenler.",
    body: "Ürün eritilerek çıkarılır, tırnak yüzeyi düzeltilir ve besleyici bakım uygulanır.",
    aftercare: "- Ara verdiğiniz dönemde tırnak güçlendirici kullanabilirsiniz.",
    durabilityText: null,
    durationMinutes: 30,
    refillIntervalDays: null,
    priceMinor: 30000,
    faqs: [],
    image: "galleryBabyBoomer",
  },
];
