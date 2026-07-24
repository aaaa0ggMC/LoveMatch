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
  init: { label: 'SETUP', color: 'var(--ink-soft)', bg: '#f5f5f4' },
  init_cost: { label: 'PRE-PROCESSING', color: '#0369a1', bg: '#e0f2fe' },
  reduce_rows: { label: 'REDUCTION', color: '#7c3aed', bg: '#ede9fe' },
  reduce_cols: { label: 'REDUCTION', color: '#7c3aed', bg: '#ede9fe' },
  find_zeros: { label: 'MATCHING', color: '#059669', bg: '#d1fae5' },
  cover_zeros: { label: 'COVERING', color: '#d97706', bg: '#fef3c7' },
  find_delta: { label: 'ADJUSTMENT', color: '#ea580c', bg: '#ffedd5' },
  adjust_matrix: { label: 'ADJUSTMENT', color: '#ea580c', bg: '#ffedd5' },
  extract_pairs: { label: 'EXTRACTION', color: '#be123c', bg: '#ffe4e6' },
  complete: { label: 'DONE', color: '#047857', bg: '#d1fae5' },
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
