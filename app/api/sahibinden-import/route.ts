import { NextResponse } from "next/server";

type ListingPayload = {
  title: string;
  listingId: string;
  price: string;
  value: number;
  location: string;
  grossArea: string;
  netArea: string;
  area: string;
  rooms: string;
  buildingAge: string;
  floor: string;
  description: string;
  owner: string;
  sourceUrl: string;
  images: string[];
};

function decodeHtml(value: string) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function stripTags(value: string) {
  return decodeHtml(value.replace(/<[^>]*>/g, " "));
}

function firstMatch(html: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const match = html.match(pattern);

    if (match?.[1]) {
      return stripTags(match[1]);
    }
  }

  return "";
}

function getMeta(html: string, key: string) {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return firstMatch(html, [
    new RegExp(
      `<meta[^>]+(?:property|name)=["']${escapedKey}["'][^>]+content=["']([^"']+)["'][^>]*>`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escapedKey}["'][^>]*>`,
      "i"
    )
  ]);
}

function findByLabel(html: string, labels: string[]) {
  for (const label of labels) {
    const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const value = firstMatch(html, [
      new RegExp(
        `<li[^>]*>\\s*<strong[^>]*>\\s*${escapedLabel}\\s*</strong>\\s*<span[^>]*>([\\s\\S]*?)</span>\\s*</li>`,
        "i"
      ),
      new RegExp(
        `<dt[^>]*>\\s*${escapedLabel}\\s*</dt>\\s*<dd[^>]*>([\\s\\S]*?)</dd>`,
        "i"
      ),
      new RegExp(
        `${escapedLabel}\\s*</[^>]+>\\s*<[^>]+>([\\s\\S]*?)</[^>]+>`,
        "i"
      )
    ]);

    if (value) {
      return value;
    }
  }

  return "";
}

function parsePriceValue(price: string) {
  const number = price.replace(/[^0-9]/g, "");
  return number ? Number(number) : 0;
}

function uniqueImages(html: string) {
  const images = new Set<string>();
  const metaImage = getMeta(html, "og:image");

  if (metaImage) {
    images.add(metaImage);
  }

  for (const match of html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)) {
    const src = decodeHtml(match[1]);

    if (/sahibinden|shbdn|classified/i.test(src)) {
      images.add(src);
    }
  }

  return Array.from(images).slice(0, 8);
}

function isBlocked(html: string, status: number) {
  return (
    status === 403 ||
    status === 429 ||
    /captcha|robot|bot korumas|access denied|cloudflare/i.test(html)
  );
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const url = requestUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL gerekli." }, { status: 400 });
  }

  let targetUrl: URL;

  try {
    targetUrl = new URL(url);
  } catch {
    return NextResponse.json({ error: "Geçersiz URL." }, { status: 400 });
  }

  if (!/(^|\.)sahibinden\.com$/i.test(targetUrl.hostname)) {
    return NextResponse.json(
      { error: "Yalnızca sahibinden.com linkleri desteklenir." },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(targetUrl.toString(), {
      headers: {
        "accept-language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36"
      },
      cache: "no-store"
    });
    const html = await response.text();

    if (!response.ok || isBlocked(html, response.status)) {
      return NextResponse.json(
        {
          error: "Sahibinden bot koruması nedeniyle veri çekilemedi.",
          blocked: true
        },
        { status: 200 }
      );
    }

    const listingId =
      findByLabel(html, ["İlan No", "İlan no"]) ||
      targetUrl.toString().match(/\d{6,}/)?.[0] ||
      "";
    const title =
      firstMatch(html, [
        /<h1[^>]*>([\s\S]*?)<\/h1>/i,
        /<title[^>]*>([\s\S]*?)<\/title>/i
      ]) || getMeta(html, "og:title");
    const price =
      findByLabel(html, ["Fiyat"]) ||
      firstMatch(html, [
        /classified-price[^>]*>([\s\S]*?)<\/[^>]+>/i,
        /price[^>]*>([\s\S]*?)<\/[^>]+>/i
      ]);
    const description =
      firstMatch(html, [
        /<div[^>]+id=["']classifiedDescription["'][^>]*>([\s\S]*?)<\/div>/i,
        /classifiedDescription[^>]*>([\s\S]*?)<\/div>/i
      ]) || getMeta(html, "description");
    const location =
      firstMatch(html, [
        /classifiedInfo[^>]*>[\s\S]*?<h2[^>]*>([\s\S]*?)<\/h2>/i,
        /classified-location[^>]*>([\s\S]*?)<\/[^>]+>/i
      ]) || getMeta(html, "og:site_name");

    const grossArea = findByLabel(html, ["Brüt m²", "m² (Brüt)", "Brüt"]);
    const netArea = findByLabel(html, ["Net m²", "m² (Net)", "Net"]);
    const area = grossArea || netArea || findByLabel(html, ["m²"]);
    const payload: ListingPayload = {
      title,
      listingId,
      price,
      value: parsePriceValue(price),
      location,
      grossArea,
      netArea,
      area,
      rooms: findByLabel(html, ["Oda Sayısı", "Oda"]),
      buildingAge: findByLabel(html, ["Bina Yaşı", "Yaş"]),
      floor: findByLabel(html, ["Bulunduğu Kat", "Kat"]),
      description,
      owner:
        firstMatch(html, [
          /store-name[^>]*>([\s\S]*?)<\/[^>]+>/i,
          /username-info-area[^>]*>([\s\S]*?)<\/[^>]+>/i,
          /classifiedUserContent[^>]*>([\s\S]*?)<\/[^>]+>/i
        ]) || "",
      sourceUrl: targetUrl.toString(),
      images: uniqueImages(html)
    };

    return NextResponse.json(payload);
  } catch {
    return NextResponse.json(
      {
        error: "Sahibinden verisi çekilemedi. Linki kontrol edin veya manuel giriş yapın."
      },
      { status: 200 }
    );
  }
}
