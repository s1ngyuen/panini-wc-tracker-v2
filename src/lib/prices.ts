// src/lib/prices.ts
// Port of js/store-prices.js.
// Loads prices from /prices.json served from Next.js public/.
// All state is module-level so a single fetch is shared across the app lifetime
// within one server process (or client page).

interface PricesData {
  prices:   Record<string, number | null>;
  currency: string;
  updated:  string;
}

let _prices:   Record<string, number | null> = {};
let _currency: string = 'AUD';
let _updated:  string = '';
let _loaded:   boolean = false;

/**
 * Fetch and cache prices from /prices.json.
 * Idempotent — safe to call multiple times; only fetches once per process.
 */
export async function loadPrices(): Promise<void> {
  if (_loaded) return;
  try {
    const res = await fetch('/prices.json');
    if (!res.ok) return;
    const data: PricesData = await res.json();
    _prices   = data.prices   ?? {};
    _currency = data.currency ?? 'AUD';
    _updated  = data.updated  ?? '';
    _loaded   = true;
  } catch {
    // prices.json not found or malformed — silently skip
  }
}

/**
 * Return the price for a single card ID, or null if unavailable.
 */
export function getPrice(cardId: string | number): number | null {
  const p = _prices[String(cardId)];
  return p !== undefined && p !== null ? p : null;
}

/** Return the currency code for all prices (default: 'AUD'). */
export function getCurrency(): string {
  return _currency;
}

/** Return the ISO date string of the last price update. */
export function getUpdated(): string {
  return _updated;
}

/** Merge live-fetched prices into the in-memory store and broadcast an update. */
export function injectPrices(prices: Record<string, number | null>, currency?: string): void {
  Object.assign(_prices, prices);
  if (currency) _currency = currency;
  _loaded = true;
}

export interface PriceSummary {
  priced:   number;
  total:    number;
  value:    number;
  currency: string;
}

/**
 * Aggregate price data for a list of card IDs.
 * Cards without a price are counted in `total` but not in `priced` or `value`.
 */
export function getPriceSummary(cardIds: Array<string | number>): PriceSummary {
  let value  = 0;
  let priced = 0;

  for (const id of cardIds) {
    const p = getPrice(id);
    if (p !== null) {
      value += p;
      priced++;
    }
  }

  return { priced, total: cardIds.length, value, currency: _currency };
}
