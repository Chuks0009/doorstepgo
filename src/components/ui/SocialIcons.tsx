/* Custom monochrome social glyphs (currentColor) — brand-integrated, not multicoloured logos. */
import type { SVGProps } from 'react';
import type { SocialKey } from '@/config/site';

type P = SVGProps<SVGSVGElement>;
const S = (p: P) => <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p} />;

export const InstagramGlyph = (p: P) => (
  <S {...p}><path d="M12 7.3a4.7 4.7 0 1 0 0 9.4 4.7 4.7 0 0 0 0-9.4Zm0 7.7a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm6-7.9a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0ZM12 3.6c2.7 0 3 0 4.1.1 2.7.1 4 1.4 4.1 4.1.1 1.1.1 1.4.1 4.2s0 3-.1 4.1c-.1 2.7-1.4 4-4.1 4.1-1.1.1-1.4.1-4.1.1s-3.1 0-4.2-.1c-2.7-.1-4-1.4-4.1-4.1C3.6 15 3.6 14.7 3.6 12s0-3.1.1-4.2c.1-2.7 1.4-4 4.1-4.1 1.1-.1 1.4-.1 4.2-.1ZM12 2c-2.7 0-3.1 0-4.2.1C4.2 2.2 2.2 4.2 2.1 7.8 2 8.9 2 9.3 2 12s0 3.1.1 4.2c.1 3.6 2.1 5.6 5.7 5.7 1.1.1 1.5.1 4.2.1s3.1 0 4.2-.1c3.6-.1 5.6-2.1 5.7-5.7.1-1.1.1-1.5.1-4.2s0-3.1-.1-4.2c-.1-3.6-2.1-5.6-5.7-5.7C15.1 2 14.7 2 12 2Z" /></S>
);
export const FacebookGlyph = (p: P) => (
  <S {...p}><path d="M13.5 21.9v-7.4h2.5l.4-2.9h-2.9V9.8c0-.8.2-1.4 1.4-1.4h1.5V5.8c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.1H8v2.9h2.5v7.4A10 10 0 1 1 13.5 21.9Z" /></S>
);
export const LinkedinGlyph = (p: P) => (
  <S {...p}><path d="M20.4 2H3.6C2.7 2 2 2.7 2 3.6v16.8c0 .9.7 1.6 1.6 1.6h16.8c.9 0 1.6-.7 1.6-1.6V3.6c0-.9-.7-1.6-1.6-1.6ZM8 18.5H5.2V9.6H8v8.9ZM6.6 8.4a1.6 1.6 0 1 1 0-3.3 1.6 1.6 0 0 1 0 3.3Zm11.9 10.1h-2.8v-4.3c0-1 0-2.4-1.4-2.4s-1.7 1.1-1.7 2.3v4.4H9.8V9.6h2.7v1.2c.4-.7 1.3-1.4 2.7-1.4 2.8 0 3.3 1.9 3.3 4.3v4.8Z" /></S>
);
export const XGlyph = (p: P) => (
  <S {...p}><path d="M17.8 3h3l-6.6 7.6L22 21h-6.1l-4.8-6.2L5.6 21h-3l7-8.1L2 3h6.2l4.3 5.7L17.8 3Zm-1 16.2h1.7L7.3 4.7H5.5l11.3 14.5Z" /></S>
);
export const TiktokGlyph = (p: P) => (
  <S {...p}><path d="M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.7a5.7 5.7 0 1 0 4.9 5.7V9.1a7.4 7.4 0 0 0 4.3 1.4V7.4a4.3 4.3 0 0 1-3.2-1.6Z" /></S>
);
export const YoutubeGlyph = (p: P) => (
  <S {...p}><path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z" /></S>
);
export const WhatsappGlyph = (p: P) => (
  <S {...p}><path d="M19.1 4.9A10 10 0 0 0 3.4 17l-1.4 5 5.1-1.3a10 10 0 0 0 4.9 1.2A10 10 0 0 0 19.1 4.9ZM12 20.2a8.3 8.3 0 0 1-4.2-1.2l-.3-.2-3 .8.8-3-.2-.3A8.3 8.3 0 1 1 12 20.2Zm4.6-6.2c-.3-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.6.1a6.8 6.8 0 0 1-3.4-3c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.7a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.6-.3Z" /></S>
);

export const socialGlyphs: Record<SocialKey, { label: string; Glyph: (p: P) => React.ReactElement }> = {
  instagram: { label: 'Instagram', Glyph: InstagramGlyph },
  facebook: { label: 'Facebook', Glyph: FacebookGlyph },
  linkedin: { label: 'LinkedIn', Glyph: LinkedinGlyph },
  x: { label: 'X (Twitter)', Glyph: XGlyph },
  tiktok: { label: 'TikTok', Glyph: TiktokGlyph },
  youtube: { label: 'YouTube', Glyph: YoutubeGlyph },
};
