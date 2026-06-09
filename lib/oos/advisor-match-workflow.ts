import type { AdvisorMatchRow, AdvisorPropertyRow, AdvisorRow, AdvisorSearchRequestRow } from "@/lib/supabase/client";

export const advisorMatchStatuses = [
  { value: "new", label: "Yeni Eşleşme" },
  { value: "advisor_contacted", label: "Danışmanla İletişime Geçildi" },
  { value: "presented_to_client", label: "Müşteriye Sunuldu" },
  { value: "client_interested", label: "Müşteri İlgilendi" },
  { value: "showing_scheduled", label: "Gösterim Planlandı" },
  { value: "negative", label: "Olumsuz" },
  { value: "follow_up", label: "Takipte" },
  { value: "converted_to_deal", label: "İşleme Döndü" }
] as const;

export type AdvisorMatchWorkflowStatus = (typeof advisorMatchStatuses)[number]["value"];

const statusLabelMap = new Map<string, string>(advisorMatchStatuses.map((status) => [status.value, status.label]));

export function formatAdvisorMatchStatus(status?: string | null) {
  return statusLabelMap.get(status || "new") || "Yeni Eşleşme";
}

export function normalizeTurkishPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("90")) return digits;
  if (digits.startsWith("0")) return `90${digits.slice(1)}`;
  if (digits.length === 10) return `90${digits}`;
  return digits;
}

export function buildWhatsAppHref(phone: string, message: string) {
  const normalizedPhone = normalizeTurkishPhone(phone);
  if (!normalizedPhone) return "";
  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
}

export function getAdvisorDisplayName(advisor?: AdvisorRow | null) {
  return advisor?.profile?.full_name || advisor?.title || "Ocean Danışmanı";
}

export function getAdvisorPhone(advisor?: AdvisorRow | null) {
  return advisor?.profile?.phone || "";
}

export function getMatchAdvisorIds(match: AdvisorMatchRow) {
  return {
    propertyAdvisorId: String(match.property_advisor_id || match.property?.advisor_id || ""),
    requestAdvisorId: String(match.request_advisor_id || match.search_request?.advisor_id || "")
  };
}

export function getOppositeMatchAdvisor(match: AdvisorMatchRow, advisors: AdvisorRow[], currentProfileId?: string | null) {
  const { propertyAdvisorId, requestAdvisorId } = getMatchAdvisorIds(match);
  const currentAdvisor = advisors.find((advisor) => advisor.profile_id === currentProfileId);
  const currentAdvisorId = currentAdvisor?.id || "";
  const targetAdvisorId =
    currentAdvisorId && currentAdvisorId === propertyAdvisorId
      ? requestAdvisorId
      : currentAdvisorId && currentAdvisorId === requestAdvisorId
        ? propertyAdvisorId
        : requestAdvisorId || propertyAdvisorId;

  return advisors.find((advisor) => advisor.id === targetAdvisorId) || null;
}

export function getAdvisorById(advisors: AdvisorRow[], advisorId?: string | null) {
  if (!advisorId) return null;
  return advisors.find((advisor) => advisor.id === advisorId) || null;
}

export function formatMatchBudget(searchRequest?: AdvisorSearchRequestRow | null) {
  const min = Number(searchRequest?.min_price || 0);
  const max = Number(searchRequest?.max_price || 0);
  const currency = searchRequest?.currency || "TRY";
  if (min && max) return `${formatCompactAmount(min, currency)} - ${formatCompactAmount(max, currency)}`;
  if (max) return `${formatCompactAmount(max, currency)} üst limit`;
  if (min) return `${formatCompactAmount(min, currency)} ve üzeri`;
  return "Bütçe belirtilmedi";
}

export function formatMatchLocation(searchRequest?: AdvisorSearchRequestRow | null, property?: AdvisorPropertyRow | null) {
  const requestDistricts = normalizeListValue(searchRequest?.districts);
  return [
    searchRequest?.city,
    requestDistricts || searchRequest?.location,
    property?.district || property?.neighborhood
  ].filter(Boolean).join(" / ") || "Lokasyon belirtilmedi";
}

export function getSearchRequestSummary(searchRequest?: AdvisorSearchRequestRow | null) {
  return [
    searchRequest?.title || searchRequest?.request_type || searchRequest?.purpose || "Arayış",
    formatMatchLocation(searchRequest),
    normalizeListValue(searchRequest?.property_types) || searchRequest?.property_type,
    formatMatchBudget(searchRequest)
  ].filter(Boolean).join(" · ");
}

export function buildAdvisorMatchWhatsAppMessage({
  targetAdvisorName,
  searchSummary,
  propertyTitle,
  budget,
  location,
  score,
  propertyUrl
}: {
  targetAdvisorName: string;
  searchSummary: string;
  propertyTitle: string;
  budget: string;
  location: string;
  score?: number | null;
  propertyUrl?: string;
}) {
  return [
    `Merhaba ${targetAdvisorName}, OceanOS'ta senin portföyün ile benim arayışım eşleşti.`,
    "",
    `Arayış: ${searchSummary}`,
    `Portföy: ${propertyTitle}`,
    `Bütçe: ${budget}`,
    `Lokasyon: ${location}`,
    typeof score === "number" && score > 0 ? `Eşleşme skoru: %${score}` : "",
    propertyUrl ? `Portföy linki: ${propertyUrl}` : "",
    "",
    "Uygunsa bu portföyü müşterime sunmak ve detayları seninle netleştirmek istiyorum."
  ].filter((line) => line !== "").join("\n");
}

export function formatCompactAmount(value: number, currency: string) {
  const safeCurrency = currency === "TRY" ? "TL" : currency;
  return `${new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(value || 0)} ${safeCurrency}`;
}

export function normalizeListValue(value?: string[] | string | null) {
  if (Array.isArray(value)) return value.filter(Boolean).join(", ");
  return value || "";
}
