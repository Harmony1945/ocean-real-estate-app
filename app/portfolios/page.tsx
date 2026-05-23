import Link from "next/link";

const portfolioCards = [
  {
    title: "Tüm Portföyler",
    description: "Portföy listesini, değerleri ve aşamaları ayrı bir route üzerinde geliştirmek için foundation.",
    status: "Aktif foundation"
  },
  {
    title: "Portföylerim",
    description: "Danışmanın kendi portföylerini filtreleyeceği bölüm. Veri modeli ileride Supabase ile bağlanacak.",
    status: "Yakında derinleşecek"
  }
];

export default function PortfoliosRoutePage() {
  return (
    <main className="min-h-screen bg-stone-50 px-4 py-5 pb-[calc(env(safe-area-inset-bottom)+7rem)] text-slate-950 dark:bg-slate-950 dark:text-slate-100 sm:px-6 md:pb-8 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="border-b border-slate-200 pb-6 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-semibold shadow-sm dark:border-slate-800 dark:bg-slate-900">
              O
            </span>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Ocean Operating System</p>
          </div>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-950 dark:text-slate-100 sm:text-5xl">Portföyler</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Tüm portföyler için route-backed sayfa temeli. Mevcut tam liste ve düzenleme akışı Ana Sayfa içinde korunur.
          </p>
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          {portfolioCards.map((item) => (
            <article key={item.title} className="liquid-glass-strong rounded-[2rem] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-100">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{item.description}</p>
                </div>
                <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {item.status}
                </span>
              </div>
            </article>
          ))}
        </section>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href="/" className="btn-primary">Ana Sayfa’ya Dön</Link>
          <Link href="/menu" className="btn-secondary">Menüyü Aç</Link>
        </div>
      </div>
    </main>
  );
}
