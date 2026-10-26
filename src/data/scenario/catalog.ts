import { episode1Part1 } from './episode1Part1'
import { freeActionDemo } from './freeActionDemo'
import { demoScenario } from './demo'
import { e01CompletedPart1 } from './e01CompletedPart1'
export const scenarioCatalog = [episode1Part1, freeActionDemo, demoScenario, e01CompletedPart1] as const
export const defaultScenario = episode1Part1
