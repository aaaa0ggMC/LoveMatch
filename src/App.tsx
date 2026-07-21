import React, { useMemo, useState, useCallback, useEffect } from 'react'
import { computeSteps } from './algorithm/greedy-bipartite'
import { generateMatrix, DistSpec, DEFAULT_DIST } from './algorithm/random'
import { AlgorithmStep } from './algorithm/types'
import { Matrix } from './components/Matrix'
import { PairList } from './components/PairList'
import { Controls } from './components/Controls'
import { StepInfo } from './components/StepInfo'
import { Legend } from './components/Legend'
import { SettingsPanel } from './components/SettingsPanel'

const App: React.FC = () => {
  const [n, setN] = useState(5)
  const [density, setDensity] = useState(0.7)
  const [dist, setDist] = useState<DistSpec>(DEFAULT_DIST)
  const [cellSize, setCellSize] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 640 ? 42 : 54,
  )
  const [matrix, setMatrix] = useState<number[][]>(() =>
    generateMatrix({ n: 5, density: 0.7, dist: DEFAULT_DIST }),
  )
  const [currentStep, setCurrentStep] = useState(0)

  const steps = useMemo<AlgorithmStep[]>(() => computeSteps(matrix, n), [matrix, n])
  const step = steps[currentStep]

  const canGoNext = currentStep < steps.length - 1
  const canGoPrev = currentStep > 0
  const isComplete = step.type === 'complete' || step.type === 'infeasible'

  const handleNext = useCallback(() => {
    if (canGoNext) setCurrentStep((s) => s + 1)
  }, [canGoNext])

  const handlePrev = useCallback(() => {
    if (canGoPrev) setCurrentStep((s) => s - 1)
  }, [canGoPrev])

  const handleReset = useCallback(() => {
    setCurrentStep(0)
  }, [])

  const reroll = useCallback((newN: number, newDensity: number, newDist: DistSpec) => {
    setMatrix(generateMatrix({ n: newN, density: newDensity, dist: newDist }))
    setCurrentStep(0)
  }, [])

  const handleNChange = useCallback(
    (v: number) => {
      setN(v)
      reroll(v, density, dist)
    },
    [density, dist, reroll],
  )

  const handleDensityChange = useCallback(
    (v: number) => {
      setDensity(v)
      reroll(n, v, dist)
    },
    [n, dist, reroll],
  )

  const handleDistChange = useCallback(
    (v: DistSpec) => {
      setDist(v)
      reroll(n, density, v)
    },
    [n, density, reroll],
  )

  const handleRegenerate = useCallback(() => {
    reroll(n, density, dist)
  }, [n, density, dist, reroll])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext()
      if (e.key === 'ArrowLeft') handlePrev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleNext, handlePrev])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ---------- header ---------- */}
      <header
        style={{
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid var(--line)',
          position: 'sticky',
          top: 0,
          zIndex: 20,
        }}
      >
        <div className="header-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
            <span
              className="header-logo"
              style={{
                width: 36,
                height: 36,
                borderRadius: 11,
                background: 'linear-gradient(135deg, #fb7185, var(--rose))',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 3px 10px rgba(244,63,94,0.35)',
                flexShrink: 0,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
                <path d="M12 21s-7.5-4.8-9.8-9.2C.8 8.9 2.6 5 6.1 5c2.1 0 3.8 1.3 5.9 3.7C14.1 6.3 15.8 5 17.9 5c3.5 0 5.3 3.9 3.9 6.8C19.5 16.2 12 21 12 21z" />
              </svg>
            </span>
            <div>
              <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: -0.3, lineHeight: 1.1 }}>
                Love Match
              </div>
              <div className="header-subtitle" style={{ fontSize: 11, color: 'var(--ink-faint)', letterSpacing: 0.4 }}>
                Greedy Bipartite Matching · Visualized
              </div>
            </div>
          </div>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--ink-soft)',
              background: '#f5f5f4',
              padding: '5px 12px',
              borderRadius: 20,
              flexShrink: 0,
            }}
          >
            {n} × {n} matrix
          </span>
        </div>
      </header>

      {/* ---------- main ---------- */}
      <main className="app-main">
        <StepInfo
          type={step.type}
          phaseTitle={step.phaseTitle}
          description={step.description}
          totalScore={step.totalScore}
        />

        <div className="layout-grid">
          {/* matrix card */}
          <div className="matrix-card">
            <Matrix step={step} cellSize={cellSize} />
          </div>

          {/* sidebar */}
          <div className="sidebar">
            <SettingsPanel
              n={n}
              density={density}
              cellSize={cellSize}
              dist={dist}
              onNChange={handleNChange}
              onDensityChange={handleDensityChange}
              onCellSizeChange={setCellSize}
              onDistChange={handleDistChange}
              onRegenerate={handleRegenerate}
            />
            <PairList pairs={step.pairs} n={n} />
            <Legend />
          </div>
        </div>
      </main>

      {/* ---------- bottom control bar ---------- */}
      <footer
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid var(--line)',
          zIndex: 20,
        }}
      >
        <div className="footer-inner">
          <Controls
            currentStep={currentStep}
            totalSteps={steps.length}
            onPrev={handlePrev}
            onNext={handleNext}
            onReset={handleReset}
            canGoPrev={canGoPrev}
            canGoNext={canGoNext}
            isComplete={isComplete}
          />
          <div className="kbd-hint">
            Use <Kbd>←</Kbd> <Kbd>→</Kbd> arrow keys to navigate
          </div>
        </div>
      </footer>
    </div>
  )
}

const Kbd: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span
    style={{
      display: 'inline-block',
      padding: '1px 6px',
      borderRadius: 5,
      background: '#f5f5f4',
      border: '1px solid var(--line)',
      borderBottomWidth: 2,
      fontSize: 10,
      fontFamily: 'ui-monospace, monospace',
      color: 'var(--ink-soft)',
    }}
  >
    {children}
  </span>
)

export default App
