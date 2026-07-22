import React from 'react'
import { Pair } from '../algorithm/types'

interface PairListProps {
  pairs: Pair[]
  n: number
}

const Heart: React.FC<{ size?: number; beat?: boolean }> = ({ size = 13, beat }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="var(--rose)"
    className={beat ? 'heart-beat' : undefined}
    style={{ display: 'inline-block', flexShrink: 0 }}
  >
    <path d="M12 21s-7.5-4.8-9.8-9.2C.8 8.9 2.6 5 6.1 5c2.1 0 3.8 1.3 5.9 3.7C14.1 6.3 15.8 5 17.9 5c3.5 0 5.3 3.9 3.9 6.8C19.5 16.2 12 21 12 21z" />
  </svg>
)

export const PairList: React.FC<PairListProps> = ({ pairs, n }) => {
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--line)',
        borderRadius: 16,
        padding: '14px 16px',
        boxShadow: '0 1px 3px rgba(28,25,23,0.05)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: 'var(--ink-faint)' }}>
          MATCHED PAIRS
        </span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--ink-soft)',
            background: '#f5f5f4',
            borderRadius: 20,
            padding: '2px 9px',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {pairs.length} / {n}
        </span>
      </div>

      {pairs.length === 0 ? (
        <div
          style={{
            border: '1.5px dashed var(--line)',
            borderRadius: 12,
            padding: '18px 12px',
            textAlign: 'center',
            color: 'var(--ink-faint)',
            fontSize: 12.5,
          }}
        >
          No matches yet — step through the algorithm
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {pairs.map((p, idx) => (
            <div
              key={`${p.boy}-${p.girl}`}
              className="chip-in"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '7px 10px',
                borderRadius: 10,
                background: idx === pairs.length - 1 ? 'var(--rose-soft)' : '#fafaf9',
                border: `1px solid ${idx === pairs.length - 1 ? '#fecdd3' : 'var(--line)'}`,
                fontSize: 13,
              }}
            >
              <span
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 6,
                  background: 'var(--indigo-soft)',
                  color: 'var(--indigo)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 11,
                }}
              >
                B{p.boy + 1}
              </span>
              <Heart beat={idx === pairs.length - 1} />
              <span
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 6,
                  background: 'var(--rose-soft)',
                  color: 'var(--rose)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 11,
                }}
              >
                G{p.girl + 1}
              </span>
              <span
                style={{
                  marginLeft: 'auto',
                  fontFamily: 'ui-monospace, monospace',
                  fontWeight: 700,
                  fontSize: 12,
                  color: 'var(--ink-soft)',
                  background: '#f5f5f4',
                  padding: '2px 8px',
                  borderRadius: 6,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                +{p.score}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
