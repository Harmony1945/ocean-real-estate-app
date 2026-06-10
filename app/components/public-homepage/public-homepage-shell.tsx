"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, ReactNode, useState } from "react";
import BrandLogo from "@/app/brand-logo";
import { demoShowcasePortfolios } from "@/lib/oos/demo-data";
import {
  OCEAN_COMPANY_NAME,
  OCEAN_CONTACT_ADDRESS,
  OCEAN_CONTACT_EMAIL,
  OCEAN_CONTACT_MAILTO,
  OCEAN_CONTACT_PHONE
} from "@/lib/oos/contact";

type PublicHomepageConsultant = {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  portfolioCount: number;
};

type PublicHomepageAuthMode = "login" | "signup";

type PublicHomepageAuthForm = {
  name: string;
  email: string;
  password: string;
  consultantId: string;
};

type PublicHomepageShellProps = {
  consultants?: PublicHomepageConsultant[];
  mode?: PublicHomepageAuthMode;
  form?: PublicHomepageAuthForm;
  oceanOSCard?: ReactNode;
  onModeChange?: (mode: PublicHomepageAuthMode) => void;
  onFormChange?: (form: PublicHomepageAuthForm) => void;
  onLogin?: (consultant: PublicHomepageConsultant) => void;
};

const navItems = [
  { label: "Satın Al", href: "#portfoyler" },
  { label: "Kirala", href: "#portfoyler" },
  { label: "Sat", href: "#portfoy-birak" },
  { label: "Projeler", href: "#projeler" },
  { label: "Danışmanlar", href: "#danisman-ol" },
  { label: "OceanOS", href: "#oceanos" },
  { label: "İletişim", href: "#iletisim" }
];

const regions = [
  { name: "Acarkent", line: "Villa, site yaşamı ve yüksek mahremiyet odağı." },
  { name: "Beykoz", line: "Doğa, şehir erişimi ve premium konut dengesi." },
  { name: "Çubuklu", line: "Boğaz hattına yakın güçlü aile lokasyonu." },
  { name: "Polonezköy", line: "Arsa, villa ve sakin yaşam senaryoları." },
  { name: "Kısıklı", line: "Anadolu yakası erişimi ve prestijli konut aksı." },
  { name: "Görele", line: "Gelişim potansiyeli ve seçici alıcı profili." },
  { name: "İstanbul Boğaz Hattı", line: "Nadir portföyler, güçlü değer koruması." }
];

const whyOcean = [
  ["Sistem Odaklı Çalışma", "Portföy, arayış, eşleşme ve takip adımları tek disiplin içinde ilerler."],
  ["Premium Portföy Sunumu", "Fotoğraf, watermark, paylaşım ve PDF akışları marka standardıyla hazırlanır."],
  ["Danışmanlar Arası Eşleşme", "Talep ve portföy datası Ocean ağı içinde operasyon fırsatına dönüşür."],
  ["Merkezi Operasyon Disiplini", "Kritik aksiyonlar, bildirimler ve kayıtlar düzenli şekilde takip edilir."],
  ["Proje Satış Yetkinliği", "Proje sahibi, yatırımcı ve arsa sahibi süreçleri ayrı stratejiyle ele alınır."],
  ["OceanOS Altyapısı", "Danışman üretimini destekleyen modern dijital işletim sistemi markanın merkezindedir."]
];

export default function PublicHomepageShell({
  consultants,
  mode,
  form,
  onModeChange,
  onFormChange,
  onLogin
}: PublicHomepageShellProps) {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f6f4ef] text-[#071321] dark:bg-black dark:text-white">
      <PublicHero
        consultants={consultants}
        form={form}
        mode={mode}
        onFormChange={onFormChange}
        onLogin={onLogin}
        onModeChange={onModeChange}
      />
      <FeaturedPropertiesSection />
      <RegionsSection />
      <ProjectSalesSection />
      <WhyOceanSection />
      <JoinAndOwnerSection />
      <PublicFooter />
    </main>
  );
}

function PublicHero(props: PublicHomepageShellProps) {
  return (
    <section className="relative min-h-dvh bg-[#011c40] text-white">
      <Image
        src="/mandarin-2.jpeg"
        alt="Ocean Real Estate Mandarin premium gayrimenkul atmosferi"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0" style={{ backgroundColor: "rgba(1, 28, 64, 0.72)" }} />
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative mx-auto flex min-h-dvh max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <PublicNavigation />
        <div className="grid flex-1 items-center gap-10 py-14 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.72fr)] lg:py-16">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase text-white/65">Ocean Real Estate</p>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.04] sm:text-6xl lg:text-7xl">
              İstanbul’un premium gayrimenkul işletim sistemi.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/76 sm:text-lg">
              OCEAN REAL ESTATE; portföy, proje, danışman ve müşteri süreçlerini tek merkezden yöneten modern bir gayrimenkul markasıdır.
            </p>
            <PublicSearchBar />
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="#portfoyler" className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#011c40] transition hover:bg-white/90">
                Portföyleri İncele
              </Link>
              <Link href="#portfoy-birak" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/60 hover:bg-white/10">
                Portföyünü Bize Bırak
              </Link>
              <Link href="#oceanos" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/18 px-6 py-3 text-sm font-semibold text-white/80 transition hover:border-white/45 hover:text-white">
                OceanOS Girişi
              </Link>
            </div>
          </div>
          <div id="oceanos">
            {props.oceanOSCard || (
              <OceanOSLoginCard
                consultants={props.consultants ?? []}
                mode={props.mode ?? "login"}
                form={props.form ?? { name: "", email: "", password: "", consultantId: "" }}
                onFormChange={props.onFormChange ?? (() => undefined)}
                onLogin={props.onLogin ?? (() => undefined)}
                onModeChange={props.onModeChange ?? (() => undefined)}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function PublicNavigation() {
  return (
    <header className="flex flex-col gap-4 rounded-lg border border-white/15 bg-black/16 p-3 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
      <Link href="/" aria-label="Ocean Real Estate ana sayfa" className="inline-flex h-16 items-center overflow-hidden">
        <BrandLogo variant="full" size="sm" className="max-h-16" fallbackClassName="text-xl font-semibold" />
      </Link>
      <nav className="flex flex-wrap gap-1.5 text-sm text-white/72">
        {navItems.map((item) => (
          <Link key={`${item.label}-${item.href}`} href={item.href} className="rounded-full px-3 py-2 transition hover:bg-white/10 hover:text-white">
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

function PublicSearchBar() {
  const [query, setQuery] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (typeof window !== "undefined") {
      window.location.hash = "portfoyler";
    }
  }

  return (
    <form onSubmit={submit} className="mt-8 flex w-full max-w-2xl flex-col gap-2 rounded-lg border border-white/20 bg-white/12 p-2 backdrop-blur-md sm:flex-row">
      <input
        aria-label="Public portföy arama"
        className="min-h-12 flex-1 rounded-md border border-white/10 bg-white px-4 text-sm text-[#071321] outline-none placeholder:text-slate-500"
        placeholder="Bölge, portföy, proje veya danışman ara..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <button type="submit" className="min-h-12 rounded-md bg-[#9fb7a3] px-5 text-sm font-semibold text-[#071321] transition hover:bg-[#b7cdb9]">
        Vitrine Git
      </button>
    </form>
  );
}

function OceanOSLoginCard({
  consultants,
  mode,
  form,
  onModeChange,
  onFormChange,
  onLogin
}: Required<Pick<PublicHomepageShellProps, "consultants" | "mode" | "form" | "onModeChange" | "onFormChange" | "onLogin">>) {
  const [error, setError] = useState("");
  const cardConsultants = consultants;
  const cardMode = mode;
  const cardForm = form;
  const changeCardMode = onModeChange;
  const changeCardForm = onFormChange;
  const loginToCard = onLogin;
  const selectedConsultant = cardConsultants.find((consultant) => String(consultant.id) === cardForm.consultantId) || cardConsultants[0] || null;

  function update(key: keyof PublicHomepageAuthForm, value: string) {
    changeCardForm({ ...cardForm, [key]: value });
    setError("");
  }

  function changeMode(nextMode: PublicHomepageAuthMode) {
    changeCardMode(nextMode);
    setError("");
  }

  function submit() {
    if (cardMode === "signup") {
      if (!cardForm.name.trim() || !cardForm.email.trim() || !cardForm.password.trim()) {
        setError("Lütfen tüm alanları doldurun.");
        return;
      }
      if (selectedConsultant) loginToCard(selectedConsultant);
      return;
    }

    if (!cardForm.email.trim() || !cardForm.password.trim()) {
      setError("Kullanıcı adı/e-posta ve şifre zorunludur.");
      return;
    }

    if (selectedConsultant) loginToCard(selectedConsultant);
  }

  function continueWithGoogle() {
    if (selectedConsultant) loginToCard(selectedConsultant);
  }

  return (
    <section className="rounded-lg border border-white/20 bg-white/95 p-5 text-[#071321] shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-6">
      <div>
        <p className="text-sm font-semibold text-[#587160]">OceanOS Girişi</p>
        <h2 className="mt-2 text-2xl font-semibold">Danışman ve yönetim paneli</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Portföy, arayış, eşleşme, bildirim ve komisyon süreçleri için özel Ocean çalışma alanı.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 rounded-lg bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => changeMode("login")}
          className={`rounded-md px-3 py-2 text-sm transition ${cardMode === "login" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
        >
          Giriş
        </button>
        <button
          type="button"
          onClick={() => changeMode("signup")}
          className={`rounded-md px-3 py-2 text-sm transition ${cardMode === "signup" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
        >
          Kayıt
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {cardMode === "signup" ? (
          <input
            className="input !rounded-md !border-slate-200 !bg-white !px-4 !py-3 !text-slate-950 placeholder:!text-slate-400"
            placeholder="Ad Soyad"
            value={cardForm.name}
            onChange={(event) => update("name", event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") submit();
            }}
          />
        ) : null}
        <input
          className="input !rounded-md !border-slate-200 !bg-white !px-4 !py-3 !text-slate-950 placeholder:!text-slate-400"
          placeholder="Kullanıcı adı veya e-posta"
          value={cardForm.email}
          onChange={(event) => update("email", event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") submit();
          }}
        />
        <input
          className="input !rounded-md !border-slate-200 !bg-white !px-4 !py-3 !text-slate-950 placeholder:!text-slate-400"
          placeholder="Şifre"
          type="password"
          value={cardForm.password}
          onChange={(event) => update("password", event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") submit();
          }}
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button type="button" onClick={submit} className="w-full rounded-md bg-[#011c40] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#062b5d]">
          {cardMode === "signup" ? "Hesap Oluştur" : "Giriş Yap"}
        </button>
        <button type="button" onClick={continueWithGoogle} className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 transition hover:bg-slate-50">
          <span className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-200 text-xs font-semibold">G</span>
          Google ile devam et
        </button>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <span>Private workspace for OCEAN advisors.</span>
        <Link href="/forgot-password" className="font-medium text-[#011c40] transition hover:text-[#587160]">
          Şifremi unuttum
        </Link>
      </div>
    </section>
  );
}

function FeaturedPropertiesSection() {
  const portfolios = demoShowcasePortfolios.slice(0, 6);

  return (
    <section id="portfoyler" className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionIntro
          eyebrow="Vitrin"
          title="Öne Çıkan Portföyler"
          subtitle="Ocean portföylerinden seçilmiş premium fırsatlar."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {portfolios.map((portfolio) => (
            <article key={portfolio.id} className="overflow-hidden rounded-lg border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
              <div className="relative h-56 bg-[#011c40]">
                <Image src="/mandarin-2.jpeg" alt={portfolio.title} fill sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover" />
                <div className="absolute inset-0 bg-[#011c40]/54" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="text-xs font-medium uppercase text-white/70">{portfolio.listingId}</p>
                  <h3 className="mt-2 text-xl font-semibold leading-snug">{portfolio.title}</h3>
                </div>
              </div>
              <div className="p-4">
                <p className="text-2xl font-semibold">{formatPublicPrice(portfolio.value)}</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-white/65">{portfolio.location}</p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                  <Spec label="Tip" value={portfolio.propertyType} />
                  <Spec label="Oda" value={portfolio.rooms || "Plan"} />
                  <Spec label="Alan" value={`${portfolio.area} m²`} />
                </div>
                <Link href="#iletisim" className="mt-4 inline-flex min-h-10 items-center justify-center rounded-full border border-[#011c40]/20 px-4 text-sm font-semibold text-[#011c40] transition hover:border-[#011c40]/50 dark:border-white/20 dark:text-white">
                  Bilgi Al
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function RegionsSection() {
  return (
    <section id="bolgeler" className="bg-white px-4 py-16 dark:bg-white/[0.03] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionIntro eyebrow="Lokasyon" title="Bölgeler" subtitle="Ocean’ın güçlü olduğu seçici İstanbul lokasyonları." />
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {regions.map((region) => (
            <Link key={region.name} href="#portfoyler" className="group rounded-lg border border-black/10 bg-[#f6f4ef] p-5 transition hover:-translate-y-0.5 hover:border-[#587160]/50 dark:border-white/10 dark:bg-black">
              <h3 className="text-lg font-semibold">{region.name}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-white/62">{region.line}</p>
              <span className="mt-5 inline-flex text-sm font-semibold text-[#587160] group-hover:text-[#011c40] dark:text-[#b7cdb9]">
                Portföyleri gör
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectSalesSection() {
  return (
    <section id="projeler" className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 rounded-lg border border-black/10 bg-[#011c40] p-6 text-white md:grid-cols-[1fr_0.72fr] md:p-10">
        <div>
          <p className="text-sm font-medium uppercase text-white/55">Proje ve yatırım</p>
          <h2 className="mt-4 text-3xl font-semibold sm:text-5xl">Proje Satış ve Yatırım Danışmanlığı</h2>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/72 sm:text-base">
            Ocean; proje sahipleri, geliştiriciler, yatırımcılar ve arsa sahipleri için yapılandırılmış proje satışı, portföy stratejisi ve deal flow süreçleriyle çalışır.
          </p>
        </div>
        <div className="flex flex-col justify-end gap-3">
          <Link href="#iletisim" className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-[#011c40] transition hover:bg-white/90">
            Proje Başvurusu Yap
          </Link>
          <Link href="#iletisim" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/25 px-6 text-sm font-semibold text-white transition hover:border-white/60">
            Yatırım Fırsatlarını Görüşelim
          </Link>
        </div>
      </div>
    </section>
  );
}

function WhyOceanSection() {
  return (
    <section className="bg-white px-4 py-16 dark:bg-white/[0.03] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionIntro eyebrow="Marka standardı" title="Neden OCEAN?" subtitle="Gayrimenkul süreçlerini kişisel hafızadan çıkarıp ölçülebilir bir operasyon düzenine taşıyan çalışma modeli." />
        <div className="mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {whyOcean.map(([title, body]) => (
            <article key={title} className="rounded-lg border border-black/10 bg-[#f6f4ef] p-5 dark:border-white/10 dark:bg-black">
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-white/62">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function JoinAndOwnerSection() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-2">
        <article id="danisman-ol" className="rounded-lg border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-white/[0.04]">
          <p className="text-sm font-medium uppercase text-[#587160]">Danışman modeli</p>
          <h2 className="mt-4 text-3xl font-semibold">Ocean’a Katıl</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-white/65">
            Daha şeffaf, sistemli ve ölçeklenebilir bir gayrimenkul çalışma modeliyle tanış.
          </p>
          <Link href="/apply-advisor" className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-[#011c40] px-6 text-sm font-semibold text-white transition hover:bg-[#062b5d]">
            Danışman Başvurusu
          </Link>
        </article>
        <article id="portfoy-birak" className="rounded-lg border border-black/10 bg-[#dfe6dc] p-6 dark:border-white/10 dark:bg-[#10233f]">
          <p className="text-sm font-medium uppercase text-[#587160] dark:text-[#b7cdb9]">Malik ve portföy sahipleri</p>
          <h2 className="mt-4 text-3xl font-semibold">Portföyünü OCEAN ile konumlandır</h2>
          <p className="mt-4 text-sm leading-7 text-slate-700 dark:text-white/70">
            Satış, kiralama veya proje sürecini profesyonel bir sistem içinde yönet.
          </p>
          <Link href="#iletisim" className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-[#011c40] transition hover:bg-white/90">
            Portföyünü Bize Bırak
          </Link>
        </article>
      </div>
    </section>
  );
}

function PublicFooter() {
  return (
    <footer id="iletisim" className="bg-black px-4 py-12 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1fr_1.2fr]">
        <div>
          <BrandLogo variant="full" size="sm" fallbackClassName="text-2xl font-semibold" />
          <p className="mt-3 text-sm text-white/55">{OCEAN_COMPANY_NAME}</p>
          <div className="mt-6 space-y-2 text-sm text-white/70">
            <p>{OCEAN_CONTACT_PHONE}</p>
            <a href={OCEAN_CONTACT_MAILTO} className="block transition hover:text-white">{OCEAN_CONTACT_EMAIL}</a>
            <p>{OCEAN_CONTACT_ADDRESS}</p>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          <FooterColumn title="Website" links={[["Portföyler", "#portfoyler"], ["Projeler", "#projeler"], ["İletişim", "#iletisim"]]} />
          <FooterColumn title="OceanOS" links={[["OceanOS", "#oceanos"], ["Danışman Başvurusu", "/apply-advisor"], ["Destek", "/support"]]} />
          <FooterColumn title="Yasal" links={[["Gizlilik", "/legal/gizlilik-politikasi"], ["Kullanım Koşulları", "/legal/kullanim-kosullari"], ["İletişim", "/contact"]]} />
        </div>
      </div>
    </footer>
  );
}

function SectionIntro({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <div className="max-w-3xl">
      <p className="text-sm font-semibold uppercase text-[#587160] dark:text-[#b7cdb9]">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold sm:text-5xl">{title}</h2>
      <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-white/65 sm:text-base">{subtitle}</p>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-slate-50 p-3 dark:bg-white/[0.06]">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}

function FooterColumn({ title, links }: { title: string; links: Array<[string, string]> }) {
  return (
    <div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <ul className="mt-4 space-y-3 text-sm text-white/55">
        {links.map(([label, href]) => (
          <li key={`${label}-${href}`}>
            <Link href={href} className="transition hover:text-white">{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function formatPublicPrice(value: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0
  }).format(value);
}
