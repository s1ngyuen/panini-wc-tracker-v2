import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { eq, desc } from 'drizzle-orm';
import { auth } from '@/auth';
import { getDb } from '@/db';
import { pending_trades } from '@/db/schema';
import type { Trade, TradeItem } from '@/types';

// ── GET /api/trades ───────────────────────────────────────────────────────────
// Returns all pending trades for the authenticated user, newest first.
export async function GET(): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  const rows = await getDb()
    .select()
    .from(pending_trades)
    .where(eq(pending_trades.user_id, userId))
    .orderBy(desc(pending_trades.created_at));

  const trades: Trade[] = rows.map((row) => ({
    id:         row.id,
    trade_with: row.trade_with,
    offering:   row.offering   as TradeItem[],
    requesting: row.requesting as TradeItem[],
    created_at: row.created_at.toISOString(),
  }));

  return NextResponse.json(trades);
}

// ── POST /api/trades ──────────────────────────────────────────────────────────
// Creates a new pending trade.
// Body: { offering: TradeItem[]; requesting: TradeItem[]; trade_with?: string }
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

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const {
    offering,
    requesting,
    trade_with = null,
  } = body as { offering?: unknown; requesting?: unknown; trade_with?: string };

  if (!Array.isArray(offering) || !Array.isArray(requesting)) {
    return NextResponse.json(
      { error: 'offering and requesting must be arrays' },
      { status: 400 },
    );
  }

  if (offering.length === 0 && requesting.length === 0) {
    return NextResponse.json(
      { error: 'At least one of offering or requesting must have items' },
      { status: 400 },
    );
  }

  // Validate each TradeItem has the expected shape
  const isValidItems = (items: unknown[]): items is TradeItem[] =>
    items.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as Record<string, unknown>).cardId === 'string' &&
        typeof (item as Record<string, unknown>).count  === 'number',
    );

  if (!isValidItems(offering) || !isValidItems(requesting)) {
    return NextResponse.json(
      { error: 'Each trade item must be { cardId: string; count: number }' },
      { status: 400 },
    );
  }

  const tradeWith = typeof trade_with === 'string' && trade_with.trim() !== ''
    ? trade_with.trim()
    : null;

  const [created] = await getDb()
    .insert(pending_trades)
    .values({
      user_id:    userId,
      offering,
      requesting,
      trade_with: tradeWith,
    })
    .returning();

  const trade: Trade = {
    id:         created.id,
    trade_with: created.trade_with,
    offering:   created.offering   as TradeItem[],
    requesting: created.requesting as TradeItem[],
    created_at: created.created_at.toISOString(),
  };

  return NextResponse.json(trade, { status: 201 });
}
