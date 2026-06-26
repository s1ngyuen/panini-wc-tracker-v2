'use client';

import { useRef, useCallback } from 'react';

interface Props {
  src: string;
  children: React.ReactNode;
}

/**
 * Wraps `children` and shows a fixed-position zoomed card image that follows
 * the cursor on hover. Matches the v1 #card-zoom-tip DOM element behaviour —
 * the tip is fixed, cursor-tracked, and pointer-events: none.
 */
export default function CardZoomTip({ src, children }: Props) {
  const tipRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = useCallback(() => {
    const tip = tipRef.current;
    if (!tip) return;
    tip.style.display = 'block';
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const tip = tipRef.current;
    if (!tip) return;
    tip.style.left = `${e.clientX + 14}px`;
    tip.style.top = `${e.clientY + 14}px`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    const tip = tipRef.current;
    if (!tip) return;
    tip.style.display = 'none';
  }, []);

  return (
    <>
      <span
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ display: 'contents' }}
      >
        {children}
      </span>
      {/* Cursor-following zoom tip — matches #card-zoom-tip CSS in app.css */}
      <div
        ref={tipRef}
        style={{
          position: 'fixed',
          pointerEvents: 'none',
          zIndex: 9999,
          display: 'none',
          width: '160px',
          height: '224px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
          background: '#1a1a2e',
        }}
        aria-hidden="true"
      >
        <img
          src={src}
          alt=""
          width={160}
          height={224}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>
    </>
  );
}
