import { AlgorithmStep, MatrixState, Pair } from './types'

function makeMatrixState(
  values: number[][],
  activeRows: boolean[],
  activeCols: boolean[],
  n: number,
): MatrixState {
  return {
    values: values.map((r) => [...r]),
    rowLabels: Array.from({ length: n }, (_, i) => i),
    colLabels: Array.from({ length: n }, (_, i) => i),
    n,
    activeRows: [...activeRows],
    activeCols: [...activeCols],
  }
}

function hasDB(values: number[][], activeRows: boolean[], activeCols: boolean[], n: number): boolean {
  for (let i = 0; i < n; i++) {
    if (!activeRows[i]) continue
    for (let j = 0; j < n; j++) {
      if (!activeCols[j]) continue
      if (values[i][j] < 0) return true
    }
  }
  return false
}

function computeRowDB(values: number[][], activeRows: boolean[], activeCols: boolean[], n: number): number[] {
  const rowDB = new Array(n).fill(0)
  for (let i = 0; i < n; i++) {
    if (!activeRows[i]) continue
    for (let j = 0; j < n; j++) {
      if (!activeCols[j]) continue
      if (values[i][j] < 0) rowDB[i]++
    }
  }
  return rowDB
}

function computeColDB(values: number[][], activeRows: boolean[], activeCols: boolean[], n: number): number[] {
  const colDB = new Array(n).fill(0)
  for (let j = 0; j < n; j++) {
    if (!activeCols[j]) continue
    for (let i = 0; i < n; i++) {
      if (!activeRows[i]) continue
      if (values[i][j] < 0) colDB[j]++
    }
  }
  return colDB
}

function findMaxIndex(arr: number[]): number {
  let maxIdx = -1
  let maxVal = -1
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] > maxVal) {
      maxVal = arr[i]
      maxIdx = i
    }
  }
  return maxIdx
}

function findMaxNonDBInRow(
  values: number[][],
  row: number,
  activeCols: boolean[],
  n: number,
): number {
  let maxIdx = -1
  let maxVal = -Infinity
  for (let j = 0; j < n; j++) {
    if (!activeCols[j]) continue
    if (values[row][j] < 0) continue
    if (values[row][j] > maxVal) {
      maxVal = values[row][j]
      maxIdx = j
    }
  }
  return maxIdx
}

function findMaxNonDBInCol(
  values: number[][],
  col: number,
  activeRows: boolean[],
  n: number,
): number {
  let maxIdx = -1
  let maxVal = -Infinity
  for (let i = 0; i < n; i++) {
    if (!activeRows[i]) continue
    if (values[i][col] < 0) continue
    if (values[i][col] > maxVal) {
      maxVal = values[i][col]
      maxIdx = i
    }
  }
  return maxIdx
}

function computeBest1(values: number[][], activeRows: boolean[], activeCols: boolean[], n: number): number[] {
  const best1 = new Array(n).fill(0)
  for (let i = 0; i < n; i++) {
    if (!activeRows[i]) continue
    let max = -Infinity
    for (let j = 0; j < n; j++) {
      if (!activeCols[j]) continue
      if (values[i][j] >= 0 && values[i][j] > max) max = values[i][j]
    }
    best1[i] = max === -Infinity ? 0 : max
  }
  return best1
}

function computeBest2(values: number[][], activeRows: boolean[], activeCols: boolean[], n: number): number[] {
  const best2 = new Array(n).fill(0)
  for (let i = 0; i < n; i++) {
    if (!activeRows[i]) continue
    let first = -Infinity
    let second = -Infinity
    for (let j = 0; j < n; j++) {
      if (!activeCols[j]) continue
      const v = values[i][j]
      if (v < 0) continue
      if (v > first) {
        second = first
        first = v
      } else if (v > second) {
        second = v
      }
    }
    best2[i] = second === -Infinity ? 0 : second
  }
  return best2
}

function computeColBest1(values: number[][], activeRows: boolean[], activeCols: boolean[], n: number): number[] {
  const best1 = new Array(n).fill(0)
  for (let j = 0; j < n; j++) {
    if (!activeCols[j]) continue
    let max = -Infinity
    for (let i = 0; i < n; i++) {
      if (!activeRows[i]) continue
      if (values[i][j] >= 0 && values[i][j] > max) max = values[i][j]
    }
    best1[j] = max === -Infinity ? 0 : max
  }
  return best1
}

function computeColBest2(values: number[][], activeRows: boolean[], activeCols: boolean[], n: number): number[] {
  const best2 = new Array(n).fill(0)
  for (let j = 0; j < n; j++) {
    if (!activeCols[j]) continue
    let first = -Infinity
    let second = -Infinity
    for (let i = 0; i < n; i++) {
      if (!activeRows[i]) continue
      const v = values[i][j]
      if (v < 0) continue
      if (v > first) {
        second = first
        first = v
      } else if (v > second) {
        second = v
      }
    }
    best2[j] = second === -Infinity ? 0 : second
  }
  return best2
}

function activeRowCount(activeRows: boolean[]): number {
  return activeRows.filter(Boolean).length
}

function activeColCount(activeCols: boolean[]): number {
  return activeCols.filter(Boolean).length
}

function stepBase(
  type: AlgorithmStep['type'],
  values: number[][],
  activeRows: boolean[],
  activeCols: boolean[],
  n: number,
  pairs: Pair[],
  totalScore: number,
  description: string,
  phaseTitle: string,
  extra: Partial<AlgorithmStep> = {},
): AlgorithmStep {
  return {
    type,
    matrix: makeMatrixState(values, activeRows, activeCols, n),
    pairs: pairs.map((p) => ({ ...p })),
    totalScore,
    description,
    phaseTitle,
    ...extra,
  } as AlgorithmStep
}

export function computeSteps(values: number[][], n: number): AlgorithmStep[] {
  const steps: AlgorithmStep[] = []
  const activeRows: boolean[] = new Array(n).fill(true)
  const activeCols: boolean[] = new Array(n).fill(true)
  const pairs: Pair[] = []
  const skippedLines: { kind: 'row' | 'col'; index: number }[] = []
  let totalScore = 0

  steps.push(
    stepBase(
      'init',
      values,
      activeRows,
      activeCols,
      n,
      pairs,
      totalScore,
      `Initial relation matrix of ${n} boys and ${n} girls. Each cell shows the like-score; negative values are deal-breakers (DB).`,
      'Initial Matrix',
    ),
  )

  while (activeRowCount(activeRows) > 0 && activeColCount(activeCols) > 0) {
    const dbPresent = hasDB(values, activeRows, activeCols, n)
    let chosenI: number, chosenJ: number

    if (dbPresent) {
      // --- Deal Breaker Path ---
      const rowDB = computeRowDB(values, activeRows, activeCols, n)
      const colDB = computeColDB(values, activeRows, activeCols, n)

      steps.push(
        stepBase(
          'scan_db',
          values,
          activeRows,
          activeCols,
          n,
          pairs,
          totalScore,
          'Scanning for deal-breaker cells. Counting DBs per row and column.',
          'Scan Deal Breakers',
          { rowDB, colDB },
        ),
      )

      const rStar = findMaxIndex(rowDB)
      const cStar = findMaxIndex(colDB)

      let chosenLine: { kind: 'row' | 'col'; index: number; dbCount: number }

      if (rowDB[rStar] >= colDB[cStar]) {
        chosenLine = { kind: 'row', index: rStar, dbCount: rowDB[rStar] }
        chosenI = rStar
        chosenJ = findMaxNonDBInRow(values, chosenI, activeCols, n)
      } else {
        chosenLine = { kind: 'col', index: cStar, dbCount: colDB[cStar] }
        chosenJ = cStar
        chosenI = findMaxNonDBInCol(values, chosenJ, activeRows, n)
      }

      steps.push(
        stepBase(
          'select_db_line',
          values,
          activeRows,
          activeCols,
          n,
          pairs,
          totalScore,
          chosenLine.kind === 'row'
            ? `Row B${chosenLine.index} has the most DB cells (${chosenLine.dbCount}). Tie broken by smallest index. Serving the most constrained row first.`
            : `Column G${chosenLine.index} has the most DB cells (${chosenLine.dbCount}). Tie broken by smallest index. Serving the most constrained column first.`,
          'Select Most Constrained Line',
          { rowDB, colDB, chosenLine },
        ),
      )

      if (chosenI === -1 || chosenJ === -1) {
        // The most constrained line has NO non-DB cell: it can never be matched.
        // Skip it — remove the line without forming a pair and without adding points.
        const label = chosenLine.kind === 'row' ? `B${chosenLine.index}` : `G${chosenLine.index}`
        steps.push(
          stepBase(
            'skip_line',
            values,
            activeRows,
            activeCols,
            n,
            pairs,
            totalScore,
            `${chosenLine.kind === 'row' ? 'Row' : 'Column'} ${label} contains only deal-breakers — no valid partner exists. Skipping this line: no pair is formed and no points are added.`,
            'Skip Unmatchable Line',
            { rowDB, colDB, chosenLine },
          ),
        )

        if (chosenLine.kind === 'row') activeRows[chosenLine.index] = false
        else activeCols[chosenLine.index] = false
        skippedLines.push({ kind: chosenLine.kind, index: chosenLine.index })

        steps.push(
          stepBase(
            'remove_line',
            values,
            activeRows,
            activeCols,
            n,
            pairs,
            totalScore,
            `${chosenLine.kind === 'row' ? 'Row' : 'Column'} ${label} removed from the relation. ${activeRowCount(activeRows)} boy(s) and ${activeColCount(activeCols)} girl(s) remaining.`,
            'Remove Line',
            { removedLine: { kind: chosenLine.kind, index: chosenLine.index } },
          ),
        )
        continue
      }

      steps.push(
        stepBase(
          'select_db_cell',
          values,
          activeRows,
          activeCols,
          n,
          pairs,
          totalScore,
          `Selecting the highest non-DB cell in ${chosenLine.kind} ${chosenLine.kind === 'row' ? 'B' : 'G'}${chosenLine.index}. Cell (B${chosenI}, G${chosenJ}) with score ${values[chosenI][chosenJ]}.`,
          'Select Best Cell',
          { rowDB, colDB, chosenLine, chosenCell: { i: chosenI, j: chosenJ, value: values[chosenI][chosenJ] } },
        ),
      )
    } else {
      // --- Regret Path (rows and columns, Vogel-style) ---
      const best1 = computeBest1(values, activeRows, activeCols, n)
      const best2 = computeBest2(values, activeRows, activeCols, n)
      const colBest1 = computeColBest1(values, activeRows, activeCols, n)
      const colBest2 = computeColBest2(values, activeRows, activeCols, n)

      steps.push(
        stepBase(
          'scan_best_values',
          values,
          activeRows,
          activeCols,
          n,
          pairs,
          totalScore,
          'No deal-breakers remain. Scanning each row and column for its best and second-best values.',
          'Scan Best Values',
          { best1, best2, colBest1, colBest2 },
        ),
      )

      const regret = best1.map((b1, idx) => b1 - best2[idx])
      const regretCol = colBest1.map((b1, idx) => b1 - colBest2[idx])

      steps.push(
        stepBase(
          'calc_regret',
          values,
          activeRows,
          activeCols,
          n,
          pairs,
          totalScore,
          'Computing regret = best1 − best2 for each row and column. Regret measures how much we lose if we miss the best match.',
          'Calculate Regret',
          { best1, best2, colBest1, colBest2, regret, regretCol },
        ),
      )

      // The line (row or column) with the highest regret is served first.
      // Ties go to the row, then to the smallest index.
      let rStar = -1
      let rMax = -1
      for (let r = 0; r < n; r++) {
        if (!activeRows[r]) continue
        if (regret[r] > rMax) {
          rMax = regret[r]
          rStar = r
        }
      }
      let cStar = -1
      let cMax = -1
      for (let c = 0; c < n; c++) {
        if (!activeCols[c]) continue
        if (regretCol[c] > cMax) {
          cMax = regretCol[c]
          cStar = c
        }
      }

      let chosenRegretLine: { kind: 'row' | 'col'; index: number; regret: number }
      if (rMax >= cMax) {
        chosenI = rStar
        chosenJ = findMaxNonDBInRow(values, chosenI, activeCols, n)
        chosenRegretLine = { kind: 'row', index: rStar, regret: rMax }
      } else {
        chosenJ = cStar
        chosenI = findMaxNonDBInCol(values, chosenJ, activeRows, n)
        chosenRegretLine = { kind: 'col', index: cStar, regret: cMax }
      }

      steps.push(
        stepBase(
          'select_regret',
          values,
          activeRows,
          activeCols,
          n,
          pairs,
          totalScore,
          chosenRegretLine.kind === 'row'
            ? `Row B${chosenI} has the highest regret (${chosenRegretLine.regret}). Selecting its best cell (B${chosenI}, G${chosenJ}) with score ${values[chosenI][chosenJ]}.`
            : `Column G${chosenJ} has the highest regret (${chosenRegretLine.regret}). Selecting its best cell (B${chosenI}, G${chosenJ}) with score ${values[chosenI][chosenJ]}.`,
          'Select by Regret',
          {
            best1,
            best2,
            colBest1,
            colBest2,
            regret,
            regretCol,
            chosenRegretLine,
            chosenCell: { i: chosenI, j: chosenJ, value: values[chosenI][chosenJ] },
            chosenRow: chosenI,
            chosenCol: chosenJ,
          },
        ),
      )
    }

    // Commit
    pairs.push({ boy: chosenI, girl: chosenJ, score: values[chosenI][chosenJ] })
    totalScore += values[chosenI][chosenJ]

    steps.push(
      stepBase(
        'commit_pair',
        values,
        activeRows,
        activeCols,
        n,
        pairs,
        totalScore,
        `Matched! Pair (B${chosenI}, G${chosenJ}) committed with score ${values[chosenI][chosenJ]}. Running total: ${totalScore}.`,
        'Commit Pair',
        { chosenRow: chosenI, chosenCol: chosenJ },
      ),
    )

    // Remove
    activeRows[chosenI] = false
    activeCols[chosenJ] = false

    steps.push(
      stepBase(
        'remove_rowcol',
        values,
        activeRows,
        activeCols,
        n,
        pairs,
        totalScore,
        `Removing row B${chosenI} and column G${chosenJ} from the relation. ${activeRowCount(activeRows)} boy(s) and ${activeColCount(activeCols)} girl(s) remaining.`,
        'Remove Row & Column',
        { removedRow: chosenI, removedCol: chosenJ },
      ),
    )
  }

  const leftBoys = activeRows.map((a, i) => (a ? i : -1)).filter((i) => i >= 0)
  const leftGirls = activeCols.map((a, j) => (a ? j : -1)).filter((j) => j >= 0)

  const unmatched: string[] = []
  for (const l of skippedLines) {
    unmatched.push(`${l.kind === 'row' ? 'B' : 'G'}${l.index} (all deal-breakers)`)
  }
  for (const i of leftBoys) unmatched.push(`B${i} (no partner left)`)
  for (const j of leftGirls) unmatched.push(`G${j} (no partner left)`)

  const parts: string[] = [
    `Algorithm complete! ${pairs.length} pair(s) matched, total score ${totalScore}.`,
  ]
  if (unmatched.length > 0) {
    parts.push(`Unmatched: ${unmatched.join(', ')}.`)
  } else {
    parts.push('Everyone is matched.')
  }
  const completeDesc = parts.join(' ')

  steps.push(
    stepBase(
      'complete',
      values,
      activeRows,
      activeCols,
      n,
      pairs,
      totalScore,
      completeDesc,
      'Complete',
      { skippedLines: skippedLines.map((l) => ({ ...l })) },
    ),
  )

  return steps
}
