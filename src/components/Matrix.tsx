import React from 'react'
import { AlgorithmStep } from '../algorithm/types'

interface MatrixProps {
  step: AlgorithmStep
  cellSize?: number
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

type HL = { ring: string; bg: string; fg?: string } | null

export const Matrix: React.FC<MatrixProps> = ({ step, cellSize = 54 }) => {
  const { matrix, type } = step
  const { values, rowLabels, colLabels, n, activeRows, activeCols } = matrix

  const cell = cellSize
  const gap = Math.max(4, Math.round(cellSize / 9))
  const labelW = Math.max(34, Math.round(cellSize * 0.75))
  const fontSize = Math.max(11, Math.round(cellSize * 0.28))
  const dbFontSize = Math.max(9, Math.round(cellSize * 0.22))

  const highlight = (i: number, j: number): HL => {
    if (!activeRows[i] || !activeCols[j]) return null
    const cc = step.chosenCell

    if (type === 'commit_pair' && cc && cc.i === i && cc.j === j)
      return { ring: 'var(--emerald)', bg: '#d1fae5', fg: '#065f46' }
    if (type === 'select_db_cell' && cc && cc.i === i && cc.j === j)
      return { ring: '#f97316', bg: '#ffedd5', fg: '#9a3412' }
    if (type === 'select_regret' && cc && cc.i === i && cc.j === j)
      return { ring: 'var(--violet)', bg: '#ede9fe', fg: '#5b21b6' }
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

  const rowTag = (i: number): { text: string; strong: boolean; danger?: boolean } | null => {
    if (!activeRows[i]) return null
    if ((type === 'scan_db' || type === 'select_db_line') && step.rowDB)
      return {
        text: `DB ×${step.rowDB[i]}`,
        strong:
          type === 'select_db_line' &&
          step.chosenLine?.kind === 'row' &&
          step.chosenLine.index === i,
      }
    if (type === 'skip_line' && step.rowDB && step.chosenLine?.kind === 'row' && step.chosenLine.index === i)
      return { text: `DB ×${step.rowDB[i]} — skip`, strong: true, danger: true }
    if (type === 'scan_best_values' && step.best1 && step.best2)
      return { text: `${step.best1[i]} − ${step.best2[i]}`, strong: false }
    if (type === 'calc_regret' && step.regret) return { text: `R = ${step.regret[i]}`, strong: false }
    if (type === 'select_regret' && step.regret)
      return { text: `R = ${step.regret[i]}`, strong: i === step.chosenRow }
    return null
  }

  const colTag = (j: number): { text: string; strong: boolean; danger?: boolean } | null => {
    if (!activeCols[j]) return null
    if ((type === 'scan_db' || type === 'select_db_line') && step.colDB)
      return {
        text: `DB ×${step.colDB[j]}`,
        strong:
          type === 'select_db_line' &&
          step.chosenLine?.kind === 'col' &&
          step.chosenLine.index === j,
      }
    if (type === 'skip_line' && step.colDB && step.chosenLine?.kind === 'col' && step.chosenLine.index === j)
      return { text: `DB ×${step.colDB[j]} — skip`, strong: true, danger: true }
    return null
  }

  const rowHeaderStyle = (i: number): React.CSSProperties => {
    const chosen =
      (type === 'select_db_line' || type === 'skip_line') &&
      step.chosenLine?.kind === 'row' &&
      step.chosenLine.index === i
    const danger = chosen && type === 'skip_line'
    return {
      height: cell,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 700,
      fontSize: Math.max(11, Math.round(cellSize * 0.24)),
      borderRadius: 10,
      color: !activeRows[i] ? 'var(--ink-faint)' : danger ? '#b91c1c' : chosen ? '#b45309' : 'var(--indigo)',
      background: !activeRows[i]
        ? 'transparent'
        : danger
          ? '#fee2e2'
          : chosen
            ? 'var(--amber-soft)'
            : 'var(--indigo-soft)',
      textDecoration: !activeRows[i] ? 'line-through' : 'none',
      transition: 'all .25s ease',
    }
  }

  const colHeaderStyle = (j: number): React.CSSProperties => {
    const chosen =
      (type === 'select_db_line' || type === 'skip_line') &&
      step.chosenLine?.kind === 'col' &&
      step.chosenLine.index === j
    const danger = chosen && type === 'skip_line'
    return {
      width: cell,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 700,
      fontSize: Math.max(11, Math.round(cellSize * 0.24)),
      borderRadius: 10,
      color: !activeCols[j] ? 'var(--ink-faint)' : danger ? '#b91c1c' : chosen ? '#b45309' : 'var(--rose)',
      background: !activeCols[j]
        ? 'transparent'
        : danger
          ? '#fee2e2'
          : chosen
            ? 'var(--amber-soft)'
            : 'var(--rose-soft)',
      textDecoration: !activeCols[j] ? 'line-through' : 'none',
      transition: 'all .25s ease',
    }
  }

  return (
    <div style={{ overflowX: 'auto', padding: 4 }}>
      <div
        style={{
          display: 'inline-grid',
          gridTemplateColumns: `${labelW}px repeat(${n}, ${cell}px) minmax(96px, auto)`,
          gridTemplateRows: `34px repeat(${n}, ${cell}px) auto`,
          gap,
          alignItems: 'center',
        }}
      >
        {/* corner */}
        <div />
        {/* column headers */}
        {colLabels.map((cj) => (
          <div key={`ch-${cj}`} style={colHeaderStyle(cj)}>
            G{cj}
          </div>
        ))}
        <div />

        {/* rows */}
        {rowLabels.map((ri) => {
          const tag = rowTag(ri)
          return (
            <React.Fragment key={`r-${ri}`}>
              <div style={rowHeaderStyle(ri)}>B{ri}</div>
              {colLabels.map((cj) => {
                const v = values[ri][cj]
                const removed = !activeRows[ri] || !activeCols[cj]
                const hl = highlight(ri, cj)
                const isDB = v < 0
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
                      : scoreStyle(v)),
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
                    style={style}
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
  )
}
