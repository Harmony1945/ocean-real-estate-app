"use client";

import Link from "next/link";
import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuthContext } from "../auth-context";
import type { MenuPageData } from "./menu-data";
import {
  createSupabaseAuthClient,
  getDataSetupMessage,
  getUserDisplayName,
  isSupabaseConfigured,
  type ActivityLogRow,
  type AdvisorCommissionRow,
  type AdvisorDealRow,
  type AdvisorMatchRow,
  type AdvisorPropertyRow,
  type AdvisorRow,
  type AdvisorSearchRequestRow,
  type AdvisorTaskRow,
  type CommissionRuleRow,
  type CommissionSplitRow,
  type RevenueTransactionInput,
  type RevenueTransactionRow,
  type NotificationRow
} from "@/lib/supabase/client";
import { calculateCommission, getDefaultRevenueRule } from "@/lib/oos/revenue-rules";
import { createCheckoutSession } from "@/lib/oos/payments";
import { demoShowcasePortfolios } from "@/lib/oos/demo-data";
import { formatStatusLabel } from "@/lib/oos/status-labels";
import { getPreferredTheme, saveTheme, type ThemeMode } from "../theme";

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

const demoMapProperties: AdvisorPropertyRow[] = demoShowcasePortfolios.map((portfolio) => ({
  id: portfolio.id,
  advisor_id: null,
  title: portfolio.title,
  listing_type: portfolio.contractType?.includes("Kiral") ? "Kiralık" : "Satılık",
  property_type: portfolio.propertyType || null,
  usage_type: portfolio.contractType || null,
  city: "İstanbul",
  district: portfolio.district || null,
  neighborhood: null,
  gross_area: Number(portfolio.area || 0) || null,
  net_area: null,
  room_count: portfolio.rooms,
  building_age: null,
  floor: null,
  total_floors: null,
  heating_type: null,
  bathroom_count: null,
  balcony_count: null,
  parking_type: null,
  has_elevator: null,
  in_site: null,
  dues_amount: null,
  deed_status: null,
  exchange_available: null,
  asking_price: portfolio.value,
  currency: "TRY",
  status: "active",
  is_public: true,
  description: portfolio.description,
  latitude: portfolio.latitude,
  longitude: portfolio.longitude,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}));

type RevenueFormState = {
  property_id: string;
  advisor_id: string;
  title: string;
  transaction_type: string;
  status: string;
  transaction_amount: string;
  currency: string;
  commission_rate: string;
  advisor_model: "core" | "elite";
  source_type: string;
  has_referral: boolean;
  referral_advisor_id: string;
  cap_reached: boolean;
  close_date: string;
  notes: string;
};

const emptyRevenueForm: RevenueFormState = {
  property_id: "",
  advisor_id: "",
  title: "",
  transaction_type: "sale",
  status: "draft",
  transaction_amount: "",
  currency: "TRY",
  commission_rate: "2",
  advisor_model: "core",
  source_type: "advisor_generated",
  has_referral: false,
  referral_advisor_id: "",
  cap_reached: false,
  close_date: "",
  notes: ""
};

const commissionRateOptions = [1, 1.5, 2, 3, 4];

export default function MenuDetailPage({ page }: { page: MenuPageData }) {
  const { user, profile } = useAuthContext();
  const supabase = useMemo(() => createSupabaseAuthClient(), []);
  const [commission, setCommission] = useState(250000);
  const [incomeTaxRate, setIncomeTaxRate] = useState(20);
  const [selectedDistrict, setSelectedDistrict] = useState(mapLocations[0].district);
  const [mapPropertyRows, setMapPropertyRows] = useState<AdvisorPropertyRow[]>(
    isSupabaseConfigured ? [] : demoMapProperties
  );
  const [tasks, setTasks] = useState<AdvisorTaskRow[]>([]);
  const [matchRows, setMatchRows] = useState<AdvisorMatchRow[]>([]);
  const [dealRows, setDealRows] = useState<AdvisorDealRow[]>([]);
  const [commissionRows, setCommissionRows] = useState<AdvisorCommissionRow[]>([]);
  const [advisorRows, setAdvisorRows] = useState<AdvisorRow[]>([]);
  const [propertyRows, setPropertyRows] = useState<AdvisorPropertyRow[]>([]);
  const [transactionRows, setTransactionRows] = useState<RevenueTransactionRow[]>([]);
  const [commissionRuleRows, setCommissionRuleRows] = useState<CommissionRuleRow[]>([]);
  const [revenueForm, setRevenueForm] = useState<RevenueFormState>(emptyRevenueForm);
  const [revenueStatusFilter, setRevenueStatusFilter] = useState("all");
  const [revenueMessage, setRevenueMessage] = useState("");
  const [revenueSaving, setRevenueSaving] = useState(false);
  const [activityRows, setActivityRows] = useState<ActivityLogRow[]>([]);
  const [activityFilter, setActivityFilter] = useState("all");
  const [notificationRows, setNotificationRows] = useState<NotificationRow[]>([]);
  const [notificationFilter, setNotificationFilter] = useState("all");
  const [moduleMessage, setModuleMessage] = useState("");
  const [paymentNotice, setPaymentNotice] = useState("");
  const displayName = getUserDisplayName(user, profile) || "Ocean Danışmanı";
  const tax = useMemo(() => {
    const vat = Math.round(commission * 0.2);
    const incomeTax = Math.round(commission * (incomeTaxRate / 100));
    return { vat, incomeTax, net: commission - incomeTax };
  }, [commission, incomeTaxRate]);
  const filteredActivityRows = useMemo(() => {
    if (activityFilter === "all") return activityRows;
    return activityRows.filter((row) => getActivityFilterKey(row) === activityFilter);
  }, [activityFilter, activityRows]);
  const filteredNotificationRows = useMemo(() => {
    if (notificationFilter === "all") return notificationRows;
    if (notificationFilter === "unread") {
      return notificationRows.filter((row) => row.status === "unread");
    }
    return notificationRows.filter((row) => getNotificationFilterKey(row) === notificationFilter);
  }, [notificationFilter, notificationRows]);
  const unreadNotificationCount = notificationRows.filter((row) => row.status === "unread").length;
  const selectedRevenueRule = commissionRuleRows.find((rule) => rule.model === revenueForm.advisor_model);
  const fallbackRevenueRule = getDefaultRevenueRule(revenueForm.advisor_model);
  const revenuePreview = calculateCommission({
    transaction_amount: Number(revenueForm.transaction_amount) || 0,
    commission_rate: Number(revenueForm.commission_rate) || 0,
    advisor_model: revenueForm.advisor_model,
    source_type: revenueForm.source_type,
    has_referral: revenueForm.has_referral,
    referral_percentage: selectedRevenueRule?.referral_percentage ?? fallbackRevenueRule.referral_percentage,
    cap_enabled: selectedRevenueRule?.cap_enabled ?? fallbackRevenueRule.cap_enabled,
    cap_reached: revenueForm.cap_reached,
    currency: revenueForm.currency,
    advisor_percentage: selectedRevenueRule?.advisor_percentage ?? fallbackRevenueRule.advisor_percentage,
    office_percentage: selectedRevenueRule?.office_percentage ?? fallbackRevenueRule.office_percentage,
    post_cap_own_office_percentage: selectedRevenueRule?.post_cap_own_office_percentage ?? fallbackRevenueRule.post_cap_own_office_percentage,
    post_cap_office_generated_percentage: selectedRevenueRule?.post_cap_office_generated_percentage ?? fallbackRevenueRule.post_cap_office_generated_percentage
  });
  const filteredTransactionRows = useMemo(() => {
    if (revenueStatusFilter === "all") return transactionRows;
    return transactionRows.filter((row) => row.status === revenueStatusFilter);
  }, [revenueStatusFilter, transactionRows]);
  const revenueSummary = useMemo(() => buildRevenueSummary(transactionRows), [transactionRows]);
  const persistentMode = Boolean(isSupabaseConfigured && user && supabase);

  useEffect(() => {
    if (!persistentMode || !supabase) return;
    if (!["map", "tasks", "matches", "commissions", "activity", "notifications"].includes(page.slug)) return;

    let mounted = true;
    setModuleMessage("");

    const loadModuleRows = async () => {
      if (page.slug === "map") {
        const properties = await supabase.getProperties();
        if (mounted) setMapPropertyRows(properties);
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
        const [transactions, rules, advisors, properties] = await Promise.all([
          supabase.getRevenueTransactions(),
          supabase.getCommissionRules(),
          supabase.getAdvisors(),
          supabase.getProperties()
        ]);
        if (mounted) {
          setTransactionRows(transactions);
          setCommissionRuleRows(rules);
          setAdvisorRows(advisors);
          setPropertyRows(properties);
          setRevenueForm((current) => ({
            ...current,
            advisor_id: current.advisor_id || advisors[0]?.id || "",
            property_id: current.property_id || properties[0]?.id || ""
          }));
        }
      }

      if (page.slug === "activity") {
        const rows = await supabase.getActivityLogs();
        if (mounted) setActivityRows(rows);
      }

      if (page.slug === "notifications") {
        const rows = await supabase.fetchNotifications();
        if (mounted) setNotificationRows(rows);
      }
    };

    loadModuleRows()
      .catch((error: Error) => {
        console.error(error);
        setMapPropertyRows([]);
        setTasks([]);
        setMatchRows([]);
        setDealRows([]);
        setCommissionRows([]);
        setTransactionRows([]);
        setAdvisorRows([]);
        setPropertyRows([]);
        setCommissionRuleRows([]);
        setActivityRows([]);
        setNotificationRows([]);
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

  async function markNotificationRead(id: string) {
    if (!supabase) return;

    const updated = await supabase.markNotificationRead(id);
    if (!updated) return;

    setNotificationRows((current) =>
      current.map((row) => row.id === id ? { ...row, status: "read", read_at: updated.read_at || new Date().toISOString() } : row)
    );
  }

  async function markAllNotificationsRead() {
    if (!supabase) return;

    await supabase.markAllNotificationsRead();
    const readAt = new Date().toISOString();
    setNotificationRows((current) =>
      current.map((row) => row.status === "unread" ? { ...row, status: "read", read_at: row.read_at || readAt } : row)
    );
  }

  function updateRevenueForm<Key extends keyof RevenueFormState>(key: Key, value: RevenueFormState[Key]) {
    setRevenueForm((current) => ({ ...current, [key]: value }));
  }

  async function createRevenueTransaction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || revenueSaving) return;

    const payload: RevenueTransactionInput = {
      property_id: revenueForm.property_id || null,
      advisor_id: revenueForm.advisor_id,
      title: revenueForm.title.trim() || "OceanOS işlemi",
      transaction_type: revenueForm.transaction_type,
      status: revenueForm.status,
      transaction_amount: Number(revenueForm.transaction_amount) || 0,
      currency: revenueForm.currency,
      commission_rate: Number(revenueForm.commission_rate) || 0,
      advisor_model: revenueForm.advisor_model,
      source_type: revenueForm.source_type,
      close_date: revenueForm.close_date || null,
      notes: revenueForm.notes || null,
      has_referral: revenueForm.has_referral,
      referral_advisor_id: revenueForm.has_referral ? revenueForm.referral_advisor_id || null : null,
      cap_reached: revenueForm.cap_reached
    };

    if (!payload.advisor_id) {
      setRevenueMessage("Danışman seçimi gerekli.");
      return;
    }

    setRevenueSaving(true);
    setRevenueMessage("");

    try {
      const row = await supabase.createRevenueTransaction(payload);
      if (row) {
        setTransactionRows((current) => [row, ...current]);
        setRevenueForm((current) => ({
          ...emptyRevenueForm,
          advisor_id: current.advisor_id,
          property_id: current.property_id
        }));
        setRevenueMessage("İşlem oluşturuldu ve komisyon kırılımı hesaplandı.");
      }
    } catch (error) {
      setRevenueMessage(getDataSetupMessage(error instanceof Error ? error.message : "İşlem oluşturulamadı."));
    } finally {
      setRevenueSaving(false);
    }
  }

  async function updateRevenueStatus(transaction: RevenueTransactionRow, status: string) {
    if (!supabase) return;

    const row = await supabase.updateRevenueTransactionStatus(transaction.id, status);
    if (!row) return;

    setTransactionRows((current) =>
      current.map((item) => item.id === row.id ? { ...item, ...row } : item)
    );
  }

  return (
    <main className={`min-h-screen bg-stone-50 text-slate-950 dark:bg-black dark:text-neutral-50 ${
      page.slug === "map"
        ? "px-0 pb-[calc(env(safe-area-inset-bottom)+5.75rem)] pt-16 md:px-4 md:pb-8 md:pt-24 lg:px-8"
        : "px-4 pb-[calc(env(safe-area-inset-bottom)+7rem)] pt-20 sm:px-6 md:pt-24 lg:px-8"
    }`}>
      <div className={`mx-auto ${page.slug === "map" ? "max-w-none md:max-w-5xl" : "max-w-5xl"}`}>
        <header className={`border-b border-slate-200 pb-6 dark:border-slate-800 ${page.slug === "map" ? "px-4 md:px-0" : ""}`}>
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
              <p className="text-xs font-medium text-slate-400">Rol</p>
              <h2 className="mt-2 text-xl font-semibold">Danışman</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Rol bilgisi güvenlik ve yetki kontrolü için sistem tarafından yönetilir; bu ekrandan düzenlenemez.
              </p>
            </article>
            <article className="oos-card rounded-[1.75rem] p-5 md:col-span-2">
              <p className="text-xs font-medium text-slate-400">Onboarding</p>
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
                <p className="text-xs font-medium text-slate-400">
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
            properties={mapPropertyRows}
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
          <section className="mt-6 space-y-4">
            <div className="grid gap-3 md:grid-cols-4">
              <InfoCard title="Toplam işlem hacmi" value={formatCurrencyAmount(revenueSummary.volume, revenueSummary.currency)} />
              <InfoCard title="Brüt komisyon" value={formatCurrencyAmount(revenueSummary.gross, revenueSummary.currency)} />
              <InfoCard title="Ofis payı" value={formatCurrencyAmount(revenueSummary.office, revenueSummary.currency)} />
              <InfoCard title="Danışman hakedişi" value={formatCurrencyAmount(revenueSummary.advisor, revenueSummary.currency)} />
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
              <RevenueTransactionForm
                advisors={advisorRows}
                calculation={revenuePreview}
                form={revenueForm}
                properties={propertyRows}
                rules={commissionRuleRows}
                saving={revenueSaving}
                onChange={updateRevenueForm}
                onSubmit={createRevenueTransaction}
              />
              <RevenueBreakdownCard calculation={revenuePreview} form={revenueForm} />
            </div>

            {revenueMessage ? (
              <p className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-100">
                {revenueMessage}
              </p>
            ) : null}

            <RevenueTransactionList
              filter={revenueStatusFilter}
              rows={filteredTransactionRows}
              totalRows={transactionRows.length}
              onFilterChange={setRevenueStatusFilter}
              onStatusChange={updateRevenueStatus}
            />
          </section>
        ) : null}

        {page.slug === "activity" && isSupabaseConfigured ? (
          <section className="mt-6">
            <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {activityFilters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setActivityFilter(filter.value)}
                  className={`shrink-0 rounded-full px-3 py-2 text-xs font-medium transition ${
                    activityFilter === filter.value
                      ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/[0.06] dark:text-slate-300 dark:hover:bg-white/[0.1]"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            <div className="mt-4 grid gap-3">
              {filteredActivityRows.map((activity) => (
                <ActivityLogCard key={activity.id} activity={activity} />
              ))}
              {!filteredActivityRows.length ? (
                <article className="rounded-[1.75rem] border border-dashed border-slate-200 p-5 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
                  Henüz aktivite kaydı yok. Kritik işlemler yapıldıkça burada görünecek.
                </article>
              ) : null}
            </div>
          </section>
        ) : null}

        {page.slug === "notifications" && isSupabaseConfigured ? (
          <section className="mt-6">
            <div className="oos-card rounded-[1.75rem] p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-400">Gerçek zamanlı iş akışı</p>
                  <h2 className="mt-2 text-xl font-semibold text-slate-950 dark:text-slate-100">
                    {unreadNotificationCount} okunmamış bildirim
                  </h2>
                </div>
                <button
                  type="button"
                  className="btn-secondary w-fit"
                  onClick={markAllNotificationsRead}
                  disabled={!unreadNotificationCount}
                >
                  Tümünü Okundu Yap
                </button>
              </div>
              <div className="mt-5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {notificationFilters.map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setNotificationFilter(filter.value)}
                    className={`shrink-0 rounded-full px-3 py-2 text-xs font-medium transition ${
                      notificationFilter === filter.value
                        ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/[0.06] dark:text-slate-300 dark:hover:bg-white/[0.1]"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 grid gap-3">
              {filteredNotificationRows.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onMarkRead={markNotificationRead}
                />
              ))}
              {!filteredNotificationRows.length ? (
                <article className="rounded-[1.75rem] border border-dashed border-slate-200 p-5 text-sm leading-6 text-slate-500 dark:border-white/10 dark:text-slate-400">
                  Henüz bildiriminiz yok. Yeni eşleşmeler, portföy güncellemeleri ve sistem uyarıları burada görünecek.
                </article>
              ) : null}
            </div>
          </section>
        ) : null}

        {page.slug === "settings" ? (
          <SettingsPanel />
        ) : null}

        {(moduleMessage || (!isSupabaseConfigured && ["map", "tasks"].includes(page.slug))) ? (
          <p className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100">
            {moduleMessage || getDataSetupMessage()}
          </p>
        ) : null}

        {(!isSupabaseConfigured || !["matches", "commissions", "activity", "notifications", "settings"].includes(page.slug)) ? (
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

        {page.actions && page.slug !== "settings" ? (
          <section className="mt-6 grid gap-3 sm:grid-cols-3">
            {page.actions.map((action) => <div key={action} className="oos-card-muted rounded-2xl p-4 text-sm font-medium">{action}</div>)}
          </section>
        ) : null}
      </div>
    </main>
  );
}

type SettingsPreferences = {
  theme: ThemeMode;
  inAppNotifications: boolean;
  emailNotifications: boolean;
  criticalAlerts: boolean;
  dashboardView: "grid" | "list";
  startPage: "dashboard" | "portfolios" | "all-portfolios";
  language: "tr";
  currency: "TRY" | "USD" | "EUR";
  defaultListingType: "Satılık" | "Kiralık";
  defaultPortfolioCurrency: "TRY" | "USD" | "EUR";
  defaultPropertyType: "Daire" | "Villa" | "Arsa" | "Diğer";
};

const settingsStorageKey = "oceanos-local-settings";

const defaultSettingsPreferences: SettingsPreferences = {
  theme: "system",
  inAppNotifications: true,
  emailNotifications: false,
  criticalAlerts: true,
  dashboardView: "grid",
  startPage: "dashboard",
  language: "tr",
  currency: "TRY",
  defaultListingType: "Satılık",
  defaultPortfolioCurrency: "TRY",
  defaultPropertyType: "Daire"
};

function SettingsPanel() {
  const [preferences, setPreferences] = useState<SettingsPreferences>(defaultSettingsPreferences);

  useEffect(() => {
    const stored = window.localStorage.getItem(settingsStorageKey);
    const savedTheme = getPreferredTheme();
    if (!stored) {
      setPreferences((current) => ({ ...current, theme: savedTheme }));
      return;
    }

    try {
      const parsed = JSON.parse(stored) as Partial<SettingsPreferences>;
      setPreferences({ ...defaultSettingsPreferences, ...parsed, theme: savedTheme });
    } catch {
      setPreferences((current) => ({ ...current, theme: savedTheme }));
    }
  }, []);

  function updatePreferences(nextPreferences: SettingsPreferences) {
    setPreferences(nextPreferences);
    window.localStorage.setItem(settingsStorageKey, JSON.stringify(nextPreferences));
  }

  function update<Key extends keyof SettingsPreferences>(key: Key, value: SettingsPreferences[Key]) {
    const nextPreferences = { ...preferences, [key]: value };
    updatePreferences(nextPreferences);
    if (key === "theme") saveTheme(value as ThemeMode);
  }

  return (
    <section className="mt-6 grid gap-4">
      <SettingsSection
        eyebrow="Görünüm"
        title="Tema tercihi"
        description="Global tema davranışıyla aynı anahtarı kullanır."
      >
        <SegmentedControl
          options={[
            ["system", "Sistem"],
            ["light", "Açık"],
            ["dark", "Koyu"]
          ]}
          value={preferences.theme}
          onChange={(value) => update("theme", value as ThemeMode)}
        />
      </SettingsSection>

      <SettingsSection
        eyebrow="Bildirim Tercihleri"
        title="Yerel bildirim kanalları"
        description="Sunucu tarafı tercih tablosu olmadığı için bu seçimler bu cihazda saklanır."
      >
        <SettingsToggle label="Uygulama içi bildirimler" checked={preferences.inAppNotifications} onChange={(checked) => update("inAppNotifications", checked)} />
        <SettingsToggle label="E-posta bildirimleri" checked={preferences.emailNotifications} onChange={(checked) => update("emailNotifications", checked)} />
        <SettingsToggle label="Kritik uyarılar" checked={preferences.criticalAlerts} onChange={(checked) => update("criticalAlerts", checked)} />
      </SettingsSection>

      <SettingsSection
        eyebrow="Çalışma Alanı"
        title="Varsayılan çalışma düzeni"
        description="Dashboard ve açılış tercihleri yerel olarak korunur."
      >
        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">
          Dashboard portföy görünümü
          <select className="input mt-2" value={preferences.dashboardView} onChange={(event) => update("dashboardView", event.target.value as SettingsPreferences["dashboardView"])}>
            <option value="grid">Kart görünümü</option>
            <option value="list">Satır görünümü</option>
          </select>
        </label>
        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">
          Varsayılan açılış
          <select className="input mt-2" value={preferences.startPage} onChange={(event) => update("startPage", event.target.value as SettingsPreferences["startPage"])}>
            <option value="dashboard">Dashboard</option>
            <option value="portfolios">Portföylerim</option>
            <option value="all-portfolios">Tüm Portföyler</option>
          </select>
        </label>
      </SettingsSection>

      <SettingsSection
        eyebrow="Dil ve Bölge"
        title="Türkiye çalışma standardı"
        description="Tam i18n kapsamı yok; para birimi tercihi yerel varsayılan olarak saklanır."
      >
        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">
          Dil
          <select className="input mt-2" value={preferences.language} onChange={() => update("language", "tr")}>
            <option value="tr">Türkçe</option>
          </select>
        </label>
        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">
          Varsayılan para birimi
          <select className="input mt-2" value={preferences.currency} onChange={(event) => update("currency", event.target.value as SettingsPreferences["currency"])}>
            <option value="TRY">TRY</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </label>
      </SettingsSection>

      <SettingsSection
        eyebrow="Varsayılan Portföy Tercihleri"
        title="Yeni kayıt başlangıç değerleri"
        description="Bu ayarlar yerel olarak saklanır; portföy formuna sunucu tercihi gibi yansıtılmaz."
      >
        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">
          Varsayılan ilan tipi
          <select className="input mt-2" value={preferences.defaultListingType} onChange={(event) => update("defaultListingType", event.target.value as SettingsPreferences["defaultListingType"])}>
            <option value="Satılık">Satılık</option>
            <option value="Kiralık">Kiralık</option>
          </select>
        </label>
        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">
          Varsayılan portföy para birimi
          <select className="input mt-2" value={preferences.defaultPortfolioCurrency} onChange={(event) => update("defaultPortfolioCurrency", event.target.value as SettingsPreferences["defaultPortfolioCurrency"])}>
            <option value="TRY">TRY</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </label>
        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">
          Varsayılan gayrimenkul tipi
          <select className="input mt-2" value={preferences.defaultPropertyType} onChange={(event) => update("defaultPropertyType", event.target.value as SettingsPreferences["defaultPropertyType"])}>
            <option value="Daire">Daire</option>
            <option value="Villa">Villa</option>
            <option value="Arsa">Arsa</option>
            <option value="Diğer">Diğer</option>
          </select>
        </label>
      </SettingsSection>
    </section>
  );
}

function SettingsSection({
  eyebrow,
  title,
  description,
  children
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <article className="oos-card rounded-[1.75rem] p-5">
      <p className="text-xs font-medium text-slate-400">{eyebrow}</p>
      <h2 className="mt-2 text-lg font-semibold text-slate-950 dark:text-slate-100">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">{children}</div>
    </article>
  );
}

function SegmentedControl({
  options,
  value,
  onChange
}: {
  options: Array<[string, string]>;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex rounded-2xl bg-slate-100 p-1 dark:bg-white/[0.06] sm:col-span-2">
      {options.map(([optionValue, label]) => (
        <button
          key={optionValue}
          type="button"
          onClick={() => onChange(optionValue)}
          className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition ${
            value === optionValue
              ? "bg-white text-slate-950 shadow-sm dark:bg-white dark:text-slate-950"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function SettingsToggle({
  label,
  checked,
  onChange
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-2xl bg-slate-100 px-3 py-3 text-sm font-medium text-slate-600 dark:bg-white/[0.06] dark:text-slate-300">
      <span>{label}</span>
      <input
        type="checkbox"
        className="h-5 w-5 accent-slate-950 dark:accent-white"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}

function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <article className="oos-card rounded-[1.75rem] p-5">
      <p className="text-xs font-medium text-slate-400">{title}</p>
      <p className="mt-2 break-words text-xl font-semibold">{value}</p>
    </article>
  );
}

function RevenueTransactionForm({
  advisors,
  calculation,
  form,
  properties,
  rules,
  saving,
  onChange,
  onSubmit
}: {
  advisors: AdvisorRow[];
  calculation: ReturnType<typeof calculateCommission>;
  form: RevenueFormState;
  properties: AdvisorPropertyRow[];
  rules: CommissionRuleRow[];
  saving: boolean;
  onChange: <Key extends keyof RevenueFormState>(key: Key, value: RevenueFormState[Key]) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form className="oos-card rounded-[1.75rem] p-5" onSubmit={onSubmit}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-400">Gelir Motoru</p>
          <h2 className="mt-2 text-xl font-semibold">İşlem Oluştur</h2>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-white/[0.08] dark:text-slate-300">
          {calculation.applied_rule_summary}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
          İşlem başlığı
          <input className="input mt-2" value={form.title} onChange={(event) => onChange("title", event.target.value)} placeholder="Bebek satış işlemi" />
        </label>
        <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Portföy
          <select className="input mt-2" value={form.property_id} onChange={(event) => onChange("property_id", event.target.value)}>
            <option value="">Portföy seçilmedi</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>{property.title}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Danışman
          <select className="input mt-2" value={form.advisor_id} onChange={(event) => onChange("advisor_id", event.target.value)}>
            <option value="">Danışman seç</option>
            {advisors.map((advisor) => (
              <option key={advisor.id} value={advisor.id}>{getAdvisorLabel(advisor)}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
          İşlem tipi
          <select className="input mt-2" value={form.transaction_type} onChange={(event) => onChange("transaction_type", event.target.value)}>
            {transactionTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
          İşlem tutarı
          <input className="input mt-2" type="number" min={0} value={form.transaction_amount} onChange={(event) => onChange("transaction_amount", event.target.value)} placeholder="25000000" />
        </label>
        <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Para birimi
          <select className="input mt-2" value={form.currency} onChange={(event) => onChange("currency", event.target.value)}>
            {["TRY", "USD", "EUR"].map((currency) => <option key={currency} value={currency}>{currency}</option>)}
          </select>
        </label>
      </div>

      <div className="mt-4">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Komisyon oranı</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {commissionRateOptions.map((rate) => (
            <button
              key={rate}
              className={`rounded-full px-3 py-2 text-xs font-medium transition ${Number(form.commission_rate) === rate ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "bg-slate-100 text-slate-600 dark:bg-white/[0.06] dark:text-slate-300"}`}
              type="button"
              onClick={() => onChange("commission_rate", String(rate))}
            >
              %{rate}
            </button>
          ))}
          <input className="input max-w-28" type="number" min={0} step="0.1" value={form.commission_rate} onChange={(event) => onChange("commission_rate", event.target.value)} />
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Danışman modeli
          <select className="input mt-2" value={form.advisor_model} onChange={(event) => onChange("advisor_model", event.target.value as RevenueFormState["advisor_model"])}>
            {rules.length ? rules.map((rule) => <option key={rule.id} value={rule.model}>{rule.name}</option>) : (
              <>
                <option value="core">Ocean Core</option>
                <option value="elite">Ocean Elite</option>
              </>
            )}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Kaynak tipi
          <select className="input mt-2" value={form.source_type} onChange={(event) => onChange("source_type", event.target.value)}>
            {sourceTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Durum
          <select className="input mt-2" value={form.status} onChange={(event) => onChange("status", event.target.value)}>
            {transactionStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Kapanış tarihi
          <input className="input mt-2" type="date" value={form.close_date} onChange={(event) => onChange("close_date", event.target.value)} />
        </label>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-3 text-sm font-medium text-slate-600 dark:bg-white/[0.06] dark:text-slate-300">
          <input type="checkbox" checked={form.has_referral} onChange={(event) => onChange("has_referral", event.target.checked)} />
          Referral teşviki uygula
        </label>
        <label className="flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-3 text-sm font-medium text-slate-600 dark:bg-white/[0.06] dark:text-slate-300">
          <input type="checkbox" checked={form.cap_reached} onChange={(event) => onChange("cap_reached", event.target.checked)} />
          Tavan sonrası hesapla
        </label>
      </div>

      {form.has_referral ? (
        <label className="mt-4 block text-sm font-medium text-slate-500 dark:text-slate-400">
          Referral danışmanı
          <select className="input mt-2" value={form.referral_advisor_id} onChange={(event) => onChange("referral_advisor_id", event.target.value)}>
            <option value="">Referral danışmanı seç</option>
            {advisors.map((advisor) => (
              <option key={advisor.id} value={advisor.id}>{getAdvisorLabel(advisor)}</option>
            ))}
          </select>
        </label>
      ) : null}

      <label className="mt-4 block text-sm font-medium text-slate-500 dark:text-slate-400">
        Not
        <textarea className="input mt-2 min-h-20 resize-none" value={form.notes} onChange={(event) => onChange("notes", event.target.value)} placeholder="İç operasyon notu" />
      </label>

      <button className="btn-primary mt-5 w-full" type="submit" disabled={saving}>
        {saving ? "Kaydediliyor..." : "Komisyon Hesapla ve İşlem Oluştur"}
      </button>
    </form>
  );
}

function RevenueBreakdownCard({
  calculation,
  form
}: {
  calculation: ReturnType<typeof calculateCommission>;
  form: RevenueFormState;
}) {
  return (
    <article className="oos-card rounded-[1.75rem] p-5">
      <p className="text-xs font-medium text-slate-400">Hesaplama önizlemesi</p>
      <h2 className="mt-2 text-xl font-semibold">Komisyon Kırılımı</h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Result label="Brüt Komisyon" value={formatCurrencyAmount(calculation.gross_commission, form.currency)} />
        <Result label="Danışman Payı" value={formatCurrencyAmount(calculation.advisor_share, form.currency)} />
        <Result label="Ofis Payı" value={formatCurrencyAmount(calculation.office_share, form.currency)} />
        <Result label="Referral Teşviki" value={formatCurrencyAmount(calculation.referral_reward, form.currency)} />
        <Result label="Net Danışman Hakedişi" value={formatCurrencyAmount(calculation.net_advisor_payout, form.currency)} />
        <Result label="Tavan Durumu" value={calculation.cap_adjustment ? formatCurrencyAmount(calculation.cap_adjustment, form.currency) : "Aktif değil"} />
      </div>
      <p className="mt-4 rounded-2xl bg-slate-100 p-3 text-sm leading-6 text-slate-600 dark:bg-white/[0.06] dark:text-slate-300">
        {calculation.applied_rule_summary}. USD tavan takibi canlı FX kullanmaz; ilk versiyonda manuel/raporlanabilir cap alanı olarak tutulur.
      </p>
    </article>
  );
}

function RevenueTransactionList({
  filter,
  rows,
  totalRows,
  onFilterChange,
  onStatusChange
}: {
  filter: string;
  rows: RevenueTransactionRow[];
  totalRows: number;
  onFilterChange: (filter: string) => void;
  onStatusChange: (transaction: RevenueTransactionRow, status: string) => void;
}) {
  return (
    <article className="oos-card rounded-[1.75rem] p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400">Aktif işlemler</p>
          <h2 className="mt-2 text-xl font-semibold">{totalRows} işlem kaydı</h2>
        </div>
        <select className="input w-full sm:w-56" value={filter} onChange={(event) => onFilterChange(event.target.value)}>
          <option value="all">Tüm durumlar</option>
          {transactionStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </div>
      <div className="mt-5 grid gap-3">
        {rows.map((transaction) => (
          <RevenueTransactionCard
            key={transaction.id}
            transaction={transaction}
            onStatusChange={onStatusChange}
          />
        ))}
        {!rows.length ? (
          <p className="rounded-2xl border border-dashed border-slate-200 p-5 text-sm leading-6 text-slate-500 dark:border-white/10 dark:text-slate-400">
            Henüz işlem kaydı yok. İlk işlemi oluşturduğunuzda brüt komisyon, danışman hakedişi ve ofis payı burada görünecek.
          </p>
        ) : null}
      </div>
    </article>
  );
}

function RevenueTransactionCard({
  transaction,
  onStatusChange
}: {
  transaction: RevenueTransactionRow;
  onStatusChange: (transaction: RevenueTransactionRow, status: string) => void;
}) {
  const splits = transaction.commission_splits || [];
  const advisorShare = getSplitAmount(splits, "advisor_share");
  const officeShare = getSplitAmount(splits, "office_share");
  const nextStatus = getNextTransactionStatus(transaction.status);

  return (
    <div className="rounded-3xl border border-slate-200 bg-stone-50 p-4 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-400">{formatTransactionType(transaction.transaction_type)} · {formatSourceType(transaction.source_type)}</p>
          <h3 className="mt-2 text-lg font-semibold text-slate-950 dark:text-slate-100">{transaction.title}</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {transaction.property?.title || "Portföy bağlanmadı"} · {getAdvisorLabel(transaction.advisor || null)}
          </p>
        </div>
        <span className="w-fit rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white dark:bg-white dark:text-slate-950">
          {formatTransactionStatus(transaction.status)}
        </span>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-4">
        <Result label="Tutar" value={formatCurrencyAmount(Number(transaction.transaction_amount), transaction.currency)} />
        <Result label="Brüt" value={formatCurrencyAmount(Number(transaction.gross_commission), transaction.currency)} />
        <Result label="Danışman" value={formatCurrencyAmount(advisorShare, transaction.currency)} />
        <Result label="Ofis" value={formatCurrencyAmount(officeShare, transaction.currency)} />
      </div>
      {nextStatus ? (
        <button className="mini-action mt-4" type="button" onClick={() => onStatusChange(transaction, nextStatus)}>
          {formatTransactionStatus(nextStatus)} Yap
        </button>
      ) : null}
    </div>
  );
}

const transactionTypeOptions = [
  { value: "sale", label: "Satış" },
  { value: "rental", label: "Kiralama" },
  { value: "land_share", label: "Kat karşılığı" },
  { value: "project_sale", label: "Proje satışı" },
  { value: "referral", label: "Referral" },
  { value: "other", label: "Diğer" }
];

const sourceTypeOptions = [
  { value: "advisor_generated", label: "Danışman kaynaklı" },
  { value: "office_generated", label: "Ofis kaynaklı" },
  { value: "referral_generated", label: "Referral kaynaklı" },
  { value: "project_generated", label: "Proje kaynaklı" }
];

const transactionStatusOptions = [
  { value: "draft", label: "Taslak" },
  { value: "active", label: "Aktif" },
  { value: "pending_collection", label: "Tahsilat Bekliyor" },
  { value: "collected", label: "Tahsil Edildi" },
  { value: "paid_out", label: "Hakediş Ödendi" },
  { value: "cancelled", label: "İptal" }
];

function buildRevenueSummary(rows: RevenueTransactionRow[]) {
  return rows.reduce((summary, row) => {
    const splits = row.commission_splits || [];
    summary.volume += Number(row.transaction_amount || 0);
    summary.gross += Number(row.gross_commission || 0);
    summary.office += getSplitAmount(splits, "office_share");
    summary.advisor += getSplitAmount(splits, "advisor_share");
    if (row.status === "pending_collection") summary.pending += Number(row.gross_commission || 0);
    if (row.status === "collected" || row.status === "paid_out") summary.collected += Number(row.gross_commission || 0);
    summary.currency = row.currency || summary.currency;
    return summary;
  }, {
    volume: 0,
    gross: 0,
    office: 0,
    advisor: 0,
    pending: 0,
    collected: 0,
    currency: "TRY"
  });
}

function getSplitAmount(splits: CommissionSplitRow[], splitType: string) {
  return splits
    .filter((split) => split.split_type === splitType)
    .reduce((sum, split) => sum + Number(split.amount || 0), 0);
}

function getAdvisorLabel(advisor?: AdvisorRow | null) {
  if (!advisor) return "Danışman bekleniyor";
  return advisor.profile?.full_name || advisor.title || advisor.advisor_code || "Danışman";
}

function formatTransactionType(value?: string | null) {
  return transactionTypeOptions.find((option) => option.value === value)?.label || "İşlem";
}

function formatSourceType(value?: string | null) {
  return sourceTypeOptions.find((option) => option.value === value)?.label || "Kaynak yok";
}

function formatTransactionStatus(value?: string | null) {
  return transactionStatusOptions.find((option) => option.value === value)?.label || formatStatusLabel(value || "Durum");
}

function getNextTransactionStatus(status: string) {
  const flow = ["draft", "active", "pending_collection", "collected", "paid_out"];
  const index = flow.indexOf(status);
  if (index < 0 || index === flow.length - 1 || status === "cancelled") return "";
  return flow[index + 1];
}

const activityFilters = [
  { value: "all", label: "Tümü" },
  { value: "property", label: "Portföy" },
  { value: "search_request", label: "Arayış" },
  { value: "share", label: "Paylaşım" },
  { value: "advisor_application", label: "Başvuru" },
  { value: "media", label: "Medya" }
];

const notificationFilters = [
  { value: "all", label: "Tümü" },
  { value: "unread", label: "Okunmamış" },
  { value: "property", label: "Portföy" },
  { value: "match", label: "Eşleşme" },
  { value: "advisor_application", label: "Başvuru" },
  { value: "system", label: "Sistem" }
];

function NotificationCard({
  notification,
  onMarkRead
}: {
  notification: NotificationRow;
  onMarkRead: (id: string) => void;
}) {
  const unread = notification.status === "unread";

  return (
    <article className={`rounded-[1.75rem] border p-5 ${
      unread
        ? "border-slate-300 bg-white dark:border-white/15 dark:bg-white/[0.07]"
        : "border-slate-200 bg-stone-50 dark:border-white/10 dark:bg-white/[0.04]"
    }`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:bg-white/[0.08] dark:text-slate-300">
              {formatNotificationType(notification.type)}
            </span>
            <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${getNotificationPriorityClass(notification.priority)}`}>
              {formatNotificationPriority(notification.priority)}
            </span>
            <span className="text-xs text-slate-400">{formatRelativeNotificationTime(notification.created_at)}</span>
          </div>
          <h2 className="mt-3 text-lg font-semibold text-slate-950 dark:text-slate-100">
            {notification.title}
          </h2>
          {notification.body ? (
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              {notification.body}
            </p>
          ) : null}
          {notification.entity_title ? (
            <p className="mt-2 text-xs text-slate-400">{notification.entity_title}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
            unread
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200"
              : "bg-slate-100 text-slate-500 dark:bg-white/[0.06] dark:text-slate-400"
          }`}>
            {unread ? "Okunmamış" : "Okundu"}
          </span>
          {notification.action_url ? (
            <Link href={notification.action_url} className="mini-action">
              Aç
            </Link>
          ) : null}
          {unread ? (
            <button type="button" className="mini-action" onClick={() => onMarkRead(notification.id)}>
              Okundu
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function ActivityLogCard({ activity }: { activity: ActivityLogRow }) {
  return (
    <article className="oos-card rounded-[1.75rem] p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-400">
            {formatActivityTime(activity.created_at)}
          </p>
          <h2 className="mt-2 text-lg font-semibold text-slate-950 dark:text-slate-100">
            {formatActivityAction(activity.action)}
          </h2>
          <p className="mt-1 break-words text-sm text-slate-500 dark:text-slate-400">
            {activity.entity_title || formatActivityEntityType(activity.entity_type)}
          </p>
        </div>
        <span className={`w-fit rounded-full border px-3 py-1 text-xs font-medium ${getActivityStatusClass(activity.status)}`}>
          {formatActivityStatus(activity.status)}
        </span>
      </div>
      <div className="mt-4 grid gap-2 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-2">
        <p><span className="text-slate-400">Kullanıcı:</span> {activity.actor_email || "Sistem / anonim başvuru"}</p>
        <p><span className="text-slate-400">Varlık:</span> {formatActivityEntityType(activity.entity_type)}</p>
      </div>
      {activity.summary ? (
        <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">{activity.summary}</p>
      ) : null}
    </article>
  );
}

function getActivityFilterKey(activity: ActivityLogRow) {
  if (activity.action.includes("share")) return "share";
  if (activity.action.includes("photo") || activity.action.includes("cover")) return "media";
  return activity.entity_type;
}

function getNotificationFilterKey(notification: NotificationRow) {
  if (notification.type.includes("property") || notification.entity_type === "property") return "property";
  if (notification.type.includes("match") || notification.entity_type === "match") return "match";
  if (notification.type.includes("advisor_application") || notification.entity_type === "advisor_application") return "advisor_application";
  return "system";
}

function formatNotificationType(type: string) {
  const labels: Record<string, string> = {
    property_created: "Portföy",
    property_updated: "Portföy",
    property_photo_uploaded: "Portföy fotoğrafı",
    property_photo_removed: "Portföy fotoğrafı",
    property_share_created: "Paylaşım",
    property_share_deactivated: "Paylaşım",
    search_request_created: "Arayış",
    match_created: "Eşleşme",
    advisor_application_submitted: "Başvuru",
    advisor_application_approved: "Başvuru",
    advisor_application_rejected: "Başvuru",
    system_notice: "Sistem"
  };

  return labels[type] || "Bildirim";
}

function formatNotificationPriority(priority: string) {
  if (priority === "urgent") return "Acil";
  if (priority === "high") return "Yüksek";
  if (priority === "low") return "Düşük";
  return "Normal";
}

function getNotificationPriorityClass(priority: string) {
  if (priority === "urgent" || priority === "high") {
    return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100";
  }
  if (priority === "low") {
    return "border-slate-200 bg-slate-50 text-slate-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400";
  }
  return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200";
}

function formatRelativeNotificationTime(createdAt?: string | null) {
  if (!createdAt) return "Tarih yok";
  const createdTime = new Date(createdAt).getTime();
  if (Number.isNaN(createdTime)) return "Tarih yok";

  const diffMinutes = Math.max(0, Math.floor((Date.now() - createdTime) / 60000));
  if (diffMinutes < 1) return "Az önce";
  if (diffMinutes < 60) return `${diffMinutes} dk önce`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} saat önce`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} gün önce`;

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(createdAt));
}

function formatActivityAction(action: string) {
  const labels: Record<string, string> = {
    property_created: "Portföy oluşturuldu",
    property_updated: "Portföy güncellendi",
    property_photo_uploaded: "Fotoğraf yüklendi",
    property_cover_updated: "Kapak fotoğrafı değiştirildi",
    property_share_created: "Paylaşım linki oluşturuldu",
    property_share_copied: "Paylaşım linki kopyalandı",
    property_share_deactivated: "Paylaşım kapatıldı",
    property_pdf_exported: "PDF dışa aktarıldı",
    search_request_created: "Arayış oluşturuldu",
    search_request_updated: "Arayış güncellendi",
    advisor_application_submitted: "Danışman başvurusu gönderildi",
    advisor_application_approved: "Danışman başvurusu onaylandı",
    advisor_application_rejected: "Danışman başvurusu reddedildi",
    admin_reviewed_advisor_application: "Danışman başvurusu incelendi"
  };

  return labels[action] || action;
}

function formatActivityEntityType(entityType: string) {
  const labels: Record<string, string> = {
    property: "Portföy",
    search_request: "Arayış",
    advisor_application: "Danışman başvurusu",
    match: "Eşleşme",
    system: "Sistem"
  };

  return labels[entityType] || entityType;
}

function formatActivityStatus(status: string) {
  if (status === "success") return "Başarılı";
  if (status === "failed") return "Başarısız";
  return formatStatusLabel(status);
}

function getActivityStatusClass(status: string) {
  if (status === "failed") {
    return "border-red-200 bg-red-50 text-red-700 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-200";
  }

  return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200";
}

function formatActivityTime(createdAt?: string | null) {
  if (!createdAt) return "Tarih yok";
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "Tarih yok";

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
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
              <p className="text-xs text-white/45">Ocean Elite</p>
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
  properties,
  demoMode,
  selectedDistrict,
  onSelectDistrict
}: {
  properties: AdvisorPropertyRow[];
  demoMode: boolean;
  selectedDistrict: string;
  onSelectDistrict: (district: string) => void;
}) {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerLayerRef = useRef<any>(null);
  const [mapError, setMapError] = useState("");
  const markers = properties
    .map((property) => ({ property, coordinates: getPropertyCoordinates(property) }))
    .filter((item): item is { property: AdvisorPropertyRow; coordinates: [number, number] } => Boolean(item.coordinates));
  const missing = properties.filter((property) => !property.latitude || !property.longitude);
  const missingLabels = missing.length
    ? missing.map((item) => item.title)
    : demoMode ? missingLocationItems : [];
  const selectedRows = properties.filter((property) =>
    getPropertyDistrict(property) === selectedDistrict
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

      markers.forEach(({ property, coordinates }) => {
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
            `<strong>${escapeHtml(property.title)}</strong><br />${escapeHtml(getPropertyLocation(property) || "Konum bekleniyor")}<br />${formatCurrency(Number(property.asking_price || 0))}<br /><a href="/properties/${encodeURIComponent(property.id)}">Aç</a>`
          )
          .addTo(markerLayerRef.current);
      });
    }

    syncMarkers();
  }, [markers]);

  return (
    <section className="mt-6 space-y-4 md:mt-6">
      <article className="overflow-hidden rounded-none border border-slate-200 bg-white p-0 dark:border-white/10 dark:bg-[#080808] md:rounded-[2rem] md:p-5">
        {mapError ? (
          <div className="flex min-h-[calc(100dvh-12rem)] items-center justify-center border border-dashed border-slate-200 bg-slate-50 px-5 text-center text-sm leading-6 text-slate-500 dark:border-white/10 dark:bg-[#111111] dark:text-slate-400 md:min-h-[30rem] md:rounded-[1.5rem]">
            {mapError}
          </div>
        ) : (
          <div ref={mapElementRef} className="oos-map-surface relative z-0 min-h-[calc(100dvh-12rem)] border-slate-200 dark:border-white/10 md:min-h-[30rem] md:rounded-[1.5rem] md:border lg:min-h-[42rem]" />
        )}
        <p className="px-4 py-4 text-sm leading-6 text-slate-500 dark:text-slate-400 md:px-0 md:pb-0">
          Leaflet ve OpenStreetMap ile ücretsiz, API anahtarsız harita temeli. Marker göstermek için portföyde enlem ve boylam bulunmalıdır.
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
          {(selectedRows.length ? selectedRows : properties).slice(0, 5).map((property) => (
            <Link key={property.id} href={`/properties/${property.id}`} className="rounded-2xl bg-slate-50 p-4 transition hover:bg-slate-100 dark:bg-white/[0.04] dark:hover:bg-white/[0.07]">
              <p className="font-medium">{property.title}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {getPropertyLocation(property) || "Konum bekleniyor"} · {formatCurrency(Number(property.asking_price || 0))}
              </p>
              {!property.latitude || !property.longitude ? (
                <p className="mt-2 text-xs text-amber-700 dark:text-amber-200">Net marker için enlem/boylam gerekli</p>
              ) : null}
            </Link>
          ))}
          {!properties.length ? <p className="text-sm text-slate-500 dark:text-slate-400">Haritada gösterilecek portföy yok.</p> : null}
        </div>
        <h3 className="mt-6 text-sm font-semibold">Konumu eksik portföyler</h3>
        <ul className="mt-3 space-y-2 text-sm text-slate-500 dark:text-slate-400">
          {missingLabels.length ? missingLabels.map((item) => <li key={item}>• {item}</li>) : <li>Konumu eksik portföy yok.</li>}
        </ul>
      </article>
    </section>
  );
}

function getPropertyLocation(property: AdvisorPropertyRow) {
  return [property.city, property.district, property.neighborhood].filter(Boolean).join(" / ");
}

function getPropertyDistrict(property: AdvisorPropertyRow) {
  return property.district || "";
}

function getPropertyCoordinates(property: AdvisorPropertyRow): [number, number] | null {
  if (property.latitude && property.longitude) return [Number(property.latitude), Number(property.longitude)];
  return null;
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
