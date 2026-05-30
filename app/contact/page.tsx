import type { Metadata } from "next";
import Link from "next/link";
import BrandLogo from "../brand-logo";
import ThemeToggle from "../theme-toggle";

export const metadata: Metadata = {
  title: "İletişim | Ocean Real Estate",
  description: "Ocean Real Estate iletişim bilgileri."
};

export default function ContactPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#011c40] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="absolute left-4 top-5 sm:left-6 lg:left-8">
        <Link href="/" className="mini-action !border-white/10 !bg-white/10 !text-white hover:!bg-white/15">
          Ana Sayfa
        </Link>
      </div>
      <div className="absolute right-4 top-5 sm:right-6 lg:right-8">
        <ThemeToggle />
      </div>

      <section className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-black/35 p-7 text-center shadow-[0_30px_100px_rgba(0,0,0,0.28)] backdrop-blur-2xl sm:p-10">
        <BrandLogo
          variant="full"
          className="mx-auto h-9 w-auto max-w-[13rem] object-contain"
          fallbackClassName="text-xs font-medium uppercase tracking-[0.22em] text-white/45"
        />
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">İletişim</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-white/70">
          Ocean Real Estate ile iletişime geçmek için aşağıdaki bilgileri kullanabilirsiniz.
        </p>

        <div className="mt-8 space-y-5 text-sm leading-7 text-white/75">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-white/40">Çalışma Saatleri</p>
            <p className="mt-1 font-medium text-white">Pazartesi-Cumartesi: 08:30 - 19:00</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-white/40">Telefon</p>
            <p className="mt-1 font-medium text-white">+90 (216) 280 01 00</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-white/40">E-posta</p>
            <p className="mt-1 font-medium text-white">info@oceanrealestate.com.tr</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-white/40">Adres</p>
            <p className="mx-auto mt-1 max-w-md font-medium text-white">
              Acarlar Mahallesi, Acarkent Sitesi 9. Cadde, Coliseum 5. Kat, Archerson, 34820 Beykoz / İstanbul
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
