export type IconName = 'menu' | 'save' | 'load' | 'delete' | 'talk' | 'look' | 'think'
const paths: Record<IconName, string> = {
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
