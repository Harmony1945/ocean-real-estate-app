"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuthContext } from "../auth-context";
import type { MenuPageData } from "./menu-data";
import {
  createSupabaseAuthClient,
  getDataSetupMessage,
  getUserDisplayName,
  isSupabaseConfigured,
  type AdvisorCommissionRow,
  type AdvisorDealRow,
  type AdvisorMatchRow,
  type AdvisorPortfolioRow,
  type AdvisorPropertyRow,
  type AdvisorSearchRequestRow,
  type AdvisorTaskRow
} from "@/lib/supabase/client";
import { createCheckoutSession } from "@/lib/oos/payments";
import { demoShowcasePortfolios } from "@/lib/oos/demo-data";
import { formatStatusLabel } from "@/lib/oos/status-labels";

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
  "Beykoz": [41.1323, 29.0924],
  "Ataşehir": [40.9927, 29.1244],
  "Üsküdar": [41.0214, 29.0427]
};

const demoPortfolios: AdvisorPortfolioRow[] = demoShowcasePortfolios.map((portfolio) => ({
  id: portfolio.id,
  owner_user_id: "demo",
  title: portfolio.title,
  location: portfolio.location,
  district: portfolio.district,
  owner: portfolio.owner,
  value: portfolio.value,
  stage: portfolio.stage,
  contract_type: portfolio.contractType,
  next_move: portfolio.nextMove,
  risk: portfolio.risk,
  commission_rate: portfolio.commissionRate,
  commission: portfolio.commission,
  listing_id: portfolio.listingId,
  property_type: portfolio.propertyType,
  area: portfolio.area,
  rooms: portfolio.rooms,
  description: portfolio.description,
  latitude: portfolio.latitude,
  longitude: portfolio.longitude
}));

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
  const [matchRows, setMatchRows] = useState<AdvisorMatchRow[]>([]);
  const [dealRows, setDealRows] = useState<AdvisorDealRow[]>([]);
  const [commissionRows, setCommissionRows] = useState<AdvisorCommissionRow[]>([]);
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
    if (!["map", "tasks", "matches", "commissions"].includes(page.slug)) return;

    let mounted = true;
    setModuleMessage("");

    const loadModuleRows = async () => {
      if (page.slug === "map") {
        const portfolios = await supabase.getPortfolios();
        if (mounted) setPortfolioRows(portfolios);
      }

      if (page.slug === "tasks") {
        const taskRows = await supabase.getTasks();
        if (mounted) setTasks(taskRows);
      }

      if (page.slug === "matches") {
        const [matches, properties, requests] = await Promise.all([
          supabase.getMatches(),
          supabase.getProperties(),
          supabase.getSearchRequests()
        ]);
        if (mounted) {
          setMatchRows(enrichMatches(matches, properties, requests));
        }
      }

      if (page.slug === "commissions") {
        const [deals, commissions] = await Promise.all([
          supabase.getDeals(),
          supabase.getCommissions()
        ]);
        if (mounted) {
          setDealRows(deals);
          setCommissionRows(commissions);
        }
      }
    };

    loadModuleRows()
      .catch((error: Error) => {
        console.error(error);
        setPortfolioRows([]);
        setTasks([]);
        setMatchRows([]);
        setDealRows([]);
        setCommissionRows([]);
        setModuleMessage(page.slug === "tasks"
          ? "Görev altyapısı henüz etkin değil. Manuel takip alanı yakında kullanılabilir olacak."
          : getDataSetupMessage(error.message, { optional: page.slug === "commissions" }));
      });

    return () => {
      mounted = false;
    };
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
          <Link href="/menu" className="mini-action">Menüye Dön</Link>
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
            <article className="oos-card rounded-[1.75rem] p-5 md:col-span-2">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">Onboarding</p>
              <h2 className="mt-2 text-xl font-semibold">Danışman başlangıç listesi</h2>
              <div className="mt-4 grid gap-2 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-2">
                <ChecklistItem label="Sözleşme kabul edildi" done />
                <ChecklistItem label="Kırmızı çizgiler kabul edildi" done />
                <ChecklistItem label="Komisyon modeli kabul edildi" done />
                <ChecklistItem label="Profil bilgileri tamamlandı" done={Boolean(profile?.full_name && profile?.phone && profile?.company)} />
                <ChecklistItem label="İlk portföy eklendi" note="Portföylerim üzerinden takip edilir" />
              </div>
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
            demoMode={!isSupabaseConfigured}
            selectedDistrict={selectedDistrict}
            onSelectDistrict={setSelectedDistrict}
          />
        ) : null}

        {page.slug === "matches" && isSupabaseConfigured ? (
          <section className="mt-6 grid gap-4 md:grid-cols-2">
            {matchRows.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
            {!matchRows.length ? (
              <article className="rounded-[1.75rem] border border-dashed border-slate-200 p-5 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400 md:col-span-2">
                Henüz gerçek eşleşme kaydı yok.
              </article>
            ) : null}
          </section>
        ) : null}

        {page.slug === "commissions" && isSupabaseConfigured ? (
          <section className="mt-6 grid gap-4 md:grid-cols-2">
            <InfoCard title="İşlem kaydı" value={String(dealRows.length)} />
            <InfoCard title="Komisyon kaydı" value={String(commissionRows.length)} />
            {commissionRows.map((commission) => (
              <article key={commission.id} className="oos-card rounded-[1.75rem] p-5">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                  {formatStatusLabel(commission.status || "Komisyon")}
                </p>
                <h2 className="mt-2 text-lg font-semibold">
                  {formatCurrency(Number(commission.net_commission ?? commission.gross_commission ?? commission.commission ?? commission.amount ?? 0))}
                </h2>
              </article>
            ))}
            {!dealRows.length && !commissionRows.length ? (
              <article className="rounded-[1.75rem] border border-dashed border-slate-200 p-5 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400 md:col-span-2">
                Henüz gerçek işlem veya komisyon kaydı yok.
              </article>
            ) : null}
          </section>
        ) : null}

        {(moduleMessage || (!isSupabaseConfigured && ["map", "tasks"].includes(page.slug))) ? (
          <p className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100">
            {moduleMessage || getDataSetupMessage()}
          </p>
        ) : null}

        {(!isSupabaseConfigured || !["matches", "commissions"].includes(page.slug)) ? (
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
        ) : null}

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

function MatchCard({ match }: { match: AdvisorMatchRow }) {
  const property = match.property;
  const portfolio = match.portfolio;
  const searchRequest = match.search_request;
  const score = Number(match.match_score ?? match.score ?? 0);
  const matchTime = formatRelativeMatchTime(match.created_at);
  const opportunityLabel = getMatchOpportunityLabel(score);
  const reasonTags = getMatchReasonTags(match.match_reasons);
  const portfolioTitle = property?.title || portfolio?.title || "Portföy bilgisi bekleniyor";
  const searchTitle = getSearchRequestTitle(searchRequest);
  const matchSummary = formatMatchSummary(property, portfolio);
  const portfolioMeta = [
    property ? [property.city, property.district, property.neighborhood].filter(Boolean).join(" / ") : portfolio?.location || portfolio?.district,
    property?.property_type || portfolio?.property_type,
    property?.asking_price ? formatCurrencyAmount(Number(property.asking_price), property.currency || "TRY") : portfolio?.value ? formatCurrency(Number(portfolio.value)) : ""
  ].filter(Boolean).join(" · ");
  const searchMeta = [
    getSearchLocation(searchRequest),
    getSearchPropertyType(searchRequest),
    formatBudgetRange(searchRequest)
  ].filter(Boolean).join(" · ");

  return (
    <article className="oos-card rounded-[1.75rem] p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getMatchOpportunityClass(score)}`}>
            {opportunityLabel}
          </span>
          <h2 className="mt-3 text-lg font-semibold leading-snug text-slate-950 dark:text-slate-100">
            {searchTitle}
          </h2>
          <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
            → {portfolioTitle}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          {matchTime ? (
            <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-300">
              {matchTime}
            </span>
          ) : null}
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200">
            %{score} Uyum
          </span>
        </div>
      </div>
      {matchSummary ? (
        <p className="mt-4 text-sm font-medium leading-6 text-slate-700 dark:text-slate-300">
          {matchSummary}
        </p>
      ) : null}
      {reasonTags.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {reasonTags.map((reason) => (
            <span key={reason} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-300">
              {reason}
            </span>
          ))}
        </div>
      ) : null}
      {searchMeta ? (
        <p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400">
          Arayış: {searchMeta}
        </p>
      ) : null}
      {portfolioMeta ? (
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
          Eşleşen Portföy: {portfolioMeta}
        </p>
      ) : null}
    </article>
  );
}

function getMatchOpportunityLabel(score: number) {
  if (score >= 90) return "Sıcak Eşleşme";
  if (score >= 75) return "Güçlü Eşleşme";
  if (score >= 60) return "İncelenmeli";
  return "Eşleşme";
}

function getMatchOpportunityClass(score: number) {
  if (score >= 90) return "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200";
  if (score >= 75) return "bg-indigo-50 text-indigo-700 dark:bg-indigo-400/10 dark:text-indigo-200";
  if (score >= 60) return "bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-200";
  return "bg-slate-100 text-slate-600 dark:bg-white/[0.06] dark:text-slate-300";
}

function formatRelativeMatchTime(createdAt?: string | null) {
  if (!createdAt) return "Tarih yok";

  const createdTime = new Date(createdAt).getTime();
  if (Number.isNaN(createdTime)) return "Tarih yok";

  const diffMinutes = Math.max(0, Math.floor((Date.now() - createdTime) / 60000));
  if (diffMinutes < 1) return "Az önce";
  if (diffMinutes < 60) return `${diffMinutes} dk önce`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return diffHours === 1 ? "1 saat önce" : `${diffHours} saat önce`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "1 gün önce";

  return `${diffDays} gün önce`;
}

function formatMatchSummary(
  property?: AdvisorMatchRow["property"],
  portfolio?: AdvisorMatchRow["portfolio"]
) {
  const district = property?.district || portfolio?.district || portfolio?.location;
  const type = property?.property_type || portfolio?.property_type;
  const price = property?.asking_price
    ? formatCompactCurrency(Number(property.asking_price), property.currency || "TRY")
    : portfolio?.value
      ? formatCompactCurrency(Number(portfolio.value), "TRY")
      : "";
  const area = property?.gross_area || property?.net_area || portfolio?.area;

  return [
    district,
    type,
    price,
    area ? `${area} m²` : ""
  ].filter(Boolean).join(" / ");
}

function formatCompactCurrency(value: number, currency: string) {
  const safeCurrency = currency === "TRY" ? "TL" : currency;
  const formatted = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(value || 0);

  return `${formatted} ${safeCurrency}`;
}

function getMatchReasonTags(reasons: unknown) {
  if (!reasons || typeof reasons !== "object" || Array.isArray(reasons)) return [];

  const labels: Record<string, string> = {
    city: "Bölge",
    district: "Bölge",
    location: "Bölge",
    type: "Tip",
    price: "Bütçe",
    budget: "Bütçe",
    area: "Alan",
    features: "Özellik"
  };

  return Array.from(
    new Set(
      Object.keys(reasons)
        .map((key) => labels[key])
        .filter(Boolean)
    )
  );
}

function enrichMatches(
  matches: AdvisorMatchRow[],
  properties: AdvisorPropertyRow[],
  searchRequests: AdvisorSearchRequestRow[]
) {
  return matches.map((match) => ({
    ...match,
    property:
      match.property ??
      properties.find((property) =>
        property.id === match.property_id
      ) ??
      null,
    search_request:
      match.search_request ??
      searchRequests.find((request) => request.id === match.search_request_id) ??
      null
  }));
}

function getSearchRequestTitle(searchRequest?: AdvisorMatchRow["search_request"]) {
  if (!searchRequest) return "Arayış bilgisi bekleniyor";

  if (searchRequest.title) return searchRequest.title;
  if (searchRequest.notes?.startsWith("OceanOS Demo: ")) {
    return searchRequest.notes.replace("OceanOS Demo: ", "");
  }

  return [getSearchLocation(searchRequest), getSearchPropertyType(searchRequest), searchRequest.request_type || "Arayış"]
    .filter(Boolean)
    .join(" · ");
}

function getSearchLocation(searchRequest?: AdvisorMatchRow["search_request"]) {
  if (!searchRequest) return "";
  const districts = Array.isArray(searchRequest.districts)
    ? searchRequest.districts.join(", ")
    : searchRequest.districts || searchRequest.location || "";

  return [searchRequest.city, districts].filter(Boolean).join(" / ");
}

function getSearchPropertyType(searchRequest?: AdvisorMatchRow["search_request"]) {
  if (!searchRequest) return "";
  if (Array.isArray(searchRequest.property_types)) return searchRequest.property_types.join(", ");
  return searchRequest.property_types || searchRequest.property_type || "";
}

function formatBudgetRange(searchRequest?: AdvisorMatchRow["search_request"]) {
  if (!searchRequest) return "";

  const currency = searchRequest.currency || "TRY";
  const min = Number(searchRequest.min_price || 0);
  const max = Number(searchRequest.max_price || 0);

  if (!min && !max) return "";
  if (min && max) return `${formatCurrencyAmount(min, currency)} - ${formatCurrencyAmount(max, currency)}`;
  if (min) return `${formatCurrencyAmount(min, currency)}+`;
  return `Maks ${formatCurrencyAmount(max, currency)}`;
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
  demoMode,
  selectedDistrict,
  onSelectDistrict
}: {
  portfolios: AdvisorPortfolioRow[];
  demoMode: boolean;
  selectedDistrict: string;
  onSelectDistrict: (district: string) => void;
}) {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerLayerRef = useRef<any>(null);
  const [mapError, setMapError] = useState("");
  const markers = portfolios
    .map((portfolio) => ({ portfolio, coordinates: getPortfolioCoordinates(portfolio) }))
    .filter((item): item is { portfolio: AdvisorPortfolioRow; coordinates: [number, number] } => Boolean(item.coordinates));
  const missing = portfolios.filter((portfolio) => !portfolio.latitude || !portfolio.longitude);
  const missingLabels = missing.length
    ? missing.map((item) => item.title)
    : demoMode ? missingLocationItems : [];
  const selectedRows = portfolios.filter((portfolio) =>
    getPortfolioDistrict(portfolio) === selectedDistrict
  );

  useEffect(() => {
    let mounted = true;

    async function mountMap() {
      if (!mapElementRef.current || mapInstanceRef.current) return;
      const leaflet = await import("leaflet").catch((error) => {
        console.error(error);
        setMapError("Harita sağlayıcısı yüklenemedi. Portföyleri liste görünümünde gösteriyoruz.");
        return null;
      });
      if (!leaflet) return;
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
      const leaflet = await import("leaflet").catch((error) => {
        console.error(error);
        setMapError("Harita sağlayıcısı yüklenemedi. Portföyleri liste görünümünde gösteriyoruz.");
        return null;
      });
      if (!leaflet) return;
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
    <section className="mt-6 space-y-4">
      <article className="oos-card overflow-hidden rounded-[2rem] p-5">
        {mapError ? (
          <div className="flex min-h-[30rem] items-center justify-center rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 px-5 text-center text-sm leading-6 text-slate-500 dark:border-white/10 dark:bg-[#111111] dark:text-slate-400">
            {mapError}
          </div>
        ) : (
          <div ref={mapElementRef} className="oos-map-surface relative z-0 min-h-[30rem] rounded-[1.5rem] border border-slate-200 dark:border-white/10 lg:min-h-[42rem]" />
        )}
        <p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400">
          Leaflet ve OpenStreetMap ile ücretsiz, API anahtarsız İstanbul harita temeli. İlçe merkezinden gösterilen kayıtlar yaklaşık konum olarak etiketlenir.
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
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {(selectedRows.length ? selectedRows : portfolios).slice(0, 5).map((portfolio) => (
            <div key={portfolio.id} className="rounded-2xl bg-slate-50 p-4 dark:bg-white/[0.04]">
              <p className="font-medium">{portfolio.title}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {portfolio.location || "Konum bekleniyor"} · {formatCurrency(Number(portfolio.value || 0))}
              </p>
              {!portfolio.latitude || !portfolio.longitude ? (
                <p className="mt-2 text-xs text-amber-700 dark:text-amber-200">Yaklaşık ilçe konumu</p>
              ) : null}
            </div>
          ))}
          {!portfolios.length ? <p className="text-sm text-slate-500 dark:text-slate-400">Haritada gösterilecek portföy yok.</p> : null}
        </div>
        <h3 className="mt-6 text-sm font-semibold">Konumu eksik portföyler</h3>
        <ul className="mt-3 space-y-2 text-sm text-slate-500 dark:text-slate-400">
          {missingLabels.length ? missingLabels.map((item) => <li key={item}>• {item}</li>) : <li>Konumu eksik portföy yok.</li>}
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

function ChecklistItem({ label, done, note }: { label: string; done?: boolean; note?: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-white/[0.04]">
      <span className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs ${done ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-200" : "bg-slate-200 text-slate-500 dark:bg-white/10 dark:text-slate-300"}`}>
        {done ? "✓" : "•"}
      </span>
      <span>
        <span className="block font-medium">{label}</span>
        {note ? <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">{note}</span> : null}
      </span>
    </div>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(value || 0);
}

function formatCurrencyAmount(value: number, currency: string) {
  const safeCurrency = ["TRY", "USD", "EUR", "GBP"].includes(currency) ? currency : "TRY";

  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: safeCurrency,
    maximumFractionDigits: 0
  }).format(value || 0);
}
