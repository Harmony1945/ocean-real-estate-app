"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuthContext } from "../../auth-context";
import {
  createSupabaseAuthClient,
  type AdvisorApplicationRow
} from "@/lib/supabase/client";

const statusLabels: Record<string, string> = {
  new: "Yeni",
  in_review: "İnceleniyor",
  approved: "Onaylandı",
  rejected: "Reddedildi"
};

const modelLabels: Record<string, string> = {
  ocean_elite: "Ocean Elite",
  ocean_core: "Ocean Core"
};

export default function AdvisorApplicationsAdminPage() {
  const { profile } = useAuthContext();
  const supabase = useMemo(() => createSupabaseAuthClient(), []);
  const [applications, setApplications] = useState<AdvisorApplicationRow[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const isAdmin = profile?.role === "admin";

  useEffect(() => {
    if (!isAdmin || !supabase) {
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);
    supabase.getAdvisorApplications()
      .then((rows: AdvisorApplicationRow[]) => {
        if (mounted) setApplications(rows);
      })
      .catch((loadError: Error) => {
        if (mounted) setError(loadError.message);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [isAdmin, supabase]);

  async function reviewApplication(application: AdvisorApplicationRow, status: "in_review" | "approved" | "rejected") {
    setMessage("");
    setError("");
    setWorkingId(application.id);

    try {
      const updated = await supabase.reviewAdvisorApplication(application.id, status, notes[application.id] || "");
      if (updated) {
        setApplications((current) => current.map((item) => item.id === updated.id ? updated : item));
      }

      if (status === "approved") {
        setMessage(updated?.linked_advisor_id
          ? "Başvuru onaylandı ve danışman profili bağlandı."
          : "Başvuru onaylandı. Kullanıcı hesabı oluşturulduktan sonra danışman profili bağlanabilir.");
      } else if (status === "rejected") {
        setMessage("Başvuru reddedildi.");
      } else {
        setMessage("Başvuru incelemeye alındı.");
      }
    } catch (reviewError) {
      setError(reviewError instanceof Error ? reviewError.message : "Başvuru güncellenemedi.");
    } finally {
      setWorkingId("");
    }
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-stone-50 px-4 py-10 text-slate-950 dark:bg-black dark:text-neutral-50 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <Link href="/menu" className="mini-action">Menüye Dön</Link>
          <section className="mt-10 rounded-[1.75rem] border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-[#080808]">
            <h1 className="text-2xl font-semibold">Yetki gerekli</h1>
            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">Bu alan yalnızca admin kullanıcılar içindir.</p>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50 px-4 pb-24 pt-10 text-slate-950 dark:bg-black dark:text-neutral-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link href="/menu" className="mini-action">Menüye Dön</Link>
        <header className="mt-8 border-b border-slate-200 pb-6 dark:border-white/10">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Admin</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Danışman Başvuruları</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Başvuruları inceleyin, onaylayın veya reddedin. Profil varsa danışman kaydı onay anında bağlanır.
          </p>
        </header>

        {error ? <p className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">{error}</p> : null}
        {message ? <p className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">{message}</p> : null}

        <section className="mt-6 grid gap-4">
          {loading ? (
            <p className="rounded-[1.75rem] border border-slate-200 bg-white p-6 text-sm text-slate-500 dark:border-white/10 dark:bg-[#080808] dark:text-slate-400">
              Başvurular yükleniyor...
            </p>
          ) : null}

          {!loading && !applications.length ? (
            <p className="rounded-[1.75rem] border border-dashed border-slate-200 p-6 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
              Henüz danışman başvurusu yok.
            </p>
          ) : null}

          {applications.map((application) => (
            <article key={application.id} className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#080808]">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 dark:border-white/10 dark:text-slate-300">
                      {statusLabels[application.status] || application.status}
                    </span>
                    <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 dark:border-white/10 dark:text-slate-300">
                      {modelLabels[application.preferred_model] || application.preferred_model}
                    </span>
                  </div>
                  <h2 className="mt-3 text-xl font-semibold">{application.full_name}</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{application.email} · {application.phone || "Telefon yok"}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {[application.city, application.district].filter(Boolean).join(" / ") || "Lokasyon belirtilmedi"}
                  </p>
                </div>

                <div className="text-left text-xs leading-5 text-slate-500 dark:text-slate-400 lg:text-right">
                  <p>Oluşturma: {formatDate(application.created_at)}</p>
                  <p>Deneyim: {application.experience_level || "Belirtilmedi"}</p>
                  <p>Şirket: {application.current_company || "Yok"}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-2 text-xs text-slate-500 dark:text-slate-400 sm:grid-cols-2 lg:grid-cols-4">
                <ConsentPill label="KVKK" active={application.kvkk_accepted} />
                <ConsentPill label="Sözleşme" active={application.contract_accepted} />
                <ConsentPill label="Kırmızı çizgiler" active={application.red_lines_accepted} />
                <ConsentPill label="Komisyon modeli" active={application.commission_model_accepted} />
              </div>

              {application.motivation ? (
                <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600 dark:bg-white/[0.04] dark:text-slate-300">
                  {application.motivation}
                </p>
              ) : null}

              <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">
                  İnceleme notu
                  <textarea
                    className="input mt-2 min-h-20 resize-y"
                    value={notes[application.id] || ""}
                    onChange={(event) => setNotes((current) => ({ ...current, [application.id]: event.target.value }))}
                    placeholder="Admin notu"
                  />
                </label>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className="mini-action" disabled={workingId === application.id} onClick={() => reviewApplication(application, "in_review")}>
                    İncelemeye Al
                  </button>
                  <button type="button" className="mini-action border-emerald-200 text-emerald-700 dark:border-emerald-500/30 dark:text-emerald-200" disabled={workingId === application.id} onClick={() => reviewApplication(application, "approved")}>
                    Onayla
                  </button>
                  <button type="button" className="mini-action border-red-200 text-red-700 dark:border-red-500/30 dark:text-red-200" disabled={workingId === application.id} onClick={() => reviewApplication(application, "rejected")}>
                    Reddet
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

function ConsentPill({ label, active }: { label: string; active: boolean }) {
  return (
    <span className={`rounded-full border px-3 py-1 ${active
      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200"
      : "border-slate-200 bg-slate-50 text-slate-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400"
    }`}>
      {label}: {active ? "Tamam" : "Eksik"}
    </span>
  );
}

function formatDate(value?: string) {
  if (!value) return "Tarih yok";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Tarih yok";
  return new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}
