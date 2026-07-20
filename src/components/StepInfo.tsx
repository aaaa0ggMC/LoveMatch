import React from 'react'
import { StepType } from '../algorithm/types'
import { PhaseIcon } from './PhaseIcon'

interface StepInfoProps {
  type: StepType
  phaseTitle: string
  description: string
  totalScore: number
}

const phaseBadge: Partial<Record<StepType, { label: string; color: string; bg: string }>> = {
  scan_db: { label: 'DEAL-BREAKER MODE', color: '#b45309', bg: '#fef3c7' },
  select_db_line: { label: 'DEAL-BREAKER MODE', color: '#b45309', bg: '#fef3c7' },
  select_db_cell: { label: 'DEAL-BREAKER MODE', color: '#b45309', bg: '#fef3c7' },
  scan_best_values: { label: 'REGRET MODE', color: '#6d28d9', bg: '#ede9fe' },
  calc_regret: { label: 'REGRET MODE', color: '#6d28d9', bg: '#ede9fe' },
  select_regret: { label: 'REGRET MODE', color: '#6d28d9', bg: '#ede9fe' },
  commit_pair: { label: 'MATCHED', color: '#be123c', bg: '#ffe4e6' },
  skip_line: { label: 'UNMATCHABLE', color: '#b91c1c', bg: '#fee2e2' },
  complete: { label: 'DONE', color: '#047857', bg: '#d1fae5' },
  infeasible: { label: 'FAILED', color: '#b91c1c', bg: '#fee2e2' },
}

export const StepInfo: React.FC<StepInfoProps> = ({ type, phaseTitle, description, totalScore }) => {
  const badge = phaseBadge[type]
  return (
    <div className="step-enter" key={`${type}-${phaseTitle}-${description}`}>
      <div className="stepinfo-card">
        <PhaseIcon type={type} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: -0.2 }}>{phaseTitle}</span>
            {badge && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: 1,
                  padding: '3px 8px',
                  borderRadius: 6,
                  color: badge.color,
                  background: badge.bg,
                }}
              >
                {badge.label}
              </span>
            )}
          </div>
          <p style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--ink-soft)', marginTop: 4 }}>
            {description}
          </p>
        </div>
        <div className="stepinfo-score">
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: 'var(--ink-faint)' }}>
            TOTAL SCORE
          </div>
          <div
            style={{
              fontSize: 26,
              fontWeight: 800,
              fontVariantNumeric: 'tabular-nums',
              color: totalScore > 0 ? 'var(--rose)' : 'var(--ink)',
              lineHeight: 1.15,
            }}
          >
            {totalScore}
          </div>
        </div>
      </div>
    </div>
  )
}
