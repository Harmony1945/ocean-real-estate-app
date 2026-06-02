export type ParsedPropertyField = {
  value: string;
  source: string;
  confidence: "low" | "medium" | "high";
};

export type ParsedPropertyImport = {
  fields: {
    title?: string;
    city?: string;
    district?: string;
    neighborhood?: string;
    location?: string;
    price?: string;
    currency?: string;
    listingType?: string;
    propertyType?: string;
    usageType?: string;
    roomCount?: string;
    grossArea?: string;
    netArea?: string;
    buildingAge?: string;
    floor?: string;
    totalFloors?: string;
    heatingType?: string;
    bathroomCount?: string;
    balconyCount?: string;
    parkingType?: string;
    hasElevator?: string;
    inSite?: string;
    duesAmount?: string;
    deedStatus?: string;
    exchangeAvailable?: string;
    description?: string;
  };
  metadata: Record<string, ParsedPropertyField>;
  flags: string[];
  extractedFieldCount: number;
  missingCriticalFields: string[];
};

const criticalFields: Array<{ key: keyof ParsedPropertyImport["fields"]; label: string }> = [
  { key: "title", label: "Başlık" },
  { key: "price", label: "Fiyat" },
  { key: "location", label: "Konum" },
  { key: "propertyType", label: "Gayrimenkul tipi" },
  { key: "listingType", label: "İlan tipi" },
  { key: "roomCount", label: "Oda veya m²" }
];

const knownCities = [
  "İstanbul",
  "Ankara",
  "İzmir",
  "Antalya",
  "Muğla",
  "Bursa",
  "Kocaeli",
  "Sakarya",
  "Yalova",
  "Tekirdağ"
];

const propertyTypes = [
  "Rezidans",
  "Müstakil Ev",
  "Villa",
  "Daire",
  "Arsa",
  "İş Yeri",
  "İşyeri",
  "Bina",
  "Diğer"
];

const featurePatterns: Array<[RegExp, string]> = [
  [/deniz\s+manzaras[ıi]/i, "deniz manzarası"],
  [/havuz/i, "havuz"],
  [/bah[çc]e/i, "bahçe"],
  [/g[üu]venlik/i, "güvenlik"],
  [/e[şs]yal[ıi]/i, "eşyalı"],
  [/site\s+i[çc]i|site\s+i[çc]erisinde/i, "site içi"],
  [/asans[öo]r/i, "asansör"],
  [/otopark/i, "otopark"],
  [/teras/i, "teras"],
  [/balkon/i, "balkon"],
  [/\biskan\b|isk[aâ]n/i, "iskan"],
  [/kat\s+m[üu]lkiyeti/i, "kat mülkiyeti"],
  [/kat\s+irtifak[ıi]/i, "kat irtifakı"]
];

function normalizeText(rawText: string) {
  return rawText
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function normalizeNumber(value: string) {
  const compact = value
    .replace(/\s/g, "")
    .replace(/₺|\$|€|tl|try|usd|eur|dolar|euro/gi, "");

  if (/milyon/i.test(value)) {
    const millionValue = Number(compact.replace(/milyon/gi, "").replace(",", "."));
    return Number.isFinite(millionValue) ? String(Math.round(millionValue * 1000000)) : "";
  }

  const normalized = compact
    .replace(/(?<=\d)[.,](?=\d{3}(\D|$))/g, "")
    .replace(",", ".");
  const number = Number(normalized);
  return Number.isFinite(number) ? String(Math.round(number)) : "";
}

function matchField(text: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return { value: match[1].trim(), source: match[0].trim() };
  }

  return null;
}

function detectCurrency(source: string) {
  if (/usd|\$|dolar/i.test(source)) return "USD";
  if (/eur|€|euro/i.test(source)) return "EUR";
  return "TRY";
}

function toYesNo(value?: string | null) {
  if (!value) return undefined;
  if (/var|evet|mevcut|bulunuyor/i.test(value)) return "Var";
  if (/yok|hay[ıi]r|bulunmuyor/i.test(value)) return "Yok";
  return undefined;
}

function addField(
  parsed: ParsedPropertyImport,
  key: keyof ParsedPropertyImport["fields"],
  value: string | undefined,
  source: string,
  confidence: ParsedPropertyField["confidence"] = "medium"
) {
  if (!value) return;
  parsed.fields[key] = value;
  parsed.metadata[key] = { value, source, confidence };
}

export function parsePropertyImportText(rawText: string): ParsedPropertyImport {
  const text = normalizeText(rawText);
  const parsed: ParsedPropertyImport = {
    fields: {},
    metadata: {},
    flags: [],
    extractedFieldCount: 0,
    missingCriticalFields: []
  };

  if (!text) {
    parsed.missingCriticalFields = criticalFields.map((field) => field.label);
    return parsed;
  }

  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
  const firstMeaningfulLine = lines.find((line) =>
    !/^(fiyat|br[üu]t|net|oda|bina|bulundu|kat|isitma|ısıtma|banyo|balkon|aidat|tapu|takas|otopark|asans[öo]r|site)/i.test(line)
  );

  addField(parsed, "title", firstMeaningfulLine?.slice(0, 90), firstMeaningfulLine || "", "medium");

  const priceMatch = text.match(/(?:fiyat\s*[:\-]?\s*)?((?:\d{1,3}(?:[.,]\d{3})+|\d+(?:[.,]\d+)?)(?:\s*milyon)?\s*(?:tl|try|₺|usd|\$|dolar|eur|€|euro)?)/i);
  if (priceMatch?.[1] && /tl|try|₺|usd|\$|dolar|eur|€|euro|milyon|\d{5,}/i.test(priceMatch[1])) {
    addField(parsed, "price", normalizeNumber(priceMatch[1]), priceMatch[0], "high");
    addField(parsed, "currency", detectCurrency(priceMatch[1]), priceMatch[0], "high");
  }

  const listingType = /kiral[ıi]k|kira/i.test(text)
    ? "Kiralık"
    : /sat[ıi]l[ıi]k|sat[ıi][şs]/i.test(text)
      ? "Satılık"
      : undefined;
  addField(parsed, "listingType", listingType, listingType || "", listingType ? "high" : "low");

  const propertyType = propertyTypes.find((type) => new RegExp(type.replace("İ", "[İIıi]"), "i").test(text));
  addField(parsed, "propertyType", propertyType === "İşyeri" ? "İş Yeri" : propertyType, propertyType || "", propertyType ? "high" : "low");

  const room = text.match(/\b(\d+\s*\+\s*\d+)\b/);
  addField(parsed, "roomCount", room?.[1]?.replace(/\s/g, ""), room?.[0] || "", "high");

  const gross = matchField(text, [
    /br[üu]t\s*[:\-]?\s*(\d+(?:[.,]\d+)?)\s*m(?:²|2)?/i,
    /(\d+(?:[.,]\d+)?)\s*m(?:²|2)?\s*br[üu]t/i
  ]);
  addField(parsed, "grossArea", gross ? normalizeNumber(gross.value) : undefined, gross?.source || "", "high");

  const net = matchField(text, [
    /net\s*[:\-]?\s*(\d+(?:[.,]\d+)?)\s*m(?:²|2)?/i,
    /(\d+(?:[.,]\d+)?)\s*m(?:²|2)?\s*net/i
  ]);
  addField(parsed, "netArea", net ? normalizeNumber(net.value) : undefined, net?.source || "", "high");

  if (!parsed.fields.grossArea && !parsed.fields.netArea) {
    const area = text.match(/\b(\d{2,4})\s*m(?:²|2)?\b/i);
    addField(parsed, "grossArea", area?.[1], area?.[0] || "", area ? "medium" : "low");
  }

  const city = knownCities.find((item) => new RegExp(`\\b${item}\\b`, "i").test(text));
  const locationLine = lines.find((line) => /ilçe|ilce|mahalle|konum|lokasyon|istanbul|ankara|izmir|antalya|muğla|bursa/i.test(line));
  const locationParts = (locationLine || "")
    .replace(/konum|lokasyon|ilçe|ilce|mahalle|:/gi, "")
    .split(/[\/,>-]/)
    .map((part) => part.trim())
    .filter(Boolean);
  const cleanedParts = locationParts.filter((part) => !/sat[ıi]l[ıi]k|kiral[ıi]k|fiyat/i.test(part));
  const cityValue = city || cleanedParts[0];
  const districtValue = city ? cleanedParts.find((part) => part.toLocaleLowerCase("tr-TR") !== city.toLocaleLowerCase("tr-TR")) : cleanedParts[1];
  const neighborhoodValue = cleanedParts.find((part) => part !== cityValue && part !== districtValue && /mah|mahalle/i.test(part)) || cleanedParts[2];
  const location = [cityValue, districtValue, neighborhoodValue].filter(Boolean).join(" / ");

  addField(parsed, "city", cityValue, locationLine || cityValue || "", cityValue ? "medium" : "low");
  addField(parsed, "district", districtValue, locationLine || districtValue || "", districtValue ? "medium" : "low");
  addField(parsed, "neighborhood", neighborhoodValue, locationLine || neighborhoodValue || "", neighborhoodValue ? "low" : "low");
  addField(parsed, "location", location, locationLine || location, location ? "medium" : "low");

  const keyedFields: Array<[keyof ParsedPropertyImport["fields"], RegExp[], ParsedPropertyField["confidence"]]> = [
    ["buildingAge", [/bina\s*ya[şs][ıi]\s*[:\-]?\s*([^\n]+)/i], "high"],
    ["floor", [/bulundu[ğg]u\s*kat\s*[:\-]?\s*([^\n]+)/i], "high"],
    ["totalFloors", [/kat\s*say[ıi]s[ıi]\s*[:\-]?\s*([^\n]+)/i], "high"],
    ["heatingType", [/(?:[ıi]s[ıi]tma|isitma)\s*[:\-]?\s*([^\n]+)/i], "high"],
    ["bathroomCount", [/banyo\s*say[ıi]s[ıi]\s*[:\-]?\s*(\d+)/i], "high"],
    ["balconyCount", [/balkon\s*say[ıi]s[ıi]\s*[:\-]?\s*(\d+)/i], "high"],
    ["parkingType", [/otopark\s*[:\-]?\s*([^\n]+)/i], "high"],
    ["duesAmount", [/aidat\s*[:\-]?\s*([^\n]+)/i], "high"],
    ["deedStatus", [/tapu\s*durumu\s*[:\-]?\s*([^\n]+)/i], "high"]
  ];

  keyedFields.forEach(([key, patterns, confidence]) => {
    const result = matchField(text, patterns);
    const value = key === "duesAmount" && result ? normalizeNumber(result.value) : result?.value;
    addField(parsed, key, value, result?.source || "", confidence);
  });

  const elevator = matchField(text, [/asans[öo]r\s*[:\-]?\s*([^\n]+)/i]);
  addField(parsed, "hasElevator", toYesNo(elevator?.value) || (/asans[öo]r/i.test(text) ? "Var" : undefined), elevator?.source || "asansör", "medium");

  const site = matchField(text, [/site\s+i[çc](?:erisinde|i)?\s*[:\-]?\s*([^\n]+)/i]);
  addField(parsed, "inSite", toYesNo(site?.value) || (/site\s+i[çc]i/i.test(text) ? "Evet" : undefined), site?.source || "site içi", "medium");

  const exchange = matchField(text, [/takas\s*[:\-]?\s*([^\n]+)/i]);
  addField(parsed, "exchangeAvailable", toYesNo(exchange?.value), exchange?.source || "", "high");

  parsed.flags = featurePatterns
    .filter(([pattern]) => pattern.test(text))
    .map(([, label]) => label);

  const descriptionParts = [
    parsed.fields.title,
    parsed.fields.location,
    parsed.fields.propertyType,
    parsed.fields.roomCount ? `${parsed.fields.roomCount} oda` : "",
    parsed.fields.grossArea ? `Brüt ${parsed.fields.grossArea} m²` : "",
    parsed.fields.netArea ? `Net ${parsed.fields.netArea} m²` : "",
    parsed.flags.length ? `Öne çıkan özellikler: ${parsed.flags.join(", ")}.` : ""
  ].filter(Boolean);
  addField(parsed, "description", descriptionParts.join("\n"), "extracted_summary", "medium");

  parsed.extractedFieldCount = Object.values(parsed.fields).filter(Boolean).length;
  parsed.missingCriticalFields = criticalFields
    .filter((field) => {
      if (field.key === "roomCount") return !parsed.fields.roomCount && !parsed.fields.grossArea && !parsed.fields.netArea;
      return !parsed.fields[field.key];
    })
    .map((field) => field.label);

  return parsed;
}
