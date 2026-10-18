export const defaultTitleCover = new URL('../assets/images/illustrations/default-title.png', import.meta.url).href

// Add a scenario's dedicated cover here when it is ready; saves need no migration.
export const episodeTitleCovers: Record<string, string> = Object.create(null)

export function resolveTitleCover(scenarioId: string, imageSrc?: string) {
  return imageSrc || episodeTitleCovers[scenarioId] || defaultTitleCover
}
