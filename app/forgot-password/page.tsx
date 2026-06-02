"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import ThemeToggle from "../theme-toggle";
import { createSupabaseAuthClient, isSupabaseConfigured } from "@/lib/supabase/client";

const genericSuccessMessage = "Eğer bu e-posta adresiyle kayıtlı bir hesap varsa, şifre yenileme bağlantısı gönderildi.";

export default function ForgotPasswordPage() {
  const supabase = useMemo(() => createSupabaseAuthClient(), []);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const normalizedEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Lütfen geçerli bir e-posta adresi girin.");
      return;
    }

    if (!supabase || !isSupabaseConfigured) {
      setError("Supabase bağlantısı eksik. Lütfen daha sonra tekrar deneyin.");
      return;
    }

    setLoading(true);
    try {
      const redirectTo = `${window.location.origin}/reset-password`;
      await supabase.resetPasswordForEmail(normalizedEmail, redirectTo);
    } catch {
      // Keep the submitted-email result generic to avoid account enumeration.
    } finally {
      setSent(true);
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
                Şifrenizi sıfırlayın
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
                OceanOS hesabınıza ait e-posta adresini girin. Size güvenli bir şifre yenileme bağlantısı gönderelim.
              </p>
            </div>

            <form className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.42)] backdrop-blur sm:p-6" onSubmit={submit}>
              {sent ? (
                <div>
                  <p className="text-xs font-medium text-emerald-200">E-postanızı kontrol edin</p>
                  <h2 className="mt-2 text-2xl font-semibold">Bağlantı gönderildi</h2>
                  <p className="mt-3 text-sm leading-6 text-white/70">
                    {genericSuccessMessage}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-white/55">
                    Bağlantı kısa süre içinde gelen kutunuza ulaşacaktır. Spam klasörünü de kontrol etmeyi unutmayın.
                  </p>
                  <p className="mt-4 rounded-2xl border border-white/10 bg-black/25 px-3 py-2 text-xs leading-5 text-white/55">
                    Güvenliğiniz için bağlantı sınırlı süreyle geçerlidir.
                  </p>
                  <Link href="/" className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-2xl bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-white/90">
                    Giriş ekranına dön
                  </Link>
                </div>
              ) : (
                <>
                  <label className="block text-sm font-medium text-white/70">
                    E-posta adresi
                    <input
                      className="input mt-2 !rounded-2xl !border-white/10 !bg-black/25 !px-4 !py-3 !text-white placeholder:!text-white/35 focus:!border-white/25 focus:!ring-white/10"
                      inputMode="email"
                      type="email"
                      autoComplete="email"
                      placeholder="ornek@oceanrealestate.com.tr"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
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
                    {loading ? "Gönderiliyor..." : "Sıfırlama Bağlantısı Gönder"}
                  </button>
                  <Link href="/" className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-2xl border border-white/10 px-4 py-2.5 text-sm font-medium text-white/70 transition hover:border-white/25 hover:text-white">
                    Giriş ekranına dön
                  </Link>
                  <p className="mt-4 text-xs leading-5 text-white/45">
                    Güvenliğiniz için hesap olup olmadığı bilgisi ekranda paylaşılmaz.
                  </p>
                </>
              )}
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
