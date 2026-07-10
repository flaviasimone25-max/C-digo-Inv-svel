import { REVEAL_AT_SECONDS, WISTIA_MEDIA_ID } from "@/lib/vsl-config";

export const META_PIXEL_ID = "1337417334622081";

export const PRODUCT_PARAMS = {
  content_name: "Playbook Objeção Zero",
  content_category: "Educação / Vendas",
  content_ids: ["playbook-objecao-zero"],
  content_type: "product",
  value: 97,
  currency: "BRL",
} as const;

export const VSL_PIXEL_PARAMS = {
  ...PRODUCT_PARAMS,
  content_type: "video",
  video_id: WISTIA_MEDIA_ID,
  reveal_at_seconds: REVEAL_AT_SECONDS,
} as const;

export type MetaStandardEvent =
  | "PageView"
  | "ViewContent"
  | "Lead"
  | "InitiateCheckout"
  | "AddToCart"
  | "AddPaymentInfo"
  | "Contact"
  | "Subscribe"
  | "CompleteRegistration"
  | "StartTrial"
  | "SubmitApplication"
  | "AddToWishlist"
  | "CustomizeProduct"
  | "Schedule"
  | "Search"
  | "FindLocation"
  | "Donate"
  | "Purchase";

export type VslUnlockSource = "video-threshold" | "storage-return";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function getMetaPixelInitScript(): string {
  return `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${META_PIXEL_ID}');fbq('track','PageView');`;
}

export function trackMetaEvent(event: MetaStandardEvent, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || !window.fbq) return;
  window.fbq("track", event, { ...PRODUCT_PARAMS, ...params });
}

export function trackMetaCustomEvent(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || !window.fbq) return;
  window.fbq("trackCustom", event, { ...PRODUCT_PARAMS, ...params });
}

/** ViewContent ao carregar a landing com VSL visível. */
export function trackVslLandingView() {
  trackMetaEvent("ViewContent", {
    source: "vsl-landing",
    content_type: "video_landing",
    video_id: WISTIA_MEDIA_ID,
  });
}

/** Primeiro play da VSL. */
export function trackVslPlay(currentTime: number) {
  trackMetaCustomEvent("VSLPlay", {
    ...VSL_PIXEL_PARAMS,
    video_time: Math.floor(currentTime),
  });
  trackMetaEvent("Lead", { source: "vsl-play", video_time: Math.floor(currentTime) });
}

/** Marcos de progresso da VSL (25%, 50%, 75%). */
export function trackVslProgressMilestone(percent: 25 | 50 | 75, currentTime: number, duration: number) {
  trackMetaCustomEvent(`VSLProgress${percent}`, {
    ...VSL_PIXEL_PARAMS,
    video_time: Math.floor(currentTime),
    video_duration: Math.floor(duration),
    video_percent: percent,
  });

  if (percent === 25) {
    trackMetaEvent("StartTrial", { source: "vsl-25-percent", video_time: Math.floor(currentTime) });
  }
  if (percent === 50) {
    trackMetaEvent("Subscribe", { source: "vsl-50-percent", video_time: Math.floor(currentTime) });
  }
  if (percent === 75) {
    trackMetaEvent("AddToWishlist", { source: "vsl-75-percent", video_time: Math.floor(currentTime) });
  }
}

/** Usuário atingiu o ponto de liberação (9min28s) na VSL. */
export function trackVslRevealPoint(currentTime: number) {
  trackMetaCustomEvent("VSLRevealPoint", {
    ...VSL_PIXEL_PARAMS,
    video_time: Math.floor(currentTime),
  });
  trackMetaEvent("CompleteRegistration", {
    source: "vsl-reveal-point",
    video_time: Math.floor(currentTime),
  });
}

/** Conteúdo da página de vendas foi liberado. */
export function trackVslContentUnlocked(source: VslUnlockSource) {
  trackMetaCustomEvent("VSLContentUnlocked", {
    ...VSL_PIXEL_PARAMS,
    unlock_source: source,
  });
  trackMetaEvent("ViewContent", {
    source: source === "video-threshold" ? "vsl-unlocked-video" : "vsl-unlocked-return",
    content_type: "product",
    video_id: WISTIA_MEDIA_ID,
  });
  trackMetaEvent("Lead", { source: `vsl-unlocked-${source}` });
}

export function trackHeroInterest() {
  trackMetaEvent("Lead", { source: "hero-cta" });
  trackMetaEvent("StartTrial", { source: "hero-cta" });
}

export function trackCheckout(source: string) {
  trackMetaEvent("InitiateCheckout", { source });
  trackMetaEvent("AddToCart", { source });
}

export function trackOfferCheckout() {
  trackCheckout("oferta-principal");
  trackMetaEvent("AddPaymentInfo", { source: "oferta-principal" });
}

export function trackReceiveCheckout() {
  trackCheckout("secao-conteudo");
}

export function trackFaqCheckout() {
  trackCheckout("faq");
  trackMetaEvent("SubmitApplication", { source: "faq" });
}

export function trackExitCheckout() {
  trackCheckout("popup-exit-intent");
  trackMetaEvent("CompleteRegistration", { source: "popup-exit-intent" });
}

export function trackWhatsAppContact() {
  trackMetaEvent("Contact", { source: "whatsapp-flutuante" });
  trackMetaEvent("Schedule", { source: "whatsapp-flutuante" });
}

export function trackExitPopupShown() {
  trackMetaEvent("Subscribe", { source: "popup-exit-intent" });
  trackMetaEvent("AddToWishlist", { source: "popup-exit-intent" });
}

export function trackFaqSearch(question: string) {
  trackMetaEvent("Search", { search_string: question, source: "faq" });
  trackMetaEvent("Lead", { source: "faq-pergunta", content_name: question });
}

/** @deprecated Use trackVslLandingView */
export function trackPageViewContent() {
  trackVslLandingView();
}

export const SECTION_PIXEL_EVENTS: {
  selector: string;
  event: MetaStandardEvent;
  params?: Record<string, unknown>;
}[] = [
  { selector: "#receber", event: "CustomizeProduct", params: { source: "secao-conteudo" } },
  { selector: "#depoimentos", event: "Subscribe", params: { source: "depoimentos" } },
  { selector: "#sobre", event: "FindLocation", params: { source: "secao-sobre" } },
  { selector: "#oferta", event: "Lead", params: { source: "scroll-oferta" } },
  { selector: "#garantia", event: "Donate", params: { source: "secao-garantia" } },
];

export const VSL_PROGRESS_MILESTONES = [25, 50, 75] as const;
