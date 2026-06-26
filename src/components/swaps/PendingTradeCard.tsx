'use client';

import { useState } from 'react';
import { CARDS_BY_ID } from '@/data/cards';
import { useToast } from '@/hooks/useToast';
import type { Trade, TradeItem } from '@/types';
import type { CollectionMap } from '@/types';
import CardZoomTip from './CardZoomTip';

interface Props {
  trade: Trade;
  collection: CollectionMap;
  onUpdate: (id: string, body: Partial<Trade>) => void;
  onDelete: (id: string) => void;
  onMarkDone: (trade: Trade) => void;
}

function relativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

/** Thumbnail image for a card — uses the v2 /assets/cards/ path */
function CardThumb({ cardId, alt }: { cardId: string; alt: string }) {
  const src = `/assets/cards/${cardId}.jpg`;
  return (
    <CardZoomTip src={src}>
      <img
        src={src}
        alt={alt}
        width={52}
        height={73}
        loading="lazy"
        className="pending-trade-card__thumb"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = 'none';
        }}
      />
    </CardZoomTip>
  );
}

/** Single column — label + thumbs + name list */
function TradeCol({
  label,
  items,
}: {
  label: string;
  items: TradeItem[];
}) {
  const cards = items
    .map((ti) => ({ ti, card: CARDS_BY_ID[Number(ti.cardId)] }))
    .filter((x) => x.card)
    .sort((a, b) => a.card.id - b.card.id);

  return (
    <div>
      <div className="pending-trade-card__col-head">
        {label} ({cards.length})
      </div>
      {cards.length === 0 ? (
        <div className="pending-trade-card__card-line" style={{ color: '#aaa' }}>
          None
        </div>
      ) : (
        <>
          <div className="pending-trade-card__thumbs">
            {cards.map(({ ti, card }) => (
              <div key={ti.cardId} className="pending-trade-card__thumb-wrap">
                <CardThumb cardId={ti.cardId} alt={card.playerName} />
              </div>
            ))}
          </div>
          <div className="pending-trade-card__card-line">
            {cards.map(({ card }) => card.playerName).join(', ')}
          </div>
        </>
      )}
    </div>
  );
}

// ── Edit mode ────────────────────────────────────────────────────────────────

interface EditState {
  partner: string;
  giving: TradeItem[];
  getting: TradeItem[];
}

function EditCardSection({
  label,
  items,
  accentClass,
  onChange,
}: {
  label: string;
  items: TradeItem[];
  accentClass: string;
  onChange: (updated: TradeItem[]) => void;
}) {
  const { show: showToast } = useToast();
  const [addValue, setAddValue] = useState('');

  function removeAt(idx: number) {
    onChange(items.filter((_, i) => i !== idx));
  }

  function doAdd() {
    const val = addValue.trim();
    const n = Number(val);
    if (!n || n < 1 || n > 630 || !CARDS_BY_ID[n]) {
      showToast('Enter a valid card ID (1–630).', 'error');
      return;
    }
    if (!items.find((ti) => ti.cardId === String(n))) {
      onChange([...items, { cardId: String(n), count: 1 }]);
    }
    setAddValue('');
  }

  return (
    <div style={{ marginBottom: '14px' }}>
      <label className="pending-trade-card__edit-label">{label}</label>
      <div className="et-thumbs">
        {items.map((ti, idx) => {
          const card = CARDS_BY_ID[Number(ti.cardId)];
          return (
            <div key={ti.cardId} className="et-thumb-wrap">
              <img
                src={`/assets/cards/${ti.cardId}.jpg`}
                alt={card?.playerName ?? `#${ti.cardId}`}
                width={52}
                height={73}
                className="pending-trade-card__thumb"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
              <button
                type="button"
                className="et-thumb-remove"
                aria-label={`Remove card ${ti.cardId}`}
                onClick={() => removeAt(idx)}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
        <input
          type="text"
          className="form-input"
          style={{ fontSize: '12px', flex: 1, minHeight: '36px' }}
          placeholder="Add card ID…"
          value={addValue}
          onChange={(e) => setAddValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); doAdd(); } }}
        />
        <button
          type="button"
          className={`btn-secondary ${accentClass}`}
          style={{ fontSize: '11px', padding: '6px 10px', flexShrink: 0 }}
          onClick={doAdd}
        >
          Add
        </button>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function PendingTradeCard({ trade, collection: _collection, onUpdate, onDelete, onMarkDone }: Props) {
  const { show: showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editState, setEditState] = useState<EditState>({
    partner: trade.trade_with ?? '',
    giving: trade.offering,
    getting: trade.requesting,
  });

  // Reset edit state when flipping back to view mode
  function cancelEdit() {
    setEditState({
      partner: trade.trade_with ?? '',
      giving: trade.offering,
      getting: trade.requesting,
    });
    setIsEditing(false);
  }

  function saveEdit() {
    onUpdate(trade.id, {
      trade_with: editState.partner || null,
      offering: editState.giving,
      requesting: editState.getting,
    });
    showToast('Trade updated.', 'success');
    setIsEditing(false);
  }

  async function handleCopy() {
    const giveCards = trade.offering
      .map((ti) => CARDS_BY_ID[Number(ti.cardId)])
      .filter(Boolean)
      .sort((a, b) => a.id - b.id);
    const getCards = trade.requesting
      .map((ti) => CARDS_BY_ID[Number(ti.cardId)])
      .filter(Boolean)
      .sort((a, b) => a.id - b.id);
    const getLines = getCards.map((c) => `#${c.id} ${c.playerName}`).join('\n');
    const giveLines = giveCards.map((c) => `#${c.id} ${c.playerName}`).join('\n');
    const text = `Hi mate, I am looking for:\n${getLines}\n\nFor:\n${giveLines}`;
    try {
      await navigator.clipboard.writeText(text);
      showToast('Copied!', 'success');
    } catch {
      showToast("Couldn't copy — try manually.", 'error');
    }
  }

  // ── Edit view ──────────────────────────────────────────────────────────────

  if (isEditing) {
    return (
      <div className="pending-trade-card">
        <div className="pending-trade-card__edit">
          {/* Partner name */}
          <label className="pending-trade-card__edit-label">Partner name</label>
          <input
            type="text"
            className="form-input"
            style={{ fontSize: '13px', marginBottom: '14px' }}
            placeholder="e.g. John"
            value={editState.partner}
            onChange={(e) => setEditState((s) => ({ ...s, partner: e.target.value }))}
          />

          <EditCardSection
            label="I give"
            items={editState.giving}
            accentClass="et-add-give"
            onChange={(updated) => setEditState((s) => ({ ...s, giving: updated }))}
          />

          <EditCardSection
            label="I get"
            items={editState.getting}
            accentClass="et-add-get"
            onChange={(updated) => setEditState((s) => ({ ...s, getting: updated }))}
          />

          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className="btn-primary" style={{ flex: 1 }} onClick={saveEdit}>
              Save
            </button>
            <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={cancelEdit}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Read-only view ─────────────────────────────────────────────────────────

  return (
    <div className="pending-trade-card">
      {/* Header */}
      <div className="pending-trade-card__header">
        <span className="pending-trade-card__partner">
          Trade with {trade.trade_with || 'Unknown'}
        </span>
        <span className="pending-trade-card__age">
          {relativeTime(trade.created_at)}
        </span>
      </div>

      {/* Columns */}
      <div className="pending-trade-card__cols">
        <TradeCol label="I give" items={trade.offering} />
        <TradeCol label="I get" items={trade.requesting} />
      </div>

      {/* Actions — right-aligned row, small buttons */}
      <div className="pending-trade-card__actions">
        <button type="button" className="btn-secondary" onClick={handleCopy}>
          Copy Message
        </button>
        <button type="button" className="btn-secondary" onClick={() => setIsEditing(true)}>
          Edit
        </button>
        <button
          type="button"
          className="btn-primary"
          onClick={() => {
            if (!confirm(`Mark trade with ${trade.trade_with || 'partner'} as complete? Your collection will be updated.`)) return;
            onMarkDone(trade);
          }}
        >
          Trade Done
        </button>
        <button
          type="button"
          className="btn-cancel"
          onClick={() => {
            if (!confirm('Remove this pending trade?')) return;
            onDelete(trade.id);
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
