"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import {
  createSupabaseAuthClient,
  getUserDisplayName,
  isSupabaseConfigured,
  type SupabaseAuthUser
} from "@/lib/supabase/client";

type AuthMode = "login" | "signup";
type ThemeMode = "light" | "dark";

type AuthForm = {
  name: string;
  email: string;
  password: string;
};

function applyTheme(theme: ThemeMode) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
}

function getAuthMessage(message?: string) {
  if (!message) return "İşlem tamamlanamadı. Lütfen tekrar deneyin.";
  if (message.includes("Invalid login credentials")) return "E-posta veya şifre hatalı.";
  if (message.includes("Email not confirmed")) return "E-posta adresinizi doğrulamanız gerekiyor.";
  if (message.includes("User already registered")) return "Bu e-posta adresiyle daha önce hesap oluşturulmuş.";
  if (message.includes("Password should be")) return "Şifre Supabase güvenlik koşullarını karşılamıyor.";
  return message;
}

export default function AuthGate({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createSupabaseAuthClient(), []);
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [authForm, setAuthForm] = useState<AuthForm>({ name: "", email: "", password: "" });
  const [authUser, setAuthUser] = useState<SupabaseAuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const [authNotice, setAuthNotice] = useState("");
  const [dashboardReady, setDashboardReady] = useState(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("ocean-theme");
    const systemPreference = window.matchMedia("(prefers-color-scheme: dark)");
    const preferredTheme: ThemeMode =
      savedTheme === "dark" || savedTheme === "light"
        ? savedTheme
        : systemPreference.matches
          ? "dark"
          : "light";

    setTheme(preferredTheme);
    applyTheme(preferredTheme);

    function syncSystemTheme(event: MediaQueryListEvent) {
      if (window.localStorage.getItem("ocean-theme")) return;

      const nextTheme = event.matches ? "dark" : "light";
      setTheme(nextTheme);
      applyTheme(nextTheme);
    }

    systemPreference.addEventListener("change", syncSystemTheme);
    return () => systemPreference.removeEventListener("change", syncSystemTheme);
  }, []);

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    let mounted = true;

    async function loadSession() {
      try {
        const oauthResult = await supabase.consumeOAuthRedirect();
        if (oauthResult.error) setAuthError(getAuthMessage(oauthResult.error));

        const session = oauthResult.session || (await supabase.getSession());
        if (!mounted) return;

        const user = session?.user ?? null;
        setAuthUser(user);
        if (user) void supabase.upsertProfile(user);
      } catch (error) {
        if (mounted) setAuthError(getAuthMessage(error instanceof Error ? error.message : undefined));
      } finally {
        if (mounted) setAuthLoading(false);
      }
    }

    loadSession();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  useEffect(() => {
    if (!authUser) {
      setDashboardReady(false);
      return;
    }

    window.localStorage.setItem("ocean-authenticated", "true");
    setDashboardReady(true);
  }, [authUser]);

  useEffect(() => {
    if (!supabase) return;

    const originalRemoveItem = Storage.prototype.removeItem;

    Storage.prototype.removeItem = function patchedRemoveItem(key: string) {
      if (key === "ocean-authenticated") {
        void supabase.signOut();
        setAuthUser(null);
      }

      return originalRemoveItem.call(this, key);
    };

    return () => {
      Storage.prototype.removeItem = originalRemoveItem;
    };
  }, [supabase]);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    window.localStorage.setItem("ocean-theme", nextTheme);
    setTheme(nextTheme);
    applyTheme(nextTheme);
  }

  async function submitAuth() {
    if (!supabase) {
      setAuthError("Supabase bağlantısı eksik. Lütfen ortam değişkenlerini ayarlayın.");
      return;
    }

    setAuthLoading(true);
    setAuthError("");
    setAuthNotice("");

    try {
      if (authMode === "signup") {
        const result = await supabase.signUp({
          email: authForm.email.trim(),
          password: authForm.password,
          fullName: authForm.name.trim()
        });

        if (result.user) await supabase.upsertProfile(result.user, authForm.name.trim());
        if (result.session?.user) setAuthUser(result.session.user);
        if (!result.session) setAuthNotice("Hesap oluşturuldu. Supabase e-posta doğrulaması açıksa gelen kutunuzu kontrol edin.");
        return;
      }

      const session = await supabase.signInWithPassword({
        email: authForm.email.trim(),
        password: authForm.password
      });
      setAuthUser(session.user);
      await supabase.upsertProfile(session.user);
    } catch (error) {
      setAuthError(getAuthMessage(error instanceof Error ? error.message : undefined));
    } finally {
      setAuthLoading(false);
    }
  }

  function continueWithGoogle() {
    if (!supabase) {
      setAuthError("Supabase bağlantısı eksik. Lütfen ortam değişkenlerini ayarlayın.");
      return;
    }

    window.location.href = supabase.getOAuthUrl("google", window.location.origin);
  }

  async function logout() {
    if (supabase) await supabase.signOut();
    window.localStorage.setItem("ocean-authenticated", "false");
    setAuthUser(null);
  }

  if (authLoading) {
    return (
      <AuthScreen
        mode={authMode}
        form={authForm}
        theme={theme}
        loading
        error=""
        notice=""
        isConfigured={isSupabaseConfigured}
        onModeChange={setAuthMode}
        onFormChange={setAuthForm}
        onToggleTheme={toggleTheme}
        onSubmit={submitAuth}
        onGoogle={continueWithGoogle}
      />
    );
  }

  if (!authUser) {
    return (
      <AuthScreen
        mode={authMode}
        form={authForm}
        theme={theme}
        loading={false}
        error={authError}
        notice={authNotice}
        isConfigured={isSupabaseConfigured}
        onModeChange={setAuthMode}
        onFormChange={setAuthForm}
        onToggleTheme={toggleTheme}
        onSubmit={submitAuth}
        onGoogle={continueWithGoogle}
      />
    );
  }

  return (
    <>
      {dashboardReady ? children : null}
      <div className="fixed right-4 top-4 z-[60] hidden items-center gap-2 rounded-full border border-white/60 bg-white/85 px-3 py-2 text-xs text-slate-600 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70 dark:text-slate-300 md:flex">
        <span className="max-w-44 truncate">{getUserDisplayName(authUser)}</span>
        <button type="button" className="font-medium text-slate-950 dark:text-slate-100" onClick={logout}>
          Çıkış
        </button>
      </div>
    </>
  );
}

function AuthScreen({
  mode,
  form,
  theme,
  loading,
  error,
  notice,
  isConfigured,
  onModeChange,
  onFormChange,
  onToggleTheme,
  onSubmit,
  onGoogle
}: {
  mode: AuthMode;
  form: AuthForm;
  theme: ThemeMode;
  loading: boolean;
  error: string;
  notice: string;
  isConfigured: boolean;
  onModeChange: (mode: AuthMode) => void;
  onFormChange: (form: AuthForm) => void;
  onToggleTheme: () => void;
  onSubmit: () => void;
  onGoogle: () => void;
}) {
  const [localError, setLocalError] = useState("");

  function update(key: keyof AuthForm, value: string) {
    onFormChange({ ...form, [key]: value });
    setLocalError("");
  }

  function submit() {
    if (!isConfigured) {
      setLocalError("Supabase ortam değişkenleri eksik. Kurulum tamamlanınca giriş aktif olur.");
      return;
    }

    if (mode === "signup") {
      if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
        setLocalError("Lütfen tüm alanları doldurun.");
        return;
      }
      onSubmit();
      return;
    }

    if (!form.email.trim() || !form.password.trim()) {
      setLocalError("E-posta ve şifre zorunludur.");
      return;
    }

    onSubmit();
  }

  function continueWithGoogle() {
    if (!isConfigured) {
      setLocalError("Supabase ortam değişkenleri eksik. Kurulum tamamlanınca Google girişi aktif olur.");
      return;
    }

    onGoogle();
  }

  return (
    <main
      className="relative min-h-dvh overflow-hidden bg-stone-50 px-3 text-slate-950 dark:bg-slate-950 dark:text-slate-100 sm:px-4"
      style={{ backgroundImage: "url('/mandarin-2.jpeg')", backgroundPosition: "center", backgroundSize: "cover" }}
    >
      <div className="relative mx-auto flex min-h-dvh max-w-md items-center justify-center py-6 sm:py-8">
        <section className="w-full rounded-3xl border border-white/60 bg-white/90 p-5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/85 sm:p-6">
          <div className="mb-4 flex justify-end">
            <button type="button" className="btn-secondary min-h-9 px-3 py-1 text-xs" onClick={onToggleTheme}>
              {theme === "dark" ? "Koyu" : "Açık"}
            </button>
          </div>
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-semibold shadow-sm dark:border-slate-700 dark:bg-slate-900">
              O
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-100 sm:text-3xl">
              OCEAN BrokerageOS
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Brokerage operations, portfolios and commissions in one private workspace.
            </p>
          </div>

          <div className="mb-4 grid grid-cols-2 rounded-2xl bg-slate-100 p-1 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => onModeChange("login")}
              className={`rounded-xl px-3 py-2 text-sm transition ${
                mode === "login"
                  ? "bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-slate-100"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => onModeChange("signup")}
              className={`rounded-xl px-3 py-2 text-sm transition ${
                mode === "signup"
                  ? "bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-slate-100"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
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
                  if (event.key === "Enter") submit();
                }}
              />
            ) : null}
            <input
              className="input !rounded-xl !px-4 !py-3"
              placeholder="Kullanıcı adı veya e-posta"
              value={form.email}
              onChange={(event) => update("email", event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") submit();
              }}
            />
            <input
              className="input !rounded-xl !px-4 !py-3"
              placeholder="Şifre"
              type="password"
              value={form.password}
              onChange={(event) => update("password", event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") submit();
              }}
            />
            {!isConfigured ? (
              <p className="rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-sm leading-6 text-slate-600 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300">
                Supabase kurulumu bekleniyor. `NEXT_PUBLIC_SUPABASE_URL` ve `NEXT_PUBLIC_SUPABASE_ANON_KEY` eklenince gerçek giriş aktif olur.
              </p>
            ) : null}
            {notice ? (
              <p className="rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                {notice}
              </p>
            ) : null}
            {localError || error ? <p className="text-sm text-red-600 dark:text-red-300">{localError || error}</p> : null}
            <button
              type="button"
              onClick={submit}
              disabled={loading || !isConfigured}
              className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-100 dark:text-slate-950"
            >
              {loading ? "Kontrol ediliyor..." : mode === "signup" ? "Hesap Oluştur" : "Giriş Yap"}
            </button>
            <button
              type="button"
              onClick={continueWithGoogle}
              disabled={loading || !isConfigured}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-200 text-xs font-semibold dark:border-slate-700">
                G
              </span>
              Continue with Google
            </button>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">Private workspace for OCEAN advisors.</p>
        </section>
      </div>
    </main>
  );
}
