// 観察で新しい証言・人物設定は付与しない。見えている表情と所作だけを描写する。
export function personObservation(person: string, phase: string) {
  if (person === 'mio') return phase === 'P1-01'
    ? '領収書を揃え、帳簿の数字に目を通している。こちらの手が止まると、静かに顔を上げた。'
    : '手元の記録を整えながら、こちらの言葉を待っている。'
  if (person === 'akari') return phase === 'P4-10'
    ? '隣の兄へ目を向けてから、手元に視線を落とした。鞄の紐には、まだ指が添えられている。'
    : '鞄の肩紐に手を添えている。言葉を探すように視線が下がり、またこちらへ戻った。'
  if (person === 'naoto') return '視線を落とし、一呼吸置いてからこちらを見た。話し始めるまで、少し間がある。'
  if (person === 'okumura') return '落ち着いた表情でこちらに向き直っている。話を急かす様子はない。'
  if (person === 'segawa') return '姿勢を正し、こちらの話に目を向けている。口元が少し引き締まっている。'
  if (person === 'miyahara') return 'こちらへ顔を向け、言葉を待っている。少し考えてから口を開きかけた。'
  if (person === 'kuroda') return '表情を大きく変えず、こちらの言葉を待っている。'
  return '窓口でこちらを見ている。声をかければ応じてくれそうだ。'
}
