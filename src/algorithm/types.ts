export interface Pair {
  boy: number
  girl: number
  score: number
}

export interface MatrixState {
  values: number[][]
  rowLabels: number[]
  colLabels: number[]
  n: number
  activeRows: boolean[]
  activeCols: boolean[]
}

export type StepType =
  // Hungarian
  | 'init'
  | 'find_max'
  | 'build_cost'
  | 'scan_row_min'
  | 'reduce_row'
  | 'scan_col_min'
  | 'reduce_col'
  | 'find_zeros'
  | 'cover_zeros'
  | 'find_delta'
  | 'adjust_matrix'
  | 'extract_pairs'
  | 'complete'
  // Greedy baseline
  | 'scan_db'
  | 'select_db_line'
  | 'select_db_cell'
  | 'skip_line'
  | 'remove_line'
  | 'scan_best_values'
  | 'calc_regret'
  | 'select_regret'
  | 'commit_pair'
  | 'remove_rowcol'
  | 'infeasible'

export interface AlgorithmStep {
  type: StepType
  matrix: MatrixState
  pairs: Pair[]
  totalScore: number
  description: string
  phaseTitle: string

  // ---------- shared ----------
  /** deal-breaker sentinel value */
  DB?: number

  // ---------- Hungarian ----------
  /** highest value in the original relation matrix */
  H?: number
  /** position of H in the original matrix */
  maxPos?: { i: number; j: number }
  /** current row being processed (row reduction) */
  currentRow?: number
  /** current column being processed (col reduction) */
  currentCol?: number
  /** row minima used in row reduction */
  rowMin?: number[]
  /** column minima used in column reduction */
  colMin?: number[]
  /** current iteration number (1-based) */
  iteration?: number
  /** size of the current zero matching */
  matchSize?: number
  /** matched zero cells as (row, col) pairs */
  zeroMatching?: { i: number; j: number }[]
  /** matchR[i] = j means row i is matched to column j */
  matchR?: number[]
  /** matchC[j] = i means column j is matched to row i */
  matchC?: number[]
  /** minimum vertex cover: which rows/cols are covered */
  coveredRows?: boolean[]
  coveredCols?: boolean[]
  coveredRowList?: number[]
  coveredColList?: number[]
  /** smallest uncovered value δ */
  delta?: number
  /** final assignment (row → col) */
  assignment?: { i: number; j: number }[]
  /** boys assigned to a deal-breaker */
  unmatchedB?: number[]
  /** girls assigned to a deal-breaker */
  unmatchedG?: number[]

  // ---------- Greedy baseline ----------
  rowDB?: number[]
  colDB?: number[]
  chosenLine?: { kind: 'row' | 'col'; index: number; dbCount: number }
  candidateLines?: { kind: 'row' | 'col'; index: number }[]
  candidateRegretRow?: (number | null)[]
  candidateRegretCol?: (number | null)[]
  chosenCell?: { i: number; j: number; value: number }
  best1?: number[]
  best2?: number[]
  regret?: number[]
  colBest1?: number[]
  colBest2?: number[]
  regretCol?: number[]
  chosenRegretLine?: { kind: 'row' | 'col'; index: number; regret: number }
  chosenRow?: number
  chosenCol?: number
  removedRow?: number
  removedCol?: number
  removedLine?: { kind: 'row' | 'col'; index: number }
  skippedLines?: { kind: 'row' | 'col'; index: number }[]
}
