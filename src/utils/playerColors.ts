export const PLAYER_EMOJIS = ['🤙', '😎', '🦈', '🤑', '😈', '🃏'] as const;

export const PLAYER_PALETTES = [
  { bg: 'linear-gradient(135deg,#e74c3c,#c0392b)', cardBg: 'linear-gradient(145deg,rgba(231,76,60,0.15),rgba(231,76,60,0.05))',   border: 'rgba(231,76,60,0.35)',  glow: 'rgba(231,76,60,0.45)',  text: '#e74c3c' },
  { bg: 'linear-gradient(135deg,#3498db,#2980b9)', cardBg: 'linear-gradient(145deg,rgba(52,152,219,0.15),rgba(52,152,219,0.05))',  border: 'rgba(52,152,219,0.35)', glow: 'rgba(52,152,219,0.45)', text: '#3498db' },
  { bg: 'linear-gradient(135deg,#2ecc71,#27ae60)', cardBg: 'linear-gradient(145deg,rgba(46,204,113,0.15),rgba(46,204,113,0.05))', border: 'rgba(46,204,113,0.35)', glow: 'rgba(46,204,113,0.45)', text: '#2ecc71' },
  { bg: 'linear-gradient(135deg,#9b59b6,#8e44ad)', cardBg: 'linear-gradient(145deg,rgba(155,89,182,0.15),rgba(155,89,182,0.05))', border: 'rgba(155,89,182,0.35)', glow: 'rgba(155,89,182,0.45)', text: '#9b59b6' },
  { bg: 'linear-gradient(135deg,#ff6b35,#e55a24)', cardBg: 'linear-gradient(145deg,rgba(255,107,53,0.15),rgba(255,107,53,0.05))',  border: 'rgba(255,107,53,0.35)', glow: 'rgba(255,107,53,0.45)', text: '#ff6b35' },
  { bg: 'linear-gradient(135deg,#f39c12,#d68910)', cardBg: 'linear-gradient(145deg,rgba(243,156,18,0.15),rgba(243,156,18,0.05))',  border: 'rgba(243,156,18,0.35)', glow: 'rgba(243,156,18,0.45)', text: '#f39c12' },
] as const;

export const getPlayerEmoji = (index: number): string =>
  PLAYER_EMOJIS[index % PLAYER_EMOJIS.length];

export const getPlayerPalette = (index: number): typeof PLAYER_PALETTES[number] =>
  PLAYER_PALETTES[index % PLAYER_PALETTES.length];
