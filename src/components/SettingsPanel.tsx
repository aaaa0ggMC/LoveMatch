import React from 'react'

interface SettingsPanelProps {
  n: number
  density: number
  cellSize: number
  onNChange: (v: number) => void
  onDensityChange: (v: number) => void
  onCellSizeChange: (v: number) => void
  onRegenerate: () => void
}

const SliderRow: React.FC<{
  label: string
  value: string
  min: number
  max: number
  step: number
  val: number
  onChange: (v: number) => void
  hint?: string
}> = ({ label, value, min, max, step, val, onChange, hint }) => (
  <div style={{ marginBottom: 12 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-soft)' }}>{label}</span>
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          fontFamily: 'ui-monospace, monospace',
          color: 'var(--ink)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={val}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{ width: '100%' }}
    />
    {hint && <div style={{ fontSize: 10.5, color: 'var(--ink-faint)', marginTop: 2 }}>{hint}</div>}
  </div>
)

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  n,
  density,
  cellSize,
  onNChange,
  onDensityChange,
  onCellSizeChange,
  onRegenerate,
}) => {
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
          marginBottom: 12,
        }}
      >
        MATRIX SETTINGS
      </div>

      <SliderRow
        label="Matrix size"
        value={`${n} × ${n}`}
        min={3}
        max={8}
        step={1}
        val={n}
        onChange={onNChange}
      />

      <SliderRow
        label="Relation density"
        value={`${Math.round(density * 100)}%`}
        min={10}
        max={100}
        step={5}
        val={Math.round(density * 100)}
        onChange={(v) => onDensityChange(v / 100)}
        hint={`Deal-breaker density: ${100 - Math.round(density * 100)}%`}
      />

      <SliderRow
        label="Cell size"
        value={`${cellSize}px`}
        min={36}
        max={72}
        step={2}
        val={cellSize}
        onChange={onCellSizeChange}
      />

      <button
        onClick={onRegenerate}
        style={{
          width: '100%',
          marginTop: 2,
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
          background: 'linear-gradient(135deg, #818cf8, var(--indigo))',
          boxShadow: '0 3px 10px rgba(99,102,241,0.3)',
          transition: 'transform .15s ease, box-shadow .15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-1px)'
          e.currentTarget.style.boxShadow = '0 5px 14px rgba(99,102,241,0.4)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 3px 10px rgba(99,102,241,0.3)'
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="4" />
          <circle cx="8.5" cy="8.5" r="1.4" fill="currentColor" stroke="none" />
          <circle cx="15.5" cy="15.5" r="1.4" fill="currentColor" stroke="none" />
          <circle cx="15.5" cy="8.5" r="1.4" fill="currentColor" stroke="none" />
          <circle cx="8.5" cy="15.5" r="1.4" fill="currentColor" stroke="none" />
        </svg>
        Regenerate
      </button>
    </div>
  )
}
