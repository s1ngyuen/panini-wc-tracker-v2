// src/lib/swap-utils.ts
// Pure logic extracted from js/views/swap-analyser.js.
// No DOM access, no event listeners, no imports from store or toast.
// Safe for import in server and client components.

import { CARDS, CARDS_BY_ID } from '@/data/cards';
import type { Card } from '@/data/cards';

// ── Rarity tiers ──────────────────────────────────────────────────────────────

export const RARITY_TIER: Record<string, number> = {
  'Golden Baller':    3,
  'Icon':             2,
  'Fan Favourite':    2,
  'Master Rookie':    2,
  'Top Keeper':       2,
  'Defensive Rock':   2,
  'Midfield Maestro': 2,
  'Goal Machine':     2,
  'Mascot':           2,
  'Official Emblem':  2,
  'Eternos-22':       2,
  'Hero':             1,
  'Contender':        1,
  'Team Crest':       1,
};

const TIER_LABEL: Record<number, string> = {
  3: 'Ultra Rare',
  2: 'Special',
  1: 'Base',
};

function tier(cardType: string): number {
  return RARITY_TIER[cardType] ?? 1;
}

// ── FIFA world ranking ────────────────────────────────────────────────────────
// Lower number = better rank. Used to sort "cards I want" in suggested offers.

export const NATION_RANK: Record<string, number> = {
  'Argentina':      1,
  'France':         2,
  'England':        3,
  'Brazil':         4,
  'Spain':          5,
  'Portugal':       6,
  'Netherlands':    7,
  'Belgium':        8,
  'Germany':        9,
  'Croatia':        10,
  'Uruguay':        11,
  'Colombia':       12,
  'Switzerland':    13,
  'Morocco':        14,
  'Japan':          15,
  'Mexico':         16,
  'United States':  17,
  'Senegal':        18,
  'Korea Republic': 19,
  'Austria':        20,
  'Denmark':        21,
  'Ecuador':        22,
  'Italy':          23,
  'Iran':           24,
  'Australia':      25,
  'Canada':         26,
  'Norway':         27,
  'Poland':         28,
  'Turkey':         29,
  'Qatar':          30,
  'Saudi Arabia':   31,
  'Ghana':          32,
  'Tunisia':        33,
  'Algeria':        34,
  'Egypt':          35,
  'Ivory Coast':    36,
  'South Africa':   37,
  'New Zealand':    38,
  'Sweden':         39,
  'Haiti':          40,
  'Cape Verde':     41,
  'Panama':         42,
  'Paraguay':       43,
  'Scotland':       44,
  'Jordan':         45,
  'Jamaica':        46,
  'Curaçao':        47,
  'Uzbekistan':     48,
};

export function nationRank(country: string): number {
  return NATION_RANK[country] ?? 99;
}

// ── Text normalisation ────────────────────────────────────────────────────────

/**
 * Strip emojis, common trade-post labels, quantity markers, and excess
 * whitespace from a raw pasted string before card-ID/name parsing.
 */
export function cleanseText(raw: string): string {
  return raw
    // Strip emoji and unicode symbols broadly
    .replace(
      /[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2300}-\u{23FF}\u{2700}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE00}-\u{FEFF}\u{200D}]/gu,
      ''
    )
    // Strip common Facebook trade labels at line/token start
    .replace(
      /\b(i\s+have|i\s+offer|i\s+am\s+looking\s+for|i\s+need|looking\s+for|lf|iso|ft|for\s+trade|offering|offers?|haves?|wants?|needs?|dupes?|duplicates?|extras?|spares?)\s*[:\-]?\s*/gi,
      ''
    )
    // Strip quantity markers like x2, (x2), x2
    .replace(/[(\[]?\s*[x×]\s*\d+\s*[)\]]?/gi, '')
    // Strip content in parens if it looks like extra info (not a short name)
    .replace(/\([^)]{0,30}\)/g, '')
    // Strip standalone asterisks, dashes used as bullets
    .replace(/^\s*[-•*]\s*/gm, '')
    // Collapse whitespace
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ── Card ID / name parser ─────────────────────────────────────────────────────

export interface ParseResult {
  matched: Card[];
  unmatched: string[];
}

/**
 * Parse a free-text string of card IDs or player names into matched Card
 * objects and unmatched tokens.
 *
 * Lookup order:
 *   1. Pure integer in range 1–630 → CARDS_BY_ID lookup
 *   2. Leading integer in a "45 Messi"-style token
 *   3. Exact player name match (case-insensitive)
 *   4. Partial player name match (>= 3 chars, case-insensitive)
 */
export function parseInput(text: string): ParseResult {
  const tokens = cleanseText(text)
    .split(/[\n,;]+/)
    .map((t) => t.trim().replace(/^[#\s]+/, '').trim())
    .filter((t) => t.length > 0);

  const seen = new Set<number>();
  const matched: Card[] = [];
  const unmatched: string[] = [];

  for (const token of tokens) {
    // 1. Pure number
    const num = Number(token);
    if (!isNaN(num) && Number.isInteger(num) && num >= 1 && num <= 630) {
      const card = CARDS_BY_ID[num];
      if (card && !seen.has(card.id)) {
        seen.add(card.id);
        matched.push(card);
      } else if (!card) {
        unmatched.push(token);
      }
      continue;
    }

    // 2. Leading integer ("45 Messi")
    const leadNum = token.match(/^(\d+)/);
    if (leadNum) {
      const n = Number(leadNum[1]);
      if (n >= 1 && n <= 630 && CARDS_BY_ID[n]) {
        const card = CARDS_BY_ID[n];
        if (!seen.has(card.id)) {
          seen.add(card.id);
          matched.push(card);
        }
        continue;
      }
    }

    // 3 & 4. Name match
    const lower = token.toLowerCase();
    let found = CARDS.find((c) => c.playerName.toLowerCase() === lower);
    if (!found) {
      found = CARDS.find(
        (c) => c.playerName.toLowerCase().includes(lower) && lower.length >= 3
      );
    }
    if (found && !seen.has(found.id)) {
      seen.add(found.id);
      matched.push(found);
    } else if (!found && token.length >= 2) {
      unmatched.push(token);
    }
  }

  return { matched, unmatched };
}

// ── Trade offer types ─────────────────────────────────────────────────────────

export interface TradeGroup {
  tierLabel: string;
  tier: number;
  need: number;
  needCards: Card[];
  offer: Card[];
  shortfall: number;
  equalMode?: boolean;
}

// ── Suggested offer ───────────────────────────────────────────────────────────

/**
 * Build a rarity-balanced trade offer.
 *
 * Rule: only offer cards the partner has explicitly listed in their wants.
 * Within that pool, match rarity tier to what we are receiving.
 * If partnerWants is empty the offer is empty — we cannot guess what they need.
 *
 * @param youGet        Cards we want to receive (partner's haves that we're missing)
 * @param myDuplicates  Cards we own with count > 1
 * @param partnerWants  Cards the partner has stated they want
 * @param lockedIds     Card IDs that are already committed to another pending trade
 */
export function buildSuggestedOffer(
  youGet: Card[],
  myDuplicates: Card[],
  partnerWants: Card[],
  lockedIds: Set<number> = new Set()
): TradeGroup[] {
  if (partnerWants.length === 0) return [];

  const partnerWantIds = new Set(partnerWants.map((c) => c.id));

  // Pool: things they want, I have as a spare, and are not locked
  const available = myDuplicates.filter(
    (d) => partnerWantIds.has(d.id) && !lockedIds.has(d.id)
  );

  const needByTier: Record<number, Card[]> = { 1: [], 2: [], 3: [] };
  for (const card of youGet) {
    needByTier[tier(card.cardType)].push(card);
  }

  const availByTier: Record<number, Card[]> = { 1: [], 2: [], 3: [] };
  for (const card of available) {
    availByTier[tier(card.cardType)].push(card);
  }

  const used = new Set<number>();
  const groups: TradeGroup[] = [];

  for (const t of [3, 2, 1] as const) {
    const needed = needByTier[t];
    if (needed.length === 0) continue;

    const offer = availByTier[t].filter((d) => !used.has(d.id)).slice(0, needed.length);
    offer.forEach((d) => used.add(d.id));

    groups.push({
      tierLabel: TIER_LABEL[t],
      tier: t,
      need: needed.length,
      needCards: needed,
      offer,
      shortfall: needed.length - offer.length,
    });
  }

  return groups;
}

// ── Equal-match offer ─────────────────────────────────────────────────────────

/**
 * Build an equal-count trade offer, ignoring rarity tiers.
 * Returns a single group matching card-for-card count from the available pool.
 *
 * @param youGet        Cards we want to receive
 * @param myDuplicates  Cards we own with count > 1
 * @param partnerWants  Cards the partner has stated they want
 * @param lockedIds     Card IDs already committed to another pending trade
 */
export function buildEqualOffer(
  youGet: Card[],
  myDuplicates: Card[],
  partnerWants: Card[],
  lockedIds: Set<number> = new Set()
): TradeGroup[] {
  if (partnerWants.length === 0) return [];

  const partnerWantIds = new Set(partnerWants.map((c) => c.id));
  const available = myDuplicates.filter(
    (d) => partnerWantIds.has(d.id) && !lockedIds.has(d.id)
  );
  const offer = available.slice(0, youGet.length);

  return [
    {
      tierLabel: 'Best match',
      tier: 0,
      need: youGet.length,
      needCards: youGet,
      offer,
      shortfall: youGet.length - offer.length,
      equalMode: true,
    },
  ];
}
