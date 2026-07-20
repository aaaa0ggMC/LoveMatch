import React from 'react'

interface ControlsProps {
  currentStep: number
  totalSteps: number
  onPrev: () => void
  onNext: () => void
  onReset: () => void
  canGoPrev: boolean
  canGoNext: boolean
  isComplete: boolean
}

const btnBase: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 7,
  border: 'none',
  cursor: 'pointer',
  fontFamily: 'inherit',
  transition: 'all .18s ease',
}

export const Controls: React.FC<ControlsProps> = ({
  currentStep,
  totalSteps,
  onPrev,
  onNext,
  onReset,
  canGoPrev,
  canGoNext,
  isComplete,
}) => {
  const progress = totalSteps <= 1 ? 1 : currentStep / (totalSteps - 1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* progress track */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 0.8,
            color: 'var(--ink-faint)',
            fontVariantNumeric: 'tabular-nums',
            whiteSpace: 'nowrap',
          }}
        >
          STEP {currentStep + 1} OF {totalSteps}
        </span>
        <div
          style={{
            flex: 1,
            height: 6,
            borderRadius: 4,
            background: '#f0efed',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress * 100}%`,
              borderRadius: 4,
              background: 'linear-gradient(90deg, #fda4af, var(--rose))',
              transition: 'width .3s cubic-bezier(.4,0,.2,1)',
            }}
          />
        </div>
      </div>

      {/* buttons */}
      <div className="controls-row">
        <button
          onClick={onPrev}
          disabled={!canGoPrev}
          style={{
            ...btnBase,
            padding: '9px 16px',
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 600,
            background: 'var(--surface)',
            color: 'var(--ink-soft)',
            boxShadow: 'inset 0 0 0 1.5px var(--line)',
            opacity: canGoPrev ? 1 : 0.35,
            cursor: canGoPrev ? 'pointer' : 'not-allowed',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Prev
        </button>

        <button
          onClick={onNext}
          disabled={!canGoNext || isComplete}
          className="next-btn"
          style={{
            ...btnBase,
            padding: '11px 28px',
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 700,
            background:
              !canGoNext || isComplete
                ? '#e7e5e4'
                : 'linear-gradient(135deg, #fb7185, var(--rose))',
            color: !canGoNext || isComplete ? 'var(--ink-faint)' : '#fff',
            boxShadow:
              !canGoNext || isComplete
                ? 'none'
                : '0 4px 14px rgba(244,63,94,0.35), inset 0 1px 0 rgba(255,255,255,0.25)',
            cursor: !canGoNext || isComplete ? 'not-allowed' : 'pointer',
          }}
        >
          {isComplete ? 'Finished' : 'Next Step'}
          {!isComplete && (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          )}
        </button>

        <button
          onClick={onReset}
          style={{
            ...btnBase,
            padding: '9px 14px',
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 600,
            background: 'transparent',
            color: 'var(--ink-faint)',
            boxShadow: 'inset 0 0 0 1.5px var(--line)',
          }}
          title="Reset to step 1"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          Reset
        </button>
      </div>
    </div>
  )
}
