import React from 'react'
import { AlgorithmStep } from '../algorithm/types'

interface MatrixProps {
  step: AlgorithmStep
  cellSize?: number
  /** allow double-click editing (only before stepping starts) */
  editable?: boolean
  onCellToggle?: (i: number, j: number) => void
  /** tint cells red by score (higher = redder); off = uniform light tint (the score-30 color) */
  showGradient?: boolean
  /** when true, display values as cost matrix (already transformed) */
  isCostView?: boolean
}

/** soft rose heat color for like-scores in [0, 100] */
function scoreStyle(value: number): React.CSSProperties {
  if (value < 0) return {}
  const ratio = Math.min(value / 100, 1)
  const r = 255
  const g = Math.round(255 - ratio * 160)
  const b = Math.round(255 - ratio * 175)
  return {
    background: `rgb(${r}, ${g}, ${b})`,
    color: ratio > 0.55 ? '#881337' : 'var(--ink)',
    fontWeight: ratio > 0.55 ? 700 : 500,
  }
}

/** cost-matrix heat: lower cost = better = redder */
function costStyle(value: number, maxVal: number): React.CSSProperties {
  if (maxVal <= 0) return {}
  const ratio = Math.min(value / maxVal, 1)
  // invert: low cost = red, high cost = pale
  const inv = 1 - ratio
  const r = 255
  const g = Math.round(255 - inv * 160)
  const b = Math.round(255 - inv * 175)
  return {
    background: `rgb(${r}, ${g}, ${b})`,
    color: inv > 0.55 ? '#881337' : 'var(--ink)',
    fontWeight: inv > 0.55 ? 700 : 500,
  }
}

type HL = { ring: string; bg: string; fg?: string } | null

export const Matrix: React.FC<MatrixProps> = ({
  step,
  cellSize = 54,
  editable = false,
  onCellToggle,
  showGradient = false,
  isCostView = false,
}) => {
  const { matrix, type } = step
  const { values, rowLabels, colLabels, n, activeRows, activeCols } = matrix

  const cell = cellSize
  const gap = Math.max(4, Math.round(cellSize / 9))
  const labelW = Math.max(34, Math.round(cellSize * 0.75))
  const fontSize = Math.max(11, Math.round(cellSize * 0.28))
  const dbFontSize = Math.max(9, Math.round(cellSize * 0.22))
  const tagColW = Math.ceil(7.5 * (11 + String(n).length) + 20)
  const tagRowH = 26

  // max finite value for cost view scaling
  let maxVal = 0
  if (isCostView) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (values[i][j] > maxVal) maxVal = values[i][j]
      }
    }
  }

  const highlight = (i: number, j: number): HL => {
    if (!activeRows[i] || !activeCols[j]) return null

    // Hungarian algorithm highlights
    if (type === 'find_zeros' && step.zeroMatching) {
      const isMatched = step.zeroMatching.some((p) => p.i === i && p.j === j)
      if (isMatched) return { ring: 'var(--emerald)', bg: '#d1fae5', fg: '#065f46' }
      if (values[i][j] === 0) return { ring: 'transparent', bg: '#f0fdf4' }
    }

    if (type === 'cover_zeros') {
      const rCov = step.coveredRows?.[i]
      const cCov = step.coveredCols?.[j]
      if (rCov && cCov) return { ring: 'transparent', bg: '#e0e7ff' }
      if (rCov || cCov) return { ring: 'transparent', bg: '#fef3c7' }
    }

    if (type === 'find_delta') {
      const rCov = step.coveredRows?.[i]
      const cCov = step.coveredCols?.[j]
      if (!rCov && !cCov) {
        if (values[i][j] === step.delta) return { ring: '#f97316', bg: '#ffedd5', fg: '#9a3412' }
        return { ring: 'transparent', bg: '#fff7ed' }
      }
      if (rCov && cCov) return { ring: 'transparent', bg: '#e0e7ff' }
      return { ring: 'transparent', bg: '#f5f5f4' }
    }

    if (type === 'adjust_matrix') {
      const rCov = step.coveredRows?.[i]
      const cCov = step.coveredCols?.[j]
      if (!rCov && !cCov) return { ring: 'transparent', bg: '#dcfce7' }
      if (rCov && cCov) return { ring: 'transparent', bg: '#fee2e2' }
      return { ring: 'transparent', bg: '#f5f5f4' }
    }

    if (type === 'extract_pairs' && step.assignment) {
      const isAssigned = step.assignment.some((p) => p.i === i && p.j === j)
      if (isAssigned) {
        const origVal = step.matrix.values[i][j]
        if (origVal < 0) return { ring: '#dc2626', bg: '#fecaca', fg: '#991b1b' }
        return { ring: 'var(--emerald)', bg: '#d1fae5', fg: '#065f46' }
      }
    }

    if (type === 'complete' && step.assignment) {
      const isAssigned = step.assignment.some((p) => p.i === i && p.j === j)
      if (isAssigned) {
        const origVal = step.matrix.values[i][j]
        if (origVal < 0) return { ring: '#dc2626', bg: '#fecaca', fg: '#991b1b' }
        return { ring: 'var(--emerald)', bg: '#d1fae5', fg: '#065f46' }
      }
    }

    return null
  }

  const rowTag = (i: number): { text: string; strong: boolean; danger?: boolean } | null => {
    if (!activeRows[i]) return null
    if (type === 'reduce_rows' && step.rowMin) {
      return { text: `−${step.rowMin[i]}`, strong: false }
    }
    if (type === 'cover_zeros' && step.coveredRows) {
      return step.coveredRows[i] ? { text: 'covered', strong: true } : null
    }
    if (type === 'find_delta' && step.coveredRows) {
      return step.coveredRows[i] ? { text: 'covered', strong: true } : { text: 'uncovered', strong: false }
    }
    return null
  }

  const colTag = (j: number): { text: string; strong: boolean; danger?: boolean } | null => {
    if (!activeCols[j]) return null
    if (type === 'reduce_cols' && step.colMin) {
      return { text: `−${step.colMin[j]}`, strong: false }
    }
    if (type === 'cover_zeros' && step.coveredCols) {
      return step.coveredCols[j] ? { text: 'covered', strong: true } : null
    }
    if (type === 'find_delta' && step.coveredCols) {
      return step.coveredCols[j] ? { text: 'covered', strong: true } : { text: 'uncovered', strong: false }
    }
    return null
  }

  const rowHeaderStyle = (i: number): React.CSSProperties => {
    const covered = step.coveredRows?.[i]
    return {
      height: cell,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 700,
      fontSize: Math.max(11, Math.round(cellSize * 0.24)),
      borderRadius: 10,
      color: !activeRows[i] ? 'var(--ink-faint)' : covered ? '#b45309' : 'var(--indigo)',
      background: !activeRows[i]
        ? 'transparent'
        : covered
          ? 'var(--amber-soft)'
          : 'var(--indigo-soft)',
      textDecoration: !activeRows[i] ? 'line-through' : 'none',
      transition: 'all .25s ease',
    }
  }

  const colHeaderStyle = (j: number): React.CSSProperties => {
    const covered = step.coveredCols?.[j]
    return {
      width: cell,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 700,
      fontSize: Math.max(11, Math.round(cellSize * 0.24)),
      borderRadius: 10,
      color: !activeCols[j] ? 'var(--ink-faint)' : covered ? '#b45309' : 'var(--rose)',
      background: !activeCols[j]
        ? 'transparent'
        : covered
          ? 'var(--amber-soft)'
          : 'var(--rose-soft)',
      textDecoration: !activeCols[j] ? 'line-through' : 'none',
      transition: 'all .25s ease',
    }
  }

  const isDBCell = (v: number): boolean => !isCostView && v < 0

  return (
    <div className="no-scrollbar" style={{ overflowX: 'auto', padding: 4, WebkitOverflowScrolling: 'touch' }}>
      <div style={{ width: 'max-content', margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
          gridTemplateColumns: `${labelW}px repeat(${n}, ${cell}px) ${tagColW}px`,
          gridTemplateRows: `34px repeat(${n}, ${cell}px) ${tagRowH}px`,
          gap,
          alignItems: 'center',
        }}
      >
        {/* corner */}
        <div />
        {/* column headers */}
        {colLabels.map((cj) => (
          <div key={`ch-${cj}`} style={colHeaderStyle(cj)}>
            G{cj + 1}
          </div>
        ))}
        <div />

        {/* rows */}
        {rowLabels.map((ri) => {
          const tag = rowTag(ri)
          return (
            <React.Fragment key={`r-${ri}`}>
              <div style={rowHeaderStyle(ri)}>B{ri + 1}</div>
              {colLabels.map((cj) => {
                const v = values[ri][cj]
                const removed = !activeRows[ri] || !activeCols[cj]
                const hl = highlight(ri, cj)
                const isDB = isDBCell(v)
                const style: React.CSSProperties = {
                  width: cell,
                  height: cell,
                  borderRadius: Math.max(8, Math.round(cellSize * 0.22)),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize,
                  fontVariantNumeric: 'tabular-nums',
                  ...(removed
                    ? {
                        background: '#f5f5f4',
                        color: 'var(--ink-faint)',
                        textDecoration: 'line-through',
                      }
                    : isDB
                      ? { color: '#a8a29e', fontWeight: 600, fontSize: dbFontSize, letterSpacing: 0.5 }
                      : isCostView
                        ? costStyle(v, maxVal)
                        : showGradient
                          ? scoreStyle(v)
                          : scoreStyle(30)),
                  ...(hl
                    ? {
                        background: hl.bg,
                        color: hl.fg ?? 'var(--ink)',
                        fontWeight: 700,
                        boxShadow: hl.ring !== 'transparent' ? `0 0 0 3px ${hl.ring}` : 'none',
                      }
                    : {}),
                }
                return (
                  <div
                    key={`c-${ri}-${cj}`}
                    className={`cell ${removed ? 'cell-removed' : ''} ${isDB && !removed ? 'cell-db' : ''} ${
                      hl && hl.ring !== 'transparent' ? 'cell-hl' : ''
                    }`}
                    style={{ ...style, ...(editable && !removed ? { cursor: 'pointer' } : {}) }}
                    onDoubleClick={editable && !removed ? () => onCellToggle?.(ri, cj) : undefined}
                    title={editable && !removed ? 'Double-click to toggle deal-breaker' : undefined}
                  >
                    {isDB ? 'DB' : v}
                  </div>
                )
              })}
              {/* row annotation */}
              <div style={{ paddingLeft: 6 }}>
                {tag && (
                  <span
                    className="step-enter"
                    key={`${type}-${ri}`}
                    style={{
                      display: 'inline-block',
                      fontSize: 12,
                      fontFamily: 'ui-monospace, monospace',
                      padding: '3px 8px',
                      borderRadius: 8,
                      whiteSpace: 'nowrap',
                      background: tag.danger ? '#fee2e2' : tag.strong ? '#fef3c7' : '#f5f5f4',
                      color: tag.danger ? '#b91c1c' : tag.strong ? '#92400e' : 'var(--ink-soft)',
                      fontWeight: tag.strong ? 700 : 500,
                      boxShadow: tag.danger
                        ? '0 0 0 1.5px #fca5a5'
                        : tag.strong
                          ? '0 0 0 1.5px #fcd34d'
                          : 'none',
                    }}
                  >
                    {tag.text}
                  </span>
                )}
              </div>
            </React.Fragment>
          )
        })}

        {/* column annotations */}
        <div />
        {colLabels.map((cj) => {
          const tag = colTag(cj)
          return (
            <div key={`ca-${cj}`} style={{ textAlign: 'center', paddingTop: 2 }}>
              {tag && (
                <span
                  className="step-enter"
                  key={`${type}-${cj}`}
                  style={{
                    display: 'inline-block',
                    fontSize: 11,
                    fontFamily: 'ui-monospace, monospace',
                    padding: '2px 6px',
                    borderRadius: 7,
                    whiteSpace: 'nowrap',
                    background: tag.danger ? '#fee2e2' : tag.strong ? '#fef3c7' : '#f5f5f4',
                    color: tag.danger ? '#b91c1c' : tag.strong ? '#92400e' : 'var(--ink-soft)',
                    fontWeight: tag.strong ? 700 : 500,
                    boxShadow: tag.danger
                      ? '0 0 0 1.5px #fca5a5'
                      : tag.strong
                        ? '0 0 0 1.5px #fcd34d'
                        : 'none',
                  }}
                >
                  {tag.text}
                </span>
              )}
            </div>
          )
        })}
        <div />
        </div>
      </div>
    </div>
  )
}
