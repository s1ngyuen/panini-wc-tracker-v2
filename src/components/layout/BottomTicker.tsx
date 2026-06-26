'use client';

import { useEffect, useState } from 'react';

const CACHE_KEY = 'wc26_scores';
const CACHE_TTL = 5 * 60 * 1000;

const FALLBACK = [
  'WORLD CUP 2026', 'PANINI', 'ADRENALYN XL', 'FWC2026',
  'COLLECTION TRACKER', 'SWAPPA', 'TRADE YOUR DUPES',
];

function TickerRun({ scores }: { scores: string[] }) {
  const items = scores.length ? scores : FALLBACK;
  const hasScores = scores.length > 0;

  return (
    <>
      {hasScores && (
        <>
          <span className="tk-w">TODAY&apos;S SCORES</span>
          <span className="tk-w"> · </span>
        </>
      )}
      {items.flatMap((text, i) => [
        <span key={i} className={i % 2 === 0 ? 'tk-g' : 'tk-w'}>{text}</span>,
        <span key={`s${i}`} className="tk-w"> · </span>,
      ])}
    </>
  );
}

export default function BottomTicker() {
  const [scores, setScores] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const raw    = sessionStorage.getItem(CACHE_KEY);
        const cached = raw ? JSON.parse(raw) : null;
        let fetched: string[];

        if (cached && Date.now() - cached.ts < CACHE_TTL) {
          fetched = cached.scores;
        } else {
          const data = await fetch(
            'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard'
          ).then(r => r.json());

          fetched = ((data.events ?? []) as Record<string, unknown>[]).flatMap(ev => {
            const comp   = (ev.competitions as Record<string, unknown>[])?.[0] ?? {};
            const comps  = (comp.competitors ?? []) as Record<string, unknown>[];
            const home   = comps.find(c => c.homeAway === 'home');
            const away   = comps.find(c => c.homeAway === 'away');
            if (!home || !away) return [];
            const detail = ((ev.status as Record<string, unknown>)?.type as Record<string, unknown>)?.shortDetail ?? '';
            const ht     = (home.team as Record<string, string>)?.shortDisplayName ?? '';
            const at     = (away.team as Record<string, string>)?.shortDisplayName ?? '';
            const hs     = String(home.score ?? '');
            const as2    = String(away.score ?? '');
            return [`${ht} ${hs}–${as2} ${at}${detail ? ' (' + detail + ')' : ''}`];
          });

          sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), scores: fetched }));
        }

        setScores(fetched);
      } catch { /* keep fallback */ }
    })();
  }, []);

  // 20 repeats for seamless loop
  return (
    <div className="bottom-ticker">
      <span className="bottom-ticker__inner">
        {Array.from({ length: 20 }, (_, i) => <TickerRun key={i} scores={scores} />)}
      </span>
    </div>
  );
}
