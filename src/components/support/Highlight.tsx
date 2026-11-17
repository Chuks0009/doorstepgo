import { Fragment } from 'react';

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Split a free-text query into lowercase search terms (min 2 chars). */
export const searchTerms = (q: string) =>
  q
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.replace(/[^\p{L}\p{N}'’-]/gu, ''))
    .filter((t) => t.length >= 2);

/** Wraps every occurrence of the search terms in <mark>. */
export function Highlight({ text, terms }: { text: string; terms: string[] }) {
  if (!terms.length) return <>{text}</>;
  const re = new RegExp(`(${terms.map(escape).sort((a, b) => b.length - a.length).join('|')})`, 'gi');
  const parts = text.split(re);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="rounded-[4px] bg-go-100 px-0.5 text-go-800 [box-decoration-break:clone]">{p}</mark>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  );
}
