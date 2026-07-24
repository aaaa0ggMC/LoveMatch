import React from 'react'

const items: { swatch: React.CSSProperties; label: string }[] = [
  {
    swatch: { background: 'linear-gradient(135deg,#fff1f2,#fb7185)' },
    label: 'Like-score (darker = higher)',
  },
  {
    swatch: {
      backgroundImage:
        'repeating-linear-gradient(-45deg,#f5f5f4 0,#f5f5f4 4px,#e7e5e4 4px,#e7e5e4 8px)',
    },
    label: 'Deal-breaker (DB)',
  },
  {
    swatch: { background: '#d1fae5', boxShadow: 'inset 0 0 0 2px #10b981' },
    label: 'Matched zero / committed pair',
  },
  {
    swatch: { background: '#fef3c7', boxShadow: 'inset 0 0 0 2px #f59e0b' },
    label: 'Covered line',
  },
  {
    swatch: { background: '#ffedd5', boxShadow: 'inset 0 0 0 2px #f97316' },
    label: 'Delta cell',
  },
  {
    swatch: { background: '#f5f5f4', opacity: 0.5 },
    label: 'Removed row / column',
  },
]

export const Legend: React.FC = () => {
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
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: 1,
          color: 'var(--ink-faint)',
          marginBottom: 10,
        }}
      >
        LEGEND
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {items.map((it) => (
          <div key={it.label} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <span
              style={{
                width: 18,
                height: 18,
                borderRadius: 5,
                flexShrink: 0,
                ...it.swatch,
              }}
            />
            <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{it.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
