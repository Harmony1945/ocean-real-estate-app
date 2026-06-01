export const listingTypeOptions = ["Satılık", "Kiralık"] as const;

export const propertyTypeOptions = [
  "Daire",
  "Villa",
  "Müstakil Ev",
  "Rezidans",
  "Arsa",
  "İş Yeri",
  "Bina",
  "Diğer"
] as const;

export const roomCountOptions = ["1+1", "2+1", "3+1", "4+1", "5+1", "6+1", "10 Üzeri"] as const;

export const heatingTypeOptions = [
  "Kombi",
  "Merkezi",
  "Doğalgaz",
  "Klima",
  "Soba",
  "Yerden Isıtma",
  "Yok",
  "Diğer"
] as const;

export const parkingTypeOptions = ["Yok", "Açık Otopark", "Kapalı Otopark", "Açık + Kapalı"] as const;
export const booleanTextOptions = ["Belirtilmedi", "Var", "Yok"] as const;
export const yesNoTextOptions = ["Belirtilmedi", "Evet", "Hayır"] as const;

export const deedStatusOptions = [
  "Kat Mülkiyeti",
  "Kat İrtifakı",
  "Arsa Tapusu",
  "Hisseli Tapu",
  "Belirtilmemiş"
] as const;

export function booleanToText(value?: boolean | null, trueLabel = "Var", falseLabel = "Yok") {
  if (value === true) return trueLabel;
  if (value === false) return falseLabel;
  return "Belirtilmedi";
}

export function textToBoolean(value: string) {
  if (value === "Var" || value === "Evet") return true;
  if (value === "Yok" || value === "Hayır") return false;
  return null;
}

export function formatSquareMeters(value?: number | null) {
  return value ? `${value} m²` : "";
}

export function formatDuesAmount(value?: number | null) {
  if (!value) return "";

  return `${new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(value)} TL`;
}
