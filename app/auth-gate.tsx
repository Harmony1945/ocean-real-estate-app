"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { AuthProvider } from "./auth-context";
import BrandLogo from "./brand-logo";
import PublicHomepageShell from "./components/public-homepage/public-homepage-shell";
import OOSNavigation from "./oos-navigation";
import { applyTheme, getPreferredTheme, saveTheme, themeStorageKey, type ThemeMode } from "./theme";
import ThemeToggle from "./theme-toggle";
import {
  createSupabaseAuthClient,
  getUserDisplayName,
  isSupabaseConfigured,
  type AdvisorProfile,
  type SupabaseAuthUser
} from "@/lib/supabase/client";
import {
  OCEAN_CONTACT_ADDRESS,
  OCEAN_CONTACT_EMAIL,
  OCEAN_CONTACT_MAILTO,
  OCEAN_CONTACT_PHONE
} from "@/lib/oos/contact";
import { legalPages } from "@/lib/oos/legal-pages";

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

const publicRoutePrefixes = [
  "/about",
  "/ocean-elite",
  "/star-girisim-ve-yatirim",
  "/contact",
  "/careers",
  "/support",
  "/apply-advisor",
  "/forgot-password",
  "/reset-password",
  "/tools/tax-calculator",
  "/legal",
  "/share"
];

function isPublicRoute(pathname: string) {
  if (pathname.startsWith("/properties/demo-")) return true;

  return publicRoutePrefixes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

const phoneCountries = [
  { value: "TR", label: "Turkey", flag: "🇹🇷", shortLabel: "TR", code: "+90" },
  { value: "US", label: "United States", flag: "🇺🇸", shortLabel: "US", code: "+1" },
  { value: "UK", label: "United Kingdom", flag: "🇬🇧", shortLabel: "UK", code: "+44" },
  { value: "AE", label: "UAE / Dubai", flag: "🇦🇪", shortLabel: "AE", code: "+971" },
  { value: "KZ", label: "Kazakhstan", flag: "🇰🇿", shortLabel: "KZ", code: "+7" },
  { value: "RU", label: "Russia", flag: "🇷🇺", shortLabel: "RU", code: "+7" }
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
    phoneCountryCode: country.value,
    phone: trimmedPhone.startsWith(country.code)
      ? trimmedPhone.slice(country.code.length)
      : trimmedPhone
  };
}

function formatInternationalPhone(countryCode: string, phone: string) {
  const country =
    phoneCountries.find((item) => item.value === countryCode || item.code === countryCode) ||
    defaultPhoneCountry;
  const countryDigits = country.code.replace(/\D/g, "");
  const digits = phone.replace(/\D/g, "");
  const localDigits = digits.startsWith(countryDigits)
    ? digits.slice(countryDigits.length)
    : digits.replace(/^0+/, "");

  return `${country.code}${localDigits}`;
}

function getCountryDisplay(country: (typeof phoneCountries)[number]) {
  return `${country.flag} ${country.shortLabel} ${country.code}`;
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
  const pathname = usePathname();
  const supabase = useMemo(() => createSupabaseAuthClient(), []);
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [authForm, setAuthForm] = useState<AuthForm>({
    name: "",
    email: "",
    password: "",
    phoneCountryCode: defaultPhoneCountry.value,
    phone: ""
  });
  const [authUser, setAuthUser] = useState<SupabaseAuthUser | null>(null);
  const [profile, setProfile] = useState<AdvisorProfile | null>(null);
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    fullName: "",
    phoneCountryCode: defaultPhoneCountry.value,
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

  if (isPublicRoute(pathname)) {
    return <>{children}</>;
  }

  if (pathname === "/" && (authLoading || !authUser)) {
    return (
      <PublicHomepageShell
        oceanOSCard={
          <AuthCard
            mode={authMode}
            form={authForm}
            loading={authLoading}
            error={authError}
            notice={authNotice}
            isConfigured={isSupabaseConfigured}
            onModeChange={setAuthMode}
            onFormChange={setAuthForm}
            onSubmit={submitAuth}
            onGoogle={continueWithGoogle}
          />
        }
      />
    );
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
    <AuthProvider value={{ user: authUser, profile, onLogout: logout }}>
      {dashboardReady ? children : null}
      <OOSNavigation user={authUser} profile={profile} onLogout={logout} />
    </AuthProvider>
  );
}

function AuthCard({
  mode,
  form,
  loading,
  error,
  notice,
  isConfigured,
  onModeChange,
  onFormChange,
  onSubmit,
  onGoogle
}: {
  mode: AuthMode;
  form: AuthForm;
  loading: boolean;
  error: string;
  notice: string;
  isConfigured: boolean;
  onModeChange: (mode: AuthMode) => void;
  onFormChange: (form: AuthForm) => void;
  onSubmit: () => void;
  onGoogle: () => void;
}) {
  const [localError, setLocalError] = useState("");
  const selectedSignupCountry =
    phoneCountries.find((country) => country.value === form.phoneCountryCode || country.code === form.phoneCountryCode) ||
    defaultPhoneCountry;

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

  return (
    <section className="rounded-[2rem] border border-white/20 bg-black/70 p-5 text-white shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-6">
      <div>
        <p className="text-sm font-semibold text-white/50">OceanOS Girişi</p>
        <h2 className="mt-2 text-2xl font-semibold">Danışman ve yönetim paneli</h2>
        <p className="mt-2 text-sm leading-6 text-white/60">
          Danışman hesabınızla devam edin veya yeni profil oluşturun.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 rounded-2xl bg-white/10 p-1">
        <button
          type="button"
          onClick={() => onModeChange("login")}
          className={`rounded-xl px-3 py-2 text-sm transition ${mode === "login" ? "bg-white text-slate-950 shadow-sm" : "text-white/60 hover:text-white"}`}
        >
          Giriş
        </button>
        <button
          type="button"
          onClick={() => onModeChange("signup")}
          className={`rounded-xl px-3 py-2 text-sm transition ${mode === "signup" ? "bg-white text-slate-950 shadow-sm" : "text-white/60 hover:text-white"}`}
        >
          Kayıt
        </button>
      </div>

      <div className="mt-4 space-y-3">
        <button
          type="button"
          onClick={continueWithGoogle}
          disabled={loading || !isConfigured}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm font-medium text-slate-950 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-55"
        >
          <GoogleIcon />
          Google ile devam et
        </button>
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
            <div className="grid gap-2 sm:grid-cols-[140px_minmax(0,1fr)]">
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-sm font-medium text-white">
                  {getCountryDisplay(selectedSignupCountry)}
                </span>
                <select
                  className="input !rounded-2xl !border-white/10 !bg-white/10 !py-3 !pl-4 !pr-4 !text-transparent focus:!border-white/25 focus:!ring-white/10"
                  aria-label="Telefon ülke kodu"
                  value={form.phoneCountryCode}
                  onChange={(event) => update("phoneCountryCode", event.target.value)}
                >
                  {phoneCountries.map((country) => (
                    <option key={country.value} value={country.value} className="text-slate-950">
                      {country.flag} {country.label} {country.code}
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
        {mode === "login" ? (
          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-xs font-medium text-white/50 transition hover:text-white">
              Şifremi unuttum
            </Link>
          </div>
        ) : null}
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
          className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-950 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-55"
        >
          {loading ? "Kontrol ediliyor..." : mode === "signup" ? "Kaydol" : "Oturum aç"}
        </button>
      </div>
      <p className="mt-5 text-center text-xs leading-5 text-white/40">OOS advisors private workspace</p>
    </section>
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
    phoneCountries.find((country) => country.value === form.phoneCountryCode || country.code === form.phoneCountryCode) ||
    defaultPhoneCountry;

  return (
    <main className="relative min-h-dvh overflow-x-hidden bg-stone-50 text-slate-950 dark:bg-black dark:text-neutral-50">
      <div className="relative mx-auto flex min-h-dvh max-w-7xl flex-col px-4 pt-5 sm:px-6 sm:py-7 lg:px-8">
        <header className="relative z-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold tracking-tight text-slate-950 dark:text-slate-100">
              OceanOS
            </span>
          </div>
          <ThemeToggle />
        </header>

        <section className="grid flex-1 items-center gap-8 pb-0 pt-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(380px,0.95fr)] lg:pb-10 lg:pt-10">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
              OOS advisor workspace
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-slate-950 dark:text-slate-100 sm:text-6xl lg:text-7xl">
              Tüm gayrimenkul operasyonunu OOS ile yönet.
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400 sm:text-base">
              Portföyleri, arayışları, eşleşmeleri ve danışman süreçlerini tek sade merkezde yönetin.
            </p>
            <StoreBadges />
          </div>

          <section className="min-h-[34rem] rounded-[2.5rem] border border-slate-200 bg-slate-950 p-4 text-white shadow-[0_30px_100px_rgba(15,23,42,0.16)] dark:border-white/10 dark:bg-[#050505] dark:shadow-[0_30px_100px_rgba(0,0,0,0.62)]">
            <div className="flex h-full flex-col justify-center rounded-[2rem] border border-white/10 bg-black px-4 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:px-6 sm:py-7 lg:px-7">
              <div className="mb-6">
                <p className="inline-flex items-center gap-1.5 text-xs font-medium text-white/40">
                  Güvenli giriş
                  <LockIcon className="h-3.5 w-3.5 text-emerald-400/90" />
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                  OOS çalışma alanına gir.
                </h2>
                <p className="mt-2 text-sm leading-6 text-white/50">
                  Danışman hesabınızla devam edin veya yeni profilinizi oluşturun.
                </p>
              </div>

              <div className="mb-4 grid gap-2">
                <button
                  type="button"
                  disabled
                  className="flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-950 opacity-95 shadow-sm disabled:cursor-not-allowed"
                >
                  <AppleIcon />
                  Apple ile Devam Et
                </button>
                <button
                  type="button"
                  onClick={continueWithGoogle}
                  disabled={loading || !isConfigured}
                  className="flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm font-medium text-slate-950 shadow-sm transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-55"
                >
                  <GoogleIcon />
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
                    <div className="grid gap-2 sm:grid-cols-[156px_minmax(0,1fr)]">
                      <div className="relative">
                        <span className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-sm font-medium text-white">
                          {getCountryDisplay(selectedSignupCountry)}
                        </span>
                        <select
                          className="input !rounded-2xl !border-white/10 !bg-white/10 !py-3 !pl-4 !pr-4 !text-transparent focus:!border-white/25 focus:!ring-white/10"
                          aria-label="Telefon ülke kodu"
                          value={form.phoneCountryCode}
                          onChange={(event) => update("phoneCountryCode", event.target.value)}
                        >
                          {phoneCountries.map((country) => (
                            <option key={country.value} value={country.value} className="text-slate-950">
                              {country.flag} {country.label} {country.code}
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
                {mode === "login" ? (
                  <div className="flex justify-end">
                    <Link href="/forgot-password" className="text-xs font-medium text-white/50 transition hover:text-white">
                      Şifremi Unuttum
                    </Link>
                  </div>
                ) : null}
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
                  className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-950 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-55"
                >
                  {loading ? "Kontrol ediliyor..." : mode === "signup" ? "Kaydol" : "Oturum aç"}
                </button>
              </div>

              <p className="mt-5 text-center text-xs leading-5 text-white/40">OOS advisors private workspace</p>
            </div>
          </section>
        </section>
      </div>
      <LandingShowcaseSections />
      <OceanCorporateFooter />
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path fill="#4285F4" d="M22.6 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 0 1-2.2 3.3v2.7h3.5c2.1-1.9 3.4-4.7 3.4-8Z" />
      <path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.5-2.7c-1 .6-2.2 1-3.8 1-2.9 0-5.3-1.9-6.2-4.6H2.2v2.8A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.8 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.2H2.2a11 11 0 0 0 0 9.6L5.8 14Z" />
      <path fill="#EA4335" d="M12 5.4c1.6 0 3 .6 4.2 1.6l3.1-3.1A10.5 10.5 0 0 0 12 1 11 11 0 0 0 2.2 7.2L5.8 10C6.7 7.3 9.1 5.4 12 5.4Z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M16.7 12.7c0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.5-1.6-3-1.7-1.3-.1-2.5.8-3.1.8-.7 0-1.7-.8-2.8-.7-1.4 0-2.7.8-3.5 2.1-1.5 2.7-.4 6.7 1.1 8.9.7 1.1 1.6 2.3 2.8 2.2 1.1 0 1.6-.7 2.9-.7 1.4 0 1.8.7 3 .7 1.2 0 2-1.1 2.8-2.2.8-1.2 1.2-2.4 1.2-2.4 0-.1-2.2-.9-2.2-3.8ZM14.6 6.4c.6-.8 1.1-1.8 1-2.9-1 .1-2 .7-2.7 1.5-.6.7-1.1 1.8-1 2.8 1 .1 2-.5 2.7-1.4Z" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="10" width="14" height="10" rx="2.5" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function StoreBadges() {
  return (
    <div className="mt-8 hidden items-center gap-3 lg:flex">
      {/* Real App Store / Google Play URLs will be added later. */}
      <a
        href="#"
        aria-label="App Store’dan indir"
        className="inline-flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 bg-slate-950 px-4 py-2 text-white shadow-sm transition hover:bg-slate-800 dark:border-white/10 dark:bg-[#080808] dark:hover:bg-[#111111]"
      >
        <AppleIcon />
        <span className="leading-none">
          <span className="block text-[10px] text-white/65">Download on the</span>
          <span className="block text-sm font-semibold">App Store</span>
        </span>
      </a>
      <a
        href="#"
        aria-label="Google Play’den indir"
        className="inline-flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 bg-slate-950 px-4 py-2 text-white shadow-sm transition hover:bg-slate-800 dark:border-white/10 dark:bg-[#080808] dark:hover:bg-[#111111]"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path fill="#34A853" d="M4 2.7v18.6l9.7-9.3L4 2.7Z" />
          <path fill="#FBBC05" d="m13.7 12 2.7-2.6L5.3 2.4 13.7 12Z" />
          <path fill="#4285F4" d="M5.3 21.6 16.4 14l-2.7-2L5.3 21.6Z" />
          <path fill="#EA4335" d="m16.4 14 3.1-1.8c.7-.4.7-1.4 0-1.8l-3.1-1.8-2.7 3.4 2.7 2Z" />
        </svg>
        <span className="leading-none">
          <span className="block text-[10px] text-white/65">Get it on</span>
          <span className="block text-sm font-semibold">Google Play</span>
        </span>
      </a>
    </div>
  );
}

function LandingShowcaseSections() {
  const flow = ["Portföy", "Arayış", "Eşleşme", "Komisyon"];
  const trustItems = ["Kurumsal yapı", "Rol bazlı erişim", "Kayıtlı süreç", "Yasal metinler"];

  return (
    <section className="border-t border-slate-200 bg-white px-4 py-14 dark:border-white/10 dark:bg-black sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="oos-card rounded-[2rem] p-6 sm:p-8">
            <p className="text-xs font-medium text-slate-400">Hızlı başlangıç</p>
            <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight sm:text-5xl">
              Dakikalar içinde danışman operasyonunu başlat.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Portföylerini, arayışlarını ve görevlerini tek panelde topla. Dağınık WhatsApp notlarından sistemli deal flow’a geç.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-4">
              {flow.map((item, index) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-stone-50 p-4 dark:border-white/10 dark:bg-[#111111]">
                  <span className="text-xs text-slate-400">0{index + 1}</span>
                  <p className="mt-2 font-semibold">{item}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="oos-card rounded-[2rem] p-6 sm:p-8">
            <p className="text-xs font-medium text-slate-400">Tek sistem</p>
            <h2 className="text-2xl font-semibold tracking-tight">Portföy ve arayışlar tek sistemde.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Danışmanlar ne aradığını yükler, portföy sahipleri güçlü eşleşmeleri görür. Ofis içi bilgi doğru zamanda doğru danışmana ulaşır.
            </p>
            <div className="mt-6 grid gap-3">
              <MetricChip label="10 aktif portföy" />
              <MetricChip label="5 aktif arayış" />
              <MetricChip label="%92 güçlü eşleşme" />
            </div>
          </article>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <article className="oos-card rounded-[2rem] p-6">
            <h2 className="text-2xl font-semibold tracking-tight">Komisyon ve işlem görünürlüğü</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Brüt komisyon, danışman payı, vergi etkisi ve ödeme süreçleri görünür hale gelir. OOS, kapanışa giden süreci ölçülebilir yapar.
            </p>
            <div className="mt-6 space-y-3">
              {["Yetki", "Teklif", "Kapanış"].map((item, index) => (
                <div key={item}>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>{item}</span>
                    <span>{[74, 58, 36][index]}%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-[#111111]">
                    <div className="h-2 rounded-full bg-slate-950 dark:bg-white animate-oos-bar" style={{ width: `${[74, 58, 36][index]}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="oos-card rounded-[2rem] p-6">
            <h2 className="text-2xl font-semibold tracking-tight">Harita ve lokasyon zekası</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
              İstanbul portföylerini harita üzerinde gör, bölge bazlı fırsatları yakala. Konumu eksik portföyleri sistem otomatik öne çıkarır.
            </p>
            <div className="relative mt-6 h-56 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-stone-50 dark:border-white/10 dark:bg-[#111111]">
              {["Beykoz", "Beşiktaş", "Kadıköy"].map((district, index) => (
                <span
                  key={district}
                  className="absolute rounded-full bg-slate-950 px-3 py-1 text-xs font-medium text-white shadow-lg dark:bg-white dark:text-slate-950"
                  style={{ left: `${[18, 52, 64][index]}%`, top: `${[24, 42, 68][index]}%` }}
                >
                  <span className="mr-1 inline-flex h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                  {district}
                </span>
              ))}
            </div>
          </article>

          <article className="rounded-[2rem] border border-white/10 bg-black p-6 text-white shadow-[0_24px_90px_rgba(0,0,0,0.35)]">
            <p className="text-xs text-white/45">Ocean Elite</p>
            <h2 className="mt-4 text-3xl font-semibold">Premium danışman operasyonu</h2>
            <p className="mt-3 text-sm leading-6 text-white/55">
              Portföy, arayış, eşleşme, ödeme ve işlem disiplinini tek sistemde yönetin.
            </p>
            <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-[#080808] p-5">
              <p className="text-sm text-white/50">Ocean Elite</p>
              <p className="mt-2 text-2xl font-semibold">Kurumsal çalışma alanı</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["Öncelikli operasyon", "Sistemli deal flow", "İşlem disiplini"].map((item) => (
                  <span key={item} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/70">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </article>
        </div>

        <article className="oos-card rounded-[2rem] p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-xs font-medium text-slate-400">Güven ve disiplin</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                OceanOS, kurumsal standartla çalışan danışman operasyonu kurar.
              </h2>
              <p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400">
                OceanOS, Star Girişim ve Yatırım A.Ş. çatısı altında yetki, görev, portföy, arayış ve işlem süreçlerini kayıt altına alan dijital operasyon sistemidir.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {trustItems.map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-stone-50 p-5 dark:border-white/10 dark:bg-[#111111]">
                  <p className="font-semibold">{item}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Danışman ofisi için sade, takip edilebilir süreç.</p>
                </div>
              ))}
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

function MetricChip({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-stone-50 px-4 py-3 dark:border-white/10 dark:bg-[#111111]">
      <span className="text-sm font-medium">{label}</span>
      <span className="h-2 w-2 rounded-full bg-emerald-500" />
    </div>
  );
}

function OceanCorporateFooter() {
  const columns = [
    {
      title: "OceanOS",
      links: [
        { label: "Dashboard", href: "/" },
        { label: "Portföyler", href: "/portfolios" },
        { label: "Arayışlar", href: "/requests" },
        { label: "Eşleşmeler", href: "/menu/matches" },
        { label: "Harita", href: "/menu/map" },
        { label: "Ödemeler", href: "/menu/payments" }
      ]
    },
    {
      title: "Danışman Araçları",
      links: [
        { label: "Vergi Hesaplayıcı", href: "/tools/tax-calculator" },
        { label: "İşlem ve Komisyonlar", href: "/menu/commissions" },
        { label: "Raporlar", href: "/menu/reports" },
        { label: "Görevler", href: "/menu/tasks" },
        { label: "Yardım ve Destek", href: "/support" }
      ]
    },
    {
      title: "Kurumsal",
      links: [
        { label: "Hakkımızda", href: "/about" },
        { label: "Ocean Elite", href: "/ocean-elite" },
        { label: "Star Girişim ve Yatırım A.Ş.", href: "/star-girisim-ve-yatirim" },
        { label: "İletişim", href: "/contact" },
        { label: "Kariyer", href: "/careers" },
        { label: "Danışman Başvurusu Yap", href: "/apply-advisor" }
      ]
    },
    {
      title: "Yasal",
      links: legalPages.map((page) => ({ label: page.title, href: `/legal/${page.slug}` }))
    }
  ];

  return (
    <footer className="border-t border-white/10 bg-black px-4 py-12 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <div>
            <BrandLogo
              variant="full"
              size="sm"
              fallbackClassName="text-2xl font-semibold tracking-tight"
            />
            <p className="mt-2 text-sm font-medium text-white/55">Star Girişim ve Yatırım A.Ş.</p>
            <p className="mt-5 max-w-sm text-sm leading-6 text-white/55">
              Ofis değil, sistem. OceanOS, gayrimenkul danışmanlarının portföy, arayış, eşleşme ve işlem süreçlerini yönetmesi için geliştirilmiş dijital operasyon sistemidir.
            </p>
            <div className="mt-6 space-y-2 text-sm text-white/65">
              <p>{OCEAN_CONTACT_PHONE}</p>
              <a href={OCEAN_CONTACT_MAILTO} className="transition hover:text-white">
                {OCEAN_CONTACT_EMAIL}
              </a>
              <p>{OCEAN_CONTACT_ADDRESS}</p>
            </div>
          </div>
          <div className="grid gap-x-8 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">
            {columns.map((column) => (
              <div key={column.title} className="min-w-0">
                <h3 className="text-sm font-semibold">{column.title}</h3>
                <ul className="mt-4 space-y-3 text-sm text-white/55">
                  {column.links.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className="break-words transition hover:text-white">{item.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-10 border-t border-white/10 pt-6 text-xs leading-5 text-white/40">
          <p>OceanOS, Ocean Real Estate markası altında gayrimenkul danışmanlarının portföy, arayış, eşleşme ve işlem süreçlerini yönetmesi için geliştirilmiş dijital operasyon sistemidir.</p>
          <p className="mt-2">Sosyal kanallar: Yakında</p>
        </div>
      </div>
    </footer>
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
    phoneCountries.find((country) => country.value === form.phoneCountryCode || country.code === form.phoneCountryCode) ||
    defaultPhoneCountry;

  function update(key: keyof ProfileForm, value: string) {
    onFormChange({ ...form, [key]: value });
  }

  return (
    <ProfileShell theme={theme} onToggleTheme={onToggleTheme}>
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-44 w-44 items-center justify-center rounded-[2rem] border border-white/10 bg-[#011c40] text-sm font-semibold shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:h-56 sm:w-56">
          <BrandLogo
            variant="ocean-only"
            size="md"
            className="max-w-40 sm:max-w-52"
            fallbackClassName="text-sm font-semibold text-white"
          />
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
        <div className="grid gap-2 sm:grid-cols-[170px_minmax(0,1fr)]">
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-sm font-medium leading-none">
              {getCountryDisplay(selectedPhoneCountry)}
            </span>
            <select
              className="input !rounded-xl !py-3 !pl-4 !pr-4 !text-transparent"
              aria-label="Telefon ülke kodu"
              value={form.phoneCountryCode}
              onChange={(event) => update("phoneCountryCode", event.target.value)}
            >
              {phoneCountries.map((country) => (
                <option key={country.value} value={country.value}>
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
    <main className="relative min-h-dvh overflow-hidden bg-stone-50 px-3 text-slate-950 dark:bg-black dark:text-neutral-50 sm:px-4">
      <div className="relative mx-auto flex min-h-dvh max-w-md items-center justify-center py-6 sm:py-8">
        <section className="w-full rounded-3xl border border-white/60 bg-white/95 p-5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-[#080808] sm:p-6">
          <div className="mb-4 flex justify-end">
            <ThemeToggle />
          </div>
          {children}
        </section>
      </div>
    </main>
  );
}
