import type { AdvisorPropertyRow, PropertyMediaRow } from "@/lib/supabase/client";

export type AreaFilterMode = "fallback" | "net_area" | "gross_area";
export type PropertySortMode = "newest" | "price_asc" | "price_desc" | "area_asc" | "area_desc";
export type BooleanFilterMode = "" | "yes" | "no";
export type PresenceFilterMode = "" | "with" | "missing";
export type PhotoFilterMode = "" | "with" | "without";
export type TechnicalCompletenessFilter = "" | "missing";

export type PropertyFilterState = {
  query: string;
  city: string;
  district: string;
  neighborhood: string;
  listingType: string;
  propertyType: string;
  roomCount: string;
  minPrice: string;
  maxPrice: string;
  currency: string;
  minArea: string;
  maxArea: string;
  areaMode: AreaFilterMode;
  advisor: string;
  status: string;
  photos: PhotoFilterMode;
  coordinates: PresenceFilterMode;
  hasElevator: BooleanFilterMode;
  inSite: BooleanFilterMode;
  parkingType: string;
  deedStatus: string;
  exchangeAvailable: BooleanFilterMode;
  technicalCompleteness: TechnicalCompletenessFilter;
  sort: PropertySortMode;
};

export type PropertyFilterChip = {
  key: keyof PropertyFilterState;
  label: string;
};

export type PropertyFilterItem = {
  id: string;
  title?: string | null;
  city?: string | null;
  district?: string | null;
  neighborhood?: string | null;
  addressText?: string | null;
  listingType?: string | null;
  propertyType?: string | null;
  roomCount?: string | null;
  price?: number | null;
  currency?: string | null;
  grossArea?: number | null;
  netArea?: number | null;
  advisorId?: string | null;
  advisorName?: string | null;
  status?: string | null;
  hasPhotos?: boolean;
  hasCoordinates?: boolean;
  hasElevator?: boolean | null;
  inSite?: boolean | null;
  parkingType?: string | null;
  deedStatus?: string | null;
  exchangeAvailable?: boolean | null;
  createdAt?: string | null;
};

export const defaultPropertyFilters: PropertyFilterState = {
  query: "",
  city: "",
  district: "",
  neighborhood: "",
  listingType: "",
  propertyType: "",
  roomCount: "",
  minPrice: "",
  maxPrice: "",
  currency: "",
  minArea: "",
  maxArea: "",
  areaMode: "fallback",
  advisor: "",
  status: "",
  photos: "",
  coordinates: "",
  hasElevator: "",
  inSite: "",
  parkingType: "",
  deedStatus: "",
  exchangeAvailable: "",
  technicalCompleteness: "",
  sort: "newest"
};

export const propertyFilterQueryKeys: Array<keyof PropertyFilterState> = [
  "query",
  "city",
  "district",
  "neighborhood",
  "listingType",
  "propertyType",
  "roomCount",
  "minPrice",
  "maxPrice",
  "currency",
  "minArea",
  "maxArea",
  "areaMode",
  "advisor",
  "status",
  "photos",
  "coordinates",
  "hasElevator",
  "inSite",
  "parkingType",
  "deedStatus",
  "exchangeAvailable",
  "technicalCompleteness",
  "sort"
];

export function normalizeTurkishText(value?: string | number | boolean | null) {
  return String(value ?? "")
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replaceAll("ç", "c")
    .replaceAll("ğ", "g")
    .replaceAll("ı", "i")
    .replaceAll("İ", "i")
    .replaceAll("ö", "o")
    .replaceAll("ş", "s")
    .replaceAll("ü", "u")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function createPropertyFilterItem(
  row: AdvisorPropertyRow,
  media: PropertyMediaRow[] = [],
  advisorName?: string
): PropertyFilterItem {
  return {
    id: row.id,
    title: row.title,
    city: row.city,
    district: row.district,
    neighborhood: row.neighborhood,
    addressText: row.address_text,
    listingType: row.listing_type || row.usage_type,
    propertyType: row.property_type,
    roomCount: row.room_count,
    price: row.asking_price,
    currency: row.currency,
    grossArea: row.gross_area,
    netArea: row.net_area,
    advisorId: row.advisor_id,
    advisorName,
    status: row.status,
    hasPhotos: media.length > 0,
    hasCoordinates: Boolean(row.latitude && row.longitude),
    hasElevator: row.has_elevator ?? null,
    inSite: row.in_site ?? null,
    parkingType: row.parking_type,
    deedStatus: row.deed_status,
    exchangeAvailable: row.exchange_available ?? null,
    createdAt: row.created_at || row.updated_at
  };
}

export function filterPropertyRows(
  rows: AdvisorPropertyRow[],
  filters: PropertyFilterState,
  mediaByProperty: Record<string, PropertyMediaRow[]> = {},
  advisorNamesById: Record<string, string> = {}
) {
  const items = rows.map((row) =>
    createPropertyFilterItem(row, mediaByProperty[row.id] ?? [], row.advisor_id ? advisorNamesById[row.advisor_id] : undefined)
  );
  const allowedIds = new Set(filterPropertyItems(items, filters).map((item) => item.id));
  return rows
    .filter((row) => allowedIds.has(row.id))
    .sort((a, b) => sortPropertyFilterItems(
      createPropertyFilterItem(a, mediaByProperty[a.id] ?? [], a.advisor_id ? advisorNamesById[a.advisor_id] : undefined),
      createPropertyFilterItem(b, mediaByProperty[b.id] ?? [], b.advisor_id ? advisorNamesById[b.advisor_id] : undefined),
      filters.sort,
      filters.areaMode
    ));
}

export function filterPropertyItems(items: PropertyFilterItem[], filters: PropertyFilterState) {
  return items
    .filter((item) => propertyMatchesFilters(item, filters))
    .sort((a, b) => sortPropertyFilterItems(a, b, filters.sort, filters.areaMode));
}

export function propertyMatchesFilters(item: PropertyFilterItem, filters: PropertyFilterState) {
  const query = normalizeTurkishText(filters.query);
  if (query) {
    const haystack = normalizeTurkishText([
      item.title,
      item.city,
      item.district,
      item.neighborhood,
      item.addressText,
      item.propertyType,
      item.listingType,
      item.advisorName,
      item.status
    ].filter(Boolean).join(" "));
    if (!haystack.includes(query)) return false;
  }

  if (!matchesText(item.city, filters.city)) return false;
  if (!matchesText(item.district, filters.district)) return false;
  if (filters.neighborhood && !normalizeTurkishText([item.neighborhood, item.addressText].filter(Boolean).join(" ")).includes(normalizeTurkishText(filters.neighborhood))) return false;
  if (!matchesText(item.listingType, filters.listingType)) return false;
  if (!matchesText(item.propertyType, filters.propertyType)) return false;
  if (!matchesText(item.roomCount, filters.roomCount)) return false;
  if (!matchesText(item.currency, filters.currency)) return false;
  if (!matchesText(item.status, filters.status)) return false;
  if (!matchesText(item.parkingType, filters.parkingType)) return false;
  if (!matchesText(item.deedStatus, filters.deedStatus)) return false;

  if (filters.advisor) {
    const advisor = normalizeTurkishText(filters.advisor);
    const advisorHaystack = normalizeTurkishText([item.advisorId, item.advisorName].filter(Boolean).join(" "));
    if (!advisorHaystack.includes(advisor)) return false;
  }

  const price = Number(item.price || 0);
  const minPrice = parseFilterNumber(filters.minPrice);
  const maxPrice = parseFilterNumber(filters.maxPrice);
  if (minPrice !== null && price < minPrice) return false;
  if (maxPrice !== null && price > maxPrice) return false;

  const area = getFilterArea(item, filters.areaMode);
  const minArea = parseFilterNumber(filters.minArea);
  const maxArea = parseFilterNumber(filters.maxArea);
  if (minArea !== null && (area === null || area < minArea)) return false;
  if (maxArea !== null && (area === null || area > maxArea)) return false;

  if (filters.photos === "with" && !item.hasPhotos) return false;
  if (filters.photos === "without" && item.hasPhotos) return false;
  if (filters.coordinates === "with" && !item.hasCoordinates) return false;
  if (filters.coordinates === "missing" && item.hasCoordinates) return false;
  if (!matchesBoolean(item.hasElevator, filters.hasElevator)) return false;
  if (!matchesBoolean(item.inSite, filters.inSite)) return false;
  if (!matchesBoolean(item.exchangeAvailable, filters.exchangeAvailable)) return false;
  if (filters.technicalCompleteness === "missing" && !hasMissingTechnicalInfo(item)) return false;

  return true;
}

export function buildPropertyFilterChips(filters: PropertyFilterState, advisorLabel?: string): PropertyFilterChip[] {
  const chips: PropertyFilterChip[] = [];
  const push = (key: keyof PropertyFilterState, label: string) => {
    if (label) chips.push({ key, label });
  };

  push("query", filters.query);
  push("city", filters.city);
  push("district", filters.district);
  push("neighborhood", filters.neighborhood);
  push("listingType", filters.listingType);
  push("propertyType", filters.propertyType);
  push("roomCount", filters.roomCount);
  if (filters.minPrice) push("minPrice", `Min ${filters.minPrice}`);
  if (filters.maxPrice) push("maxPrice", `Max ${filters.maxPrice}`);
  push("currency", filters.currency);
  if (filters.minArea) push("minArea", `Min ${filters.minArea} m²`);
  if (filters.maxArea) push("maxArea", `Max ${filters.maxArea} m²`);
  push("advisor", advisorLabel || filters.advisor);
  push("status", filters.status);
  if (filters.photos === "with") push("photos", "Fotoğraflı");
  if (filters.photos === "without") push("photos", "Fotoğrafsız");
  if (filters.coordinates === "with") push("coordinates", "Harita Konumlu");
  if (filters.coordinates === "missing") push("coordinates", "Konumu eksik");
  if (filters.hasElevator === "yes") push("hasElevator", "Asansörlü");
  if (filters.hasElevator === "no") push("hasElevator", "Asansör yok");
  if (filters.inSite === "yes") push("inSite", "Site içi");
  if (filters.inSite === "no") push("inSite", "Site dışı");
  push("parkingType", filters.parkingType);
  push("deedStatus", filters.deedStatus);
  if (filters.exchangeAvailable === "yes") push("exchangeAvailable", "Takas");
  if (filters.exchangeAvailable === "no") push("exchangeAvailable", "Takas yok");
  if (filters.technicalCompleteness === "missing") push("technicalCompleteness", "Eksik teknik bilgi");

  return chips;
}

export function hasActivePropertyFilters(filters: PropertyFilterState, keys?: Array<keyof PropertyFilterState>) {
  return (keys || propertyFilterQueryKeys).some((key) => filters[key] !== defaultPropertyFilters[key]);
}

export function getUniquePropertyOptions(
  items: PropertyFilterItem[],
  key: keyof Pick<PropertyFilterItem, "city" | "district" | "listingType" | "propertyType" | "roomCount" | "currency" | "status" | "parkingType" | "deedStatus">
) {
  return [...new Set(items.map((item) => item[key]).filter(Boolean) as string[])]
    .sort((a, b) => a.localeCompare(b, "tr"));
}

export function propertyFiltersFromSearchParams(searchParams: URLSearchParams) {
  const next = { ...defaultPropertyFilters };

  propertyFilterQueryKeys.forEach((key) => {
    const value = searchParams.get(key);
    if (!value) return;
    if (key === "areaMode" && isAreaFilterMode(value)) next.areaMode = value;
    else if (key === "sort" && isPropertySortMode(value)) next.sort = value;
    else if (key === "photos" && isPhotoFilterMode(value)) next.photos = value;
    else if (key === "coordinates" && isPresenceFilterMode(value)) next.coordinates = value;
    else if ((key === "hasElevator" || key === "inSite" || key === "exchangeAvailable") && isBooleanFilterMode(value)) next[key] = value;
    else if (key === "technicalCompleteness" && value === "missing") next.technicalCompleteness = value;
    else if (typeof next[key] === "string") next[key] = value as never;
  });

  return next;
}

export function propertyFiltersToSearchParams(filters: PropertyFilterState) {
  const searchParams = new URLSearchParams();
  propertyFilterQueryKeys.forEach((key) => {
    const value = filters[key];
    if (value && value !== defaultPropertyFilters[key]) searchParams.set(key, String(value));
  });
  return searchParams;
}

function sortPropertyFilterItems(
  a: PropertyFilterItem,
  b: PropertyFilterItem,
  sort: PropertySortMode,
  areaMode: AreaFilterMode
) {
  if (sort === "price_asc") return Number(a.price || 0) - Number(b.price || 0);
  if (sort === "price_desc") return Number(b.price || 0) - Number(a.price || 0);
  if (sort === "area_asc") return Number(getFilterArea(a, areaMode) || 0) - Number(getFilterArea(b, areaMode) || 0);
  if (sort === "area_desc") return Number(getFilterArea(b, areaMode) || 0) - Number(getFilterArea(a, areaMode) || 0);
  return String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
}

function matchesText(value: string | null | undefined, filter: string) {
  if (!filter) return true;
  return normalizeTurkishText(value) === normalizeTurkishText(filter);
}

function matchesBoolean(value: boolean | null | undefined, filter: BooleanFilterMode) {
  if (!filter) return true;
  if (filter === "yes") return value === true;
  return value === false;
}

function parseFilterNumber(value: string) {
  if (!value.trim()) return null;
  const parsed = Number(value.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function getFilterArea(item: PropertyFilterItem, mode: AreaFilterMode) {
  if (mode === "net_area") return item.netArea ?? null;
  if (mode === "gross_area") return item.grossArea ?? null;
  return item.netArea ?? item.grossArea ?? null;
}

function hasMissingTechnicalInfo(item: PropertyFilterItem) {
  return !item.price || !item.propertyType || !item.listingType || !item.roomCount || !getFilterArea(item, "fallback");
}

function isAreaFilterMode(value: string): value is AreaFilterMode {
  return value === "fallback" || value === "net_area" || value === "gross_area";
}

function isPropertySortMode(value: string): value is PropertySortMode {
  return value === "newest" || value === "price_asc" || value === "price_desc" || value === "area_asc" || value === "area_desc";
}

function isBooleanFilterMode(value: string): value is BooleanFilterMode {
  return value === "" || value === "yes" || value === "no";
}

function isPresenceFilterMode(value: string): value is PresenceFilterMode {
  return value === "" || value === "with" || value === "missing";
}

function isPhotoFilterMode(value: string): value is PhotoFilterMode {
  return value === "" || value === "with" || value === "without";
}
