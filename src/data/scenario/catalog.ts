import { episode1Part1 } from './episode1Part1'
import { freeActionDemo } from './freeActionDemo'
import { demoScenario } from './demo'
import { e01CompletedPart1 } from './e01CompletedPart1'
import { e01CompletedEpisode } from './e01CompletedEpisode'
export const scenarioCatalog = [episode1Part1, freeActionDemo, demoScenario, e01CompletedPart1, e01CompletedEpisode] as const
export const defaultScenario = e01CompletedEpisode
