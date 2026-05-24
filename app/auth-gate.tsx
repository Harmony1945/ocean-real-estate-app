"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import OOSNavigation from "./oos-navigation";
import { applyTheme, getPreferredTheme, saveTheme, themeStorageKey, type ThemeMode } from "./theme";
import {
  createSupabaseAuthClient,
  getUserDisplayName,
  isSupabaseConfigured,
  type AdvisorProfile,
  type SupabaseAuthUser
} from "@/lib/supabase/client";

type AuthMode = "login" | "signup";

type AuthForm = {
  name: string;
  email: string;
  password: string;
  phoneCountryCode: string;
  phone: string;
};

type ProfileForm = {
  fullName: string;
  phoneCountryCode: string;
  phone: string;
  company: string;
};

const phoneCountries = [
  { label: "Turkey", flag: "🇹🇷", shortLabel: "TR", code: "+90" },
  { label: "United Kingdom", flag: "🇬🇧", shortLabel: "GB", code: "+44" },
  { label: "UAE / Dubai", flag: "🇦🇪", shortLabel: "AE", code: "+971" },
  { label: "Kazakhstan", flag: "🇰🇿", shortLabel: "KZ", code: "+7" }
];

const defaultPhoneCountry = phoneCountries[0];

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

function getUserMetadataPhone(user: SupabaseAuthUser | null) {
  return typeof user?.user_metadata?.phone === "string" ? user.user_metadata.phone : "";
}

function getInitialProfileForm(user: SupabaseAuthUser | null, profile?: AdvisorProfile | null): ProfileForm {
  const phone = parseStoredPhone(profile?.phone || getUserMetadataPhone(user));

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
  const [authForm, setAuthForm] = useState<AuthForm>({
    name: "",
    email: "",
    password: "",
    phoneCountryCode: defaultPhoneCountry.code,
    phone: ""
  });
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
    const preferredTheme = getPreferredTheme();
    const systemPreference = window.matchMedia("(prefers-color-scheme: dark)");

    setTheme(preferredTheme);
    applyTheme(preferredTheme);

    function syncSystemTheme(event: MediaQueryListEvent) {
      if (window.localStorage.getItem(themeStorageKey)) return;

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
        await supabase.upsertProfile(
          user,
          fallbackFullName || getUserDisplayName(user),
          getUserMetadataPhone(user)
        );
        nextProfile = await supabase.getProfile(user.id);
      } else if (!nextProfile.phone && getUserMetadataPhone(user)) {
        nextProfile = await supabase.saveProfile(user, {
          fullName: nextProfile.full_name || fallbackFullName || getUserDisplayName(user),
          phone: getUserMetadataPhone(user),
          company: nextProfile.company || ""
        });
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
    setTheme(nextTheme);
    saveTheme(nextTheme);
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
        const formattedPhone = formatInternationalPhone(authForm.phoneCountryCode, authForm.phone);
        const result = await supabase.signUp({
          email: authForm.email.trim(),
          password: authForm.password,
          fullName: authForm.name.trim(),
          phone: formattedPhone
        });

        if (result.user) await supabase.upsertProfile(result.user, authForm.name.trim(), formattedPhone);
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
      if (!form.name.trim() || !form.email.trim() || !form.password.trim() || !form.phone.trim()) {
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

  const selectedSignupCountry =
    phoneCountries.find((country) => country.code === form.phoneCountryCode) ||
    defaultPhoneCountry;

  return (
    <main
      className="relative min-h-dvh overflow-hidden bg-stone-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100"
    >
      <div className="relative mx-auto flex min-h-dvh max-w-7xl flex-col px-4 pt-5 sm:px-6 sm:py-7 lg:px-8">
        <header className="relative z-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-semibold shadow-sm dark:border-white/10 dark:bg-white/[0.06]">
              O
            </span>
            <span className="text-sm font-semibold tracking-tight text-slate-950 dark:text-slate-100">
              OceanOS
            </span>
          </div>
          <button type="button" className="btn-secondary min-h-9 px-3 py-1 text-xs" onClick={onToggleTheme}>
            {theme === "dark" ? "Açık tema" : "Koyu tema"}
          </button>
        </header>

        <section className="grid flex-1 items-center gap-8 pb-0 pt-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(380px,0.95fr)] lg:pb-10 lg:pt-10">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
              OOS advisor workspace
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-slate-950 dark:text-slate-100 sm:text-6xl lg:text-7xl">
              Tüm gayrimenkul operasyonunu OOS ile yönet.
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400 sm:text-base">
              Portföyleri, arayışları, eşleşmeleri ve danışman süreçlerini tek sade merkezde yönetin.
            </p>
            <button
              type="button"
              onClick={submit}
              disabled={loading || !isConfigured}
              className="mt-7 hidden rounded-full bg-slate-950 px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-55 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white lg:inline-flex"
            >
              Çalışma Alanına Gir
            </button>

            <div className="relative mt-10 flex h-44 w-44 items-center justify-center sm:h-56 sm:w-56 lg:hidden">
              <div className="absolute inset-4 animate-oos-liquid-ring rounded-full border border-slate-200/80 bg-white/50 shadow-[0_24px_90px_rgba(15,23,42,0.12)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04]" />
              <div className="animate-oos-liquid-float relative flex h-28 w-28 items-center justify-center border border-white/70 bg-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_24px_70px_rgba(15,23,42,0.16)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.08] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_24px_70px_rgba(0,0,0,0.42)] sm:h-36 sm:w-36">
                <span className="text-4xl font-semibold tracking-tight text-slate-950 dark:text-slate-100 sm:text-5xl">
                  O
                </span>
              </div>
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

          <div className="hidden min-h-[34rem] rounded-[2.5rem] border border-slate-200 bg-white p-4 shadow-[0_30px_100px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-white/[0.04] lg:block">
            <div className="h-full rounded-[2rem] bg-stone-50 p-5 dark:bg-slate-950/70">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Bugünkü merkez</p>
                  <p className="mt-1 text-xl font-semibold text-slate-950 dark:text-slate-100">
                    OOS Dashboard
                  </p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                  canlı
                </span>
              </div>
              <div className="mt-6 grid gap-3">
                {["Aktif portföyler", "Aktif arayışlar", "Son eşleşmeler"].map((item, index) => (
                  <div key={item} className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-500 dark:text-slate-400">{item}</span>
                      <span className="text-lg font-semibold text-slate-950 dark:text-slate-100">
                        {[12, 8, 5][index]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.04]">
                <p className="text-sm font-medium text-slate-950 dark:text-slate-100">
                  Beykoz villa arayışı
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  %85 eşleşme: lokasyon, tip ve fiyat aralığı uyumlu.
                </p>
                <div className="mt-4 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className="h-2 w-[85%] rounded-full bg-emerald-500" />
                </div>
              </div>
            </div>
          </div>

          <section className="mx-[-1rem] rounded-t-[2.2rem] bg-slate-950 px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-5 text-white shadow-[0_-24px_80px_rgba(15,23,42,0.20)] dark:bg-black sm:mx-0 sm:w-full sm:rounded-[2.2rem] sm:p-6 lg:max-w-md lg:justify-self-end">
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
              <>
                <input
                  className="input !rounded-2xl !border-white/10 !bg-white/10 !px-4 !py-3 !text-white placeholder:!text-white/45 focus:!border-white/25 focus:!ring-white/10"
                  placeholder="Ad Soyad"
                  value={form.name}
                  onChange={(event) => update("name", event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") submit();
                  }}
                />
                <div className="grid gap-2 sm:grid-cols-[150px_minmax(0,1fr)]">
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-sm font-medium text-white">
                      {selectedSignupCountry.flag} {selectedSignupCountry.shortLabel}
                    </span>
                    <select
                      className="input !rounded-2xl !border-white/10 !bg-white/10 !py-3 !pl-20 !pr-4 !text-white focus:!border-white/25 focus:!ring-white/10"
                      aria-label="Telefon ülke kodu"
                      value={form.phoneCountryCode}
                      onChange={(event) => update("phoneCountryCode", event.target.value)}
                    >
                      {phoneCountries.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.flag} {country.shortLabel} {country.code}
                        </option>
                      ))}
                    </select>
                  </div>
                  <input
                    className="input !rounded-2xl !border-white/10 !bg-white/10 !px-4 !py-3 !text-white placeholder:!text-white/45 focus:!border-white/25 focus:!ring-white/10"
                    inputMode="tel"
                    placeholder="555 111 22 33"
                    value={form.phone}
                    onChange={(event) => update("phone", event.target.value)}
                  />
                </div>
              </>
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
              {selectedPhoneCountry.flag} {selectedPhoneCountry.shortLabel}
            </span>
            <select
              className="input !rounded-xl !py-3 !pl-20 !pr-4"
              aria-label="Telefon ülke kodu"
              value={form.phoneCountryCode}
              onChange={(event) => update("phoneCountryCode", event.target.value)}
            >
              {phoneCountries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.flag} {country.shortLabel} {country.code}
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
