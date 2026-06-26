'use client';

import { CARDS_BY_ID } from '@/data/cards';
import type { TradeGroup } from '@/lib/swap-utils';
import type { CollectionMap, TradeItem } from '@/types';
import { useToast } from '@/hooks/useToast';

interface Props {
  results: TradeGroup[];
  partnerName: string;
  collection: CollectionMap;
  onSave: (trade: { offering: TradeItem[]; requesting: TradeItem[]; trade_with: string }) => void;
  onClear: () => void;
}

/** Single card text row — #id name  country — type */
function CardLine({ cardId }: { cardId: number }) {
  const card = CARDS_BY_ID[cardId];
  if (!card) return null;
  return (
    <div className="swap-result-row">
      <span className="swap-result-row__id">#{card.id}</span>
      <span className="swap-result-row__name">{card.playerName}</span>
      <span className="swap-result-row__meta">{card.country} — {card.cardType}</span>
    </div>
  );
}

export default function TradeResults({ results, partnerName, collection: _collection, onSave, onClear }: Props) {
  const { show: showToast } = useToast();

  if (results.length === 0) return null;

  // Determine whether this is an "equal mode" result (single group with equalMode flag)
  const isEqualMode = results.length === 1 && results[0].equalMode;

  // All cards we want to receive across all groups
  const youGet = results.flatMap((g) => g.needCards);
  // All cards we are offering across all groups
  const offerCards = results.flatMap((g) => g.offer);
  const totalOffer = offerCards.length;
  const totalShortfall = results.reduce((s, g) => s + g.shortfall, 0);

  async function handleCopy() {
    const getLines = youGet.map((c) => `#${c.id} ${c.playerName}`).join('\n');
    const giveLines = offerCards.length > 0
      ? offerCards.map((c) => `#${c.id} ${c.playerName}`).join('\n')
      : '(none available)';
    try {
      await navigator.clipboard.writeText(
        `Hi mate, I am looking for:\n${getLines}\n\nFor:\n${giveLines}`
      );
      showToast('Copied! Send it to your partner.', 'success');
    } catch {
      showToast("Couldn't copy — select and copy manually.", 'error');
    }
  }

  function handleSave() {
    onSave({
      offering: offerCards.map((c) => ({ cardId: String(c.id), count: 1 })),
      requesting: youGet.map((c) => ({ cardId: String(c.id), count: 1 })),
      trade_with: partnerName || 'Unknown',
    });
    onClear();
  }

  return (
    <div className="pt-4">
      {/* Cards I want — nation-ranked */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--green)', marginBottom: '6px', fontFamily: 'var(--font-display)' }}>
          I want ({youGet.length}) — ranked by nation
        </p>
        {youGet.map((c) => <CardLine key={c.id} cardId={c.id} />)}
        <div style={{ height: '1px', background: '#eee', marginTop: '12px' }} />
      </div>

      {/* My offer */}
      <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.06em', color: 'rgba(197,160,40,0.9)', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>
        My offer ({totalOffer} cards)
      </p>

      {results.map((group, idx) => (
        <div key={idx} style={{ marginBottom: '12px' }}>
          {/* Tier label — omit in equal mode */}
          {!group.equalMode && (
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--gold)', marginBottom: '4px' }}>
              {group.tierLabel}
              {group.shortfall > 0 && (
                <span style={{ color: '#c55', background: '#fee', padding: '1px 6px', fontSize: '10px', marginLeft: '6px' }}>
                  {group.shortfall} short
                </span>
              )}
            </p>
          )}
          {group.offer.map((c) => <CardLine key={c.id} cardId={c.id} />)}
          {group.offer.length === 0 && (
            <p style={{ fontSize: '11px', color: '#aaa' }}>No matching dupes available</p>
          )}
        </div>
      ))}

      {/* Summary */}
      <div style={{ background: '#f9f9f9', padding: '12px 14px', margin: '12px 0 16px', fontSize: '12px' }}>
        {isEqualMode ? (
          totalShortfall === 0
            ? <span><span style={{ color: 'var(--green)', fontWeight: 700 }}>Even trade:</span> {youGet.length} cards each.</span>
            : <span><span style={{ color: '#c55', fontWeight: 700 }}>Uneven:</span> You want <strong>{youGet.length}</strong> but can only match <strong>{totalOffer}</strong> — <strong>{totalShortfall}</strong> short.</span>
        ) : (
          totalShortfall === 0
            ? <span><span style={{ color: 'var(--green)', fontWeight: 700 }}>Balanced:</span> You get <strong>{youGet.length}</strong> cards, offer <strong>{totalOffer}</strong> of matching rarity.</span>
            : <span><span style={{ color: '#c55', fontWeight: 700 }}>Uneven:</span> You want <strong>{youGet.length}</strong> but can only offer <strong>{totalOffer}</strong> — <strong>{totalShortfall}</strong> short.</span>
        )}
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
        <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={handleCopy}>
          Copy Message
        </button>
        <button type="button" className="btn-primary" style={{ flex: 1 }} onClick={handleSave}>
          Save as Pending
        </button>
      </div>
    </div>
  );
}
