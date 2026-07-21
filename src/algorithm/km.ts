import { Pair } from './types'

/**
 * Kuhn–Munkres (Hungarian) algorithm: maximum-weight perfect matching on a
 * complete bipartite graph with n vertices per side. O(n^3).
 * Returns matchX, where matchX[i] = j means row i is matched to column j.
 *
 * All weights are assumed finite; the graph is complete so a perfect matching
 * always exists. Integer weights keep the dual adjustments exact.
 */
function kmMaxWeightPerfect(w: number[][], n: number): number[] {
  // feasible dual labels: lx[i] + ly[j] >= w[i][j]
  const lx = new Array<number>(n).fill(0)
  const ly = new Array<number>(n).fill(0)
  for (let i = 0; i < n; i++) {
    let mx = -Infinity
    for (let j = 0; j < n; j++) if (w[i][j] > mx) mx = w[i][j]
    lx[i] = mx
  }

  const matchX = new Array<number>(n).fill(-1)
  const matchY = new Array<number>(n).fill(-1)

  // workspace reused by every augmentation round
  const inS = new Array<boolean>(n) // rows in the alternating tree
  const inT = new Array<boolean>(n) // columns in the alternating tree
  const slack = new Array<number>(n) // min lx[x] + ly[j] - w[x][j] over x in S
  const slackFrom = new Array<number>(n) // the tree row achieving slack[j]
  const parentX = new Array<number>(n) // parentX[y] = row through which y entered the tree

  for (let root = 0; root < n; root++) {
    inS.fill(false)
    inT.fill(false)
    parentX.fill(-1)
    for (let j = 0; j < n; j++) {
      slack[j] = lx[root] + ly[j] - w[root][j]
      slackFrom[j] = root
    }
    inS[root] = true

    for (;;) {
      // column outside T with the smallest slack
      let y = -1
      let minSlack = Infinity
      for (let j = 0; j < n; j++) {
        if (!inT[j] && slack[j] < minSlack) {
          minSlack = slack[j]
          y = j
        }
      }

      // tighten dual labels until some slack hits zero
      if (minSlack > 0) {
        for (let i = 0; i < n; i++) if (inS[i]) lx[i] -= minSlack
        for (let j = 0; j < n; j++) {
          if (inT[j]) ly[j] += minSlack
          else slack[j] -= minSlack
        }
      }

      parentX[y] = slackFrom[y]
      inT[y] = true

      if (matchY[y] === -1) {
        // free column: flip along the alternating path back to root
        let cy = y
        for (;;) {
          const cx = parentX[cy]
          const nextY = matchX[cx]
          matchX[cx] = cy
          matchY[cy] = cx
          if (cx === root) break
          cy = nextY
        }
        break
      }

      // y is matched: grow the tree through its row
      const x2 = matchY[y]
      inS[x2] = true
      for (let j = 0; j < n; j++) {
        if (!inT[j]) {
          const s = lx[x2] + ly[j] - w[x2][j]
          if (s < slack[j]) {
            slack[j] = s
            slackFrom[j] = x2
          }
        }
      }
    }
  }

  return matchX
}

export interface OptimalResult {
  /** optimal pairs (deal-breaker edges are never included) */
  pairs: Pair[]
  /** sum of pair scores — the theoretical maximum LoveScore */
  totalScore: number
  /** true when everyone can be matched without a deal-breaker */
  perfect: boolean
}

/**
 * Theoretical optimum of the love-match problem, solved with KM.
 *
 * Objective is lexicographic: match as many people as possible first, then
 * maximize the total like-score. Every non-DB edge gets weight `score + C`
 * with C larger than any achievable total score, so one extra pair always
 * outweighs any score difference; DB edges get weight 0 and are dropped from
 * the resulting perfect matching.
 */
export function solveOptimal(values: number[][], n: number): OptimalResult {
  const C = 100 * n + 1
  const w = values.map((row) => row.map((v) => (v < 0 ? 0 : v + C)))
  const match = kmMaxWeightPerfect(w, n)

  const pairs: Pair[] = []
  let totalScore = 0
  for (let i = 0; i < n; i++) {
    const v = values[i][match[i]]
    if (v >= 0) {
      pairs.push({ boy: i, girl: match[i], score: v })
      totalScore += v
    }
  }
  return { pairs, totalScore, perfect: pairs.length === n }
}
