/**
 * Default copy for content_blocks (seed values and the fallback when a row is missing).
 * Demo text (17-icerik §2): it describes an approach, not facts about the real operator —
 * no years of experience, awards or certificates — and the page marks it as "örnek metin"
 * until Bahadır Karasu's own words replace it (Q-02, RSK-03).
 */
export const contentBlockDefaults = {
  about: {
    eyebrow: "Nail artist · Kadıköy",
    intro:
      "Nail Art Studios'ta tırnağı küçük bir tuval gibi görüyoruz. Her randevu kısa bir tasarım konuşmasıyla başlar: Instagram'da beğendiğiniz bir iş, bir renk ya da o hafta giyeceğiniz bir kıyafet… Hepsini birlikte ele alır, tırnağınıza en uygun tekniği seçeriz.",
    sections: [
      {
        title: "Tasarımı birlikte seçeriz",
        body: "Hazır bir kalıptan değil, sizin tarzınızdan yola çıkarız. Kalıcı oje, jel ya da protez: hangisinin tırnağınıza ve günlük temponuza uyduğunu uygulamadan önce konuşuruz.",
      },
      {
        title: "Önce tırnak sağlığı",
        body: "Kendi tırnağınızı korumak, tasarım kadar önemli. Gereğinden fazla törpülemeyiz; gerekirse iki uygulama arasında dinlenme öneririz. Alerji ya da hassasiyetinizi uygulamadan önce yüz yüze konuşuruz.",
      },
      {
        title: "Temiz ve düzenli çalışma",
        body: "Metal aletler her müşteriden sonra sterilize edilir; törpü ve tampon gibi malzemeler kişiye özeldir. Masa, her randevudan önce yeniden hazırlanır.",
      },
    ],
    closing:
      "Son işlere Instagram'dan göz atabilir, aklınızdaki tasarımın fotoğrafını WhatsApp'tan gönderebilirsiniz.",
  },
} as const;
