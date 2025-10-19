/**
 * Trace & Write Game Mechanic
 */

import type { GameMechanic } from '@/types'
import { TraceAndWrite } from '@/components/games/TraceAndWrite'

export const traceWriteMechanic: GameMechanic = {
  meta: {
    id: 'trace-write',
    name: 'Trace & Write',
    description: 'Trace letter shapes to practice spelling through kinesthetic motor memory',
    targetAge: [5, 10],
    supportsHints: true,
  },
  Component: TraceAndWrite,
}
