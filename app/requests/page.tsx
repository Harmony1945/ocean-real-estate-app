"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuthContext } from "../auth-context";
import {
  createSupabaseAuthClient,
  getDataSetupMessage,
  isSupabaseConfigured,
  type AdvisorSearchRequestRow,
  type SearchRequestInput
} from "@/lib/supabase/client";
import { formatStatusLabel, formatUrgencyLabel, getStatusPillClass, getUrgencyPillClass } from "@/lib/oos/status-labels";

type RequestCard = {
  id: string;
  title: string;
  location: string;
  propertyType: string;
  minPrice: number;
  maxPrice: number;
  currency: string;
  purpose: string;
  urgency: string;
  notes: string;
  status: string;
};

const demoRequests: RequestCard[] = [
  {
    id: "demo-1",
    title: "Boğaz hattı aile konutu",
    location: "Sarıyer / Beşiktaş",
    propertyType: "Konut",
    minPrice: 25000000,
    maxPrice: 90000000,
    currency: "TRY",
    purpose: "Satın Alma",
    urgency: "Sıcak",
    notes: "3+1 veya 4+1, otoparklı, yüksek bütçeli arayış.",
    status: "Aktif"
  },
  {
    id: "demo-2",
    title: "Kadıköy yatırım dairesi",
    location: "Kadıköy",
    propertyType: "Daire",
    minPrice: 8000000,
    maxPrice: 22000000,
    currency: "TRY",
    purpose: "Yatırım",
    urgency: "Aktif",
    notes: "Kira getirisi yüksek merkezi lokasyon tercih ediliyor.",
    status: "Aktif"
  }
];

const emptyForm = {
  title: "",
  location: "",
  propertyType: "Konut",
  minPrice: "",
  maxPrice: "",
  currency: "TRY",
  purpose: "Satın Alma",
  urgency: "normal",
  notes: "",
  status: "active"
};

const requestTypeOptions = ["Satın Alma", "Kiralama", "Yatırım", "Arsa", "Ticari", "Kat Karşılığı"];
const propertyTypeOptions = ["Konut", "Daire", "Villa", "Arsa", "Ticari", "Ofis", "Mağaza", "Rezidans"];
const urgencyOptions = [
  { value: "urgent", label: "Acil" },
  { value: "high", label: "Yüksek" },
  { value: "medium", label: "Orta" },
  { value: "normal", label: "Normal" },
  { value: "low", label: "Düşük" }
];
const statusOptions = [
  { value: "active", label: "Aktif" },
  { value: "pending", label: "Beklemede" },
  { value: "closed", label: "Kapalı" }
];

export default function RequestsRoutePage() {
  const { user } = useAuthContext();
  const supabase = useMemo(() => createSupabaseAuthClient(), []);
  const [items, setItems] = useState<RequestCard[]>(isSupabaseConfigured ? [] : demoRequests);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const persistentMode = Boolean(isSupabaseConfigured && user && supabase);

  useEffect(() => {
    if (!persistentMode || !supabase) return;
    setLoading(true);
    setMessage("");
    supabase.getSearchRequests()
      .then((rows: AdvisorSearchRequestRow[]) => setItems(rows.map(fromRow)))
      .catch((error: Error) => {
        console.error(error);
        setItems([]);
        setMessage(getDataSetupMessage(error.message));
      })
      .finally(() => setLoading(false));
  }, [persistentMode, supabase]);

  async function saveRequest() {
    if (!form.title.trim() || !form.location.trim()) {
      setMessage("Arayış başlığı ve lokasyon zorunlu.");
      return;
    }

    const payload: SearchRequestInput = {
      title: form.title.trim(),
      location: form.location.trim(),
      property_type: form.propertyType.trim(),
      min_price: Number(form.minPrice || 0),
      max_price: Number(form.maxPrice || 0),
      currency: form.currency,
      purpose: form.purpose.trim(),
      urgency: form.urgency,
      notes: form.notes.trim(),
      status: form.status
    };

    setSaving(true);
    if (persistentMode && supabase) {
      try {
        const row = editingId
          ? await supabase.updateSearchRequest(editingId, payload)
          : await supabase.createSearchRequest(payload);
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
        setMessage(error instanceof Error ? getDataSetupMessage(error.message) : "Arayış kaydedilemedi.");
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

  async function closeRequest(id: string) {
    setBusyId(id);
    if (persistentMode && supabase) {
      try {
        await supabase.updateSearchRequest(id, { status: "closed" });
      } catch (error) {
        console.error(error);
        setMessage(error instanceof Error ? getDataSetupMessage(error.message) : "Arayış güncellenemedi.");
        setBusyId(null);
        return;
      }
    }

    setItems((current) => current.map((item) => (item.id === id ? { ...item, status: "closed" } : item)));
    setBusyId(null);
  }

  async function deleteRequest(id: string) {
    setBusyId(id);
    if (persistentMode && supabase) {
      try {
        await supabase.deleteSearchRequest(id);
      } catch (error) {
        console.error(error);
        setMessage(error instanceof Error ? getDataSetupMessage(error.message) : "Arayış silinemedi.");
        setBusyId(null);
        return;
      }
    }

    setItems((current) => current.filter((item) => item.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setForm(emptyForm);
    }
    setBusyId(null);
  }

  function editRequest(item: RequestCard) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      location: item.location,
      propertyType: item.propertyType,
      minPrice: String(item.minPrice || ""),
      maxPrice: String(item.maxPrice || ""),
      currency: item.currency,
      purpose: item.purpose,
      urgency: normalizeUrgencyValue(item.urgency),
      notes: item.notes,
      status: normalizeStatusValue(item.status)
    });
  }

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-5 pb-[calc(env(safe-area-inset-bottom)+7rem)] text-slate-950 dark:bg-black dark:text-neutral-50 sm:px-6 md:pb-8 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="border-b border-slate-200 pb-6 dark:border-white/10">
          <Link href="/" title="Ana sayfaya dön" aria-label="Ana sayfaya dön" className="inline-flex items-center gap-3 rounded-2xl transition hover:opacity-80">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-semibold shadow-sm dark:border-white/10 dark:bg-[#080808]">
              O
            </span>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Ocean Operating System</p>
          </Link>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">Arayışlarım</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Aktif müşteri talepleri, takip öncelikleri ve eşleşme bağlantıları için kalıcı route.
          </p>
        </header>

        {getDataSetupMessage(message) ? <SetupNotice message={getDataSetupMessage(message)} /> : null}
        {loading ? <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">Arayışlar yükleniyor...</p> : null}

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <Metric label="Aktif arayış" value={items.filter((item) => !["closed", "Kapalı", "Kapatıldı"].includes(item.status)).length} />
          <Metric label="Acil/Yüksek" value={items.filter((item) => ["Acil", "Yüksek"].includes(formatUrgencyLabel(item.urgency))).length} />
          <Metric label="Bugünkü takip" value={items.length} />
        </section>

        <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#080808]">
          <h2 className="text-lg font-semibold">{editingId ? "Arayışı düzenle" : "İlk arayışını oluştur"}</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <input className="input" placeholder="Başlık" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
            <input className="input" placeholder="Lokasyon" value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} />
            <select className="input" value={form.propertyType} onChange={(event) => setForm({ ...form, propertyType: event.target.value })}>
              {propertyTypeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
            <input className="input" inputMode="numeric" placeholder="Min fiyat" value={form.minPrice} onChange={(event) => setForm({ ...form, minPrice: event.target.value })} />
            <input className="input" inputMode="numeric" placeholder="Maks fiyat" value={form.maxPrice} onChange={(event) => setForm({ ...form, maxPrice: event.target.value })} />
            <select className="input" value={form.purpose} onChange={(event) => setForm({ ...form, purpose: event.target.value })}>
              {requestTypeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
            <select className="input" value={form.urgency} onChange={(event) => setForm({ ...form, urgency: event.target.value })}>
              {urgencyOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <select className="input" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
              {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
          <textarea className="input mt-3 min-h-24 resize-none" placeholder="Notlar" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-end">
            {editingId ? <button className="btn-secondary" type="button" disabled={saving} onClick={() => { setEditingId(null); setForm(emptyForm); }}>Vazgeç</button> : null}
            <button className="btn-primary" type="button" disabled={saving} onClick={saveRequest}>{saving ? "Kaydediliyor..." : "Kaydet"}</button>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          {items.length ? items.map((item) => (
            <article key={item.id} className="liquid-glass-strong rounded-[2rem] p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold">{item.title}</h2>
                  <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                    {item.location} · {item.purpose}
                  </p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {[item.propertyType, formatBudgetRange(item.minPrice, item.maxPrice)].filter(Boolean).join(" · ")}
                  </p>
                  {item.notes ? <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">{item.notes}</p> : null}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${getUrgencyPillClass(item.urgency)}`}>
                    {formatUrgencyLabel(item.urgency)}
                  </span>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${getStatusPillClass(item.status)}`}>
                    {formatStatusLabel(item.status)}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button className="mini-action" type="button" onClick={() => editRequest(item)}>Düzenle</button>
                <button className="mini-action" type="button" disabled={busyId === item.id} onClick={() => closeRequest(item.id)}>{busyId === item.id ? "İşleniyor..." : "Kapat"}</button>
                <button className="mini-action !text-red-600" type="button" disabled={busyId === item.id} onClick={() => deleteRequest(item.id)}>Sil</button>
              </div>
            </article>
          )) : (
            <article className="rounded-[2rem] border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500 dark:border-white/10 dark:text-slate-400 md:col-span-2">
              <p>İlk arayışını oluştur.</p>
              <button className="btn-primary mt-4" type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                Arayış oluştur
              </button>
            </article>
          )}
        </section>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href="/" className="btn-primary">Ana Sayfa’ya Dön</Link>
          <Link href="/menu" className="btn-secondary">Menüyü Aç</Link>
          <Link href="/menu/matches" className="btn-secondary">Eşleşmeleri Gör</Link>
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

function fromRow(row: AdvisorSearchRequestRow): RequestCard {
  return {
    id: row.id,
    title: row.title || row.notes?.replace("OceanOS Demo: ", "") || "Arayış bilgisi bekleniyor",
    location: row.location || formatRequestLocation(row),
    propertyType: normalizeListValue(row.property_types) || row.property_type || "Konut",
    minPrice: Number(row.min_price || 0),
    maxPrice: Number(row.max_price || 0),
    currency: row.currency || "TRY",
    purpose: row.request_type || row.purpose || "Satın Alma",
    urgency: row.urgency || "normal",
    notes: row.notes || "",
    status: row.status || "active"
  };
}

function fromForm(form: typeof emptyForm): RequestCard {
  return {
    id: "",
    title: form.title.trim() || "İsimsiz arayış",
    location: form.location.trim() || "Konum bekleniyor",
    propertyType: form.propertyType || "Konut",
    minPrice: Number(form.minPrice || 0),
    maxPrice: Number(form.maxPrice || 0),
    currency: form.currency,
    purpose: form.purpose,
    urgency: form.urgency,
    notes: form.notes,
    status: form.status
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

function formatBudgetRange(minPrice: number, maxPrice: number) {
  if (minPrice && maxPrice) return `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`;
  if (maxPrice) return `${formatCurrency(maxPrice)} üst limit`;
  if (minPrice) return `${formatCurrency(minPrice)} ve üzeri`;
  return "";
}

function normalizeListValue(value?: string[] | string | null) {
  if (Array.isArray(value)) return value.filter(Boolean).join(", ");
  return value || "";
}

function formatRequestLocation(row: AdvisorSearchRequestRow) {
  const districts = normalizeListValue(row.districts);
  return [row.city, districts].filter(Boolean).join(" / ") || "Konum bekleniyor";
}

function normalizeUrgencyValue(value?: string | null) {
  const label = formatUrgencyLabel(value);
  if (label === "Acil") return "urgent";
  if (label === "Yüksek") return "high";
  if (label === "Orta") return "medium";
  if (label === "Düşük") return "low";
  return "normal";
}

function normalizeStatusValue(value?: string | null) {
  const label = formatStatusLabel(value);
  if (label === "Kapalı" || value === "Kapatıldı") return "closed";
  if (label === "Beklemede") return "pending";
  return "active";
}
