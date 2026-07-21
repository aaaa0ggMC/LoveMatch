import React, { useRef, useState } from 'react'
import { OptimalResult } from '../algorithm/km'
import { PairList } from './PairList'

interface InformationProps {
  n: number
  matrix: number[][]
  optimal: OptimalResult
  greedyScore: number
  greedyMatched: number
  onImport: (matrix: number[][]) => void
}

const cardStyle: React.CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--line)',
  borderRadius: 16,
  padding: '14px 16px',
  boxShadow: '0 1px 3px rgba(28,25,23,0.05)',
}

const cardTitle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: 1,
  color: 'var(--ink-faint)',
}

/** parse an imported matrix file: a bare 2-D array, or an object with a
 *  "matrix" field (the app's own export format). Negative = deal-breaker. */
export function parseMatrixJson(text: string): number[][] {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('Not valid JSON.')
  }
  const m = Array.isArray(data) ? data : (data as { matrix?: unknown })?.matrix
  if (!Array.isArray(m) || m.length === 0) {
    throw new Error('Expected a 2-D array, or an object with a "matrix" field.')
  }
  const n = m.length
  if (n < 3 || n > 11) throw new Error(`Matrix size must be between 3 and 11 (got ${n}).`)
  for (const row of m) {
    if (!Array.isArray(row) || row.length !== n) {
      throw new Error(`Matrix must be square: ${n} rows require ${n} columns each.`)
    }
    for (const v of row) {
      if (typeof v !== 'number' || !Number.isFinite(v)) {
        throw new Error('Every cell must be a finite number (negative = deal-breaker).')
      }
    }
  }
  return (m as number[][]).map((r) => [...r])
}

export const Information: React.FC<InformationProps> = ({
  n,
  matrix,
  optimal,
  greedyScore,
  greedyMatched,
  onImport,
}) => {
  const fileRef = useRef<HTMLInputElement>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [importNotice, setImportNotice] = useState<string | null>(null)

  const gap = optimal.totalScore - greedyScore
  const pct = optimal.totalScore > 0 ? Math.round((greedyScore / optimal.totalScore) * 100) : 100

  const handleExport = () => {
    const payload = { n, matrix }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `love-match-${n}x${n}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleFile = (file: File) => {
    setImportNotice(null)
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const m = parseMatrixJson(String(reader.result))
        onImport(m)
        setImportError(null)
        setImportNotice(`Imported a ${m.length} × ${m.length} matrix.`)
      } catch (err) {
        setImportNotice(null)
        setImportError(err instanceof Error ? err.message : 'Failed to import matrix.')
      }
    }
    reader.onerror = () => {
      setImportNotice(null)
      setImportError('Failed to read the file.')
    }
    reader.readAsText(file)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* ---------- theoretical max score vs greedy ---------- */}
      <div style={{ ...cardStyle, display: 'flex', gap: 18, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={cardTitle}>THEORETICAL MAX SCORE (KM OPTIMUM)</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6, flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: 38,
                fontWeight: 800,
                fontVariantNumeric: 'tabular-nums',
                color: 'var(--emerald)',
                lineHeight: 1.1,
              }}
            >
              {optimal.totalScore}
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: 1,
                padding: '3px 8px',
                borderRadius: 6,
                color: optimal.perfect ? '#047857' : '#b45309',
                background: optimal.perfect ? '#d1fae5' : '#fef3c7',
              }}
            >
              {optimal.perfect ? 'PERFECT MATCHING' : `${optimal.pairs.length} / ${n} PAIRS MAX`}
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-faint)', marginTop: 6, lineHeight: 1.5 }}>
            Best achievable total like-score, precomputed with the Kuhn–Munkres algorithm.
            {!optimal.perfect && ' No perfect matching exists — some people must stay unmatched.'}
          </div>
        </div>

        <div style={{ paddingLeft: 18, borderLeft: '1px solid var(--line)', minWidth: 170 }}>
          <div style={cardTitle}>GREEDY RESULT</div>
          <div
            style={{
              fontSize: 26,
              fontWeight: 800,
              fontVariantNumeric: 'tabular-nums',
              color: greedyScore > 0 ? 'var(--rose)' : 'var(--ink)',
              lineHeight: 1.3,
              marginTop: 6,
            }}
          >
            {greedyScore}
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
            {greedyMatched} / {n} pairs · {pct}% of optimal
          </div>
          <div style={{ fontSize: 12, marginTop: 6, fontWeight: 600, color: gap > 0 ? '#b45309' : '#047857' }}>
            {gap > 0 ? `Greedy leaves ${gap} points on the table` : 'Greedy reaches the optimum!'}
          </div>
        </div>
      </div>

      <div className="layout-grid" style={{ marginTop: 0 }}>
        {/* ---------- optimal pairs ---------- */}
        <div>
          {optimal.pairs.length > 0 ? (
            <PairList pairs={optimal.pairs} n={n} />
          ) : (
            <div style={{ ...cardStyle, color: 'var(--ink-faint)', fontSize: 13, textAlign: 'center', padding: 24 }}>
              No valid pairs at all — every cell is a deal-breaker.
            </div>
          )}
        </div>

        {/* ---------- import / export ---------- */}
        <div style={cardStyle}>
          <div style={{ ...cardTitle, marginBottom: 10 }}>MATRIX DATA</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              onClick={handleExport}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 11,
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                fontSize: 13,
                fontWeight: 700,
                fontFamily: 'inherit',
                color: '#fff',
                background: 'linear-gradient(135deg, #34d399, var(--emerald))',
                boxShadow: '0 3px 10px rgba(16,185,129,0.3)',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v12" />
                <path d="M7 10l5 5 5-5" />
                <path d="M5 21h14" />
              </svg>
              Export matrix
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 11,
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                fontSize: 13,
                fontWeight: 600,
                fontFamily: 'inherit',
                color: 'var(--ink-soft)',
                background: 'var(--surface)',
                boxShadow: 'inset 0 0 0 1.5px var(--line)',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 15V3" />
                <path d="M7 8l5-5 5 5" />
                <path d="M5 21h14" />
              </svg>
              Import matrix
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".json,application/json"
              style={{ display: 'none' }}
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handleFile(f)
                e.target.value = ''
              }}
            />
          </div>

          {importError && (
            <div
              style={{
                marginTop: 10,
                fontSize: 12,
                lineHeight: 1.5,
                color: '#b91c1c',
                background: '#fee2e2',
                borderRadius: 9,
                padding: '8px 10px',
              }}
            >
              {importError}
            </div>
          )}
          {importNotice && (
            <div
              style={{
                marginTop: 10,
                fontSize: 12,
                lineHeight: 1.5,
                color: '#047857',
                background: '#d1fae5',
                borderRadius: 9,
                padding: '8px 10px',
              }}
            >
              {importNotice}
            </div>
          )}

          <div style={{ fontSize: 11, color: 'var(--ink-faint)', marginTop: 12, lineHeight: 1.6 }}>
            JSON format: <code>{'{ "n": 3, "matrix": [[...], ...] }'}</code> or a bare 2-D array.
            Negative cells are deal-breakers. Size 3–11.
          </div>
        </div>
      </div>
    </div>
  )
}
