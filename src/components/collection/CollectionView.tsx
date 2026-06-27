'use client';

import { useState, useEffect, useMemo } from 'react';
import { CARDS, BONUS_CARDS, SPECIAL_TABS, Card, BonusCard } from '@/data/cards';
import { useCollection } from '@/hooks/useCollection';
import { useTrades } from '@/hooks/useTrades';
import { useMigration } from '@/hooks/useMigration';
import { getPriceSummary, loadPrices } from '@/lib/prices';
import { useToast } from '@/hooks/useToast';
import StatTiles from './StatTiles';
import ProgressBar from './ProgressBar';
import ProgressModal from './ProgressModal';
import CollectionTabBar from './CollectionTabBar';
import AllCardsPanel from './AllCardsPanel';
import CorePanel from './CorePanel';
import BonusPanel from './BonusPanel';
import DupesPanel from './DupesPanel';
import CardLightbox from './CardLightbox';
import EbayStrip from './EbayStrip';

type TabKey = 'all' | 'core' | 'upgrades' | 'le' | 'wcm' | 'special' | 'dupes';

export default function CollectionView() {
  const { collection, removeCard } = useCollection();
  const { trades } = useTrades();
  const { runMigration } = useMigration();

  const [activeTab, setActiveTab] = useState<TabKey>('core');
  const [lightboxCard, setLightboxCard] = useState<Card | BonusCard | null>(null);
  const [progressModalOpen, setProgressModalOpen] = useState(false);
  const [pricesVersion, setPricesVersion] = useState(0);

  // Run migration once on mount; refresh stats when eBay prices are injected
  useEffect(() => {
    runMigration();
    loadPrices();
    const handler = () => setPricesVersion(v => v + 1);
    window.addEventListener('prices-updated', handler);
    return () => window.removeEventListener('prices-updated', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Pending card IDs ──────────────────────────────────────────────────────
  // For proposed trades: offering cards are committed (locked), requesting are NOT pending.
  // For non-proposed trades: requesting cards show as pending in the UI.
  const pendingCardIds = useMemo<Set<string>>(() => {
    const ids = new Set<string>();
    trades.forEach(trade => {
      if (!trade.proposed) {
        trade.requesting.forEach(item => ids.add(item.cardId));
      }
      trade.offering.forEach(item => ids.add(item.cardId));
    });
    return ids;
  }, [trades]);

  // ── Derived stats for the active tab ─────────────────────────────────────
  const stats = useMemo(() => {
    let cardSet: (Card | BonusCard)[];

    if (activeTab === 'all') {
      cardSet = [...CARDS, ...BONUS_CARDS];
    } else if (activeTab === 'core') {
      cardSet = CARDS;
    } else if (activeTab === 'dupes') {
      cardSet = [...CARDS, ...BONUS_CARDS].filter(c => (collection[String(c.id)] ?? 0) >= 2);
    } else {
      const def = SPECIAL_TABS.find(t => t.key === activeTab);
      cardSet = def ? BONUS_CARDS.filter(c => def.cats.includes(c.bonusCategory)) : [];
    }

    const total    = cardSet.length;
    const owned    = cardSet.filter(c => (collection[String(c.id)] ?? 0) >= 1).length;
    // Pending only applies to core cards that we're requesting in a trade
    const pending  = activeTab === 'all'
      ? CARDS.filter(c => (collection[String(c.id)] ?? 0) === 0 && pendingCardIds.has(String(c.id))).length
      : activeTab === 'core'
        ? CARDS.filter(c => (collection[String(c.id)] ?? 0) === 0 && pendingCardIds.has(String(c.id))).length
        : 0;

    const totalCopies = cardSet.reduce((s, c) => s + (collection[String(c.id)] ?? 0), 0);
    const dupeCount   = cardSet.reduce((s, c) => s + Math.max(0, (collection[String(c.id)] ?? 0) - 1), 0);
    const needCount   = Math.max(0, total - owned - pending);

    // Value based on all owned cards (full collection), not just the tab
    const ownedIds = [...CARDS, ...BONUS_CARDS]
      .flatMap(c => Array(collection[String(c.id)] ?? 0).fill(String(c.id)));
    const { priced, value, currency } = getPriceSummary(ownedIds);
    const sym = currency === 'AUD' ? 'A$' : '$';
    const valueStr = priced === 0 ? '—' : `${sym}${value.toFixed(0)}`;

    return {
      total,
      owned,
      pending,
      totalCopies,
      dupeCount,
      needCount,
      valueStr,
    };
  }, [activeTab, collection, pendingCardIds, pricesVersion]);

  // Lightbox card count from live collection
  const lightboxCount = lightboxCard ? (collection[String(lightboxCard.id)] ?? 0) : 0;

  function handleTabChange(tab: string) {
    setActiveTab(tab as TabKey);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const { show: showToast } = useToast();

  async function handleGenerateTradingMessage() {
    const missing    = CARDS.filter(c => (collection[String(c.id)] ?? 0) === 0);
    const duplicates = CARDS.filter(c => (collection[String(c.id)] ?? 0) >= 2);
    const needList   = missing.map(c => `#${c.id}`).join(', ') || 'None';
    const dupeList   = duplicates.map(c => `#${c.id}`).join(', ') || 'None';
    const msg = `I am looking for: ${needList}\n\nI have duplicates of: ${dupeList}`;
    try {
      await navigator.clipboard.writeText(msg);
      showToast('Trading message copied to clipboard!', 'success');
    } catch {
      showToast("Couldn't copy — try manually.", 'error');
    }
  }

  async function handleLightboxRemove(qty: number) {
    if (!lightboxCard) return;
    await removeCard(String(lightboxCard.id), qty);
    // If all copies removed, close lightbox
    const newCount = Math.max(0, lightboxCount - qty);
    if (newCount === 0) {
      setLightboxCard(null);
    }
  }

  return (
    <>
      {/* Page title + trading message button */}
      <div style={{ padding: '24px 16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="page-title">Collection</span>
        <button
          type="button"
          className="btn-secondary"
          style={{ fontSize: '12px', padding: '6px 12px', whiteSpace: 'nowrap' }}
          onClick={handleGenerateTradingMessage}
        >
          Generate Trading Message
        </button>
      </div>

      {/* Progress bar — clickable to open modal */}
      <ProgressBar
        owned={stats.owned}
        pending={stats.pending}
        total={stats.total}
        onClick={() => setProgressModalOpen(true)}
      />

      {/* Stat tiles */}
      <StatTiles
        total={stats.totalCopies}
        unique={stats.owned}
        pending={stats.pending}
        need={stats.needCount}
        dupes={stats.dupeCount}
        value={stats.valueStr}
      />

      {/* eBay price fetcher */}
      <EbayStrip collection={collection} />

      {/* Tab bar */}
      <CollectionTabBar activeTab={activeTab} onChange={handleTabChange} />

      {/* Panels — only the active one is rendered */}
      {activeTab === 'all' && (
        <AllCardsPanel
          collection={collection}
          pendingCardIds={pendingCardIds}
          onCardClick={setLightboxCard}
        />
      )}
      {activeTab === 'core' && (
        <CorePanel
          collection={collection}
          pendingCardIds={pendingCardIds}
          onCardClick={setLightboxCard}
        />
      )}
      {(activeTab === 'upgrades' || activeTab === 'le' || activeTab === 'wcm' || activeTab === 'special') && (
        <BonusPanel
          key={activeTab}
          tabKey={activeTab}
          collection={collection}
          pendingCardIds={pendingCardIds}
          onCardClick={setLightboxCard}
        />
      )}
      {activeTab === 'dupes' && (
        <DupesPanel
          collection={collection}
          pendingCardIds={pendingCardIds}
          onCardClick={setLightboxCard}
        />
      )}

      {/* Progress breakdown modal */}
      <ProgressModal
        isOpen={progressModalOpen}
        onClose={() => setProgressModalOpen(false)}
        collection={collection}
        pendingCardIds={pendingCardIds}
      />

      {/* Card lightbox */}
      {lightboxCard && (
        <CardLightbox
          card={lightboxCard}
          count={lightboxCount}
          onRemove={handleLightboxRemove}
          onClose={() => setLightboxCard(null)}
        />
      )}
    </>
  );
}
