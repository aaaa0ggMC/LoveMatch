import React from 'react'
import { StepType } from '../algorithm/types'

const paths: Record<StepType, React.ReactNode> = {
  init: (
    <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" strokeLinejoin="round" />
  ),
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
  complete: (
    <path d="M4 12.5l5 5L20 6.5" strokeLinecap="round" strokeLinejoin="round" />
  ),
  infeasible: (
    <>
      <path
        d="M12 3 2.5 20h19z"
        strokeLinejoin="round"
      />
      <path d="M12 10v4" strokeLinecap="round" />
      <circle cx="12" cy="16.8" r="0.4" fill="currentColor" />
    </>
  ),
}

const tones: Record<StepType, { fg: string; bg: string }> = {
  init: { fg: 'var(--ink-soft)', bg: '#f5f5f4' },
  scan_db: { fg: 'var(--amber)', bg: 'var(--amber-soft)' },
  select_db_line: { fg: 'var(--amber)', bg: 'var(--amber-soft)' },
  select_db_cell: { fg: '#ea580c', bg: '#fff7ed' },
  scan_best_values: { fg: 'var(--indigo)', bg: 'var(--indigo-soft)' },
  calc_regret: { fg: 'var(--violet)', bg: 'var(--violet-soft)' },
  select_regret: { fg: 'var(--violet)', bg: 'var(--violet-soft)' },
  commit_pair: { fg: 'var(--rose)', bg: 'var(--rose-soft)' },
  remove_rowcol: { fg: 'var(--ink-faint)', bg: '#f5f5f4' },
  skip_line: { fg: '#dc2626', bg: '#fef2f2' },
  remove_line: { fg: 'var(--ink-faint)', bg: '#f5f5f4' },
  complete: { fg: 'var(--emerald)', bg: 'var(--emerald-soft)' },
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
