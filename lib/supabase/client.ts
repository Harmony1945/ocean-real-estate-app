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
  owner_user_id: string;
  title: string;
  location: string | null;
  property_type: string | null;
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

      return rows[0] ?? null;
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

      return rows[0] ?? null;
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

  async function getMatches() {
    const token = getAccessToken();
    if (!token) return [];

    try {
      return await request<AdvisorMatchRow[]>(
        "/rest/v1/matches?select=*,portfolio:portfolios!matches_portfolio_id_fkey(id,owner_user_id,title,location,district,owner,value,stage,contract_type,next_move,risk,commission_rate,commission,listing_id,property_type,area,rooms,description,latitude,longitude,created_at,updated_at),search_request:search_requests!matches_search_request_id_fkey(id,owner_user_id,title,location,property_type,min_price,max_price,currency,min_bedrooms,min_area,max_area,rooms,purpose,urgency,notes,status,created_at,updated_at)&order=created_at.desc",
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

    refreshSession,

    getUser,

    getProfile,

    saveProfile,

    getPortfolios,

    createPortfolio,

    updatePortfolio,

    deletePortfolio,

    getSearchRequests,

    createSearchRequest,

    updateSearchRequest,

    deleteSearchRequest,

    getTasks,

    getMatches,

    getDeals,

    getCommissions,

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
