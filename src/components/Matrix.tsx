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
function scoreStyle(value: number, gradient: boolean): React.CSSProperties {
  if (value < 0) return {}
  if (!gradient) {
    return { background: 'rgb(255, 223, 228)', color: 'var(--ink)', fontWeight: 500 }
  }
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
function costStyle(value: number, maxVal: number, gradient: boolean): React.CSSProperties {
  if (!gradient) {
    return { background: 'rgb(255, 223, 228)', color: 'var(--ink)', fontWeight: 500 }
  }
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

    // ---------- Hungarian algorithm highlights ----------

    // find_max: highlight the maximum value cell
    if (type === 'find_max' && step.maxPos) {
      if (step.maxPos.i === i && step.maxPos.j === j)
        return { ring: 'var(--emerald)', bg: '#d1fae5', fg: '#065f46' }
    }

    // build_cost: show the max position
    if (type === 'build_cost' && step.maxPos) {
      if (step.maxPos.i === i && step.maxPos.j === j)
        return { ring: 'var(--emerald)', bg: '#d1fae5', fg: '#065f46' }
    }

    // scan_row_min / reduce_row: highlight each row's minimum cell
    if (type === 'scan_row_min' || type === 'reduce_row') {
      if (step.rowMin && values[i][j] === step.rowMin[i])
        return { ring: '#f97316', bg: '#ffedd5', fg: '#9a3412' }
    }

    // scan_col_min / reduce_col: highlight each col's minimum cell
    if (type === 'scan_col_min' || type === 'reduce_col') {
      if (step.colMin && values[i][j] === step.colMin[j])
        return { ring: '#f97316', bg: '#ffedd5', fg: '#9a3412' }
    }

    // find_zeros: highlight matched zeros
    if (type === 'find_zeros' && step.zeroMatching) {
      const isMatched = step.zeroMatching.some((p) => p.i === i && p.j === j)
      if (isMatched) return { ring: 'var(--emerald)', bg: '#d1fae5', fg: '#065f46' }
      if (values[i][j] === 0) return { ring: 'transparent', bg: '#f0fdf4' }
    }

    // cover_zeros: show covered lines
    if (type === 'cover_zeros') {
      const rCov = step.coveredRows?.[i]
      const cCov = step.coveredCols?.[j]
      if (rCov && cCov) return { ring: 'transparent', bg: '#e0e7ff' }
      if (rCov || cCov) return { ring: 'transparent', bg: '#fef3c7' }
    }

    // find_delta: highlight uncovered region and delta cell
    if (type === 'find_delta') {
      const rCov = step.coveredRows?.[i]
      const cCov = step.coveredCols?.[j]
      if (!rCov && !cCov) {
        if (values[i][j] === step.delta)
          return { ring: '#f97316', bg: '#ffedd5', fg: '#9a3412' }
        return { ring: 'transparent', bg: '#fff7ed' }
      }
      if (rCov && cCov) return { ring: 'transparent', bg: '#e0e7ff' }
      return { ring: 'transparent', bg: '#f5f5f4' }
    }

    // adjust_matrix: show what happened to each cell
    if (type === 'adjust_matrix') {
      const rCov = step.coveredRows?.[i]
      const cCov = step.coveredCols?.[j]
      if (!rCov && !cCov) return { ring: 'transparent', bg: '#dcfce7' } // uncovered: −δ
      if (rCov && cCov) return { ring: 'transparent', bg: '#fee2e2' } // doubly covered: +δ
      return { ring: 'transparent', bg: '#f5f5f4' } // singly covered: unchanged
    }

    // extract_pairs / complete: highlight final assignment
    if ((type === 'extract_pairs' || type === 'complete') && step.assignment) {
      const isAssigned = step.assignment.some((p) => p.i === i && p.j === j)
      if (isAssigned) {
        const origVal = step.matrix.values[i][j]
        if (origVal < 0) return { ring: '#dc2626', bg: '#fecaca', fg: '#991b1b' }
        return { ring: 'var(--emerald)', bg: '#d1fae5', fg: '#065f46' }
      }
    }

    // ---------- Greedy baseline highlights ----------
    const cc = step.chosenCell
    if (type === 'commit_pair' && cc && cc.i === i && cc.j === j)
      return { ring: 'var(--emerald)', bg: '#d1fae5', fg: '#065f46' }
    if (type === 'select_db_cell' && cc && cc.i === i && cc.j === j)
      return { ring: '#f97316', bg: '#ffedd5', fg: '#9a3412' }
    if (type === 'select_regret' && cc && cc.i === i && cc.j === j)
      return { ring: 'var(--violet)', bg: '#ede9fe', fg: '#5b21b6' }
    if (type === 'select_regret' && step.chosenRegretLine) {
      const cl = step.chosenRegretLine
      if ((cl.kind === 'row' && cl.index === i) || (cl.kind === 'col' && cl.index === j))
        return { ring: 'transparent', bg: 'var(--violet-soft)' }
    }
    if (type === 'select_db_line' && step.chosenLine) {
      const cl = step.chosenLine
      if ((cl.kind === 'row' && cl.index === i) || (cl.kind === 'col' && cl.index === j))
        return { ring: 'transparent', bg: 'var(--amber-soft)' }
    }
    if (type === 'skip_line' && step.chosenLine) {
      const cl = step.chosenLine
      if ((cl.kind === 'row' && cl.index === i) || (cl.kind === 'col' && cl.index === j))
        return { ring: '#dc2626', bg: '#fecaca', fg: '#991b1b' }
    }

    return null
  }

  /** number of feasible (non-DB) entries left in row i / column j */
  const rowEntries = (i: number): number => {
    let c = 0
    for (let j = 0; j < n; j++) if (activeCols[j] && values[i][j] >= 0) c++
    return c
  }
  const colEntries = (j: number): number => {
    let c = 0
    for (let i = 0; i < n; i++) if (activeRows[i] && values[i][j] >= 0) c++
    return c
  }

  const rowTag = (i: number): { text: string; strong: boolean; danger?: boolean } | null => {
    if (!activeRows[i]) return null

    // Hungarian tags
    if ((type === 'scan_row_min' || type === 'reduce_row') && step.rowMin) {
      return { text: `min = ${step.rowMin[i]}`, strong: type === 'reduce_row' }
    }
    if (type === 'cover_zeros' && step.coveredRows) {
      return step.coveredRows[i] ? { text: 'covered', strong: true } : null
    }
    if (type === 'find_delta' && step.coveredRows) {
      return step.coveredRows[i] ? { text: 'covered', strong: true } : { text: 'uncovered', strong: false }
    }

    // Greedy tags
    if ((type === 'scan_db' || type === 'select_db_line') && step.rowDB) {
      const candR = type === 'select_db_line' ? step.candidateRegretRow?.[i] : null
      return {
        text: candR != null ? `DB ×${step.rowDB[i]} · R=${candR}` : `DB ×${step.rowDB[i]}`,
        strong:
          type === 'select_db_line' &&
          step.chosenLine?.kind === 'row' &&
          step.chosenLine.index === i,
      }
    }
    if (type === 'skip_line' && step.rowDB && step.chosenLine?.kind === 'row' && step.chosenLine.index === i)
      return { text: `DB ×${step.rowDB[i]} — skip`, strong: true, danger: true }
    if (type === 'scan_best_values' && step.best1 && step.best2)
      return { text: `${step.best1[i]} − ${rowEntries(i) <= 1 ? '∅' : step.best2[i]}`, strong: false }
    if (type === 'calc_regret' && step.regret) return { text: `R = ${step.regret[i]}`, strong: false }
    if (type === 'select_regret' && step.regret)
      return {
        text: `R = ${step.regret[i]}`,
        strong: step.chosenRegretLine?.kind === 'row' && step.chosenRegretLine.index === i,
      }
    return null
  }

  const colTag = (j: number): { text: string; strong: boolean; danger?: boolean } | null => {
    if (!activeCols[j]) return null

    // Hungarian tags
    if ((type === 'scan_col_min' || type === 'reduce_col') && step.colMin) {
      return { text: `min = ${step.colMin[j]}`, strong: type === 'reduce_col' }
    }
    if (type === 'cover_zeros' && step.coveredCols) {
      return step.coveredCols[j] ? { text: 'covered', strong: true } : null
    }
    if (type === 'find_delta' && step.coveredCols) {
      return step.coveredCols[j] ? { text: 'covered', strong: true } : { text: 'uncovered', strong: false }
    }

    // Greedy tags
    if ((type === 'scan_db' || type === 'select_db_line') && step.colDB) {
      const candR = type === 'select_db_line' ? step.candidateRegretCol?.[j] : null
      return {
        text: candR != null ? `DB ×${step.colDB[j]} · R=${candR}` : `DB ×${step.colDB[j]}`,
        strong:
          type === 'select_db_line' &&
          step.chosenLine?.kind === 'col' &&
          step.chosenLine.index === j,
      }
    }
    if (type === 'skip_line' && step.colDB && step.chosenLine?.kind === 'col' && step.chosenLine.index === j)
      return { text: `DB ×${step.colDB[j]} — skip`, strong: true, danger: true }
    if (type === 'scan_best_values' && step.colBest1 && step.colBest2)
      return { text: `${step.colBest1[j]} − ${colEntries(j) <= 1 ? '∅' : step.colBest2[j]}`, strong: false }
    if (type === 'calc_regret' && step.regretCol) return { text: `R = ${step.regretCol[j]}`, strong: false }
    if (type === 'select_regret' && step.regretCol)
      return {
        text: `R = ${step.regretCol[j]}`,
        strong: step.chosenRegretLine?.kind === 'col' && step.chosenRegretLine.index === j,
      }
    return null
  }

  const rowHeaderStyle = (i: number): React.CSSProperties => {
    const covered = step.coveredRows?.[i]
    const chosen =
      (type === 'select_db_line' || type === 'skip_line') &&
      step.chosenLine?.kind === 'row' &&
      step.chosenLine.index === i
    const danger = chosen && type === 'skip_line'
    const isCurrent = false
    return {
      height: cell,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 700,
      fontSize: Math.max(11, Math.round(cellSize * 0.24)),
      borderRadius: 10,
      color: !activeRows[i]
        ? 'var(--ink-faint)'
        : danger
          ? '#b91c1c'
          : covered || isCurrent
            ? '#b45309'
            : chosen
              ? '#b45309'
              : 'var(--indigo)',
      background: !activeRows[i]
        ? 'transparent'
        : danger
          ? '#fee2e2'
          : covered || isCurrent
            ? 'var(--amber-soft)'
            : chosen
              ? 'var(--amber-soft)'
              : 'var(--indigo-soft)',
      textDecoration: !activeRows[i] ? 'line-through' : 'none',
      transition: 'all .25s ease',
    }
  }

  const colHeaderStyle = (j: number): React.CSSProperties => {
    const covered = step.coveredCols?.[j]
    const chosen =
      (type === 'select_db_line' || type === 'skip_line') &&
      step.chosenLine?.kind === 'col' &&
      step.chosenLine.index === j
    const danger = chosen && type === 'skip_line'
    const isCurrent = false
    return {
      width: cell,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 700,
      fontSize: Math.max(11, Math.round(cellSize * 0.24)),
      borderRadius: 10,
      color: !activeCols[j]
        ? 'var(--ink-faint)'
        : danger
          ? '#b91c1c'
          : covered || isCurrent
            ? '#b45309'
            : chosen
              ? '#b45309'
              : 'var(--rose)',
      background: !activeCols[j]
        ? 'transparent'
        : danger
          ? '#fee2e2'
          : covered || isCurrent
            ? 'var(--amber-soft)'
            : chosen
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
                        ? costStyle(v, maxVal, showGradient)
                        : scoreStyle(v, showGradient)),
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
