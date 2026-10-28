import type { UploadResult } from "./utils";

/** Local Vault (PRD §5.C): riwayat unggahan disimpan di localStorage browser. */
const KEY = "cyberimg:vault";
const EVENT = "cyberimg:vault-change";

export function readVault(): UploadResult[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeVault(items: UploadResult[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    /* storage penuh / diblokir — abaikan */
  }
}

export function addToVault(item: UploadResult) {
  writeVault([item, ...readVault().filter((v) => v.id !== item.id)]);
}

export function removeFromVault(predicate: (item: UploadResult) => boolean) {
  writeVault(readVault().filter((v) => !predicate(v)));
}

export function clearVault() {
  writeVault([]);
}

export function subscribeVault(cb: () => void) {
  const onStorage = (e: StorageEvent) => e.key === KEY && cb();
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", onStorage);
  };
}
