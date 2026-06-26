import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { eq, and, sql, count } from 'drizzle-orm';
import { auth } from '@/auth';
import { getDb } from '@/db';
import { card_counts } from '@/db/schema';
import type { CollectionMap } from '@/types';

// ── GET /api/collection ───────────────────────────────────────────────────────
// Returns the user's full collection as a flat map: { [cardId]: count }
export async function GET(): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  const rows = await getDb()
    .select({ card_id: card_counts.card_id, count: card_counts.count })
    .from(card_counts)
    .where(eq(card_counts.user_id, userId));

  const collection: CollectionMap = {};
  for (const row of rows) {
    collection[row.card_id] = row.count;
  }

  return NextResponse.json(collection);
}

// ── PATCH /api/collection ─────────────────────────────────────────────────────
// Upserts a single card count, or deletes the row when count <= 0.
// Body: { cardId: string; count: number }
export async function PATCH(req: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (
    typeof body !== 'object' ||
    body === null ||
    typeof (body as Record<string, unknown>).cardId !== 'string' ||
    typeof (body as Record<string, unknown>).count  !== 'number'
  ) {
    return NextResponse.json(
      { error: 'Body must be { cardId: string; count: number }' },
      { status: 400 },
    );
  }

  const { cardId, count: newCount } = body as { cardId: string; count: number };

  if (newCount <= 0) {
    await getDb()
      .delete(card_counts)
      .where(and(eq(card_counts.user_id, userId), eq(card_counts.card_id, cardId)));
    return NextResponse.json({ cardId, count: 0 });
  }

  await getDb()
    .insert(card_counts)
    .values({ user_id: userId, card_id: cardId, count: newCount })
    .onConflictDoUpdate({
      target: [card_counts.user_id, card_counts.card_id],
      set: {
        count:      newCount,
        updated_at: sql`now()`,
      },
    });

  return NextResponse.json({ cardId, count: newCount });
}

// ── POST /api/collection ──────────────────────────────────────────────────────
// Bulk import from localStorage migration. One-time only — guarded by a 409
// if the user already has data in card_counts.
// Body: { collection: { [cardId: string]: number } }
export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (
    typeof body !== 'object' ||
    body === null ||
    typeof (body as Record<string, unknown>).collection !== 'object' ||
    (body as Record<string, unknown>).collection === null
  ) {
    return NextResponse.json(
      { error: 'Body must be { collection: { [cardId: string]: number } }' },
      { status: 400 },
    );
  }

  const collection = (body as { collection: CollectionMap }).collection;

  // 409 guard: reject if the user already has any card data
  const [{ value: existing }] = await getDb()
    .select({ value: count() })
    .from(card_counts)
    .where(eq(card_counts.user_id, userId));

  if (existing > 0) {
    return NextResponse.json(
      { error: 'Collection already exists — use PATCH to update individual cards.' },
      { status: 409 },
    );
  }

  // Build insert rows, skipping cards with count <= 0
  const rows = Object.entries(collection)
    .filter(([, c]) => c > 0)
    .map(([cardId, c]) => ({ user_id: userId, card_id: cardId, count: c }));

  if (rows.length === 0) {
    return NextResponse.json({ imported: 0 });
  }

  // Single batched insert inside an implicit transaction (neon-http)
  await getDb().insert(card_counts).values(rows);

  return NextResponse.json({ imported: rows.length }, { status: 201 });
}
