"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuthContext } from "../auth-context";
import {
  createSupabaseAuthClient,
  getDataSetupMessage,
  isSupabaseConfigured,
  type AdvisorPortfolioRow,
  type PortfolioInput
} from "@/lib/supabase/client";
import { demoShowcasePortfolios } from "@/lib/oos/demo-data";

type PortfolioCard = {
  id: string;
  title: string;
  location: string;
  owner: string;
  value: number;
  stage: string;
  propertyType: string;
  description: string;
};

const demoPortfolios: PortfolioCard[] = demoShowcasePortfolios.map((portfolio) => ({
  id: portfolio.id,
  title: portfolio.title,
  location: portfolio.location,
  owner: portfolio.owner,
  value: portfolio.value,
  stage: portfolio.stage,
  propertyType: portfolio.propertyType,
  description: portfolio.description
}));

const emptyForm = {
  title: "",
  location: "",
  owner: "",
  value: "",
  stage: "Aktif",
  propertyType: "Konut",
  description: ""
};

export default function PortfoliosRoutePage() {
  const { user } = useAuthContext();
  const supabase = useMemo(() => createSupabaseAuthClient(), []);
  const [items, setItems] = useState<PortfolioCard[]>(isSupabaseConfigured ? [] : demoPortfolios);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const persistentMode = Boolean(isSupabaseConfigured && user && supabase);

  useEffect(() => {
    if (!persistentMode || !supabase) return;
    setLoading(true);
    setMessage("");
    supabase.getPortfolios()
      .then((rows: AdvisorPortfolioRow[]) => setItems(rows.map(fromRow)))
      .catch((error: Error) => {
        console.error(error);
        setItems([]);
        setMessage(getDataSetupMessage(error.message));
      })
      .finally(() => setLoading(false));
  }, [persistentMode, supabase]);

  async function savePortfolio() {
    if (!form.title.trim()) {
      setMessage("Portföy başlığı zorunlu.");
      return;
    }

    const payload: PortfolioInput = {
      title: form.title.trim(),
      location: form.location.trim(),
      district: form.location.split("/")[0]?.trim() || null,
      owner: form.owner.trim(),
      value: Number(form.value || 0),
      stage: form.stage,
      property_type: form.propertyType.trim(),
      description: form.description.trim()
    };

    setSaving(true);
    if (persistentMode && supabase) {
      try {
        const row = editingId
          ? await supabase.updatePortfolio(editingId, payload)
          : await supabase.createPortfolio(payload);
        if (row) {
          setItems((current) =>
            editingId
              ? current.map((item) => (item.id === editingId ? fromRow(row) : item))
              : [fromRow(row), ...current]
          );
        }
        setMessage("");
      } catch (error) {
        console.error(error);
        setMessage(error instanceof Error ? getDataSetupMessage(error.message) : "Portföy kaydedilemedi.");
        setSaving(false);
        return;
      }
    } else {
      const card = { ...fromForm(form), id: editingId || `demo-${Date.now()}` };
      setItems((current) =>
        editingId ? current.map((item) => (item.id === editingId ? card : item)) : [card, ...current]
      );
    }

    setForm(emptyForm);
    setEditingId(null);
    setSaving(false);
  }

  async function deletePortfolio(id: string) {
    setDeletingId(id);
    if (persistentMode && supabase) {
      try {
        await supabase.deletePortfolio(id);
      } catch (error) {
        console.error(error);
        setMessage(error instanceof Error ? getDataSetupMessage(error.message) : "Portföy silinemedi.");
        setDeletingId(null);
        return;
      }
    }

    setItems((current) => current.filter((item) => item.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setForm(emptyForm);
    }
    setDeletingId(null);
  }

  function editPortfolio(item: PortfolioCard) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      location: item.location,
      owner: item.owner,
      value: String(item.value || ""),
      stage: item.stage,
      propertyType: item.propertyType,
      description: item.description
    });
  }

  const activeCount = items.filter((item) => item.stage !== "Kapandı").length;
  const missingCount = items.filter((item) => !item.location || !item.owner).length;

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-5 pb-[calc(env(safe-area-inset-bottom)+7rem)] text-slate-950 dark:bg-black dark:text-neutral-50 sm:px-6 md:pb-8 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="border-b border-slate-200 pb-6 dark:border-white/10">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-semibold shadow-sm dark:border-white/10 dark:bg-[#080808]">
              O
            </span>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Ocean Operating System</p>
          </div>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">Portföylerim</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Danışmanın aktif portföyleri, eksik bilgi kontrolleri ve hızlı takip notları için kalıcı çalışma alanı.
          </p>
        </header>

        {getDataSetupMessage(message) ? <SetupNotice message={getDataSetupMessage(message)} /> : null}
        {loading ? <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">Portföyler yükleniyor...</p> : null}

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <Metric label="Aktif portföy" value={activeCount} />
          <Metric label="Eksik bilgi" value={missingCount} />
          <Metric label="Toplam değer" value={formatCurrency(items.reduce((sum, item) => sum + item.value, 0))} />
        </section>

        <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#080808]">
          <h2 className="text-lg font-semibold">{editingId ? "Portföyü düzenle" : "İlk portföyünü ekle"}</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <input className="input" placeholder="Başlık" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
            <input className="input" placeholder="Lokasyon" value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} />
            <input className="input" placeholder="Malik / kaynak" value={form.owner} onChange={(event) => setForm({ ...form, owner: event.target.value })} />
            <input className="input" inputMode="numeric" placeholder="Değer" value={form.value} onChange={(event) => setForm({ ...form, value: event.target.value })} />
            <input className="input" placeholder="Aşama" value={form.stage} onChange={(event) => setForm({ ...form, stage: event.target.value })} />
            <input className="input" placeholder="Portföy tipi" value={form.propertyType} onChange={(event) => setForm({ ...form, propertyType: event.target.value })} />
          </div>
          <textarea className="input mt-3 min-h-24 resize-none" placeholder="Kısa açıklama" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-end">
            {editingId ? <button className="btn-secondary" type="button" disabled={saving} onClick={() => { setEditingId(null); setForm(emptyForm); }}>Vazgeç</button> : null}
            <button className="btn-primary" type="button" disabled={saving} onClick={savePortfolio}>{saving ? "Kaydediliyor..." : "Kaydet"}</button>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          {items.length ? items.map((item) => (
            <article key={item.id} className="liquid-glass-strong rounded-[2rem] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{item.description || "Açıklama bekleniyor."}</p>
                  <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{item.location} · {formatCurrency(item.value)}</p>
                </div>
                <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:bg-[#111111] dark:text-slate-300">
                  {item.stage}
                </span>
              </div>
              <div className="mt-4 flex gap-2">
                <button className="mini-action" type="button" onClick={() => editPortfolio(item)}>Düzenle</button>
                <button className="mini-action !text-red-600" type="button" disabled={deletingId === item.id} onClick={() => deletePortfolio(item.id)}>{deletingId === item.id ? "Siliniyor..." : "Sil"}</button>
              </div>
            </article>
          )) : (
            <article className="rounded-[2rem] border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500 dark:border-white/10 dark:text-slate-400 md:col-span-2">
              <p>İlk portföyünü ekle.</p>
              <button className="btn-primary mt-4" type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                Portföy ekle
              </button>
            </article>
          )}
        </section>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href="/" className="btn-primary">Ana Sayfa’ya Dön</Link>
          <Link href="/menu" className="btn-secondary">Menüyü Aç</Link>
          <Link href="/menu/map" className="btn-secondary">Haritada Gör</Link>
        </div>
      </div>
    </main>
  );
}

function SetupNotice({ message }: { message: string }) {
  return (
    <p className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100">
      {message}
    </p>
  );
}

function fromRow(row: AdvisorPortfolioRow): PortfolioCard {
  return {
    id: row.id,
    title: row.title,
    location: row.location || "Konum bekleniyor",
    owner: row.owner || "Malik bekleniyor",
    value: Number(row.value || 0),
    stage: row.stage || "Aktif",
    propertyType: row.property_type || "Konut",
    description: row.description || ""
  };
}

function fromForm(form: typeof emptyForm): PortfolioCard {
  return {
    id: "",
    title: form.title.trim() || "İsimsiz portföy",
    location: form.location.trim() || "Konum bekleniyor",
    owner: form.owner.trim() || "Malik bekleniyor",
    value: Number(form.value || 0),
    stage: form.stage || "Aktif",
    propertyType: form.propertyType || "Konut",
    description: form.description
  };
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="oos-card-muted rounded-2xl p-4">
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(value || 0);
}
