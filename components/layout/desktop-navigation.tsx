"use client";

import Link from "next/link";
import { Building2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { navigationItems } from "@/components/layout/navigation-items";
import { cn } from "@/lib/utils";

export function DesktopNavigation() {
  const pathname = usePathname();

  return (
    <header className="hidden border-b border-graphite-100 bg-white/95 backdrop-blur md:block">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-md bg-ocean-900 text-white">
            <Building2 aria-hidden="true" className="size-5" />
          </span>
          <span>
            <span className="block text-sm font-semibold text-graphite-900">
              Ocean Real Estate
            </span>
            <span className="block text-xs font-medium text-graphite-500">
              Danışman operasyon paneli
            </span>
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          {navigationItems.map((item) => {
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "rounded-md px-4 py-2 text-sm font-semibold transition",
                  isActive && "bg-ocean-900 text-white",
                  !isActive && "text-graphite-500 hover:bg-graphite-50 hover:text-graphite-900"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
