import useSWR from 'swr';
import { useToast } from '@/hooks/useToast';
import type { CollectionMap } from '@/types';

const KEY = '/api/collection';

async function fetcher(url: string): Promise<CollectionMap> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`);
  return res.json();
}

export function useCollection() {
  const { data, isLoading, mutate } = useSWR<CollectionMap>(KEY, fetcher, {
    revalidateOnFocus: false,
  });

  const { show: showToast } = useToast();

  const collection: CollectionMap = data ?? {};

  /**
   * Patch the API with a new count for a card, applying an optimistic update
   * to the SWR cache beforehand.  On failure the cache is rolled back.
   */
  async function patchCard(cardId: string, newCount: number): Promise<void> {
    const previous = data ?? {};

    // 1. Optimistic update — do not revalidate yet
    const optimistic: CollectionMap = { ...previous };
    if (newCount <= 0) {
      delete optimistic[cardId];
    } else {
      optimistic[cardId] = newCount;
    }
    await mutate(optimistic, false);

    // 2. Fire the PATCH request
    try {
      const res = await fetch('/api/collection', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId, count: newCount }),
      });
      if (!res.ok) throw new Error(`PATCH /api/collection failed: ${res.status}`);
    } catch {
      // 3. Roll back on failure
      await mutate(previous, false);
      showToast('Failed to save', 'error');
      return;
    }

    // 4. Revalidate to sync with server truth
    await mutate();
  }

  /**
   * Increment a card's count by 1.
   */
  async function addCard(cardId: string): Promise<void> {
    const current = collection[cardId] ?? 0;
    await patchCard(cardId, current + 1);
  }

  /**
   * Decrement a card's count by `qty` (defaults to 1), floored at 0 (which
   * removes the key from the collection entirely).
   */
  async function removeCard(cardId: string, qty: number = 1): Promise<void> {
    const current = collection[cardId] ?? 0;
    const next = Math.max(0, current - qty);
    await patchCard(cardId, next);
  }

  /**
   * Set a card's count to an explicit value.  Passing 0 removes the card.
   */
  async function setCardCount(cardId: string, count: number): Promise<void> {
    await patchCard(cardId, count);
  }

  return {
    collection,
    isLoading,
    addCard,
    removeCard,
    setCardCount,
    mutate,
  };
}
