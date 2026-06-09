"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuthContext } from "@/app/auth-context";
import { PropertyImageFrame } from "@/app/property-image-frame";
import {
  advisorMatchStatuses,
  buildAdvisorMatchWhatsAppMessage,
  buildWhatsAppHref,
  formatAdvisorMatchStatus,
  formatCompactAmount,
  formatMatchBudget,
  formatMatchLocation,
  getAdvisorById,
  getAdvisorDisplayName,
  getAdvisorPhone,
  getMatchAdvisorIds,
  getOppositeMatchAdvisor,
  getSearchRequestSummary,
  normalizeListValue,
  normalizeTurkishPhone
} from "@/lib/oos/advisor-match-workflow";
import { formatStatusLabel, formatUrgencyLabel, getStatusPillClass, getUrgencyPillClass } from "@/lib/oos/status-labels";
import {
  createSupabaseAuthClient,
  getDataSetupMessage,
  isSupabaseConfigured,
  type AdvisorMatchRow,
  type AdvisorRow,
  type AdvisorSearchRequestRow,
  type PropertyMediaRow
} from "@/lib/supabase/client";

const demoImage = "/mandarin-2.jpeg";

export default function SearchRequestDetailPage() {
  const params = useParams<{ id: string }>();
  const requestId = String(params?.id || "");
  const { user } = useAuthContext();
  const supabase = useMemo(() => createSupabaseAuthClient(), []);
  const [request, setRequest] = useState<AdvisorSearchRequestRow | null>(null);
  const [matches, setMatches] = useState<AdvisorMatchRow[]>([]);
  const [advisors, setAdvisors] = useState<AdvisorRow[]>([]);
  const [covers, setCovers] = useState<Record<string, string>>({});
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);
  const [statusDrafts, setStatusDrafts] = useState<Record<string, string>>({});
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!requestId || !isSupabaseConfigured || !user || !supabase) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setMessage("");

    Promise.all([
      supabase.getSearchRequest(requestId),
      supabase.getMatches(),
      supabase.getAdvisors()
    ])
      .then(async ([requestRow, matchRows, advisorRows]: [AdvisorSearchRequestRow | null, AdvisorMatchRow[], AdvisorRow[]]) => {
        if (cancelled) return;
        const scopedMatches = matchRows
          .filter((match) => String(match.search_request_id || match.search_request?.id || "") === requestId)
          .map((match) => ({ ...match, search_request: match.search_request || requestRow }));
        setRequest(requestRow || scopedMatches[0]?.search_request || null);
        setMatches(scopedMatches);
        setAdvisors(advisorRows);
        setStatusDrafts(Object.fromEntries(scopedMatches.map((match) => [match.id, match.advisor_match_status || "new"])));
        setNoteDrafts(Object.fromEntries(scopedMatches.map((match) => [match.id, match.advisor_match_note || ""])));

        const propertyIds = Array.from(new Set(scopedMatches.map((match) => match.property_id || match.property?.id).filter(Boolean) as string[]));
        const mediaPairs = await Promise.all(
          propertyIds.map(async (propertyId) => {
            const media = await supabase.getPropertyMedia(propertyId).catch(() => [] as PropertyMediaRow[]);
            return [propertyId, media[0]?.signed_url || ""] as const;
          })
        );
        if (!cancelled) setCovers(Object.fromEntries(mediaPairs.filter(([, url]) => Boolean(url))));
      })
      .catch((error: Error) => {
        console.error(error);
        if (!cancelled) setMessage(getDataSetupMessage(error.message));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [requestId, supabase, user]);

  async function saveMatchWorkflow(match: AdvisorMatchRow) {
    if (!supabase) return;
    setSavingId(match.id);
    setMessage("");
    try {
      const updated = await supabase.updateAdvisorMatchWorkflow({
        match_id: match.id,
        advisor_match_status: statusDrafts[match.id] || "new",
        advisor_match_note: noteDrafts[match.id] || null
      });
      if (updated) {
        setMatches((current) => current.map((item) => (item.id === match.id ? { ...item, ...updated } : item)));
        setMessage("Eşleşme aksiyonu kaydedildi.");
      }
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? getDataSetupMessage(error.message) : "Eşleşme aksiyonu kaydedilemedi.");
    } finally {
      setSavingId(null);
    }
  }

  function logAction(action: string, match: AdvisorMatchRow, summary: string) {
    if (!supabase) return;
    void supabase.logActivity({
      action,
      entity_type: "match",
      entity_id: match.id,
      entity_title: match.property?.title || request?.title || "Danışman eşleşmesi",
      summary,
      metadata: {
        property_id: match.property_id || match.property?.id,
        search_request_id: match.search_request_id || requestId,
        status: match.advisor_match_status || "new"
      }
    });
  }

  const requestTitle = request?.title || request?.request_type || request?.purpose || "Arayış detayı";
  const requestingAdvisor = getAdvisorById(advisors, request?.advisor_id || null);

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-5 pb-[calc(env(safe-area-inset-bottom)+7rem)] text-slate-950 dark:bg-black dark:text-neutral-50 sm:px-6 md:pb-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="border-b border-slate-200 pb-6 dark:border-white/10">
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/requests" className="btn-secondary">Arayışlara Dön</Link>
            <Link href="/menu/matches" className="btn-secondary">Eşleşmeler</Link>
          </div>
          <p className="mt-6 text-sm font-medium text-slate-500 dark:text-slate-400">Danışman arayışı</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-5xl">{requestTitle}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Bu sayfa OceanOS içi danışman iş birliği için hazırlanmıştır; müşteri kişisel bilgileri varsayılan olarak paylaşılmaz.
          </p>
        </header>

        {message ? <SetupNotice message={message} /> : null}
        {loading ? <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">Arayış detayı yükleniyor...</p> : null}
        {!loading && !isSupabaseConfigured ? <SetupNotice message={getDataSetupMessage("Supabase bağlantısı yok.")} /> : null}

        {request ? (
          <section className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <article className="oos-card rounded-[1.75rem] p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getUrgencyPillClass(request.urgency)}`}>
                  {formatUrgencyLabel(request.urgency)}
                </span>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusPillClass(request.status)}`}>
                  {formatStatusLabel(request.status)}
                </span>
              </div>
              <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                <Info label="Arayışı açan danışman" value={getAdvisorDisplayName(requestingAdvisor)} />
                <Info label="Arayış tipi" value={request.request_type || request.purpose || "Belirtilmedi"} />
                <Info label="Lokasyon" value={formatMatchLocation(request)} />
                <Info label="Gayrimenkul tipi" value={normalizeListValue(request.property_types) || request.property_type || "Belirtilmedi"} />
                <Info label="Bütçe" value={formatMatchBudget(request)} />
                <Info label="Oda / m²" value={formatRoomsAndArea(request)} />
                <Info label="Oluşturulma" value={formatDate(request.created_at)} />
                <Info label="Güncelleme" value={formatDate(request.updated_at)} />
              </dl>
              {request.notes ? (
                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Danışman notu</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{request.notes}</p>
                </div>
              ) : null}
            </article>

            <article className="oos-card-muted rounded-[1.75rem] p-5">
              <p className="text-sm text-slate-500 dark:text-slate-400">Eşleşen portföy</p>
              <p className="mt-2 text-4xl font-semibold">{matches.length}</p>
              <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Kartlar danışmanlar arası aksiyon içindir: portföyü aç, danışmanı ara, WhatsApp mesajı hazırla ve iş birliği statüsünü güncelle.
              </p>
            </article>
          </section>
        ) : !loading ? (
          <article className="mt-6 rounded-[1.75rem] border border-dashed border-slate-200 p-6 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
            Arayış kaydı bulunamadı veya bu kayda erişim izniniz yok.
          </article>
        ) : null}

        <section className="mt-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Eşleşen portföyler</p>
              <h2 className="mt-1 text-2xl font-semibold">Eşleşen Portföyler</h2>
            </div>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
              {matches.length} eşleşme
            </span>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {matches.map((match) => (
              <MatchedPropertyCard
                key={match.id}
                advisors={advisors}
                coverUrl={covers[match.property_id || match.property?.id || ""] || ""}
                currentProfileId={user?.id || null}
                expanded={expandedMatchId === match.id}
                match={match}
                noteDraft={noteDrafts[match.id] || ""}
                onLogAction={logAction}
                onSave={saveMatchWorkflow}
                onToggle={() => setExpandedMatchId((current) => (current === match.id ? null : match.id))}
                saving={savingId === match.id}
                statusDraft={statusDrafts[match.id] || match.advisor_match_status || "new"}
                onNoteChange={(value) => setNoteDrafts((current) => ({ ...current, [match.id]: value }))}
                onStatusChange={(value) => setStatusDrafts((current) => ({ ...current, [match.id]: value }))}
              />
            ))}
            {!matches.length && !loading ? (
              <article className="rounded-[1.75rem] border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500 dark:border-white/10 dark:text-slate-400 lg:col-span-2">
                Bu arayış için henüz eşleşen portföy bulunamadı.
              </article>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}

function MatchedPropertyCard({
  advisors,
  coverUrl,
  currentProfileId,
  expanded,
  match,
  noteDraft,
  onLogAction,
  onNoteChange,
  onSave,
  onStatusChange,
  onToggle,
  saving,
  statusDraft
}: {
  advisors: AdvisorRow[];
  coverUrl: string;
  currentProfileId: string | null;
  expanded: boolean;
  match: AdvisorMatchRow;
  noteDraft: string;
  onLogAction: (action: string, match: AdvisorMatchRow, summary: string) => void;
  onNoteChange: (value: string) => void;
  onSave: (match: AdvisorMatchRow) => void;
  onStatusChange: (value: string) => void;
  onToggle: () => void;
  saving: boolean;
  statusDraft: string;
}) {
  const property = match.property;
  const searchRequest = match.search_request;
  const score = Number(match.match_score ?? match.score ?? 0);
  const { propertyAdvisorId, requestAdvisorId } = getMatchAdvisorIds(match);
  const propertyAdvisor = getAdvisorById(advisors, propertyAdvisorId);
  const requestingAdvisor = getAdvisorById(advisors, requestAdvisorId);
  const oppositeAdvisor = getOppositeMatchAdvisor(match, advisors, currentProfileId);
  const oppositePhone = getAdvisorPhone(oppositeAdvisor);
  const normalizedPhone = normalizeTurkishPhone(oppositePhone);
  const phoneHref = normalizedPhone ? `tel:+${normalizedPhone}` : "";
  const propertyHref = property?.id ? `/properties/${property.id}` : "";
  const propertyUrl = propertyHref && typeof window !== "undefined" ? `${window.location.origin}${propertyHref}` : propertyHref;
  const whatsAppMessage = buildAdvisorMatchWhatsAppMessage({
    targetAdvisorName: getAdvisorDisplayName(oppositeAdvisor),
    searchSummary: getSearchRequestSummary(searchRequest),
    propertyTitle: property?.title || "Portföy",
    budget: formatMatchBudget(searchRequest),
    location: formatMatchLocation(searchRequest, property),
    score,
    propertyUrl
  });
  const whatsAppHref = buildWhatsAppHref(oppositePhone, whatsAppMessage);

  return (
    <article className="oos-card overflow-hidden rounded-[1.75rem]">
      <div className="grid gap-0 sm:grid-cols-[13rem_1fr]">
        <div className="h-52 sm:h-full">
          {coverUrl ? (
            <PropertyImageFrame alt={property?.title || "Eşleşen portföy"} className="h-full w-full" src={coverUrl} />
          ) : (
            <PropertyImageFrame alt={property?.title || "Eşleşen portföy"} className="h-full w-full" src={demoImage} />
          )}
        </div>
        <div className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200">
                %{score} Uyum
              </span>
              <h3 className="mt-3 text-lg font-semibold leading-snug">{property?.title || "Portföy bilgisi bekleniyor"}</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {[property?.district || property?.city, property?.property_type, property?.status ? formatStatusLabel(property.status) : ""].filter(Boolean).join(" · ")}
              </p>
            </div>
            <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 dark:border-white/10 dark:text-slate-300">
              {formatAdvisorMatchStatus(match.advisor_match_status)}
            </span>
          </div>

          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <Info label="Fiyat" value={property?.asking_price ? formatCompactAmount(Number(property.asking_price), property.currency || "TRY") : "Belirtilmedi"} />
            <Info label="Alan / oda" value={[property?.gross_area || property?.net_area ? `${property.gross_area || property.net_area} m²` : "", property?.room_count].filter(Boolean).join(" · ") || "Belirtilmedi"} />
            <Info label="Portföy danışmanı" value={getAdvisorDisplayName(propertyAdvisor)} />
            <Info label="Arayış danışmanı" value={getAdvisorDisplayName(requestingAdvisor)} />
          </dl>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {propertyHref ? (
              <Link className="btn-secondary text-center" href={propertyHref} onClick={() => onLogAction("advisor_match_property_opened", match, "Eşleşen portföy açıldı.")}>
                Portföyü Aç
              </Link>
            ) : null}
            {phoneHref ? (
              <a className="btn-secondary text-center" href={phoneHref} onClick={() => onLogAction("advisor_match_call_opened", match, "Danışman arama aksiyonu açıldı.")}>
                Danışmanı Ara
              </a>
            ) : (
              <button className="btn-secondary cursor-not-allowed opacity-60" type="button" disabled>Telefon yok</button>
            )}
            {whatsAppHref ? (
              <a className="btn-secondary text-center" href={whatsAppHref} target="_blank" rel="noreferrer" onClick={() => onLogAction("advisor_match_whatsapp_opened", match, "Danışman WhatsApp aksiyonu açıldı.")}>
                WhatsApp
              </a>
            ) : (
              <button className="btn-secondary cursor-not-allowed opacity-60" type="button" disabled>WhatsApp yok</button>
            )}
            <button className="btn-primary" type="button" onClick={onToggle}>
              {expanded ? "Aksiyonu Kapat" : "Aksiyona Geç"}
            </button>
          </div>
        </div>
      </div>

      {expanded ? (
        <div className="border-t border-slate-200 p-5 dark:border-white/10">
          <p className="text-sm font-semibold">Bu eşleşmede sıradaki aksiyon ne?</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Statü Güncelle
              <select className="input mt-2" value={statusDraft} onChange={(event) => onStatusChange(event.target.value)}>
                {advisorMatchStatuses.map((status) => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Eşleşme Notu
              <textarea className="input mt-2 min-h-24 resize-none" value={noteDraft} onChange={(event) => onNoteChange(event.target.value)} placeholder="İç danışman notu" />
            </label>
          </div>
          <div className="mt-4 flex justify-end">
            <button className="btn-primary" type="button" disabled={saving} onClick={() => onSave(match)}>
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </div>
      ) : null}
    </article>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">{label}</dt>
      <dd className="mt-1 font-medium text-slate-700 dark:text-slate-200">{value || "Belirtilmedi"}</dd>
    </div>
  );
}

function SetupNotice({ message }: { message: string }) {
  return (
    <p className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100">
      {message}
    </p>
  );
}

function formatRoomsAndArea(request: AdvisorSearchRequestRow) {
  return [
    request.rooms || (request.min_bedrooms ? `${request.min_bedrooms}+ oda` : ""),
    request.min_area ? `${request.min_area} m² ve üzeri` : "",
    request.max_area ? `${request.max_area} m² üst limit` : ""
  ].filter(Boolean).join(" · ") || "Belirtilmedi";
}

function formatDate(value?: string | null) {
  if (!value) return "Belirtilmedi";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Belirtilmedi";
  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" }).format(date);
}
