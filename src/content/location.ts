/**
 * Getting there (REQ-017, V-18). Sample text for the fictional Moda address (VR-03); replaced
 * with the real route when the studio's address is known. Durations are on foot.
 */
export type TransitStep = { mode: string; text: string };

export const transitSteps: TransitStep[] = [
  { mode: "Vapur", text: "Kadıköy İskelesi'nden Moda Caddesi boyunca yaklaşık 12 dakika." },
  { mode: "Metro (M4)", text: "Kadıköy durağından çıkıp Moda yönüne yaklaşık 12 dakika." },
  { mode: "Marmaray", text: "Söğütlüçeşme'den Bahariye Caddesi üzerinden yaklaşık 20 dakika." },
  { mode: "Otobüs ve dolmuş", text: "Moda Caddesi duraklarında inip birkaç dakika yürüyüş." },
  {
    mode: "Araçla",
    text: "Moda'da sokak parkı sınırlı; Kadıköy'deki kapalı otoparkları öneririz.",
  },
];

export const entranceNote =
  "Bina girişindeki zilde stüdyonun adı yazar; stüdyo zemin kattadır, basamak yoktur.";
