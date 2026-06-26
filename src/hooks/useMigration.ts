import { mutate } from 'swr';
import { useToast } from '@/hooks/useToast';
import type { CollectionMap } from '@/types';

const COLLECTION_LS_KEY = 'panini_wc_collection';
const TRADES_LS_KEY = 'panini_pending_trades';

// ── v1 localStorage shape ────────────────────────────────────────────────────

interface V1Trade {
  id?: string;
  iGive?: (string | number)[];
  iGet?: (string | number)[];
  partner?: string;
  createdAt?: string;
  [key: string]: unknown;
}

// ── helpers ──────────────────────────────────────────────────────────────────

function readLocalCollection(): CollectionMap {
  try {
    const raw = localStorage.getItem(COLLECTION_LS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return {};
    }
    return parsed as CollectionMap;
  } catch {
    return {};
  }
}

function readLocalTrades(): V1Trade[] {
  try {
    const raw = localStorage.getItem(TRADES_LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as V1Trade[]) : [];
  } catch {
    return [];
  }
}

function isCollectionEmpty(collection: CollectionMap): boolean {
  return Object.keys(collection).length === 0;
}

// ── hook ─────────────────────────────────────────────────────────────────────

/**
 * Returns a `runMigration` function that should be called once from
 * `CollectionView`'s `useEffect`.
 *
 * Flow (from plan.md Section 8):
 *  1. Read localStorage keys; exit if both empty.
 *  2. Fetch GET /api/collection; exit if DB already has data.
 *  3. POST bulk collection.
 *  4. POST each v1 trade, converting iGive/iGet/partner → offering/requesting/trade_with.
 *  5. On full success: clear localStorage and mutate both SWR keys.
 *  6. On any failure: keep localStorage, show error toast.
 */
export function useMigration() {
  const { show: showToast } = useToast();

  async function runMigration(): Promise<void> {
    // Step 1 — read localStorage
    const localCollection = readLocalCollection();
    const localTrades = readLocalTrades();

    const hasCollection = !isCollectionEmpty(localCollection);
    const hasTrades = localTrades.length > 0;

    if (!hasCollection && !hasTrades) {
      // Nothing to migrate
      return;
    }

    // Step 2 — check whether DB already has data for this user
    let existingCollection: CollectionMap;
    try {
      const res = await fetch('/api/collection');
      if (!res.ok) throw new Error(`GET /api/collection failed: ${res.status}`);
      existingCollection = await res.json();
    } catch {
      // Cannot reach API — abort silently; we will retry on next mount
      return;
    }

    if (!isCollectionEmpty(existingCollection)) {
      // DB already has data — this user has already been migrated
      return;
    }

    // Step 3 — bulk POST collection (server guards against double-import with 409)
    if (hasCollection) {
      try {
        const res = await fetch('/api/collection', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ collection: localCollection }),
        });
        if (res.status === 409) {
          // DB already populated — treat as "already migrated"
          return;
        }
        if (!res.ok) {
          throw new Error(`POST /api/collection failed: ${res.status}`);
        }
      } catch {
        showToast('Migration failed. Try signing in again.', 'error');
        return;
      }
    }

    // Step 4 — POST each trade
    const failedTrades: V1Trade[] = [];

    for (const v1Trade of localTrades) {
      const offering = (v1Trade.iGive ?? []).map((id) => ({
        cardId: String(id),
        count: 1,
      }));
      const requesting = (v1Trade.iGet ?? []).map((id) => ({
        cardId: String(id),
        count: 1,
      }));
      const trade_with = v1Trade.partner ?? null;

      try {
        const res = await fetch('/api/trades', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ offering, requesting, trade_with }),
        });
        if (!res.ok) {
          throw new Error(`POST /api/trades failed: ${res.status}`);
        }
      } catch {
        failedTrades.push(v1Trade);
      }
    }

    // Step 5 — evaluate outcome
    if (failedTrades.length > 0) {
      // Partial failure — keep localStorage so user can retry
      console.error(
        '[useMigration] The following trades failed to migrate:',
        failedTrades,
      );
      showToast('Migration partially failed. Try signing in again.', 'error');
      return;
    }

    // Full success — clear localStorage and refresh both SWR keys
    try {
      localStorage.removeItem(COLLECTION_LS_KEY);
      localStorage.removeItem(TRADES_LS_KEY);
    } catch {
      // localStorage clear is non-critical; log and continue
      console.warn('[useMigration] Could not clear localStorage after migration');
    }

    await Promise.all([
      mutate('/api/collection'),
      mutate('/api/trades'),
    ]);

    showToast('Your collection was migrated from this device.', 'success');
  }

  return { runMigration };
}
