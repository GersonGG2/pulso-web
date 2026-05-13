import { Inter, JetBrains_Mono, Russo_One } from 'next/font/google';

/**
 * Brand fonts. Loaded once at the root layout and exposed via CSS variables
 * defined in `globals.css` (--font-inter, --font-jetbrains-mono, --font-russo-one).
 *
 * Russo One: condensed sans, esports/gaming vibe — usada SOLO para el wordmark
 * "PULSO" y headings de display. Inter para todo el body, JetBrains Mono para
 * código y datos técnicos (ZScore, IDs, etc.).
 */

export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const russoOne = Russo_One({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-russo-one',
  display: 'swap',
});
