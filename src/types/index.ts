export type CollectionMap = Record<string, number>;

export interface TradeItem {
  cardId: string;
  count:  number;
}

export interface Trade {
  id:         string;
  trade_with: string | null;
  offering:   TradeItem[];
  requesting: TradeItem[];
  proposed:   boolean;
  created_at: string; // ISO timestamp string
}
