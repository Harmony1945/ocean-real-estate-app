import { BriefcaseBusiness, Home, Search, UserRound } from "lucide-react";

export const navigationItems = [
  {
    label: "Ana Sayfa",
    href: "/",
    icon: Home
  },
  {
    label: "Portföyler",
    href: "/portfolios",
    icon: BriefcaseBusiness
  },
  {
    label: "Talepler",
    href: "/requests",
    icon: Search
  },
  {
    label: "Profil",
    href: "/profile",
    icon: UserRound
  }
] as const;
