'use client';

import { useState, useEffect, useRef } from 'react';
import { CARDS, BONUS_CARDS, CARDS_BY_ID, BONUS_CARDS_BY_ID, Card, BonusCard } from '@/data/cards';
import { useCollection } from '@/hooks/useCollection';
import { useToast } from '@/hooks/useToast';

type AnyCard = Card | BonusCard;

const ALL_CARDS: AnyCard[] = [...CARDS, ...BONUS_CARDS];

function normalise(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function searchCards(query: string): AnyCard[] {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const numeric = Number(trimmed);
  if (!isNaN(numeric) && Number.isInteger(numeric)) {
    const found = CARDS_BY_ID[numeric] || BONUS_CARDS_BY_ID[String(numeric)];
    return found ? [found] : [];
  }

  // Exact bonus card ID match (e.g. "DB1", "LE-LM", "624b")
  const upperTrimmed = trimmed.toUpperCase();
  const bonusById = BONUS_CARDS_BY_ID[upperTrimmed] || BONUS_CARDS_BY_ID[trimmed];
  if (bonusById) return [bonusById];

  // Bonus ID prefix search — e.g. "DB" lists all DB1–DB24 WC Masters
  const bonusByPrefix = BONUS_CARDS.filter(c =>
    String(c.id).toUpperCase().startsWith(upperTrimmed)
  );
  if (bonusByPrefix.length) return bonusByPrefix.slice(0, 12);

  // Name search across all cards (accent-normalised)
  const normQuery = normalise(trimmed);
  const exact = ALL_CARDS.filter(c => normalise(c.playerName) === normQuery);
  if (exact.length) return exact.slice(0, 12);
  return ALL_CARDS.filter(c => normalise(c.playerName).includes(normQuery)).slice(0, 12);
}

export default function CardInput({ onDone }: { onDone?: () => void } = {}) {
  const { collection, batchAddCards } = useCollection();
  const { show: showToast } = useToast();

  const [query, setQuery] = useState('');
  const [committing, setCommitting] = useState(false);
  const [selectedCard, setSelectedCard] = useState<AnyCard | null>(null);
  const [dropdownResults, setDropdownResults] = useState<AnyCard[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [stagedCards, setStagedCards] = useState<AnyCard[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('click', handleOutside);
    return () => document.removeEventListener('click', handleOutside);
  }, []);

  function handleInput(value: string) {
    setQuery(value);
    if (value.trim().length < 2) {
      setDropdownOpen(false);
      setSelectedCard(null);
      setDropdownResults([]);
      return;
    }
    const results = searchCards(value);
    setDropdownResults(results);
    if (results.length === 1) {
      setSelectedCard(results[0]);
      setDropdownOpen(false);
    } else {
      setSelectedCard(null);
      setDropdownOpen(results.length > 1);
    }
  }

  function selectFromDropdown(card: AnyCard) {
    setSelectedCard(card);
    setQuery(card.playerName);
    setDropdownOpen(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      setDropdownOpen(false);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleAddToList();
    } else if (e.key === 'ArrowDown' && dropdownOpen) {
      e.preventDefault();
      const first = document.querySelector<HTMLElement>('.search-dropdown-item');
      first?.focus();
    }
  }

  function handleDropdownKeyDown(e: React.KeyboardEvent<HTMLDivElement>, card: AnyCard) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      selectFromDropdown(card);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = (e.currentTarget.nextElementSibling as HTMLElement | null);
      next?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = (e.currentTarget.previousElementSibling as HTMLElement | null);
      if (prev) {
        prev.focus();
      } else {
        inputRef.current?.focus();
      }
    } else if (e.key === 'Escape') {
      setDropdownOpen(false);
      inputRef.current?.focus();
    }
  }

  function handleAddToList() {
    const q = query.trim();
    if (!q || q.length < 2) {
      showToast('Enter a card number or name.', 'error');
      return;
    }

    const numeric = Number(q);
    if (!isNaN(numeric) && Number.isInteger(numeric) && numeric < 1) {
      showToast('Invalid card number.', 'error');
      return;
    }

    let card = selectedCard;
    if (!card) {
      const results = searchCards(q);
      if (results.length === 0) {
        showToast(`No card found for "${q}".`, 'error');
        return;
      }
      if (results.length > 1) {
        setDropdownResults(results);
        setDropdownOpen(true);
        showToast('Multiple matches — pick one from the list.', 'info');
        return;
      }
      card = results[0];
    }

    setStagedCards(prev => [card!, ...prev]);
    setQuery('');
    setSelectedCard(null);
    setDropdownOpen(false);
    setDropdownResults([]);
    inputRef.current?.focus();
  }

  function removeFromStaged(idx: number) {
    setStagedCards(prev => prev.filter((_, i) => i !== idx));
  }

  async function handleCommit() {
    if (stagedCards.length === 0) return;

    const confirmed = window.confirm(
      `Add ${stagedCards.length} card${stagedCards.length > 1 ? 's' : ''} to your collection?\n\n` +
      stagedCards.map(c => `• #${c.id} ${c.playerName}`).join('\n')
    );
    if (!confirmed) return;

    // Compute stats before the async call (uses current collection snapshot)
    const binderPages = new Set<number>();
    let newCount = 0;
    let dupeCount = 0;
    for (const card of stagedCards) {
      const isNew = (collection[String(card.id)] ?? 0) === 0;
      const numId = typeof card.id === 'number' ? card.id : NaN;
      const page = Math.ceil(numId / 9);
      if (Number.isFinite(page) && page >= 1 && page <= 70) binderPages.add(page);
      if (isNew) newCount++; else dupeCount++;
    }

    setCommitting(true);
    try {
      await batchAddCards(stagedCards.map(c => String(c.id)));
    } finally {
      setCommitting(false);
    }

    const pageList = [...binderPages].sort((a, b) => a - b).join(', ');
    const pageMsg = pageList ? ` Binder pages: ${pageList}.` : '';
    showToast(
      `Added ${newCount} new${dupeCount > 0 ? ` + ${dupeCount} dupe${dupeCount > 1 ? 's' : ''}` : ''}.${pageMsg}`,
      'success'
    );

    setStagedCards([]);
    if (onDone) {
      onDone();
    } else {
      inputRef.current?.focus();
    }
  }

  return (
    <div>
      {/* Search form */}
      <div ref={formRef} className="px-4 pb-4">
        <label htmlFor="card-search-input" className="form-label">
          Card number or player name
        </label>
        <div className="relative">
          <input
            ref={inputRef}
            id="card-search-input"
            type="search"
            className="form-input pr-12"
            placeholder="e.g. 42, Messi, or DB1 for WC Masters"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-label="Card number or player name"
            aria-autocomplete="list"
            role="combobox"
            aria-expanded={dropdownOpen}
            value={query}
            onChange={e => handleInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          {dropdownOpen && dropdownResults.length > 1 && (
            <div
              className="search-dropdown"
              role="listbox"
              aria-label="Card suggestions"
            >
              {dropdownResults.map(card => (
                <div
                  key={card.id}
                  className="search-dropdown-item"
                  role="option"
                  tabIndex={0}
                  aria-selected={false}
                  onClick={() => selectFromDropdown(card)}
                  onKeyDown={e => handleDropdownKeyDown(e, card)}
                >
                  <span className="search-dropdown-item__id">#{card.id}</span>
                  <span className="font-semibold text-sm">{card.playerName}</span>
                  {'cardType' in card && (card as {cardType:string}).cardType === 'WC Master' && (
                    <span style={{ fontSize: '10px', background: '#C5A028', color: '#fff', padding: '1px 5px', borderRadius: 3, marginLeft: 4, flexShrink: 0 }}>WCM</span>
                  )}
                  <span className="text-xs ml-auto" style={{ color: '#666' }}>{card.country}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          className="btn-secondary w-full mt-3"
          onClick={handleAddToList}
        >
          + Add to List
        </button>
      </div>

      {/* Staging area */}
      <div className="px-4 pb-4">
        {stagedCards.length === 0 ? (
          <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>
            No cards in your list yet.
          </p>
        ) : (
          <>
            <p className="form-label">Cards to add ({stagedCards.length})</p>
            <div className="bulk-add-list">
              {stagedCards.map((card, idx) => {
                const owned = collection[String(card.id)] ?? 0;
                const stagedBefore = stagedCards.slice(0, idx).filter(c => c.id === card.id).length;
                const effectiveOwned = owned + stagedBefore;
                const isNew = effectiveOwned === 0;

                return (
                  <div key={`${card.id}-${idx}`} className="bulk-add-row">
                    <img
                      src={`/assets/cards/${card.id}.jpg`}
                      alt={card.playerName}
                      className="bulk-add-row__thumb"
                      onError={e => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <div className="bulk-add-row__info">
                      <span className="bulk-add-row__name">{card.playerName}</span>
                      <span className="bulk-add-row__meta">
                        #{card.id} · {card.country}
                        {'cardType' in card && (card as {cardType:string}).cardType === 'WC Master' && ' · WC Master'}
                      </span>
                    </div>
                    <span className={`bulk-add-row__badge bulk-add-row__badge--${isNew ? 'new' : 'dupe'}`}>
                      {isNew ? 'NEW' : 'DUPE'}
                    </span>
                    <button
                      type="button"
                      className="bulk-add-row__remove"
                      aria-label={`Remove ${card.playerName} from list`}
                      onClick={() => removeFromStaged(idx)}
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              className="btn-primary w-full mt-4"
              onClick={handleCommit}
              disabled={committing}
              style={committing ? { opacity: 0.7, cursor: 'not-allowed' } : undefined}
            >
              {committing ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span
                    style={{
                      display: 'inline-block',
                      width: 16,
                      height: 16,
                      border: '2px solid rgba(255,255,255,0.4)',
                      borderTopColor: '#fff',
                      borderRadius: '50%',
                      animation: 'spin 0.7s linear infinite',
                    }}
                  />
                  Saving…
                </span>
              ) : (
                `Add ${stagedCards.length} card${stagedCards.length > 1 ? 's' : ''} to Collection`
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
