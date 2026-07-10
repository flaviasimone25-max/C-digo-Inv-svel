/** Metadados centralizados de SEO e compartilhamento social. */
export const SITE_SEO = {
  siteName: "Playbook Objeção Zero",
  title: "Playbook Objeção Zero — Venda lendo o comportamento do cliente",
  description:
    "Aprenda a identificar perfis comportamentais, reduzir objeções e fechar mais vendas sem pressionar. Método prático da Trinus Business.",
  ogDescription:
    "O playbook que ensina a ler o comportamento do cliente e reduzir objeções sem precisar pressionar para vender.",
  keywords: [
    "playbook objeção zero",
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
  ogImagePath: "/og-share.jpg",
  ogImageAlt: "Playbook Objeção Zero — Leia o comportamento do cliente e reduza objeções",
  ogImageWidth: 1200,
  ogImageHeight: 630,
  themeColor: "#242424",
  robots: "index, follow",
};

/** URL base do site (defina VITE_SITE_URL na Vercel com o domínio final). */
export function getSiteUrl(): string {
  const fromEnv = typeof import.meta !== "undefined" ? import.meta.env.VITE_SITE_URL : undefined;
  if (fromEnv && typeof fromEnv === "string" && fromEnv.trim()) {
    return fromEnv.replace(/\/$/, "");
  }
  return "https://flaviaebookobjecao.vercel.app";
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
      price: "97",
      priceCurrency: "BRL",
      availability: "https://schema.org/InStock",
      url: "https://pay.kiwify.com.br/FGxNNX7",
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
      { property: "og:image:type", content: "image/jpeg" },
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
      { rel: "apple-touch-icon", href: "/og-share.jpg" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(jsonLd),
      },
    ],
  };
}
