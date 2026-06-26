'use client';

import { useEffect } from 'react';
import { CollectionMap } from '@/types';
import { CARDS, TEAMS, CARD_TYPES } from '@/data/cards';
import { TEAM_COLORS, TYPE_COLORS } from '@/data/progress-colours';

const TOTAL = 630;

const BASE_TYPES = new Set(['Hero', 'Icon', 'Fan Favourite', 'Team Crest', 'Contender']);

interface Props {
  isOpen: boolean;
  onClose: () => void;
  collection: CollectionMap;
  pendingCardIds: Set<string>;
}

// Crest slug overrides for teams whose name doesn't map cleanly to a filename.
const CREST_SLUG_OVERRIDES: Record<string, string> = {
  'Curaçao': 'curacao',
};

function teamCrestSrc(team: string): string {
  const slug =
    CREST_SLUG_OVERRIDES[team] ??
    team.toLowerCase().replace(/\s+/g, '-').replace(/'/g, '');
  return `/assets/crests/${slug}.png`;
}

function teamInitials(team: string): string {
  return team
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();
}

export default function ProgressModal({ isOpen, onClose, collection, pendingCardIds }: Props) {
  // Trap escape key
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // ── Compute overall stats ────────────────────────────────────────────────
  const ownedCount   = CARDS.filter(c => (collection[String(c.id)] ?? 0) >= 1).length;
  const pendingCount = CARDS.filter(
    c => (collection[String(c.id)] ?? 0) === 0 && pendingCardIds.has(String(c.id))
  ).length;
  const dupCount = CARDS.reduce((sum, c) => {
    const n = collection[String(c.id)] ?? 0;
    return sum + Math.max(0, n - 1);
  }, 0);
  const needCount  = Math.max(0, TOTAL - ownedCount - pendingCount);
  const pct        = TOTAL > 0 ? ((ownedCount  / TOTAL) * 100).toFixed(1) : '0.0';
  const pendingPct = TOTAL > 0 ? ((pendingCount / TOTAL) * 100).toFixed(1) : '0.0';

  // ── Per-team totals (base cards only) ───────────────────────────────────
  const teamTotals: Record<string, { total: number; owned: number; pending: number }> = {};
  TEAMS.forEach(t => { teamTotals[t] = { total: 0, owned: 0, pending: 0 }; });
  CARDS.filter(c => BASE_TYPES.has(c.cardType)).forEach(c => {
    if (!teamTotals[c.country]) return;
    teamTotals[c.country].total++;
    const n = collection[String(c.id)] ?? 0;
    if (n >= 1) teamTotals[c.country].owned++;
    else if (pendingCardIds.has(String(c.id))) teamTotals[c.country].pending++;
  });

  // ── Per-type totals ──────────────────────────────────────────────────────
  const typeTotals: Record<string, { total: number; owned: number; pending: number }> = {};
  CARD_TYPES.forEach(t => { typeTotals[t] = { total: 0, owned: 0, pending: 0 }; });
  CARDS.forEach(c => {
    if (!typeTotals[c.cardType]) return;
    typeTotals[c.cardType].total++;
    const n = collection[String(c.id)] ?? 0;
    if (n >= 1) typeTotals[c.cardType].owned++;
    else if (pendingCardIds.has(String(c.id))) typeTotals[c.cardType].pending++;
  });

  return (
    <div
      className="progress-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Progress breakdown"
      hidden={!isOpen}
    >
      <div className="progress-modal__backdrop" onClick={onClose} />
      <div className="progress-modal__panel">
        <div className="progress-modal__handle" />
        <div className="progress-modal__header">
          <span className="fx progress-modal__title">Progress</span>
          <button
            className="progress-modal__close"
            aria-label="Close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="progress-modal__body">
          {/* ── Overall stats block ── */}
          <div className="overall-block">
            <div className="overall-tiles">
              <div className="stat-tile">
                <div className="stat-tile__label">Cards collected</div>
                <span className="fx-c stat-tile__num" style={{ color: 'var(--accent)' }}>
                  {ownedCount}{' '}
                  <span style={{ color: 'rgba(197,160,40,0.55)' }}>of {TOTAL}</span>
                </span>
              </div>
              <div className="stat-tile">
                <div className="stat-tile__label">Still need</div>
                <span className="fx-c stat-tile__num" style={{ color: 'var(--accent)' }}>
                  {needCount}
                </span>
              </div>
              <div className="stat-tile">
                <div className="stat-tile__label">Pending trades</div>
                <span className="fx-c stat-tile__num" style={{ color: 'rgba(197,160,40,0.8)' }}>
                  {pendingCount}
                </span>
              </div>
              <div className="stat-tile">
                <div className="stat-tile__label">Duplicates</div>
                <span className="fx-c stat-tile__num" style={{ color: 'var(--accent)' }}>
                  {dupCount}
                </span>
              </div>
            </div>

            <div
              className="progress-track"
              style={{
                position: 'relative',
                overflow: 'hidden',
              } as React.CSSProperties}
            >
              <div className="progress-fill" style={{ width: `${pct}%` }} />
              <div
                className="progress-fill"
                style={{
                  width: `${pendingPct}%`,
                  background: 'rgba(197,160,40,0.4)',
                  position: 'absolute',
                  left: `${pct}%`,
                  top: 0,
                  height: '100%',
                }}
              />
            </div>

            {pendingCount > 0 && (
              <div className="collection-progress__key">
                <span className="collection-progress__key-owned">{ownedCount} owned</span>
                <span className="collection-progress__key-pending">{pendingCount} pending</span>
              </div>
            )}
          </div>

          {ownedCount === 0 ? (
            <p style={{ padding: '32px 0', color: 'var(--text-muted)', fontSize: 14, textAlign: 'center' }}>
              No cards yet. Start adding packs in Add Cards.
            </p>
          ) : (
            <div className="progress-two-col">
              {/* ── By Team ── */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="category-heading">
                  <span className="fx category-heading__text">Base Collection by Team</span>
                </div>
                <div className="prog-rows">
                  {[...TEAMS.filter(t => t !== '-'), ...(TEAMS.includes('-') ? ['-'] : [])].map(team => {
                    const { total, owned, pending } = teamTotals[team] ?? { total: 0, owned: 0, pending: 0 };
                    if (total === 0) return null;
                    const displayTeam = team === '-' ? 'Other' : team;
                    const p  = Math.round((owned   / total) * 100);
                    const pp = Math.round((pending  / total) * 100);
                    const colors = TEAM_COLORS[team] ?? { fill: '#304FFE', track: '#E4EAFF' };
                    const initials = teamInitials(team);

                    return (
                      <div
                        key={team}
                        className="prog-row prog-row--team"
                        style={{
                          '--fill':  colors.fill,
                          '--track': colors.track,
                        } as React.CSSProperties}
                      >
                        <div
                          className="prog-row__crest"
                          style={{ '--crest-color': colors.fill } as React.CSSProperties}
                        >
                          <img
                            className="prog-row__crest-img"
                            src={teamCrestSrc(displayTeam)}
                            alt={`${displayTeam} badge`}
                            onError={e => {
                              const img = e.currentTarget;
                              img.style.display = 'none';
                              const sibling = img.nextElementSibling as HTMLElement | null;
                              if (sibling) sibling.style.display = 'flex';
                            }}
                          />
                          <span
                            className="prog-row__crest-initials"
                            style={{ display: 'none' }}
                          >
                            {teamInitials(displayTeam)}
                          </span>
                        </div>

                        <div className="prog-row__content">
                          <div className="prog-row__header">
                            <span className="prog-row__name">{displayTeam}</span>
                            <span className="prog-row__fraction">
                              <span className="prog-row__owned-n">{owned}</span>
                              <span className="prog-row__of"> of {total} cards</span>
                            </span>
                          </div>
                          <div
                            className="progress-track prog-row__bar"
                            style={{ position: 'relative', overflow: 'hidden' }}
                          >
                            <div className="progress-fill" style={{ width: `${p}%` }} />
                            {pending > 0 && (
                              <div
                                className="progress-fill progress-fill--pending"
                                style={{
                                  width: `${pp}%`,
                                  position: 'absolute',
                                  left: `${p}%`,
                                  top: 0,
                                  height: '100%',
                                }}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── By Card Type ── */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="category-heading">
                  <span className="fx category-heading__text">By Card Type</span>
                </div>
                <div className="prog-rows">
                  {CARD_TYPES.map(type => {
                    const { total, owned, pending } = typeTotals[type] ?? { total: 0, owned: 0, pending: 0 };
                    if (total === 0) return null;
                    const p  = Math.round((owned   / total) * 100);
                    const pp = Math.round((pending  / total) * 100);
                    const colors = TYPE_COLORS[type] ?? { fill: '#304FFE', track: '#E4EAFF' };

                    return (
                      <div
                        key={type}
                        className="prog-row"
                        style={{
                          '--fill':  colors.fill,
                          '--track': colors.track,
                        } as React.CSSProperties}
                      >
                        <div className="prog-row__content">
                          <div className="prog-row__header">
                            <span className="prog-row__name">{type}</span>
                            <span className="prog-row__fraction">
                              <span className="prog-row__owned-n">{owned}</span>
                              <span className="prog-row__of"> of {total} cards</span>
                            </span>
                          </div>
                          <div
                            className="progress-track prog-row__bar"
                            style={{ position: 'relative', overflow: 'hidden' }}
                          >
                            <div className="progress-fill" style={{ width: `${p}%` }} />
                            {pending > 0 && (
                              <div
                                className="progress-fill progress-fill--pending"
                                style={{
                                  width: `${pp}%`,
                                  position: 'absolute',
                                  left: `${p}%`,
                                  top: 0,
                                  height: '100%',
                                }}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
