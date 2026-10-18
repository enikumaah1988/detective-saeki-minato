export type IconName = 'menu' | 'save' | 'load' | 'delete' | 'talk' | 'look' | 'think' | 'notebook' | 'smoking' | 'move' | 'return' | 'play' | 'settings' | 'home'
const paths: Record<IconName, string> = {
  play: 'M8 4 21 12 8 20z',
  settings: 'M9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  home: 'M3 11 12 3l9 8 M5 10v11h14V10 M9 21v-7h6v7',
  move: 'M4 12h15m-6-6 6 6-6 6',
  return: 'M10 5 3 12l7 7 M3 12h12a5 5 0 0 1 5 5',
  notebook: 'M6 3h14v18H6z M9 3v18 M4 7h3 M4 12h3 M4 17h3 M12 8h5 M12 12h5',
  smoking: 'M3 16h18v4H3z M16 16v4 M19 12c-3-2 2-3 0-5s-1-3 0-4 M14 12c-3-2 2-3 0-5',
  menu: 'M3 7h7l2 3h9v10H3z M3 7V5h7l2 2',
  save: 'M5 3h11l3 3v15H5z M8 3v6h8V3 M8 21v-8h8v8',
  load: 'M3 8h7l2 3h9v10H3z M3 8V5h7l2 3 M12 12v6m-3-3 3 3 3-3',
  delete: 'M4 6h16 M9 6V3h6v3 M6 6l1 15h10l1-15 M10 9v9m4-9v9',
  talk: 'M21 11c0 5-4 8-9 8H8l-5 3 1-6c-1-1-2-3-2-5 0-5 4-8 10-8s9 3 9 8z',
  look: 'M20 20l-6-6 M16 9a7 7 0 1 1-14 0 7 7 0 0 1 14 0',
  think: 'M8 21v-5H5l-1-3-2-1 3-4a7 7 0 1 1 13 6v7 M9 8l2-2 3 1 1 3-2 2h-3l-1-2z',
}
export function UiIcon({ name }: { name: IconName }) {
  return <svg className="ui-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={paths[name]} /></svg>
}
