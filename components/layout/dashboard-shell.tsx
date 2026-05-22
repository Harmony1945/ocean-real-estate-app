import type { ReactNode } from "react";
import { DesktopNavigation } from "@/components/layout/desktop-navigation";
import { MobileNavigation } from "@/components/layout/mobile-navigation";

type DashboardShellProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function DashboardShell({
  title,
  description,
  children
}: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-graphite-50 text-graphite-900">
      <DesktopNavigation />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-28 pt-5 sm:px-6 md:pb-10 lg:px-8 lg:pt-8">
        <header className="flex flex-col gap-4 rounded-lg border border-graphite-100 bg-white p-5 shadow-soft md:flex-row md:items-center md:justify-between md:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-500">
              Ocean Real Estate
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-graphite-900 md:text-3xl">
              {title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-graphite-500">
              {description}
            </p>
          </div>
          <div className="rounded-md border border-ocean-100 bg-ocean-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ocean-600">
              Operasyon
            </p>
            <p className="mt-1 text-sm font-semibold text-ocean-900">
              Mobil öncelikli panel
            </p>
          </div>
        </header>
        {children}
      </main>
      <MobileNavigation />
    </div>
  );
}
