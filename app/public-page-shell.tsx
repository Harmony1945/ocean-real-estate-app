import Link from "next/link";
import ThemeToggle from "./theme-toggle";
import type { PublicContentPage } from "@/lib/oos/footer-public-pages";

export default function PublicPageShell({
  page,
  action
}: {
  page: PublicContentPage;
  action?: {
    href: string;
    label: string;
    secondaryLabel?: string;
  };
}) {
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
          <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
            {page.title}
          </h1>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-white/70 sm:text-base">
            {page.intro}
          </p>
          {action ? (
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href={action.href} className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-white/90">
                {action.label}
              </Link>
              {action.secondaryLabel ? (
                <Link href="/contact" className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-white/75 transition hover:border-white/30 hover:text-white">
                  {action.secondaryLabel}
                </Link>
              ) : null}
            </div>
          ) : null}
        </section>

        <section className="space-y-12 py-14 sm:py-16">
          {page.sections.map((section) => (
            <article key={section.heading}>
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
