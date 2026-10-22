import type { FAQ_CATEGORIES } from "@/config/faq";

/**
 * Seed questions (17-icerik §6: S2 → 10–15). General guidance in the studio's voice: no
 * medical claims, no promises ("garanti"), no prices (K-05). The online booking answer is
 * rewritten when D-05 ships. The last entry is hidden on purpose (edge case in the panel).
 */
type SeedFaq = {
  category: (typeof FAQ_CATEGORIES)[number];
  question: string;
  answer: string;
  isVisible?: boolean;
};

export const seedFaqs: SeedFaq[] = [
  {
    category: "randevu",
    question: "Randevumu nasıl alırım?",
    answer:
      "[Online randevu](/randevu) sayfasından hizmeti seçip boş gün ve saati görebilirsiniz; talebinizi onayladığımızda WhatsApp'tan haber veririz. Galeride beğendiğiniz bir işin sayfasındaki \"Bu tasarımı istiyorum\" düğmesi randevuyu o tasarımla açar. Dilerseniz WhatsApp'tan yazabilir ya da arayabilirsiniz.",
  },
  {
    category: "randevu",
    question: "Randevumu nasıl ertelerim ya da iptal ederim?",
    answer:
      "Randevunuza 24 saatten fazla varsa WhatsApp'tan haber vermeniz yeterli. Daha kısa sürede değişiklik için lütfen arayın. Ayrıntılar: [Randevu ve İptal Koşulları](/randevu-kosullari).",
  },
  {
    category: "randevu",
    question: "Fiyat bilgisini nasıl alabilirim?",
    answer:
      "Fiyat; tasarıma, tırnak uzunluğuna ve tekniğe göre değiştiği için sitede paylaşmıyoruz. Beğendiğiniz tasarımın fotoğrafını WhatsApp'tan gönderin, net fiyatı yazalım.",
  },
  {
    category: "uygulama",
    question: "Kalıcı oje, jel ve protez tırnak arasındaki fark nedir?",
    answer:
      "**Kalıcı oje** kendi tırnağınızın üzerine sürülen, UV/LED lambada kuruyan dayanıklı bir ojedir. **Jel güçlendirme** kendi tırnağınızı destekleyen ince bir katmandır. **Protez tırnak** ise tırnağı uzatmak ya da şekil vermek için kullanılır. Hangisinin size uygun olduğunu uygulamadan önce birlikte konuşuruz.",
  },
  {
    category: "uygulama",
    question: "Instagram'da gördüğüm bir tasarımı yaptırabilir miyim?",
    answer:
      "Evet. Fotoğrafı WhatsApp'tan gönderin; tasarımı tırnağınızın şekline ve uzunluğuna göre uyarlarız.",
  },
  {
    category: "uygulama",
    question: "Bir uygulama ne kadar sürer?",
    answer:
      "Kalıcı oje yaklaşık 1 saat, el boyaması nail art 1,5–2 saat, protez tırnak yaklaşık 2 saat sürer. Tasarımın ayrıntısına göre süre değişebilir.",
  },
  {
    category: "bakim",
    question: "Kalıcı oje ne kadar dayanır?",
    answer:
      "Genellikle 2–3 hafta. Tırnağınızın uzama hızı ve günlük işleriniz (bulaşık, temizlik gibi) dayanımı etkiler.",
  },
  {
    category: "bakim",
    question: "Dolgu ne zaman yapılmalı?",
    answer:
      "Jel ve protez tırnakta tırnak uzadıkça dipte boşluk oluşur; dolgu çoğunlukla 3–4 haftada bir yapılır.",
  },
  {
    category: "bakim",
    question: "Uygulamadan sonra nelere dikkat etmeliyim?",
    answer:
      "Temizlik malzemeleriyle çalışırken eldiven kullanın, tırnak etlerini her gün tırnak yağıyla nemlendirin ve kalkan ojeyi koparmaya çalışmayın; bize yazın.",
  },
  {
    category: "hijyen",
    question: "Aletleri nasıl temizliyorsunuz?",
    answer:
      "Metal aletler her müşteriden sonra temizlenip sterilize edilir. Törpü ve tampon gibi malzemeler kişiye özeldir; masa her randevudan önce yeniden hazırlanır.",
  },
  {
    category: "hijyen",
    question: "Alerjim ya da hassasiyetim varsa ne yapmalıyım?",
    answer:
      "Sağlık bilgilerinizi formlara yazmayın; uygulamadan önce yüz yüze konuşuruz. Gerekirse farklı bir ürün ya da uygulama öneririz; şüphe durumunda doktorunuza danışmanızı rica ederiz.",
  },
  {
    category: "hijyen",
    question: "Tırnaklarım zayıf ve kolay kırılıyor, ne önerirsiniz?",
    answer:
      "Önce tırnağınızın durumuna birlikte bakarız. Çoğu zaman kısa form ve jel güçlendirme iyi bir başlangıçtır; bazen iki uygulama arasında tırnağı dinlendirmek daha doğru olur.",
  },
  {
    category: "randevu",
    question: "Hediye çeki var mı?",
    answer: "Şu an hediye çeki sunmuyoruz; yakında burada duyuracağız.",
    isVisible: false,
  },
];
