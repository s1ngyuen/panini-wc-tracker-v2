'use client';

interface Props {
  activeTab: string;
  onChange: (tab: string) => void;
}

const TABS: { key: string; label: string }[] = [
  { key: 'all',      label: 'All Cards' },
  { key: 'core',     label: 'Core Collection' },
  { key: 'upgrades', label: 'Upgrade Cards' },
  { key: 'le',       label: 'Limited Edition' },
  { key: 'wcm',      label: 'WC Masters' },
  { key: 'special',  label: 'Special Cards' },
  { key: 'dupes',    label: 'Duplicates' },
];

export default function CollectionTabBar({ activeTab, onChange }: Props) {
  return (
    <div className="gen-tab-bar px-4" style={{ overflowX: 'auto', scrollbarWidth: 'none' }}>
      {TABS.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          className={`gen-tab${activeTab === key ? ' gen-tab--active' : ''}`}
          data-tab={key}
          aria-pressed={activeTab === key}
          onClick={() => onChange(key)}
        >
          <span className="btn-scrl">
            <span className="btn-scrl-inner">
              <span>{label}</span>
              <span>{label}</span>
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}
