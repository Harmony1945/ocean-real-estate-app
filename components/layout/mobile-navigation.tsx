"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigationItems } from "@/components/layout/navigation-items";
import { cn } from "@/lib/utils";

export function MobileNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-graphite-100 bg-white/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 shadow-[0_-16px_40px_rgba(23,32,29,0.08)] backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-1 rounded-md px-2 text-[0.72rem] font-semibold text-graphite-500 transition",
                isActive && "bg-ocean-900 text-white shadow-soft",
                !isActive && "hover:bg-graphite-50 hover:text-graphite-900"
              )}
            >
              <Icon aria-hidden="true" className="size-5" strokeWidth={2.2} />
              <span className="leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
