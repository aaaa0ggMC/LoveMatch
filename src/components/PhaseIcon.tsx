import React from 'react'
import { StepType } from '../algorithm/types'

const paths: Record<StepType, React.ReactNode> = {
  // Hungarian
  init: (
    <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" strokeLinejoin="round" />
  ),
  find_max: (
    <>
      <path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.2l5.9-.9z" strokeLinejoin="round" />
    </>
  ),
  build_cost: (
    <>
      <path d="M4 4h16v16H4z" strokeLinejoin="round" />
      <path d="M9 9h6v6H9z" strokeLinejoin="round" />
      <path d="M12 4v5M12 15v5M4 12h5M15 12h5" strokeLinecap="round" />
    </>
  ),
  scan_row_min: (
    <>
      <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
      <circle cx="9" cy="12" r="2.2" fill="currentColor" stroke="none" />
    </>
  ),
  reduce_row: (
    <>
      <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
      <path d="M8 6v12M16 6v12" strokeLinecap="round" opacity="0.4" />
    </>
  ),
  scan_col_min: (
    <>
      <path d="M6 4v16M12 4v16M18 4v16" strokeLinecap="round" />
      <circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none" />
    </>
  ),
  reduce_col: (
    <>
      <path d="M6 4v16M12 4v16M18 4v16" strokeLinecap="round" />
      <path d="M6 8h12M6 16h12" strokeLinecap="round" opacity="0.4" />
    </>
  ),
  find_zeros: (
    <>
      <circle cx="8" cy="8" r="3" />
      <circle cx="16" cy="16" r="3" />
      <path d="M11 11l-2 2M13 13l2-2" strokeLinecap="round" />
    </>
  ),
  cover_zeros: (
    <>
      <path d="M4 4h16v16H4z" strokeLinejoin="round" />
      <path d="M4 12h16M12 4v16" strokeLinecap="round" />
    </>
  ),
  find_delta: (
    <>
      <path d="M12 3v18M3 12h18" strokeLinecap="round" />
      <circle cx="12" cy="12" r="4" />
    </>
  ),
  adjust_matrix: (
    <>
      <path d="M4 4h16v16H4z" strokeLinejoin="round" />
      <path d="M8 12h8M12 8v8" strokeLinecap="round" />
    </>
  ),
  extract_pairs: (
    <path
      d="M12 20s-7-4.5-9-9c-1.2-2.7.5-6 3.5-6 2 0 3.5 1.2 5.5 3.5C14 6.2 15.5 5 17.5 5c3 0 4.7 3.3 3.5 6-2 4.5-9 9-9 9z"
      strokeLinejoin="round"
    />
  ),
  complete: (
    <path d="M4 12.5l5 5L20 6.5" strokeLinecap="round" strokeLinejoin="round" />
  ),

  // Greedy baseline
  scan_db: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
      <path d="M8 11h6M11 8v6" strokeLinecap="round" />
    </>
  ),
  select_db_line: (
    <>
      <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
      <circle cx="9" cy="12" r="2.2" fill="currentColor" stroke="none" />
    </>
  ),
  select_db_cell: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
    </>
  ),
  skip_line: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M6 6l12 12" strokeLinecap="round" />
    </>
  ),
  remove_line: (
    <>
      <path d="M4 7h16M4 12h16M4 17h10" strokeLinecap="round" opacity="0.45" />
      <path d="M15 17h6" strokeLinecap="round" strokeWidth="2.4" />
    </>
  ),
  scan_best_values: (
    <path d="M4 7h16M4 12h11M4 17h7" strokeLinecap="round" />
  ),
  calc_regret: (
    <path d="M5 19V9m7 10V5m7 14v-8" strokeLinecap="round" />
  ),
  select_regret: (
    <path
      d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z"
      strokeLinejoin="round"
    />
  ),
  commit_pair: (
    <path
      d="M12 20s-7-4.5-9-9c-1.2-2.7.5-6 3.5-6 2 0 3.5 1.2 5.5 3.5C14 6.2 15.5 5 17.5 5c3 0 4.7 3.3 3.5 6-2 4.5-9 9-9 9z"
      strokeLinejoin="round"
    />
  ),
  remove_rowcol: (
    <>
      <path d="M5 5l14 14M19 5L5 19" strokeLinecap="round" />
    </>
  ),
  infeasible: (
    <>
      <path d="M12 3 2.5 20h19z" strokeLinejoin="round" />
      <path d="M12 10v4" strokeLinecap="round" />
      <circle cx="12" cy="16.8" r="0.4" fill="currentColor" />
    </>
  ),
}

const tones: Record<StepType, { fg: string; bg: string }> = {
  // Hungarian
  init: { fg: 'var(--ink-soft)', bg: '#f5f5f4' },
  find_max: { fg: '#0369a1', bg: '#e0f2fe' },
  build_cost: { fg: '#0369a1', bg: '#e0f2fe' },
  scan_row_min: { fg: '#7c3aed', bg: '#ede9fe' },
  reduce_row: { fg: '#7c3aed', bg: '#ede9fe' },
  scan_col_min: { fg: '#7c3aed', bg: '#ede9fe' },
  reduce_col: { fg: '#7c3aed', bg: '#ede9fe' },
  find_zeros: { fg: '#059669', bg: '#d1fae5' },
  cover_zeros: { fg: '#d97706', bg: '#fef3c7' },
  find_delta: { fg: '#ea580c', bg: '#ffedd5' },
  adjust_matrix: { fg: '#ea580c', bg: '#ffedd5' },
  extract_pairs: { fg: 'var(--rose)', bg: 'var(--rose-soft)' },
  complete: { fg: 'var(--emerald)', bg: 'var(--emerald-soft)' },

  // Greedy baseline
  scan_db: { fg: 'var(--amber)', bg: 'var(--amber-soft)' },
  select_db_line: { fg: 'var(--amber)', bg: 'var(--amber-soft)' },
  select_db_cell: { fg: '#ea580c', bg: '#fff7ed' },
  skip_line: { fg: '#dc2626', bg: '#fef2f2' },
  remove_line: { fg: 'var(--ink-faint)', bg: '#f5f5f4' },
  scan_best_values: { fg: 'var(--indigo)', bg: 'var(--indigo-soft)' },
  calc_regret: { fg: 'var(--violet)', bg: 'var(--violet-soft)' },
  select_regret: { fg: 'var(--violet)', bg: 'var(--violet-soft)' },
  commit_pair: { fg: 'var(--rose)', bg: 'var(--rose-soft)' },
  remove_rowcol: { fg: 'var(--ink-faint)', bg: '#f5f5f4' },
  infeasible: { fg: '#dc2626', bg: '#fef2f2' },
}

export const PhaseIcon: React.FC<{ type: StepType; size?: number }> = ({ type, size = 22 }) => {
  const tone = tones[type]
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size + 16,
        height: size + 16,
        borderRadius: 12,
        background: tone.bg,
        color: tone.fg,
        flexShrink: 0,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        {paths[type]}
      </svg>
    </span>
  )
}
