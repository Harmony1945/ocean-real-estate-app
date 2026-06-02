import { calculateCommission, getDefaultRevenueRule } from "@/lib/oos/revenue-rules";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const sessionStorageKey = "ocean-supabase-session";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export type SupabaseAuthUser = {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
};

export type SupabaseSession = {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  user: SupabaseAuthUser;
};

export type AdvisorProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: "admin" | "advisor" | "portfolio_owner" | "viewer" | string;
  phone: string | null;
  company: string | null;
  avatar_url: string | null;
  created_at?: string;
  updated_at?: string;
};

export type AdvisorRow = {
  id: string;
  profile_id: string | null;
  advisor_code: string | null;
  model: string | null;
  title: string | null;
  city: string | null;
  district: string | null;
  commission_cap_amount: number | null;
  commission_cap_currency: string | null;
  joined_at?: string | null;
  profile?: Pick<AdvisorProfile, "id" | "full_name" | "email" | "role" | "phone"> | null;
};

export type AdvisorPortfolioRow = {
  id: string;
  owner_user_id: string;
  title: string;
  location: string | null;
  district: string | null;
  owner: string | null;
  value: number | null;
  stage: string | null;
  contract_type: string | null;
  next_move: string | null;
  risk: string | null;
  commission_rate: number | null;
  commission: number | null;
  listing_id: string | null;
  property_type: string | null;
  area: string | null;
  rooms: string | null;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at?: string;
  updated_at?: string;
};

export type AdvisorSearchRequestRow = {
  id: string;
  owner_user_id?: string;
  advisor_id?: string | null;
  request_type?: string | null;
  city?: string | null;
  districts?: string[] | string | null;
  property_types?: string[] | string | null;
  title?: string | null;
  location?: string | null;
  property_type?: string | null;
  min_price: number | null;
  max_price: number | null;
  currency: string | null;
  min_bedrooms: number | null;
  min_area: number | null;
  max_area: number | null;
  rooms: string | null;
  purpose: string | null;
  urgency: string | null;
  notes: string | null;
  status: string | null;
  created_at?: string;
  updated_at?: string;
};

export type AdvisorPropertyRow = {
  id: string;
  advisor_id: string | null;
  title: string;
  description?: string | null;
  address_text?: string | null;
  listing_type?: string | null;
  property_type: string | null;
  usage_type: string | null;
  city: string | null;
  district: string | null;
  neighborhood: string | null;
  gross_area: number | null;
  net_area: number | null;
  room_count?: string | null;
  building_age?: string | null;
  floor?: string | null;
  total_floors?: string | null;
  heating_type?: string | null;
  bathroom_count?: string | null;
  balcony_count?: string | null;
  parking_type?: string | null;
  has_elevator?: boolean | null;
  in_site?: boolean | null;
  dues_amount?: number | null;
  deed_status?: string | null;
  exchange_available?: boolean | null;
  latitude?: number | null;
  longitude?: number | null;
  asking_price: number | null;
  currency: string | null;
  status: string | null;
  is_public: boolean | null;
  created_at?: string;
  updated_at?: string;
};

export type PropertyInput = Partial<Omit<AdvisorPropertyRow, "id" | "created_at" | "updated_at">> & {
  title: string;
};

export type AdvisorTaskRow = {
  id: string;
  owner_user_id: string;
  portfolio_id: string | null;
  title: string;
  done: boolean;
  created_at?: string;
  updated_at?: string;
};

export type AdvisorMatchRow = {
  id: string;
  property_id?: string | null;
  portfolio_id?: string | null;
  search_request_id?: string | null;
  property?: AdvisorPropertyRow | null;
  portfolio?: AdvisorPortfolioRow | null;
  search_request?: AdvisorSearchRequestRow | null;
  score?: number | null;
  match_score?: number | null;
  status?: string | null;
  created_at?: string;
  [key: string]: unknown;
};

export type AdvisorDealRow = {
  id: string;
  title?: string | null;
  status?: string | null;
  stage?: string | null;
  value?: number | null;
  amount?: number | null;
  created_at?: string;
  [key: string]: unknown;
};

export type AdvisorCommissionRow = {
  id: string;
  deal_id?: string | null;
  amount?: number | null;
  commission?: number | null;
  gross_commission?: number | null;
  net_commission?: number | null;
  status?: string | null;
  created_at?: string;
  [key: string]: unknown;
};

export type PropertyMediaRow = {
  id: string;
  property_id: string;
  storage_bucket: string;
  storage_path: string;
  display_storage_path: string | null;
  original_storage_path: string | null;
  file_name: string | null;
  file_size: number | null;
  mime_type: string | null;
  sort_order: number | null;
  is_cover: boolean | null;
  visibility: "public" | "internal" | "restricted" | "private" | string;
  uploaded_by: string | null;
  created_at?: string;
  updated_at?: string;
  signed_url?: string;
};

export type PropertySharePayload = {
  title: string;
  price: number | null;
  currency: string | null;
  city: string | null;
  district: string | null;
  neighborhood: string | null;
  property_type: string | null;
  usage_type: string | null;
  listing_type?: string | null;
  room_count?: string | null;
  gross_area: number | null;
  net_area: number | null;
  building_age?: string | null;
  floor?: string | null;
  total_floors?: string | null;
  heating_type?: string | null;
  bathroom_count?: string | null;
  balcony_count?: string | null;
  parking_type?: string | null;
  has_elevator?: boolean | null;
  in_site?: boolean | null;
  dues_amount?: number | null;
  deed_status?: string | null;
  exchange_available?: boolean | null;
  status: string | null;
  photo_count: number;
  advisor_name?: string | null;
  advisor_title?: string | null;
  advisor_phone?: string | null;
  advisor_email?: string | null;
};

export type PropertyShareLinkRow = {
  id: string;
  property_id: string;
  token: string;
  created_by: string | null;
  public_payload: PropertySharePayload;
  is_active: boolean;
  created_at?: string;
  disabled_at?: string | null;
  expires_at?: string | null;
};

export type AdvisorApplicationRow = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  city: string | null;
  district: string | null;
  experience_level: string | null;
  current_company: string | null;
  preferred_model: "ocean_elite" | "ocean_core" | string;
  motivation: string | null;
  contract_accepted: boolean;
  red_lines_accepted: boolean;
  commission_model_accepted: boolean;
  kvkk_accepted: boolean;
  status: "new" | "in_review" | "approved" | "rejected" | string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_note: string | null;
  linked_profile_id?: string | null;
  linked_advisor_id?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type AdvisorApplicationInput = Pick<
  AdvisorApplicationRow,
  | "full_name"
  | "email"
  | "phone"
  | "city"
  | "district"
  | "experience_level"
  | "current_company"
  | "preferred_model"
  | "motivation"
  | "contract_accepted"
  | "red_lines_accepted"
  | "commission_model_accepted"
  | "kvkk_accepted"
>;

export type ActivityLogRow = {
  id: string;
  actor_profile_id: string | null;
  actor_advisor_id: string | null;
  actor_email: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  entity_title: string | null;
  status: string;
  summary: string | null;
  metadata: Record<string, unknown>;
  created_at?: string;
};

export type ActivityLogInput = {
  action: string;
  entity_type: string;
  entity_id?: string | null;
  entity_title?: string | null;
  status?: string;
  summary?: string | null;
  metadata?: Record<string, unknown>;
  actor_email?: string | null;
};

export type NotificationPriority = "low" | "normal" | "high" | "urgent" | string;
export type NotificationStatus = "unread" | "read" | string;

export type NotificationRow = {
  id: string;
  recipient_profile_id: string | null;
  recipient_advisor_id: string | null;
  actor_profile_id: string | null;
  actor_advisor_id: string | null;
  type: string;
  title: string;
  body: string | null;
  entity_type: string | null;
  entity_id: string | null;
  entity_title: string | null;
  priority: NotificationPriority;
  status: NotificationStatus;
  action_url: string | null;
  metadata: Record<string, unknown>;
  read_at: string | null;
  created_at?: string;
};

export type NotificationInput = {
  recipient_profile_id?: string | null;
  recipient_advisor_id?: string | null;
  type: string;
  title: string;
  body?: string | null;
  entity_type?: string | null;
  entity_id?: string | null;
  entity_title?: string | null;
  priority?: NotificationPriority;
  action_url?: string | null;
  metadata?: Record<string, unknown>;
};

export type CommissionRuleRow = {
  id: string;
  name: string;
  model: string;
  advisor_percentage: number;
  office_percentage: number;
  referral_percentage: number | null;
  cap_enabled: boolean;
  annual_cap_usd: number | null;
  post_cap_own_office_percentage: number | null;
  post_cap_office_generated_percentage: number | null;
  is_active: boolean;
  metadata: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
};

export type RevenueTransactionStatus =
  | "draft"
  | "active"
  | "pending_collection"
  | "collected"
  | "paid_out"
  | "cancelled"
  | string;

export type RevenueTransactionRow = {
  id: string;
  property_id: string | null;
  advisor_id: string | null;
  title: string;
  transaction_type: string;
  status: RevenueTransactionStatus;
  transaction_amount: number;
  currency: string;
  commission_rate: number;
  gross_commission: number;
  advisor_model: string;
  source_type: string | null;
  close_date: string | null;
  notes: string | null;
  created_by: string | null;
  created_at?: string;
  updated_at?: string;
  property?: Pick<AdvisorPropertyRow, "id" | "title" | "city" | "district"> | null;
  advisor?: AdvisorRow | null;
  commission_splits?: CommissionSplitRow[];
};

export type CommissionSplitRow = {
  id: string;
  transaction_id: string;
  advisor_id: string | null;
  split_type: string;
  percentage: number | null;
  amount: number;
  currency: string;
  description: string | null;
  created_at?: string;
};

export type AdvisorCapProgressRow = {
  id: string;
  advisor_id: string;
  year: number;
  cap_currency: string;
  cap_target: number;
  accumulated_office_share_usd: number;
  cap_reached: boolean;
  cap_reached_at: string | null;
  updated_at?: string;
};

export type PaymentRecordRow = {
  id: string;
  transaction_id: string;
  amount: number;
  currency: string;
  payment_type: string;
  status: string;
  paid_at: string | null;
  notes: string | null;
  created_at?: string;
};

export type RevenueTransactionInput = {
  property_id?: string | null;
  advisor_id: string;
  title: string;
  transaction_type: string;
  status: RevenueTransactionStatus;
  transaction_amount: number;
  currency: string;
  commission_rate: number;
  advisor_model: string;
  source_type?: string | null;
  close_date?: string | null;
  notes?: string | null;
  referral_advisor_id?: string | null;
  has_referral?: boolean;
  cap_reached?: boolean;
};

export type PortfolioInput = Partial<Omit<AdvisorPortfolioRow, "id" | "owner_user_id" | "created_at" | "updated_at">> & {
  title: string;
};

export type SearchRequestInput = Partial<Omit<AdvisorSearchRequestRow, "id" | "owner_user_id" | "created_at" | "updated_at">> & {
  title: string;
};

export type TaskInput = Partial<Omit<AdvisorTaskRow, "id" | "owner_user_id" | "created_at" | "updated_at">> & {
  title: string;
};

type AuthResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  user?: SupabaseAuthUser;
  error?: string;
  error_description?: string;
  msg?: string;
  message?: string;
};

export const PROPERTY_IMAGE_BUCKET = "property-images";
export const PROPERTY_PHOTO_LIMIT = 12;
export const PROPERTY_PHOTO_MAX_SIZE = 10 * 1024 * 1024;
export const PROPERTY_PHOTO_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

function authError(data: AuthResponse, fallback: string) {
  return data.error_description || data.message || data.msg || data.error || fallback;
}

function dataError(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  if (
    message.includes("relation") ||
    message.includes("schema cache") ||
    message.includes("does not exist") ||
    message.includes("PGRST")
  ) {
    return "Veritabanı tabloları bekleniyor. Supabase migration uygulanmalı.";
  }

  return message || "Supabase veri işlemi tamamlanamadı.";
}

export function getShareLinkSetupMessage(errorMessage = "") {
  const normalized = errorMessage.toLocaleLowerCase("tr-TR");
  if (
    normalized.includes("property_share_links") ||
    normalized.includes("get_public_property_share") ||
    normalized.includes("schema cache") ||
    normalized.includes("relation") ||
    normalized.includes("function") ||
    normalized.includes("pgrst")
  ) {
    return "Paylaşım altyapısı henüz etkin değil. Migration uygulanmalı.";
  }

  if (
    normalized.includes("row-level") ||
    normalized.includes("permission") ||
    normalized.includes("not authorized") ||
    normalized.includes("violates row-level security")
  ) {
    return "Bu portföy için paylaşım linki oluşturma yetkiniz yok.";
  }

  return errorMessage || "Paylaşım linki işlemi tamamlanamadı.";
}

export function getDataSetupMessage(errorMessage = "", options: { optional?: boolean } = {}) {
  if (!isSupabaseConfigured) {
    return "Supabase bağlantısı bekleniyor. Demo verilerle devam ediyorsunuz.";
  }

  if (errorMessage.includes("migration") || errorMessage.includes("tablo")) {
    if (options.optional) {
      return "Bazı gelişmiş tablolar henüz etkin değil. Temel veriler kullanılabilir.";
    }

    return "Veritabanı tabloları bekleniyor. Supabase migration uygulanmalı.";
  }

  return errorMessage;
}

function saveSession(session: SupabaseSession | null) {
  if (typeof window === "undefined") return;

  if (!session) {
    window.localStorage.removeItem(sessionStorageKey);
    return;
  }

  window.localStorage.setItem(sessionStorageKey, JSON.stringify(session));
}

function readStoredSession() {
  if (typeof window === "undefined") return null;

  try {
    const stored = window.localStorage.getItem(sessionStorageKey);
    return stored ? (JSON.parse(stored) as SupabaseSession) : null;
  } catch {
    window.localStorage.removeItem(sessionStorageKey);
    return null;
  }
}

function normalizeSession(data: AuthResponse): SupabaseSession | null {
  if (!data.access_token || !data.user) return null;

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_in
      ? Math.floor(Date.now() / 1000) + Number(data.expires_in)
      : undefined,
    user: data.user
  };
}

async function request<T>(path: string, options: RequestInit & { token?: string } = {}) {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase ortam değişkenleri eksik.");
  }

  const headers = new Headers(options.headers);
  headers.set("apikey", supabaseAnonKey);

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const response = await fetch(`${supabaseUrl}${path}`, {
    ...options,
    headers
  });
  const data = (await response.json().catch(() => ({}))) as T & AuthResponse;

  if (!response.ok) {
    throw new Error(authError(data, "Supabase işlemi tamamlanamadı."));
  }

  return data as T;
}

function encodeStoragePath(path: string) {
  return path.split("/").map(encodeURIComponent).join("/");
}

function getImageExtension(file: File) {
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

function createShareToken() {
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const bytes = new Uint8Array(24);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 18)}`;
}

function isUuid(value?: string | null) {
  return Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));
}

function sanitizeActivityMetadata(metadata: ActivityLogInput["metadata"] = {}) {
  const blockedKeyPattern = /(token|signed|secret|key|url|path|private|note)/i;
  const safeMetadata: Record<string, unknown> = {};

  Object.entries(metadata).forEach(([key, value]) => {
    if (blockedKeyPattern.test(key)) return;
    if (
      value === null ||
      ["string", "number", "boolean"].includes(typeof value) ||
      (Array.isArray(value) && value.every((item) => ["string", "number", "boolean"].includes(typeof item)))
    ) {
      safeMetadata[key] = value;
    }
  });

  return safeMetadata;
}

function sanitizeNotificationMetadata(metadata: NotificationInput["metadata"] = {}) {
  return sanitizeActivityMetadata(metadata);
}

function loadImageElement(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Fotoğraf watermark işlemi tamamlanamadı."));
    image.src = src;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality = 0.88) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }

      reject(new Error("Fotoğraf watermark işlemi tamamlanamadı."));
    }, type, quality);
  });
}

async function addOceanWatermark(file: File) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("Watermark işlenemedi. Lütfen tekrar deneyin.");
  }

  const sourceUrl = URL.createObjectURL(file);

  try {
    const [sourceImage, watermarkImage] = await Promise.all([
      loadImageElement(sourceUrl),
      loadImageElement("/assets/brand/ocean-watermark.png")
    ]);
    const maxDimension = 2200;
    const scale = Math.min(1, maxDimension / Math.max(sourceImage.naturalWidth, sourceImage.naturalHeight));
    const width = Math.max(1, Math.round(sourceImage.naturalWidth * scale));
    const height = Math.max(1, Math.round(sourceImage.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Fotoğraf watermark işlemi tamamlanamadı.");

    canvas.width = width;
    canvas.height = height;
    context.drawImage(sourceImage, 0, 0, width, height);

    const watermarkAspect = watermarkImage.naturalWidth / watermarkImage.naturalHeight || 1;
    const watermarkWidth = Math.min(
      Math.max(width * 0.72, 280),
      width * 0.92,
      height * 0.72 * watermarkAspect,
      1400
    );
    const watermarkHeight = watermarkWidth * (watermarkImage.naturalHeight / watermarkImage.naturalWidth);
    const bottomMargin = Math.max(height * 0.045, 28);
    const watermarkX = (width - watermarkWidth) / 2;
    const watermarkY = height - watermarkHeight - bottomMargin;
    context.save();
    context.globalAlpha = 0.76;
    context.drawImage(
      watermarkImage,
      watermarkX,
      watermarkY,
      watermarkWidth,
      watermarkHeight
    );
    context.restore();

    const blob = await canvasToBlob(canvas, file.type || "image/jpeg");
    return new File([blob], file.name, {
      type: blob.type || file.type,
      lastModified: Date.now()
    });
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}

async function preparePropertyPhotoForUpload(file: File) {
  try {
    return await addOceanWatermark(file);
  } catch (error) {
    console.warn("Ocean watermark could not be applied.", error);
    throw new Error("Watermark işlenemedi. Lütfen tekrar deneyin.");
  }
}

function uploadStorageObject(path: string, file: File, token: string, onProgress?: (progress: number) => void, upsert = false) {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase ortam değişkenleri eksik.");
  }

  return new Promise<void>((resolve, reject) => {
    const uploadRequest = new XMLHttpRequest();
    uploadRequest.open("POST", `${supabaseUrl}/storage/v1/object/${PROPERTY_IMAGE_BUCKET}/${encodeStoragePath(path)}`);
    uploadRequest.setRequestHeader("apikey", supabaseAnonKey);
    uploadRequest.setRequestHeader("Authorization", `Bearer ${token}`);
    uploadRequest.setRequestHeader("Content-Type", file.type);
    uploadRequest.setRequestHeader("x-upsert", upsert ? "true" : "false");

    uploadRequest.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    uploadRequest.onload = () => {
      if (uploadRequest.status >= 200 && uploadRequest.status < 300) {
        resolve();
        return;
      }

      reject(new Error("Fotoğraf yüklenemedi."));
    };
    uploadRequest.onerror = () => reject(new Error("Fotoğraf yüklenemedi."));
    uploadRequest.send(file);
  });
}

async function deleteStorageObjects(paths: string[], token: string) {
  if (!paths.length) return;

  await request(`/storage/v1/object/${PROPERTY_IMAGE_BUCKET}`, {
    method: "DELETE",
    token,
    body: JSON.stringify({ prefixes: paths })
  });
}

export function createSupabaseAuthClient(): any {
  if (!isSupabaseConfigured || !supabaseUrl) return null;

  async function refreshSession(refreshToken: string) {
    const data = await request<AuthResponse>("/auth/v1/token?grant_type=refresh_token", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken })
    });
    const session = normalizeSession(data);
    if (!session) throw new Error("Oturum yenilenemedi.");
    saveSession(session);
    return session;
  }

  async function getUser(accessToken: string) {
    return request<SupabaseAuthUser>("/auth/v1/user", {
      method: "GET",
      token: accessToken
    });
  }

  function getAccessToken() {
    return readStoredSession()?.access_token || "";
  }

  async function logActivity(input: ActivityLogInput) {
    try {
      const token = getAccessToken();
      const row = await request<ActivityLogRow[] | ActivityLogRow>("/rest/v1/rpc/log_activity", {
        method: "POST",
        token,
        body: JSON.stringify({
          input_action: input.action,
          input_entity_type: input.entity_type,
          input_entity_id: isUuid(input.entity_id) ? input.entity_id : null,
          input_entity_title: input.entity_title ?? null,
          input_status: input.status || "success",
          input_summary: input.summary ?? null,
          input_metadata: sanitizeActivityMetadata(input.metadata),
          input_actor_email: input.actor_email ?? null
        })
      });

      return Array.isArray(row) ? row[0] ?? null : row;
    } catch (error) {
      console.warn("Activity log failed.", error);
      return null;
    }
  }

  async function createNotification(input: NotificationInput) {
    try {
      const token = getAccessToken();
      const row = await request<NotificationRow[] | NotificationRow>("/rest/v1/rpc/create_notification", {
        method: "POST",
        token,
        body: JSON.stringify({
          input_recipient_profile_id: input.recipient_profile_id ?? null,
          input_recipient_advisor_id: input.recipient_advisor_id ?? null,
          input_type: input.type,
          input_title: input.title,
          input_body: input.body ?? null,
          input_entity_type: input.entity_type ?? null,
          input_entity_id: isUuid(input.entity_id) ? input.entity_id : null,
          input_entity_title: input.entity_title ?? null,
          input_priority: input.priority || "normal",
          input_action_url: input.action_url ?? null,
          input_metadata: sanitizeNotificationMetadata(input.metadata)
        })
      });

      return Array.isArray(row) ? row[0] ?? null : row;
    } catch (error) {
      console.warn("Notification creation failed.", error);
      return null;
    }
  }

  async function createNotifications(inputs: NotificationInput[]) {
    return Promise.all(inputs.map((input) => createNotification(input)));
  }

  async function getActivityLogs() {
    const token = getAccessToken();
    if (!token) return [];

    try {
      return await request<ActivityLogRow[]>(
        "/rest/v1/activity_logs?select=*&order=created_at.desc&limit=100",
        { method: "GET", token }
      );
    } catch (error) {
      throw new Error(dataError(error));
    }
  }

  async function fetchNotifications() {
    const token = getAccessToken();
    if (!token) return [];

    try {
      return await request<NotificationRow[]>(
        "/rest/v1/notifications?select=*&order=created_at.desc&limit=100",
        { method: "GET", token }
      );
    } catch (error) {
      throw new Error(dataError(error));
    }
  }

  async function markNotificationRead(id: string) {
    const token = getAccessToken();
    if (!token) throw new Error("Oturum bulunamadı.");

    try {
      const row = await request<NotificationRow[] | NotificationRow>("/rest/v1/rpc/mark_notification_read", {
        method: "POST",
        token,
        body: JSON.stringify({ input_notification_id: id })
      });

      return Array.isArray(row) ? row[0] ?? null : row;
    } catch (error) {
      throw new Error(dataError(error));
    }
  }

  async function markAllNotificationsRead() {
    const token = getAccessToken();
    if (!token) throw new Error("Oturum bulunamadı.");

    try {
      return await request<number>("/rest/v1/rpc/mark_all_notifications_read", {
        method: "POST",
        token,
        body: JSON.stringify({})
      });
    } catch (error) {
      throw new Error(dataError(error));
    }
  }

  async function getUnreadNotificationCount() {
    const token = getAccessToken();
    if (!token) return 0;

    try {
      const rows = await request<Array<{ id: string }>>(
        "/rest/v1/notifications?status=eq.unread&select=id&limit=1000",
        { method: "GET", token }
      );

      return rows.length;
    } catch {
      return 0;
    }
  }

  async function getProfile(userId: string) {
    const token = getAccessToken();
    if (!token) return null;

    const rows = await request<AdvisorProfile[]>(
      `/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=id,full_name,email,role,phone,company,avatar_url,created_at,updated_at&limit=1`,
      {
        method: "GET",
        token
      }
    );

    return rows[0] ?? null;
  }

  async function saveProfile(
    user: SupabaseAuthUser,
    profile: { fullName: string; phone: string; company: string }
  ) {
    const token = getAccessToken();
    if (!token) throw new Error("Oturum bulunamadı.");

    const rows = await request<AdvisorProfile[]>("/rest/v1/profiles?on_conflict=id", {
      method: "POST",
      token,
      headers: {
        Prefer: "resolution=merge-duplicates,return=representation"
      },
      body: JSON.stringify({
        id: user.id,
        email: user.email,
        full_name: profile.fullName.trim(),
        phone: profile.phone.trim(),
        company: profile.company.trim()
      })
    });

    return rows[0] ?? null;
  }

  async function getPortfolios() {
    const token = getAccessToken();
    if (!token) return [];

    try {
      return await request<AdvisorPortfolioRow[]>(
        "/rest/v1/portfolios?select=*&order=created_at.desc",
        { method: "GET", token }
      );
    } catch (error) {
      throw new Error(dataError(error));
    }
  }

  async function createPortfolio(portfolio: PortfolioInput) {
    const stored = readStoredSession();
    if (!stored?.access_token) throw new Error("Oturum bulunamadı.");

    try {
      const rows = await request<AdvisorPortfolioRow[]>("/rest/v1/portfolios", {
        method: "POST",
        token: stored.access_token,
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({ ...portfolio, owner_user_id: stored.user.id })
      });

      return rows[0] ?? null;
    } catch (error) {
      throw new Error(dataError(error));
    }
  }

  async function updatePortfolio(id: string, portfolio: Partial<PortfolioInput>) {
    const token = getAccessToken();
    if (!token) throw new Error("Oturum bulunamadı.");

    try {
      const rows = await request<AdvisorPortfolioRow[]>(
        `/rest/v1/portfolios?id=eq.${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          token,
          headers: { Prefer: "return=representation" },
          body: JSON.stringify({ ...portfolio, updated_at: new Date().toISOString() })
        }
      );

      return rows[0] ?? null;
    } catch (error) {
      throw new Error(dataError(error));
    }
  }

  async function deletePortfolio(id: string) {
    const token = getAccessToken();
    if (!token) throw new Error("Oturum bulunamadı.");

    try {
      await request(`/rest/v1/portfolios?id=eq.${encodeURIComponent(id)}`, {
        method: "DELETE",
        token
      });
    } catch (error) {
      throw new Error(dataError(error));
    }
  }

  async function getSearchRequests() {
    const token = getAccessToken();
    if (!token) return [];

    try {
      return await request<AdvisorSearchRequestRow[]>(
        "/rest/v1/search_requests?select=*&order=created_at.desc",
        { method: "GET", token }
      );
    } catch (error) {
      throw new Error(dataError(error));
    }
  }

  async function createSearchRequest(searchRequest: SearchRequestInput) {
    const stored = readStoredSession();
    if (!stored?.access_token) throw new Error("Oturum bulunamadı.");

    try {
      const rows = await request<AdvisorSearchRequestRow[]>("/rest/v1/search_requests", {
        method: "POST",
        token: stored.access_token,
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({ ...searchRequest, owner_user_id: stored.user.id })
      });

      const row = rows[0] ?? null;
      if (row) {
        void logActivity({
          action: "search_request_created",
          entity_type: "search_request",
          entity_id: row.id,
          entity_title: row.title || row.request_type || "Arayış",
          summary: "Arayış oluşturuldu.",
          metadata: {
            request_type: row.request_type || row.purpose,
            status: row.status,
            urgency: row.urgency
          }
        });
        void createNotification({
          type: "search_request_created",
          title: "Yeni arayış oluşturuldu",
          body: row.title || row.request_type || row.purpose || "Yeni müşteri arayışı kaydedildi.",
          entity_type: "search_request",
          entity_id: row.id,
          entity_title: row.title || row.request_type || "Arayış",
          priority: row.urgency === "high" ? "high" : "normal",
          action_url: "/requests",
          metadata: {
            request_type: row.request_type || row.purpose,
            status: row.status,
            urgency: row.urgency
          }
        });
      }

      return row;
    } catch (error) {
      throw new Error(dataError(error));
    }
  }

  async function updateSearchRequest(id: string, searchRequest: Partial<SearchRequestInput>) {
    const token = getAccessToken();
    if (!token) throw new Error("Oturum bulunamadı.");

    try {
      const rows = await request<AdvisorSearchRequestRow[]>(
        `/rest/v1/search_requests?id=eq.${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          token,
          headers: { Prefer: "return=representation" },
          body: JSON.stringify({ ...searchRequest, updated_at: new Date().toISOString() })
        }
      );

      const row = rows[0] ?? null;
      if (row) {
        void logActivity({
          action: "search_request_updated",
          entity_type: "search_request",
          entity_id: row.id,
          entity_title: row.title || row.request_type || "Arayış",
          summary: "Arayış güncellendi.",
          metadata: {
            request_type: row.request_type || row.purpose,
            status: row.status,
            urgency: row.urgency
          }
        });
      }

      return row;
    } catch (error) {
      throw new Error(dataError(error));
    }
  }

  async function deleteSearchRequest(id: string) {
    const token = getAccessToken();
    if (!token) throw new Error("Oturum bulunamadı.");

    try {
      await request(`/rest/v1/search_requests?id=eq.${encodeURIComponent(id)}`, {
        method: "DELETE",
        token
      });
    } catch (error) {
      throw new Error(dataError(error));
    }
  }

  async function getTasks() {
    const token = getAccessToken();
    if (!token) return [];

    try {
      return await request<AdvisorTaskRow[]>(
        "/rest/v1/tasks?select=*&order=created_at.desc",
        { method: "GET", token }
      );
    } catch (error) {
      throw new Error(dataError(error));
    }
  }

  async function getOperationalRows<T>(table: "matches" | "deals" | "commissions") {
    const token = getAccessToken();
    if (!token) return [];

    try {
      return await request<T[]>(
        `/rest/v1/${table}?select=*&order=created_at.desc`,
        { method: "GET", token }
      );
    } catch (error) {
      throw new Error(dataError(error));
    }
  }

  async function getProperties() {
    const token = getAccessToken();
    if (!token) return [];

    try {
      return await request<AdvisorPropertyRow[]>(
        "/rest/v1/properties?select=*&order=created_at.desc",
        { method: "GET", token }
      );
    } catch (error) {
      throw new Error(dataError(error));
    }
  }

  async function getCurrentAdvisorId() {
    const stored = readStoredSession();
    if (!stored?.access_token) throw new Error("Oturum bulunamadı.");

    const rows = await request<Array<{ id: string }>>(
      `/rest/v1/advisors?profile_id=eq.${encodeURIComponent(stored.user.id)}&select=id&limit=1`,
      { method: "GET", token: stored.access_token }
    );

    if (!rows[0]?.id) {
      throw new Error("Danışman kaydı bulunamadı. Portföy kaydı için advisor profili gerekli.");
    }

    return rows[0].id;
  }

  async function getProperty(id: string) {
    const token = getAccessToken();
    if (!token) return null;

    try {
      const rows = await request<AdvisorPropertyRow[]>(
        `/rest/v1/properties?id=eq.${encodeURIComponent(id)}&select=*&limit=1`,
        { method: "GET", token }
      );

      return rows[0] ?? null;
    } catch (error) {
      throw new Error(dataError(error));
    }
  }

  async function createProperty(property: PropertyInput) {
    const stored = readStoredSession();
    if (!stored?.access_token) throw new Error("Oturum bulunamadı.");

    try {
      const advisorId = property.advisor_id || (await getCurrentAdvisorId());
      const rows = await request<AdvisorPropertyRow[]>("/rest/v1/properties", {
        method: "POST",
        token: stored.access_token,
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({ ...property, advisor_id: advisorId })
      });

      const row = rows[0] ?? null;
      if (row) {
        void logActivity({
          action: "property_created",
          entity_type: "property",
          entity_id: row.id,
          entity_title: row.title,
          summary: "Portföy oluşturuldu.",
          metadata: {
            status: row.status,
            city: row.city,
            district: row.district,
            property_type: row.property_type
          }
        });
        void createNotification({
          type: "property_created",
          title: "Yeni portföy eklendi",
          body: row.title,
          entity_type: "property",
          entity_id: row.id,
          entity_title: row.title,
          priority: "normal",
          action_url: `/properties/${row.id}`,
          metadata: {
            status: row.status,
            city: row.city,
            district: row.district,
            property_type: row.property_type
          }
        });
      }

      return row;
    } catch (error) {
      throw new Error(dataError(error));
    }
  }

  async function updateProperty(id: string, property: Partial<PropertyInput>) {
    const token = getAccessToken();
    if (!token) throw new Error("Oturum bulunamadı.");

    try {
      const rows = await request<AdvisorPropertyRow[]>(
        `/rest/v1/properties?id=eq.${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          token,
          headers: { Prefer: "return=representation" },
          body: JSON.stringify({ ...property, updated_at: new Date().toISOString() })
        }
      );

      const row = rows[0] ?? null;
      if (row) {
        void logActivity({
          action: "property_updated",
          entity_type: "property",
          entity_id: row.id,
          entity_title: row.title,
          summary: "Portföy güncellendi.",
          metadata: {
            status: row.status,
            city: row.city,
            district: row.district,
            property_type: row.property_type
          }
        });
        void createNotification({
          type: "property_updated",
          title: "Portföy güncellendi",
          body: row.title,
          entity_type: "property",
          entity_id: row.id,
          entity_title: row.title,
          priority: "low",
          action_url: `/properties/${row.id}`,
          metadata: {
            status: row.status,
            city: row.city,
            district: row.district,
            property_type: row.property_type
          }
        });
      }

      return row;
    } catch (error) {
      throw new Error(dataError(error));
    }
  }

  async function deleteProperty(id: string) {
    const token = getAccessToken();
    if (!token) throw new Error("Oturum bulunamadı.");

    try {
      await request(`/rest/v1/properties?id=eq.${encodeURIComponent(id)}`, {
        method: "DELETE",
        token
      });
    } catch (error) {
      throw new Error(dataError(error));
    }
  }

  async function getMatches() {
    const token = getAccessToken();
    if (!token) return [];

    try {
      return await request<AdvisorMatchRow[]>(
        "/rest/v1/matches?select=*,property:properties!matches_property_id_fkey(id,advisor_id,title,listing_type,property_type,usage_type,city,district,neighborhood,address_text,latitude,longitude,gross_area,net_area,room_count,asking_price,currency,status,is_public,created_at,updated_at),search_request:search_requests!matches_search_request_id_fkey(*)&order=created_at.desc",
        { method: "GET", token }
      );
    } catch {
      return getOperationalRows<AdvisorMatchRow>("matches");
    }
  }

  async function getDeals() {
    return getOperationalRows<AdvisorDealRow>("deals");
  }

  async function getCommissions() {
    return getOperationalRows<AdvisorCommissionRow>("commissions");
  }

  async function getAdvisors() {
    const token = getAccessToken();
    if (!token) return [];

    try {
      return await request<AdvisorRow[]>(
        "/rest/v1/advisors?select=*,profile:profiles(id,full_name,email,role,phone)&order=joined_at.desc",
        { method: "GET", token }
      );
    } catch {
      return request<AdvisorRow[]>(
        "/rest/v1/advisors?select=*&order=joined_at.desc",
        { method: "GET", token }
      ).catch(() => []);
    }
  }

  async function getCommissionRules() {
    const token = getAccessToken();
    if (!token) return [];

    try {
      return await request<CommissionRuleRow[]>(
        "/rest/v1/commission_rules?select=*&is_active=eq.true&order=created_at.asc",
        { method: "GET", token }
      );
    } catch (error) {
      throw new Error(dataError(error));
    }
  }

  async function getAdvisorCapProgress(year = new Date().getFullYear()) {
    const token = getAccessToken();
    if (!token) return [];

    try {
      return await request<AdvisorCapProgressRow[]>(
        `/rest/v1/advisor_cap_progress?year=eq.${year}&select=*&order=updated_at.desc`,
        { method: "GET", token }
      );
    } catch {
      return [];
    }
  }

  async function getRevenueTransactions() {
    const token = getAccessToken();
    if (!token) return [];

    try {
      return await request<RevenueTransactionRow[]>(
        "/rest/v1/transactions?select=*,property:properties(id,title,city,district),advisor:advisors(*),commission_splits(*)&order=created_at.desc",
        { method: "GET", token }
      );
    } catch {
      return request<RevenueTransactionRow[]>(
        "/rest/v1/transactions?select=*,commission_splits(*)&order=created_at.desc",
        { method: "GET", token }
      );
    }
  }

  async function createRevenueTransaction(input: RevenueTransactionInput) {
    const stored = readStoredSession();
    if (!stored?.access_token) throw new Error("Oturum bulunamadı.");

    try {
      const rules = await getCommissionRules().catch(() => []);
      const rule = rules.find((item) => item.model === input.advisor_model);
      const fallbackRule = getDefaultRevenueRule(input.advisor_model);
      const capReached = Boolean(input.cap_reached);
      const calculation = calculateCommission({
        transaction_amount: input.transaction_amount,
        commission_rate: input.commission_rate,
        advisor_model: input.advisor_model,
        source_type: input.source_type,
        has_referral: input.has_referral,
        referral_percentage: rule?.referral_percentage ?? fallbackRule.referral_percentage,
        cap_enabled: rule?.cap_enabled ?? fallbackRule.cap_enabled,
        cap_reached: capReached,
        currency: input.currency,
        advisor_percentage: rule?.advisor_percentage ?? fallbackRule.advisor_percentage,
        office_percentage: rule?.office_percentage ?? fallbackRule.office_percentage,
        post_cap_own_office_percentage: rule?.post_cap_own_office_percentage ?? fallbackRule.post_cap_own_office_percentage,
        post_cap_office_generated_percentage: rule?.post_cap_office_generated_percentage ?? fallbackRule.post_cap_office_generated_percentage
      });
      const rows = await request<RevenueTransactionRow[]>("/rest/v1/transactions", {
        method: "POST",
        token: stored.access_token,
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({
          property_id: input.property_id || null,
          advisor_id: input.advisor_id,
          title: input.title.trim(),
          transaction_type: input.transaction_type || "sale",
          status: input.status || "draft",
          transaction_amount: input.transaction_amount,
          currency: input.currency || "TRY",
          commission_rate: input.commission_rate,
          gross_commission: calculation.gross_commission,
          advisor_model: input.advisor_model || "core",
          source_type: input.source_type || null,
          close_date: input.close_date || null,
          notes: input.notes?.trim() || null,
          created_by: stored.user.id
        })
      });
      const transaction = rows[0] ?? null;
      if (!transaction) return null;

      const splitRows = [
        {
          transaction_id: transaction.id,
          advisor_id: input.advisor_id,
          split_type: "advisor_share",
          percentage: calculation.gross_commission ? calculation.advisor_share / calculation.gross_commission * 100 : null,
          amount: calculation.advisor_share,
          currency: input.currency,
          description: "Danışman payı"
        },
        {
          transaction_id: transaction.id,
          advisor_id: null,
          split_type: "office_share",
          percentage: calculation.gross_commission ? calculation.office_share / calculation.gross_commission * 100 : null,
          amount: calculation.office_share,
          currency: input.currency,
          description: "Ofis payı"
        }
      ];

      if (calculation.referral_reward > 0) {
        splitRows.push({
          transaction_id: transaction.id,
          advisor_id: input.referral_advisor_id || null,
          split_type: "referral_reward",
          percentage: rule?.referral_percentage ?? fallbackRule.referral_percentage ?? null,
          amount: calculation.referral_reward,
          currency: input.currency,
          description: "Referral teşviki"
        });
      }

      if (calculation.cap_adjustment > 0) {
        splitRows.push({
          transaction_id: transaction.id,
          advisor_id: input.advisor_id,
          split_type: "cap_adjustment",
          percentage: null,
          amount: calculation.cap_adjustment,
          currency: input.currency,
          description: "Tavan indirimi"
        });
      }

      await request<CommissionSplitRow[]>("/rest/v1/commission_splits", {
        method: "POST",
        token: stored.access_token,
        headers: { Prefer: "return=representation" },
        body: JSON.stringify(splitRows)
      }).catch(() => []);

      void logActivity({
        action: "transaction_created",
        entity_type: "transaction",
        entity_id: transaction.id,
        entity_title: transaction.title,
        summary: "Gelir motorunda işlem oluşturuldu.",
        metadata: {
          status: transaction.status,
          transaction_type: transaction.transaction_type,
          advisor_model: transaction.advisor_model,
          source_type: transaction.source_type,
          gross_commission: transaction.gross_commission
        }
      });
      void logActivity({
        action: "commission_calculated",
        entity_type: "transaction",
        entity_id: transaction.id,
        entity_title: transaction.title,
        summary: calculation.applied_rule_summary,
        metadata: {
          gross_commission: calculation.gross_commission,
          advisor_share: calculation.advisor_share,
          office_share: calculation.office_share,
          referral_reward: calculation.referral_reward,
          cap_adjustment: calculation.cap_adjustment
        }
      });
      void createNotification({
        recipient_advisor_id: input.advisor_id,
        type: "transaction_created",
        title: "Yeni işlem oluşturuldu",
        body: transaction.title,
        entity_type: "transaction",
        entity_id: transaction.id,
        entity_title: transaction.title,
        priority: "normal",
        action_url: "/menu/commissions",
        metadata: {
          status: transaction.status,
          advisor_model: transaction.advisor_model,
          gross_commission: transaction.gross_commission
        }
      });

      return { ...transaction, commission_splits: splitRows as CommissionSplitRow[] };
    } catch (error) {
      throw new Error(dataError(error));
    }
  }

  async function updateRevenueTransactionStatus(id: string, status: RevenueTransactionStatus) {
    const token = getAccessToken();
    if (!token) throw new Error("Oturum bulunamadı.");

    try {
      const rows = await request<RevenueTransactionRow[]>(
        `/rest/v1/transactions?id=eq.${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          token,
          headers: { Prefer: "return=representation" },
          body: JSON.stringify({ status, updated_at: new Date().toISOString() })
        }
      );
      const row = rows[0] ?? null;
      if (row) {
        const action =
          status === "collected"
            ? "transaction_collected"
            : status === "paid_out"
              ? "advisor_payout_marked"
              : "transaction_updated";

        void logActivity({
          action,
          entity_type: "transaction",
          entity_id: row.id,
          entity_title: row.title,
          summary: `İşlem durumu ${status} olarak güncellendi.`,
          metadata: {
            status,
            advisor_model: row.advisor_model,
            gross_commission: row.gross_commission
          }
        });

        if (status === "collected") {
          void createNotification({
            type: "system_notice",
            title: "İşlem tahsil edildi",
            body: row.title,
            entity_type: "transaction",
            entity_id: row.id,
            entity_title: row.title,
            priority: "high",
            action_url: "/menu/commissions",
            metadata: {
              gross_commission: row.gross_commission,
              advisor_model: row.advisor_model
            }
          });
        }

        if (status === "paid_out" && row.advisor_id) {
          void createNotification({
            recipient_advisor_id: row.advisor_id,
            type: "advisor_payout_marked",
            title: "Danışman hakedişi ödendi",
            body: row.title,
            entity_type: "transaction",
            entity_id: row.id,
            entity_title: row.title,
            priority: "normal",
            action_url: "/menu/commissions",
            metadata: {
              gross_commission: row.gross_commission,
              advisor_model: row.advisor_model
            }
          });
        }
      }

      return row;
    } catch (error) {
      throw new Error(dataError(error));
    }
  }

  async function createSignedImageUrl(storagePath: string) {
    const token = getAccessToken();
    if (!token) return "";

    const data = await request<{ signedURL?: string; signedUrl?: string }>(
      `/storage/v1/object/sign/${PROPERTY_IMAGE_BUCKET}/${encodeStoragePath(storagePath)}`,
      {
        method: "POST",
        token,
        body: JSON.stringify({ expiresIn: 3600 })
      }
    );
    const signedPath = data.signedURL || data.signedUrl || "";

    if (!signedPath) return "";
    if (signedPath.startsWith("http")) return signedPath;
    if (signedPath.startsWith("/storage/v1")) return `${supabaseUrl}${signedPath}`;

    return `${supabaseUrl}/storage/v1${signedPath.startsWith("/") ? signedPath : `/${signedPath}`}`;
  }

  async function withSignedImageUrls(rows: PropertyMediaRow[]) {
    return Promise.all(
      rows.map(async (row) => ({
        ...row,
        signed_url: await createSignedImageUrl(row.display_storage_path || row.storage_path).catch(() => "")
      }))
    );
  }

  async function getPropertyMedia(propertyId: string) {
    const token = getAccessToken();
    if (!token) return [];

    try {
      const rows = await request<PropertyMediaRow[]>(
        `/rest/v1/property_media?property_id=eq.${encodeURIComponent(propertyId)}&select=*&order=sort_order.asc,created_at.asc`,
        { method: "GET", token }
      );

      return withSignedImageUrls(rows);
    } catch (error) {
      throw new Error(dataError(error));
    }
  }

  async function uploadPropertyPhoto(
    propertyId: string,
    file: File,
    sortOrder: number,
    onProgress?: (progress: number) => void
  ) {
    const stored = readStoredSession();
    if (!stored?.access_token) throw new Error("Oturum bulunamadı.");

    const mediaId = crypto.randomUUID();
    const storagePath = `${propertyId}/${mediaId}.${getImageExtension(file)}`;

    try {
      const watermarkedFile = await preparePropertyPhotoForUpload(file);
      await uploadStorageObject(storagePath, watermarkedFile, stored.access_token, onProgress);
      const rows = await request<PropertyMediaRow[]>("/rest/v1/property_media", {
        method: "POST",
        token: stored.access_token,
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({
          id: mediaId,
          property_id: propertyId,
          storage_bucket: PROPERTY_IMAGE_BUCKET,
          storage_path: storagePath,
          original_storage_path: storagePath,
          file_name: file.name,
          file_size: watermarkedFile.size,
          mime_type: watermarkedFile.type || file.type,
          sort_order: sortOrder,
          is_cover: sortOrder === 0,
          visibility: "internal",
          uploaded_by: stored.user.id
        })
      });

      const signedRows = await withSignedImageUrls(rows);
      const row = signedRows[0] ?? null;
      if (row) {
        void logActivity({
          action: "property_photo_uploaded",
          entity_type: "property",
          entity_id: propertyId,
          entity_title: file.name,
          summary: "Portföy fotoğrafı yüklendi.",
          metadata: {
            media_id: row.id,
            mime_type: row.mime_type,
            file_size: row.file_size,
            is_cover: row.is_cover
          }
        });
        void createNotification({
          type: "property_photo_uploaded",
          title: "Portföy fotoğrafı yüklendi",
          body: "Yeni fotoğraf watermark standardıyla kaydedildi.",
          entity_type: "property",
          entity_id: propertyId,
          entity_title: file.name,
          priority: "low",
          action_url: `/properties/${propertyId}`,
          metadata: {
            media_id: row.id,
            mime_type: row.mime_type,
            file_size: row.file_size,
            is_cover: row.is_cover
          }
        });
      }

      return row;
    } catch (error) {
      throw new Error(dataError(error));
    }
  }

  async function refreshPropertyPhotoWatermark(propertyId: string, mediaId: string) {
    const stored = readStoredSession();
    if (!stored?.access_token) throw new Error("Oturum bulunamadı.");

    try {
      const rows = await request<PropertyMediaRow[]>(
        `/rest/v1/property_media?id=eq.${encodeURIComponent(mediaId)}&property_id=eq.${encodeURIComponent(propertyId)}&select=*&limit=1`,
        { method: "GET", token: stored.access_token }
      );
      const media = rows[0] ?? null;
      if (!media) throw new Error("Fotoğraf kaydı bulunamadı.");

      const signedUrl = await createSignedImageUrl(media.display_storage_path || media.storage_path);
      if (!signedUrl) throw new Error("Fotoğraf yeniden işlenemedi.");

      const response = await fetch(signedUrl);
      if (!response.ok) throw new Error("Fotoğraf yeniden işlenemedi.");

      const blob = await response.blob();
      const sourceFile = new File([blob], media.file_name || "ocean-property-photo.jpg", {
        type: blob.type || media.mime_type || "image/jpeg",
        lastModified: Date.now()
      });
      const watermarkedFile = await preparePropertyPhotoForUpload(sourceFile);

      await uploadStorageObject(media.storage_path, watermarkedFile, stored.access_token, undefined, true);
      const updatedRows = await request<PropertyMediaRow[]>(
        `/rest/v1/property_media?id=eq.${encodeURIComponent(media.id)}&property_id=eq.${encodeURIComponent(propertyId)}`,
        {
          method: "PATCH",
          token: stored.access_token,
          headers: { Prefer: "return=representation" },
          body: JSON.stringify({
            display_storage_path: null,
            original_storage_path: media.storage_path,
            file_size: watermarkedFile.size,
            mime_type: watermarkedFile.type || sourceFile.type,
            updated_at: new Date().toISOString()
          })
        }
      );

      const signedRows = await withSignedImageUrls(updatedRows);
      const row = signedRows[0] ?? null;
      if (row) {
        void logActivity({
          action: "property_photo_watermark_refreshed",
          entity_type: "property",
          entity_id: propertyId,
          entity_title: row.file_name || "Portföy fotoğrafı",
          summary: "Portföy fotoğrafı watermark standardı yenilendi.",
          metadata: {
            media_id: row.id,
            mime_type: row.mime_type,
            file_size: row.file_size
          }
        });
      }

      return row;
    } catch (error) {
      throw new Error(dataError(error));
    }
  }

  async function markPropertyMediaCover(propertyId: string, mediaId: string) {
    const token = getAccessToken();
    if (!token) throw new Error("Oturum bulunamadı.");

    try {
      await request(
        `/rest/v1/property_media?property_id=eq.${encodeURIComponent(propertyId)}`,
        {
          method: "PATCH",
          token,
          body: JSON.stringify({ is_cover: false, updated_at: new Date().toISOString() })
        }
      );
      const rows = await request<PropertyMediaRow[]>(
        `/rest/v1/property_media?id=eq.${encodeURIComponent(mediaId)}&property_id=eq.${encodeURIComponent(propertyId)}`,
        {
          method: "PATCH",
          token,
          headers: { Prefer: "return=representation" },
          body: JSON.stringify({ is_cover: true, updated_at: new Date().toISOString() })
        }
      );

      const signedRows = await withSignedImageUrls(rows);
      const row = signedRows[0] ?? null;
      if (row) {
        void logActivity({
          action: "property_cover_updated",
          entity_type: "property",
          entity_id: propertyId,
          entity_title: row.file_name || "Kapak fotoğrafı",
          summary: "Kapak fotoğrafı değiştirildi.",
          metadata: {
            media_id: row.id
          }
        });
      }

      return signedRows;
    } catch (error) {
      throw new Error(dataError(error));
    }
  }

  async function deletePropertyMedia(propertyId: string, mediaId: string) {
    const token = getAccessToken();
    if (!token) throw new Error("Oturum bulunamadı.");

    try {
      const rows = await request<PropertyMediaRow[]>(
        `/rest/v1/property_media?id=eq.${encodeURIComponent(mediaId)}&property_id=eq.${encodeURIComponent(propertyId)}&select=*&limit=1`,
        { method: "GET", token }
      );
      const media = rows[0] ?? null;
      if (!media) throw new Error("Fotoğraf kaydı bulunamadı.");

      await deleteStorageObjects(
        Array.from(new Set([media.display_storage_path, media.original_storage_path, media.storage_path].filter(Boolean) as string[])),
        token
      );
      await request(
        `/rest/v1/property_media?id=eq.${encodeURIComponent(mediaId)}&property_id=eq.${encodeURIComponent(propertyId)}`,
        { method: "DELETE", token }
      );

      const remainingRows = await request<PropertyMediaRow[]>(
        `/rest/v1/property_media?property_id=eq.${encodeURIComponent(propertyId)}&select=*&order=sort_order.asc,created_at.asc`,
        { method: "GET", token }
      );
      if (media.is_cover && remainingRows[0]?.id) {
        await markPropertyMediaCover(propertyId, remainingRows[0].id);
      }

      void logActivity({
        action: "property_photo_removed",
        entity_type: "property",
        entity_id: propertyId,
        entity_title: media.file_name || "Portföy fotoğrafı",
        summary: "Portföy fotoğrafı kaldırıldı.",
        metadata: {
          media_id: media.id,
          mime_type: media.mime_type,
          file_size: media.file_size
        }
      });
      void createNotification({
        type: "property_photo_removed",
        title: "Portföy fotoğrafı kaldırıldı",
        body: media.file_name || "Bir portföy fotoğrafı kaldırıldı.",
        entity_type: "property",
        entity_id: propertyId,
        entity_title: media.file_name || "Portföy fotoğrafı",
        priority: "low",
        action_url: `/properties/${propertyId}`,
        metadata: {
          media_id: media.id,
          mime_type: media.mime_type,
          file_size: media.file_size
        }
      });

      return withSignedImageUrls(media.is_cover && remainingRows[0]?.id
        ? remainingRows.map((row, index) => ({ ...row, is_cover: index === 0 }))
        : remainingRows);
    } catch (error) {
      throw new Error(dataError(error));
    }
  }

  async function getActivePropertyShareLink(propertyId: string) {
    const token = getAccessToken();
    if (!token) return null;

    try {
      const rows = await request<PropertyShareLinkRow[]>(
        `/rest/v1/property_share_links?property_id=eq.${encodeURIComponent(propertyId)}&is_active=eq.true&select=*&order=created_at.desc&limit=1`,
        { method: "GET", token }
      );

      return rows[0] ?? null;
    } catch (error) {
      throw new Error(dataError(error));
    }
  }

  async function createPropertyShareLink(propertyId: string, publicPayload: PropertySharePayload) {
    const stored = readStoredSession();
    if (!stored?.access_token) throw new Error("Oturum bulunamadı.");

    try {
      const rows = await request<PropertyShareLinkRow[]>("/rest/v1/property_share_links", {
        method: "POST",
        token: stored.access_token,
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({
          property_id: propertyId,
          token: createShareToken(),
          created_by: stored.user.id,
          public_payload: publicPayload,
          is_active: true
        })
      });

      const row = rows[0] ?? null;
      if (row) {
        void logActivity({
          action: "property_share_created",
          entity_type: "property",
          entity_id: propertyId,
          entity_title: publicPayload.title,
          summary: "Paylaşım linki oluşturuldu.",
          metadata: {
            photo_count: publicPayload.photo_count
          }
        });
        void createNotification({
          type: "property_share_created",
          title: "Portföy paylaşımı oluşturuldu",
          body: publicPayload.title,
          entity_type: "property",
          entity_id: propertyId,
          entity_title: publicPayload.title,
          priority: "normal",
          action_url: `/properties/${propertyId}`,
          metadata: {
            photo_count: publicPayload.photo_count
          }
        });
      }

      return row;
    } catch (error) {
      throw new Error(dataError(error));
    }
  }

  async function disablePropertyShareLink(shareLinkId: string) {
    const token = getAccessToken();
    if (!token) throw new Error("Oturum bulunamadı.");

    try {
      const rows = await request<PropertyShareLinkRow[]>(
        `/rest/v1/property_share_links?id=eq.${encodeURIComponent(shareLinkId)}`,
        {
          method: "PATCH",
          token,
          headers: { Prefer: "return=representation" },
          body: JSON.stringify({ is_active: false, disabled_at: new Date().toISOString() })
        }
      );

      const row = rows[0] ?? null;
      if (row) {
        void logActivity({
          action: "property_share_deactivated",
          entity_type: "property",
          entity_id: row.property_id,
          entity_title: "Paylaşım linki",
          summary: "Paylaşım kapatıldı.",
          metadata: {
            share_link_id: row.id
          }
        });
        void createNotification({
          type: "property_share_deactivated",
          title: "Portföy paylaşımı kapatıldı",
          body: "Aktif paylaşım linki devre dışı bırakıldı.",
          entity_type: "property",
          entity_id: row.property_id,
          entity_title: "Paylaşım linki",
          priority: "low",
          action_url: `/properties/${row.property_id}`,
          metadata: {
            share_link_id: row.id
          }
        });
      }

      return row;
    } catch (error) {
      throw new Error(dataError(error));
    }
  }

  async function getPublicPropertyShare(token: string) {
    try {
      const rows = await request<PropertyShareLinkRow[]>(
        "/rest/v1/rpc/get_public_property_share",
        {
          method: "POST",
          body: JSON.stringify({ input_token: token })
        }
      );

      const row = rows[0] ?? null;
      if (!row) return null;
      if (row.expires_at && new Date(row.expires_at).getTime() <= Date.now()) return null;
      return row;
    } catch (error) {
      throw new Error(dataError(error));
    }
  }

  async function submitAdvisorApplication(application: AdvisorApplicationInput) {
    try {
      const rows = await request<AdvisorApplicationRow[]>("/rest/v1/advisor_applications", {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify(application)
      });

      const row = rows[0] ?? null;
      if (row) {
        void logActivity({
          action: "advisor_application_submitted",
          entity_type: "advisor_application",
          entity_id: row.id,
          entity_title: row.full_name,
          actor_email: row.email,
          summary: "Danışman başvurusu gönderildi.",
          metadata: {
            preferred_model: row.preferred_model,
            city: row.city,
            district: row.district
          }
        });
        void createNotification({
          type: "advisor_application_submitted",
          title: "Yeni danışman başvurusu",
          body: row.full_name,
          entity_type: "advisor_application",
          entity_id: row.id,
          entity_title: row.full_name,
          priority: "high",
          action_url: "/admin/advisor-applications",
          metadata: {
            preferred_model: row.preferred_model,
            city: row.city,
            district: row.district
          }
        });
      }

      return row;
    } catch (error) {
      throw new Error(dataError(error));
    }
  }

  async function getAdvisorApplications() {
    const token = getAccessToken();
    if (!token) return [];

    try {
      return await request<AdvisorApplicationRow[]>(
        "/rest/v1/advisor_applications?select=*&order=created_at.desc",
        { method: "GET", token }
      );
    } catch (error) {
      throw new Error(dataError(error));
    }
  }

  async function reviewAdvisorApplication(id: string, status: "approved" | "rejected" | "in_review", note: string) {
    const token = getAccessToken();
    if (!token) throw new Error("Oturum bulunamadı.");

    try {
      const rows = await request<AdvisorApplicationRow[]>(
        "/rest/v1/rpc/review_advisor_application",
        {
          method: "POST",
          token,
          body: JSON.stringify({
            application_id: id,
            next_status: status,
            note
          })
        }
      );

      const row = Array.isArray(rows) ? rows[0] ?? null : rows;
      if (row) {
        const action =
          status === "approved"
            ? "advisor_application_approved"
            : status === "rejected"
              ? "advisor_application_rejected"
              : "admin_reviewed_advisor_application";

        void logActivity({
          action,
          entity_type: "advisor_application",
          entity_id: row.id,
          entity_title: row.full_name,
          actor_email: row.email,
          summary:
            status === "approved"
              ? "Danışman başvurusu onaylandı."
              : status === "rejected"
                ? "Danışman başvurusu reddedildi."
                : "Danışman başvurusu inceleniyor.",
          metadata: {
            review_status: status,
            preferred_model: row.preferred_model,
            linked_profile: Boolean(row.linked_profile_id),
            linked_advisor: Boolean(row.linked_advisor_id)
          }
        });
        if (action !== "admin_reviewed_advisor_application") {
          void logActivity({
            action: "admin_reviewed_advisor_application",
            entity_type: "advisor_application",
            entity_id: row.id,
            entity_title: row.full_name,
            actor_email: row.email,
            summary: "Danışman başvurusu admin tarafından incelendi.",
            metadata: {
              review_status: status,
              linked_profile: Boolean(row.linked_profile_id),
              linked_advisor: Boolean(row.linked_advisor_id)
            }
          });
        }
        if (row.linked_profile_id && action !== "admin_reviewed_advisor_application") {
          void createNotification({
            recipient_profile_id: row.linked_profile_id,
            recipient_advisor_id: row.linked_advisor_id ?? null,
            type: action,
            title: status === "approved" ? "Danışman başvurusu onaylandı" : "Danışman başvurusu reddedildi",
            body: status === "approved"
              ? "OceanOS danışman hesabınız onaylandı."
              : "Danışman başvurunuz için karar kaydedildi.",
            entity_type: "advisor_application",
            entity_id: row.id,
            entity_title: row.full_name,
            priority: "high",
            action_url: "/menu/profile",
            metadata: {
              review_status: status,
              preferred_model: row.preferred_model,
              linked_profile: Boolean(row.linked_profile_id),
              linked_advisor: Boolean(row.linked_advisor_id)
            }
          });
        }
      }

      return row;
    } catch (error) {
      throw new Error(dataError(error));
    }
  }

  async function createTask(task: TaskInput) {
    const stored = readStoredSession();
    if (!stored?.access_token) throw new Error("Oturum bulunamadı.");

    try {
      const rows = await request<AdvisorTaskRow[]>("/rest/v1/tasks", {
        method: "POST",
        token: stored.access_token,
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({ ...task, owner_user_id: stored.user.id })
      });

      return rows[0] ?? null;
    } catch (error) {
      throw new Error(dataError(error));
    }
  }

  async function updateTask(id: string, task: Partial<TaskInput>) {
    const token = getAccessToken();
    if (!token) throw new Error("Oturum bulunamadı.");

    try {
      const rows = await request<AdvisorTaskRow[]>(
        `/rest/v1/tasks?id=eq.${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          token,
          headers: { Prefer: "return=representation" },
          body: JSON.stringify({ ...task, updated_at: new Date().toISOString() })
        }
      );

      return rows[0] ?? null;
    } catch (error) {
      throw new Error(dataError(error));
    }
  }

  async function deleteTask(id: string) {
    const token = getAccessToken();
    if (!token) throw new Error("Oturum bulunamadı.");

    try {
      await request(`/rest/v1/tasks?id=eq.${encodeURIComponent(id)}`, {
        method: "DELETE",
        token
      });
    } catch (error) {
      throw new Error(dataError(error));
    }
  }

  return {
    async getSession() {
      const stored = readStoredSession();
      if (!stored) return null;

      if (stored.expires_at && stored.refresh_token) {
        const expiresSoon = stored.expires_at - Math.floor(Date.now() / 1000) < 60;

        if (expiresSoon) {
          return refreshSession(stored.refresh_token);
        }
      }

      return stored;
    },

    async signUp({
      email,
      password,
      fullName,
      phone
    }: {
      email: string;
      password: string;
      fullName: string;
      phone?: string;
    }) {
      const data = await request<AuthResponse>("/auth/v1/signup", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
          data: { full_name: fullName, phone }
        })
      });
      const session = normalizeSession(data);
      if (session) saveSession(session);
      return { user: data.user ?? session?.user ?? null, session };
    },

    async signInWithPassword({ email, password }: { email: string; password: string }) {
      const data = await request<AuthResponse>("/auth/v1/token?grant_type=password", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      const session = normalizeSession(data);
      if (!session) throw new Error("Oturum oluşturulamadı.");
      saveSession(session);
      return session;
    },

    async resetPasswordForEmail(email: string, redirectTo: string) {
      const redirectQuery = redirectTo ? `?redirect_to=${encodeURIComponent(redirectTo)}` : "";
      await request<AuthResponse>(`/auth/v1/recover${redirectQuery}`, {
        method: "POST",
        body: JSON.stringify({ email })
      });
    },

    async updatePassword(password: string) {
      const token = getAccessToken();
      if (!token) throw new Error("Oturum bulunamadı.");

      const user = await request<SupabaseAuthUser>("/auth/v1/user", {
        method: "PUT",
        token,
        body: JSON.stringify({ password })
      });
      const stored = readStoredSession();
      if (stored) saveSession({ ...stored, user });
      return user;
    },

    refreshSession,

    getUser,

    getProfile,

    saveProfile,

    logActivity,

    getActivityLogs,

    createNotification,

    createNotifications,

    fetchNotifications,

    markNotificationRead,

    markAllNotificationsRead,

    getUnreadNotificationCount,

    getPortfolios,

    createPortfolio,

    updatePortfolio,

    deletePortfolio,

    getSearchRequests,

    createSearchRequest,

    updateSearchRequest,

    deleteSearchRequest,

    getTasks,

    getProperties,

    getProperty,

    createProperty,

    updateProperty,

    deleteProperty,

    getMatches,

    getDeals,

    getCommissions,

    getAdvisors,

    getCommissionRules,

    getAdvisorCapProgress,

    getRevenueTransactions,

    createRevenueTransaction,

    updateRevenueTransactionStatus,

    getPropertyMedia,

    uploadPropertyPhoto,

    refreshPropertyPhotoWatermark,

    markPropertyMediaCover,

    deletePropertyMedia,

    getActivePropertyShareLink,

    createPropertyShareLink,

    disablePropertyShareLink,

    getPublicPropertyShare,

    submitAdvisorApplication,

    getAdvisorApplications,

    reviewAdvisorApplication,

    createTask,

    updateTask,

    deleteTask,

    async signOut() {
      const stored = readStoredSession();
      if (stored?.access_token) {
        await request("/auth/v1/logout", {
          method: "POST",
          token: stored.access_token,
          body: JSON.stringify({})
        }).catch(() => null);
      }
      saveSession(null);
    },

    async upsertProfile(user: SupabaseAuthUser, fullName?: string, phone?: string) {
      const stored = readStoredSession();
      if (!stored?.access_token) return;

      await request("/rest/v1/profiles?on_conflict=id", {
        method: "POST",
        token: stored.access_token,
        headers: {
          Prefer: "resolution=merge-duplicates"
        },
        body: JSON.stringify({
          id: user.id,
          email: user.email,
          full_name: fullName || getUserDisplayName(user),
          phone
        })
      }).catch(() => null);
    },

    getOAuthUrl(provider: "google", redirectTo: string) {
      const searchParams = new URLSearchParams({
        provider,
        redirect_to: redirectTo
      });
      return `${supabaseUrl}/auth/v1/authorize?${searchParams.toString()}`;
    },

    async consumeOAuthRedirect() {
      if (typeof window === "undefined") return { session: null, error: "" };

      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token") || undefined;
      const expiresIn = Number(hash.get("expires_in") || 0);
      const error = hash.get("error_description") || hash.get("error") || "";

      if (error) {
        window.history.replaceState({}, document.title, window.location.pathname);
        return { session: null, error };
      }

      if (!accessToken) return { session: null, error: "" };

      const user = await getUser(accessToken);
      const session: SupabaseSession = {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_at: expiresIn ? Math.floor(Date.now() / 1000) + expiresIn : undefined,
        user
      };
      saveSession(session);
      window.history.replaceState({}, document.title, window.location.pathname);
      return { session, error: "" };
    }
  };
}

export function getUserDisplayName(user: SupabaseAuthUser | null, profile?: AdvisorProfile | null) {
  if (!user) return "";

  if (profile?.full_name?.trim()) return profile.full_name;

  const metadataName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : typeof user.user_metadata?.name === "string"
        ? user.user_metadata.name
        : "";

  return metadataName || user.email || "OOS Advisor";
}
