/** probability distribution models for like-scores */
export type DistModel = 't' | 'normal' | 'uniform' | 'bimodal' | 'skewLow' | 'skewHigh'

export interface DistSpec {
  model: DistModel
  /** center of bell-shaped models (t / normal / bimodal) */
  mean: number
  /** spread of bell-shaped models (within-hump sd for bimodal) */
  sd: number
  /** model-specific shape: df (t), hump separation (bimodal), skew strength (skewLow/skewHigh) */
  shape: number
}

export const DEFAULT_DIST: DistSpec = { model: 't', mean: 34, sd: 17, shape: 5 }

/** sensible defaults applied when the user switches model */
export const MODEL_DEFAULTS: Record<DistModel, DistSpec> = {
  t: { model: 't', mean: 34, sd: 17, shape: 5 },
  normal: { model: 'normal', mean: 50, sd: 17, shape: 0 },
  uniform: { model: 'uniform', mean: 0, sd: 0, shape: 0 },
  bimodal: { model: 'bimodal', mean: 50, sd: 10, shape: 50 },
  skewLow: { model: 'skewLow', mean: 0, sd: 0, shape: 3 },
  skewHigh: { model: 'skewHigh', mean: 0, sd: 0, shape: 3 },
}

export interface GenOptions {
  /** matrix dimension (n x n) */
  n: number
  /** probability that a cell is a like-score (0..1). DB density = 1 - density */
  density: number
  /** score distribution, defaults to DEFAULT_DIST */
  dist?: DistSpec
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

/** draw one like-score from the given distribution, clamped to [0, 100] and rounded */
function sampleScore(dist: DistSpec): number {
  let v: number
  switch (dist.model) {
    case 'uniform':
      v = 100 * Math.random()
      break
    case 'normal':
      v = dist.mean + randNormal() * dist.sd
      break
    case 't': {
      // Var[t(df)] = df / (df - 2)  =>  rescale so the effective sd matches `sd`
      const df = Math.max(3, dist.shape)
      const tSd = Math.sqrt(df / (df - 2))
      v = dist.mean + randT(df) * (dist.sd / tSd)
      break
    }
    case 'bimodal': {
      const center = Math.random() < 0.5 ? dist.mean - dist.shape / 2 : dist.mean + dist.shape / 2
      v = center + randNormal() * dist.sd
      break
    }
    case 'skewLow':
      // U^k pushes mass toward 0: mostly low scores, few high
      v = 100 * Math.pow(Math.random(), dist.shape)
      break
    case 'skewHigh':
      // mirror of skewLow: mostly high scores, few low
      v = 100 * (1 - Math.pow(Math.random(), dist.shape))
      break
  }
  return Math.max(0, Math.min(100, Math.round(v)))
}

/**
 * Generate a random relation matrix.
 *  - each cell is a like-score with probability `density`, otherwise a deal-breaker (-100n)
 *  - like-scores follow the given distribution model (default: scaled t-distribution)
 */
export function generateMatrix(opts: GenOptions): number[][] {
  const { n, density } = opts
  const dist = opts.dist ?? DEFAULT_DIST

  const DB_VALUE = -100 * n
  const m: number[][] = []

  for (let i = 0; i < n; i++) {
    const row: number[] = []
    for (let j = 0; j < n; j++) {
      if (Math.random() < density) {
        row.push(sampleScore(dist))
      } else {
        row.push(DB_VALUE)
      }
    }
    m.push(row)
  }
  return m
}
