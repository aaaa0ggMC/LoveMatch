import React from 'react'
import { DistModel, DistSpec, MODEL_DEFAULTS } from '../algorithm/random'

interface SettingsPanelProps {
  n: number
  density: number
  cellSize: number
  dist: DistSpec
  onNChange: (v: number) => void
  onDensityChange: (v: number) => void
  onCellSizeChange: (v: number) => void
  onDistChange: (v: DistSpec) => void
  onRegenerate: () => void
}

const DIST_MODELS: { id: DistModel; label: string; desc: string }[] = [
  { id: 't', label: 't-dist', desc: 'Bell-shaped with heavy tails: few very high scores (default).' },
  { id: 'normal', label: 'Normal', desc: 'Classic bell curve centered on the mean.' },
  { id: 'uniform', label: 'Uniform', desc: 'Every score from 0 to 100 equally likely.' },
  { id: 'bimodal', label: 'Polarized', desc: 'Two humps — love it or hate it, little in between.' },
  { id: 'skewLow', label: 'Picky', desc: 'Mostly low scores, only a few high ones.' },
  { id: 'skewHigh', label: 'Easygoing', desc: 'Mostly high scores, only a few low ones.' },
]

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
  dist,
  onNChange,
  onDensityChange,
  onCellSizeChange,
  onDistChange,
  onRegenerate,
}) => {
  const patchDist = (p: Partial<DistSpec>) => onDistChange({ ...dist, ...p })
  const activeModel = DIST_MODELS.find((m) => m.id === dist.model)

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
        max={11}
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

      {/* ---------- score distribution (advanced, rarely used) ---------- */}
      <details
        style={{
          marginTop: 12,
          borderTop: '1px dashed var(--line)',
          paddingTop: 10,
        }}
      >
        <summary
          style={{
            cursor: 'pointer',
            listStyle: 'none',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 1,
            color: 'var(--ink-faint)',
            userSelect: 'none',
          }}
        >
          SCORE DISTRIBUTION
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.3 }}>advanced ▾</span>
        </summary>

        <div style={{ marginTop: 10 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 6,
            }}
          >
            {DIST_MODELS.map((m) => {
              const active = m.id === dist.model
              return (
                <button
                  key={m.id}
                  onClick={() => onDistChange({ ...MODEL_DEFAULTS[m.id] })}
                  style={{
                    padding: '5px 4px',
                    borderRadius: 8,
                    border: `1.5px solid ${active ? 'var(--indigo)' : 'var(--line)'}`,
                    background: active ? 'var(--indigo-soft)' : '#fafaf9',
                    color: active ? 'var(--indigo)' : 'var(--ink-soft)',
                    fontSize: 11,
                    fontWeight: active ? 700 : 600,
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                    transition: 'all .15s ease',
                  }}
                >
                  {m.label}
                </button>
              )
            })}
          </div>
          {activeModel && (
            <div style={{ fontSize: 10.5, color: 'var(--ink-faint)', marginTop: 6, lineHeight: 1.45 }}>
              {activeModel.desc}
            </div>
          )}

          <div style={{ marginTop: 8 }}>
            {(dist.model === 't' || dist.model === 'normal') && (
              <>
                <SliderRow
                  label="Mean"
                  value={`${dist.mean}`}
                  min={5}
                  max={95}
                  step={1}
                  val={dist.mean}
                  onChange={(v) => patchDist({ mean: v })}
                />
                <SliderRow
                  label="Std dev"
                  value={`${dist.sd}`}
                  min={3}
                  max={40}
                  step={1}
                  val={dist.sd}
                  onChange={(v) => patchDist({ sd: v })}
                />
              </>
            )}
            {dist.model === 't' && (
              <SliderRow
                label="Degrees of freedom"
                value={`${dist.shape}`}
                min={3}
                max={30}
                step={1}
                val={dist.shape}
                onChange={(v) => patchDist({ shape: v })}
                hint="Lower = heavier tails (more extreme scores)"
              />
            )}
            {dist.model === 'bimodal' && (
              <>
                <SliderRow
                  label="Center"
                  value={`${dist.mean}`}
                  min={10}
                  max={90}
                  step={1}
                  val={dist.mean}
                  onChange={(v) => patchDist({ mean: v })}
                />
                <SliderRow
                  label="Separation"
                  value={`${dist.shape}`}
                  min={10}
                  max={90}
                  step={2}
                  val={dist.shape}
                  onChange={(v) => patchDist({ shape: v })}
                  hint="Distance between the two humps"
                />
                <SliderRow
                  label="Hump spread"
                  value={`${dist.sd}`}
                  min={2}
                  max={25}
                  step={1}
                  val={dist.sd}
                  onChange={(v) => patchDist({ sd: v })}
                />
              </>
            )}
            {(dist.model === 'skewLow' || dist.model === 'skewHigh') && (
              <SliderRow
                label="Skew strength"
                value={`${dist.shape}×`}
                min={1}
                max={8}
                step={0.5}
                val={dist.shape}
                onChange={(v) => patchDist({ shape: v })}
                hint={
                  dist.model === 'skewLow'
                    ? 'Higher = low scores dominate more'
                    : 'Higher = high scores dominate more'
                }
              />
            )}
          </div>
        </div>
      </details>
    </div>
  )
}
