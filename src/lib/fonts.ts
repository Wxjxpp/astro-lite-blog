import { createHash } from 'node:crypto';
// Processed at build time: Vite resolves the @imports and rewrites the font URLs to hashed /_astro files.
import css from '@styles/fonts.css?inline';

export const FONTS_CSS: string = css;
export const FONTS_URL = `/fonts.css?v=${createHash('md5').update(css).digest('hex').slice(0, 8)}`;
