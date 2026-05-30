import Link from "next/link";
import ThemeToggle from "./theme-toggle";
import type { PublicContentPage } from "@/lib/oos/footer-public-pages";

export default function PublicPageShell({ page }: { page: PublicContentPage }) {
  return (
    <main className="min-h-screen bg-[#011c40] px-4 py-5 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between gap-3">
          <Link href="/" className="mini-action !border-white/10 !bg-white/10 !text-white hover:!bg-white/15">
            Ana Sayfa
          </Link>
          <ThemeToggle />
        </header>

        <section className="mt-10 rounded-[2rem] border border-white/10 bg-black/35 p-6 shadow-[0_30px_100px_rgba(0,0,0,0.28)] backdrop-blur-2xl sm:p-9">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-white/45">
            Ocean Real Estate
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">
            {page.title}
          </h1>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-white/70 sm:text-base">
            {page.intro}
          </p>
        </section>

        <section className="mt-6 grid gap-4 pb-16">
          {page.sections.map((section) => (
            <article key={section.heading} className="rounded-[1.75rem] border border-white/10 bg-black/25 p-5 backdrop-blur-xl sm:p-7">
              <h2 className="text-2xl font-semibold tracking-tight">{section.heading}</h2>
              <div className="mt-4 space-y-3">
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="text-sm leading-7 text-white/70">
                    {paragraph}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
