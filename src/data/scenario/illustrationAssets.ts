// 制作担当から受領した候補だけを接続する。未納のスロットを完成画像であるとは扱わない。
const assets = import.meta.glob('../../assets/images/illustrations/*.png', { eager: true, query: '?url', import: 'default' }) as Record<string, string>
export function illustrationSource(id: string) {
  const filename = id === 'C2-IN' ? 'c1-out' : id.toLowerCase()
  return assets[`../../assets/images/illustrations/${filename}.png`]
}
