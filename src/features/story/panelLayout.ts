export function layoutGamePanel(panel: HTMLDialogElement, game: HTMLElement) {
  const rect = game.getBoundingClientRect()
  const toolbar = game.querySelector<HTMLElement>('.story-toolbar')?.getBoundingClientRect()
  const top = Math.max(rect.top + rect.height * .1, (toolbar?.bottom ?? rect.top) + rect.width / 1920 * 16)
  Object.assign(panel.style, {
    left: `${rect.left + rect.width * .075}px`, top: `${top}px`,
    width: `${rect.width * .85}px`, height: `${rect.top + rect.height * .9 - top}px`,
  })
}
