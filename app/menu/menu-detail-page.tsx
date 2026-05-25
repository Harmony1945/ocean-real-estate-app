"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuthContext } from "../auth-context";
import ThemeToggle from "../theme-toggle";
import type { MenuPageData } from "./menu-data";
import {
  createSupabaseAuthClient,
  getUserDisplayName,
  isSupabaseConfigured,
  type AdvisorPortfolioRow,
  type AdvisorTaskRow
} from "@/lib/supabase/client";
import { createCheckoutSession } from "@/lib/oos/payments";

const mapLocations = [
  { district: "Sarıyer", title: "Yeniköy yalı dairesi", price: "₺92M", top: "22%", left: "42%" },
  { district: "Beşiktaş", title: "Levent aile konutu", price: "₺38M", top: "38%", left: "52%" },
  { district: "Kadıköy", title: "Moda yatırım dairesi", price: "₺21M", top: "64%", left: "68%" },
  { district: "Beyoğlu", title: "Galata ticari alan", price: "₺17M", top: "48%", left: "46%" }
];

const missingLocationItems = ["Malik adres teyidi bekleyen villa", "Yeni ithal edilen Kadıköy portföyü"];

const districtCoordinates: Record<string, [number, number]> = {
  "Sarıyer": [41.1663, 29.0501],
  "Beşiktaş": [41.0438, 29.0094],
  "Kadıköy": [40.9819, 29.0576],
  "Beyoğlu": [41.0369, 28.9851],
  "Şişli": [41.0605, 28.9872],
  "Beykoz": [41.1323, 29.0924]
};

const demoPortfolios: AdvisorPortfolioRow[] = [
  {
    id: "demo-sariyer",
    owner_user_id: "demo",
    title: "Yeniköy yalı dairesi",
    location: "Sarıyer / Yeniköy",
    district: "Sarıyer",
    owner: "Özel Malik",
    value: 92000000,
    stage: "Aktif",
    contract_type: "Satışa Aracılık",
    next_move: null,
    risk: null,
    commission_rate: 2,
    commission: 1840000,
    listing_id: null,
    property_type: "Daire",
    area: "240",
    rooms: "3+1",
    description: null,
    latitude: 41.1242,
    longitude: 29.0702
  },
  {
    id: "demo-kadikoy",
    owner_user_id: "demo",
    title: "Moda yatırım dairesi",
    location: "Kadıköy / Moda",
    district: "Kadıköy",
    owner: "OOS Advisor",
    value: 21000000,
    stage: "Yeni",
    contract_type: "Danışmanlık",
    next_move: null,
    risk: null,
    commission_rate: 2,
    commission: 420000,
    listing_id: null,
    property_type: "Daire",
    area: "95",
    rooms: "2+1",
    description: null,
    latitude: null,
    longitude: null
  }
];

export default function MenuDetailPage({ page }: { page: MenuPageData }) {
  const { user, profile } = useAuthContext();
  const supabase = useMemo(() => createSupabaseAuthClient(), []);
  const [commission, setCommission] = useState(250000);
  const [incomeTaxRate, setIncomeTaxRate] = useState(20);
  const [selectedDistrict, setSelectedDistrict] = useState(mapLocations[0].district);
  const [portfolioRows, setPortfolioRows] = useState<AdvisorPortfolioRow[]>(
    isSupabaseConfigured ? [] : demoPortfolios
  );
  const [tasks, setTasks] = useState<AdvisorTaskRow[]>([]);
  const [moduleMessage, setModuleMessage] = useState("");
  const [paymentNotice, setPaymentNotice] = useState("");
  const displayName = getUserDisplayName(user, profile) || "OOS Advisor";
  const tax = useMemo(() => {
    const vat = Math.round(commission * 0.2);
    const incomeTax = Math.round(commission * (incomeTaxRate / 100));
    return { vat, incomeTax, net: commission - incomeTax };
  }, [commission, incomeTaxRate]);
  const persistentMode = Boolean(isSupabaseConfigured && user && supabase);

  useEffect(() => {
    if (!persistentMode || !supabase) return;
    if (page.slug !== "map" && page.slug !== "tasks") return;

    setModuleMessage("");
    Promise.all([
      page.slug === "map" ? supabase.getPortfolios() : Promise.resolve([]),
      page.slug === "tasks" ? supabase.getTasks() : Promise.resolve([])
    ])
      .then(([portfolios, taskRows]: [AdvisorPortfolioRow[], AdvisorTaskRow[]]) => {
        if (page.slug === "map") setPortfolioRows(portfolios);
        if (page.slug === "tasks") setTasks(taskRows);
      })
      .catch((error: Error) => {
        setPortfolioRows([]);
        setTasks([]);
        setModuleMessage(error.message);
      });
  }, [page.slug, persistentMode, supabase]);

  async function showPaymentNotice() {
    const session = await createCheckoutSession({
      provider: "manual",
      productName: "Ocean Elite",
      amount: 7200,
      currency: "TRY"
    });
    setPaymentNotice(session.message);
  }

  return (
    <main className="min-h-screen bg-stone-50 px-4 pb-[calc(env(safe-area-inset-bottom)+7rem)] pt-20 text-slate-950 dark:bg-black dark:text-neutral-50 sm:px-6 md:pt-24 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="border-b border-slate-200 pb-6 dark:border-slate-800">
          <div className="flex items-center justify-between gap-3">
            <Link href="/menu" className="mini-action">Menüye Dön</Link>
            <ThemeToggle />
          </div>
          <p className="mt-7 text-sm font-medium text-slate-500 dark:text-slate-400">{page.eyebrow}</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 dark:text-slate-100 sm:text-5xl">{page.title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">{page.description}</p>
        </header>

        {page.slug === "profile" ? (
          <section className="mt-6 grid gap-4 md:grid-cols-2">
            <InfoCard title="Ad Soyad" value={displayName} />
            <InfoCard title="E-posta" value={user?.email || "Kurulum bekleniyor"} />
            <InfoCard title="Telefon" value={profile?.phone || "Telefon bilgisi bekleniyor"} />
            <InfoCard title="Şirket" value={profile?.company || "Şirket bilgisi bekleniyor"} />
            <article className="oos-card rounded-[1.75rem] p-5 md:col-span-2">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">Rol</p>
              <h2 className="mt-2 text-xl font-semibold">Danışman</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Rol bilgisi güvenlik ve yetki kontrolü için sistem tarafından yönetilir; bu ekrandan düzenlenemez.
              </p>
            </article>
          </section>
        ) : null}

        {page.slug === "tax-calculator" ? (
          <section className="mt-6 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
            <article className="oos-card rounded-[1.75rem] p-5">
              <h2 className="text-lg font-semibold">Komisyon hesaplama</h2>
              <label className="mt-4 block text-sm font-medium text-slate-500 dark:text-slate-400">
                Brüt komisyon
                <input className="input mt-2" type="number" value={commission} min={0} onChange={(event) => setCommission(Number(event.target.value))} />
              </label>
              <label className="mt-4 block text-sm font-medium text-slate-500 dark:text-slate-400">
                Gelir vergisi oranı
                <input className="input mt-2" type="number" value={incomeTaxRate} min={0} max={45} onChange={(event) => setIncomeTaxRate(Number(event.target.value))} />
              </label>
              <p className="mt-4 text-xs leading-5 text-slate-500 dark:text-slate-400">
                Sonuçlar ön bilgi niteliğindedir. Nihai beyan için mali müşavir teyidi gerekir.
              </p>
            </article>
            <article className="oos-card rounded-[1.75rem] p-5">
              <h2 className="text-lg font-semibold">Tahmini sonuç</h2>
              <Result label="KDV (%20)" value={formatCurrency(tax.vat)} />
              <Result label="Gelir vergisi" value={formatCurrency(tax.incomeTax)} />
              <Result label="Tahmini net" value={formatCurrency(tax.net)} />
            </article>
          </section>
        ) : null}

        {page.slug === "payments" ? (
          <PaymentPanel notice={paymentNotice} onSelectPayment={showPaymentNotice} />
        ) : null}

        {page.slug === "tasks" ? (
          <section className="mt-6 grid gap-4 md:grid-cols-2">
            {(tasks.length ? tasks : []).map((task) => (
              <article key={task.id} className="oos-card rounded-[1.75rem] p-5">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                  {task.done ? "Tamamlandı" : "Açık görev"}
                </p>
                <h2 className="mt-2 text-lg font-semibold">{task.title}</h2>
              </article>
            ))}
            {!tasks.length ? (
              <article className="rounded-[1.75rem] border border-dashed border-slate-200 p-5 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400 md:col-span-2">
                Henüz görev yok.
              </article>
            ) : null}
          </section>
        ) : null}

        {page.slug === "map" ? (
          <MapPanel
            portfolios={portfolioRows}
            selectedDistrict={selectedDistrict}
            onSelectDistrict={setSelectedDistrict}
          />
        ) : null}

        {moduleMessage ? (
          <p className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100">
            {moduleMessage}
          </p>
        ) : null}

        <section className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {page.cards.map((card) => (
            <article key={card.title} className="liquid-glass-strong rounded-[1.75rem] p-5">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-100">{card.title}</h2>
                {card.meta ? <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">{card.meta}</span> : null}
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{card.body}</p>
            </article>
          ))}
        </section>

        {page.actions ? (
          <section className="mt-6 grid gap-3 sm:grid-cols-3">
            {page.actions.map((action) => <div key={action} className="oos-card-muted rounded-2xl p-4 text-sm font-medium">{action}</div>)}
          </section>
        ) : null}
      </div>
    </main>
  );
}

function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <article className="oos-card rounded-[1.75rem] p-5">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">{title}</p>
      <p className="mt-2 break-words text-xl font-semibold">{value}</p>
    </article>
  );
}

function PaymentPanel({
  notice,
  onSelectPayment
}: {
  notice: string;
  onSelectPayment: () => void;
}) {
  return (
    <section className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
      <article className="rounded-[2rem] border border-white/10 bg-black p-5 text-white shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
        <div className="flex min-h-52 flex-col justify-between rounded-[1.5rem] border border-white/10 bg-[linear-gradient(135deg,#050505,#111111)] p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/45">Ocean Elite</p>
              <h2 className="mt-2 text-2xl font-semibold">7.200 TL</h2>
            </div>
            <div className="flex gap-2">
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-black italic text-slate-950">VISA</span>
              <span className="rounded-full border border-white/20 px-2.5 py-1 text-xs font-semibold text-white">Mastercard</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-white/55">Ocean Elite Aylık Fee</p>
            <p className="mt-1 text-sm text-white/80">6.000 TL + KDV</p>
          </div>
        </div>
      </article>

      <article className="oos-card rounded-[2rem] p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Ocean Elite</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Kart bilgileri şu an işlenmez veya saklanmaz. Gerçek tahsilat iyzico entegrasyonu ile aktif edilecektir.
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-[#111111] dark:text-slate-300">
            UI-only
          </span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <InfoCard title="Aylık ücret" value="6.000 TL" />
          <InfoCard title="KDV (%20)" value="1.200 TL" />
          <InfoCard title="Toplam" value="7.200 TL" />
          <InfoCard title="Sağlayıcı" value="iyzico hazır alan" />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <input className="input" placeholder="Kart üzerindeki isim" />
          <input className="input" inputMode="numeric" placeholder="Kart numarası" />
          <input className="input" placeholder="Son kullanma tarihi" />
          <input className="input" inputMode="numeric" placeholder="CVV" />
        </div>
        <textarea className="input mt-3 min-h-20 resize-none" placeholder="Fatura / ödeme notu" />

        {notice ? (
          <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100">
            {notice}
          </p>
        ) : null}
        <button className="btn-primary mt-4 w-full" type="button" onClick={onSelectPayment}>
          Ödeme Seç
        </button>
      </article>
    </section>
  );
}

function MapPanel({
  portfolios,
  selectedDistrict,
  onSelectDistrict
}: {
  portfolios: AdvisorPortfolioRow[];
  selectedDistrict: string;
  onSelectDistrict: (district: string) => void;
}) {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerLayerRef = useRef<any>(null);
  const markers = portfolios
    .map((portfolio) => ({ portfolio, coordinates: getPortfolioCoordinates(portfolio) }))
    .filter((item): item is { portfolio: AdvisorPortfolioRow; coordinates: [number, number] } => Boolean(item.coordinates));
  const missing = portfolios.filter((portfolio) => !portfolio.latitude || !portfolio.longitude);
  const selectedRows = portfolios.filter((portfolio) =>
    getPortfolioDistrict(portfolio) === selectedDistrict
  );

  useEffect(() => {
    let mounted = true;

    async function mountMap() {
      if (!mapElementRef.current || mapInstanceRef.current) return;
      const leaflet = await import("leaflet");
      if (!mounted || !mapElementRef.current) return;

      mapInstanceRef.current = leaflet.map(mapElementRef.current, {
        center: [41.0082, 28.9784],
        zoom: 10,
        scrollWheelZoom: false
      });
      leaflet
        .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors"
        })
        .addTo(mapInstanceRef.current);
      markerLayerRef.current = leaflet.layerGroup().addTo(mapInstanceRef.current);
    }

    mountMap();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    async function syncMarkers() {
      if (!mapInstanceRef.current || !markerLayerRef.current) return;
      const leaflet = await import("leaflet");
      markerLayerRef.current.clearLayers();

      markers.forEach(({ portfolio, coordinates }) => {
        const marker = leaflet.marker(coordinates, {
          icon: leaflet.divIcon({
            className: "",
            html: '<span style="display:block;width:18px;height:18px;border-radius:999px;background:#111;border:3px solid white;box-shadow:0 8px 22px rgba(0,0,0,.35)"></span>',
            iconSize: [18, 18],
            iconAnchor: [9, 9]
          })
        });
        marker
          .bindPopup(
            `<strong>${escapeHtml(portfolio.title)}</strong><br />${escapeHtml(portfolio.location || "Konum bekleniyor")}<br />${formatCurrency(Number(portfolio.value || 0))}<br />${escapeHtml(portfolio.owner || "OOS Advisor")}<br /><a href="/portfolios">Detaya Git</a>`
          )
          .addTo(markerLayerRef.current);
      });
    }

    syncMarkers();
  }, [markers]);

  return (
    <section className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
      <article className="oos-card overflow-hidden rounded-[1.75rem] p-5">
        <div ref={mapElementRef} className="min-h-[22rem] rounded-[1.5rem] border border-slate-200 dark:border-white/10" />
        <p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400">
          Leaflet ve OpenStreetMap ile ücretsiz, API anahtarsız İstanbul harita temeli. Koordinat yoksa yalnızca ilçe merkezi yaklaşık gösterilir.
        </p>
      </article>

      <article className="oos-card rounded-[1.75rem] p-5">
        <h2 className="text-lg font-semibold">İstanbul portföyleri</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.keys(districtCoordinates).map((district) => (
            <button
              key={district}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${selectedDistrict === district ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "bg-slate-100 text-slate-600 dark:bg-[#111111] dark:text-slate-300"}`}
              type="button"
              onClick={() => onSelectDistrict(district)}
            >
              {district}
            </button>
          ))}
        </div>
        <div className="mt-4 grid gap-3">
          {(selectedRows.length ? selectedRows : portfolios).slice(0, 5).map((portfolio) => (
            <div key={portfolio.id} className="rounded-2xl bg-slate-50 p-4 dark:bg-white/[0.04]">
              <p className="font-medium">{portfolio.title}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {portfolio.location || "Konum bekleniyor"} · {formatCurrency(Number(portfolio.value || 0))}
              </p>
            </div>
          ))}
          {!portfolios.length ? <p className="text-sm text-slate-500 dark:text-slate-400">Haritada gösterilecek portföy yok.</p> : null}
        </div>
        <h3 className="mt-6 text-sm font-semibold">Konumu eksik portföyler</h3>
        <ul className="mt-3 space-y-2 text-sm text-slate-500 dark:text-slate-400">
          {(missing.length ? missing.map((item) => item.title) : missingLocationItems).map((item) => <li key={item}>• {item}</li>)}
        </ul>
      </article>
    </section>
  );
}

function getPortfolioDistrict(portfolio: AdvisorPortfolioRow) {
  return portfolio.district || portfolio.location?.split("/")?.[0]?.trim() || "";
}

function getPortfolioCoordinates(portfolio: AdvisorPortfolioRow): [number, number] | null {
  if (portfolio.latitude && portfolio.longitude) return [Number(portfolio.latitude), Number(portfolio.longitude)];
  return districtCoordinates[getPortfolioDistrict(portfolio)] || null;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#039;"
    };
    return entities[character] || character;
  });
}

function Result({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-4 rounded-2xl bg-slate-50 p-4 dark:bg-white/[0.04]">
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(value || 0);
}
