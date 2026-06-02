"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import ThemeToggle from "../theme-toggle";
import { createSupabaseAuthClient, isSupabaseConfigured } from "@/lib/supabase/client";

type RecoveryState = "checking" | "ready" | "invalid" | "success";

export default function ResetPasswordPage() {
  const supabase = useMemo(() => createSupabaseAuthClient(), []);
  const [recoveryState, setRecoveryState] = useState<RecoveryState>("checking");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadRecoverySession() {
      if (!supabase || !isSupabaseConfigured) {
        setRecoveryState("invalid");
        return;
      }

      try {
        const redirectResult = await supabase.consumeOAuthRedirect();
        const session = redirectResult.session || (await supabase.getSession());
        if (!mounted) return;
        setRecoveryState(session?.access_token ? "ready" : "invalid");
      } catch {
        if (mounted) setRecoveryState("invalid");
      }
    }

    loadRecoverySession();
    return () => {
      mounted = false;
    };
  }, [supabase]);

  const strength = getPasswordStrength(password);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Şifre en az 8 karakter olmalıdır.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor.");
      return;
    }

    if (!supabase || recoveryState !== "ready") {
      setError("Bağlantı geçersiz veya süresi dolmuş olabilir.");
      return;
    }

    setLoading(true);
    try {
      await supabase.updatePassword(password);
      setRecoveryState("success");
      setPassword("");
      setConfirmPassword("");
    } catch {
      setError("Şifre güncellenemedi. Bağlantı geçersiz veya süresi dolmuş olabilir.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black px-4 py-5 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-4xl flex-col">
        <header className="flex items-center justify-between gap-3">
          <Link href="/" className="text-sm font-medium text-white/60 transition hover:text-white">
            Giriş ekranına dön
          </Link>
          <ThemeToggle />
        </header>

        <section className="flex flex-1 items-center py-12">
          <div className="grid w-full gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,0.7fr)] lg:items-center">
            <div>
              <p className="text-xs font-medium text-white/40">OceanOS güvenli hesap erişimi</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
                Yeni şifre belirleyin
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
                Hesabınız için güçlü ve güvenli bir şifre oluşturun.
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.42)] backdrop-blur sm:p-6">
              {recoveryState === "checking" ? (
                <p className="text-sm leading-6 text-white/70">Güvenli bağlantı kontrol ediliyor...</p>
              ) : null}

              {recoveryState === "invalid" ? (
                <div>
                  <p className="text-xs font-medium text-amber-200">Bağlantı doğrulanamadı</p>
                  <h2 className="mt-2 text-2xl font-semibold">Yeni bağlantı gerekli</h2>
                  <p className="mt-3 text-sm leading-6 text-white/70">
                    Bağlantı geçersiz veya süresi dolmuş olabilir. Yeni bir sıfırlama bağlantısı talep edin.
                  </p>
                  <Link href="/forgot-password" className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-2xl bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-white/90">
                    Yeni Bağlantı Gönder
                  </Link>
                </div>
              ) : null}

              {recoveryState === "success" ? (
                <div>
                  <p className="text-xs font-medium text-emerald-200">Şifreniz güncellendi</p>
                  <h2 className="mt-2 text-2xl font-semibold">Girişe hazırsınız</h2>
                  <p className="mt-3 text-sm leading-6 text-white/70">
                    Yeni şifrenizle OceanOS’a giriş yapabilirsiniz.
                  </p>
                  <div className="mt-5 grid gap-3">
                    <Link href="/" className="inline-flex min-h-11 w-full items-center justify-center rounded-2xl bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-white/90">
                      Girişe Dön
                    </Link>
                    <Link href="/" className="inline-flex min-h-11 w-full items-center justify-center rounded-2xl border border-white/10 px-4 py-2.5 text-sm font-medium text-white/70 transition hover:border-white/25 hover:text-white">
                      OceanOS’a Devam Et
                    </Link>
                  </div>
                </div>
              ) : null}

              {recoveryState === "ready" ? (
                <form onSubmit={submit}>
                  <label className="block text-sm font-medium text-white/70">
                    Yeni şifre
                    <input
                      className="input mt-2 !rounded-2xl !border-white/10 !bg-black/25 !px-4 !py-3 !text-white placeholder:!text-white/35 focus:!border-white/25 focus:!ring-white/10"
                      type="password"
                      autoComplete="new-password"
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        setError("");
                      }}
                    />
                  </label>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <span className="text-xs text-white/45">Şifre gücü</span>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${strength.className}`}>
                      {strength.label}
                    </span>
                  </div>
                  <label className="mt-4 block text-sm font-medium text-white/70">
                    Yeni şifre tekrar
                    <input
                      className="input mt-2 !rounded-2xl !border-white/10 !bg-black/25 !px-4 !py-3 !text-white placeholder:!text-white/35 focus:!border-white/25 focus:!ring-white/10"
                      type="password"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(event) => {
                        setConfirmPassword(event.target.value);
                        setError("");
                      }}
                    />
                  </label>
                  {error ? <p className="mt-3 text-sm text-red-200">{error}</p> : null}
                  <button
                    className="mt-4 min-h-12 w-full rounded-2xl bg-white px-4 py-3 text-sm font-medium text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-55"
                    disabled={loading}
                    type="submit"
                  >
                    {loading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
                  </button>
                  <Link href="/" className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-2xl border border-white/10 px-4 py-2.5 text-sm font-medium text-white/70 transition hover:border-white/25 hover:text-white">
                    Giriş ekranına dön
                  </Link>
                </form>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-ZÇĞİÖŞÜ]/.test(password) && /[a-zçğıöşü]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-zÇĞİÖŞÜçğıöşü0-9]/.test(password)) score += 1;

  if (score >= 4) return { label: "Güçlü", className: "bg-emerald-400/10 text-emerald-200" };
  if (score >= 2) return { label: "Orta", className: "bg-amber-400/10 text-amber-200" };
  return { label: "Zayıf", className: "bg-red-400/10 text-red-200" };
}
