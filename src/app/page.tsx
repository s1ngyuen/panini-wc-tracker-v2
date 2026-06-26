'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';

const TICK = 'WORLD CUP 2026 · PANINI · ADRENALYN XL · FWC26 · COLLECTION TRACKER · SWAPPA · ';
const TICKER_TEXT = TICK.repeat(6);

function LandingContent() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [signing, setSigning] = useState(false);

  const callbackUrl = searchParams.get('callbackUrl') ?? '/collection';

  useEffect(() => {
    if (status === 'authenticated') {
      router.push(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  function handleSignIn() {
    setSigning(true);
    signIn('google', { callbackUrl });
  }

  return (
    <div id="password-gate">
      {/* Ticker intro */}
      <div className="gate-intro">
        <div className="gate-ticker">
          <div className="gate-ticker__track">
            <span className="gate-ticker__inner">{TICKER_TEXT}</span>
          </div>
          <div className="gate-ticker__track gate-ticker__track--rtl">
            <span className="gate-ticker__inner">{TICKER_TEXT}</span>
          </div>
          <div className="gate-ticker__track">
            <span className="gate-ticker__inner">{TICKER_TEXT}</span>
          </div>
        </div>
        <div className="gate-sweep" />
      </div>

      {/* Sign-in panel — fades in after sweep */}
      <div className="gate-login">
        <img
          src="/assets/wc26-logo.png"
          alt="World Cup 2026 Adrenalyn XL"
          className="gate-logo"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
        />
        <div className="gate-form">
          <p className="gate-form__hint">Track your Panini WC 2026 Adrenalyn XL collection</p>
          <button
            type="button"
            className="btn-primary"
            style={{ width: '100%', marginTop: '16px', height: '48px', fontSize: '14px' }}
            onClick={handleSignIn}
            disabled={signing || status === 'loading'}
          >
            {signing ? 'Signing in…' : 'Sign in with Google'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <Suspense>
      <LandingContent />
    </Suspense>
  );
}
