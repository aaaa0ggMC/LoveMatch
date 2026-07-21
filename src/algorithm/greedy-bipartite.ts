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

// ---------- deal-breaker counts ----------

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

// ---------- feasible-value statistics ----------

/** statistics over the feasible (non-deal-breaker) values of one line */
interface LineStats {
  /** number of feasible entries in the line */
  count: number
  /** highest feasible value (-Infinity when the line has none) */
  highest: number
  /** second highest feasible value (-Infinity when there is no second) */
  second: number
  /** regret: 0 when the line has a single feasible entry, else highest − second */
  regret: number
}

function rowStats(values: number[][], activeCols: boolean[], n: number, i: number): LineStats {
  let count = 0
  let first = -Infinity
  let second = -Infinity
  for (let j = 0; j < n; j++) {
    if (!activeCols[j]) continue
    const v = values[i][j]
    if (v < 0) continue
    count++
    if (v > first) {
      second = first
      first = v
    } else if (v > second) {
      second = v
    }
  }
  return { count, highest: first, second, regret: count <= 1 ? 0 : first - second }
}

function colStats(values: number[][], activeRows: boolean[], n: number, j: number): LineStats {
  let count = 0
  let first = -Infinity
  let second = -Infinity
  for (let i = 0; i < n; i++) {
    if (!activeRows[i]) continue
    const v = values[i][j]
    if (v < 0) continue
    count++
    if (v > first) {
      second = first
      first = v
    } else if (v > second) {
      second = v
    }
  }
  return { count, highest: first, second, regret: count <= 1 ? 0 : first - second }
}

// ---------- participants & selection ----------

interface Participant {
  kind: 'row' | 'col'
  index: number
}

/** position in the common numbering order B0, G0, B1, G1, … */
function orderKey(p: Participant): number {
  return p.kind === 'row' ? 2 * p.index : 2 * p.index + 1
}

function participantLabel(p: Participant): string {
  return `${p.kind === 'row' ? 'B' : 'G'}${p.index}`
}

interface ScoredParticipant {
  p: Participant
  stats: LineStats
}

/**
 * Rank candidates by the algorithm's priority:
 *   1. larger regret
 *   2. larger highest (best) value
 *   3. earlier participant in the common numbering order B0, G0, B1, G1, …
 * Returns a new array, winner first.
 */
function rankCandidates(cands: ScoredParticipant[]): ScoredParticipant[] {
  return [...cands].sort((a, b) => {
    if (a.stats.regret !== b.stats.regret) return b.stats.regret - a.stats.regret
    if (a.stats.highest !== b.stats.highest) return b.stats.highest - a.stats.highest
    return orderKey(a.p) - orderKey(b.p)
  })
}

/** short human-readable reason why the winner beat the runner-up */
function decideReason(ranked: ScoredParticipant[]): string {
  if (ranked.length < 2) return 'the only candidate'
  const w = ranked[0]
  const r = ranked[1]
  if (w.stats.regret !== r.stats.regret) return `largest regret (${w.stats.regret})`
  if (w.stats.highest !== r.stats.highest)
    return `regret tied at ${w.stats.regret}, largest best value (${w.stats.highest})`
  return `regret and best value tied, earliest in the order B0, G0, B1, G1, …`
}

// ---------- argmax of feasible values ----------

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

// ---------- step plumbing ----------

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
      // ---------- deal-breaker mode ----------
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

      // maxDB over all remaining rows and columns
      let maxDB = 0
      for (let i = 0; i < n; i++) if (activeRows[i]) maxDB = Math.max(maxDB, rowDB[i])
      for (let j = 0; j < n; j++) if (activeCols[j]) maxDB = Math.max(maxDB, colDB[j])

      // candidates: every remaining line tied at maxDB
      const candidates: Participant[] = []
      for (let i = 0; i < n; i++)
        if (activeRows[i] && rowDB[i] === maxDB) candidates.push({ kind: 'row', index: i })
      for (let j = 0; j < n; j++)
        if (activeCols[j] && colDB[j] === maxDB) candidates.push({ kind: 'col', index: j })

      const statsOf = (p: Participant): LineStats =>
        p.kind === 'row' ? rowStats(values, activeCols, n, p.index) : colStats(values, activeRows, n, p.index)

      // a single candidate is selected directly; otherwise the tie is broken
      // by regret, then best feasible value, then the common numbering order
      const ranked = rankCandidates(candidates.map((p) => ({ p, stats: statsOf(p) })))
      const winner = ranked[0]
      const chosenLine = { kind: winner.p.kind, index: winner.p.index, dbCount: maxDB }

      let candidateRegretRow: (number | null)[] | undefined
      let candidateRegretCol: (number | null)[] | undefined
      let selectDesc: string
      if (candidates.length > 1) {
        candidateRegretRow = new Array(n).fill(null)
        candidateRegretCol = new Array(n).fill(null)
        for (const { p, stats } of ranked) {
          if (p.kind === 'row') candidateRegretRow[p.index] = stats.regret
          else candidateRegretCol[p.index] = stats.regret
        }
        const detail = ranked
          .map(
            ({ p, stats }) =>
              `${participantLabel(p)} R=${stats.regret}, best ${stats.count === 0 ? '—' : stats.highest}`,
          )
          .join('; ')
        selectDesc =
          `${candidates.length} lines share the maximum DB count (${maxDB}): ${candidates.map(participantLabel).join(', ')}. ` +
          `Tie-break by regret, then best feasible value, then order B0, G0, B1, G1, … — ${detail}. ` +
          `Selected ${participantLabel(winner.p)}: ${decideReason(ranked)}.`
      } else {
        selectDesc = `${participantLabel(winner.p)} is the only line with the maximum DB count (${maxDB}). Serving the most constrained line first.`
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
          selectDesc,
          'Select Most Constrained Line',
          {
            rowDB,
            colDB,
            chosenLine,
            candidateLines: candidates.map((p) => ({ ...p })),
            candidateRegretRow,
            candidateRegretCol,
          },
        ),
      )

      if (winner.stats.count === 0) {
        // The selected line has no feasible value at all: it can never be
        // matched. Skip it — remove the line without forming a pair and
        // without adding points, then carry on.
        const skipLabel = participantLabel(winner.p)
        steps.push(
          stepBase(
            'skip_line',
            values,
            activeRows,
            activeCols,
            n,
            pairs,
            totalScore,
            `${winner.p.kind === 'row' ? 'Row' : 'Column'} ${skipLabel} contains no feasible value — every remaining cell is a deal-breaker. Skipping this line: no pair is formed and no points are added.`,
            'Skip Unmatchable Line',
            { rowDB, colDB, chosenLine },
          ),
        )

        if (winner.p.kind === 'row') activeRows[winner.p.index] = false
        else activeCols[winner.p.index] = false
        skippedLines.push({ kind: winner.p.kind, index: winner.p.index })

        steps.push(
          stepBase(
            'remove_line',
            values,
            activeRows,
            activeCols,
            n,
            pairs,
            totalScore,
            `${winner.p.kind === 'row' ? 'Row' : 'Column'} ${skipLabel} removed from the relation. ${activeRowCount(activeRows)} boy(s) and ${activeColCount(activeCols)} girl(s) remaining.`,
            'Remove Line',
            { removedLine: { kind: winner.p.kind, index: winner.p.index } },
          ),
        )
        continue
      }

      if (winner.p.kind === 'row') {
        chosenI = winner.p.index
        chosenJ = findMaxNonDBInRow(values, chosenI, activeCols, n)
      } else {
        chosenJ = winner.p.index
        chosenI = findMaxNonDBInCol(values, chosenJ, activeRows, n)
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
          `Selecting the highest feasible value in ${winner.p.kind === 'row' ? 'row' : 'column'} ${participantLabel(winner.p)} — cell (B${chosenI}, G${chosenJ}) with score ${values[chosenI][chosenJ]}.`,
          'Select Best Cell',
          { rowDB, colDB, chosenLine, chosenCell: { i: chosenI, j: chosenJ, value: values[chosenI][chosenJ] } },
        ),
      )
    } else {
      // ---------- regret mode (no deal-breakers left) ----------
      // All remaining rows and columns are considered together at the same level.
      const best1 = new Array(n).fill(0)
      const best2 = new Array(n).fill(0)
      const colBest1 = new Array(n).fill(0)
      const colBest2 = new Array(n).fill(0)
      const regret = new Array(n).fill(0)
      const regretCol = new Array(n).fill(0)

      const all: ScoredParticipant[] = []
      for (let i = 0; i < n; i++) {
        if (!activeRows[i]) continue
        const s = rowStats(values, activeCols, n, i)
        best1[i] = s.highest
        best2[i] = s.second === -Infinity ? 0 : s.second
        regret[i] = s.regret
        all.push({ p: { kind: 'row', index: i }, stats: s })
      }
      for (let j = 0; j < n; j++) {
        if (!activeCols[j]) continue
        const s = colStats(values, activeRows, n, j)
        colBest1[j] = s.highest
        colBest2[j] = s.second === -Infinity ? 0 : s.second
        regretCol[j] = s.regret
        all.push({ p: { kind: 'col', index: j }, stats: s })
      }

      steps.push(
        stepBase(
          'scan_best_values',
          values,
          activeRows,
          activeCols,
          n,
          pairs,
          totalScore,
          'No deal-breakers remain — all remaining rows and columns are considered together. Scanning each line for its best and second-best values.',
          'Scan Best Values',
          { best1, best2, colBest1, colBest2 },
        ),
      )

      steps.push(
        stepBase(
          'calc_regret',
          values,
          activeRows,
          activeCols,
          n,
          pairs,
          totalScore,
          'Computing regret = best − second-best for every row and column. A line with a single entry has regret 0.',
          'Calculate Regret',
          { best1, best2, colBest1, colBest2, regret, regretCol },
        ),
      )

      const ranked = rankCandidates(all)
      const winner = ranked[0]

      if (winner.p.kind === 'row') {
        chosenI = winner.p.index
        chosenJ = findMaxNonDBInRow(values, chosenI, activeCols, n)
      } else {
        chosenJ = winner.p.index
        chosenI = findMaxNonDBInCol(values, chosenJ, activeRows, n)
      }

      const chosenRegretLine = { kind: winner.p.kind, index: winner.p.index, regret: winner.stats.regret }

      steps.push(
        stepBase(
          'select_regret',
          values,
          activeRows,
          activeCols,
          n,
          pairs,
          totalScore,
          `${winner.p.kind === 'row' ? 'Row' : 'Column'} ${participantLabel(winner.p)} wins: ${decideReason(ranked)}. Selecting its best cell (B${chosenI}, G${chosenJ}) with score ${values[chosenI][chosenJ]}.`,
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

    // ---------- commit ----------
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
        {
          chosenRow: chosenI,
          chosenCol: chosenJ,
          chosenCell: { i: chosenI, j: chosenJ, value: values[chosenI][chosenJ] },
        },
      ),
    )

    // ---------- remove ----------
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

  steps.push(
    stepBase(
      'complete',
      values,
      activeRows,
      activeCols,
      n,
      pairs,
      totalScore,
      parts.join(' '),
      'Complete',
      { skippedLines: skippedLines.map((l) => ({ ...l })) },
    ),
  )

  return steps
}
