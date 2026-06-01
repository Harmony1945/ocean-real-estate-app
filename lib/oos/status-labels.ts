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
    return "border border-red-200 bg-red-50 text-red-700 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-200";
  }

  if (label === "Yüksek") {
    return "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200";
  }

  if (label === "Orta") {
    return "border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200";
  }

  if (label === "Normal") {
    return "border border-slate-200 bg-slate-50 text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300";
  }

  return "border border-slate-200 bg-slate-100 text-slate-500 dark:border-white/10 dark:bg-[#111111] dark:text-slate-400";
}
