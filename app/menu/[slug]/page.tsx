import { notFound } from "next/navigation";
import MenuDetailPage from "../menu-detail-page";
import { getMenuPage, menuPageSlugs } from "../menu-data";

export function generateStaticParams() {
  return menuPageSlugs.map((slug) => ({ slug }));
}

export default async function MenuItemRoutePage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getMenuPage(slug);

  if (!page) notFound();

  return <MenuDetailPage page={page} />;
}
