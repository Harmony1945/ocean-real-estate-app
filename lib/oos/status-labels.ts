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
