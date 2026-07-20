export interface GenOptions {
  /** matrix dimension (n x n) */
  n: number
  /** probability that a cell is a like-score (0..1). DB density = 1 - density */
  density: number
  /** center of the score distribution, default 34 */
  mean?: number
  /** desired standard deviation of scores, default 17 */
  sd?: number
  /** degrees of freedom for the t-distribution, default 5 (heavier tails than normal) */
  df?: number
}

/** standard normal via Box–Muller */
function randNormal(): number {
  let u = 0
  let v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

/** Student's t with df degrees of freedom: z / sqrt(chi2(df)/df) */
function randT(df: number): number {
  const z = randNormal()
  let chi2 = 0
  for (let i = 0; i < df; i++) {
    const g = randNormal()
    chi2 += g * g
  }
  return z / Math.sqrt(chi2 / df)
}

/**
 * Generate a random relation matrix.
 *  - each cell is a like-score with probability `density`, otherwise a deal-breaker (-100n)
 *  - like-scores follow a scaled t-distribution (bell-shaped, few high scores), clamped to [0, 100]
 */
export function generateMatrix(opts: GenOptions): number[][] {
  const { n, density } = opts
  const mean = opts.mean ?? 34
  const sd = opts.sd ?? 17
  const df = opts.df ?? 5

  // Var[t(df)] = df / (df - 2)  =>  rescale so the effective sd matches `sd`
  const tSd = Math.sqrt(df / (df - 2))
  const scale = sd / tSd

  const DB_VALUE = -100 * n
  const m: number[][] = []

  for (let i = 0; i < n; i++) {
    const row: number[] = []
    for (let j = 0; j < n; j++) {
      if (Math.random() < density) {
        let v = Math.round(mean + randT(df) * scale)
        v = Math.max(0, Math.min(100, v))
        row.push(v)
      } else {
        row.push(DB_VALUE)
      }
    }
    m.push(row)
  }
  return m
}
