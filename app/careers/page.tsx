import type { Metadata } from "next";
import PublicPageShell from "../public-page-shell";
import { getPublicContentPage } from "@/lib/oos/footer-public-pages";

const page = getPublicContentPage("careers")!;

export const metadata: Metadata = {
  title: `${page.title} | Ocean Real Estate`,
  description: page.description
};

export default function CareersPage() {
  return (
    <PublicPageShell
      page={page}
      action={{
        href: "/apply-advisor",
        label: "Danışman Başvurusu Yap",
        secondaryLabel: "İletişime Geç"
      }}
    />
  );
}
