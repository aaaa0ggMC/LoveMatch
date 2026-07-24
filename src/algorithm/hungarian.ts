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

// ---------- Hungarian algorithm internals ----------

/** Find maximum matching in the zero-graph using Hopcroft–Karp. */
function maxZeroMatching(cost: number[][], n: number): { matchR: number[]; matchC: number[] } {
  const matchR = new Array<number>(n).fill(-1)
  const matchC = new Array<number>(n).fill(-1)

  // BFS layers
  const dist = new Array<number>(n)
  const queue: number[] = []

  const bfs = (): boolean => {
    queue.length = 0
    for (let i = 0; i < n; i++) {
      if (matchR[i] === -1) {
        dist[i] = 0
        queue.push(i)
      } else {
        dist[i] = -1
      }
    }
    let found = false
    while (queue.length > 0) {
      const i = queue.shift()!
      for (let j = 0; j < n; j++) {
        if (cost[i][j] !== 0) continue
        const k = matchC[j]
        if (k === -1) {
          found = true
        } else if (dist[k] === -1) {
          dist[k] = dist[i] + 1
          queue.push(k)
        }
      }
    }
    return found
  }

  const dfs = (i: number): boolean => {
    for (let j = 0; j < n; j++) {
      if (cost[i][j] !== 0) continue
      const k = matchC[j]
      if (k === -1 || (dist[k] === dist[i] + 1 && dfs(k))) {
        matchR[i] = j
        matchC[j] = i
        return true
      }
    }
    dist[i] = -1
    return false
  }

  while (bfs()) {
    for (let i = 0; i < n; i++) {
      if (matchR[i] === -1) dfs(i)
    }
  }

  return { matchR, matchC }
}

/** König's theorem: min vertex cover from max matching in the zero-graph. */
function minZeroCover(
  cost: number[][],
  n: number,
  matchR: number[],
  matchC: number[],
): { coveredRows: boolean[]; coveredCols: boolean[] } {
  // Start from unmatched rows, alternate via zero edges
  const visitedR = new Array<boolean>(n).fill(false)
  const visitedC = new Array<boolean>(n).fill(false)

  const queue: { kind: 'row' | 'col'; index: number }[] = []
  for (let i = 0; i < n; i++) {
    if (matchR[i] === -1) {
      visitedR[i] = true
      queue.push({ kind: 'row', index: i })
    }
  }

  while (queue.length > 0) {
    const { kind, index } = queue.shift()!
    if (kind === 'row') {
      for (let j = 0; j < n; j++) {
        if (cost[index][j] === 0 && !visitedC[j]) {
          visitedC[j] = true
          queue.push({ kind: 'col', index: j })
        }
      }
    } else {
      const i = matchC[index]
      if (i !== -1 && !visitedR[i]) {
        visitedR[i] = true
        queue.push({ kind: 'row', index: i })
      }
    }
  }

  // König: cover = (rows not visited) ∪ (cols visited)
  const coveredRows = visitedR.map((v) => !v)
  const coveredCols = visitedC
  return { coveredRows, coveredCols }
}

// ---------- step generation ----------

export function computeSteps(values: number[][], n: number): AlgorithmStep[] {
  const steps: AlgorithmStep[] = []
  const activeRows = new Array<boolean>(n).fill(true)
  const activeCols = new Array<boolean>(n).fill(true)
  const pairs: Pair[] = []
  const totalScore = 0
  const DB = -100 * n

  // ---------- init ----------
  steps.push(
    stepBase(
      'init',
      values,
      activeRows,
      activeCols,
      n,
      pairs,
      totalScore,
      `Initial relation matrix of ${n} boys and ${n} girls. Each cell shows the like-score; negative values are deal-breakers (DB = ${DB}).`,
      'Initial Matrix',
    ),
  )

  // ---------- preprocessing: build cost matrix ----------
  let H = -Infinity
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (values[i][j] > H) H = values[i][j]
    }
  }

  const cost: number[][] = values.map((row) => row.map((v) => H - v))

  steps.push(
    stepBase(
      'init_cost',
      cost,
      activeRows,
      activeCols,
      n,
      pairs,
      totalScore,
      `Converted to cost matrix: Cost[i][j] = H − Relation[i][j], where H = ${H}. Deal-breakers become ${H - DB}.`,
      'Build Cost Matrix',
      { H, DB },
    ),
  )

  // ---------- step 1: row reduction ----------
  const reduced: number[][] = cost.map((row) => [...row])
  const rowMin = new Array<number>(n).fill(0)

  for (let i = 0; i < n; i++) {
    let mn = Infinity
    for (let j = 0; j < n; j++) if (reduced[i][j] < mn) mn = reduced[i][j]
    rowMin[i] = mn
    for (let j = 0; j < n; j++) reduced[i][j] -= mn
  }

  steps.push(
    stepBase(
      'reduce_rows',
      reduced,
      activeRows,
      activeCols,
      n,
      pairs,
      totalScore,
      `Row reduction: subtracted each row's minimum from every cell in that row. Row minima: [${rowMin.join(', ')}].`,
      'Reduce Rows',
      { rowMin },
    ),
  )

  // ---------- step 1: column reduction ----------
  const colMin = new Array<number>(n).fill(0)
  for (let j = 0; j < n; j++) {
    let mn = Infinity
    for (let i = 0; i < n; i++) if (reduced[i][j] < mn) mn = reduced[i][j]
    colMin[j] = mn
    for (let i = 0; i < n; i++) reduced[i][j] -= mn
  }

  steps.push(
    stepBase(
      'reduce_cols',
      reduced,
      activeRows,
      activeCols,
      n,
      pairs,
      totalScore,
      `Column reduction: subtracted each column's minimum from every cell in that column. Column minima: [${colMin.join(', ')}].`,
      'Reduce Columns',
      { colMin },
    ),
  )

  // ---------- steps 2–4: iterate until perfect matching ----------
  let iteration = 0
  let matchR: number[] = []
  let matchC: number[] = []

  for (;;) {
    iteration++
    const matching = maxZeroMatching(reduced, n)
    matchR = matching.matchR
    matchC = matching.matchC
    const matchSize = matchR.filter((v) => v !== -1).length

    const matchedPairs: { i: number; j: number }[] = []
    for (let i = 0; i < n; i++) {
      if (matchR[i] !== -1) matchedPairs.push({ i, j: matchR[i] })
    }

    steps.push(
      stepBase(
        'find_zeros',
        reduced,
        activeRows,
        activeCols,
        n,
        pairs,
        totalScore,
        `Iteration ${iteration}: found a maximum matching of ${matchSize} independent zero(s). ${matchSize === n ? 'A perfect assignment exists!' : `Need ${n - matchSize} more.`}`,
        'Find Zero Matching',
        {
          iteration,
          matchSize,
          zeroMatching: matchedPairs,
          matchR: [...matchR],
          matchC: [...matchC],
        },
      ),
    )

    if (matchSize === n) break

    // ---------- find min cover ----------
    const { coveredRows, coveredCols } = minZeroCover(reduced, n, matchR, matchC)

    const coveredRowList: number[] = []
    const coveredColList: number[] = []
    for (let i = 0; i < n; i++) if (coveredRows[i]) coveredRowList.push(i)
    for (let j = 0; j < n; j++) if (coveredCols[j]) coveredColList.push(j)

    steps.push(
      stepBase(
        'cover_zeros',
        reduced,
        activeRows,
        activeCols,
        n,
        pairs,
        totalScore,
        `Minimum line cover: ${coveredRowList.length} row(s) [${coveredRowList.map((i) => `B${i + 1}`).join(', ')}] and ${coveredColList.length} column(s) [${coveredColList.map((j) => `G${j + 1}`).join(', ')}]. Total lines: ${coveredRowList.length + coveredColList.length}.`,
        'Cover Zeros',
        {
          iteration,
          coveredRows: [...coveredRows],
          coveredCols: [...coveredCols],
          coveredRowList,
          coveredColList,
        },
      ),
    )

    // ---------- find delta ----------
    let delta = Infinity
    for (let i = 0; i < n; i++) {
      if (coveredRows[i]) continue
      for (let j = 0; j < n; j++) {
        if (coveredCols[j]) continue
        if (reduced[i][j] < delta) delta = reduced[i][j]
      }
    }

    steps.push(
      stepBase(
        'find_delta',
        reduced,
        activeRows,
        activeCols,
        n,
        pairs,
        totalScore,
        `Smallest uncovered value: δ = ${delta}.`,
        'Find Delta',
        {
          iteration,
          delta,
          coveredRows: [...coveredRows],
          coveredCols: [...coveredCols],
        },
      ),
    )

    // ---------- adjust matrix ----------
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const rCov = coveredRows[i]
        const cCov = coveredCols[j]
        if (!rCov && !cCov) {
          reduced[i][j] -= delta
        } else if (rCov && cCov) {
          reduced[i][j] += delta
        }
      }
    }

    steps.push(
      stepBase(
        'adjust_matrix',
        reduced,
        activeRows,
        activeCols,
        n,
        pairs,
        totalScore,
        `Adjusted matrix: subtracted δ from uncovered cells, added δ to doubly-covered cells.`,
        'Adjust Matrix',
        {
          iteration,
          delta,
          coveredRows: [...coveredRows],
          coveredCols: [...coveredCols],
        },
      ),
    )
  }

  // ---------- step 5: extract pairs ----------
  const finalPairs: Pair[] = []
  const unmatchedB: number[] = []
  const unmatchedG: number[] = []
  let ts = 0

  for (let i = 0; i < n; i++) {
    const j = matchR[i]
    const v = values[i][j]
    if (v !== DB) {
      finalPairs.push({ boy: i, girl: j, score: v })
      ts += v
    } else {
      unmatchedB.push(i)
      unmatchedG.push(j)
    }
  }

  steps.push(
    stepBase(
      'extract_pairs',
      values,
      activeRows,
      activeCols,
      n,
      finalPairs,
      ts,
      `Extracted ${finalPairs.length} valid pair(s) from the assignment. Total score: ${ts}.`,
      'Extract Pairs',
      {
        unmatchedB: [...unmatchedB],
        unmatchedG: [...unmatchedG],
        assignment: matchR.map((j, i) => ({ i, j })),
      },
    ),
  )

  // ---------- complete ----------
  const parts: string[] = [
    `Algorithm complete! ${finalPairs.length} pair(s) matched, total score ${ts}.`,
  ]
  if (unmatchedB.length > 0) {
    parts.push(
      `Unmatched: ${unmatchedB.map((i) => `B${i + 1}`).join(', ')} (assigned deal-breakers).`,
    )
  } else {
    parts.push('Everyone is matched.')
  }

  steps.push(
    stepBase(
      'complete',
      values,
      activeRows,
      activeCols,
      n,
      finalPairs,
      ts,
      parts.join(' '),
      'Complete',
      {
        unmatchedB: [...unmatchedB],
        unmatchedG: [...unmatchedG],
      },
    ),
  )

  return steps
}
