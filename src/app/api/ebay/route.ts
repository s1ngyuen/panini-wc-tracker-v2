import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

// Proxy for eBay Finding API — avoids CORS by running server-side.
// Body: { appId: string; query: string }
export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: { appId?: string; query?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ price: null });
  }

  const { appId, query } = body;
  if (!appId || !query) return NextResponse.json({ price: null });

  const params = new URLSearchParams({
    'OPERATION-NAME':                   'findCompletedItems',
    'SERVICE-VERSION':                  '1.0.0',
    'SECURITY-APPNAME':                 appId,
    'RESPONSE-DATA-FORMAT':             'JSON',
    'keywords':                         query,
    'itemFilter(0).name':               'SoldItemsOnly',
    'itemFilter(0).value':              'true',
    'sortOrder':                        'EndTimeSoonest',
    'paginationInput.entriesPerPage':   '8',
  });

  try {
    const res  = await fetch(
      `https://svcs.ebay.com/services/search/FindingService/v1?${params}`,
      { next: { revalidate: 0 } }
    );
    const data = await res.json();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items: any[] =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (data?.findCompletedItemsResponse as any[])?.[0]
        ?.searchResult?.[0]?.item ?? [];

    const prices: number[] = items
      .map(i => parseFloat(String(i?.sellingStatus?.[0]?.currentPrice?.[0]?.['__value__'] ?? '0')))
      .filter((p: number) => p > 0);

    const avg = prices.length
      ? prices.reduce((a, b) => a + b, 0) / prices.length
      : null;

    const currency = String(
      items[0]?.sellingStatus?.[0]?.currentPrice?.[0]?.['@currencyId'] ?? 'AUD'
    );

    return NextResponse.json({ price: avg ? Math.round(avg * 100) / 100 : null, currency });
  } catch {
    return NextResponse.json({ price: null });
  }
}
