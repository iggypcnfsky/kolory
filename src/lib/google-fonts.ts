// A curated list of interesting Google Fonts suitable for hex codes
export const GOOGLE_FONTS = [
  'Roboto Mono',
  'Space Mono',
  'Fira Code',
  'JetBrains Mono',
  'Source Code Pro',
  'IBM Plex Mono',
  'Inconsolata',
  'Anonymous Pro',
  'Courier Prime',
  'Overpass Mono',
  'Cutive Mono',
  'Major Mono Display',
  'VT323',
  'Share Tech Mono',
  'B612 Mono',
  'Azeret Mono',
  'Red Hat Mono',
  'Nanum Gothic Coding',
  'Syne Mono',
  'Martian Mono',
  'Chivo Mono',
  'Sono',
  'Playfair Display',
  'Bebas Neue',
  'Cinzel',
  'Merriweather',
  'Righteous',
  'Audiowide',
  'Bungee',
  'Monoton',
  'Orbitron',
];

export function getRandomFont(): string {
  return GOOGLE_FONTS[Math.floor(Math.random() * GOOGLE_FONTS.length)];
}

export function loadGoogleFont(fontName: string): void {
  // Check if the font is already loaded
  const fontId = `google-font-${fontName.replace(/\s+/g, '-')}`;
  if (document.getElementById(fontId)) {
    return;
  }

  // Create and inject the font link
  const link = document.createElement('link');
  link.id = fontId;
  link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@400;600;700&display=swap`;
  link.rel = 'stylesheet';
  document.head.appendChild(link);
}

