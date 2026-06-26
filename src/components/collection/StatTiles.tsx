interface Props {
  total: number;
  unique: number;
  pending: number;
  need: number;
  dupes: number;
  value: string; // formatted price string e.g. "AU$42.50" or "—"
}

export default function StatTiles({ total, unique, pending, need, dupes, value }: Props) {
  return (
    <div className="collection-stat-tiles">
      <div className="cst-tile">
        <span className="cst-tile__num cst-total">{total}</span>
        <span className="cst-tile__label">Total cards</span>
      </div>
      <div className="cst-tile">
        <span className="cst-tile__num cst-unique">{unique}</span>
        <span className="cst-tile__label">Unique</span>
      </div>
      <div className="cst-tile">
        <span className="cst-tile__num cst-pending">{pending}</span>
        <span className="cst-tile__label">Pending trade</span>
      </div>
      <div className="cst-tile">
        <span className="cst-tile__num cst-need">{need}</span>
        <span className="cst-tile__label">Still need</span>
      </div>
      <div className="cst-tile">
        <span className="cst-tile__num cst-dupe">{dupes}</span>
        <span className="cst-tile__label">Duplicates</span>
      </div>
      <div className="cst-tile">
        <span className="cst-tile__num cst-value">{value}</span>
        <span className="cst-tile__label">Est. Value</span>
      </div>
    </div>
  );
}
