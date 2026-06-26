'use client';

import { signIn } from 'next-auth/react';

// Google logo SVG — inline so we have no external image dependency.
function GoogleLogo() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width="20"
      height="20"
      aria-hidden="true"
    >
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 2.9l5.7-5.7C34.3 6.4 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.9z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.1 8 2.9l5.7-5.7C34.3 6.4 29.5 4 24 4 16.3 4 9.7 8.4 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.3 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8H5.9C9.3 35.5 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.2 5.2C40.9 36 44 30.4 44 24c0-1.3-.1-2.7-.4-3.9z" />
    </svg>
  );
}

export default function LoginPage() {
  return (
    <div
      className="gate-login"
      style={{
        /* Override the gate-login animation — the gate animation played in v1 via the
           password gate. In v2 the login page is always visible, so we skip the delay. */
        opacity: 1,
        animation: 'none',
        position: 'relative',
        minHeight: 'calc(100dvh - 72px)',
        inset: 'unset',
        zIndex: 'unset',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
      }}
    >
      {/* Logo */}
      <img
        src="/assets/wc26-logo.png"
        alt="World Cup 2026 Adrenalyn XL"
        width={160}
        height={90}
        className="gate-logo"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = 'none';
        }}
      />

      {/* App name */}
      <h1
        className="page-title"
        style={{ fontSize: 'clamp(40px, 10vw, 72px)', textAlign: 'center', marginBottom: 8 }}
      >
        Swappa
      </h1>

      {/* Tagline */}
      <p
        className="section-sub"
        style={{
          marginBottom: 40,
          textAlign: 'center',
          display: 'block',
          transform: 'none',
        }}
      >
        Track your Panini WC 2026 Adrenalyn XL collection
      </p>

      {/* Sign in form */}
      <div className="gate-form">
        <p className="gate-form__hint">
          Sign in to save your collection and swap with friends.
        </p>

        <button
          type="button"
          className="btn-primary w-full"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            height: 48,
            fontSize: 15,
            width: '100%',
          }}
          onClick={() => signIn('google', { callbackUrl: '/collection' })}
        >
          <GoogleLogo />
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
