import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/auth';
import { getDb } from '@/db';
import { pending_trades } from '@/db/schema';
import type { Trade, TradeItem } from '@/types';

// ── PATCH /api/trades/[id] ────────────────────────────────────────────────────
// Partial update of a pending trade.
// Body: { offering?: TradeItem[]; requesting?: TradeItem[]; trade_with?: string }
// Returns 404 if trade not found or belongs to another user.
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  const tradeId = params.id;

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
    trade_with,
  } = body as { offering?: unknown; requesting?: unknown; trade_with?: unknown };

  // Validate any provided array fields
  const isValidItems = (items: unknown[]): items is TradeItem[] =>
    items.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as Record<string, unknown>).cardId === 'string' &&
        typeof (item as Record<string, unknown>).count  === 'number',
    );

  if (offering !== undefined) {
    if (!Array.isArray(offering) || !isValidItems(offering)) {
      return NextResponse.json(
        { error: 'offering must be an array of { cardId: string; count: number }' },
        { status: 400 },
      );
    }
  }
  if (requesting !== undefined) {
    if (!Array.isArray(requesting) || !isValidItems(requesting)) {
      return NextResponse.json(
        { error: 'requesting must be an array of { cardId: string; count: number }' },
        { status: 400 },
      );
    }
  }
  if (trade_with !== undefined && trade_with !== null && typeof trade_with !== 'string') {
    return NextResponse.json(
      { error: 'trade_with must be a string or null' },
      { status: 400 },
    );
  }

  // Build the partial update object — only include fields that were provided
  const updateFields: Record<string, unknown> = {};
  if (offering   !== undefined) updateFields.offering   = offering;
  if (requesting !== undefined) updateFields.requesting = requesting;
  if (trade_with !== undefined) {
    updateFields.trade_with =
      typeof trade_with === 'string' && trade_with.trim() !== ''
        ? trade_with.trim()
        : null;
  }

  if (Object.keys(updateFields).length === 0) {
    return NextResponse.json(
      { error: 'No valid fields provided for update' },
      { status: 400 },
    );
  }

  const [updated] = await getDb()
    .update(pending_trades)
    .set(updateFields)
    .where(
      and(
        eq(pending_trades.id,      tradeId),
        eq(pending_trades.user_id, userId),
      ),
    )
    .returning();

  if (!updated) {
    return NextResponse.json({ error: 'Trade not found' }, { status: 404 });
  }

  const trade: Trade = {
    id:         updated.id,
    trade_with: updated.trade_with,
    offering:   updated.offering   as TradeItem[],
    requesting: updated.requesting as TradeItem[],
    created_at: updated.created_at.toISOString(),
  };

  return NextResponse.json(trade);
}

// ── DELETE /api/trades/[id] ───────────────────────────────────────────────────
// Deletes a pending trade owned by the authenticated user.
// Returns 404 if trade not found or belongs to another user.
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  const tradeId = params.id;

  const [deleted] = await getDb()
    .delete(pending_trades)
    .where(
      and(
        eq(pending_trades.id,      tradeId),
        eq(pending_trades.user_id, userId),
      ),
    )
    .returning({ id: pending_trades.id });

  if (!deleted) {
    return NextResponse.json({ error: 'Trade not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
