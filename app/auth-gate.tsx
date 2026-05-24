"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import OOSNavigation from "./oos-navigation";
import {
  createSupabaseAuthClient,
  getUserDisplayName,
  isSupabaseConfigured,
  type AdvisorProfile,
  type SupabaseAuthUser
} from "@/lib/supabase/client";

type AuthMode = "login" | "signup";
type ThemeMode = "light" | "dark";

type AuthForm = {
  name: string;
  email: string;
  password: string;
};

type ProfileForm = {
  fullName: string;
  phoneCountryCode: string;
  phone: string;
  company: string;
};

const phoneCountries = [
  { label: "Turkey", flag: "🇹🇷", code: "+90" },
  { label: "United Kingdom", flag: "🇬🇧", code: "+44" },
  { label: "Dubai / UAE", flag: "🇦🇪", code: "+971" },
  { label: "Kazakhstan", flag: "🇰🇿", code: "+7" }
];

const defaultPhoneCountry = phoneCountries[0];

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

function isProfileComplete(profile: AdvisorProfile | null) {
  return Boolean(
    profile?.full_name?.trim() && profile.phone?.trim() && profile.company?.trim()
  );
}

function parseStoredPhone(phone?: string | null) {
  const trimmedPhone = phone?.trim() || "";
  const country =
    phoneCountries.find((item) => trimmedPhone.startsWith(item.code)) ||
    defaultPhoneCountry;

  return {
    phoneCountryCode: country.code,
    phone: trimmedPhone.startsWith(country.code)
      ? trimmedPhone.slice(country.code.length)
      : trimmedPhone
  };
}

function formatInternationalPhone(countryCode: string, phone: string) {
  const country = phoneCountries.find((item) => item.code === countryCode) || defaultPhoneCountry;
  const countryDigits = country.code.replace(/\D/g, "");
  const digits = phone.replace(/\D/g, "");
  const localDigits = digits.startsWith(countryDigits)
    ? digits.slice(countryDigits.length)
    : digits.replace(/^0+/, "");

  return `${country.code}${localDigits}`;
}

function getInitialProfileForm(user: SupabaseAuthUser | null, profile?: AdvisorProfile | null): ProfileForm {
  const phone = parseStoredPhone(profile?.phone);

  return {
    fullName: profile?.full_name || getUserDisplayName(user, profile) || "",
    phoneCountryCode: phone.phoneCountryCode,
    phone: phone.phone,
    company: profile?.company || ""
  };
}

function replaceLegacyBrandText() {
  if (typeof document === "undefined") return;

  const replacements: Array<[RegExp, string]> = [
    [/OCEAN BrokerageOS/g, "OOS"],
    [/Ocean BrokerageOS/g, "OOS"],
    [/Ocean Real Estate/g, "OOS"],
    [/OCEAN advisors/g, "OOS advisors"],
    [/OCEAN danışman/g, "OOS danışman"],
    [/BrokerageOS/g, "Ocean Operating System"]
  ];

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let current = walker.nextNode();

  while (current) {
    nodes.push(current as Text);
    current = walker.nextNode();
  }

  nodes.forEach((node) => {
    let nextValue = node.nodeValue || "";
    replacements.forEach(([pattern, value]) => {
      nextValue = nextValue.replace(pattern, value);
    });

    if (nextValue !== node.nodeValue) node.nodeValue = nextValue;
  });

  document.title = "OOS";
}

export default function AuthGate({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createSupabaseAuthClient(), []);
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [authForm, setAuthForm] = useState<AuthForm>({ name: "", email: "", password: "" });
  const [authUser, setAuthUser] = useState<SupabaseAuthUser | null>(null);
  const [profile, setProfile] = useState<AdvisorProfile | null>(null);
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    fullName: "",
    phoneCountryCode: defaultPhoneCountry.code,
    phone: "",
    company: ""
  });
  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authNotice, setAuthNotice] = useState("");
  const [profileError, setProfileError] = useState("");
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

  async function loadProfileForUser(user: SupabaseAuthUser, fallbackFullName = "") {
    if (!supabase) return;

    setProfileLoading(true);
    setProfileError("");

    try {
      let nextProfile = await supabase.getProfile(user.id);

      if (!nextProfile) {
        await supabase.upsertProfile(user, fallbackFullName || getUserDisplayName(user));
        nextProfile = await supabase.getProfile(user.id);
      }

      setProfile(nextProfile);
      setProfileForm(getInitialProfileForm(user, nextProfile));
    } catch (error) {
      setProfileError(
        getAuthMessage(error instanceof Error ? error.message : undefined) ||
          "Profil bilgileri alınamadı. Bilgileri kaydederek devam edebilirsiniz."
      );
      setProfile(null);
      setProfileForm(getInitialProfileForm(user));
    } finally {
      setProfileLoading(false);
    }
  }

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
        if (user) await loadProfileForUser(user);
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
      setProfile(null);
      return;
    }

    window.localStorage.setItem("ocean-authenticated", "true");
    setDashboardReady(isProfileComplete(profile));
  }, [authUser, profile]);

  useEffect(() => {
    if (!supabase) return;

    const originalRemoveItem = Storage.prototype.removeItem;

    Storage.prototype.removeItem = function patchedRemoveItem(key: string) {
      if (key === "ocean-authenticated") {
        void supabase.signOut();
        setAuthUser(null);
        setProfile(null);
      }

      return originalRemoveItem.call(this, key);
    };

    return () => {
      Storage.prototype.removeItem = originalRemoveItem;
    };
  }, [supabase]);

  useEffect(() => {
    if (!dashboardReady) return;

    replaceLegacyBrandText();
    const observer = new MutationObserver(() => replaceLegacyBrandText());
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [dashboardReady]);

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
        if (result.session?.user) {
          setAuthUser(result.session.user);
          await loadProfileForUser(result.session.user, authForm.name.trim());
        }
        if (!result.session) setAuthNotice("Hesap oluşturuldu. E-posta doğrulaması açıksa gelen kutunuzu kontrol edin, ardından giriş yapın.");
        return;
      }

      const session = await supabase.signInWithPassword({
        email: authForm.email.trim(),
        password: authForm.password
      });
      setAuthUser(session.user);
      await loadProfileForUser(session.user);
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

  async function saveAdvisorProfile() {
    if (!supabase || !authUser) return;

    if (!profileForm.fullName.trim() || !profileForm.phone.trim() || !profileForm.company.trim()) {
      setProfileError("Lütfen ad soyad, telefon ve şirket alanlarını doldurun.");
      return;
    }

    setProfileSaving(true);
    setProfileError("");

    try {
      const savedProfile = await supabase.saveProfile(authUser, {
        ...profileForm,
        phone: formatInternationalPhone(profileForm.phoneCountryCode, profileForm.phone)
      });
      setProfile(savedProfile);
      setProfileForm(getInitialProfileForm(authUser, savedProfile));
    } catch (error) {
      setProfileError(getAuthMessage(error instanceof Error ? error.message : undefined));
    } finally {
      setProfileSaving(false);
    }
  }

  async function logout() {
    if (supabase) await supabase.signOut();
    window.localStorage.setItem("ocean-authenticated", "false");
    setAuthUser(null);
    setProfile(null);
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

  if (profileLoading) {
    return <ProfileLoadingScreen theme={theme} onToggleTheme={toggleTheme} />;
  }

  if (!isProfileComplete(profile)) {
    return (
      <ProfileCompletionScreen
        user={authUser}
        form={profileForm}
        error={profileError}
        saving={profileSaving}
        theme={theme}
        onFormChange={setProfileForm}
        onSave={saveAdvisorProfile}
        onLogout={logout}
        onToggleTheme={toggleTheme}
      />
    );
  }

  return (
    <>
      {dashboardReady ? children : null}
      <OOSNavigation user={authUser} profile={profile} onLogout={logout} />
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
      className="relative min-h-dvh overflow-hidden bg-stone-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100"
    >
      <div className="relative mx-auto flex min-h-dvh max-w-lg flex-col justify-between px-4 pt-6 sm:max-w-xl sm:px-6 sm:py-8 lg:max-w-5xl lg:flex-row lg:items-center lg:gap-10">
        <button type="button" className="btn-secondary absolute right-4 top-4 z-20 min-h-9 px-3 py-1 text-xs" onClick={onToggleTheme}>
              {theme === "dark" ? "Koyu" : "Açık"}
            </button>

        <section className="flex flex-1 flex-col items-center justify-center pb-8 pt-16 text-center lg:pb-16 lg:pt-8">
          <div className="relative mb-8 flex h-44 w-44 items-center justify-center sm:h-56 sm:w-56">
            <div className="absolute inset-4 animate-oos-liquid-ring rounded-full border border-slate-200/80 bg-white/50 shadow-[0_24px_90px_rgba(15,23,42,0.12)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04]" />
            <div className="animate-oos-liquid-float relative flex h-28 w-28 items-center justify-center border border-white/70 bg-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_24px_70px_rgba(15,23,42,0.16)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.08] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_24px_70px_rgba(0,0,0,0.42)] sm:h-36 sm:w-36">
              <span className="text-4xl font-semibold tracking-tight text-slate-950 dark:text-slate-100 sm:text-5xl">
                O
              </span>
            </div>
          </div>
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
            OceanOS
          </p>
          <h1 className="mt-4 max-w-sm text-4xl font-semibold leading-tight tracking-tight text-slate-950 dark:text-slate-100 sm:text-6xl">
            OOS çalışma alanına hoş geldiniz.
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
            Portföyler, arayışlar ve danışman operasyonu için sade günlük merkez.
          </p>
        </section>

        <section className="mx-[-1rem] rounded-t-[2.2rem] bg-slate-950 px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-5 text-white shadow-[0_-24px_80px_rgba(15,23,42,0.20)] dark:bg-black sm:mx-0 sm:w-full sm:rounded-[2.2rem] sm:p-6 lg:max-w-md">
          <div className="mb-4 grid gap-2">
            <button
              type="button"
              disabled
              className="flex min-h-14 w-full items-center justify-center rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-950 opacity-95 shadow-sm disabled:cursor-not-allowed"
            >
              Apple ile Devam Et
            </button>
            <button
              type="button"
              onClick={continueWithGoogle}
              disabled={loading || !isConfigured}
              className="flex min-h-14 w-full items-center justify-center rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm font-medium text-slate-950 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-55"
            >
              Google ile devam et
            </button>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onModeChange("signup")}
              className={`min-h-12 rounded-2xl px-3 py-2 text-sm font-medium transition ${
                mode === "signup"
                  ? "bg-white text-slate-950"
                  : "bg-white/10 text-white hover:bg-white/15"
              }`}
            >
              Kaydol
            </button>
            <button
              type="button"
              onClick={() => onModeChange("login")}
              className={`min-h-12 rounded-2xl px-3 py-2 text-sm font-medium transition ${
                mode === "login"
                  ? "bg-white text-slate-950"
                  : "bg-white/10 text-white hover:bg-white/15"
              }`}
            >
              Oturum aç
            </button>
          </div>

          <div className="space-y-3">
            {mode === "signup" ? (
              <input
                className="input !rounded-2xl !border-white/10 !bg-white/10 !px-4 !py-3 !text-white placeholder:!text-white/45 focus:!border-white/25 focus:!ring-white/10"
                placeholder="Ad Soyad"
                value={form.name}
                onChange={(event) => update("name", event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") submit();
                }}
              />
            ) : null}
            <input
              className="input !rounded-2xl !border-white/10 !bg-white/10 !px-4 !py-3 !text-white placeholder:!text-white/45 focus:!border-white/25 focus:!ring-white/10"
              placeholder="Kullanıcı adı veya e-posta"
              value={form.email}
              onChange={(event) => update("email", event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") submit();
              }}
            />
            <input
              className="input !rounded-2xl !border-white/10 !bg-white/10 !px-4 !py-3 !text-white placeholder:!text-white/45 focus:!border-white/25 focus:!ring-white/10"
              placeholder="Şifre"
              type="password"
              value={form.password}
              onChange={(event) => update("password", event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") submit();
              }}
            />
            {!isConfigured ? (
              <p className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-sm leading-6 text-white/70">
                Supabase kurulumu bekleniyor. `NEXT_PUBLIC_SUPABASE_URL` ve `NEXT_PUBLIC_SUPABASE_ANON_KEY` eklenince gerçek giriş aktif olur.
              </p>
            ) : null}
            {notice ? (
              <p className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-100">
                {notice}
              </p>
            ) : null}
            {localError || error ? <p className="text-sm text-red-200">{localError || error}</p> : null}
            <button
              type="button"
              onClick={submit}
              disabled={loading || !isConfigured}
              className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-55"
            >
              {loading ? "Kontrol ediliyor..." : mode === "signup" ? "Kaydol" : "Oturum aç"}
            </button>
          </div>

          <p className="mt-5 text-center text-xs leading-5 text-white/40">OOS advisors private workspace</p>
        </section>
      </div>
    </main>
  );
}

function ProfileLoadingScreen({ theme, onToggleTheme }: { theme: ThemeMode; onToggleTheme: () => void }) {
  return (
    <ProfileShell theme={theme} onToggleTheme={onToggleTheme}>
      <div className="text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <p className="text-sm font-medium text-slate-950 dark:text-slate-100">Profil hazırlanıyor...</p>
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Danışman profiliniz kontrol ediliyor.</p>
      </div>
    </ProfileShell>
  );
}

function ProfileCompletionScreen({
  user,
  form,
  error,
  saving,
  theme,
  onFormChange,
  onSave,
  onLogout,
  onToggleTheme
}: {
  user: SupabaseAuthUser;
  form: ProfileForm;
  error: string;
  saving: boolean;
  theme: ThemeMode;
  onFormChange: (form: ProfileForm) => void;
  onSave: () => void;
  onLogout: () => void;
  onToggleTheme: () => void;
}) {
  const selectedPhoneCountry =
    phoneCountries.find((country) => country.code === form.phoneCountryCode) ||
    defaultPhoneCountry;

  function update(key: keyof ProfileForm, value: string) {
    onFormChange({ ...form, [key]: value });
  }

  return (
    <ProfileShell theme={theme} onToggleTheme={onToggleTheme}>
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-semibold shadow-sm dark:border-slate-700 dark:bg-slate-900">
          O
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-100 sm:text-3xl">
          Danışman profilini tamamla
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
          OOS çalışma alanına geçmeden önce profil bilgilerini tamamlayalım.
        </p>
      </div>

      <div className="space-y-3">
        <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300">
          <p className="text-xs text-slate-400">E-posta</p>
          <p className="mt-1 font-medium text-slate-900 dark:text-slate-100">{user.email || "Supabase Auth"}</p>
        </div>
        <input
          className="input !rounded-xl !px-4 !py-3"
          placeholder="Ad Soyad"
          value={form.fullName}
          onChange={(event) => update("fullName", event.target.value)}
        />
        <div className="grid gap-2 sm:grid-cols-[160px_minmax(0,1fr)]">
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-lg leading-none">
              {selectedPhoneCountry.flag}
            </span>
            <select
              className="input !rounded-xl !py-3 !pl-12 !pr-4"
              aria-label="Telefon ülke kodu"
              value={form.phoneCountryCode}
              onChange={(event) => update("phoneCountryCode", event.target.value)}
            >
              {phoneCountries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.flag} {country.code}
                </option>
              ))}
            </select>
          </div>
          <input
            className="input !rounded-xl !px-4 !py-3"
            inputMode="tel"
            placeholder="555 111 22 33"
            value={form.phone}
            onChange={(event) => update("phone", event.target.value)}
          />
        </div>
        <input
          className="input !rounded-xl !px-4 !py-3"
          placeholder="Şirket"
          value={form.company}
          onChange={(event) => update("company", event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") onSave();
          }}
        />
        <p className="text-xs leading-5 text-slate-400">
          Rolünüz güvenlik nedeniyle uygulamadan değiştirilemez ve varsayılan olarak advisor atanır.
        </p>
        {error ? <p className="text-sm text-red-600 dark:text-red-300">{error}</p> : null}
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-100 dark:text-slate-950"
        >
          {saving ? "Kaydediliyor..." : "Profili Kaydet ve Devam Et"}
        </button>
        <button
          type="button"
          onClick={onLogout}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Çıkış Yap
        </button>
      </div>
    </ProfileShell>
  );
}

function ProfileShell({
  children,
  theme,
  onToggleTheme
}: {
  children: ReactNode;
  theme: ThemeMode;
  onToggleTheme: () => void;
}) {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-stone-50 px-3 text-slate-950 dark:bg-slate-950 dark:text-slate-100 sm:px-4">
      <div className="relative mx-auto flex min-h-dvh max-w-md items-center justify-center py-6 sm:py-8">
        <section className="w-full rounded-3xl border border-white/60 bg-white/95 p-5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/90 sm:p-6">
          <div className="mb-4 flex justify-end">
            <button type="button" className="btn-secondary min-h-9 px-3 py-1 text-xs" onClick={onToggleTheme}>
              {theme === "dark" ? "Koyu" : "Açık"}
            </button>
          </div>
          {children}
        </section>
      </div>
    </main>
  );
}
