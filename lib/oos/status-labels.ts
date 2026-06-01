const statusLabels: Record<string, string> = {
  active: "Aktif",
  inactive: "Pasif",
  closed: "Kapalı",
  new: "Yeni",
  pending: "Beklemede",
  accepted: "Kabul Edildi",
  rejected: "Reddedildi",
  viewed: "Görüldü",
  contacted: "İletişime Geçildi",
  "deal-started": "İşlem Başladı",
  paid: "Ödendi",
  unpaid: "Ödenmedi",
  overdue: "Gecikmiş",
  draft: "Taslak",
  completed: "Tamamlandı",
  done: "Tamamlandı",
  open: "Açık"
};

function normalizeStatus(status?: string | null) {
  return String(status || "").trim().toLocaleLowerCase("tr-TR");
}

export function formatStatusLabel(status?: string | null) {
  const value = String(status || "").trim();
  if (!value) return "";

  return statusLabels[normalizeStatus(value)] || value;
}

export function isActiveStatus(status?: string | null) {
  return normalizeStatus(status) === "active" || normalizeStatus(status) === "aktif";
}

export function getStatusPillClass(status?: string | null) {
  if (isActiveStatus(status)) {
    return "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200";
  }

  return "border border-slate-200 bg-slate-100 text-slate-600 dark:border-white/10 dark:bg-[#111111] dark:text-slate-300";
}

const urgencyLabels: Record<string, string> = {
  urgent: "Acil",
  acil: "Acil",
  high: "Yüksek",
  yuksek: "Yüksek",
  yüksek: "Yüksek",
  sicak: "Yüksek",
  sıcak: "Yüksek",
  medium: "Orta",
  orta: "Orta",
  normal: "Normal",
  low: "Düşük",
  dusuk: "Düşük",
  düşük: "Düşük"
};

function normalizeUrgency(urgency?: string | null) {
  return String(urgency || "")
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i");
}

export function formatUrgencyLabel(urgency?: string | null) {
  const normalized = normalizeUrgency(urgency);
  if (!normalized) return "Belirtilmedi";

  return urgencyLabels[normalized] || "Belirtilmedi";
}

export function getUrgencyPillClass(urgency?: string | null) {
  const label = formatUrgencyLabel(urgency);

  if (label === "Acil") {
    return "border border-red-300 bg-red-100 text-red-800 shadow-sm shadow-red-950/5 dark:border-red-400/30 dark:bg-red-400/15 dark:text-red-100";
  }

  if (label === "Yüksek") {
    return "border border-emerald-300 bg-emerald-100 text-emerald-800 shadow-sm shadow-emerald-950/5 dark:border-emerald-400/30 dark:bg-emerald-400/15 dark:text-emerald-100";
  }

  if (label === "Orta") {
    return "border border-amber-300 bg-amber-100 text-amber-800 shadow-sm shadow-amber-950/5 dark:border-amber-400/30 dark:bg-amber-400/15 dark:text-amber-100";
  }

  if (label === "Normal") {
    return "border border-sky-200 bg-sky-50 text-sky-700 shadow-sm shadow-sky-950/5 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-200";
  }

  return "border border-slate-200 bg-slate-100 text-slate-600 shadow-sm dark:border-white/10 dark:bg-[#111111] dark:text-slate-300";
}
