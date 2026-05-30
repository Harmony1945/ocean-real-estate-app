import type { Metadata } from "next";
import PublicPageShell from "../public-page-shell";
import { getPublicContentPage } from "@/lib/oos/footer-public-pages";

const page = getPublicContentPage("about")!;

export const metadata: Metadata = {
  title: `${page.title} | Ocean Real Estate`,
  description: page.description
};

export default function AboutPage() {
  return <PublicPageShell page={page} />;
}
