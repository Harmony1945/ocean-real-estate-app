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
    <main className="min-h-screen bg-black px-4 py-5 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="flex items-center justify-between gap-3">
          <Link href="/" className="text-sm font-medium text-white/60 transition hover:text-white">Ana Sayfa</Link>
          <ThemeToggle />
        </header>

        <section className="mt-20 border-b border-white/10 pb-10 sm:mt-24">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            {page.title}
          </h1>
          <p className="mt-4 text-sm leading-7 text-white/70">
            {page.intro}
          </p>
          <p className="mt-5 text-sm font-medium text-white/55">
            Son güncelleme: 2026
          </p>
        </section>

        <section className="space-y-12 py-14 sm:py-16">
          {page.sections.map((section) => (
            <article key={section.heading}>
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
