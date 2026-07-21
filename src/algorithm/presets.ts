import { dbValue } from './random'

export interface EdgeCase {
  id: string
  name: string
  /** one-line explanation of what to watch for */
  blurb: string
  matrix: number[][]
}

const db5 = dbValue(5)
const db4 = dbValue(4)

/**
 * Deceptive matrices: they look perfectly normal at a glance, but each hides
 * a structural surprise. Numbers verified against the algorithm + brute force.
 */
export const EDGE_CASES: EdgeCase[] = [
  {
    id: 'preset-1',
    name: 'Preset 1',
    blurb:
      'B0, B2 and B4 can only match G0/G3/G4 — it looks like someone must be stranded, but the regret tie-breaks thread it perfectly: everyone gets matched and greedy hits the optimum 270.',
    matrix: [
      [db5, db5, db5, 60, 40],
      [50, 40, 55, 70, 45],
      [30, db5, db5, 20, db5],
      [db5, 65, 50, db5, 35],
      [45, db5, db5, 80, db5],
    ],
  },
  {
    id: 'greedy-trap',
    name: 'Greedy Trap',
    blurb:
      'Looks normal and a perfect matching exists (294) — yet greedy strands B1. B1 can only match G2 or G3, and both columns are snatched away: B0 grabs the shiny 94, B4 takes 59. Everyone is saved only if B0 settles for 49.',
    matrix: [
      [db5, 49, db5, 94, db5],
      [db5, db5, 43, 60, db5],
      [15, 19, 42, db5, 75],
      [40, db5, db5, 31, 60],
      [db5, db5, 59, 87, db5],
    ],
  },
  {
    id: 'crowded-hearts',
    name: 'Crowded Hearts',
    blurb:
      'Every boy has at least two options, but no algorithm can match everyone: B0, B1 and B2 collectively only like G0 and G1 — three boys, two girls (Hall’s theorem). Watch B0 get skipped.',
    matrix: [
      [80, 75, db5, db5, db5],
      [78, 72, db5, db5, db5],
      [82, 77, db5, db5, db5],
      [70, 68, 75, 80, 85],
      [65, 60, 70, 75, 88],
    ],
  },
  {
    id: 'score-mirage',
    name: 'Score Mirage',
    blurb:
      'No deal-breakers at all and everyone gets matched — still, greedy settles for 229 while 299 is possible (~23% more). The shiniest cells are bait.',
    matrix: [
      [10, 71, 79, 21],
      [80, 41, 15, 75],
      [51, 15, 21, 29],
      [30, 94, 97, 55],
    ],
  },
  {
    id: 'thread-the-needle',
    name: 'Thread the Needle',
    blurb:
      'Exactly one perfect matching exists — the diagonal. Serving the most constrained line first threads it. Can you spot the matching before stepping?',
    matrix: [
      [90, 80, 70, 60],
      [db4, 85, 75, 65],
      [db4, db4, 80, 70],
      [db4, db4, db4, 75],
    ],
  },
]
