// src/data/progress-colours.ts
// Pure colour data extracted from js/views/progress.js.
// No DOM dependencies — safe for import in server and client components.

export interface ColourPair {
  fill: string;
  track: string;
}

/**
 * Per-team progress bar colours.
 * fill  = filled portion colour (team's primary colour)
 * track = empty track colour (light tint of fill)
 */
export const TEAM_COLORS: Record<string, ColourPair> = {
  'Algeria':        { fill: '#006233', track: '#D9EFE5' },
  'Argentina':      { fill: '#6DAEDB', track: '#EAF4FB' },
  'Australia':      { fill: '#FFD700', track: '#FFFBE0' },
  'Austria':        { fill: '#ED2939', track: '#FFE0E2' },
  'Belgium':        { fill: '#1A1A1A', track: '#F0F0F0' },
  'Brazil':         { fill: '#009C3B', track: '#D9F0E4' },
  'Canada':         { fill: '#FF0000', track: '#FFCECE' },
  'Cape Verde':     { fill: '#003893', track: '#D9E5F8' },
  'Colombia':       { fill: '#FCD116', track: '#FFFBE0' },
  'Croatia':        { fill: '#FF0000', track: '#FFCECE' },
  'Ecuador':        { fill: '#FFD100', track: '#FFFBE0' },
  'Egypt':          { fill: '#C8102E', track: '#FDDDE0' },
  'England':        { fill: '#CF142B', track: '#FDDEE1' },
  'FIFA':           { fill: '#0033A0', track: '#D9E3F5' },
  'France':         { fill: '#EF233C', track: '#FFE8EA' },
  'Germany':        { fill: '#1A1A1A', track: '#FFF2B2' },
  'Ghana':          { fill: '#006B3F', track: '#D9EEE6' },
  'Haiti':          { fill: '#00209F', track: '#D9E2F5' },
  'Iran':           { fill: '#239F40', track: '#DDF1E3' },
  'Ivory Coast':    { fill: '#F77F00', track: '#FFF0DE' },
  'Japan':          { fill: '#BC002D', track: '#FDDDE0' },
  'Jordan':         { fill: '#007A3D', track: '#D9EEE6' },
  'Korea Republic': { fill: '#C60C30', track: '#FDDDE0' },
  'Mexico':         { fill: '#006847', track: '#D9EEE6' },
  'Morocco':        { fill: '#C1272D', track: '#FDDDE0' },
  'Netherlands':    { fill: '#FF4F00', track: '#FFE4D9' },
  'New Zealand':    { fill: '#1A1A1A', track: '#F0F0F0' },
  'Norway':         { fill: '#EF2B2D', track: '#FFE0E0' },
  'Panama':         { fill: '#D21034', track: '#FDDDE0' },
  'Paraguay':       { fill: '#D52B1E', track: '#FDDDE0' },
  'Portugal':       { fill: '#006600', track: '#D9EDD9' },
  'Qatar':          { fill: '#8D153A', track: '#F2D9E0' },
  'Saudi Arabia':   { fill: '#006C35', track: '#D9EEE6' },
  'Scotland':       { fill: '#003082', track: '#D9E3F8' },
  'Senegal':        { fill: '#00853F', track: '#D9EEE6' },
  'South Africa':   { fill: '#007A4D', track: '#D9EEE6' },
  'Spain':          { fill: '#AA151B', track: '#FFF3CC' },
  'Switzerland':    { fill: '#FF0000', track: '#FFCEC0' },
  'Tunisia':        { fill: '#E70013', track: '#FFD9D9' },
  'United States':  { fill: '#002868', track: '#D9E1F5' },
  'Uruguay':        { fill: '#5CB8E4', track: '#E0F3FC' },
  'Uzbekistan':     { fill: '#1EB53A', track: '#DDF5E3' },
  'Curaçao':   { fill: '#002B7F', track: '#D9E2F5' },
  'Denmark':        { fill: '#C60C30', track: '#FDDDE0' },
  'Italy':          { fill: '#003399', track: '#D9E3F8' },
  'Jamaica':        { fill: '#000000', track: '#E8F5D0' },
  'Poland':         { fill: '#DC143C', track: '#FDDDE0' },
  'Sweden':         { fill: '#006AA7', track: '#D9E8F5' },
  'Turkey':         { fill: '#E30A17', track: '#FDDDE0' },
};

/**
 * Per-card-type progress bar colours.
 */
export const TYPE_COLORS: Record<string, ColourPair> = {
  'Hero':             { fill: '#304FFE', track: '#E4EAFF' },
  'Icon':             { fill: '#FF6B6B', track: '#FFE8E8' },
  'Fan Favourite':    { fill: '#9B59B6', track: '#F0E6F8' },
  'Team Crest':       { fill: '#4A5280', track: '#ECEEF8' },
  'Golden Baller':    { fill: '#F5C400', track: '#FFFBE0' },
  'Contender':        { fill: '#4ECDC4', track: '#E0F7F6' },
  'Master Rookie':    { fill: '#00BFA5', track: '#E0F7F4' },
  'Top Keeper':       { fill: '#3B82F6', track: '#DBEAFE' },
  'Defensive Rock':   { fill: '#FF6B00', track: '#FFE4D9' },
  'Midfield Maestro': { fill: '#4ECDC4', track: '#E0F7F6' },
  'Goal Machine':     { fill: '#FF6B6B', track: '#FFE8E8' },
  'Mascot':           { fill: '#9B59B6', track: '#F0E6F8' },
  'Official Emblem':  { fill: '#C5A028', track: '#FFF3CC' },
  'Eternos 22':       { fill: '#10164F', track: '#E4EAFF' },
};

/**
 * Flag emoji for each team — used in the progress modal team rows.
 * Subset of FLAG_EMOJI in card-display.ts (only qualifying teams).
 */
export const TEAM_FLAGS: Record<string, string> = {
  'Algeria': '🇩🇿', 'Argentina': '🇦🇷', 'Australia': '🇦🇺', 'Austria': '🇦🇹',
  'Belgium': '🇧🇪', 'Brazil': '🇧🇷', 'Canada': '🇨🇦', 'Cape Verde': '🇨🇻',
  'Colombia': '🇨🇴', 'Croatia': '🇭🇷', 'Ecuador': '🇪🇨', 'Egypt': '🇪🇬',
  'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'FIFA': '🌍', 'France': '🇫🇷', 'Germany': '🇩🇪',
  'Ghana': '🇬🇭', 'Haiti': '🇭🇹', 'Iran': '🇮🇷', 'Ivory Coast': '🇨🇮',
  'Japan': '🇯🇵', 'Jordan': '🇯🇴', 'Korea Republic': '🇰🇷', 'Mexico': '🇲🇽',
  'Morocco': '🇲🇦', 'Netherlands': '🇳🇱', 'New Zealand': '🇳🇿', 'Norway': '🇳🇴',
  'Panama': '🇵🇦', 'Paraguay': '🇵🇾', 'Portugal': '🇵🇹', 'Qatar': '🇶🇦',
  'Saudi Arabia': '🇸🇦', 'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'Senegal': '🇸🇳', 'South Africa': '🇿🇦',
  'Spain': '🇪🇸', 'Switzerland': '🇨🇭', 'Tunisia': '🇹🇳', 'United States': '🇺🇸',
  'Uruguay': '🇺🇾', 'Uzbekistan': '🇺🇿',
};
