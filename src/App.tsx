import React, { useMemo, useState, useCallback, useEffect } from 'react'
import { computeSteps } from './algorithm/greedy-bipartite'
import { generateMatrix, sampleLikeScore, dbValue, DistSpec, DEFAULT_DIST } from './algorithm/random'
import { solveOptimal } from './algorithm/km'
import { AlgorithmStep } from './algorithm/types'
import { Matrix } from './components/Matrix'
import { PairList } from './components/PairList'
import { Controls } from './components/Controls'
import { StepInfo } from './components/StepInfo'
import { Legend } from './components/Legend'
import { SettingsPanel } from './components/SettingsPanel'
import { Information } from './components/Information'

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
  const [view, setView] = useState<'match' | 'info'>('match')
  // heat gradient on matrix cells (higher score = redder); off by default,
  // toggled from the Information view
  const [showGradient, setShowGradient] = useState(false)

  const steps = useMemo<AlgorithmStep[]>(() => computeSteps(matrix, n), [matrix, n])
  const step = steps[currentStep]

  // KM optimum, precomputed for the information view
  const optimal = useMemo(() => solveOptimal(matrix, n), [matrix, n])
  const finalStep = steps[steps.length - 1]

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

  // Load an edge-case preset: replace the matrix wholesale and restart.
  const handleLoadPreset = useCallback((m: number[][]) => {
    setN(m.length)
    setMatrix(m.map((r) => [...r]))
    setCurrentStep(0)
  }, [])

  // Runtime cell editing: double-click toggles a cell between like-score and
  // deal-breaker. Only allowed before stepping starts (currentStep === 0);
  // the step list recomputes automatically from the edited matrix.
  const handleCellToggle = useCallback(
    (i: number, j: number) => {
      if (currentStep !== 0) return
      setMatrix((m) => {
        const next = m.map((r) => [...r])
        next[i][j] = next[i][j] < 0 ? sampleLikeScore(dist) : dbValue(n)
        return next
      })
    },
    [currentStep, dist, n],
  )

  useEffect(() => {
    if (view !== 'match') return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext()
      if (e.key === 'ArrowLeft') handlePrev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleNext, handlePrev, view])

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
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div
              style={{
                display: 'flex',
                background: '#f5f5f4',
                borderRadius: 10,
                padding: 3,
                gap: 2,
              }}
            >
              {(
                [
                  { id: 'match', label: 'Match' },
                  { id: 'info', label: 'Information' },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setView(t.id)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 8,
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: 12,
                    fontWeight: 700,
                    background: view === t.id ? 'var(--surface)' : 'transparent',
                    color: view === t.id ? 'var(--ink)' : 'var(--ink-faint)',
                    boxShadow: view === t.id ? '0 1px 3px rgba(28,25,23,0.12)' : 'none',
                    transition: 'all .15s ease',
                  }}
                >
                  {t.label}
                </button>
              ))}
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
        </div>
      </header>

      {/* ---------- main ---------- */}
      <main className="app-main">
        {view === 'info' ? (
          <Information
            n={n}
            matrix={matrix}
            optimal={optimal}
            greedyScore={finalStep.totalScore}
            greedyMatched={finalStep.pairs.length}
            onImport={handleLoadPreset}
            showGradient={showGradient}
            onShowGradientChange={setShowGradient}
          />
        ) : (
          <>
            <StepInfo
              type={step.type}
              phaseTitle={step.phaseTitle}
              description={step.description}
              totalScore={step.totalScore}
            />

        <div className="layout-grid">
          {/* matrix card */}
          <div className="matrix-card">
            <Matrix
              step={step}
              cellSize={cellSize}
              editable={currentStep === 0}
              onCellToggle={handleCellToggle}
              showGradient={showGradient}
            />
            {currentStep === 0 && (
              <div
                style={{
                  textAlign: 'center',
                  fontSize: 11,
                  color: 'var(--ink-faint)',
                  marginTop: 10,
                }}
              >
                Double-click a cell to toggle it between score and deal-breaker
              </div>
            )}
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
              onLoadPreset={handleLoadPreset}
              onRegenerate={handleRegenerate}
            />
            <PairList pairs={step.pairs} n={n} />
            <Legend />
          </div>
        </div>
          </>
        )}
      </main>

      {/* ---------- bottom control bar ---------- */}
      {view === 'match' && (
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
      )}
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
