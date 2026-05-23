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
  headers.set("Content-Type", "application/json");

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

export function createSupabaseAuthClient() {
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

    async signUp({ email, password, fullName }: { email: string; password: string; fullName: string }) {
      const data = await request<AuthResponse>("/auth/v1/signup", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
          data: { full_name: fullName }
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

    async upsertProfile(user: SupabaseAuthUser, fullName?: string) {
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
          role: "advisor"
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

export function getUserDisplayName(user: SupabaseAuthUser | null) {
  if (!user) return "";

  const metadataName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : typeof user.user_metadata?.name === "string"
        ? user.user_metadata.name
        : "";

  return metadataName || user.email || "Ocean Advisor";
}
