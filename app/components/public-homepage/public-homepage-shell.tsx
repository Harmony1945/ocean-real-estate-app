"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, ReactNode, useState } from "react";
import BrandLogo from "@/app/brand-logo";
import { demoShowcasePortfolios } from "@/lib/oos/demo-data";
import { legalPages } from "@/lib/oos/legal-pages";
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
  { name: "Beykoz", line: "Villa, site yaşamı ve doğa eksenli premium portföyler." },
  { name: "Sarıyer", line: "Kuzey İstanbul, sahil hattı ve güçlü yatırım profili." },
  { name: "Beşiktaş", line: "Merkezi yaşam, Boğaz etkisi ve yüksek likidite." },
  { name: "Üsküdar", line: "Boğaz hattı, aile yaşamı ve güçlü ulaşım dengesi." },
  { name: "Kadıköy", line: "Cadde, sahil ve yatırım odaklı şehir portföyleri." },
  { name: "Bakırköy", line: "Kıyı yaşamı, ticari akslar ve aile konutları." },
  { name: "Şişli", line: "Merkezi ofis, residence ve karma kullanım fırsatları." },
  { name: "Ataşehir", line: "Finans merkezi çevresi ve modern konut talebi." },
  { name: "Beyoğlu", line: "Tarihi doku, turizm ve dönüşüm odaklı fırsatlar." },
  { name: "Zeytinburnu", line: "Sahil projeleri ve markalı konut aksı." },
  { name: "Başakşehir", line: "Yeni gelişim bölgeleri ve proje odaklı talep." },
  { name: "Kartal", line: "Sahil hattı, ulaşım ve dönüşüm potansiyeli." }
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
  oceanOSCard,
  onModeChange,
  onFormChange,
  onLogin
}: PublicHomepageShellProps) {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7f6f2] text-[#071321] dark:bg-black dark:text-white">
      <PublicHero
        consultants={consultants}
        form={form}
        mode={mode}
        oceanOSCard={oceanOSCard}
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
    <>
      <DesktopHero {...props} />
      <MobileHero {...props} />
    </>
  );
}

function DesktopHero(props: PublicHomepageShellProps) {
  return (
    <section className="relative hidden min-h-screen bg-[#011c40] text-white md:block">
      <Image
        src="/mandarin-2.jpeg"
        alt="Ocean Real Estate Mandarin premium gayrimenkul atmosferi"
        fill
        priority
        sizes="(min-width: 768px) 100vw, 0px"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#011c40]/90 via-[#011c40]/60 to-[#011c40]/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/24" />
      <div className="relative mx-auto flex min-h-screen max-w-[1760px] flex-col px-5 py-7 sm:px-8 lg:px-12 xl:px-16">
        <DesktopNavigation />
        <div className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-[minmax(0,1fr)_minmax(390px,0.42fr)] lg:gap-16 xl:gap-24">
          <div className="max-w-5xl">
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-white/70">Ocean Real Estate</p>
            <h1 className="mt-6 max-w-5xl text-5xl font-semibold leading-[0.96] sm:text-6xl lg:text-7xl xl:text-[5rem]">
              İstanbul’un premium gayrimenkul işletim sistemi.
            </h1>
            <p className="mt-7 max-w-3xl text-base leading-8 text-white/80 sm:text-xl sm:leading-9">
              OCEAN REAL ESTATE; portföy, proje, danışman ve müşteri süreçlerini tek merkezden yöneten modern bir gayrimenkul markasıdır.
            </p>
            <PublicSearchBar />
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="#portfoyler" className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-7 py-3 text-sm font-semibold text-[#011c40] transition hover:bg-white/90">
                Portföyleri İncele
              </Link>
              <Link href="#portfoy-birak" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/35 px-7 py-3 text-sm font-semibold text-white transition hover:border-white/70 hover:bg-white/10">
                Portföyünü Bize Bırak
              </Link>
              <Link href="#desktop-oceanos" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/20 px-7 py-3 text-sm font-semibold text-white/80 transition hover:border-white/50 hover:text-white">
                OceanOS Girişi
              </Link>
            </div>
          </div>
          <div id="desktop-oceanos">
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

function MobileHero(props: PublicHomepageShellProps) {
  return (
    <section className="relative overflow-hidden bg-[#011c40] text-white md:hidden">
      <Image
        src="/mandarin-2.jpeg"
        alt="Ocean Real Estate Mandarin premium gayrimenkul atmosferi"
        fill
        priority
        sizes="(max-width: 767px) 100vw, 0px"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-[#011c40]/72" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-[#011c40]/78" />
      <div className="relative flex min-h-[100svh] flex-col px-5 pb-[calc(env(safe-area-inset-bottom)+2rem)] pt-5">
        <MobileNavigation />
        <div className="flex flex-1 flex-col justify-center py-10">
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-white/65">Ocean Real Estate</p>
          <h1 className="mt-5 max-w-[18rem] text-[2.65rem] font-semibold leading-[0.98] tracking-tight">
            İstanbul’un premium gayrimenkul sistemi.
          </h1>
          <p className="mt-5 max-w-sm text-sm leading-6 text-white/75">
            Portföy, proje ve danışman süreçleri için modern Ocean altyapısı.
          </p>
          <MobileSearchBar />
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Link href="#portfoyler" className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-4 text-sm font-semibold text-[#011c40] transition hover:bg-white/90">
              Portföyleri İncele
            </Link>
            <Link href="#mobile-oceanos" className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/30 px-4 text-sm font-semibold text-white transition hover:border-white/60 hover:bg-white/10">
              OceanOS Girişi
            </Link>
          </div>
        </div>
      </div>
      <div id="mobile-oceanos" className="relative bg-[#011c40] px-5 pb-10 pt-2">
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
    </section>
  );
}

function DesktopNavigation() {
  return (
    <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <Link href="/" aria-label="Ocean Real Estate ana sayfa" className="inline-flex h-24 items-center overflow-hidden sm:h-28">
        <BrandLogo variant="full" size="xl" className="max-h-28 !w-44 sm:!w-56 lg:!w-72" fallbackClassName="text-3xl font-semibold" />
      </Link>
      <nav className="flex flex-wrap gap-x-2 gap-y-1 text-sm font-medium text-white/80 sm:justify-end">
        {navItems.map((item) => (
          <Link key={`${item.label}-${item.href}`} href={item.label === "OceanOS" ? "#desktop-oceanos" : item.href} className="rounded-full px-3.5 py-2 transition hover:bg-white/10 hover:text-white">
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);

  function closeMenu() {
    setIsOpen(false);
  }

  return (
    <header className="relative z-20">
      <div className="flex items-center justify-between gap-3">
        <Link href="/" aria-label="Ocean Real Estate ana sayfa" className="inline-flex h-16 items-center overflow-hidden">
          <BrandLogo variant="full" size="lg" className="max-h-16 !w-40" fallbackClassName="text-2xl font-semibold" />
        </Link>
        <div className="flex items-center gap-2">
          <Link href="#mobile-oceanos" className="inline-flex min-h-10 items-center rounded-full border border-white/25 px-3 text-xs font-semibold text-white/85">
            OceanOS
          </Link>
          <button
            type="button"
            onClick={() => setIsOpen((current) => !current)}
            className="inline-flex min-h-10 items-center rounded-full bg-white px-4 text-xs font-semibold text-[#011c40] shadow-sm"
            aria-expanded={isOpen}
            aria-controls="mobile-public-menu"
          >
            Menü
          </button>
        </div>
      </div>
      {isOpen ? (
        <nav id="mobile-public-menu" className="mt-4 rounded-[1.5rem] border border-white/15 bg-black/55 p-2 shadow-2xl shadow-black/25 backdrop-blur-xl">
          {navItems.map((item) => (
            <Link
              key={`${item.label}-${item.href}-mobile`}
              href={item.label === "OceanOS" ? "#mobile-oceanos" : item.href}
              onClick={closeMenu}
              className="flex min-h-11 items-center justify-between rounded-2xl px-4 text-sm font-medium text-white/85 transition hover:bg-white/10 hover:text-white"
            >
              {item.label}
              <span aria-hidden="true">›</span>
            </Link>
          ))}
        </nav>
      ) : null}
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
    <form onSubmit={submit} className="mt-7 flex w-full max-w-3xl flex-col gap-2 rounded-full border border-white/20 bg-black/20 p-2 shadow-2xl shadow-black/10 backdrop-blur-md sm:flex-row">
      <input
        aria-label="Public portföy arama"
        className="min-h-12 flex-1 rounded-full border border-white/10 bg-white px-5 text-sm text-[#071321] outline-none placeholder:text-slate-500"
        placeholder="Bölge, portföy, proje veya danışman ara..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <button type="submit" className="min-h-12 rounded-full bg-white px-6 text-sm font-semibold text-[#011c40] transition hover:bg-white/90">
        Ara
      </button>
    </form>
  );
}

function MobileSearchBar() {
  const [query, setQuery] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (typeof window !== "undefined") {
      window.location.hash = "portfoyler";
    }
  }

  return (
    <form onSubmit={submit} className="relative mt-7">
      <input
        aria-label="Mobil public portföy arama"
        className="min-h-12 w-full rounded-full border border-white/15 bg-white/95 py-3 pl-5 pr-14 text-sm text-[#071321] outline-none placeholder:text-slate-500"
        placeholder="Bölge, proje veya portföy ara..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <button type="submit" className="absolute right-1.5 top-1.5 grid h-9 w-9 place-items-center rounded-full bg-[#011c40] text-sm font-semibold text-white" aria-label="Ara">
        Ara
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
    <section className="rounded-[2rem] border border-white/20 bg-black/70 p-5 text-white shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-6">
      <div>
        <p className="text-sm font-semibold text-white/50">OceanOS Girişi</p>
        <h2 className="mt-2 text-2xl font-semibold">Danışman ve yönetim paneli</h2>
        <p className="mt-2 text-sm leading-6 text-white/60">
          Ocean çalışma alanına danışman hesabınızla devam edin.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 rounded-2xl bg-white/10 p-1">
        <button
          type="button"
          onClick={() => changeMode("login")}
          className={`rounded-xl px-3 py-2 text-sm transition ${cardMode === "login" ? "bg-white text-slate-950 shadow-sm" : "text-white/60 hover:text-white"}`}
        >
          Giriş
        </button>
        <button
          type="button"
          onClick={() => changeMode("signup")}
          className={`rounded-xl px-3 py-2 text-sm transition ${cardMode === "signup" ? "bg-white text-slate-950 shadow-sm" : "text-white/60 hover:text-white"}`}
        >
          Kayıt
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {cardMode === "signup" ? (
          <input
            className="input !rounded-2xl !border-white/10 !bg-white/10 !px-4 !py-3 !text-white placeholder:!text-white/45 focus:!border-white/25 focus:!ring-white/10"
            placeholder="Ad Soyad"
            value={cardForm.name}
            onChange={(event) => update("name", event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") submit();
            }}
          />
        ) : null}
        <input
          className="input !rounded-2xl !border-white/10 !bg-white/10 !px-4 !py-3 !text-white placeholder:!text-white/45 focus:!border-white/25 focus:!ring-white/10"
          placeholder="Kullanıcı adı veya e-posta"
          value={cardForm.email}
          onChange={(event) => update("email", event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") submit();
          }}
        />
        <input
          className="input !rounded-2xl !border-white/10 !bg-white/10 !px-4 !py-3 !text-white placeholder:!text-white/45 focus:!border-white/25 focus:!ring-white/10"
          placeholder="Şifre"
          type="password"
          value={cardForm.password}
          onChange={(event) => update("password", event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") submit();
          }}
        />
        {error ? <p className="text-sm text-red-200">{error}</p> : null}
        <button type="button" onClick={submit} className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#011c40] transition hover:bg-neutral-100">
          {cardMode === "signup" ? "Hesap Oluştur" : "Giriş Yap"}
        </button>
        <button type="button" onClick={continueWithGoogle} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white transition hover:bg-white/15">
          <span className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-200 text-xs font-semibold">G</span>
          Google ile devam et
        </button>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-xs text-white/45">
        <span>OOS advisors private workspace</span>
        <Link href="/forgot-password" className="font-medium text-white/65 transition hover:text-white">
          Şifremi unuttum
        </Link>
      </div>
    </section>
  );
}

function FeaturedPropertiesSection() {
  const portfolios = demoShowcasePortfolios.slice(0, 6);

  return (
    <section id="portfoyler" className="px-5 py-14 md:py-20 sm:px-8 lg:px-12 xl:px-16">
      <div className="mx-auto max-w-[1760px]">
        <SectionIntro
          eyebrow="Vitrin"
          title="Öne Çıkan Portföyler"
          subtitle="Ocean portföylerinden seçilmiş premium fırsatlar."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {portfolios.map((portfolio) => (
            <Link key={portfolio.id} href={`/properties/${portfolio.id}`} className="group block overflow-hidden rounded-[1.5rem] border border-black/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-950/10 dark:border-white/10 dark:bg-white/[0.04]">
              <div className="relative h-60 bg-[#011c40] md:h-80">
                <Image src="/mandarin-2.jpeg" alt={portfolio.title} fill sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#011c40]/80 via-[#011c40]/20 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <p className="text-xs font-medium uppercase text-white/70">{portfolio.listingId}</p>
                  <h3 className="mt-2 text-xl font-semibold leading-snug md:text-2xl">{portfolio.title}</h3>
                </div>
              </div>
              <div className="p-5">
                <p className="text-xl font-semibold md:text-2xl">{formatPublicPrice(portfolio.value)}</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-white/65">{portfolio.location}</p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                  <Spec label="Tip" value={portfolio.propertyType} />
                  <Spec label="Oda" value={portfolio.rooms || "Plan"} />
                  <Spec label="Alan" value={`${portfolio.area} m²`} />
                </div>
                <span className="mt-5 inline-flex min-h-10 items-center justify-center rounded-full border border-[#011c40]/20 px-4 text-sm font-semibold text-[#011c40] transition group-hover:border-[#011c40]/50 dark:border-white/20 dark:text-white">
                  Portföyü Aç
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function RegionsSection() {
  return (
    <section id="bolgeler" className="bg-white px-5 py-14 dark:bg-white/[0.03] md:py-20 sm:px-8 lg:px-12 xl:px-16">
      <div className="mx-auto max-w-[1760px]">
        <SectionIntro eyebrow="Lokasyon" title="Bölgeler" subtitle="Ocean’ın güçlü olduğu seçici İstanbul lokasyonları." />
        <div className="mt-8 grid grid-cols-2 gap-3 md:mt-10 lg:grid-cols-4">
          {regions.map((region) => (
            <Link key={region.name} href={`/all-portfolios?district=${encodeURIComponent(region.name)}`} className="group rounded-[1.25rem] border border-black/10 bg-[#f7f6f2] p-4 transition hover:-translate-y-0.5 hover:border-[#011c40]/35 dark:border-white/10 dark:bg-black md:p-5">
              <h3 className="text-base font-semibold md:text-lg">{region.name}</h3>
              <p className="mt-3 hidden text-sm leading-6 text-slate-600 dark:text-white/65 sm:block">{region.line}</p>
              <span className="mt-3 inline-flex text-xs font-semibold text-[#011c40] dark:text-white md:mt-5 md:text-sm">
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
    <section id="projeler" className="px-5 py-14 md:py-20 sm:px-8 lg:px-12 xl:px-16">
      <div className="mx-auto grid max-w-[1760px] gap-8 bg-[#011c40] p-6 text-white md:grid-cols-[1fr_0.55fr] md:p-14 xl:p-20">
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
    <section className="bg-white px-5 py-14 dark:bg-white/[0.03] md:py-20 sm:px-8 lg:px-12 xl:px-16">
      <div className="mx-auto max-w-[1760px]">
        <SectionIntro eyebrow="Marka standardı" title="Neden OCEAN?" subtitle="Gayrimenkul süreçlerini kişisel hafızadan çıkarıp ölçülebilir bir operasyon düzenine taşıyan çalışma modeli." />
        <div className="mt-10 grid gap-0 border-y border-black/10 dark:border-white/10 md:grid-cols-2 lg:grid-cols-3">
          {whyOcean.map(([title, body]) => (
            <article key={title} className="border-b border-black/10 p-5 dark:border-white/10 md:p-6 lg:border-r">
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-white/65">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function JoinAndOwnerSection() {
  return (
    <section className="px-5 py-14 md:py-20 sm:px-8 lg:px-12 xl:px-16">
      <div className="mx-auto grid max-w-[1760px] gap-4 lg:grid-cols-2">
        <article id="danisman-ol" className="bg-white p-6 dark:bg-white/[0.04] md:p-8 lg:p-12">
          <p className="text-sm font-medium uppercase text-[#011c40] dark:text-white/60">Danışman modeli</p>
          <h2 className="mt-4 text-3xl font-semibold">Ocean’a Katıl</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-white/65">
            Daha şeffaf, sistemli ve ölçeklenebilir bir gayrimenkul çalışma modeliyle tanış.
          </p>
          <Link href="/apply-advisor" className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-[#011c40] px-6 text-sm font-semibold text-white transition hover:bg-[#062b5d]">
            Danışman Başvurusu
          </Link>
        </article>
        <article id="portfoy-birak" className="bg-[#e8e8e5] p-6 dark:bg-[#10233f] md:p-8 lg:p-12">
          <p className="text-sm font-medium uppercase text-[#011c40] dark:text-white/60">Malik ve portföy sahipleri</p>
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
  const columns = [
    {
      title: "OceanOS",
      links: [
        { label: "Dashboard", href: "/" },
        { label: "Portföyler", href: "/portfolios" },
        { label: "Arayışlar", href: "/requests" },
        { label: "Eşleşmeler", href: "/menu/matches" },
        { label: "Harita", href: "/menu/map" },
        { label: "Ödemeler", href: "/menu/payments" }
      ]
    },
    {
      title: "Danışman Araçları",
      links: [
        { label: "Vergi Hesaplayıcı", href: "/tools/tax-calculator" },
        { label: "İşlem ve Komisyonlar", href: "/menu/commissions" },
        { label: "Raporlar", href: "/menu/reports" },
        { label: "Görevler", href: "/menu/tasks" },
        { label: "Yardım ve Destek", href: "/support" },
        { label: "SSS", href: "/menu/faq" }
      ]
    },
    {
      title: "Kurumsal",
      links: [
        { label: "Hakkımızda", href: "/about" },
        { label: "Ocean Elite", href: "/ocean-elite" },
        { label: "Star Girişim ve Yatırım A.Ş.", href: "/star-girisim-ve-yatirim" },
        { label: "İletişim", href: "/contact" },
        { label: "Kariyer", href: "/careers" },
        { label: "Danışman Başvurusu Yap", href: "/apply-advisor" }
      ]
    },
    {
      title: "Yasal",
      links: legalPages.map((page) => ({ label: page.title, href: `/legal/${page.slug}` }))
    }
  ];

  return (
    <footer id="iletisim" className="border-t border-white/10 bg-black px-5 py-12 text-white sm:px-8 lg:px-12 xl:px-16">
      <div className="mx-auto max-w-[1760px]">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <div>
          <BrandLogo variant="full" size="sm" fallbackClassName="text-2xl font-semibold" />
          <p className="mt-3 text-sm text-white/55">{OCEAN_COMPANY_NAME}</p>
          <p className="mt-5 max-w-sm text-sm leading-6 text-white/55">
            Ofis değil, sistem. OceanOS, gayrimenkul danışmanlarının portföy, arayış, eşleşme ve işlem süreçlerini yönetmesi için geliştirilmiş dijital operasyon sistemidir.
          </p>
          <div className="mt-6 space-y-2 text-sm text-white/70">
            <p>{OCEAN_CONTACT_PHONE}</p>
            <a href={OCEAN_CONTACT_MAILTO} className="block transition hover:text-white">{OCEAN_CONTACT_EMAIL}</a>
            <p>{OCEAN_CONTACT_ADDRESS}</p>
          </div>
        </div>
          <div className="grid gap-x-8 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">
            {columns.map((column) => (
              <FooterColumn key={column.title} title={column.title} links={column.links.map((item) => [item.label, item.href])} />
            ))}
          </div>
        </div>
        <div className="mt-10 border-t border-white/10 pt-6 text-xs leading-5 text-white/40">
          <p>OceanOS, Ocean Real Estate markası altında gayrimenkul danışmanlarının portföy, arayış, eşleşme ve işlem süreçlerini yönetmesi için geliştirilmiş dijital operasyon sistemidir.</p>
          <p className="mt-2">Sosyal kanallar: Yakında</p>
        </div>
      </div>
    </footer>
  );
}

function SectionIntro({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <div className="max-w-5xl">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#011c40] dark:text-white/60">{eyebrow}</p>
      <h2 className="mt-4 text-3xl font-semibold sm:text-5xl md:text-6xl">{title}</h2>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 dark:text-white/65 sm:text-lg sm:leading-8 md:mt-5">{subtitle}</p>
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
