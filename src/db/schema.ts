import {
  pgTable,
  text,
  integer,
  jsonb,
  timestamp,
  unique,
  boolean,
  primaryKey,
  uuid,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// ── users ─────────────────────────────────────────────────────────────────────
// id is text (not uuid) to match the NextAuth DrizzleAdapter which writes text IDs.
// The default generates a UUID string via gen_random_uuid().
export const users = pgTable('users', {
  id:            text('id').primaryKey().default(sql`gen_random_uuid()`),
  email:         text('email').notNull().unique(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  name:          text('name'),
  image:         text('image'),
  created_at:    timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ── NextAuth adapter tables ───────────────────────────────────────────────────
// Defined inline because @auth/drizzle-adapter does not expose its helpers via
// a package subpath export. Shapes must match DefaultPostgresSchema in the adapter.

export const accounts = pgTable(
  'account',
  {
    userId:            text('userId')
                         .notNull()
                         .references(() => users.id, { onDelete: 'cascade' }),
    type:              text('type').notNull(),
    provider:          text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token:     text('refresh_token'),
    access_token:      text('access_token'),
    expires_at:        integer('expires_at'),
    token_type:        text('token_type'),
    scope:             text('scope'),
    id_token:          text('id_token'),
    session_state:     text('session_state'),
  },
  (account) => ({
    compositePk: primaryKey({ columns: [account.provider, account.providerAccountId] }),
  }),
);

export const sessions = pgTable('session', {
  sessionToken: text('sessionToken').primaryKey(),
  userId:       text('userId')
                  .notNull()
                  .references(() => users.id, { onDelete: 'cascade' }),
  expires:      timestamp('expires', { mode: 'date' }).notNull(),
});

export const verificationTokens = pgTable(
  'verificationToken',
  {
    identifier: text('identifier').notNull(),
    token:      text('token').notNull(),
    expires:    timestamp('expires', { mode: 'date' }).notNull(),
  },
  (vt) => ({
    compositePk: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);

export const authenticators = pgTable(
  'authenticator',
  {
    credentialID:         text('credentialID').notNull().unique(),
    userId:               text('userId')
                            .notNull()
                            .references(() => users.id, { onDelete: 'cascade' }),
    providerAccountId:    text('providerAccountId').notNull(),
    credentialPublicKey:  text('credentialPublicKey').notNull(),
    counter:              integer('counter').notNull(),
    credentialDeviceType: text('credentialDeviceType').notNull(),
    credentialBackedUp:   boolean('credentialBackedUp').notNull(),
    transports:           text('transports'),
  },
  (auth) => ({
    compositePK: primaryKey({ columns: [auth.userId, auth.credentialID] }),
  }),
);

// ── card_counts ───────────────────────────────────────────────────────────────
// One row per (user, card). Rows with count 0 are deleted, not stored.
// card_id is text to handle numeric core cards ("42") and bonus IDs ("LE-001", "DB1").
export const card_counts = pgTable('card_counts', {
  id:         uuid('id').primaryKey().defaultRandom(),
  user_id:    text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  card_id:    text('card_id').notNull(),
  count:      integer('count').notNull().default(0),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  unq: unique().on(t.user_id, t.card_id),
}));

// ── pending_trades ────────────────────────────────────────────────────────────
export const pending_trades = pgTable('pending_trades', {
  id:         uuid('id').primaryKey().defaultRandom(),
  user_id:    text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  offering:   jsonb('offering').notNull(),    // TradeItem[] — { cardId: string; count: number }[]
  requesting: jsonb('requesting').notNull(),  // TradeItem[] — { cardId: string; count: number }[]
  trade_with: text('trade_with'),             // partner display name — nullable
  proposed:   boolean('proposed').notNull().default(false),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
