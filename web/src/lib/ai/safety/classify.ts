export type ChatSafetyRoute =
  | "ALLOWED"
  | "EMERGENCY"
  | "HIDDEN_CONTEXT"
  | "DIAGNOSIS"
  | "MEDICATION_CHANGE"
  | "LAB_INTERPRETATION"
  | "TARGET_OR_DIET";

const rules: Array<[Exclude<ChatSafetyRoute, "ALLOWED" | "EMERGENCY">, RegExp]> = [
  [
    "HIDDEN_CONTEXT",
    /\b(hidden|system\s*prompt|prompt\s*sistem|raw\s*context|konteks\s*(internal|tersembunyi)|instruksi\s*sistem|semua\s*context)\b/i,
  ],
  [
    "MEDICATION_CHANGE",
    /\b(tambah|naikkan|kurangi|turunkan|ubah|ganti|hentikan|stop|sesuaikan|adjust)\b.{0,40}\b(dosis|obat|insulin|metformin|amlodipine)|\b(dosis|obat|insulin)\b.{0,40}\b(tambah|naik|kurang|turun|ubah|ganti|henti|stop)|\b(rekomendasi|sarankan)\b.{0,24}\bobat\b/i,
  ],
  [
    "LAB_INTERPRETATION",
    /\b(hasil\s*lab|laboratorium|hba1c|gula\s*darah|glukosa)\b.{0,60}\b(arti|berarti|aman|normal|bahaya|tinggi|rendah|bagus|buruk)|\b(interpretasi|tafsirkan)\b.{0,30}\b(lab|hasil|angka)\b/i,
  ],
  [
    "TARGET_OR_DIET",
    /\b(target|sasaran)\b.{0,36}\b(gula\s*darah|glukosa|hba1c|diabetes)|\b(pantangan|diet|menu|makanan?\s*(apa|yang)|boleh\s*makan|tidak\s*boleh\s*makan|nutrisi)\b/i,
  ],
  [
    "DIAGNOSIS",
    /\b(diagnosis|diagnosa|penyakit\s*apa|terkena\s*apa|sakit\s*apa|ini\s*penyakit|pastikan\s*(penyakit|kondisi)|apakah\s*(saya|maya|raka|dia)\s*(terkena|mengidap))\b|\b(aman|normal|berbahaya)\s*(kan|tidak|nggak|kah)?\b/i,
  ],
];

const emergency =
  /\b(nyeri\s*dada|dada\s*(sakit|tertekan)|sesak(\s*napas)?|sulit\s*bernapas|pingsan|tidak\s*sadar|penurunan\s*kesadaran|wajah\s*mencong|bicara\s*pelo|lemah\s*(sebelah|satu\s*sisi)|perdarahan\s*berat|nyeri\s*hebat\s*mendadak|bingung\s*mendadak|memburuk\s*cepat)\b/i;

export function classifyChatMessage(message: string): ChatSafetyRoute {
  if (emergency.test(message)) return "EMERGENCY";
  for (const [route, pattern] of rules) {
    if (pattern.test(message)) return route;
  }
  return "ALLOWED";
}
