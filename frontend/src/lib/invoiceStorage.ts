// No indexer in v1 (see README "Open decisions" -- Envio is a fast-follow, not a blocker).
// This is a deliberately simple, per-browser record of which invoice ids a merchant has created,
// so the dashboard has something to list. Live status for each id still comes from the chain
// (see useInvoice in lib/useInvoice.ts), never from localStorage -- this only remembers *which*
// ids to look up. Known limitation, stated plainly: it does not sync across devices/browsers.

function storageKey(merchantAddress: string): string {
  return `merchant-rails:invoices:${merchantAddress.toLowerCase()}`;
}

export function listInvoiceIds(merchantAddress: string): `0x${string}`[] {
  try {
    const raw = window.localStorage.getItem(storageKey(merchantAddress));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveInvoiceId(merchantAddress: string, id: `0x${string}`): void {
  try {
    const existing = listInvoiceIds(merchantAddress);
    if (existing.includes(id)) return;
    const next = [id, ...existing];
    window.localStorage.setItem(storageKey(merchantAddress), JSON.stringify(next));
  } catch {
    // Private browsing / storage disabled -- the invoice still exists on-chain and is still
    // shareable via its link, it just won't show up in this browser's dashboard list.
  }
}
