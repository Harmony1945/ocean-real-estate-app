import Link from "next/link";
import { notFound } from "next/navigation";
import ThemeToggle from "@/app/theme-toggle";
import { getLegalPage, legalPages } from "@/lib/oos/legal-pages";

type LegalRouteProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return legalPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: LegalRouteProps) {
  const { slug } = await params;
  const page = getLegalPage(slug);

  if (!page) {
    return {
      title: "Yasal Metin | Ocean Real Estate"
    };
  }

  return {
    title: `${page.title} | Ocean Real Estate`,
    description: page.description
  };
}

export default async function LegalPage({ params }: LegalRouteProps) {
  const { slug } = await params;
  const page = getLegalPage(slug);

  if (!page) notFound();

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-5 text-slate-950 dark:bg-black dark:text-neutral-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="flex items-center justify-between gap-3">
          <Link href="/" className="mini-action">Ana Sayfa</Link>
          <ThemeToggle />
        </header>

        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#080808] sm:p-8">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-400">
            STAR GİRİŞİM VE YATIRIM A.Ş.
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            {page.title}
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-500 dark:text-slate-400">
            {page.intro}
          </p>
          <p className="mt-5 text-sm font-medium text-slate-500 dark:text-slate-400">
            Son güncelleme: 2026
          </p>
        </section>

        <section className="mt-6 space-y-4 pb-16">
          {page.sections.map((section) => (
            <article key={section.heading} className="oos-card rounded-[1.75rem] p-5 sm:p-6">
              <h2 className="text-xl font-semibold tracking-tight">{section.heading}</h2>
              <div className="mt-3 space-y-3">
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="text-sm leading-7 text-slate-600 dark:text-slate-300">
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
