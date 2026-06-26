'use client';

import { useState } from 'react';

interface FilterState {
  country: string;
  cardType: string;
  status: string;
}

interface Props {
  title?: string;
  teams: string[];
  cardTypes: string[];
  onChange: (filter: FilterState) => void;
}

const STATUS_OPTIONS: [string, string][] = [
  ['', 'All Cards'],
  ['owned', 'Owned'],
  ['missing', 'Missing'],
  ['duplicates', 'Duplicates'],
];

export default function FilterBar({ title, teams, cardTypes, onChange }: Props) {
  const [filter, setFilter] = useState<FilterState>({ country: '', cardType: '', status: '' });

  const hasActiveFilter = !!(filter.country || filter.cardType || filter.status);

  function update(patch: Partial<FilterState>) {
    const next = { ...filter, ...patch };
    setFilter(next);
    onChange(next);
  }

  function clear() {
    const reset: FilterState = { country: '', cardType: '', status: '' };
    setFilter(reset);
    onChange(reset);
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {title && (
        <span className="filter-section-title">{title}</span>
      )}

      <label htmlFor="filter-team" className="sr-only">Filter by team</label>
      <select
        id="filter-team"
        className="filter-select"
        aria-label="Filter by team"
        value={filter.country}
        onChange={e => update({ country: e.target.value })}
      >
        <option value="">All Teams</option>
        {teams.map(team => (
          <option key={team} value={team}>{team}</option>
        ))}
      </select>

      <label htmlFor="filter-type" className="sr-only">Filter by card type</label>
      <select
        id="filter-type"
        className="filter-select"
        aria-label="Filter by card type"
        value={filter.cardType}
        onChange={e => update({ cardType: e.target.value })}
      >
        <option value="">All Types</option>
        {cardTypes.map(type => (
          <option key={type} value={type}>{type}</option>
        ))}
      </select>

      <label htmlFor="filter-status" className="sr-only">Filter by status</label>
      <select
        id="filter-status"
        className="filter-select"
        aria-label="Filter by status"
        value={filter.status}
        onChange={e => update({ status: e.target.value })}
      >
        {STATUS_OPTIONS.map(([val, label]) => (
          <option key={val} value={val}>{label}</option>
        ))}
      </select>

      {hasActiveFilter && (
        <button
          type="button"
          className="btn-secondary text-sm px-3 py-2"
          aria-label="Clear all filters"
          onClick={clear}
        >
          Clear
        </button>
      )}
    </div>
  );
}
