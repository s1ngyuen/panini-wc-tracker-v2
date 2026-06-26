'use client';

import { useEffect, useState } from 'react';

const CACHE_KEY = 'wc26_scores';
const CACHE_TTL = 5 * 60 * 1000; // 5 min

const STATIC = 'WORLD CUP 2026 · PANINI · ADRENALYN XL · FWC2026 · COLLECTION TRACKER · SWAPPA · ';

export default function BottomTicker() {
  const [text, setText] = useState(STATIC.repeat(20));

  useEffect(() => {
    (async () => {
      try {
        const raw = sessionStorage.getItem(CACHE_KEY);
        const cached = raw ? JSON.parse(raw) : null;
        let scores: string[];

        if (cached && Date.now() - cached.ts < CACHE_TTL) {
          scores = cached.scores;
        } else {
          const data = await fetch(
            'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard'
          ).then(r => r.json());

          scores = ((data.events ?? []) as Record<string, unknown>[]).flatMap(ev => {
            const comp = (ev.competitions as Record<string, unknown>[])?.[0] ?? {};
            const comps = (comp.competitors ?? []) as Record<string, unknown>[];
            const home = comps.find(c => c.homeAway === 'home');
            const away = comps.find(c => c.homeAway === 'away');
            if (!home || !away) return [];
            const detail = ((ev.status as Record<string, unknown>)?.type as Record<string, unknown>)?.shortDetail ?? '';
            const ht = (home.team as Record<string, string>)?.shortDisplayName ?? '';
            const at = (away.team as Record<string, string>)?.shortDisplayName ?? '';
            const hs = String(home.score ?? '');
            const as2 = String(away.score ?? '');
            return [`${ht} ${hs}–${as2} ${at}${detail ? ' (' + detail + ')' : ''}`];
          });

          sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), scores }));
        }

        if (scores.length > 0) {
          const chunk = "TODAY'S SCORES · " + scores.join(' · ') + ' · ';
          setText(chunk.repeat(20));
        }
      } catch {
        // keep static fallback
      }
    })();
  }, []);

  return (
    <div className="bottom-ticker">
      <span className="bottom-ticker__inner">{text}</span>
    </div>
  );
}
