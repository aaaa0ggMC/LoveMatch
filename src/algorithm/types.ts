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
  | 'init'
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
  | 'complete'
  | 'infeasible'

export interface AlgorithmStep {
  type: StepType
  matrix: MatrixState
  pairs: Pair[]
  totalScore: number
  description: string
  phaseTitle: string

  rowDB?: number[]
  colDB?: number[]

  chosenLine?: { kind: 'row' | 'col'; index: number; dbCount: number }

  /** DB-mode: every remaining line tied at the maximum DB count */
  candidateLines?: { kind: 'row' | 'col'; index: number }[]
  /** DB-mode tie-break regret of each candidate row (null = not a candidate) */
  candidateRegretRow?: (number | null)[]
  /** DB-mode tie-break regret of each candidate column (null = not a candidate) */
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
