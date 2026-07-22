/** Segundos de reprodução do vídeo antes de liberar o restante da página (14min 34s). */
export const REVEAL_AT_SECONDS = 14 * 60 + 34;

/** Chave usada no localStorage para persistir a liberação. */
export const REVEAL_STORAGE_KEY = "codigo_invisivel_vsl_revealed";

/** Validade do acesso liberado, em dias. */
export const REVEAL_EXPIRATION_DAYS = 7;

/** Link compartilhado do vídeo Wistia (0720). */
export const WISTIA_SHARE_URL =
  "https://flavia-simone25.wistia.com/s/e3txwvl86sprdmi";

/** ID do embed Wistia — resolvido via oEmbed a partir do share link. */
export const WISTIA_MEDIA_ID = "e3txwvl86sprdmi";
