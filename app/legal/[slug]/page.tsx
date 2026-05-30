import Link from "next/link";
import { notFound } from "next/navigation";
import BrandLogo from "@/app/brand-logo";
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
    <main className="min-h-screen bg-[#011c40] px-4 py-5 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="flex items-center justify-between gap-3">
          <Link href="/" className="mini-action !border-white/10 !bg-white/10 !text-white hover:!bg-white/15">Ana Sayfa</Link>
          <ThemeToggle />
        </header>

        <section className="mt-8 rounded-[2rem] border border-white/10 bg-black/35 p-5 shadow-[0_30px_100px_rgba(0,0,0,0.28)] backdrop-blur-2xl sm:p-8">
          <BrandLogo
            variant="full"
            className="h-10 w-auto max-w-[14rem] object-contain"
            fallbackClassName="text-xs font-medium uppercase tracking-[0.22em] text-white/45"
            fallbackText="STAR GİRİŞİM VE YATIRIM A.Ş."
          />
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            {page.title}
          </h1>
          <p className="mt-4 text-sm leading-7 text-white/70">
            {page.intro}
          </p>
          <p className="mt-5 text-sm font-medium text-white/55">
            Son güncelleme: 2026
          </p>
        </section>

        <section className="mt-6 space-y-4 pb-16">
          {page.sections.map((section) => (
            <article key={section.heading} className="rounded-[1.75rem] border border-white/10 bg-black/25 p-5 backdrop-blur-xl sm:p-6">
              <h2 className="text-xl font-semibold tracking-tight">{section.heading}</h2>
              <div className="mt-3 space-y-3">
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
