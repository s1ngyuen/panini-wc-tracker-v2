// src/data/card-display.ts
// Pure display data extracted from js/components/card-visual.js.
// No DOM dependencies — safe for import in server and client components.

/**
 * Countries whose team colour is light.
 * When rendering a fallback card inner, text in the card middle must be dark.
 */
export const LIGHT_COLOUR_COUNTRIES: ReadonlySet<string> = new Set([
  'Australia',   // #FFD700
  'Colombia',    // #FCD116
  'Ecuador',     // #FFD100
  'Germany',     // #FFCC00
]);

/**
 * Flag emoji map using Unicode regional indicator sequences.
 * Covers all 48 team countries plus contender nations and special entries.
 */
export const FLAG_EMOJI: Record<string, string> = {
  'Algeria':        '🇩🇿',
  'Argentina':      '🇦🇷',
  'Australia':      '🇦🇺',
  'Austria':        '🇦🇹',
  'Belgium':        '🇧🇪',
  'Brazil':         '🇧🇷',
  'Canada':         '🇨🇦',
  'Cape Verde':     '🇨🇻',
  'Colombia':       '🇨🇴',
  'Croatia':        '🇭🇷',
  'Curaçao':   '🇨🇼',
  'Ecuador':        '🇪🇨',
  'Egypt':          '🇪🇬',
  'England':        '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'France':         '🇫🇷',
  'Germany':        '🇩🇪',
  'Ghana':          '🇬🇭',
  'Haiti':          '🇭🇹',
  'Iran':           '🇮🇷',
  'Ivory Coast':    '🇨🇮',
  'Japan':          '🇯🇵',
  'Jordan':         '🇯🇴',
  'Korea Republic': '🇰🇷',
  'Mexico':         '🇲🇽',
  'Morocco':        '🇲🇦',
  'Netherlands':    '🇳🇱',
  'New Zealand':    '🇳🇿',
  'Norway':         '🇳🇴',
  'Panama':         '🇵🇦',
  'Paraguay':       '🇵🇾',
  'Portugal':       '🇵🇹',
  'Qatar':          '🇶🇦',
  'Saudi Arabia':   '🇸🇦',
  'Scotland':       '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'Senegal':        '🇸🇳',
  'South Africa':   '🇿🇦',
  'Spain':          '🇪🇸',
  'Switzerland':    '🇨🇭',
  'Tunisia':        '🇹🇳',
  'United States':  '🇺🇸',
  'Uruguay':        '🇺🇾',
  'Uzbekistan':     '🇺🇿',
  // Non-team entries
  'Contenders':     '⚽',
  'Denmark':        '🇩🇰',
  'Italy':          '🇮🇹',
  'Jamaica':        '🇯🇲',
  'Poland':         '🇵🇱',
  'Sweden':         '🇸🇪',
  'Turkey':         '🇹🇷',
  '-':              '🏆',
};

/**
 * Convert a card type string to a CSS class suffix.
 * e.g. "Fan Favourite" -> "fan-favourite"
 */
export function typeToClass(cardType: string): string {
  return cardType.toLowerCase().replace(/\s+/g, '-');
}
