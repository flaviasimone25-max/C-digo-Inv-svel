/** Metadados centralizados de SEO e compartilhamento social. */
export const SITE_SEO = {
  siteName: "Código Invisível",
  title: "Código Invisível — Pare de tomar 'não' por falar errado com o cliente",
  description:
    "Identifique o perfil comportamental do cliente em segundos e conduza a negociação sem roteiros decorados. Guia prático por R$ 47,00.",
  ogDescription:
    "Cansei de ouvir 'NÃO' dos meus clientes — até entender que o problema era como eu falava com eles. Leia o perfil, adapte e conduza.",
  keywords: [
    "código invisível",
    "vendas",
    "objeções",
    "comportamento do cliente",
    "perfis comportamentais",
    "método trinus",
    "fechamento de vendas",
    "vendedor",
    "closer",
  ].join(", "),
  author: "Trinus Business",
  locale: "pt_BR",
  language: "pt-BR",
  twitterCard: "summary_large_image" as const,
  ogType: "website" as const,
  ogImagePath: "/og-share.png",
  ogImageAlt: "Código Invisível — Método Trinus Business para vender lendo o comportamento do cliente",
  ogImageType: "image/png" as const,
  ogImageWidth: 1024,
  ogImageHeight: 1536,
  themeColor: "#242424",
  robots: "index, follow",
};

/** URL base do site (defina VITE_SITE_URL na Vercel com o domínio final). */
export function getSiteUrl(): string {
  const fromEnv = typeof import.meta !== "undefined" ? import.meta.env.VITE_SITE_URL : undefined;
  if (fromEnv && typeof fromEnv === "string" && fromEnv.trim()) {
    return fromEnv.replace(/\/$/, "");
  }
  return "https://codigoinvisible.vercel.app";
}

export function getAbsoluteUrl(path = ""): string {
  if (!path) return getSiteUrl();
  return `${getSiteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildSeoMeta(path = "/") {
  const url = getAbsoluteUrl(path);
  const image = getAbsoluteUrl(SITE_SEO.ogImagePath);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: SITE_SEO.siteName,
    description: SITE_SEO.description,
    image: [image],
    brand: {
      "@type": "Brand",
      name: SITE_SEO.author,
    },
    offers: {
      "@type": "Offer",
      price: "47",
      priceCurrency: "BRL",
      availability: "https://schema.org/InStock",
      url: "https://pay.kiwify.com.br/iHhPo3j",
    },
  };

  return {
    meta: [
      { title: SITE_SEO.title },
      { name: "description", content: SITE_SEO.description },
      { name: "keywords", content: SITE_SEO.keywords },
      { name: "author", content: SITE_SEO.author },
      { name: "robots", content: SITE_SEO.robots },
      { name: "theme-color", content: SITE_SEO.themeColor },
      { name: "language", content: SITE_SEO.language },

      { property: "og:site_name", content: SITE_SEO.siteName },
      { property: "og:title", content: SITE_SEO.title },
      { property: "og:description", content: SITE_SEO.ogDescription },
      { property: "og:type", content: SITE_SEO.ogType },
      { property: "og:locale", content: SITE_SEO.locale },
      { property: "og:url", content: url },
      { property: "og:image", content: image },
      { property: "og:image:secure_url", content: image },
      { property: "og:image:type", content: SITE_SEO.ogImageType },
      { property: "og:image:width", content: String(SITE_SEO.ogImageWidth) },
      { property: "og:image:height", content: String(SITE_SEO.ogImageHeight) },
      { property: "og:image:alt", content: SITE_SEO.ogImageAlt },

      { name: "twitter:card", content: SITE_SEO.twitterCard },
      { name: "twitter:title", content: SITE_SEO.title },
      { name: "twitter:description", content: SITE_SEO.ogDescription },
      { name: "twitter:image", content: image },
      { name: "twitter:image:alt", content: SITE_SEO.ogImageAlt },
    ],
    links: [
      { rel: "canonical", href: url },
      { rel: "icon", href: "/favicon.webp", type: "image/webp" },
      { rel: "apple-touch-icon", href: "/og-share.png" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(jsonLd),
      },
    ],
  };
}
