"use client";

import { ChangeEvent, FormEvent, PointerEvent, useEffect, useMemo, useState } from "react";
import { useAuthContext } from "./auth-context";
import {
  createSupabaseAuthClient,
  getDataSetupMessage,
  isSupabaseConfigured,
  PROPERTY_PHOTO_LIMIT,
  PROPERTY_PHOTO_MAX_SIZE,
  PROPERTY_PHOTO_MIME_TYPES,
  type AdvisorCommissionRow,
  type AdvisorDealRow,
  type AdvisorMatchRow,
  type AdvisorPortfolioRow,
  type AdvisorPropertyRow,
  type AdvisorSearchRequestRow,
  type AdvisorTaskRow,
  type PropertyMediaRow
} from "@/lib/supabase/client";
import { demoSearchRequests, demoShowcasePortfolios } from "@/lib/oos/demo-data";

type Stage = "Lead" | "Yeni" | "Görüşme" | "Sözleşme" | "Kapanış" | "Kapandı";
type Risk = "Düşük" | "Orta" | "Yüksek" | string;
type AuthMode = "login" | "signup";
type Timeframe = "1A" | "3A" | "6A" | "1Y" | "Tümü";
type ActivePage = "dashboard" | "portfolios" | "searches" | "notifications";
type PortfolioStageFilter =
  | "Tümü"
  | "Lead"
  | "Yer Gösterimi"
  | "Teklif"
  | "Sözleşme"
  | "Tahsilat"
  | "Kapandı";
type PortfolioSort = "En Yeni" | "En Yüksek Değer" | "En Yüksek Komisyon" | "A-Z";
type SearchStatus = "Aktif" | "Acil" | "Beklemede" | "Kapatıldı" | "Eşleşme Bulundu";
type SearchUrgency = "Acil" | "Normal" | "Düşük";
type SearchCurrency = "TRY" | "USD" | "EUR" | "GBP";
type SearchFilter =
  | "Tüm Arayışlar"
  | "Benim Arayışlarım"
  | "Güçlü Eşleşmeler"
  | "Acil"
  | "Kapananlar";

type EntityId = number | string;

type AuthForm = {
  name: string;
  email: string;
  password: string;
  consultantId: string;
};

type Opportunity = {
  id: EntityId;
  title: string;
  location: string;
  owner: string;
  value: number;
  stage: Stage;
  contractType: string;
  nextMove: string;
  risk: Risk;
  commissionRate: number;
  probability?: number;
  sourceUrl?: string;
  listingId?: string;
  createdAt?: string;
  propertyType?: string;
  area?: string;
  rooms?: string;
  description?: string;
  latitude?: number | null;
  longitude?: number | null;
  commission?: number;
  ownerConsultantId?: number;
  ownerConsultantName?: string;
};

type OpportunityForm = {
  title: string;
  location: string;
  owner: string;
  value: string;
  stage: Stage;
  contractType: string;
  nextMove: string;
  risk: Risk;
  commissionRate: number;
};

type Task = {
  id: EntityId;
  opportunityId: EntityId;
  title: string;
  done: boolean;
};

type SearchRequest = {
  id: EntityId;
  consultantId: number;
  consultantName: string;
  title: string;
  location: string;
  propertyType: string;
  minPrice: number;
  maxPrice: number;
  currency: SearchCurrency;
  minBedrooms: number;
  minArea: number;
  maxArea: number;
  rooms: string;
  purpose: string;
  urgency: SearchUrgency;
  notes: string;
  status: SearchStatus;
  createdAt: string;
};

type SearchForm = {
  title: string;
  location: string;
  propertyType: string;
  minPrice: string;
  maxPrice: string;
  currency: SearchCurrency;
  minBedrooms: string;
  minArea: string;
  maxArea: string;
  rooms: string;
  purpose: string;
  urgency: SearchUrgency;
  notes: string;
  quickNote: string;
};

type MatchDetail = {
  label: string;
  value: string | number;
  passed: boolean;
};

type SearchNotification = {
  id: EntityId;
  recipientConsultantId: number;
  recipientConsultantName: string;
  message: string;
  searchRequestId: EntityId;
  portfolioId: EntityId;
  matchScore: number;
  createdAt: string;
  read: boolean;
};

type Consultant = {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  portfolioCount: number;
};

type SahibindenListing = {
  title?: string;
  listingId?: string;
  price?: string;
  value?: number;
  location?: string;
  grossArea?: string;
  netArea?: string;
  area?: string;
  rooms?: string;
  buildingAge?: string;
  floor?: string;
  description?: string;
  owner?: string;
  sourceUrl?: string;
  images?: string[];
};

const commissionRates = [1, 1.5, 2, 3, 4];
const searchCurrencies: SearchCurrency[] = ["TRY", "USD", "EUR", "GBP"];

const initialOpportunities: Opportunity[] = demoShowcasePortfolios.map((portfolio, index) => ({
  id: index + 1,
  title: portfolio.title,
  listingId: portfolio.listingId,
  location: portfolio.location,
  owner: portfolio.owner,
  value: portfolio.value,
  stage: portfolio.stage as Stage,
  contractType: portfolio.contractType,
  nextMove: portfolio.nextMove,
  risk: portfolio.risk,
  commissionRate: portfolio.commissionRate,
  commission: portfolio.commission,
  createdAt: "2026-05-25",
  propertyType: portfolio.propertyType,
  area: portfolio.area,
  rooms: portfolio.rooms,
  description: portfolio.description,
  latitude: portfolio.latitude,
  longitude: portfolio.longitude,
  ownerConsultantId: (index % 3) + 1,
  ownerConsultantName: portfolio.ownerConsultantName
}));

const initialTasks: Task[] = [
  { id: 1, opportunityId: 1, title: "PSA yorumlarını yükle", done: false },
  { id: 2, opportunityId: 1, title: "Emanet mekaniklerini doğrula", done: true },
  { id: 3, opportunityId: 2, title: "Yatırımcı görüşmesini planla", done: false }
];

const contracts = [
  {
    id: 1,
    name: "Satışa Aracılık Sözleşmesi",
    description: "Malik / portföy yetkilendirme süreci için.",
    fileUrl: "/contracts/satisa-aracilik.pdf"
  },
  {
    id: 2,
    name: "Kat Karşılığı Sözleşmesi",
    description: "Arsa sahibi ve yüklenici süreçleri için.",
    fileUrl: "/contracts/kat-karsiligi.pdf"
  },
  {
    id: 3,
    name: "ODA Proje Geliştirme Sözleşmesi",
    description: "Proje geliştirme ve satış hakkı süreçleri için.",
    fileUrl: "/contracts/oda-proje-gelistirme.pdf"
  },
  {
    id: 4,
    name: "Danışman Sözleşmesi",
    description: "OCEAN danışman çalışma modeli için.",
    fileUrl: "/contracts/danisman-sozlesmesi.pdf"
  }
];

const consultants: Consultant[] = [
  {
    id: 1,
    firstName: "Melih",
    lastName: "Yıldız",
    phone: "+90 532 000 00 01",
    portfolioCount: 8
  },
  {
    id: 2,
    firstName: "Mert",
    lastName: "Yılmaz",
    phone: "+90 532 000 00 02",
    portfolioCount: 5
  },
  {
    id: 3,
    firstName: "Selin",
    lastName: "Arslan",
    phone: "+90 532 000 00 03",
    portfolioCount: 11
  }
];

const defaultUser = consultants[0];

const initialSearchRequests: SearchRequest[] = demoSearchRequests.map((request, index) => ({
  id: index + 1,
  consultantId: ((index + 1) % 3) + 1,
  consultantName: request.consultantName,
  title: request.title,
  location: request.location,
  propertyType: request.propertyType,
  minPrice: request.minPrice,
  maxPrice: request.maxPrice,
  currency: "TRY",
  minBedrooms: request.minBedrooms,
  minArea: request.minArea,
  maxArea: request.maxArea,
  rooms: request.rooms,
  purpose: request.purpose,
  urgency: request.urgency,
  notes: request.notes,
  status: "Aktif",
  createdAt: "2026-05-25"
}));

const advisorPerformance = [
  {
    advisorId: 1,
    year: 2026,
    monthly: [
      { month: "Oca 2025", salesVolume: 7800000, commission: 117000 },
      { month: "Şub 2025", salesVolume: 8600000, commission: 129000 },
      { month: "Mar 2025", salesVolume: 8100000, commission: 121500 },
      { month: "Nis 2025", salesVolume: 9400000, commission: 141000 },
      { month: "May 2025", salesVolume: 10200000, commission: 153000 },
      { month: "Haz 2025", salesVolume: 9800000, commission: 147000 },
      { month: "Tem 2025", salesVolume: 11300000, commission: 169500 },
      { month: "Ağu 2025", salesVolume: 12100000, commission: 181500 },
      { month: "Eyl 2025", salesVolume: 11700000, commission: 175500 },
      { month: "Eki 2025", salesVolume: 13600000, commission: 204000 },
      { month: "Kas 2025", salesVolume: 14200000, commission: 213000 },
      { month: "Ara 2025", salesVolume: 15100000, commission: 226500 },
      { month: "Oca 2026", salesVolume: 15800000, commission: 237000 },
      { month: "Şub 2026", salesVolume: 17100000, commission: 256500 },
      { month: "Mar 2026", salesVolume: 16400000, commission: 246000 },
      { month: "Nis 2026", salesVolume: 18900000, commission: 283500 },
      { month: "May 2026", salesVolume: 20100000, commission: 301500 },
      { month: "Haz 2026", salesVolume: 19300000, commission: 289500 },
      { month: "Tem 2026", salesVolume: 21700000, commission: 325500 },
      { month: "Ağu 2026", salesVolume: 23400000, commission: 351000 },
      { month: "Eyl 2026", salesVolume: 22800000, commission: 342000 },
      { month: "Eki 2026", salesVolume: 25600000, commission: 384000 },
      { month: "Kas 2026", salesVolume: 27400000, commission: 411000 },
      { month: "Ara 2026", salesVolume: 30000000, commission: 450000 }
    ]
  },
  {
    advisorId: 2,
    year: 2026,
    monthly: [
      { month: "Ocak", salesVolume: 7000000, commission: 105000 },
      { month: "Şubat", salesVolume: 11000000, commission: 165000 },
      { month: "Mart", salesVolume: 0, commission: 0 },
      { month: "Nisan", salesVolume: 13500000, commission: 202500 },
      { month: "Mayıs", salesVolume: 9000000, commission: 135000 },
      { month: "Haziran", salesVolume: 0, commission: 0 },
      { month: "Temmuz", salesVolume: 15500000, commission: 232500 },
      { month: "Ağustos", salesVolume: 12500000, commission: 187500 },
      { month: "Eylül", salesVolume: 8000000, commission: 120000 },
      { month: "Ekim", salesVolume: 17500000, commission: 262500 },
      { month: "Kasım", salesVolume: 0, commission: 0 },
      { month: "Aralık", salesVolume: 21000000, commission: 315000 }
    ]
  },
  {
    advisorId: 3,
    year: 2026,
    monthly: [
      { month: "Ocak", salesVolume: 18000000, commission: 270000 },
      { month: "Şubat", salesVolume: 0, commission: 0 },
      { month: "Mart", salesVolume: 21000000, commission: 315000 },
      { month: "Nisan", salesVolume: 15000000, commission: 225000 },
      { month: "Mayıs", salesVolume: 26000000, commission: 390000 },
      { month: "Haziran", salesVolume: 12000000, commission: 180000 },
      { month: "Temmuz", salesVolume: 19500000, commission: 292500 },
      { month: "Ağustos", salesVolume: 0, commission: 0 },
      { month: "Eylül", salesVolume: 23000000, commission: 345000 },
      { month: "Ekim", salesVolume: 16000000, commission: 240000 },
      { month: "Kasım", salesVolume: 14000000, commission: 210000 },
      { month: "Aralık", salesVolume: 28000000, commission: 420000 }
    ]
  }
];

function emptyForm(): OpportunityForm {
  return {
    title: "",
    location: "",
    owner: "",
    value: "",
    stage: "Yeni",
    contractType: "Satışa Aracılık",
    nextMove: "",
    risk: "Düşük",
    commissionRate: 2
  };
}

function emptySearchForm(): SearchForm {
  return {
    title: "",
    location: "",
    propertyType: "Villa",
    minPrice: "",
    maxPrice: "",
    currency: "TRY",
    minBedrooms: "",
    minArea: "",
    maxArea: "",
    rooms: "",
    purpose: "Satın Alma",
    urgency: "Normal",
    notes: "",
    quickNote: ""
  };
}

function toForm(opportunity: Opportunity): OpportunityForm {
  return {
    title: opportunity.title,
    location: opportunity.location,
    owner: opportunity.owner,
    value: String(opportunity.value),
    stage: opportunity.stage,
    contractType: opportunity.contractType,
    nextMove: opportunity.nextMove,
    risk: opportunity.risk,
    commissionRate: opportunity.commissionRate
  };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0
  }).format(value);
}

function formatCurrencyAmount(value: number, currency: SearchCurrency = "TRY") {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(value);
}

function money(value: number) {
  return formatCurrency(value);
}

function formatRate(rate: number) {
  return `${rate}%`;
}

function calculateCommission(value: number, rate: number) {
  const normalizedRate = rate >= 1 ? rate / 100 : rate;
  return Math.round(value * normalizedRate);
}

function getOpportunityCommission(opportunity: Opportunity) {
  return calculateCommission(opportunity.value, opportunity.commissionRate);
}

function parseArea(value?: string) {
  if (!value) return null;
  const number = String(value).replace(/[^0-9]/g, "");
  return number ? Number(number) : null;
}

function parseBedrooms(value?: string) {
  if (!value) return null;
  const match = String(value).match(/\d+/);
  return match ? Number(match[0]) : null;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function toPortfolioRow(opportunity: Opportunity) {
  return {
    title: opportunity.title,
    location: opportunity.location,
    district: opportunity.location?.split("/")[0]?.trim() || null,
    owner: opportunity.owner,
    value: opportunity.value,
    stage: opportunity.stage,
    contract_type: opportunity.contractType,
    next_move: opportunity.nextMove,
    risk: opportunity.risk,
    commission_rate: opportunity.commissionRate,
    commission: getOpportunityCommission(opportunity),
    listing_id: opportunity.listingId || null,
    property_type: opportunity.propertyType || null,
    area: opportunity.area || null,
    rooms: opportunity.rooms || null,
    description: opportunity.description || null,
    latitude: opportunity.latitude ?? null,
    longitude: opportunity.longitude ?? null
  };
}

function fromPortfolioRow(row: AdvisorPortfolioRow, consultant: Consultant): Opportunity {
  return {
    id: row.id,
    title: row.title,
    listingId: row.listing_id || undefined,
    location: row.location || "Konum bekleniyor",
    owner: row.owner || "Müşteri bekleniyor",
    value: Number(row.value || 0),
    stage: (row.stage || "Yeni") as Stage,
    contractType: row.contract_type || "Satışa Aracılık",
    nextMove: row.next_move || "Sonraki adım belirlenmedi",
    risk: row.risk || "Düşük",
    commissionRate: Number(row.commission_rate || 2),
    commission: Number(row.commission || 0),
    createdAt: row.created_at?.slice(0, 10) || today(),
    propertyType: row.property_type || "Konut",
    area: row.area || "",
    rooms: row.rooms || "",
    description: row.description || "",
    latitude: row.latitude,
    longitude: row.longitude,
    ownerConsultantId: consultant.id,
    ownerConsultantName: getConsultantName(consultant)
  };
}

function fromPropertyRow(row: AdvisorPropertyRow, consultant: Consultant): Opportunity {
  const location = [row.city, row.district, row.neighborhood].filter(Boolean).join(" / ");
  const area = row.gross_area ? String(row.gross_area) : "";

  return {
    id: row.id,
    title: row.title,
    location: location || "Konum bekleniyor",
    owner: "OceanOS",
    value: Number(row.asking_price || 0),
    stage: row.status === "active" ? "Yeni" : (row.status || "Yeni") as Stage,
    contractType: row.usage_type || "Satışa Aracılık",
    nextMove: row.is_public ? "Public görünürlük aktif" : "Görünürlük kontrolü bekleniyor",
    risk: "Düşük",
    commissionRate: 2,
    commission: calculateCommission(Number(row.asking_price || 0), 2),
    createdAt: row.created_at?.slice(0, 10) || today(),
    propertyType: row.property_type || "Konut",
    area,
    rooms: "",
    description: "",
    latitude: null,
    longitude: null,
    ownerConsultantId: consultant.id,
    ownerConsultantName: getConsultantName(consultant)
  };
}

function toSearchRequestRow(request: SearchRequest) {
  return {
    title: request.title,
    location: request.location,
    property_type: request.propertyType,
    min_price: request.minPrice,
    max_price: request.maxPrice,
    currency: request.currency,
    min_bedrooms: request.minBedrooms,
    min_area: request.minArea,
    max_area: request.maxArea,
    rooms: request.rooms,
    purpose: request.purpose,
    urgency: request.urgency,
    notes: request.notes,
    status: request.status
  };
}

function fromSearchRequestRow(row: AdvisorSearchRequestRow, consultant: Consultant): SearchRequest {
  const districts = Array.isArray(row.districts)
    ? row.districts.join(", ")
    : row.districts || row.location || "";
  const location = [row.city, districts].filter(Boolean).join(" / ");
  const propertyType = Array.isArray(row.property_types)
    ? row.property_types.join(", ")
    : row.property_types || row.property_type || "Portföy";
  const title = row.title || (row.notes?.startsWith("OceanOS Demo: ")
    ? row.notes.replace("OceanOS Demo: ", "")
    : [location, propertyType, row.request_type || "Arayış"].filter(Boolean).join(" · "));

  return {
    id: row.id,
    consultantId: consultant.id,
    consultantName: getConsultantName(consultant),
    title,
    location: location || "Konum bekleniyor",
    propertyType,
    minPrice: Number(row.min_price || 0),
    maxPrice: Number(row.max_price || 0),
    currency: (row.currency || "TRY") as SearchCurrency,
    minBedrooms: Number(row.min_bedrooms || 0),
    minArea: Number(row.min_area || 0),
    maxArea: Number(row.max_area || 0),
    rooms: row.rooms || "",
    purpose: row.purpose || row.request_type || "Satın Alma",
    urgency: (row.urgency || "Normal") as SearchUrgency,
    notes: row.notes || "",
    status: (row.status || "Aktif") as SearchStatus,
    createdAt: row.created_at?.slice(0, 10) || today()
  };
}

function fromTaskRow(row: AdvisorTaskRow): Task {
  return {
    id: row.id,
    opportunityId: row.portfolio_id || "",
    title: row.title,
    done: Boolean(row.done)
  };
}

function getConsultantName(consultant: Consultant) {
  return `${consultant.firstName} ${consultant.lastName}`;
}

function getConsultantById(id: string | number) {
  return consultants.find((consultant) => consultant.id === Number(id)) || defaultUser;
}

function normalizePhoneForWhatsApp(phone?: string) {
  return phone ? phone.replace(/\D/g, "") : "";
}

function openWhatsAppForSearch(search: SearchRequest, portfolio?: Opportunity) {
  if (typeof window === "undefined") return;

  const consultant = consultants.find((item) => item.id === search.consultantId);
  const phone = normalizePhoneForWhatsApp(consultant?.phone);
  const firstName = search.consultantName.split(" ")[0] || "Merhaba";
  const message = [
    `Merhaba ${firstName},`,
    `"${search.title}" arayışı hakkında görüşmek istiyorum.`,
    portfolio ? `İlgili portföy: ${portfolio.title}` : ""
  ]
    .filter(Boolean)
    .join(" ");
  const encodedMessage = encodeURIComponent(message);
  const url = phone
    ? `https://wa.me/${phone}?text=${encodedMessage}`
    : `https://api.whatsapp.com/send?text=${encodedMessage}`;

  window.open(url, "_blank", "noopener,noreferrer");
}

function getSearchMatchDetails(search: SearchRequest, portfolio: Opportunity) {
  const details: MatchDetail[] = [];
  let score = 0;
  let maxScore = 0;

  maxScore += 35;
  if (
    portfolio.location &&
    search.location &&
    portfolio.location.toLocaleLowerCase("tr-TR").includes(
      search.location.toLocaleLowerCase("tr-TR")
    )
  ) {
    score += 35;
    details.push({ label: "Lokasyon", value: search.location, passed: true });
  } else {
    details.push({
      label: "Lokasyon",
      value: search.location || "Belirtilmedi",
      passed: false
    });
  }

  maxScore += 25;
  if (
    portfolio.propertyType &&
    search.propertyType &&
    portfolio.propertyType.toLocaleLowerCase("tr-TR") ===
      search.propertyType.toLocaleLowerCase("tr-TR")
  ) {
    score += 25;
    details.push({
      label: "Tip",
      value: search.propertyType,
      passed: true
    });
  } else {
    details.push({
      label: "Tip",
      value: search.propertyType || "Belirtilmedi",
      passed: false
    });
  }

  maxScore += 25;
  const price = Number(portfolio.value || 0);
  const minPrice = Number(search.minPrice || 0);
  const maxPrice = Number(search.maxPrice || 0);
  if (price && (!minPrice || price >= minPrice) && (!maxPrice || price <= maxPrice)) {
    score += 25;
    details.push({ label: "Fiyat aralığı", value: price, passed: true });
  } else {
    details.push({
      label: "Fiyat aralığı",
      value: price || "Fiyat yok",
      passed: false
    });
  }

  if (search.minBedrooms > 0) {
    maxScore += 15;
    const bedrooms = parseBedrooms(portfolio.rooms);
    if (bedrooms !== null && bedrooms >= search.minBedrooms) {
      score += 15;
      details.push({ label: "Yatak odası", value: `${bedrooms}+`, passed: true });
    } else {
      details.push({
        label: "Yatak odası",
        value: bedrooms !== null ? `${bedrooms}+` : "Bilgi yok",
        passed: false
      });
    }
  }

  return {
    score: Math.round((score / maxScore) * 100),
    details
  };
}

function calculateSearchMatch(search: SearchRequest, portfolio: Opportunity) {
  return getSearchMatchDetails(search, portfolio).score;
}

function getMatchBadge(score: number) {
  return score >= 85 ? "Güçlü Eşleşme" : "Eşleşme";
}

function getMatchReason(details: MatchDetail[]) {
  const matched = details
    .filter((detail) => detail.passed)
    .map((detail) => detail.label.toLocaleLowerCase("tr-TR"));

  if (!matched.length) return "temel kriterler doğrulanmalı";

  return `${matched.join(", ")} uyumlu`;
}

function getSearchMatches(search: SearchRequest, portfolios: Opportunity[]) {
  return portfolios
    .map((portfolio) => ({
      portfolio,
      ...getSearchMatchDetails(search, portfolio)
    }))
    .filter((match) => match.score >= 70)
    .sort((a, b) => b.score - a.score);
}

function getPortfolioSearchMatches(portfolio: Opportunity, searches: SearchRequest[]) {
  return searches
    .filter((search) => search.status !== "Kapatıldı")
    .map((search) => ({
      search,
      ...getSearchMatchDetails(search, portfolio)
    }))
    .filter((match) => match.score >= 70)
    .sort((a, b) => b.score - a.score);
}

function createSearchNotifications(
  search: SearchRequest,
  portfolios: Opportunity[],
  existingNotifications: SearchNotification[]
) {
  return getSearchMatches(search, portfolios)
    .filter(
      (match) =>
        !existingNotifications.some(
          (notification) =>
            notification.searchRequestId === search.id &&
            notification.portfolioId === match.portfolio.id
        )
    )
    .map((match) => {
      const portfolioLabel = match.portfolio.listingId || match.portfolio.title;

      return {
        id: `${Date.now()}-${search.id}-${match.portfolio.id}`,
        recipientConsultantId: match.portfolio.ownerConsultantId || defaultUser.id,
        recipientConsultantName:
          match.portfolio.ownerConsultantName || getConsultantName(defaultUser),
        message: `${search.consultantName} adlı danışmanın arayışı sizin ${portfolioLabel} numaralı portföyünüzle %${match.score} eşleşiyor.`,
        searchRequestId: search.id,
        portfolioId: match.portfolio.id,
        matchScore: match.score,
        createdAt: today(),
        read: false
      };
    });
}

function buildInitialNotifications() {
  return initialSearchRequests.flatMap((search) =>
    createSearchNotifications(search, initialOpportunities, [])
  );
}

function getListingIdFromUrl(url: string) {
  return url.match(/\d{6,}/)?.[0] ?? "";
}

async function analyzeSahibindenUrl(url: string) {
  const response = await fetch(
    `/api/sahibinden-import?url=${encodeURIComponent(url)}`
  );
  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(
      data.error || "Sahibinden verisi çekilemedi. Linki kontrol edin veya manuel giriş yapın."
    );
  }

  return data as SahibindenListing;
}

function downloadContract(fileUrl: string) {
  const link = document.createElement("a");
  link.href = fileUrl;
  link.download = "";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function Home() {
  const { user } = useAuthContext();
  const supabase = useMemo(() => createSupabaseAuthClient(), []);
  const demoMode = !isSupabaseConfigured;
  const [isAuthenticated, setIsAuthenticated] = useState(
    () =>
      typeof window !== "undefined" &&
      window.localStorage.getItem("ocean-authenticated") === "true"
  );
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [authForm, setAuthForm] = useState<AuthForm>(() => ({
    name: "",
    email: "",
    password: "",
    consultantId:
      typeof window !== "undefined"
        ? window.localStorage.getItem("ocean-consultant-id") ||
          String(defaultUser.id)
        : String(defaultUser.id)
  }));
  const [currentUser, setCurrentUser] = useState(() =>
    getConsultantById(
      typeof window !== "undefined"
        ? window.localStorage.getItem("ocean-consultant-id") ||
            String(defaultUser.id)
        : String(defaultUser.id)
    )
  );
  const [opportunities, setOpportunities] = useState<Opportunity[]>(
    () => demoMode ? initialOpportunities : []
  );
  const [activePage, setActivePage] = useState<ActivePage>("dashboard");
  const [tasks, setTasks] = useState<Task[]>(() => demoMode ? initialTasks : []);
  const [searchRequests, setSearchRequests] = useState<SearchRequest[]>(
    () => demoMode ? initialSearchRequests : []
  );
  const [notifications, setNotifications] = useState<SearchNotification[]>(
    () => demoMode ? buildInitialNotifications() : []
  );
  const [matchRows, setMatchRows] = useState<AdvisorMatchRow[]>([]);
  const [dealRows, setDealRows] = useState<AdvisorDealRow[]>([]);
  const [commissionRows, setCommissionRows] = useState<AdvisorCommissionRow[]>([]);
  const [selectedId, setSelectedId] = useState<EntityId>(
    () => demoMode ? initialOpportunities[0].id : ""
  );
  const [search, setSearch] = useState("");
  const [searchFilter, setSearchFilter] = useState<SearchFilter>("Tüm Arayışlar");
  const [searchFormOpen, setSearchFormOpen] = useState(false);
  const [searchForm, setSearchForm] = useState<SearchForm>(emptySearchForm());
  const [editingSearchId, setEditingSearchId] = useState<EntityId | null>(null);
  const [searchSuccess, setSearchSuccess] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<EntityId | null>(null);
  const [form, setForm] = useState<OpportunityForm>(emptyForm());
  const [sahibindenUrl, setSahibindenUrl] = useState("");
  const [sahibindenLoading, setSahibindenLoading] = useState(false);
  const [sahibindenError, setSahibindenError] = useState("");
  const [sahibindenListing, setSahibindenListing] =
    useState<SahibindenListing | null>(null);
  const [dataError, setDataError] = useState("");
  const [dataLoading, setDataLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [propertyMedia, setPropertyMedia] = useState<Record<string, PropertyMediaRow[]>>({});
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaMessage, setMediaMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const persistentMode = Boolean(isSupabaseConfigured && user && supabase);

  useEffect(() => {
    if (!persistentMode || !supabase) return;

    let mounted = true;
    setDataLoading(true);
    setDataError("");

    Promise.all([
      supabase.getProperties(),
      supabase.getSearchRequests(),
      supabase.getMatches()
    ])
      .then(async ([propertyRows, requestRows, matches]) => {
        if (!mounted) return;
        const nextPortfolios: Opportunity[] = propertyRows.map((row: AdvisorPropertyRow) =>
          fromPropertyRow(row, currentUser)
        );
        const nextRequests: SearchRequest[] = requestRows.map((row: AdvisorSearchRequestRow) =>
          fromSearchRequestRow(row, currentUser)
        );
        const [tasks, deals, commissions] = await Promise.allSettled([
          supabase.getTasks(),
          supabase.getDeals(),
          supabase.getCommissions()
        ]);

        setOpportunities(nextPortfolios);
        setSearchRequests(nextRequests);
        setTasks(tasks.status === "fulfilled" ? tasks.value.map(fromTaskRow) : []);
        setNotifications([]);
        setMatchRows(matches);
        setDealRows(deals.status === "fulfilled" ? deals.value : []);
        setCommissionRows(commissions.status === "fulfilled" ? commissions.value : []);
        setSelectedId(nextPortfolios[0]?.id ?? "");
        const optionalError = [tasks, deals, commissions]
          .find((result) => result.status === "rejected") as PromiseRejectedResult | undefined;
        setDataError(optionalError ? getDataSetupMessage(optionalError.reason?.message || "", { optional: true }) : "");
      })
      .catch((error: Error) => {
        if (!mounted) return;
        console.error(error);
        setOpportunities([]);
        setSearchRequests([]);
        setTasks([]);
        setNotifications([]);
        setMatchRows([]);
        setDealRows([]);
        setCommissionRows([]);
        setSelectedId("");
        setDataError(getDataSetupMessage(error.message));
      })
      .finally(() => {
        if (mounted) setDataLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [currentUser, persistentMode, supabase]);

  const selectedOpportunity =
    opportunities.find((opportunity) => opportunity.id === selectedId) ??
    opportunities[0] ??
    null;

  useEffect(() => {
    if (!persistentMode || !supabase || !selectedOpportunity?.id) return;

    const propertyId = String(selectedOpportunity.id);
    if (propertyMedia[propertyId]) return;

    let mounted = true;
    setMediaLoading(true);
    setMediaMessage("");

    supabase.getPropertyMedia(propertyId)
      .then((rows: PropertyMediaRow[]) => {
        if (!mounted) return;
        setPropertyMedia((current) => ({ ...current, [propertyId]: rows }));
      })
      .catch((error: Error) => {
        if (!mounted) return;
        console.error(error);
        setMediaMessage(getDataSetupMessage(error.message, { optional: true }));
      })
      .finally(() => {
        if (mounted) setMediaLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [persistentMode, propertyMedia, selectedOpportunity?.id, supabase]);

  const filteredOpportunities = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("tr-TR");

    if (!query) {
      return opportunities;
    }

    return opportunities.filter((opportunity) =>
      [
        opportunity.title,
        opportunity.location,
        opportunity.owner,
        opportunity.stage,
        opportunity.contractType
      ]
        .join(" ")
        .toLocaleLowerCase("tr-TR")
        .includes(query)
    );
  }, [opportunities, search]);

  const selectedTasks = tasks.filter(
    (task) => task.opportunityId === selectedOpportunity?.id
  );
  const selectedMedia = selectedOpportunity
    ? propertyMedia[String(selectedOpportunity.id)] ?? []
    : [];
  const formValue = Number(form.value) || 0;
  const formCommission = calculateCommission(formValue, form.commissionRate);
  const listingAreaNumber = parseArea(
    sahibindenListing?.grossArea || sahibindenListing?.area
  );
  const pricePerM2 =
    sahibindenListing?.value && listingAreaNumber
      ? Math.round(sahibindenListing.value / listingAreaNumber)
      : null;
  const unreadNotifications = notifications.filter(
    (notification) =>
      !notification.read &&
      notification.recipientConsultantId === currentUser.id
  );
  const selectedPortfolioSearchMatches = selectedOpportunity
    ? demoMode ? getPortfolioSearchMatches(selectedOpportunity, searchRequests) : []
    : [];
  const filteredSearchRequests = searchRequests.filter((request) => {
    if (searchFilter === "Benim Arayışlarım") {
      return request.consultantId === currentUser.id;
    }

    if (searchFilter === "Güçlü Eşleşmeler") {
      return demoMode && getSearchMatches(request, opportunities).some((match) => match.score >= 85);
    }

    if (searchFilter === "Acil") {
      return request.urgency === "Acil";
    }

    if (searchFilter === "Kapananlar") {
      return request.status === "Kapatıldı";
    }

    return true;
  });
  const myActivePortfolios = opportunities.filter(
    (opportunity) =>
      opportunity.ownerConsultantId === currentUser.id &&
      opportunity.stage !== "Kapandı"
  );
  const myActiveSearchRequests = searchRequests.filter(
    (request) => request.consultantId === currentUser.id && request.status !== "Kapatıldı"
  );
  const recentMatches = demoMode
    ? searchRequests
        .flatMap((request) =>
          getSearchMatches(request, opportunities).map((match) => ({
            search: request,
            ...match
          }))
        )
        .filter(
          (match) =>
            match.search.consultantId === currentUser.id ||
            match.portfolio.ownerConsultantId === currentUser.id
        )
        .slice(0, 5)
    : [];
  const realizedCommission = demoMode
    ? undefined
    : commissionRows.reduce((sum, row) => sum + getCommissionRowAmount(row), 0);
  const activePageTitle: Record<ActivePage, string> = {
    dashboard: "OCEAN BrokerageOS",
    portfolios: "Tüm Portföyler",
    searches: "Arayışlar",
    notifications: "Bildirimler"
  };
  const activePageSubtitle: Record<ActivePage, string> = {
    dashboard:
      "Fırsatları, sözleşmeleri ve danışman operasyonunu tek sade ekranda yönetin.",
    portfolios:
      "Tüm portföyleri tek sakin listede görüntüleyin, filtreleyin ve yönetin.",
    searches: "Danışman arayışlarını ve portföy eşleşmelerini mobilde hızlıca yönetin.",
    notifications: "Yeni eşleşme bildirimlerini ve aksiyonları tek ekranda takip edin."
  };

  function openCreateForm() {
    setEditingId(null);
    setForm(emptyForm());
    setFormOpen(true);
  }

  function openEditForm(opportunity: Opportunity) {
    setEditingId(opportunity.id);
    setForm(toForm(opportunity));
    setFormOpen(true);
  }

  async function uploadPropertyPhotos(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (!files.length || !selectedOpportunity) return;
    if (!persistentMode || !supabase) {
      setMediaMessage("Fotoğraf yükleme için Supabase bağlantısı gerekli.");
      return;
    }

    const propertyId = String(selectedOpportunity.id);
    const currentMedia = propertyMedia[propertyId] ?? [];

    if (currentMedia.length + files.length > PROPERTY_PHOTO_LIMIT) {
      setMediaMessage(`En fazla ${PROPERTY_PHOTO_LIMIT} fotoğraf yüklenebilir.`);
      return;
    }

    const invalidFile = files.find((file) => !PROPERTY_PHOTO_MIME_TYPES.includes(file.type as typeof PROPERTY_PHOTO_MIME_TYPES[number]));
    if (invalidFile) {
      setMediaMessage("Sadece JPEG, PNG veya WebP fotoğraf yüklenebilir.");
      return;
    }

    const oversizedFile = files.find((file) => file.size > PROPERTY_PHOTO_MAX_SIZE);
    if (oversizedFile) {
      setMediaMessage("Her fotoğraf en fazla 10 MB olabilir.");
      return;
    }

    setActionLoading("photo-upload");
    setMediaMessage("");
    setUploadProgress(0);

    try {
      let nextMedia = currentMedia;

      for (const [index, file] of files.entries()) {
        const media = await supabase.uploadPropertyPhoto(
          propertyId,
          file,
          nextMedia.length,
          (progress: number) => {
            const totalProgress = Math.round(((index + progress / 100) / files.length) * 100);
            setUploadProgress(totalProgress);
          }
        );

        if (media) nextMedia = [...nextMedia, media];
      }

      setPropertyMedia((current) => ({ ...current, [propertyId]: nextMedia }));
      setUploadProgress(100);
      setMediaMessage("Fotoğraflar yüklendi.");
    } catch (error) {
      console.error(error);
      setMediaMessage(error instanceof Error ? getDataSetupMessage(error.message, { optional: true }) : "Fotoğraf yüklenemedi.");
    } finally {
      setActionLoading("");
      setTimeout(() => setUploadProgress(null), 800);
    }
  }

  async function markPhotoAsCover(mediaId: string) {
    if (!selectedOpportunity || !persistentMode || !supabase) return;

    const propertyId = String(selectedOpportunity.id);
    setActionLoading(`photo-cover-${mediaId}`);
    setMediaMessage("");

    try {
      await supabase.markPropertyMediaCover(propertyId, mediaId);
      setPropertyMedia((current) => ({
        ...current,
        [propertyId]: (current[propertyId] ?? []).map((media) => ({
          ...media,
          is_cover: media.id === mediaId
        }))
      }));
      setMediaMessage("Kapak fotoğrafı güncellendi.");
    } catch (error) {
      console.error(error);
      setMediaMessage(error instanceof Error ? getDataSetupMessage(error.message, { optional: true }) : "Kapak fotoğrafı güncellenemedi.");
    } finally {
      setActionLoading("");
    }
  }

  async function saveOpportunity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.title.trim()) {
      setDataError("Portföy başlığı zorunlu.");
      return;
    }

    const value = Math.max(Number(form.value) || 0, 0);
    const existingOpportunity = editingId
      ? opportunities.find((opportunity) => opportunity.id === editingId)
      : null;
    let savedOpportunity: Opportunity = {
      ...existingOpportunity,
      id: existingOpportunity?.id ?? Date.now(),
      title: form.title.trim() || "İsimsiz Fırsat",
      location: form.location.trim() || "Konum bekleniyor",
      owner: form.owner.trim() || "Müşteri bekleniyor",
      value,
      stage: form.stage,
      contractType: form.contractType.trim() || "Satışa Aracılık",
      nextMove: form.nextMove.trim() || "Sonraki adım belirlenmedi",
      risk: form.risk,
      commissionRate: form.commissionRate,
      commission: calculateCommission(value, form.commissionRate),
      propertyType: existingOpportunity?.propertyType || "Konut",
      createdAt: existingOpportunity?.createdAt || today(),
      ownerConsultantId: existingOpportunity?.ownerConsultantId || currentUser.id,
      ownerConsultantName:
        existingOpportunity?.ownerConsultantName || getConsultantName(currentUser)
    };

    setActionLoading("portfolio-save");
    if (persistentMode && supabase) {
      try {
        const row = editingId
          ? await supabase.updatePortfolio(String(editingId), toPortfolioRow(savedOpportunity))
          : await supabase.createPortfolio(toPortfolioRow(savedOpportunity));
        if (row) savedOpportunity = fromPortfolioRow(row, currentUser);
        setDataError("");
      } catch (error) {
        console.error(error);
        setDataError(error instanceof Error ? getDataSetupMessage(error.message) : "Portföy kaydedilemedi.");
        setActionLoading("");
        return;
      }
    }

    setOpportunities((current) =>
      editingId
        ? current.map((opportunity) =>
            opportunity.id === editingId ? savedOpportunity : opportunity
          )
        : [savedOpportunity, ...current]
    );
    setSelectedId(savedOpportunity.id);
    setFormOpen(false);
    setActionLoading("");
  }

  async function deleteOpportunity(id: EntityId) {
    setActionLoading(`portfolio-delete-${id}`);
    if (persistentMode && supabase) {
      try {
        await supabase.deletePortfolio(String(id));
        await Promise.all(
          tasks
            .filter((task) => task.opportunityId === id && typeof task.id === "string")
            .map((task) => supabase.deleteTask(String(task.id)))
        );
        setDataError("");
      } catch (error) {
        console.error(error);
        setDataError(error instanceof Error ? getDataSetupMessage(error.message) : "Portföy silinemedi.");
        setActionLoading("");
        return;
      }
    }

    const remaining = opportunities.filter((opportunity) => opportunity.id !== id);
    setOpportunities(remaining);
    setTasks((current) => current.filter((task) => task.opportunityId !== id));
    setNotifications((current) =>
      current.filter((notification) => notification.portfolioId !== id)
    );
    setSelectedId(remaining[0]?.id ?? "");
    if (editingId === id) {
      setEditingId(null);
      setFormOpen(false);
    }
    setActionLoading("");
  }

  async function addTask() {
    if (!selectedOpportunity || !taskTitle.trim()) {
      if (!taskTitle.trim()) setDataError("Görev başlığı zorunlu.");
      return;
    }

    let savedTask: Task = {
      id: Date.now(),
      opportunityId: selectedOpportunity.id,
      title: taskTitle.trim(),
      done: false
    };

    setActionLoading("task-save");
    if (persistentMode && supabase) {
      try {
        const row = await supabase.createTask({
          portfolio_id: typeof selectedOpportunity.id === "string" ? selectedOpportunity.id : null,
          title: savedTask.title,
          done: false
        });
        if (row) savedTask = fromTaskRow(row);
        setDataError("");
      } catch (error) {
        console.error(error);
        setDataError(error instanceof Error ? getDataSetupMessage(error.message) : "Görev kaydedilemedi.");
        setActionLoading("");
        return;
      }
    }

    setTasks((current) => [savedTask, ...current]);
    setTaskTitle("");
    setActionLoading("");
  }

  async function toggleTask(id: EntityId) {
    const task = tasks.find((item) => item.id === id);
    setActionLoading(`task-toggle-${id}`);
    if (persistentMode && supabase && task && typeof id === "string") {
      try {
        await supabase.updateTask(id, { done: !task.done });
        setDataError("");
      } catch (error) {
        console.error(error);
        setDataError(error instanceof Error ? getDataSetupMessage(error.message) : "Görev güncellenemedi.");
        setActionLoading("");
        return;
      }
    }

    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task
      )
    );
    setActionLoading("");
  }

  async function deleteTask(id: EntityId) {
    setActionLoading(`task-delete-${id}`);
    if (persistentMode && supabase && typeof id === "string") {
      try {
        await supabase.deleteTask(id);
        setDataError("");
      } catch (error) {
        console.error(error);
        setDataError(error instanceof Error ? getDataSetupMessage(error.message) : "Görev silinemedi.");
        setActionLoading("");
        return;
      }
    }

    setTasks((current) => current.filter((task) => task.id !== id));
    setActionLoading("");
  }

  async function saveSearchRequest() {
    if (!searchForm.title.trim() || !searchForm.location.trim()) {
      setDataError("Arayış başlığı ve lokasyon zorunlu.");
      return;
    }

    let savedSearch: SearchRequest = {
      id: editingSearchId ?? Date.now(),
      consultantId: currentUser.id,
      consultantName: getConsultantName(currentUser),
      title: searchForm.title.trim(),
      location: searchForm.location.trim(),
      propertyType: searchForm.propertyType.trim() || "Portföy",
      minPrice: Number(searchForm.minPrice || 0),
      maxPrice: Number(searchForm.maxPrice || 0),
      currency: searchForm.currency,
      minBedrooms: Number(searchForm.minBedrooms || 0),
      minArea: Number(searchForm.minArea || 0),
      maxArea: Number(searchForm.maxArea || 0),
      rooms: searchForm.rooms.trim(),
      purpose: searchForm.purpose.trim() || "Satın Alma",
      urgency: searchForm.urgency,
      notes: searchForm.notes.trim() || searchForm.quickNote.trim(),
      status: "Aktif",
      createdAt: today()
    };

    setActionLoading("search-save");
    if (persistentMode && supabase) {
      try {
        const row = editingSearchId
          ? await supabase.updateSearchRequest(String(editingSearchId), toSearchRequestRow(savedSearch))
          : await supabase.createSearchRequest(toSearchRequestRow(savedSearch));
        if (row) savedSearch = fromSearchRequestRow(row, currentUser);
        setDataError("");
      } catch (error) {
        console.error(error);
        setDataError(error instanceof Error ? getDataSetupMessage(error.message) : "Arayış kaydedilemedi.");
        setActionLoading("");
        return;
      }
    }

    const nextNotifications = demoMode
      ? createSearchNotifications(savedSearch, opportunities, notifications)
      : [];

    setSearchRequests((current) =>
      editingSearchId
        ? current.map((request) =>
            request.id === editingSearchId ? savedSearch : request
          )
        : [savedSearch, ...current]
    );
    setNotifications((current) => [...nextNotifications, ...current]);
    setSearchForm(emptySearchForm());
    setEditingSearchId(null);
    setSearchFormOpen(false);
    setSearchSuccess(
      demoMode
        ? "Arayış eklendi ve sistem portföy eşleşmelerini kontrol etti."
        : "Arayış kaydedildi."
    );
    setActionLoading("");
  }

  function editSearchRequest(request: SearchRequest) {
    setEditingSearchId(request.id);
    setSearchForm({
      title: request.title,
      location: request.location,
      propertyType: request.propertyType,
      minPrice: String(request.minPrice || ""),
      maxPrice: String(request.maxPrice || ""),
      currency: request.currency,
      minBedrooms: String(request.minBedrooms || ""),
      minArea: String(request.minArea || ""),
      maxArea: String(request.maxArea || ""),
      rooms: request.rooms,
      purpose: request.purpose,
      urgency: request.urgency,
      notes: request.notes,
      quickNote: request.notes
    });
    setSearchSuccess("");
    setSearchFormOpen(true);
  }

  async function closeSearchRequest(id: EntityId) {
    setActionLoading(`search-close-${id}`);
    if (persistentMode && supabase && typeof id === "string") {
      try {
        await supabase.updateSearchRequest(id, { status: "Kapatıldı" });
        setDataError("");
      } catch (error) {
        console.error(error);
        setDataError(error instanceof Error ? getDataSetupMessage(error.message) : "Arayış güncellenemedi.");
        setActionLoading("");
        return;
      }
    }

    setSearchRequests((current) =>
      current.map((request) =>
        request.id === id ? { ...request, status: "Kapatıldı" } : request
      )
    );
    setActionLoading("");
  }

  function markNotificationRead(id: EntityId) {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }

  function openNotificationPortfolio(notification: SearchNotification) {
    setSelectedId(notification.portfolioId);
    markNotificationRead(notification.id);
  }

  async function createMatchTask(searchRequest: SearchRequest, portfolio: Opportunity) {
    let savedTask: Task = {
      id: Date.now(),
      opportunityId: portfolio.id,
      title: `${searchRequest.title} için ${portfolio.title} eşleşmesini değerlendir`,
      done: false
    };

    if (persistentMode && supabase) {
      try {
        const row = await supabase.createTask({
          portfolio_id: typeof portfolio.id === "string" ? portfolio.id : null,
          title: savedTask.title,
          done: false
        });
        if (row) savedTask = fromTaskRow(row);
        setDataError("");
      } catch (error) {
        console.error(error);
        setDataError(error instanceof Error ? getDataSetupMessage(error.message) : "Görev kaydedilemedi.");
        return;
      }
    }

    setTasks((current) => [savedTask, ...current]);
  }

  async function handleSahibindenAnalysis() {
    if (!sahibindenUrl.trim()) {
      setSahibindenError("Linki kontrol edin veya manuel giriş yapın.");
      return;
    }

    setSahibindenLoading(true);
    setSahibindenError("");
    setSahibindenListing(null);

    try {
      const data = await analyzeSahibindenUrl(sahibindenUrl.trim());
      setSahibindenListing({
        ...data,
        listingId: data.listingId || getListingIdFromUrl(sahibindenUrl),
        sourceUrl: data.sourceUrl || sahibindenUrl.trim()
      });
    } catch {
      setSahibindenError(
        "Sahibinden verisi çekilemedi. Linki kontrol edin veya manuel giriş yapın."
      );
    } finally {
      setSahibindenLoading(false);
    }
  }

  async function saveSahibindenOpportunity() {
    if (!sahibindenListing) {
      return;
    }

    const title = sahibindenListing.title || "Sahibinden fırsatı";
    const value = sahibindenListing.value || 0;
    const id = Date.now();
    let savedOpportunity: Opportunity = {
      id,
      title,
      location: sahibindenListing.location || "Lokasyon doğrulanmalı",
      owner: sahibindenListing.owner || "Sahibinden ilanından eklendi",
      value,
      stage: "Lead",
      probability: 25,
      contractType: "Satışa Aracılık",
      nextMove:
        "İlan bilgilerini doğrula, malik/yetki durumunu kontrol et ve fiyat bilgisini teyit et.",
      risk:
        "Sahibinden verisi otomatik çekilmiştir. Fiyat, yetki, malik ve ilan güncelliği manuel doğrulanmalıdır.",
      commissionRate: 1.5,
      commission: calculateCommission(value, 1.5),
      createdAt: today(),
      sourceUrl: sahibindenListing.sourceUrl || sahibindenUrl.trim(),
      listingId: sahibindenListing.listingId || getListingIdFromUrl(sahibindenUrl),
      propertyType: "Konut",
      area: sahibindenListing.grossArea || sahibindenListing.area,
      rooms: sahibindenListing.rooms,
      description: sahibindenListing.description,
      ownerConsultantId: currentUser.id,
      ownerConsultantName: getConsultantName(currentUser)
    };
    let savedTask: Task = {
      id: Date.now() + 1,
      opportunityId: id,
      title: `${title} için Sahibinden bilgilerini doğrula`,
      done: false
    };

    if (persistentMode && supabase) {
      try {
        const row = await supabase.createPortfolio(toPortfolioRow(savedOpportunity));
        if (row) {
          savedOpportunity = fromPortfolioRow(row, currentUser);
          const taskRow = await supabase.createTask({
            portfolio_id: row.id,
            title: savedTask.title,
            done: false
          });
          if (taskRow) savedTask = fromTaskRow(taskRow);
        }
        setDataError("");
      } catch (error) {
        console.error(error);
        setDataError(error instanceof Error ? getDataSetupMessage(error.message) : "Sahibinden portföyü kaydedilemedi.");
        return;
      }
    }

    setOpportunities((current) => [savedOpportunity, ...current]);
    setTasks((current) => [savedTask, ...current]);
    setSelectedId(savedOpportunity.id);
  }

  if (!isAuthenticated) {
    return (
      <AuthScreen
        consultants={consultants}
        mode={authMode}
        form={authForm}
        onModeChange={setAuthMode}
        onFormChange={setAuthForm}
        onLogin={(consultant) => {
          window.localStorage.setItem("ocean-authenticated", "true");
          window.localStorage.setItem("ocean-consultant-id", String(consultant.id));
          setCurrentUser(consultant);
          setIsAuthenticated(true);
        }}
      />
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-stone-50 px-4 py-4 pb-[calc(env(safe-area-inset-bottom)+7rem)] text-slate-950 dark:bg-black dark:text-neutral-50 sm:px-6 sm:py-6 md:pb-8 lg:px-8">
      <div className="mx-auto max-w-6xl min-w-0">
        <header className="flex flex-col gap-5 border-b border-slate-200 pb-6 dark:border-slate-800 sm:gap-6 sm:pb-8 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm font-semibold shadow-sm dark:border-slate-800 dark:bg-slate-900">
                O
              </span>
              <span className="text-sm font-medium text-slate-500">
                OCEAN BrokerageOS
              </span>
            </div>
            <h1 className="mt-6 max-w-3xl break-words text-[2rem] font-semibold leading-tight tracking-tight text-slate-950 dark:text-slate-100 sm:mt-8 sm:text-5xl">
              {activePageTitle[activePage]}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-500">
              {activePageSubtitle[activePage]}
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end">
            {unreadNotifications.length ? (
              <span className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 sm:w-auto">
                {unreadNotifications.length} yeni eşleşme
              </span>
            ) : null}
            <button
              className="btn-secondary w-full sm:w-auto"
              type="button"
              onClick={() =>
                setActivePage((current) =>
                  current === "portfolios" ? "dashboard" : "portfolios"
                )
              }
            >
              {activePage === "portfolios" ? "Dashboard’a Dön" : "Tüm Portföyler"}
            </button>
            <button
              className="btn-secondary w-full sm:w-auto"
              type="button"
              onClick={() => {
                window.localStorage.removeItem("ocean-authenticated");
                setIsAuthenticated(false);
              }}
            >
              Çıkış
            </button>
            <span className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 sm:w-auto">
              {getConsultantName(currentUser)}
            </span>
            <button className="btn-primary w-full sm:w-auto" type="button" onClick={openCreateForm}>
              Yeni Fırsat
            </button>
          </div>
        </header>

        {dataError ? (
          <div className="mt-5 rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100">
            {dataError}
          </div>
        ) : null}

        {!isSupabaseConfigured ? (
          <div className="mt-5 rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100">
            {getDataSetupMessage()}
          </div>
        ) : null}

        {dataLoading ? (
          <div className="mt-5 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400">
            Supabase verileri yükleniyor...
          </div>
        ) : null}

        {activePage === "portfolios" ? (
          <PortfolioListPage
            opportunities={opportunities}
            onBack={() => setActivePage("dashboard")}
            onCreate={openCreateForm}
            onDelete={deleteOpportunity}
            onEdit={openEditForm}
            onOpen={(id) => {
              setSelectedId(id);
              setActivePage("dashboard");
            }}
          />
        ) : activePage === "searches" ? (
          <section className="mt-6 sm:mt-8">
            <SearchRequestsCard
              currentUser={currentUser}
              filter={searchFilter}
              form={searchForm}
              formOpen={searchFormOpen}
              demoMode={demoMode}
              opportunities={opportunities}
              searchRequests={filteredSearchRequests}
              successMessage={searchSuccess}
              saving={actionLoading === "search-save"}
              onCloseSearch={closeSearchRequest}
              onCreateTask={createMatchTask}
              onEditSearch={editSearchRequest}
              onFilterChange={setSearchFilter}
              onFormChange={setSearchForm}
              onOpenForm={() => {
                setEditingSearchId(null);
                setSearchForm(emptySearchForm());
                setSearchFormOpen(true);
                setSearchSuccess("");
              }}
              onSave={saveSearchRequest}
              onSelectPortfolio={(id) => {
                setSelectedId(id);
                setActivePage("dashboard");
              }}
              onToggleForm={() => setSearchFormOpen((current) => !current)}
            />
          </section>
        ) : activePage === "notifications" ? (
          <section className="mt-6 sm:mt-8">
            <NotificationsCard
              notifications={unreadNotifications}
              opportunities={opportunities}
              searchRequests={searchRequests}
              onMarkRead={markNotificationRead}
              onOpenPortfolio={(notification) => {
                openNotificationPortfolio(notification);
                setActivePage("dashboard");
              }}
            />
          </section>
        ) : (
          <>
            <AdvisorHomeScreen
              currentUser={currentUser}
              activePortfolios={myActivePortfolios}
              activeSearchRequests={myActiveSearchRequests}
              matchCount={demoMode ? recentMatches.length : matchRows.length}
              recentMatches={recentMatches}
              onAddPortfolio={openCreateForm}
              onAddSearchRequest={() => {
                setEditingSearchId(null);
                setSearchForm(emptySearchForm());
                setSearchFormOpen(true);
                setSearchSuccess("");
                setActivePage("searches");
              }}
              onOpenPortfolio={(id) => setSelectedId(id)}
              onViewMatches={() => {
                setSearchFilter("Güçlü Eşleşmeler");
                setActivePage("searches");
              }}
            />

            <div className="mt-6 lg:hidden">
              <SearchRequestsCard
                currentUser={currentUser}
                filter={searchFilter}
                form={searchForm}
                formOpen={searchFormOpen}
                demoMode={demoMode}
                opportunities={opportunities}
                searchRequests={filteredSearchRequests}
                successMessage={searchSuccess}
                saving={actionLoading === "search-save"}
                onCloseSearch={closeSearchRequest}
                onCreateTask={createMatchTask}
                onEditSearch={editSearchRequest}
                onFilterChange={setSearchFilter}
                onFormChange={setSearchForm}
                onOpenForm={() => {
                  setEditingSearchId(null);
                  setSearchForm(emptySearchForm());
                  setSearchFormOpen(true);
                  setSearchSuccess("");
                }}
                onSave={saveSearchRequest}
                onSelectPortfolio={(id) => setSelectedId(id)}
                onToggleForm={() => setSearchFormOpen((current) => !current)}
              />
            </div>

            <SummaryCards
              deals={opportunities}
              dealCount={demoMode ? undefined : dealRows.length}
              realizedCommission={realizedCommission}
            />

            <section className="mt-6 grid min-w-0 gap-4 sm:mt-8 sm:gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
          <div className="min-w-0 space-y-5">
            <div className="hidden lg:block">
              <SearchRequestsCard
                currentUser={currentUser}
                filter={searchFilter}
                form={searchForm}
                formOpen={searchFormOpen}
                demoMode={demoMode}
                opportunities={opportunities}
                searchRequests={filteredSearchRequests}
                successMessage={searchSuccess}
                saving={actionLoading === "search-save"}
                onCloseSearch={closeSearchRequest}
                onCreateTask={createMatchTask}
                onEditSearch={editSearchRequest}
                onFilterChange={setSearchFilter}
                onFormChange={setSearchForm}
                onOpenForm={() => {
                  setEditingSearchId(null);
                  setSearchForm(emptySearchForm());
                  setSearchFormOpen(true);
                  setSearchSuccess("");
                }}
                onSave={saveSearchRequest}
                onSelectPortfolio={(id) => setSelectedId(id)}
                onToggleForm={() => setSearchFormOpen((current) => !current)}
              />
            </div>

            <Card title="Fırsatlar">
              <input
                className="input"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Başlık, konum, müşteri veya sözleşme ara"
              />
              <div className="mt-4 space-y-3">
                {filteredOpportunities.length ? (
                  filteredOpportunities.map((opportunity) => (
                    <OpportunityCard
                      key={opportunity.id}
                      opportunity={opportunity}
                      active={opportunity.id === selectedOpportunity?.id}
                      onSelect={() => setSelectedId(opportunity.id)}
                    />
                  ))
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-stone-50 p-5 text-center text-sm text-slate-500">
                    <p>İlk portföyünü ekle.</p>
                    <button className="btn-primary mt-4" type="button" onClick={openCreateForm}>
                      Portföy ekle
                    </button>
                  </div>
                )}
              </div>
            </Card>

            {selectedOpportunity ? (
              <Card title="Seçili Fırsat">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h2 className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
                      {selectedOpportunity.title}
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                      {selectedOpportunity.location} · {selectedOpportunity.owner}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:flex">
                    <button
                      className="btn-secondary"
                      type="button"
                      onClick={() => openEditForm(selectedOpportunity)}
                    >
                      Düzenle
                    </button>
                    <button
                      className="btn-danger !border-red-200 !text-red-600 hover:!border-red-300 hover:!text-red-700"
                      type="button"
                      disabled={actionLoading === `portfolio-delete-${selectedOpportunity.id}`}
                      onClick={() => deleteOpportunity(selectedOpportunity.id)}
                    >
                      {actionLoading === `portfolio-delete-${selectedOpportunity.id}` ? "Siliniyor..." : "Sil"}
                    </button>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <Info label="Değer" value={formatCurrency(selectedOpportunity.value)} />
                  <Info
                    label="Komisyon"
                    value={formatCurrency(
                      getOpportunityCommission(selectedOpportunity)
                    )}
                  />
                  <Info label="Aşama" value={selectedOpportunity.stage} />
                  <Info label="Sözleşme" value={selectedOpportunity.contractType} />
                  <Info label="Risk" value={selectedOpportunity.risk} tone="danger" />
                  <Info label="Sonraki hamle" value={selectedOpportunity.nextMove} />
                </div>

                <PropertyPhotoManager
                  disabled={!persistentMode || actionLoading === "photo-upload"}
                  loading={mediaLoading}
                  media={selectedMedia}
                  message={mediaMessage}
                  progress={uploadProgress}
                  onMarkCover={markPhotoAsCover}
                  onUpload={uploadPropertyPhotos}
                  markingCoverId={actionLoading.startsWith("photo-cover-") ? actionLoading.replace("photo-cover-", "") : ""}
                />

                {selectedPortfolioSearchMatches.length ? (
                  <div className="mt-6 rounded-3xl border border-slate-200 bg-stone-50 p-4">
                    <p className="text-sm font-semibold text-slate-950">
                      Bu portföye uygun arayışlar
                    </p>
                    <div className="mt-3 space-y-2">
                      {selectedPortfolioSearchMatches.map((match) => (
                        <div
                          key={match.search.id}
                          className="flex flex-col gap-2 rounded-2xl bg-white px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-950">
                              {match.search.consultantName} — {match.search.title}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {match.search.location} · {match.search.purpose}
                            </p>
                          </div>
                          <span
                            className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${
                              match.score >= 85
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            %{match.score}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </Card>
            ) : null}

          </div>

          <aside className="min-w-0 space-y-5">
            <NotificationsCard
              notifications={unreadNotifications}
              opportunities={opportunities}
              searchRequests={searchRequests}
              onMarkRead={markNotificationRead}
              onOpenPortfolio={openNotificationPortfolio}
            />

            <Card title="Görevler">
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  className="input"
                  value={taskTitle}
                  onChange={(event) => setTaskTitle(event.target.value)}
                  placeholder="Yeni görev"
                />
                <button
                  className="btn-primary w-full sm:w-auto"
                  type="button"
                  disabled={actionLoading === "task-save"}
                  onClick={addTask}
                >
                  {actionLoading === "task-save" ? "Ekleniyor..." : "Ekle"}
                </button>
              </div>
              <div className="mt-4 space-y-2">
                {selectedTasks.length ? (
                  selectedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3"
                    >
                      <input
                        type="checkbox"
                        className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-600"
                        checked={task.done}
                        disabled={actionLoading === `task-toggle-${task.id}`}
                        onChange={() => toggleTask(task.id)}
                      />
                      <span
                        className={`min-w-0 flex-1 text-sm ${
                          task.done
                            ? "text-emerald-700 line-through"
                            : "text-slate-800"
                        }`}
                      >
                        {task.title}
                      </span>
                      <button
                        className="shrink-0 text-sm text-red-500 transition hover:text-red-700"
                        type="button"
                        disabled={actionLoading === `task-delete-${task.id}`}
                        onClick={() => deleteTask(task.id)}
                      >
                        {actionLoading === `task-delete-${task.id}` ? "Siliniyor..." : "Sil"}
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-stone-50 px-3 py-4 text-center text-sm text-slate-500">
                    Bugünün ilk görevini ekle.
                  </div>
                )}
              </div>
            </Card>

            <Card title="Sözleşmeler">
              <div className="space-y-3">
                {contracts.map((contract) => (
                  <div
                    key={contract.id}
                    className="flex flex-col gap-3 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-950">
                        {contract.name}
                      </p>
                      <p className="mt-1 text-sm leading-5 text-slate-500">
                        {contract.description}
                      </p>
                    </div>
                    <button
                      className="btn-secondary w-full shrink-0 sm:w-auto"
                      type="button"
                      onClick={() => downloadContract(contract.fileUrl)}
                    >
                      İndir
                    </button>
                  </div>
                ))}
              </div>
            </Card>

            <AdvisorPerformanceCard currentUser={currentUser} demoMode={demoMode} />

            <Card title="Danışmanlar">
              {demoMode ? (
                <div className="space-y-3">
                  {consultants.map((consultant) => (
                    <div
                      key={consultant.id}
                      className="min-w-0 rounded-2xl border border-slate-200 bg-white px-3 py-3"
                    >
                      <p className="text-sm font-medium text-slate-950">
                        {consultant.firstName} {consultant.lastName}
                      </p>
                      <p className="mt-1 break-words text-sm text-slate-500">{consultant.phone}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {consultant.portfolioCount} portföy
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-2xl border border-dashed border-slate-200 bg-stone-50 px-3 py-4 text-sm text-slate-500">
                  Gerçek danışman profilleri için profil kayıtları bekleniyor.
                </p>
              )}
            </Card>

            <Card title="Sahibinden Intelligence">
              <div className="space-y-3">
                <input
                  className="input"
                  value={sahibindenUrl}
                  onChange={(event) => setSahibindenUrl(event.target.value)}
                  placeholder="Sahibinden ilan linki"
                />
                <button
                  className="btn-primary w-full"
                  type="button"
                  onClick={handleSahibindenAnalysis}
                  disabled={sahibindenLoading}
                >
                  {sahibindenLoading ? "Analiz ediliyor..." : "Analiz Et"}
                </button>

                {sahibindenError ? (
                  <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {sahibindenError}
                  </p>
                ) : null}

                {sahibindenListing ? (
                  <div className="min-w-0 space-y-4 rounded-2xl border border-slate-200 bg-stone-50 p-3 sm:p-4">
                    {sahibindenListing.images?.length ? (
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {sahibindenListing.images.slice(0, 3).map((image) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={image}
                            src={image}
                            alt=""
                            className="h-16 w-full rounded-md object-cover"
                          />
                        ))}
                      </div>
                    ) : null}

                    <Info
                      label="Portföy Özeti"
                      value={sahibindenListing.title || "Doğrulama gerekli"}
                    />
                    <Info
                      label="Fiyat / m²"
                      value={
                        pricePerM2
                          ? `${formatCurrency(pricePerM2)} / m²`
                          : sahibindenListing.value
                            ? "m² doğrulanmalı"
                            : "Fiyat doğrulanmalı"
                      }
                    />
                    <Info
                      label="Lokasyon"
                      value={sahibindenListing.location || "Lokasyon doğrulanmalı"}
                    />
                    <Info
                      label="İlan No"
                      value={sahibindenListing.listingId || "Doğrulama gerekli"}
                    />
                    <Info
                      label="Oda / m² bilgileri"
                      value={[
                        sahibindenListing.rooms || "Oda doğrulanmalı",
                        sahibindenListing.grossArea ||
                          sahibindenListing.area ||
                          "m² doğrulanmalı",
                        sahibindenListing.netArea,
                        sahibindenListing.buildingAge,
                        sahibindenListing.floor
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    />
                    <Info
                      label="Kısa açıklama"
                      value={
                        sahibindenListing.description || "Doğrulama gerekli"
                      }
                    />
                    <Info
                      label="Risk notu"
                      value="Fiyat, yetki, malik ve ilan güncelliği manuel doğrulanmalıdır."
                      tone="danger"
                    />
                    <Info
                      label="Kaynak"
                      value={sahibindenListing.sourceUrl || sahibindenUrl}
                    />
                    <button
                      className="btn-primary w-full"
                      type="button"
                      onClick={saveSahibindenOpportunity}
                    >
                      Fırsatlara Kaydet
                    </button>
                  </div>
                ) : null}
              </div>
            </Card>
          </aside>
        </section>
            <footer className="pb-2 pt-8 text-center text-xs leading-5 text-slate-400 dark:text-slate-600">
              Star Girişim ve Yatırım A.Ş. · OOS danışman çalışma alanı · Kurumsal ve yasal bilgiler Menü içinde yer alır.
            </footer>
          </>
        )}
      </div>

      {formOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/20 px-3 py-3 backdrop-blur-sm sm:items-center sm:px-4 sm:py-4">
          <form
            className="max-h-[92dvh] w-full max-w-3xl overflow-y-auto rounded-t-3xl border border-slate-200 bg-white p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] shadow-xl sm:rounded-3xl sm:p-5"
            onSubmit={saveOpportunity}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  {editingId ? "Fırsatı düzenle" : "Yeni fırsat"}
                </p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
                  Fırsat bilgileri
                </h2>
              </div>
              <button
                className="btn-secondary w-full sm:w-auto"
                type="button"
                onClick={() => setFormOpen(false)}
              >
                Kapat
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="Başlık">
                <input
                  className="input"
                  value={form.title}
                  onChange={(event) =>
                    setForm({ ...form, title: event.target.value })
                  }
                />
              </Field>
              <Field label="Konum">
                <input
                  className="input"
                  value={form.location}
                  onChange={(event) =>
                    setForm({ ...form, location: event.target.value })
                  }
                />
              </Field>
              <Field label="Malik / Müşteri">
                <input
                  className="input"
                  value={form.owner}
                  onChange={(event) =>
                    setForm({ ...form, owner: event.target.value })
                  }
                />
              </Field>
              <Field label="Fırsat değeri">
                <input
                  className="input"
                  min="0"
                  type="number"
                  value={form.value}
                  onChange={(event) =>
                    setForm({ ...form, value: event.target.value })
                  }
                />
              </Field>
              <Field label="Aşama">
                <select
                  className="input"
                  value={form.stage}
                  onChange={(event) =>
                    setForm({ ...form, stage: event.target.value as Stage })
                  }
                >
                  {(
                    [
                      "Lead",
                      "Yeni",
                      "Görüşme",
                      "Sözleşme",
                      "Kapanış",
                      "Kapandı"
                    ] as Stage[]
                  ).map((stage) => (
                    <option key={stage}>{stage}</option>
                  ))}
                </select>
              </Field>
              <Field label="Risk">
                <select
                  className="input"
                  value={form.risk}
                  onChange={(event) =>
                    setForm({ ...form, risk: event.target.value as Risk })
                  }
                >
                  {(["Düşük", "Orta", "Yüksek"] as Risk[]).map((risk) => (
                    <option key={risk}>{risk}</option>
                  ))}
                </select>
              </Field>
              <Field label="Sözleşme tipi">
                <input
                  className="input"
                  value={form.contractType}
                  onChange={(event) =>
                    setForm({ ...form, contractType: event.target.value })
                  }
                />
              </Field>
              <Field label="Sonraki hamle">
                <input
                  className="input"
                  value={form.nextMove}
                  onChange={(event) =>
                    setForm({ ...form, nextMove: event.target.value })
                  }
                />
              </Field>
            </div>

            <div className="mt-6 rounded-3xl border border-slate-200 bg-stone-50 p-4">
              <p className="text-sm font-medium text-slate-950">
                Komisyon oranı
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {commissionRates.map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => setForm({ ...form, commissionRate: rate })}
                    className={`rounded-full border px-4 py-2 text-sm transition ${
                      form.commissionRate === rate
                        ? "border-slate-950 bg-slate-950 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                    }`}
                  >
                    {formatRate(rate)}
                  </button>
                ))}
              </div>
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-sm text-slate-500">Hesaplanan komisyon</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight">
                  {formatCurrency(formCommission)}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse justify-end gap-2 sm:flex-row">
              <button
                className="btn-secondary w-full sm:w-auto"
                type="button"
                onClick={() => setFormOpen(false)}
              >
                Vazgeç
              </button>
              <button className="btn-primary w-full sm:w-auto" type="submit" disabled={actionLoading === "portfolio-save"}>
                {actionLoading === "portfolio-save" ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </main>
  );
}

function PortfolioListPage({
  opportunities,
  onBack,
  onCreate,
  onDelete,
  onEdit,
  onOpen
}: {
  opportunities: Opportunity[];
  onBack: () => void;
  onCreate: () => void;
  onDelete: (id: EntityId) => void;
  onEdit: (opportunity: Opportunity) => void;
  onOpen: (id: EntityId) => void;
}) {
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<PortfolioStageFilter>("Tümü");
  const [sort, setSort] = useState<PortfolioSort>("En Yeni");
  const filters: PortfolioStageFilter[] = [
    "Tümü",
    "Lead",
    "Yer Gösterimi",
    "Teklif",
    "Sözleşme",
    "Tahsilat",
    "Kapandı"
  ];
  const sorts: PortfolioSort[] = [
    "En Yeni",
    "En Yüksek Değer",
    "En Yüksek Komisyon",
    "A-Z"
  ];
  const normalizedQuery = query.trim().toLocaleLowerCase("tr-TR");
  const filteredPortfolios = opportunities
    .filter((opportunity) => {
      if (stageFilter !== "Tümü" && opportunity.stage !== stageFilter) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return [
        opportunity.title,
        opportunity.location,
        opportunity.listingId,
        opportunity.owner,
        opportunity.ownerConsultantName,
        opportunity.propertyType,
        opportunity.contractType
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("tr-TR")
        .includes(normalizedQuery);
    })
    .sort((a, b) => {
      if (sort === "En Yüksek Değer") {
        return Number(b.value || 0) - Number(a.value || 0);
      }

      if (sort === "En Yüksek Komisyon") {
        return getOpportunityCommission(b) - getOpportunityCommission(a);
      }

      if (sort === "A-Z") {
        return a.title.localeCompare(b.title, "tr");
      }

      return (b.createdAt || "").localeCompare(a.createdAt || "");
    });
  const totalPortfolioValue = opportunities.reduce(
    (sum, opportunity) => sum + Number(opportunity.value || 0),
    0
  );
  const totalPotentialCommission = opportunities.reduce(
    (sum, opportunity) => sum + getOpportunityCommission(opportunity),
    0
  );

  function openSource(url?: string) {
    if (!url || typeof window === "undefined") return;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <section className="mt-6 min-w-0 space-y-5 sm:mt-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
        <button className="btn-secondary w-full sm:w-auto" type="button" onClick={onBack}>
          Dashboard’a Dön
        </button>
        <button className="btn-primary w-full sm:w-auto" type="button" onClick={onCreate}>
          Yeni Fırsat Ekle
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Toplam Portföy</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            {opportunities.length}
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Toplam Portföy Değeri</p>
          <p className="mt-2 break-words text-2xl font-semibold tracking-tight text-slate-950">
            {money(totalPortfolioValue)}
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Potansiyel Komisyon</p>
          <p className="mt-2 break-words text-2xl font-semibold tracking-tight text-emerald-700">
            {money(totalPotentialCommission)}
          </p>
        </div>
      </div>

      <section className="min-w-0 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <h2 className="text-base font-semibold tracking-tight text-slate-950">
              Tüm Portföyler
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Mevcut fırsat kayıtlarından oluşturulan temiz portföy listesi.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_180px] lg:w-[520px]">
            <input
              className="input"
              placeholder="Portföy ara..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <select
              className="input"
              value={sort}
              onChange={(event) => setSort(event.target.value as PortfolioSort)}
            >
              {sorts.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="-mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {filters.map((item) => (
            <button
              key={item}
              className={`shrink-0 rounded-full px-3 py-2 text-xs font-medium transition ${
                stageFilter === item
                  ? "bg-slate-950 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
              type="button"
              onClick={() => setStageFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>

        {filteredPortfolios.length ? (
          <>
            <div className="mt-5 hidden overflow-x-auto md:block">
              <table className="w-full min-w-[980px] border-separate border-spacing-0 text-left text-sm">
                <thead>
                  <tr className="text-xs font-medium text-slate-400">
                    <th className="border-b border-slate-100 px-3 py-3">Portföy</th>
                    <th className="border-b border-slate-100 px-3 py-3">Lokasyon</th>
                    <th className="border-b border-slate-100 px-3 py-3">Tip</th>
                    <th className="border-b border-slate-100 px-3 py-3">Değer</th>
                    <th className="border-b border-slate-100 px-3 py-3">Komisyon</th>
                    <th className="border-b border-slate-100 px-3 py-3">Aşama</th>
                    <th className="border-b border-slate-100 px-3 py-3">Danışman</th>
                    <th className="border-b border-slate-100 px-3 py-3">Aksiyon</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPortfolios.map((opportunity) => (
                    <tr key={opportunity.id} className="align-top">
                      <td className="border-b border-slate-100 px-3 py-4">
                        <p className="font-medium text-slate-950">{opportunity.title}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {opportunity.listingId || "Portföy no yok"}
                        </p>
                      </td>
                      <td className="border-b border-slate-100 px-3 py-4 text-slate-600">
                        {opportunity.location}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-4 text-slate-600">
                        <p>{opportunity.propertyType || "Belirtilmedi"}</p>
                        <p className="mt-1 text-xs text-slate-400">
                          {[opportunity.area ? `${opportunity.area} m²` : "", opportunity.rooms]
                            .filter(Boolean)
                            .join(" · ") || "m² / oda yok"}
                        </p>
                      </td>
                      <td className="border-b border-slate-100 px-3 py-4 font-medium text-slate-950">
                        {money(opportunity.value)}
                      </td>
                      <td className="border-b border-slate-100 px-3 py-4">
                        <p className="font-medium text-emerald-700">
                          {money(getOpportunityCommission(opportunity))}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {formatRate(opportunity.commissionRate)}
                        </p>
                      </td>
                      <td className="border-b border-slate-100 px-3 py-4">
                        <span
                          className={`rounded-full border px-2.5 py-1 text-xs ${
                            opportunity.stage === "Kapandı"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 text-slate-600"
                          }`}
                        >
                          {opportunity.stage}
                        </span>
                      </td>
                      <td className="border-b border-slate-100 px-3 py-4 text-slate-600">
                        <p>{opportunity.ownerConsultantName || "Atanmadı"}</p>
                        <p className="mt-1 text-xs text-slate-400">{opportunity.owner}</p>
                      </td>
                      <td className="border-b border-slate-100 px-3 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          <button className="mini-action" type="button" onClick={() => onOpen(opportunity.id)}>
                            Aç
                          </button>
                          <button className="mini-action" type="button" onClick={() => onEdit(opportunity)}>
                            Düzenle
                          </button>
                          {opportunity.sourceUrl ? (
                            <button className="mini-action" type="button" onClick={() => openSource(opportunity.sourceUrl)}>
                              Link
                            </button>
                          ) : null}
                          <button
                            className="mini-action !border-red-200 !text-red-600 hover:!border-red-300"
                            type="button"
                            onClick={() => onDelete(opportunity.id)}
                          >
                            Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 space-y-3 md:hidden">
              {filteredPortfolios.map((opportunity) => (
                <div key={opportunity.id} className="rounded-3xl border border-slate-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-slate-950">
                        {opportunity.title}
                      </h3>
                      <p className="mt-1 break-words text-sm text-slate-500">
                        {opportunity.location}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-1 text-xs ${
                        opportunity.stage === "Kapandı"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 text-slate-600"
                      }`}
                    >
                      {opportunity.stage}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-3">
                    <Info label="Değer" value={money(opportunity.value)} />
                    <Info
                      label="Komisyon"
                      value={`${money(getOpportunityCommission(opportunity))} · ${formatRate(
                        opportunity.commissionRate
                      )}`}
                      tone="success"
                    />
                    <Info
                      label="Tip / m²"
                      value={[
                        opportunity.propertyType || "Tip yok",
                        opportunity.area ? `${opportunity.area} m²` : "",
                        opportunity.rooms
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    />
                    <Info
                      label="Danışman"
                      value={opportunity.ownerConsultantName || "Atanmadı"}
                    />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button className="btn-secondary" type="button" onClick={() => onOpen(opportunity.id)}>
                      Aç
                    </button>
                    <button className="btn-secondary" type="button" onClick={() => onEdit(opportunity)}>
                      Düzenle
                    </button>
                    {opportunity.sourceUrl ? (
                      <button className="btn-secondary" type="button" onClick={() => openSource(opportunity.sourceUrl)}>
                        Link
                      </button>
                    ) : null}
                    <button
                      className="btn-danger !border-red-200 !text-red-600 hover:!border-red-300 hover:!text-red-700"
                      type="button"
                      onClick={() => onDelete(opportunity.id)}
                    >
                      Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="mt-5 rounded-3xl border border-dashed border-slate-200 bg-stone-50 p-6 text-center">
            <p className="text-sm font-medium text-slate-950">
              İlk portföyünü ekle.
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Yeni fırsat ekleyerek portföy listenizi oluşturmaya başlayabilirsiniz.
            </p>
            <button className="btn-primary mt-4 w-full sm:w-auto" type="button" onClick={onCreate}>
              Yeni Fırsat Ekle
            </button>
          </div>
        )}
      </section>
    </section>
  );
}

function Card({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="oos-card min-w-0 rounded-3xl p-4 sm:p-5">
      <h2 className="text-base font-semibold tracking-tight text-slate-950 dark:text-slate-100">
        {title}
      </h2>
      <div className="mt-4 min-w-0">{children}</div>
    </section>
  );
}

function SearchStatusBadge({ status }: { status: SearchStatus }) {
  const styles: Record<SearchStatus, string> = {
    "Aktif": "bg-emerald-50 text-emerald-700",
    "Acil": "bg-red-50 text-red-700",
    "Beklemede": "bg-slate-100 text-slate-700",
    "Kapatıldı": "bg-slate-100 text-slate-500",
    "Eşleşme Bulundu": "bg-emerald-50 text-emerald-700"
  };

  return (
    <span className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}

function MatchScoreBadge({ score }: { score: number }) {
  return (
    <span
      className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${
        score >= 85 ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-700"
      }`}
    >
      {getMatchBadge(score)}
    </span>
  );
}

function SearchMatchCard({
  match,
  search,
  onCreateTask,
  onSelectPortfolio
}: {
  match: ReturnType<typeof getSearchMatches>[number];
  search: SearchRequest;
  onCreateTask: (searchRequest: SearchRequest, portfolio: Opportunity) => void;
  onSelectPortfolio: (id: EntityId) => void;
}) {
  return (
    <div className="min-w-0 rounded-3xl border border-slate-200 bg-white p-3 sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-950">
            {match.portfolio.title}
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            {match.portfolio.listingId ? `${match.portfolio.listingId} · ` : ""}
            {match.portfolio.location} · {money(match.portfolio.value)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <MatchScoreBadge score={match.score} />
          <span className="text-sm font-semibold text-slate-950">%{match.score}</span>
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        %{match.score} eşleşme: {getMatchReason(match.details)}.
      </p>

      <div className="mt-3 h-1.5 rounded-full bg-slate-100">
        <div
          className={`h-1.5 rounded-full ${
            match.score >= 85 ? "bg-emerald-500" : "bg-slate-500"
          }`}
          style={{ width: `${match.score}%` }}
        />
      </div>

      <details className="mt-4 rounded-2xl bg-stone-50 p-3">
        <summary className="cursor-pointer text-xs font-medium text-slate-600">
          Neden eşleşti?
        </summary>
        <div className="mt-2 space-y-1">
          {match.details.map((detail) => (
            <p
              key={`${detail.label}-${detail.value}`}
              className={`text-xs ${
                detail.passed ? "text-emerald-700" : "text-red-600"
              }`}
            >
              {detail.passed ? "✓" : "✕"} {detail.label}:{" "}
              {typeof detail.value === "number" && detail.label.includes("Fiyat")
                ? money(detail.value)
                : detail.value}
            </p>
          ))}
        </div>
      </details>

      <div className="mt-3 grid gap-1.5 sm:flex sm:flex-wrap">
        <button
          className="inline-flex min-h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 sm:min-h-9"
          type="button"
          onClick={() => onSelectPortfolio(match.portfolio.id)}
        >
          Portföyü Aç
        </button>
        <button
          className="inline-flex min-h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 sm:min-h-9"
          type="button"
          onClick={() => openWhatsAppForSearch(search, match.portfolio)}
        >
          WhatsApp
        </button>
        <button
          className="inline-flex min-h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 sm:min-h-9"
          type="button"
          onClick={() => onCreateTask(search, match.portfolio)}
        >
          Görev Oluştur
        </button>
      </div>
    </div>
  );
}

function SearchRequestsCard({
  currentUser,
  filter,
  form,
  formOpen,
  demoMode,
  opportunities,
  searchRequests,
  successMessage,
  saving,
  onCloseSearch,
  onCreateTask,
  onEditSearch,
  onFilterChange,
  onFormChange,
  onOpenForm,
  onSave,
  onSelectPortfolio,
  onToggleForm
}: {
  currentUser: Consultant;
  filter: SearchFilter;
  form: SearchForm;
  formOpen: boolean;
  demoMode: boolean;
  opportunities: Opportunity[];
  searchRequests: SearchRequest[];
  successMessage: string;
  saving: boolean;
  onCloseSearch: (id: EntityId) => void;
  onCreateTask: (searchRequest: SearchRequest, portfolio: Opportunity) => void;
  onEditSearch: (searchRequest: SearchRequest) => void;
  onFilterChange: (filter: SearchFilter) => void;
  onFormChange: (form: SearchForm) => void;
  onOpenForm: () => void;
  onSave: () => void;
  onSelectPortfolio: (id: EntityId) => void;
  onToggleForm: () => void;
}) {
  const [expandedSearchId, setExpandedSearchId] = useState<EntityId | null>(null);
  const filters: SearchFilter[] = [
    "Tüm Arayışlar",
    "Benim Arayışlarım",
    "Güçlü Eşleşmeler",
    "Acil",
    "Kapananlar"
  ];

  function update(key: keyof SearchForm, value: string) {
    onFormChange({ ...form, [key]: value });
  }

  return (
    <Card title="Arayışlar">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <p className="text-sm leading-6 text-slate-500">
            Danışmanların aktif müşteri ve yatırımcı talepleri.
          </p>
          <button className="btn-primary w-full sm:w-auto" type="button" onClick={onOpenForm}>
            Yeni Arayış Ekle
          </button>
        </div>

        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {filters.map((item) => (
            <button
              key={item}
              className={`shrink-0 rounded-full px-3 py-2 text-xs font-medium transition ${
                filter === item
                  ? "bg-slate-950 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
              type="button"
              onClick={() => onFilterChange(item)}
            >
              {item}
            </button>
          ))}
        </div>

        {successMessage ? (
          <p className="rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {successMessage}
          </p>
        ) : null}

        {formOpen ? (
          <div className="rounded-3xl border border-slate-200 bg-stone-50 p-3 sm:p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <input className="input" placeholder="Başlık" value={form.title} onChange={(event) => update("title", event.target.value)} />
              <input className="input" placeholder="Lokasyon" value={form.location} onChange={(event) => update("location", event.target.value)} />
              <input className="input" placeholder="Portföy tipi" value={form.propertyType} onChange={(event) => update("propertyType", event.target.value)} />
              <input className="input" inputMode="numeric" placeholder="Min fiyat" value={form.minPrice} onChange={(event) => update("minPrice", event.target.value)} />
              <input className="input" inputMode="numeric" placeholder="Maks fiyat" value={form.maxPrice} onChange={(event) => update("maxPrice", event.target.value)} />
              <select className="input" value={form.currency} onChange={(event) => update("currency", event.target.value)}>
                {searchCurrencies.map((currency) => (
                  <option key={currency}>{currency}</option>
                ))}
              </select>
              <input className="input" inputMode="numeric" placeholder="Minimum yatak odası" value={form.minBedrooms} onChange={(event) => update("minBedrooms", event.target.value)} />
              <input className="input" inputMode="numeric" placeholder="Min m²" value={form.minArea} onChange={(event) => update("minArea", event.target.value)} />
              <input className="input" inputMode="numeric" placeholder="Maks m²" value={form.maxArea} onChange={(event) => update("maxArea", event.target.value)} />
              <input className="input" placeholder="Amaç" value={form.purpose} onChange={(event) => update("purpose", event.target.value)} />
              <select className="input" value={form.urgency} onChange={(event) => update("urgency", event.target.value)}>
                {(["Acil", "Normal", "Düşük"] as SearchUrgency[]).map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>
            <textarea
              className="input mt-3 min-h-24 resize-none"
              placeholder="Hızlı Arayış Notu: Beykoz’da villa, 3M-5M USD, 4+ yatak odası"
              value={form.quickNote}
              onChange={(event) => update("quickNote", event.target.value)}
            />
            <textarea
              className="input mt-3 min-h-24 resize-none"
              placeholder="Notlar"
              value={form.notes}
              onChange={(event) => update("notes", event.target.value)}
            />
            <div className="mt-3 grid gap-2 sm:flex sm:justify-end">
              <button className="btn-secondary" type="button" onClick={onToggleForm}>
                Vazgeç
              </button>
              <button className="btn-primary" type="button" disabled={saving} onClick={onSave}>
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </div>
        ) : null}

        {searchRequests.length ? (
          <div className="space-y-4">
            {searchRequests.map((request) => {
              const matches = demoMode ? getSearchMatches(request, opportunities) : [];
              const bestMatch = matches[0];
              const isExpanded = expandedSearchId === request.id;
              const displayStatus =
                matches.length && request.status !== "Kapatıldı"
                  ? "Eşleşme Bulundu"
                  : request.status;

              return (
                <div key={request.id} className="min-w-0 rounded-3xl border border-slate-200 bg-white p-3 sm:p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-slate-950">{request.title}</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {request.consultantName} • {request.purpose}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {request.urgency === "Acil" ? <SearchStatusBadge status="Acil" /> : null}
                      <SearchStatusBadge status={displayStatus} />
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2 break-words text-sm text-slate-600 sm:grid-cols-2">
                    <p>Lokasyon: {request.location}</p>
                    <p>Tip: {request.propertyType}</p>
                    <p>
                      Bütçe:{" "}
                      {request.minPrice ? formatCurrencyAmount(request.minPrice, request.currency) : "Min yok"} -{" "}
                      {request.maxPrice ? formatCurrencyAmount(request.maxPrice, request.currency) : "Maks yok"}
                    </p>
                    <p>Minimum yatak odası: {request.minBedrooms || "Belirtilmedi"}</p>
                    <p>Tarih: {request.createdAt}</p>
                  </div>
                  <p className="mt-3 break-words text-sm leading-6 text-slate-500">{request.notes}</p>
                  <p className="mt-3 text-sm font-medium text-slate-950">
                    {matches.length} eşleşme bulundu
                  </p>

                  {bestMatch && !isExpanded ? (
                    <button
                      className="mt-3 flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-stone-50 px-3 py-3 text-left transition hover:border-slate-300"
                      type="button"
                      onClick={() => setExpandedSearchId(request.id)}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-950">
                          {bestMatch.portfolio.title}
                        </p>
                        <p className="mt-1 truncate text-xs text-slate-500">
                          En güçlü eşleşme · {bestMatch.portfolio.location}
                        </p>
                        <p className="mt-1 truncate text-xs text-slate-500">
                          {getMatchReason(bestMatch.details)}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                        %{bestMatch.score}
                      </span>
                    </button>
                  ) : null}

                  {matches.length && isExpanded ? (
                    <div className="mt-4 space-y-3">
                      {matches.map((match) => (
                        <SearchMatchCard
                          key={match.portfolio.id}
                          match={match}
                          search={request}
                          onCreateTask={onCreateTask}
                          onSelectPortfolio={onSelectPortfolio}
                        />
                      ))}
                    </div>
                  ) : null}

                  <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    <button
                      className="btn-secondary"
                      type="button"
                      onClick={() =>
                        setExpandedSearchId(isExpanded ? null : request.id)
                      }
                    >
                      {isExpanded ? "Eşleşmeleri Gizle" : "Eşleşmeleri Gör"}
                    </button>
                    <button className="btn-secondary" type="button" onClick={() => onEditSearch(request)}>
                      Arayışı Düzenle
                    </button>
                    <button
                      className="btn-danger !border-red-200 !text-red-600 hover:!border-red-300 hover:!text-red-700"
                      type="button"
                      onClick={() => onCloseSearch(request.id)}
                    >
                      Kapat
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-stone-50 p-5 text-center">
            <p className="text-sm font-medium text-slate-950">
              İlk arayışını oluştur.
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Danışmanların müşteri taleplerini buraya ekleyerek portföylerle
              otomatik eşleştirme başlatabilirsin.
            </p>
            <button className="btn-primary mt-4" type="button" onClick={onOpenForm}>
              İlk Arayışı Ekle
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}

function NotificationsCard({
  notifications,
  opportunities,
  searchRequests,
  onMarkRead,
  onOpenPortfolio
}: {
  notifications: SearchNotification[];
  opportunities: Opportunity[];
  searchRequests: SearchRequest[];
  onMarkRead: (id: EntityId) => void;
  onOpenPortfolio: (notification: SearchNotification) => void;
}) {
  return (
    <Card title="Bildirimler">
      {notifications.length ? (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const portfolio = opportunities.find(
              (item) => item.id === notification.portfolioId
            );
            const searchRequest = searchRequests.find(
              (item) => item.id === notification.searchRequestId
            );

            return (
              <div
                key={notification.id}
                className="rounded-3xl border border-emerald-100 bg-emerald-50/50 p-4"
              >
                <p className="text-sm leading-6 text-slate-800">
                  {notification.message}
                </p>
                {portfolio ? (
                  <div className="mt-3 rounded-2xl bg-white p-3">
                    <p className="text-sm font-medium text-slate-950">
                      {portfolio.title}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {portfolio.location} · {money(portfolio.value)}
                    </p>
                    {searchRequest ? (
                      <p className="mt-1 text-xs text-slate-400">
                        {searchRequest.consultantName} · {searchRequest.title}
                      </p>
                    ) : null}
                  </div>
                ) : null}
                <div className="mt-3 grid gap-1.5 min-[420px]:grid-cols-3">
                  <button
                    className="inline-flex min-h-9 items-center justify-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                    type="button"
                    onClick={() => onOpenPortfolio(notification)}
                  >
                    Portföyü Aç
                  </button>
                  <button
                    className="inline-flex min-h-9 items-center justify-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                    type="button"
                    onClick={() =>
                      searchRequest
                        ? openWhatsAppForSearch(searchRequest, portfolio)
                        : undefined
                    }
                  >
                    WhatsApp
                  </button>
                  <button
                    className="inline-flex min-h-9 items-center justify-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                    type="button"
                    onClick={() => onMarkRead(notification.id)}
                  >
                    Görüldü
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="rounded-3xl border border-dashed border-slate-200 bg-stone-50 p-4 text-sm leading-6 text-slate-500">
          Yeni eşleşme bildirimi yok.
        </p>
      )}
    </Card>
  );
}

function AuthScreen({
  consultants,
  mode,
  form,
  onModeChange,
  onFormChange,
  onLogin
}: {
  consultants: Consultant[];
  mode: AuthMode;
  form: AuthForm;
  onModeChange: (mode: AuthMode) => void;
  onFormChange: (form: AuthForm) => void;
  onLogin: (consultant: Consultant) => void;
}) {
  const [error, setError] = useState("");
  const selectedConsultant = getConsultantById(form.consultantId);

  function update(key: keyof AuthForm, value: string) {
    onFormChange({ ...form, [key]: value });
    setError("");
  }

  function changeMode(nextMode: AuthMode) {
    onModeChange(nextMode);
    setError("");
  }

  function submit() {
    if (mode === "signup") {
      if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
        setError("Lütfen tüm alanları doldurun.");
        return;
      }

      onLogin(selectedConsultant);
      return;
    }

    if (!form.email.trim() || !form.password.trim()) {
      setError("Kullanıcı adı/e-posta ve şifre zorunludur.");
      return;
    }

    onLogin(selectedConsultant);
  }

  function continueWithGoogle() {
    // TODO: Replace with real Google OAuth later.
    onLogin(selectedConsultant);
  }

  return (
    <main
      className="relative min-h-dvh overflow-hidden bg-stone-50 px-3 text-slate-950 sm:px-4"
      style={{
        backgroundImage: "url('/mandarin-2.jpeg')",
        backgroundPosition: "center",
        backgroundSize: "cover"
      }}
    >
      <div className="relative mx-auto flex min-h-dvh max-w-md items-center justify-center py-6 sm:py-8">
        <section className="w-full rounded-3xl border border-white/60 bg-white/90 p-5 shadow-sm backdrop-blur-xl sm:p-6">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-semibold shadow-sm">
              O
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
              OCEAN BrokerageOS
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Brokerage operations, portfolios and commissions in one private
              workspace.
            </p>
          </div>

          <div className="mb-4 grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => changeMode("login")}
              className={`rounded-xl px-3 py-2 text-sm transition ${
                mode === "login"
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => changeMode("signup")}
              className={`rounded-xl px-3 py-2 text-sm transition ${
                mode === "signup"
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Signup
            </button>
          </div>

          <div className="space-y-3">
            {mode === "signup" ? (
              <input
                className="input !rounded-xl !px-4 !py-3"
                placeholder="Ad Soyad"
                value={form.name}
                onChange={(event) => update("name", event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    submit();
                  }
                }}
              />
            ) : null}

            <input
              className="input !rounded-xl !px-4 !py-3"
              placeholder="Kullanıcı adı veya e-posta"
              value={form.email}
              onChange={(event) => update("email", event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  submit();
                }
              }}
            />

            <input
              className="input !rounded-xl !px-4 !py-3"
              placeholder="Şifre"
              type="password"
              value={form.password}
              onChange={(event) => update("password", event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  submit();
                }
              }}
            />

            <select
              className="input !rounded-xl !px-4 !py-3"
              value={form.consultantId}
              onChange={(event) => update("consultantId", event.target.value)}
            >
              {consultants.map((consultant) => (
                <option key={consultant.id} value={consultant.id}>
                  {getConsultantName(consultant)}
                </option>
              ))}
            </select>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <button
              type="button"
              onClick={submit}
              className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              {mode === "signup" ? "Hesap Oluştur" : "Giriş Yap"}
            </button>

            <button
              type="button"
              onClick={continueWithGoogle}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 transition hover:bg-slate-50"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-200 text-xs font-semibold">
                G
              </span>
              Continue with Google
            </button>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            Private workspace for OCEAN advisors.
          </p>
        </section>
      </div>
    </main>
  );
}

function AdvisorHomeScreen({
  currentUser,
  activePortfolios,
  activeSearchRequests,
  matchCount,
  recentMatches,
  onAddPortfolio,
  onAddSearchRequest,
  onOpenPortfolio,
  onViewMatches
}: {
  currentUser: Consultant;
  activePortfolios: Opportunity[];
  activeSearchRequests: SearchRequest[];
  matchCount: number;
  recentMatches: Array<ReturnType<typeof getSearchMatches>[number] & { search: SearchRequest }>;
  onAddPortfolio: () => void;
  onAddSearchRequest: () => void;
  onOpenPortfolio: (id: EntityId) => void;
  onViewMatches: () => void;
}) {
  return (
    <section className="mt-6 grid min-w-0 gap-4 sm:mt-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
      <div className="grid min-w-0 gap-4">
        <DashboardMatchList
          demoMode={!isSupabaseConfigured}
          matches={recentMatches}
          onOpenPortfolio={onOpenPortfolio}
        />

        <DashboardList
          title="Aktif Arayışlarım"
          empty="Aktif arayış yok."
          items={activeSearchRequests.slice(0, 3).map((request) => ({
            id: request.id,
            title: request.title,
            meta: `${request.location} · ${request.purpose}`,
            badge: request.urgency
          }))}
        />
      </div>

      <div className="oos-card min-w-0 rounded-3xl p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Bugünkü çalışma ekranı
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">
              {getConsultantName(currentUser)}
            </h2>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <DashboardMetric label="Aktif portföyüm" value={activePortfolios.length} />
          <DashboardMetric label="Aktif arayışım" value={activeSearchRequests.length} />
          <DashboardMetric label="Son eşleşme" value={matchCount} />
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          <button className="btn-primary" type="button" onClick={onAddPortfolio}>
            Portföy Ekle
          </button>
          <button className="btn-secondary" type="button" onClick={onAddSearchRequest}>
            Arayış Ekle
          </button>
          <button className="btn-secondary" type="button" onClick={onViewMatches}>
            Eşleşmeleri Gör
          </button>
        </div>
      </div>

      <div className="grid min-w-0 gap-4">
        <DashboardList
          title="Aktif Portföylerim"
          empty="Aktif portföy yok."
          items={activePortfolios.slice(0, 3).map((portfolio) => ({
            id: portfolio.id,
            title: portfolio.title,
            meta: `${portfolio.location} · ${money(portfolio.value)}`,
            badge: portfolio.stage
          }))}
          onSelect={onOpenPortfolio}
        />
      </div>
    </section>
  );
}

function DashboardMatchList({
  demoMode,
  matches,
  onOpenPortfolio
}: {
  demoMode: boolean;
  matches: Array<ReturnType<typeof getSearchMatches>[number] & { search: SearchRequest }>;
  onOpenPortfolio: (id: EntityId) => void;
}) {
  return (
    <div className="oos-card min-w-0 rounded-3xl p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {demoMode ? "Örnek eşleşmeler" : "Arayışlar ve eşleşmeler"}
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">
            Para kazandırabilecek deal flow
          </h2>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200">
          {matches.length} fırsat
        </span>
      </div>
      <div className="mt-4 space-y-3">
        {matches.length ? (
          matches.map((match) => (
            <button
              key={`${match.search.id}-${match.portfolio.id}`}
              type="button"
              onClick={() => onOpenPortfolio(match.portfolio.id)}
              className="w-full rounded-2xl border border-slate-200 bg-stone-50 p-4 text-left transition hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-[#111111] dark:hover:bg-[#161616]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-950 dark:text-slate-100">
                    {match.search.title} → {match.portfolio.title}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    {match.search.consultantName} · {getMatchReason(match.details)}
                  </p>
                  <p className="mt-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                    Sonraki aksiyon: danışmanla portföy uygunluğunu teyit et.
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-slate-950 px-2.5 py-1 text-xs font-semibold text-white dark:bg-white dark:text-slate-950">
                  %{match.score}
                </span>
              </div>
            </button>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
            {demoMode
              ? "Henüz eşleşme yok. İlk arayışı oluşturup portföylerle karşılaştır."
              : "Henüz gerçek eşleşme kaydı yok."}
          </div>
        )}
      </div>
    </div>
  );
}

function DashboardMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="oos-card-muted rounded-3xl p-4">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">
        {value}
      </p>
    </div>
  );
}

function DashboardList({
  title,
  empty,
  items,
  onSelect
}: {
  title: string;
  empty: string;
  items: Array<{ id: number | string; title: string; meta: string; badge: string }>;
  onSelect?: (id: number | string) => void;
}) {
  return (
    <section className="oos-card min-w-0 rounded-3xl p-4">
      <h3 className="text-sm font-semibold text-slate-950 dark:text-slate-100">{title}</h3>
      {items.length ? (
        <div className="mt-3 space-y-2">
          {items.map((item) => {
            const content = (
              <>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-950 dark:text-slate-100">
                    {item.title}
                  </p>
                  <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                    {item.meta}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {item.badge}
                </span>
              </>
            );

            return onSelect ? (
              <button
                key={item.id}
                className="flex w-full items-center justify-between gap-3 rounded-2xl bg-stone-50 px-3 py-3 text-left transition hover:bg-slate-100 dark:bg-white/[0.04] dark:hover:bg-white/[0.07]"
                type="button"
                onClick={() => onSelect(item.id)}
              >
                {content}
              </button>
            ) : (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-2xl bg-stone-50 px-3 py-3 dark:bg-white/[0.04]"
              >
                {content}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="mt-3 rounded-2xl border border-dashed border-slate-200 bg-stone-50 px-3 py-4 text-sm text-slate-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400">
          {empty}
        </p>
      )}
    </section>
  );
}

function SummaryCards({
  deals,
  dealCount,
  realizedCommission
}: {
  deals: Opportunity[];
  dealCount?: number;
  realizedCommission?: number;
}) {
  const totalPortfolioValue = deals.reduce(
    (sum, deal) => sum + Number(deal.value || 0),
    0
  );

  const totalCommission = realizedCommission ?? deals.reduce(
    (sum, deal) => sum + getOpportunityCommission(deal),
    0
  );

  const potentialCommission = deals
    .filter((deal) => deal.stage !== "Kapandı")
    .reduce((sum, deal) => sum + getOpportunityCommission(deal), 0);

  return (
    <section className="mt-5 grid min-w-0 gap-3 sm:mt-6 md:grid-cols-3">
      <div className="oos-card min-w-0 rounded-3xl p-4 sm:p-5">
        <p className="text-sm text-slate-500">Toplam Portföy Değeri</p>
        <p className="mt-2 break-words text-xl font-semibold tracking-tight text-slate-950 dark:text-slate-100 sm:text-2xl">
          {money(totalPortfolioValue)}
        </p>
      </div>

      <div className="oos-card min-w-0 rounded-3xl p-4 sm:p-5">
        <p className="text-sm text-slate-500">Toplam Komisyon</p>
        <p className="mt-2 break-words text-xl font-semibold tracking-tight text-emerald-700 sm:text-2xl">
          {money(totalCommission)}
        </p>
      </div>

      <div className="oos-card min-w-0 rounded-3xl p-4 sm:p-5">
        <p className="text-sm text-slate-500">{dealCount === undefined ? "Potansiyel Komisyon" : "İşlem Kaydı"}</p>
        <p className="mt-2 break-words text-xl font-semibold tracking-tight text-slate-950 dark:text-slate-100 sm:text-2xl">
          {dealCount === undefined ? money(potentialCommission) : dealCount}
        </p>
      </div>
    </section>
  );
}

function getCommissionRowAmount(row: AdvisorCommissionRow) {
  return Number(row.amount ?? row.net_commission ?? row.gross_commission ?? row.commission ?? 0);
}

function buildLineChart(values: number[]) {
  const top = 20;
  const bottom = 170;
  const left = 12;
  const right = 308;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(max - min, 1);
  const points = values.map((value, index) => {
    const progress = values.length === 1 ? 0.5 : index / (values.length - 1);
    return {
      x: left + progress * (right - left),
      y: bottom - ((value - min) / range) * (bottom - top)
    };
  });
  const safePoints = points.length ? points : [{ x: left, y: bottom }];

  if (safePoints.length === 1) {
    const point = safePoints[0];
    const linePath = `M ${point.x} ${point.y} L ${point.x + 0.01} ${point.y}`;

    return {
      linePath,
      areaPath: `${linePath} L ${point.x} ${bottom} Z`,
      lastPoint: point,
      points: safePoints
    };
  }

  const [firstPoint, ...rest] = safePoints;
  const linePath = rest.reduce((path, point, index) => {
    const previous = safePoints[index];
    const midX = (previous.x + point.x) / 2;

    return `${path} C ${midX} ${previous.y}, ${midX} ${point.y}, ${point.x} ${point.y}`;
  }, `M ${firstPoint.x} ${firstPoint.y}`);
  const lastPoint = safePoints[safePoints.length - 1];

  return {
    linePath,
    areaPath: `${linePath} L ${lastPoint.x} ${bottom} L ${firstPoint.x} ${bottom} Z`,
    lastPoint,
    points: safePoints
  };
}

function buildSmoothPathFromPoints(points: { x: number; y: number }[]) {
  if (!points.length) {
    return "";
  }

  if (points.length === 1) {
    const point = points[0];
    return `M ${point.x} ${point.y} L ${point.x + 0.01} ${point.y}`;
  }

  const [firstPoint, ...rest] = points;

  return rest.reduce((path, point, index) => {
    const previous = points[index];
    const midX = (previous.x + point.x) / 2;

    return `${path} C ${midX} ${previous.y}, ${midX} ${point.y}, ${point.x} ${point.y}`;
  }, `M ${firstPoint.x} ${firstPoint.y}`);
}

function AdvisorPerformanceCard({
  currentUser,
  demoMode
}: {
  currentUser: Consultant;
  demoMode: boolean;
}) {
  const [timeframe, setTimeframe] = useState<Timeframe>("1Y");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  if (!demoMode) {
    return (
      <section className="min-w-0 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <p className="text-sm font-semibold tracking-tight text-slate-950">
          Performans Grafiğim
        </p>
        <p className="mt-3 rounded-2xl border border-dashed border-slate-200 bg-stone-50 px-3 py-4 text-sm leading-6 text-slate-500">
          Gerçek performans grafiği için işlem ve komisyon kayıtları bekleniyor.
        </p>
      </section>
    );
  }

  const data =
    advisorPerformance.find((item) => item.advisorId === currentUser.id) ||
    advisorPerformance[0];
  const monthsToShow: Record<Timeframe, number> = {
    "1A": 1,
    "3A": 3,
    "6A": 6,
    "1Y": 12,
    "Tümü": data.monthly.length
  };
  const visibleMonthly = data.monthly.slice(-monthsToShow[timeframe]);
  const totalSalesVolume = data.monthly.reduce(
    (sum, item) => sum + item.salesVolume,
    0
  );
  const totalCommission = data.monthly.reduce(
    (sum, item) => sum + item.commission,
    0
  );
  const firstActiveMonth =
    data.monthly.find((item) => item.salesVolume > 0) || data.monthly[0];
  const lastYearMonth = data.monthly[data.monthly.length - 1];
  const lastVisibleMonth = visibleMonthly[visibleMonthly.length - 1];
  const growth =
    firstActiveMonth?.salesVolume && lastYearMonth?.salesVolume
      ? ((lastYearMonth.salesVolume - firstActiveMonth.salesVolume) /
          firstActiveMonth.salesVolume) *
        100
      : 0;
  const chartValues = visibleMonthly.map((item) => item.salesVolume);
  const chart = buildLineChart(chartValues);
  const chartActiveIndex =
    activeIndex !== null
      ? Math.min(activeIndex, Math.max(chart.points.length - 1, 0))
      : null;
  const activePoint =
    chartActiveIndex !== null ? chart.points[chartActiveIndex] : chart.lastPoint;
  const activeItem =
    chartActiveIndex !== null
      ? visibleMonthly[chartActiveIndex]
      : lastVisibleMonth;
  const activeLinePath =
    chartActiveIndex !== null
      ? buildSmoothPathFromPoints(chart.points.slice(0, chartActiveIndex + 1))
      : chart.linePath;
  const mutedFuturePath =
    chartActiveIndex !== null && chartActiveIndex < chart.points.length - 1
      ? buildSmoothPathFromPoints(chart.points.slice(chartActiveIndex))
      : "";
  const activeLabelAnchor =
    activePoint.x < 72 ? "start" : activePoint.x > 248 ? "end" : "middle";

  function handleChartMove(event: PointerEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const relativeX = event.clientX - rect.left;
    const ratio = Math.min(Math.max(relativeX / rect.width, 0), 1);
    const nextIndex = Math.round(ratio * Math.max(visibleMonthly.length - 1, 0));

    setActiveIndex(nextIndex);
  }

  return (
    <section className="min-w-0 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div>
        <p className="text-sm font-semibold tracking-tight text-slate-950">
          Performans Grafiğim
        </p>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          Takvim yılı içerisindeki satış hacmi ve kazanılan komisyon takibi.
        </p>
      </div>

      <div className="mt-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs text-slate-500">Yıllık Satış Hacmi</p>
            <div className="mt-1 flex flex-wrap items-baseline gap-2">
              <p className="break-words text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                {money(totalSalesVolume)}
              </p>
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                {growth >= 0 ? "+" : ""}
                {growth.toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="sm:text-right">
            <p className="text-xs text-slate-500">Yıllık Kazanılan Komisyon</p>
            <p className="mt-1 break-words text-lg font-semibold tracking-tight text-emerald-700">
              {money(totalCommission)}
            </p>
          </div>
        </div>

        <div className="relative mt-6 min-w-0 overflow-hidden rounded-3xl bg-slate-50 p-3 sm:p-6">
          <svg
            className="h-56 w-full touch-pan-y select-none sm:h-64"
            viewBox="0 0 320 190"
            role="img"
            aria-label="Satış hacmi çizgi grafiği"
            onPointerMove={handleChartMove}
            onPointerLeave={() => setActiveIndex(null)}
          >
            <line
              x1="8"
              x2="312"
              y1="96"
              y2="96"
              stroke="#e2e8f0"
              strokeWidth="1"
            />
            {chartActiveIndex !== null ? (
              <line
                x1={activePoint.x}
                x2={activePoint.x}
                y1="18"
                y2="172"
                stroke="#94a3b8"
                opacity="0.45"
                strokeWidth="1"
              />
            ) : null}
            {mutedFuturePath ? (
              <path
                d={mutedFuturePath}
                fill="none"
                stroke="#94a3b8"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                opacity="0.45"
              />
            ) : null}
            <path
              d={activeLinePath}
              fill="none"
              stroke="#22c55e"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
            <circle
              cx={chart.lastPoint.x}
              cy={chart.lastPoint.y}
              r="3"
              fill="#22c55e"
              stroke="#ffffff"
              strokeWidth="2"
            />
            {chartActiveIndex !== null ? (
              <>
                <circle
                  cx={activePoint.x}
                  cy={activePoint.y}
                  r="4.5"
                  fill="#22c55e"
                />
                <text
                  x={Math.min(Math.max(activePoint.x, 20), 300)}
                  y="16"
                  textAnchor={activeLabelAnchor}
                  className="fill-slate-500 text-[10px] font-medium"
                >
                  {activeItem?.month}
                </text>
                <text
                  x={Math.min(Math.max(activePoint.x, 20), 300)}
                  y="30"
                  textAnchor={activeLabelAnchor}
                  className="fill-slate-950 text-[11px] font-semibold"
                >
                  {activeItem ? money(activeItem.salesVolume) : ""}
                </text>
              </>
            ) : null}
          </svg>

          <div className="mt-3 flex justify-between text-xs text-slate-400">
            <span>{visibleMonthly[0]?.month}</span>
            <span>{lastVisibleMonth?.month}</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-5 gap-1.5 sm:flex sm:flex-wrap sm:gap-2">
          {(["1A", "3A", "6A", "1Y", "Tümü"] as Timeframe[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setTimeframe(item);
                setActiveIndex(null);
              }}
              className={`rounded-full px-2 py-2 text-xs font-medium transition sm:px-3 sm:py-1.5 ${
                timeframe === item
                  ? "bg-indigo-50 text-slate-950 shadow-sm"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function OpportunityCard({
  opportunity,
  active,
  onSelect
}: {
  opportunity: Opportunity;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      className={`w-full rounded-3xl border p-4 text-left transition ${
        active
          ? "border-slate-950 bg-slate-50"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
      type="button"
      onClick={onSelect}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-slate-950">
            {opportunity.title}
          </h3>
          <p className="mt-1 break-words text-sm text-slate-500">
            {opportunity.location} · {opportunity.owner}
          </p>
        </div>
        <span
          className={`w-fit rounded-full border px-3 py-1 text-xs ${
            opportunity.stage === "Kapandı"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-slate-200 text-slate-600"
          }`}
        >
          {opportunity.stage}
        </span>
      </div>
      <div className="mt-4 grid min-w-0 gap-3 text-sm sm:grid-cols-2">
        <Info label="Değer" value={formatCurrency(opportunity.value)} />
        <Info
          label="Komisyon"
          value={formatCurrency(
            getOpportunityCommission(opportunity)
          )}
        />
        <Info label="Sözleşme" value={opportunity.contractType} />
        <Info label="Sonraki hamle" value={opportunity.nextMove} />
        <Info label="Risk" value={opportunity.risk} tone="danger" />
      </div>
    </button>
  );
}

function PropertyPhotoManager({
  disabled,
  loading,
  markingCoverId,
  media,
  message,
  progress,
  onMarkCover,
  onUpload
}: {
  disabled: boolean;
  loading: boolean;
  markingCoverId: string;
  media: PropertyMediaRow[];
  message: string;
  progress: number | null;
  onMarkCover: (mediaId: string) => void;
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  const remaining = Math.max(PROPERTY_PHOTO_LIMIT - media.length, 0);
  const uploadId = "property-photo-upload";
  const isUploading = progress !== null;

  return (
    <div className="mt-6 rounded-3xl border border-slate-200 bg-stone-50 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-950">Portföy Fotoğrafları</p>
          <p className="mt-1 text-xs text-slate-500">
            {media.length}/{PROPERTY_PHOTO_LIMIT} · JPEG, PNG veya WebP · maksimum 10 MB
          </p>
        </div>
        {isUploading ? (
          <div
            className="grid h-12 w-12 place-items-center rounded-full text-xs font-semibold text-slate-950"
            style={{ background: `conic-gradient(#16a34a ${progress * 3.6}deg, #e5e7eb 0deg)` }}
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-stone-50">
              {progress === 100 ? "✓" : `${progress}%`}
            </span>
          </div>
        ) : null}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {media.map((item) => (
          <div key={item.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {item.signed_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.signed_url}
                alt={item.file_name || "Portföy fotoğrafı"}
                className="h-32 w-full object-cover"
              />
            ) : (
              <div className="grid h-32 place-items-center bg-slate-100 text-xs text-slate-500">
                Önizleme hazırlanıyor
              </div>
            )}
            <div className="flex items-center justify-between gap-2 px-3 py-2">
              <span className="truncate text-xs text-slate-500">
                {item.is_cover ? "Kapak" : item.mime_type || "Fotoğraf"}
              </span>
              {!item.is_cover ? (
                <button
                  className="text-xs font-medium text-slate-700 transition hover:text-slate-950 disabled:opacity-50"
                  type="button"
                  disabled={Boolean(markingCoverId)}
                  onClick={() => onMarkCover(item.id)}
                >
                  {markingCoverId === item.id ? "İşleniyor..." : "Kapak yap"}
                </button>
              ) : null}
            </div>
          </div>
        ))}

        <label
          htmlFor={uploadId}
          className={`flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center transition ${
            disabled || remaining === 0 ? "cursor-not-allowed opacity-60" : "hover:border-slate-500"
          }`}
        >
          <span className="grid h-12 w-12 place-items-center rounded-full border border-slate-200 text-xl">↑</span>
          <span className="mt-3 text-sm font-semibold text-slate-950">
            {remaining === 0 ? "Limit doldu" : "Fotoğraf yükle"}
          </span>
          <span className="mt-1 text-xs text-slate-500">
            {loading ? "Fotoğraflar yükleniyor..." : `${remaining} hak kaldı`}
          </span>
          <input
            id={uploadId}
            className="sr-only"
            type="file"
            accept={PROPERTY_PHOTO_MIME_TYPES.join(",")}
            multiple
            disabled={disabled || remaining === 0}
            onChange={onUpload}
          />
        </label>
      </div>

      {message ? (
        <p className={`mt-3 text-sm ${message.includes("yüklendi") || message.includes("güncellendi") ? "text-emerald-700" : "text-amber-700"}`}>
          {message}
        </p>
      ) : null}
    </div>
  );
}

function Info({
  label,
  value,
  tone = "neutral"
}: {
  label: string;
  value: string;
  tone?: "neutral" | "success" | "danger";
}) {
  const requiresVerification = /doğrulama gerekli|doğrulanmalı/i.test(value);
  const isDanger = tone === "danger" || requiresVerification;
  const isSuccess = tone === "success";

  return (
    <div className="min-w-0">
      <p className={`text-xs ${isDanger ? "text-red-600" : "text-slate-400"}`}>
        {label}
      </p>
      <p
        className={`mt-1 break-words text-sm font-medium ${
          isDanger
            ? "text-red-700"
            : isSuccess
              ? "text-emerald-700"
              : "text-slate-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function Field({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-slate-600">{label}</span>
      {children}
    </label>
  );
}
