import useSWR from 'swr';
import { useToast } from '@/hooks/useToast';
import type { Trade, TradeItem } from '@/types';

const KEY = '/api/trades';

async function fetcher(url: string): Promise<Trade[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`);
  return res.json();
}

export interface AddTradeBody {
  offering: TradeItem[];
  requesting: TradeItem[];
  trade_with?: string;
  proposed?: boolean;
}

export interface UpdateTradeBody {
  offering?: TradeItem[];
  requesting?: TradeItem[];
  trade_with?: string;
  proposed?: boolean;
}

export function useTrades() {
  const { data, isLoading, mutate } = useSWR<Trade[]>(KEY, fetcher, {
    revalidateOnFocus: false,
  });

  const { show: showToast } = useToast();

  const trades: Trade[] = data ?? [];

  /**
   * Add a new trade.  Inserts an optimistic placeholder at the front of the
   * list (matching the server's DESC sort) while the POST is in-flight, then
   * replaces it with the real record returned by the API.
   */
  async function addTrade(body: AddTradeBody): Promise<Trade> {
    const previous = data ?? [];

    // Optimistic placeholder — no real id yet
    const placeholder: Trade = {
      id: `__optimistic_${Date.now()}`,
      offering: body.offering,
      requesting: body.requesting,
      trade_with: body.trade_with ?? null,
      proposed: body.proposed ?? false,
      created_at: new Date().toISOString(),
    };

    await mutate([placeholder, ...previous], false);

    let created: Trade;
    try {
      const res = await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`POST /api/trades failed: ${res.status}`);
      created = await res.json();
    } catch {
      await mutate(previous, false);
      showToast('Failed to save trade', 'error');
      throw new Error('Failed to add trade');
    }

    // Replace placeholder with the real record, then revalidate
    await mutate(
      [created, ...previous],
      false,
    );
    await mutate();
    return created;
  }

  /**
   * Update an existing trade.  Applies the patch to the cached list
   * immediately, fires PATCH, and rolls back on failure.
   */
  async function updateTrade(id: string, body: UpdateTradeBody): Promise<void> {
    const previous = data ?? [];

    const optimistic = previous.map((t) =>
      t.id === id ? { ...t, ...body } : t,
    );
    await mutate(optimistic, false);

    try {
      const res = await fetch(`/api/trades/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`PATCH /api/trades/${id} failed: ${res.status}`);
    } catch {
      await mutate(previous, false);
      showToast('Failed to update trade', 'error');
      return;
    }

    await mutate();
  }

  /**
   * Delete a trade.  Removes it from the cache immediately, fires DELETE,
   * and restores on failure.
   */
  async function deleteTrade(id: string): Promise<void> {
    const previous = data ?? [];

    const optimistic = previous.filter((t) => t.id !== id);
    await mutate(optimistic, false);

    try {
      const res = await fetch(`/api/trades/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error(`DELETE /api/trades/${id} failed: ${res.status}`);
    } catch {
      await mutate(previous, false);
      showToast('Failed to delete trade', 'error');
      return;
    }

    await mutate();
  }

  return {
    trades,
    isLoading,
    addTrade,
    updateTrade,
    deleteTrade,
    mutate,
  };
}
