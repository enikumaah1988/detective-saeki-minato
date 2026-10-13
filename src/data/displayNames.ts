// 原稿の人物ID・取得情報は変えず、表示するフルネームだけを整える。
const fullNames = ['佐伯湊', '相澤澪', '高瀬あかり', '高瀬直人', '黒田征司', '宮原文雄', '三崎健', '奥村修一', '瀬川亮介', '鳴海ユウ', '三原沙織']
export function formatNames(text: string) {
  return fullNames.reduce((value, name) => value.replaceAll(name, `${name.slice(0, 2)}　${name.slice(2)}`), text)
}
