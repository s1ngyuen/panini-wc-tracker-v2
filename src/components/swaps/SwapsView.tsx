'use client';

import { useState } from 'react';
import { useCollection } from '@/hooks/useCollection';
import { useTrades } from '@/hooks/useTrades';
import { useToast } from '@/hooks/useToast';
import type { TradeGroup } from '@/lib/swap-utils';
import type { Trade, TradeItem } from '@/types';
import GenerateTradeForm from './GenerateTradeForm';
import TradeResults from './TradeResults';
import CustomTradeForm from './CustomTradeForm';
import PendingTradesSection from './PendingTradesSection';

type ActiveTab = 'new' | 'custom';

export default function SwapsView() {
  const { collection, addCard, removeCard } = useCollection();
  const { trades, addTrade, updateTrade, deleteTrade } = useTrades();
  const { show: showToast } = useToast();

  // Generate panel tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('new');

  // Analysis results (null = no results yet)
  const [analysisResults, setAnalysisResults] = useState<TradeGroup[] | null>(null);

  // Partner name — shared between the generate form and results
  const [partnerName, setPartnerName] = useState('');

  // ── Handlers ────────────────────────────────────────────────────────────────

  function handleMax(results: TradeGroup[]) {
    setAnalysisResults(results);
  }

  function clearResults() {
    setAnalysisResults(null);
  }

  async function handleSaveTrade(tradeBody: {
    offering: TradeItem[];
    requesting: TradeItem[];
    trade_with: string;
  }) {
    try {
      await addTrade(tradeBody);
      showToast(`Trade with ${tradeBody.trade_with || 'partner'} saved as pending.`, 'success');
      setPartnerName('');
      setAnalysisResults(null);
    } catch {
      // Error toast is shown by addTrade
    }
  }

  async function handleGenerateTrade(groups: import('@/lib/swap-utils').TradeGroup[], partner: string) {
    // Save the best group as a proposed pending trade
    const best = groups[0];
    try {
      await addTrade({
        offering:   best.offer.map(c => ({ cardId: String(c.id), count: 1 })),
        requesting: best.needCards.map(c => ({ cardId: String(c.id), count: 1 })),
        trade_with: partner || undefined,
        proposed:   true,
      });
      showToast(`Proposed trade with ${partner || 'partner'} added.`, 'success');
      setPartnerName('');
      setAnalysisResults(null);
    } catch {
      // Error toast shown by addTrade
    }
  }

  async function handleSaveCustomTrade(tradeBody: {
    offering: TradeItem[];
    requesting: TradeItem[];
    trade_with?: string;
  }) {
    try {
      await addTrade({
        ...tradeBody,
        trade_with: tradeBody.trade_with,
      });
      showToast('Custom trade saved.', 'success');
      // Flip back to 'new' tab after saving
      setActiveTab('new');
    } catch {
      // Error toast is shown by addTrade
    }
  }

  /**
   * "Trade Done": remove all offering cards from collection (we gave them away),
   * add all requesting cards (we received them), then delete the trade record.
   * Matches v1 behaviour from mountSwapAnalyser's onComplete handler.
   */
  async function handleMarkDone(trade: Trade) {
    try {
      // Remove cards we gave
      for (const ti of trade.offering) {
        await removeCard(ti.cardId, ti.count);
      }
      // Add cards we received
      for (const ti of trade.requesting) {
        for (let i = 0; i < ti.count; i++) {
          await addCard(ti.cardId);
        }
      }
      await deleteTrade(trade.id);
      showToast(
        `Trade with ${trade.trade_with || 'partner'} complete — collection updated.`,
        'success'
      );
    } catch {
      showToast('Something went wrong completing the trade.', 'error');
    }
  }

  async function handleUpdateTrade(id: string, body: Partial<Trade>) {
    const update = {
      ...(body.offering !== undefined && { offering: body.offering }),
      ...(body.requesting !== undefined && { requesting: body.requesting }),
      ...(body.trade_with !== undefined && { trade_with: body.trade_with ?? undefined }),
    };
    await updateTrade(id, update);
  }

  async function handleDeleteTrade(id: string) {
    await deleteTrade(id);
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Page title */}
      <div style={{ padding: '24px 16px 20px' }}>
        <span className="page-title">Swaps</span>
      </div>

      {/* Two-column layout: Generate (left) / Pending Trades (right) */}
      <div className="swap-layout">

        {/* ── Left column: Generate Trade ── */}
        <div>
          {/* Title tile */}
          <div className="pending-title-tile">
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '20px',
                textTransform: 'uppercase',
                letterSpacing: '.04em',
                color: 'var(--accent)',
              }}
            >
              Generate Trade
            </span>
          </div>

          {/* Tab bar */}
          <div className="gen-tab-bar">
            <button
              type="button"
              className={`gen-tab${activeTab === 'new' ? ' gen-tab--active' : ''}`}
              onClick={() => setActiveTab('new')}
            >
              Generate New Trade
            </button>
            <button
              type="button"
              className={`gen-tab${activeTab === 'custom' ? ' gen-tab--active' : ''}`}
              onClick={() => setActiveTab('custom')}
            >
              Generate Custom Trade
            </button>
          </div>

          {/* New Trade panel */}
          {activeTab === 'new' && (
            <>
              <GenerateTradeForm
                collection={collection}
                onMax={handleMax}
                onGenerateTrade={handleGenerateTrade}
                partnerName={partnerName}
                onPartnerNameChange={setPartnerName}
              />
              {analysisResults !== null && analysisResults.length > 0 && (
                <div className="swap-generate-tile" style={{ marginTop: 0, borderTop: '1px solid var(--border)' }}>
                  <TradeResults
                    results={analysisResults}
                    partnerName={partnerName}
                    collection={collection}
                    onSave={handleSaveTrade}
                    onClear={clearResults}
                  />
                </div>
              )}
              {analysisResults !== null && analysisResults.length === 0 && (
                <div className="swap-generate-tile" style={{ marginTop: 0, borderTop: '1px solid var(--border)' }}>
                  <div style={{ background: '#f9f9f9', padding: '16px', textAlign: 'center' }}>
                    <p style={{ color: '#555', fontSize: '13px' }}>
                      None of their cards are on your missing list, or no partner wants matched your dupes.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Custom Trade panel */}
          {activeTab === 'custom' && (
            <CustomTradeForm
              collection={collection}
              onSave={handleSaveCustomTrade}
            />
          )}
        </div>

        {/* ── Right column: Pending Trades ── */}
        <div>
          <PendingTradesSection
            trades={trades}
            collection={collection}
            onUpdate={handleUpdateTrade}
            onDelete={handleDeleteTrade}
            onMarkDone={handleMarkDone}
          />
        </div>
      </div>
    </div>
  );
}
