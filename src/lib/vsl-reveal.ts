import {
  REVEAL_EXPIRATION_DAYS,
  REVEAL_STORAGE_KEY,
} from "@/lib/vsl-config";

export interface RevealStorageRecord {
  revealed: boolean;
  revealedAt: number;
  expiresAt: number;
}

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

/** Verifica se existe liberação válida nos últimos 7 dias. */
export function hasValidRevealAccess(): boolean {
  try {
    if (!canUseStorage()) return false;

    const raw = localStorage.getItem(REVEAL_STORAGE_KEY);
    if (!raw) return false;

    const record = JSON.parse(raw) as RevealStorageRecord;
    if (!record?.revealed || typeof record.expiresAt !== "number") {
      localStorage.removeItem(REVEAL_STORAGE_KEY);
      return false;
    }

    if (Date.now() > record.expiresAt) {
      localStorage.removeItem(REVEAL_STORAGE_KEY);
      return false;
    }

    return true;
  } catch {
    try {
      if (canUseStorage()) localStorage.removeItem(REVEAL_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    return false;
  }
}

/** Persiste a liberação por 7 dias após atingir o tempo da VSL. */
export function saveRevealAccess(): void {
  try {
    if (!canUseStorage()) return;

    const now = Date.now();
    const expiresAt = now + REVEAL_EXPIRATION_DAYS * 24 * 60 * 60 * 1000;

    const record: RevealStorageRecord = {
      revealed: true,
      revealedAt: now,
      expiresAt,
    };

    localStorage.setItem(REVEAL_STORAGE_KEY, JSON.stringify(record));
  } catch {
    /* ignore — navegador pode bloquear armazenamento */
  }
}
