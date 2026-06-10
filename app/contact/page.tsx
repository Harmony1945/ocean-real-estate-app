import type { Metadata } from "next";
import Link from "next/link";
import ThemeToggle from "../theme-toggle";
import {
  OCEAN_CONTACT_ADDRESS,
  OCEAN_CONTACT_EMAIL,
  OCEAN_CONTACT_MAILTO,
  OCEAN_CONTACT_PHONE
} from "@/lib/oos/contact";

export const metadata: Metadata = {
  title: "İletişim | Ocean Real Estate",
  description: "Ocean Real Estate iletişim bilgileri."
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-black px-4 py-5 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="flex items-center justify-between gap-3">
          <Link href="/" className="text-sm font-medium text-white/60 transition hover:text-white">
            Ana Sayfa
          </Link>
          <ThemeToggle />
        </header>

        <section className="mt-20 border-b border-white/10 pb-10 sm:mt-24">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">İletişim</h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
            Ocean Real Estate ile iletişime geçmek için aşağıdaki bilgileri kullanabilirsiniz.
          </p>
        </section>

        <section className="grid gap-x-10 gap-y-8 py-14 text-sm leading-7 text-white/75 sm:grid-cols-2 sm:py-16">
          <div>
            <p className="text-xs text-white/40">Çalışma Saatleri</p>
            <p className="mt-2 font-medium text-white">Pazartesi-Cumartesi: 08:30 - 19:00</p>
          </div>
          <div>
            <p className="text-xs text-white/40">Telefon</p>
            <p className="mt-2 font-medium text-white">{OCEAN_CONTACT_PHONE}</p>
          </div>
          <div>
            <p className="text-xs text-white/40">E-posta</p>
            <a href={OCEAN_CONTACT_MAILTO} className="mt-2 block font-medium text-white transition hover:text-white/80">
              {OCEAN_CONTACT_EMAIL}
            </a>
          </div>
          <div>
            <p className="text-xs text-white/40">Adres</p>
            <p className="mt-2 max-w-md font-medium text-white">
              {OCEAN_CONTACT_ADDRESS}
            </p>
          </div>
        </section>

        <section className="border-t border-white/10 py-10">
          <p className="text-xs text-white/40">Başvuru</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">Ocean’a danışman olarak katılın</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/65">
            Ocean Real Estate danışman modeli için başvurunuzu dijital form üzerinden iletebilirsiniz.
          </p>
          <Link href="/apply-advisor" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-white/90">
            Ocean’a Danışman Olarak Katıl
          </Link>
        </section>
      </div>
    </main>
  );
}
